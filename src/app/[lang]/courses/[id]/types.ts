export type Lesson = {
    title: string;
    duration: string;
    locked: boolean;
};

export type LessonModule = {
    module_title: string;
    topic: string;
    difficulty: string;
    estimated_duration_minutes: number;
    learning_objectives: string[];
    lesson: LessonBlock[];
    worked_examples: WorkedExample[];
    practice_questions: PracticeQuestion[];
    quiz: Quiz;
};

export type LessonBlock = {
    type: 'text' | 'definition' | 'formula' | 'example' | 'tip' | 'warning';
    title?: string;
    content?: string;
    term?: string;
    definition?: string;
    formula?: string;
    explanation?: string;
};

export type WorkedExample = {
    problem: string;
    steps: string[];
    answer: string;
    explanation: string;
};

export type PracticeQuestion = {
    type: 'short_answer' | 'multiple_choice';
    question: string;
    hint?: string;
    answer?: string;
    options?: string[];
    correct_answer?: string;
};

export type Quiz = {
    title: string;
    passing_score: number;
    questions: QuizQuestion[];
};

export type QuizQuestion = {
    type: 'short_answer' | 'multiple_choice';
    question: string;
    answer?: string;
    options?: string[];
    correct_answer?: string;
};

export type CourseDetail = {
    title: string;
    category: string;
    lessons: Lesson[];
    outcomes: string[];
    labels: any;
    description: string;
    rating: number;
    duration: string;
    level: string;
    image: string;
};