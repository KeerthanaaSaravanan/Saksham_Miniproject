
'use client';

import { Suspense, useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, PlusCircle, XCircle, Wand2, FilePlus as FilePlusIcon } from 'lucide-react';
import { useUser } from '@/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { extractQuestionsFromDocument } from '@/lib/actions/document-parser';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';


const questionSchema = z.object({
  id: z.string().optional(), // Keep track of existing question IDs
  question: z.string().min(5, "Question must be at least 5 characters."),
  type: z.enum(['mcq', 'fillup', 'short-answer', 'long-answer']),
  options: z.array(z.string()).optional(),
  marks: z.coerce.number().min(1, "Marks are required."),
});

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  subject: z.string().min(1, 'Subject is required.'),
  gradeLevel: z.string().min(1, 'Grade level is required.'),
  examType: z.string().min(1, 'Exam type is required.'),
  startTime: z.string().min(1, 'Start time is required.'),
  endTime: z.string().min(1, 'End time is required.'),
  durationMinutes: z.coerce.number().min(1, 'Duration must be at least 1 minute.'),
  questions: z.array(questionSchema).min(1, "You must add at least one question.")
});

const examTypes = [
    "Periodic Assessment (Pre-Mid Term)",
    "Periodic Assessment (Post-Mid Term)",
    "Quarterly Exam",
    "Half Yearly Exam",
    "Annual Exam"
];

const MOCK_FACULTY_PROFILE = {
    handledSubjects: ['Physics', 'Mathematics', 'Chemistry', 'Social Studies'],
    handledGrades: ['Class 8', 'Class 9', 'Class 10', 'Class 11']
};

function UploadPageComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get('examId');
  const isEditMode = !!examId;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const { user, isUserLoading } = useUser();
  
  const [facultyProfile, setFacultyProfile] = useState<any>(null);
  const [isFacultyProfileLoading, setIsFacultyProfileLoading] = useState(true);

  useEffect(() => {
      setIsFacultyProfileLoading(true);
      setTimeout(() => {
          setFacultyProfile(MOCK_FACULTY_PROFILE);
          setIsFacultyProfileLoading(false);
      }, 500);
  }, []);

  const { toast } = useToast();
  const defaultValues = {
      title: '',
      subject: '',
      gradeLevel: '',
      examType: 'Annual Exam',
      startTime: '',
      endTime: '',
      durationMinutes: 180,
      questions: [],
    };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "questions"
  });

  const examType = form.watch('examType');

  useEffect(() => {
    if(isEditMode) return; // Don't auto-change duration in edit mode

    if (examType === 'Annual Exam') {
      form.setValue('durationMinutes', 180);
    } else if (examType === 'Half Yearly Exam' || examType === 'Quarterly Exam') {
      form.setValue('durationMinutes', 90);
    } else {
        form.setValue('durationMinutes', 45);
    }
  }, [examType, form, isEditMode]);

  useEffect(() => {
    const fetchExamData = async () => {
        if (isEditMode && examId) {
            // Mock fetching exam data
            const mockExamData = {
                title: 'Existing Exam Title',
                subject: 'Physics',
                gradeLevel: 'Class 11',
                startTime: new Date(),
                endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
                durationMinutes: 120,
                questions: [
                    { id: 'q1', question: 'What is the speed of light?', type: 'short-answer', marks: 5 },
                    { id: 'q2', question: 'Newtons first law is also known as...', type: 'fillup', marks: 5 },
                ],
            };
            form.reset({
                ...mockExamData,
                startTime: format(new Date(mockExamData.startTime), "yyyy-MM-dd'T'HH:mm"),
                endTime: format(new Date(mockExamData.endTime), "yyyy-MM-dd'T'HH:mm"),
            });
            replace(mockExamData.questions as any[]);
        } else {
            form.reset(defaultValues);
            setUploadedFile(null);
            replace([]);
        }
    }
    fetchExamData();
  }, [examId, isEditMode, form, replace]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleParseDocument = async () => {
    if (!uploadedFile) {
        toast({ variant: 'destructive', title: 'No File Selected', description: 'Please select a document to parse.'});
        return;
    }
    const formValues = form.getValues();
    if (!formValues.subject || !formValues.gradeLevel || !formValues.examType) {
      toast({ variant: 'destructive', title: 'Missing Details', description: 'Please select a subject, grade level, and exam type before parsing.' });
      return;
    }

    setIsParsing(true);
    
    const reader = new FileReader();
    reader.readAsDataURL(uploadedFile);
    reader.onload = async () => {
        const dataUri = reader.result as string;
        try {
            const result = await extractQuestionsFromDocument({
                documentDataUri: dataUri,
                subject: formValues.subject,
                gradeLevel: formValues.gradeLevel,
                examType: formValues.examType,
            });

            if ('error' in result) {
                throw new Error(result.error);
            }
            
            replace(result.questions as any); // Replace existing questions with parsed ones
            toast({ title: 'Parsing Successful', description: `Extracted ${result.questions.length} questions from the document.` });

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Parsing Failed', description: error.message });
        } finally {
            setIsParsing(false);
        }
    };
    reader.onerror = (error) => {
        toast({ variant: 'destructive', title: 'File Read Error', description: 'Could not read the selected file.' });
        setIsParsing(false);
    };
  };
  
  const handleCreateNew = () => {
    router.push('/admin/upload');
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if(!user) return;
    setIsSubmitting(true);
    
    try {
        // Mock saving the exam
        console.log(`Mock saving exam for faculty ${user.uid}:`, values);
        
        await new Promise(res => setTimeout(res, 1000));

        toast({
          title: `Exam ${isEditMode ? 'Updated' : 'Uploaded'} Successfully`,
          description: `The exam "${values.title}" has been saved.`,
        });
        
        router.push('/admin/examinations');

    } catch (error: any) {
        console.error("Error saving exam:", error);
        toast({ variant: 'destructive', title: 'Save Failed', description: error.message });
    }
    
    setIsSubmitting(false);
  }

  if (isUserLoading || isFacultyProfileLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold font-headline">{isEditMode ? 'Edit Exam' : 'Upload Question Paper'}</h1>
            <p className="text-muted-foreground">
              {isEditMode ? 'Modify the details of the existing exam.' : 'Create exams using AI-powered document parsing or manual entry.'}
            </p>
          </div>
          {!isEditMode && 
            <Button variant="outline" onClick={handleCreateNew}>
                <FilePlusIcon className="mr-2 h-4 w-4" />
                Create New
            </Button>
          }
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Exam Details</CardTitle>
              <CardDescription>
                Provide the basic information for the exam.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Exam Title</FormLabel><FormControl><Input placeholder="e.g., Mid-Term Social Studies" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField control={form.control} name="subject" render={({ field }) => (
                    <FormItem><FormLabel>Subject</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger></FormControl><SelectContent>
                            {facultyProfile?.handledSubjects?.map((subject: string) => <SelectItem key={subject} value={subject}>{subject}</SelectItem>)}
                    </SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="gradeLevel" render={({ field }) => (
                  <FormItem><FormLabel>Grade Level</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a grade" /></SelectTrigger></FormControl><SelectContent>
                          {facultyProfile?.handledGrades?.map((grade: string) => <SelectItem key={grade} value={grade}>{grade}</SelectItem>)}
                  </SelectContent></Select><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField control={form.control} name="examType" render={({ field }) => (
                  <FormItem><FormLabel>Exam Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select an exam type" /></SelectTrigger></FormControl><SelectContent>
                          {examTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent></Select><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="durationMinutes" render={({ field }) => (
                    <FormItem><FormLabel>Duration (minutes)</FormLabel><FormControl><Input type="number" placeholder="e.g., 180" {...field} /></FormControl><FormMessage /></FormItem>
                 )} />
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField control={form.control} name="startTime" render={({ field }) => (
                    <FormItem><FormLabel>Start Time</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                 )} />
                <FormField control={form.control} name="endTime" render={({ field }) => (
                    <FormItem><FormLabel>End Time</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                 )} />
               </div>
            </CardContent>
          </Card>

        <Tabs defaultValue="ai-upload">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ai-upload">AI Document Upload</TabsTrigger>
                <TabsTrigger value="manual">Manual Question Entry</TabsTrigger>
            </TabsList>
            <TabsContent value="ai-upload">
                <Card>
                    <CardHeader>
                        <CardTitle>AI-Powered Question Extraction</CardTitle>
                        <CardDescription>Upload a DOCX or PDF file, and our AI will automatically extract and structure the questions for you.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                             <Label htmlFor="file-upload">Exam Document</Label>
                             <Input id="file-upload" type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                             {uploadedFile && <p className="text-sm text-muted-foreground">Selected: {uploadedFile.name}</p>}
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button type="button" onClick={handleParseDocument} disabled={isParsing || !uploadedFile}>
                            {isParsing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            {isParsing ? 'Parsing Document...' : 'Parse with AI'}
                        </Button>
                    </CardFooter>
                </Card>
            </TabsContent>
            <TabsContent value="manual">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Manual Questions</CardTitle>
                                <CardDescription>Add questions for this exam one by one.</CardDescription>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={() => append({ question: '', type: 'mcq', options: ['', '', '', ''], marks: 5 })}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Question
                            </Button>
                        </div>
                    </CardHeader>
                </Card>
            </TabsContent>
        </Tabs>
        
        {fields.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle>Exam Questions</CardTitle>
                    <CardDescription>Review and edit the questions for this exam.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {fields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg relative space-y-4">
                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}>
                                <XCircle className="h-5 w-5 text-destructive" />
                            </Button>
                            
                            <FormField control={form.control} name={`questions.${index}.question`} render={({ field }) => (
                                <FormItem><FormLabel>Question {index + 1}</FormLabel><FormControl><Textarea placeholder="Enter the question text" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />

                            <div className="grid grid-cols-3 gap-4">
                                <FormField control={form.control} name={`questions.${index}.type`} render={({ field }) => (
                                    <FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="mcq">Multiple Choice</SelectItem>
                                            <SelectItem value="fillup">Fill in the Blank</SelectItem>
                                            <SelectItem value="short-answer">Short Answer</SelectItem>
                                            <SelectItem value="long-answer">Long Answer</SelectItem>
                                        </SelectContent>
                                    </Select><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name={`questions.${index}.marks`} render={({ field }) => (
                                    <FormItem><FormLabel>Marks</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>

                            <Controller
                                control={form.control}
                                name={`questions.${index}.type`}
                                render={({ field: { value } }) => value === 'mcq' ? (
                                    <div className="space-y-2">
                                        <FormLabel>Options</FormLabel>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name={`questions.${index}.options.0`} render={({ field }) => ( <FormItem><FormControl><Input {...field} placeholder="Option A" /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name={`questions.${index}.options.1`} render={({ field }) => ( <FormItem><FormControl><Input {...field} placeholder="Option B" /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name={`questions.${index}.options.2`} render={({ field }) => ( <FormItem><FormControl><Input {...field} placeholder="Option C" /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name={`questions.${index}.options.3`} render={({ field }) => ( <FormItem><FormControl><Input {...field} placeholder="Option D" /></FormControl><FormMessage /></FormItem>)} />
                                        </div>
                                    </div>
                                ) : null}
                            />
                        </div>
                    ))}
                    {form.formState.errors.questions && <p className="text-sm font-medium text-destructive">{form.formState.errors.questions.message || form.formState.errors.questions.root?.message}</p>}
                </CardContent>
            </Card>
        )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || fields.length === 0} size="lg">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {isSubmitting ? 'Saving...' : isEditMode ? 'Update Exam' : 'Upload Exam'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default function UploadPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <UploadPageComponent />
        </Suspense>
    )
}
