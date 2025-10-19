import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Users, BookCopy, FilePlus, BarChart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const students = [
  { name: 'Alex Johnson', email: 'alex.j@example.com', progress: 78, disability: 'Dyslexia', avatar: 'https://picsum.photos/seed/alex/40/40' },
  { name: 'Maria Garcia', email: 'maria.g@example.com', progress: 92, disability: 'Visual Impairment', avatar: 'https://picsum.photos/seed/maria/40/40' },
  { name: 'Sam Chen', email: 'sam.c@example.com', progress: 65, disability: 'ADHD', avatar: 'https://picsum.photos/seed/sam/40/40' },
  { name: 'Fatima Ahmed', email: 'fatima.a@example.com', progress: 45, disability: 'Hearing Impairment', avatar: 'https://picsum.photos/seed/fatima/40/40' },
  { name: 'Kenji Tanaka', email: 'kenji.t@example.com', progress: 88, disability: 'N/A', avatar: 'https://picsum.photos/seed/kenji/40/40' },
];

const adminActions = [
    { title: 'Student Analytics', description: 'Monitor student progress and engagement.', icon: BarChart, link: '#' },
    { title: 'Manage Content', description: 'Upload and organize learning materials.', icon: BookCopy, link: '#' },
    { title: 'Create Assessments', description: 'Build new question banks and exams.', icon: FilePlus, link: '/assessment' },
    { title: 'Manage Users', description: 'Add or remove students and teachers.', icon: Users, link: '#' },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">Admin Portal</h1>
        <p className="text-muted-foreground">
          Manage students, content, and assessments with AI-powered insights.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {adminActions.map((action) => (
            <Card key={action.title} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{action.title}</CardTitle>
                    <action.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                </CardContent>
            </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Progress</CardTitle>
          <CardDescription>An overview of all student activity.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Accessibility Need</TableHead>
                <TableHead>Overall Progress</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.email}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={student.avatar} alt="Avatar" />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.disability}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Progress value={student.progress} className="w-24" />
                        <span className="text-xs text-muted-foreground">{student.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
