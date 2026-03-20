'use client';

import { JSX, useEffect, useState } from 'react';
import { X, CheckCircle2, Star, Clock, Zap } from 'lucide-react';

interface LessonModalProps {
    // Props if any
}

interface LessonModule {
    module_title: string;
    topic: string;
    difficulty: string;
    estimated_duration_minutes: number;
    learning_objectives: string[];
    lesson: any[];
    worked_examples: any[];
    practice_questions: any[];
    quiz: any;
}

export default function LessonModal({}: LessonModalProps) {
    const [moduleData, setModuleData] = useState<LessonModule | null>(null);
    const [currentSection, setCurrentSection] = useState('objectives');
    const [practiceAnswers, setPracticeAnswers] = useState<Record<number, string>>({});
    const [practiceSubmitted, setPracticeSubmitted] = useState<Record<number, boolean>>({});
    const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);

    useEffect(() => {
        const handleOpenModal = (event: CustomEvent) => {
            setModuleData(event.detail);
            setCurrentSection('objectives');
            setPracticeAnswers({});
            setPracticeSubmitted({});
            setQuizAnswers({});
            setQuizSubmitted(false);
        };

        window.addEventListener('openLessonModal', handleOpenModal as EventListener);

        return () => {
            window.removeEventListener('openLessonModal', handleOpenModal as EventListener);
        };
    }, []);

    const closeModal = () => {
        const modal = document.getElementById('lesson-modal') as HTMLDialogElement;
        if (modal) {
            modal.close();
        }
    };

    const switchSection = (section: string) => {
        setCurrentSection(section);
    };

    const selectPracticeOption = (index: number, option: string) => {
        setPracticeAnswers(prev => ({ ...prev, [index]: option }));
    };

    const checkPracticeAnswer = (index: number) => {
        if (!moduleData) return;
        
        const question = moduleData.practice_questions[index];
        const userAnswer = question.type === 'short_answer' 
            ? (document.getElementById(`answer-${index}`) as HTMLInputElement)?.value?.trim()
            : practiceAnswers[index];

        const correctAnswer = question.correct_answer || question.answer;
        let isCorrect = false;

        if (question.type === 'short_answer') {
            const normalize = (str: string) => str?.toLowerCase().replace(/\s+/g, '').replace(/[=,]/g, '') || '';
            isCorrect = normalize(userAnswer) === normalize(correctAnswer);
        } else {
            isCorrect = userAnswer === correctAnswer;
        }

        setPracticeSubmitted(prev => ({ ...prev, [index]: true }));

        const feedback = document.getElementById(`feedback-${index}`);
        if (feedback) {
            feedback.className = `feedback show ${isCorrect ? 'correct' : 'incorrect'}`;
            feedback.textContent = isCorrect 
                ? '✓ Correct! Well done!'
                : `✗ Not quite. The correct answer is: ${correctAnswer}`;
        }
    };

    const selectQuizOption = (index: number, option: string) => {
        setQuizAnswers(prev => ({ ...prev, [index]: option }));
    };

    const submitQuiz = () => {
        if (!moduleData) return;

        // Collect short answer inputs
        moduleData.quiz.questions.forEach((q: any, index: number) => {
            if (q.type === 'short_answer') {
                const input = document.getElementById(`quiz-answer-${index}`) as HTMLInputElement;
                if (input) {
                    setQuizAnswers(prev => ({ ...prev, [index]: input.value.trim() }));
                }
            }
        });

        // Check if all questions are answered
        const allAnswered = moduleData.quiz.questions.every((_: any, i: number) => quizAnswers[i]);
        
        if (!allAnswered) {
            alert('Please answer all questions before submitting.');
            return;
        }

        setQuizSubmitted(true);
    };

    const retakeQuiz = () => {
        setQuizAnswers({});
        setQuizSubmitted(false);
    };

    const updateProgress = () => {
        const sections = ['objectives', 'lesson', 'examples', 'practice', 'quiz'];
        const currentIndex = sections.indexOf(currentSection);
        return quizSubmitted ? 100 : ((currentIndex + 1) / sections.length) * 100;
    };

    const renderObjectives = () => {
        if (!moduleData) return null;
        
        return (
            <div className="lesson-block">
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                    <span>📋</span> Learning Objectives
                </h2>
                <p className="mb-5">By the end of this lesson, you will achieve the following goals:</p>
                <ul className="objectives-list">
                    {moduleData.learning_objectives.map((obj: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg mb-2">
                            <CheckCircle2 className="text-success shrink-0 mt-0.5" size={18} />
                            <span>{obj}</span>
                        </li>
                    ))}
                </ul>
                <div className="mt-8">
                    <button 
                        className="btn-primary px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all"
                        onClick={() => switchSection('lesson')}
                    >
                        Start Lesson →
                    </button>
                </div>
            </div>
        );
    };

    const renderLesson = () => {
        if (!moduleData) return null;
        
        let html: JSX.Element[] = [];
        
        html.push(
            <div key="header" className="lesson-block">
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                    <span>📖</span> The Lesson
                </h2>
            </div>
        );
        
        moduleData.lesson.forEach((block: any, index: number) => {
            if (block.type === 'text') {
                html.push(
                    <div key={index} className="lesson-block">
                        <h3 className="text-xl font-bold mb-3">{block.title}</h3>
                        <p className="text-base leading-relaxed">{block.content}</p>
                    </div>
                );
            } else if (block.type === 'definition') {
                html.push(
                    <div key={index} className="lesson-block">
                        <div className="definition-box bg-amber-50 dark:bg-amber-900/20 border-l-4 border-warning p-5 rounded-lg">
                            <div className="term font-bold text-lg mb-2">📚 {block.term}</div>
                            <div>{block.definition}</div>
                        </div>
                    </div>
                );
            } else if (block.type === 'formula') {
                html.push(
                    <div key={index} className="lesson-block">
                        <div className="formula-box bg-blue-50 dark:bg-blue-900/20 border-2 border-primary p-6 rounded-lg text-center">
                            <div className="formula text-2xl font-mono font-bold text-primary mb-4 p-4 bg-white dark:bg-zinc-800 rounded-lg">
                                {block.formula}
                            </div>
                            <div className="formula-explanation text-sm">{block.explanation}</div>
                        </div>
                    </div>
                );
            } else if (block.type === 'example') {
                html.push(
                    <div key={index} className="lesson-block">
                        <div className="example-box bg-green-50 dark:bg-green-900/20 border-l-4 border-success p-5 rounded-lg">
                            <h4 className="text-lg font-bold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                                <span>📌</span> {block.title}
                            </h4>
                            <p>{block.content}</p>
                        </div>
                    </div>
                );
            } else if (block.type === 'tip') {
                html.push(
                    <div key={index} className="lesson-block">
                        <div className="tip-box bg-sky-50 dark:bg-sky-900/20 border-l-4 border-sky-500 p-5 rounded-lg">
                            <strong>💡 Helpful Tip:</strong> {block.content}
                        </div>
                    </div>
                );
            } else if (block.type === 'warning') {
                html.push(
                    <div key={index} className="lesson-block">
                        <div className="warning-box bg-red-50 dark:bg-red-900/20 border-l-4 border-error p-5 rounded-lg">
                            <strong>⚠️ Watch Out!</strong> {block.content}
                        </div>
                    </div>
                );
            }
        });

        html.push(
            <div key="footer" className="lesson-block text-center">
                <button 
                    className="btn-primary px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all"
                    onClick={() => switchSection('examples')}
                >
                    Continue to Examples →
                </button>
            </div>
        );
        
        return <>{html}</>;
    };

    const renderExamples = () => {
        if (!moduleData) return null;
        
        return (
            <>
                <div className="lesson-block">
                    <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                        <span>💡</span> Worked Examples
                    </h2>
                    <p>Let's work through some problems step by step.</p>
                </div>
                
                {moduleData.worked_examples.map((example: any, index: number) => (
                    <div key={index} className="example-card border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 mb-6 bg-white dark:bg-zinc-900">
                        <div className="example-problem bg-primary text-white p-4 rounded-lg font-bold text-lg mb-5">
                            Problem {index + 1}: {example.problem}
                        </div>
                        <div className="example-steps space-y-3 mb-5">
                            {example.steps.map((step: string, i: number) => (
                                <div key={i} className="step flex gap-4 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                                    <div className="step-number bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">
                                        {i + 1}
                                    </div>
                                    <div className="step-content flex-1">{step}</div>
                                </div>
                            ))}
                        </div>
                        <div className="example-answer bg-success text-white p-4 rounded-lg font-bold text-center mb-5">
                            ✓ Answer: {example.answer}
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                            <strong>Why this works:</strong> {example.explanation}
                        </div>
                    </div>
                ))}

                <div className="lesson-block text-center">
                    <button 
                        className="btn-primary px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all"
                        onClick={() => switchSection('practice')}
                    >
                        Ready to Practice →
                    </button>
                </div>
            </>
        );
    };

    const renderPractice = () => {
        if (!moduleData) return null;
        
        return (
            <>
                <div className="lesson-block">
                    <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                        <span>✍️</span> Practice Questions
                    </h2>
                    <p>Test your understanding with these practice problems.</p>
                </div>
                
                {moduleData.practice_questions.map((q: any, index: number) => {
                    const qId = `practice-${index}`;
                    
                    return (
                        <div key={index} className="question-card border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 mb-4 bg-white dark:bg-zinc-900">
                            <div className="question-text font-bold text-lg mb-3">
                                Question {index + 1}: {q.question}
                            </div>
                            
                            {q.hint && (
                                <div className="hint bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg mb-4 text-sm border-l-4 border-warning">
                                    💭 Hint: {q.hint}
                                </div>
                            )}
                            
                            {q.type === 'short_answer' && (
                                <>
                                    <input 
                                        type="text" 
                                        id={`answer-${index}`}
                                        className="answer-input w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg mb-3 bg-white dark:bg-zinc-800"
                                        placeholder="Enter your answer here..."
                                        disabled={practiceSubmitted[index]}
                                    />
                                    <button 
                                        className="btn-primary px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => checkPracticeAnswer(index)}
                                        disabled={practiceSubmitted[index]}
                                    >
                                        Check Answer
                                    </button>
                                    <div id={`feedback-${index}`} className="feedback mt-3 p-3 rounded-lg hidden"></div>
                                </>
                            )}
                            
                            {q.type === 'multiple_choice' && (
                                <>
                                    <div className="options space-y-2 mb-4">
                                        {q.options.map((opt: string, optIndex: number) => {
                                            const isSelected = practiceAnswers[index] === opt;
                                            const isCorrect = q.correct_answer === opt;
                                            const classes = practiceSubmitted[index] 
                                                ? (isCorrect ? 'option correct border-success bg-success/10' : isSelected ? 'option incorrect border-error bg-error/10' : 'option border-zinc-300 dark:border-zinc-700')
                                                : isSelected ? 'option selected border-primary bg-primary/10' : 'option border-zinc-300 dark:border-zinc-700';
                                            
                                            return (
                                                <div 
                                                    key={optIndex}
                                                    className={`${classes} p-3 border-2 rounded-lg cursor-pointer transition-all hover:border-primary`}
                                                    onClick={() => !practiceSubmitted[index] && selectPracticeOption(index, opt)}
                                                >
                                                    {opt}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <button 
                                        className="btn-primary px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => checkPracticeAnswer(index)}
                                        disabled={practiceSubmitted[index] || !practiceAnswers[index]}
                                    >
                                        Check Answer
                                    </button>
                                    <div id={`feedback-${index}`} className="feedback mt-3 p-3 rounded-lg hidden"></div>
                                </>
                            )}
                        </div>
                    );
                })}

                <div className="lesson-block text-center">
                    <button 
                        className="btn-primary px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all"
                        onClick={() => switchSection('quiz')}
                    >
                        Take the Quiz →
                    </button>
                </div>
            </>
        );
    };

    const renderQuiz = () => {
        if (!moduleData) return null;
        
        if (quizSubmitted) {
            let correct = 0;
            const total = moduleData.quiz.questions.length;

            moduleData.quiz.questions.forEach((q: any, index: number) => {
                const userAnswer = quizAnswers[index];
                const correctAnswer = q.correct_answer || q.answer;
                
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

            const score = Math.round((correct / total) * 100);
            const passed = score >= moduleData.quiz.passing_score;

            return (
                <div className="quiz-results bg-white dark:bg-zinc-900 p-10 rounded-2xl text-center shadow-xl border border-zinc-200 dark:border-zinc-800">
                    <div className="text-6xl mb-5">
                        {passed ? '🎉' : '📚'}
                    </div>
                    <h2 className="text-3xl font-bold mb-3">
                        {passed ? 'Congratulations!' : 'Keep Practicing!'}
                    </h2>
                    <div className="score-display text-6xl font-bold text-primary mb-4">{score}%</div>
                    <p className="text-lg mb-8">
                        You got {correct} out of {total} questions correct.
                    </p>
                    {passed ? (
                        <p className="text-success font-semibold mb-6">You passed the quiz! Great job!</p>
                    ) : (
                        <p className="text-secondary font-semibold mb-6">Review the lesson and try again.</p>
                    )}
                    <div className="flex gap-4 justify-center">
                        <button 
                            className="btn-secondary px-6 py-3 bg-zinc-200 dark:bg-zinc-800 rounded-xl font-bold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-all"
                            onClick={retakeQuiz}
                        >
                            Retake Quiz
                        </button>
                        <button 
                            className="btn-primary px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all"
                            onClick={() => switchSection('objectives')}
                        >
                            Review Lesson
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <>
                <div className="lesson-block">
                    <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                        <span>🎯</span> {moduleData.quiz.title}
                    </h2>
                    <p>Passing score: {moduleData.quiz.passing_score}%</p>
                </div>
                
                {moduleData.quiz.questions.map((q: any, index: number) => (
                    <div key={index} className="question-card border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 mb-4 bg-white dark:bg-zinc-900">
                        <div className="question-text font-bold text-lg mb-3">
                            Question {index + 1}: {q.question}
                        </div>
                        
                        {q.type === 'short_answer' && (
                            <input 
                                type="text" 
                                id={`quiz-answer-${index}`}
                                className="answer-input w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                                placeholder="Enter your answer here..."
                            />
                        )}
                        
                        {q.type === 'multiple_choice' && (
                            <div className="options space-y-2">
                                {q.options.map((opt: string, optIndex: number) => {
                                    const isSelected = quizAnswers[index] === opt;
                                    
                                    return (
                                        <div 
                                            key={optIndex}
                                            className={`${isSelected ? 'option selected border-primary bg-primary/10' : 'option border-zinc-300 dark:border-zinc-700'} p-3 border-2 rounded-lg cursor-pointer transition-all hover:border-primary`}
                                            onClick={() => selectQuizOption(index, opt)}
                                        >
                                            {opt}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}

                <div className="lesson-block text-center">
                    <button 
                        className="btn-primary px-8 py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-dark transition-all"
                        onClick={submitQuiz}
                    >
                        Submit Quiz
                    </button>
                </div>
            </>
        );
    };

    const renderContent = () => {
        if (!moduleData) return null;

        switch(currentSection) {
            case 'objectives':
                return renderObjectives();
            case 'lesson':
                return renderLesson();
            case 'examples':
                return renderExamples();
            case 'practice':
                return renderPractice();
            case 'quiz':
                return renderQuiz();
            default:
                return renderObjectives();
        }
    };

    if (!moduleData) return null;

    const progress = updateProgress();

    return (
        <dialog 
            id="lesson-modal" 
            className="w-full max-w-4xl bg-transparent backdrop:bg-black/50 open:flex open:flex-col p-0 rounded-2xl"
            style={{ maxHeight: '90vh' }}
        >
            <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden flex flex-col h-full">
                {/* Modal Header */}
                <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-primary">{moduleData.module_title}</h2>
                            <div className="flex gap-4 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                                <span className="flex items-center gap-1"><Zap size={14} /> {moduleData.difficulty}</span>
                                <span className="flex items-center gap-1"><Clock size={14} /> {moduleData.estimated_duration_minutes} min</span>
                            </div>
                        </div>
                        <button 
                            onClick={closeModal}
                            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Progress Tracker */}
                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold">Your Progress</span>
                            <span className="text-primary font-bold">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                        <button 
                            className={`nav-btn px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${currentSection === 'objectives' ? 'bg-primary text-white' : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-primary/10'}`}
                            onClick={() => switchSection('objectives')}
                        >
                            📋 Objectives
                        </button>
                        <button 
                            className={`nav-btn px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${currentSection === 'lesson' ? 'bg-primary text-white' : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-primary/10'}`}
                            onClick={() => switchSection('lesson')}
                        >
                            📖 Lesson
                        </button>
                        <button 
                            className={`nav-btn px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${currentSection === 'examples' ? 'bg-primary text-white' : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-primary/10'}`}
                            onClick={() => switchSection('examples')}
                        >
                            💡 Examples
                        </button>
                        <button 
                            className={`nav-btn px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${currentSection === 'practice' ? 'bg-primary text-white' : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-primary/10'}`}
                            onClick={() => switchSection('practice')}
                        >
                            ✍️ Practice
                        </button>
                        <button 
                            className={`nav-btn px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${currentSection === 'quiz' ? 'bg-primary text-white' : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-primary/10'}`}
                            onClick={() => switchSection('quiz')}
                        >
                            🎯 Quiz
                        </button>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {renderContent()}
                </div>
            </div>

            <style jsx>{`
                dialog::backdrop {
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                }
                
                .feedback.show {
                    display: block;
                }
                
                .feedback.correct {
                    background: rgba(16, 185, 129, 0.1);
                    border: 2px solid #10b981;
                    color: #065f46;
                }
                
                .feedback.incorrect {
                    background: rgba(239, 68, 68, 0.1);
                    border: 2px solid #ef4444;
                    color: #991b1b;
                }
                
                @media (prefers-color-scheme: dark) {
                    .feedback.correct {
                        background: rgba(16, 185, 129, 0.2);
                        color: #34d399;
                    }
                    
                    .feedback.incorrect {
                        background: rgba(239, 68, 68, 0.2);
                        color: #f87171;
                    }
                }
            `}</style>
        </dialog>
    );
}