'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Loader2, Upload, PlusCircle, XCircle } from 'lucide-react';

const questionSchema = z.object({
    question: z.string().min(5, "Question must be at least 5 characters."),
    options: z.array(z.string().min(1, "Option cannot be empty.")).min(2, "Must have at least 2 options."),
    correctAnswer: z.string().min(1, "Correct answer is required."),
});

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  subject: z.string().min(1, 'Subject is required.'),
  gradeLevel: z.string().min(1, 'Grade level is required.'),
  questions: z.array(questionSchema).min(1, "You must add at least one question.")
});

export default function UploadPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      subject: '',
      gradeLevel: '',
      questions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions"
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    console.log("Uploading exam:", values);
    
    // In a real application, you would send this data to your backend/Firestore
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: 'Exam Uploaded Successfully',
      description: `The exam "${values.title}" has been added to the system.`,
    });
    form.reset();
    setIsLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Upload Question Paper</h1>
        <p className="text-muted-foreground">
          Create a new examination by filling out the form below.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Exam Details</CardTitle>
              <CardDescription>
                Provide the basic information for the new exam.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exam Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Mid-Term Algebra" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mathematics" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gradeLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a grade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="8th Grade">8th Grade</SelectItem>
                          <SelectItem value="9th Grade">9th Grade</SelectItem>
                          <SelectItem value="10th Grade">10th Grade</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Questions</CardTitle>
                        <CardDescription>Add questions for this exam.</CardDescription>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ question: '', options: ['', ''], correctAnswer: ''})}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Question
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg relative space-y-4">
                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}>
                            <XCircle className="h-5 w-5 text-destructive" />
                        </Button>
                        
                        <FormField
                            control={form.control}
                            name={`questions.${index}.question`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Question {index + 1}</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Enter the question text" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Options - For now, only supporting MCQs */}
                        <div className="space-y-2">
                             <FormLabel>Options</FormLabel>
                             <FormField control={form.control} name={`questions.${index}.options.0`} render={({ field }) => ( <FormItem><FormControl><Input {...field} placeholder="Option A" /></FormControl><FormMessage /></FormItem>)} />
                             <FormField control={form.control} name={`questions.${index}.options.1`} render={({ field }) => ( <FormItem><FormControl><Input {...field} placeholder="Option B" /></FormControl><FormMessage /></FormItem>)} />
                             <FormField control={form.control} name={`questions.${index}.options.2`} render={({ field }) => ( <FormItem><FormControl><Input {...field} placeholder="Option C (optional)" /></FormControl><FormMessage /></FormItem>)} />
                             <FormField control={form.control} name={`questions.${index}.options.3`} render={({ field }) => ( <FormItem><FormControl><Input {...field} placeholder="Option D (optional)" /></FormControl><FormMessage /></FormItem>)} />
                        </div>

                        <FormField
                            control={form.control}
                            name={`questions.${index}.correctAnswer`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Correct Answer</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter the exact correct answer" {...field} />
                                </FormControl>
                                <FormDescription>This must match one of the options exactly.</FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                ))}
                {form.formState.errors.questions?.message && <p className="text-sm font-medium text-destructive">{form.formState.errors.questions?.message}</p>}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} size="lg">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {isLoading ? 'Uploading...' : 'Upload Exam'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
