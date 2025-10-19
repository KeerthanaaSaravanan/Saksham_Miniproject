import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const subjects = [
  { name: 'Mathematics', progress: 75, imageId: 'math' },
  { name: 'Science', progress: 45, imageId: 'science' },
  { name: 'English', progress: 90, imageId: 'english' },
  { name: 'History', progress: 20, imageId: 'history' },
  { name: 'Art', progress: 60, imageId: 'art' },
  { name: 'Computer Science', progress: 55, imageId: 'computer-science' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">My Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here are your subjects and progress.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => {
          const image = PlaceHolderImages.find(
            (img) => img.id === subject.imageId
          );
          return (
            <Card key={subject.name} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="p-0">
                {image && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={image.imageUrl}
                      alt={image.description}
                      fill
                      className="object-cover"
                      data-ai-hint={image.imageHint}
                    />
                  </div>
                )}
                 <div className="p-6 pb-0">
                    <CardTitle className="font-headline">{subject.name}</CardTitle>
                    <CardDescription>
                    Progress: {subject.progress}%
                    </CardDescription>
                 </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Progress value={subject.progress} aria-label={`${subject.name} progress ${subject.progress}%`} />
                <Button asChild className="w-full">
                    <Link href="#">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Continue Learning
                    </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
