import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Zap, BrainCircuit, BookOpen, Star, Plus } from 'lucide-react';

export default function DashboardOverview() {
    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight">Welcome, Bernard.</h1>
                    <p className="text-zinc-500 font-medium">Ready to master Linear Algebra today?</p>
                </div>
                <Button className="rounded-xl font-bold gap-2">
                    <Plus size={18} /> New Module
                </Button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Active Streak', val: '12 Days', icon: Zap, color: 'text-orange-500' },
                    { label: 'AI Accuracy', val: '94.2%', icon: BrainCircuit, color: 'text-blue-500' },
                    { label: 'Modules Done', val: '08/24', icon: BookOpen, color: 'text-emerald-500' },
                    { label: 'Skill Points', val: '1,250', icon: Star, color: 'text-amber-500' },
                ].map((stat) => (
                    <Card key={stat.label} className="border-none shadow-sm dark:bg-[#111114]">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">{stat.label}</p>
                                <p className="text-2xl font-black">{stat.val}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Continue Learning */}
                <Card className="lg:col-span-2 border-none shadow-sm dark:bg-[#111114]">
                    <CardHeader>
                        <CardTitle className="text-lg font-black tracking-tight">Continue Learning</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 group hover:border-primary transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-black">Linear Transformation & Kernels</h3>
                                    <p className="text-sm text-zinc-500">Advanced Matrix Theory • Module 4</p>
                                </div>
                                <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-tighter">
                                    75% Complete
                                </div>
                            </div>
                            <Progress value={75} className="h-2 mb-4" />
                            <Button variant="link" className="p-0 h-auto font-bold text-primary group-hover:translate-x-1 transition-transform">
                                Resume Solving →
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* AI Recommendations */}
                <Card className="border-none shadow-sm dark:bg-[#111114]">
                    <CardHeader>
                        <CardTitle className="text-lg font-black tracking-tight uppercase tracking-widest text-[10px] text-zinc-500">AI Suggested</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                            <p className="text-xs font-bold text-primary mb-1">Focus on Analysis</p>
                            <p className="text-sm font-medium leading-relaxed">Your score in Riemann Sums dropped. AI suggests reviewing "Integration Foundations".</p>
                            <Button size="sm" className="mt-3 rounded-lg font-bold text-[10px] h-8 bg-primary">Optimize Score</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}