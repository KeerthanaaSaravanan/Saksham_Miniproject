import { Award, BookOpen, Mic, Zap, Eye, BarChart, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  return (
    <div className="space-y-8 text-white">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">AI Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Arjun Sharma!</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-green-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            AI Assistant Active
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-bold">AS</div>
        </div>
      </header>

      <main>
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-8 rounded-xl relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="text-3xl">👋</div>
            <div>
              <h2 className="text-3xl font-bold">Hello Arjun Sharma!</h2>
              <p className="opacity-80">Your AI learning companion has fine-tuned your interface for optimal clarity and comfort.</p>
            </div>
          </div>
          <div className="absolute top-8 right-8 w-16 h-16 rounded-full bg-white/20">
             <img src="https://picsum.photos/seed/arjun/64/64" alt="Arjun Sharma" className="rounded-full"/>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/20 p-4 rounded-lg flex items-center gap-3">
              <Brain className="w-5 h-5"/>
              <span>AI Optimization <br/> 5 modules active</span>
            </div>
            <div className="bg-white/20 p-4 rounded-lg flex items-center gap-3">
              <Eye className="w-5 h-5" />
              <span>Smart Proctoring <br/> Ready for exams</span>
            </div>
            <div className="bg-white/20 p-4 rounded-lg flex items-center gap-3">
              <Mic className="w-5 h-5"/>
              <span>Voice Assistant <br/> Always listening</span>
            </div>
          </div>
        </div>

        <section className="mt-8">
          <h3 className="text-xl font-bold mb-4 text-black dark:text-white">AI-Enhanced Academic Journey</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-teal-500/20 rounded-lg"><BookOpen className="w-6 h-6 text-teal-400"/></div>
                    <div>
                        <div className="text-3xl font-bold">12</div>
                        <p className="text-muted-foreground text-sm">AI-Enhanced Exams</p>
                    </div>
                </div>
              </CardContent>
            </Card>
             <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-lg"><Mic className="w-6 h-6 text-purple-400"/></div>
                    <div>
                        <div className="text-3xl font-bold">47</div>
                        <p className="text-muted-foreground text-sm">Voice Sessions</p>
                    </div>
                </div>
              </CardContent>
            </Card>
             <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/20 rounded-lg"><Zap className="w-6 h-6 text-amber-400"/></div>
                    <div>
                        <div className="text-3xl font-bold">98%</div>
                        <p className="text-muted-foreground text-sm">Accessibility Score</p>
                    </div>
                </div>
              </CardContent>
            </Card>
             <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-lg"><Award className="w-6 h-6 text-blue-400"/></div>
                    <div>
                        <div className="text-3xl font-bold">18</div>
                        <p className="text-muted-foreground text-sm">AI Achievements</p>
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-black dark:text-white">AI-Proctored Examinations</h3>
            <Button variant="ghost" className="text-teal-400">View AI Features</Button>
          </div>
          <div className="space-y-4">
            <Card className="bg-gray-800 border-gray-700 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-700 rounded-lg"><BookOpen className="w-6 h-6 text-teal-400"/></div>
                <div>
                  <h4 className="font-bold">Mathematics (AI-Enhanced) <Badge variant="secondary" className="ml-2 bg-green-500/20 text-green-400">AI Proctored</Badge></h4>
                  <p className="text-xs text-muted-foreground">Dec 25, 2024 @ 10:00 AM • 2 hours</p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="outline" className="border-blue-400 text-blue-400">Voice Navigation</Badge>
                    <Badge variant="outline" className="border-blue-400 text-blue-400">Large Text</Badge>
                    <Badge variant="outline" className="border-blue-400 text-blue-400">AI Reading</Badge>
                  </div>
                </div>
              </div>
              <Button className="bg-teal-500 hover:bg-teal-600 text-white">Start AI Exam</Button>
            </Card>

            <Card className="bg-gray-800 border-gray-700 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-700 rounded-lg"><BookOpen className="w-6 h-6 text-teal-400"/></div>
                <div>
                  <h4 className="font-bold">Physics (AI-Enhanced)</h4>
                  <p className="text-xs text-muted-foreground">Dec 28, 2024 @ 2:00 PM • 1.5 hours</p>
                   <div className="mt-2 flex gap-2">
                    <Badge variant="outline" className="border-blue-400 text-blue-400">Speech-to-Text</Badge>
                    <Badge variant="outline" className="border-blue-400 text-blue-400">Equation Reader</Badge>
                     <Badge variant="outline" className="border-blue-400 text-blue-400">Time Reminders</Badge>
                  </div>
                </div>
              </div>
              <Button className="bg-teal-500 hover:bg-teal-600 text-white">Start AI Exam</Button>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
