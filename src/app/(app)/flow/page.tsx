import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { User, LogIn, LayoutDashboard, Zap, FileText, Bot, Briefcase, Upload, BarChart3, Settings, Info } from 'lucide-react';

const flowSections = [
    {
        title: 'User Authentication & Profiling',
        icon: LogIn,
        description: 'Users begin by signing up or logging in. New students are guided through a profile creation process to select their grade and subjects, which personalizes their experience. Faculty members have a separate, secure login.',
    },
    {
        title: 'Student Dashboard',
        icon: LayoutDashboard,
        description: 'The central hub for students. It displays personalized greetings, upcoming exams for their enrolled subjects, and a summary of their recent performance. From here, they can navigate to any part of the application.',
    },
    {
        title: 'Faculty Dashboard',
        icon: Briefcase,
        description: 'The command center for educators. It provides an overview of total students, created assessments, pending reviews, and student progress. Faculty can manage the entire examination process from this dashboard.',
    },
    {
        title: 'AI-Powered Practice Zone',
        icon: Zap,
        description: 'Students can generate custom practice exams using AI. They specify the subject, topic, question type, and length, and the AI creates a tailored test to help them prepare.',
    },
    {
        title: 'Official Assessments (Examinations)',
        icon: FileText,
        description: 'Students take official, proctored exams in a secure, full-screen environment. The system integrates all enabled accessibility features, providing a seamless and autonomous testing experience.',
    },
    {
        title: 'Faculty Exam Management',
        icon: Upload,
        description: 'Faculty can create and upload new examinations, including setting the title, subject, grade level, and schedule. They can add multiple questions of various types to build comprehensive tests.',
    },
    {
        title: 'Accessibility Integration',
        icon: Bot,
        description: 'A core feature across the platform. A floating accessibility panel allows students to enable features for visual, hearing, motor, and cognitive disabilities at any time, which are then persisted and applied globally, especially during exams.',
    },
    {
        title: 'Settings & Customization',
        icon: Settings,
        description: 'Both students and faculty can manage their profiles. Students can update their grade, stream, and avatar, while also fine-tuning their accessibility preferences for a fully personalized experience.',
    },
];

export default function ApplicationFlowPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Application Flow</h1>
        <p className="text-muted-foreground">
          An overview of the user journey and core features of the Saksham platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flowSections.map((section) => {
            const Icon = section.icon;
            return (
                 <Card key={section.title}>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle>{section.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>
                            {section.description}
                        </CardDescription>
                    </CardContent>
                </Card>
            )
        })}
      </div>
    </div>
  );
}
