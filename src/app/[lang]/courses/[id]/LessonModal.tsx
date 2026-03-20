'use client';

import { useState, useEffect } from 'react';
import { 
    X, 
    CheckCircle2, 
    Clock, 
    Zap, 
    BookOpen, 
    Lightbulb,
    AlertTriangle,
    Award,
    RotateCcw,
    ChevronRight,
    ChevronLeft,
    Brain,
    Target,
    TrendingUp,
    Sigma,
    BarChart,
    ArrowRight,
    PlayCircle,
    RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

interface LessonModalProps {
    moduleData: any;
    isOpen: boolean;
    onClose: () => void;
}

export default function LessonModal({ moduleData, isOpen, onClose }: LessonModalProps) {
    const [activeMainTab, setActiveMainTab] = useState('lesson');
    const [practiceAnswers, setPracticeAnswers] = useState<Record<number, string>>({});
    const [practiceSubmitted, setPracticeSubmitted] = useState<Record<number, boolean>>({});
    const [practiceFeedback, setPracticeFeedback] = useState<Record<number, { show: boolean; correct: boolean; message: string }>>({});
    const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizResults, setQuizResults] = useState<{ score: number; passed: boolean; correct: number; total: number } | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});
    const [showHint, setShowHint] = useState<Record<number, boolean>>({});

    useEffect(() => {
        // Reset state when new module is opened
        if (isOpen) {
            setActiveMainTab('lesson');
            setPracticeAnswers({});
            setPracticeSubmitted({});
            setPracticeFeedback({});
            setQuizAnswers({});
            setQuizSubmitted(false);
            setQuizResults(null);
            setSelectedOptions({});
            setShowHint({});
        }
    }, [isOpen, moduleData]);

    const handlePracticeAnswer = (index: number) => {
        const question = moduleData.practice_questions[index];
        const userAnswer = question.type === 'short_answer' 
            ? practiceAnswers[index] || ''
            : selectedOptions[index] || '';

        const correctAnswer = question.correct_answer || question.answer || '';
        
        let isCorrect = false;
        let feedbackMessage = '';

        if (question.type === 'short_answer') {
            const normalize = (str: string) => str?.toLowerCase().replace(/\s+/g, '').replace(/[=,]/g, '') || '';
            isCorrect = normalize(userAnswer) === normalize(correctAnswer);
            feedbackMessage = isCorrect 
                ? '✓ Perfect! That\'s correct!' 
                : `✗ Not quite. The correct answer is: ${correctAnswer}`;
        } else {
            isCorrect = userAnswer === correctAnswer;
            feedbackMessage = isCorrect 
                ? '✓ Excellent! You got it right!' 
                : `✗ That\'s not correct. The right answer is: ${correctAnswer}`;
        }

        setPracticeFeedback(prev => ({
            ...prev,
            [index]: {
                show: true,
                correct: isCorrect,
                message: feedbackMessage
            }
        }));
        
        setPracticeSubmitted(prev => ({ ...prev, [index]: true }));
    };

    const handleQuizSubmit = () => {
        // Collect all answers
        const allAnswers = { ...quizAnswers };
        
        // Add selected options to answers
        Object.entries(selectedOptions).forEach(([key, value]) => {
            allAnswers[parseInt(key)] = value;
        });

        // Check if all questions are answered
        const allAnswered = moduleData.quiz.questions.every((_: any, i: number) => allAnswers[i]);
        
        if (!allAnswered) {
            alert('Please answer all questions before submitting.');
            return;
        }

        // Calculate score
        let correct = 0;
        moduleData.quiz.questions.forEach((q: any, index: number) => {
            const userAnswer = allAnswers[index];
            const correctAnswer = q.correct_answer || q.answer || '';
            
            if (q.type === 'short_answer') {
                const normalize = (str: string) => str?.toLowerCase().replace(/\s+/g, '').replace(/[=,]/g, '') || '';
                if (normalize(userAnswer) === normalize(correctAnswer)) {
                    correct++;
                }
            } else {
                if (userAnswer === correctAnswer) {
                    correct++;
                }
            }
        });

        const total = moduleData.quiz.questions.length;
        const score = Math.round((correct / total) * 100);
        const passed = score >= moduleData.quiz.passing_score;

        setQuizResults({ score, passed, correct, total });
        setQuizSubmitted(true);
    };

    const handleRetakeQuiz = () => {
        setQuizAnswers({});
        setQuizSubmitted(false);
        setQuizResults(null);
        setSelectedOptions({});
    };

    const toggleHint = (index: number) => {
        setShowHint(prev => ({ ...prev, [index]: !prev[index] }));
    };

    // Lesson content renderer with increased fonts
    const renderLessonContent = () => (
        <div className="space-y-8 pb-6">
            {/* Introduction Section */}
            <section className="space-y-4">
                <Card className="p-5 bg-gradient-to-br from-primary/5 to-transparent border">
                    <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-primary/20 rounded-full">
                            <Target className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold mb-2">Welcome to this Lesson!</h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                In this comprehensive lesson, we'll explore the fundamental concept of limits - 
                                the foundation of calculus and essential for understanding how AI models learn and optimize.
                            </p>
                        </div>
                    </div>
                </Card>
            </section>

            {/* Learning Objectives Section */}
            <section className="space-y-3">
                <h3 className="text-base font-bold flex items-center gap-2">
                    <span className="w-1 h-5 bg-primary rounded-full"></span>
                    What You'll Learn
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {moduleData.learning_objectives.map((obj: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border">
                            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                                {idx + 1}
                            </div>
                            <p className="text-sm text-zinc-700 dark:text-zinc-300">{obj}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Main Lesson Content */}
            {moduleData.lesson.map((block: any, idx: number) => {
                if (block.type === 'text') {
                    return (
                        <section key={idx} className="space-y-3">
                            <h3 className="text-base font-bold flex items-center gap-2">
                                <span className="w-1 h-5 bg-primary rounded-full"></span>
                                {block.title}
                            </h3>
                            <Card className="p-4 border">
                                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                    {block.content}
                                </p>
                                
                                {block.title === "What is a Limit?" && (
                                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                                        <h4 className="font-bold mb-2 text-sm flex items-center gap-1">
                                            <Brain className="w-4 h-4 text-blue-600" />
                                            Intuitive Understanding
                                        </h4>
                                        <p className="text-sm text-blue-800 dark:text-blue-300">
                                            Imagine walking towards a wall. As you take smaller steps, you get closer. 
                                            The limit is where you're heading, even if you never quite touch it.
                                        </p>
                                    </div>
                                )}
                            </Card>
                        </section>
                    );
                }

                if (block.type === 'definition') {
                    return (
                        <section key={idx}>
                            <Card className="p-4 border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20">
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 bg-amber-100 dark:bg-amber-900 rounded-lg">
                                        <BookOpen className="w-4 h-4 text-amber-700 dark:text-amber-300" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1">
                                            {block.term}
                                        </h4>
                                        <p className="text-sm text-amber-900 dark:text-amber-200">
                                            {block.definition}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </section>
                    );
                }

                if (block.type === 'formula') {
                    return (
                        <section key={idx}>
                            <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-primary">
                                <div className="text-center mb-3">
                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary text-xs">
                                        Key Formula
                                    </Badge>
                                </div>
                                <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg mb-3">
                                    <p className="text-xl font-mono font-bold text-primary text-center">
                                        {block.formula}
                                    </p>
                                </div>
                                <p className="text-center text-sm text-zinc-700 dark:text-zinc-300">
                                    {block.explanation}
                                </p>
                            </Card>
                        </section>
                    );
                }

                if (block.type === 'example') {
                    return (
                        <section key={idx}>
                            <Card className="p-4 border border-green-200 dark:border-green-900">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 bg-green-100 dark:bg-green-900 rounded-full">
                                        <Lightbulb className="w-4 h-4 text-green-700 dark:text-green-300" />
                                    </div>
                                    <h4 className="text-sm font-bold text-green-800 dark:text-green-300">
                                        {block.title}
                                    </h4>
                                </div>
                                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                                    {block.content}
                                </p>
                            </Card>
                        </section>
                    );
                }

                if (block.type === 'tip') {
                    return (
                        <section key={idx}>
                            <Alert className="bg-sky-50 dark:bg-sky-950/30 border-sky-500 py-3">
                                <Lightbulb className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                                <AlertTitle className="text-sm text-sky-800 dark:text-sky-300 font-bold">
                                    Pro Tip
                                </AlertTitle>
                                <AlertDescription className="text-sm text-sky-700 dark:text-sky-400">
                                    {block.content}
                                </AlertDescription>
                            </Alert>
                        </section>
                    );
                }

                if (block.type === 'warning') {
                    return (
                        <section key={idx}>
                            <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/30 border-red-500 py-3">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle className="text-sm font-bold">
                                    Common Mistake
                                </AlertTitle>
                                <AlertDescription className="text-sm">
                                    {block.content}
                                </AlertDescription>
                            </Alert>
                        </section>
                    );
                }

                return null;
            })}

            {/* Worked Examples Section */}
            <section className="space-y-4 mt-6">
                <h3 className="text-base font-bold flex items-center gap-2">
                    <span className="w-1 h-5 bg-primary rounded-full"></span>
                    Worked Examples
                </h3>

                {moduleData.worked_examples.map((example: any, idx: number) => (
                    <Card key={idx} className="overflow-hidden border">
                        <div className="bg-primary/10 p-3 border-b">
                            <h4 className="font-bold text-sm flex items-center gap-1">
                                <Sigma className="w-4 h-4" />
                                Example {idx + 1}: {example.problem}
                            </h4>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="space-y-2">
                                {example.steps.map((step: string, i: number) => (
                                    <div key={i} className="flex gap-3 p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                        <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
                                            {i + 1}
                                        </div>
                                        <p className="text-sm">{step}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                                <p className="text-sm font-mono font-bold text-green-700 dark:text-green-400">
                                    Answer: {example.answer}
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </section>
        </div>
    );

    // Practice Questions Tab with increased fonts
    const renderPracticeTab = () => (
        <div className="space-y-5 pb-6">
            <div className="sticky top-0 bg-white dark:bg-zinc-900 py-3 z-10 border-b">
                <div className="flex items-center justify-between px-6">
                    <h2 className="text-base font-bold">Practice Questions</h2>
                    <Badge variant="outline" className="text-sm">
                        {Object.keys(practiceSubmitted).length}/{moduleData.practice_questions.length}
                    </Badge>
                </div>
            </div>

            {moduleData.practice_questions.map((q: any, idx: number) => (
                <Card key={idx} className="p-4 border">
                    <div className="space-y-4">
                        <div className="flex items-start gap-2">
                            <Badge variant="outline" className="text-sm px-1.5">Q{idx + 1}</Badge>
                            <p className="text-sm flex-1">{q.question}</p>
                        </div>

                        {q.hint && (
                            <div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleHint(idx)}
                                    className="h-8 px-3 text-sm gap-1"
                                >
                                    <Lightbulb className="w-4 h-4" />
                                    {showHint[idx] ? 'Hide Hint' : 'Show Hint'}
                                </Button>
                                {showHint[idx] && (
                                    <Alert className="mt-3 py-3">
                                        <AlertDescription className="text-sm">
                                            {q.hint}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        )}

                        {q.type === 'short_answer' && (
                            <Input
                                placeholder="Your answer..."
                                value={practiceAnswers[idx] || ''}
                                onChange={(e) => setPracticeAnswers(prev => ({ ...prev, [idx]: e.target.value }))}
                                disabled={practiceSubmitted[idx]}
                                className="h-9 text-sm"
                            />
                        )}

                        {q.type === 'multiple_choice' && q.options && (
                            <div className="space-y-2">
                                {q.options.map((opt: string, optIdx: number) => (
                                    <div
                                        key={optIdx}
                                        onClick={() => !practiceSubmitted[idx] && setSelectedOptions(prev => ({ ...prev, [idx]: opt }))}
                                        className={`p-3 border rounded-lg cursor-pointer text-sm ${
                                            selectedOptions[idx] === opt ? 'border-primary bg-primary/5' : ''
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-xs">
                                                {String.fromCharCode(65 + optIdx)}
                                            </span>
                                            {opt}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <Button
                                size="sm"
                                onClick={() => handlePracticeAnswer(idx)}
                                disabled={practiceSubmitted[idx]}
                                className="h-8 px-4 text-sm"
                            >
                                Check
                            </Button>
                            {practiceSubmitted[idx] && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setPracticeSubmitted(prev => ({ ...prev, [idx]: false }));
                                        setPracticeFeedback(prev => ({ ...prev, [idx]: { show: false, correct: false, message: '' } }));
                                    }}
                                    className="h-8 px-3 text-sm"
                                >
                                    <RefreshCw className="w-4 h-4 mr-1" /> Retry
                                </Button>
                            )}
                        </div>

                        {practiceFeedback[idx]?.show && (
                            <Alert className={`py-3 ${
                                practiceFeedback[idx].correct ? 'bg-green-50' : 'bg-red-50'
                            }`}>
                                <AlertDescription className="text-sm">
                                    {practiceFeedback[idx].message}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    );

    // Quiz Tab with increased fonts
    const renderQuizTab = () => {
        if (quizSubmitted && quizResults) {
            return (
                <Card className="p-6 text-center">
                    <div className="w-28 h-28 mx-auto mb-4 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl font-bold text-primary">{quizResults.score}%</span>
                        </div>
                        <Progress value={quizResults.score} className="h-28 w-28 rounded-full" />
                    </div>

                    <h3 className="text-base font-bold mb-2">
                        {quizResults.passed ? 'Congratulations! 🎉' : 'Keep Practicing! 📚'}
                    </h3>
                    <p className="text-sm mb-4">
                        {quizResults.correct}/{quizResults.total} correct
                    </p>

                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={handleRetakeQuiz} size="sm" className="text-sm h-8">
                            Retake
                        </Button>
                        <Button onClick={() => setActiveMainTab('lesson')} size="sm" className="text-sm h-8">
                            Review
                        </Button>
                    </div>
                </Card>
            );
        }

        return (
            <div className="space-y-5 pb-6">
                <div className="sticky top-0 bg-white dark:bg-zinc-900 py-3 z-10 border-b">
                    <div className="flex items-center justify-between px-6">
                        <h2 className="text-base font-bold">Quiz</h2>
                        <Badge variant="outline" className="text-sm">
                            Pass: {moduleData.quiz.passing_score}%
                        </Badge>
                    </div>
                </div>

                {moduleData.quiz.questions.map((q: any, idx: number) => (
                    <Card key={idx} className="p-4 border">
                        <div className="space-y-4">
                            <div className="flex items-start gap-2">
                                <Badge variant="outline" className="text-sm px-1.5">Q{idx + 1}</Badge>
                                <p className="text-sm flex-1">{q.question}</p>
                            </div>

                            {q.type === 'short_answer' && (
                                <Input
                                    placeholder="Your answer..."
                                    value={quizAnswers[idx] || ''}
                                    onChange={(e) => setQuizAnswers(prev => ({ ...prev, [idx]: e.target.value }))}
                                    className="h-9 text-sm"
                                />
                            )}

                            {q.type === 'multiple_choice' && q.options && (
                                <div className="space-y-2">
                                    {q.options.map((opt: string, optIdx: number) => (
                                        <div
                                            key={optIdx}
                                            onClick={() => setSelectedOptions(prev => ({ ...prev, [idx]: opt }))}
                                            className={`p-3 border rounded-lg cursor-pointer text-sm ${
                                                selectedOptions[idx] === opt ? 'border-primary bg-primary/5' : ''
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="w-5 h-5 rounded-full border flex items-center justify-center text-xs">
                                                    {String.fromCharCode(65 + optIdx)}
                                                </span>
                                                {opt}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                ))}

                <div className="flex justify-end sticky bottom-4">
                    <Button onClick={handleQuizSubmit} size="default" className="text-sm h-9 px-5">
                        Submit Quiz
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="h-[95vh] z-[1000] overflow-y-scroll !max-w-[95vw] p-0 gap-0">
                <DialogHeader className="p-5 border-b sticky top-0 z-[100] bg-white dark:bg-zinc-900">
                    <div className="flex items-start justify-between pr-8">
                        <div>
                            <DialogTitle className="text-xl font-bold text-primary">
                                {moduleData.module_title}
                            </DialogTitle>
                            <DialogDescription className="mt-2">
                                <div className="flex items-center gap-4">
                                    <Badge variant="secondary" className="gap-1.5 text-sm py-1">
                                        <Zap className="w-4 h-4" /> {moduleData.difficulty}
                                    </Badge>
                                    <Badge variant="secondary" className="gap-1.5 text-sm py-1">
                                        <Clock className="w-4 h-4" /> {moduleData.estimated_duration_minutes} min
                                    </Badge>
                                </div>
                            </DialogDescription>
                        </div>
                    </div>

                    {/* Main Navigation Tabs */}
                    <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="mt-4">
                        <TabsList className="grid grid-cols-3 h-auto">
                            <TabsTrigger value="lesson" className="py-1.45 text-sm data-[state=active]:bg-primary data-[state=active]:text-white">
                                <span className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    <span>Lesson</span>
                                </span>
                            </TabsTrigger>
                            <TabsTrigger value="practice" className="py-1.45 text-sm data-[state=active]:bg-primary data-[state=active]:text-white">
                                <span className="flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4" />
                                    <span>Practice</span>
                                </span>
                            </TabsTrigger>
                            <TabsTrigger value="quiz" className="py-1.45 text-sm data-[state=active]:bg-primary data-[state=active]:text-white">
                                <span className="flex items-center gap-2">
                                    <Award className="w-4 h-4" />
                                    <span>Quiz</span>
                                </span>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </DialogHeader>

                <ScrollArea className="flex-1 p-5">
                    {activeMainTab === 'lesson' && renderLessonContent()}
                    {activeMainTab === 'practice' && renderPracticeTab()}
                    {activeMainTab === 'quiz' && renderQuizTab()}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}