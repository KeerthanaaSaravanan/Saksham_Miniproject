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
import { MoreHorizontal, Users, FilePlus, Clock, CheckSquare } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const students = [
  { name: 'Alex Johnson', email: 'alex.j@example.com', progress: 78, disability: 'Dyslexia', avatar: 'https://picsum.photos/seed/alex/40/40' },
  { name: 'Maria Garcia', email: 'maria.g@example.com', progress: 92, disability: 'Visual Impairment', avatar: 'https://picsum.photos/seed/maria/40/40' },
  { name: 'Sam Chen', email: 'sam.c@example.com', progress: 65, disability: 'ADHD', avatar: 'https://picsum.photos/seed/sam/40/40' },
  { name: 'Fatima Ahmed', email: 'fatima.a@example.com', progress: 45, disability: 'Hearing Impairment', avatar: 'https://picsum.photos/seed/fatima/40/40' },
  { name: 'Kenji Tanaka', email: 'kenji.t@example.com', progress: 88, disability: 'N/A', avatar: 'https://picsum.photos/seed/kenji/40/40' },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 text-foreground">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Faculty Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Dr. Evelyn Reed!</p>
        </div>
         <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground">ER</div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card/80 border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">1,254</div>
                <p className="text-xs text-muted-foreground">+120 from last month</p>
            </CardContent>
        </Card>
         <Card className="bg-card/80 border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assessments Created</CardTitle>
                <FilePlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">340</div>
                <p className="text-xs text-muted-foreground">+25 this week</p>
            </CardContent>
        </Card>
        <Card className="bg-card/80 border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground text-amber-400" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">3 high priority</p>
            </CardContent>
        </Card>
        <Card className="bg-card/80 border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Exams</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground text-primary" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Across 5 subjects</p>
            </CardContent>
        </Card>
      </div>

      <Card className="bg-card/80 border">
        <CardHeader>
          <CardTitle>Student Progress</CardTitle>
          <CardDescription>An overview of all student activity.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
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
                <TableRow key={student.email} className="border-border/50">
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={student.avatar} alt="Avatar" />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none text-foreground">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.disability}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Progress value={student.progress} className="w-24 bg-muted" />
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
