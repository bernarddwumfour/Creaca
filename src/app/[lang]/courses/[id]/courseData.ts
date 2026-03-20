export const COURSE_CONTENT: Record<string, any> = {
    en: {
        enroll: "Enroll Now",
        preview: "Free Preview",
        outcomesTitle: "Learning Outcomes",
        curriculumTitle: "Curriculum",
        unitsLabel: "Specialized Modules",
        nativeSupport: "Native Logic Support",
        ratingLabel: "Verified Student Rating",
        durationLabel: "10-12 Weeks",
        levels: {
            advanced: "Advanced",
            intermediate: "Intermediate"
        },
        descPrefix: "This specialized",
        descMid: "module uses AI-driven adaptive learning to help you master",
        descSuffix: "in your native language.",
        data: {
            "Adaptive Calculus": {
                category: "Analysis",
                lessons: [
                    { title: "Limits and Continuity: The AI Approach", duration: "45m", locked: false },
                    { title: "Derivatives in High Dimensions", duration: "1h 10m", locked: true },
                    { title: "Integrals & Area Under Neural Curves", duration: "55m", locked: true },
                    { title: "Taylor Series & Approximation Logic", duration: "1h 30m", locked: true },
                ],
                outcomes: ["Visualize derivatives in 3D", "Solve complex integrals via AI", "Understand convergence natively"]
            },
            "Abstract Algebra": {
                category: "Pure Math",
                lessons: [
                    { title: "Group Theory Foundations", duration: "1h", locked: false },
                    { title: "Rings, Fields and Polynomials", duration: "1h 20m", locked: true },
                ],
                outcomes: ["Master algebraic structures", "Prove group properties", "Apply symmetry logic"]
            }
        }
    },
    fr: {
        enroll: "S'inscrire",
        preview: "Aperçu Gratuit",
        outcomesTitle: "Objectifs d'apprentissage",
        curriculumTitle: "Programme",
        unitsLabel: "Modules Spécialisés",
        nativeSupport: "Support Logique Natif",
        ratingLabel: "Note des étudiants vérifiée",
        durationLabel: "10 à 12 semaines",
        levels: {
            advanced: "Avancé",
            intermediate: "Intermédiaire"
        },
        descPrefix: "Ce module spécialisé en",
        descMid: "utilise l'apprentissage adaptatif piloté par l'IA pour vous aider à maîtriser",
        descSuffix: "dans votre langue maternelle.",
        data: {
            "Calcul Adaptatif": {
                category: "Analyse",
                lessons: [
                    { title: "Limites et Continuité : L'approche IA", duration: "45m", locked: false },
                    { title: "Dérivées en hautes dimensions", duration: "1h 10m", locked: true },
                ],
                outcomes: ["Visualiser les dérivées en 3D", "Résoudre des intégrales via IA"]
            }
        }
    }
};
export const LESSON_MODULES: Record<string, any> = {
    "Limits and Continuity: The AI Approach": {
        module_title: "Limits and Continuity: The AI Approach",
        topic: "Calculus Fundamentals",
        difficulty: "beginner",
        estimated_duration_minutes: 45,
        learning_objectives: [
            "Understand the intuitive concept of limits",
            "Learn how AI uses limits in optimization algorithms",
            "Master continuity and its applications in machine learning",
            "Apply limits to real-world problems in data science"
        ],
        lesson: [
            {
                type: "text",
                title: "What is a Limit?",
                content: "A limit is the value that a function approaches as the input approaches some value. Think of it like getting closer and closer to a target. In AI, we use limits to understand how models behave as they learn and optimize. For example, as a neural network trains for more epochs, its loss function approaches a minimum value - this is a limit in action!"
            },
            {
                type: "definition",
                term: "Limit",
                definition: "The value that a function approaches as the input gets arbitrarily close to some value. Notation: lim(x→a) f(x) = L"
            },
            {
                type: "definition",
                term: "Continuity",
                definition: "A function is continuous if you can draw it without lifting your pen. More formally, a function is continuous at a point if the limit exists and equals the function's value at that point."
            },
            {
                type: "text",
                title: "Limits in AI and Machine Learning",
                content: "In machine learning, limits appear everywhere: • Gradient descent: As we take smaller steps, we approach the minimum • Learning rate decay: The learning rate approaches zero over time • Model convergence: The loss function approaches its minimum • Asymptotic analysis: How algorithms scale with data size"
            },
            {
                type: "formula",
                formula: "lim(x→a) f(x) = L",
                explanation: "This notation means 'the limit of f(x) as x approaches a equals L'"
            },
            {
                type: "example",
                title: "Real-World Example: GPS Navigation",
                content: "When you drive towards a destination, your GPS calculates your arrival time using limits. As you get closer, the estimated time approaches the actual arrival time. This is why the ETA becomes more accurate the closer you get!"
            },
            {
                type: "tip",
                content: "Think of limits as 'what value are we getting close to?' rather than 'what value do we reach?'. This distinction is crucial in calculus and optimization."
            },
            {
                type: "warning",
                content: "Common mistake: Assuming the limit equals the function value. They can be different if there's a hole in the function! This is called a removable discontinuity."
            }
        ],
        worked_examples: [
            {
                problem: "Find lim(x→2) (x² - 4)/(x - 2)",
                steps: [
                    "First, notice that plugging in x=2 gives 0/0, which is undefined (indeterminate form)",
                    "Factor the numerator using difference of squares: x² - 4 = (x-2)(x+2)",
                    "Cancel the common factor (x-2): (x-2)(x+2)/(x-2) = x+2",
                    "Now we can safely take the limit as x→2: 2+2 = 4",
                    "Therefore, lim(x→2) (x² - 4)/(x-2) = 4"
                ],
                answer: "4",
                explanation: "Even though the function is undefined at x=2 (division by zero), the limit exists and equals 4. This is a classic example of a removable discontinuity, where the function has a hole at x=2."
            },
            {
                problem: "Find lim(x→0) sin(x)/x",
                steps: [
                    "This is a fundamental limit in calculus",
                    "As x approaches 0, both sin(x) and x approach 0 (indeterminate form)",
                    "Using the squeeze theorem or geometric reasoning, we can show this limit equals 1",
                    "Graphically, as x gets very small, sin(x) ≈ x, so their ratio approaches 1",
                    "This limit is crucial in understanding derivatives of trigonometric functions"
                ],
                answer: "1",
                explanation: "This limit is used extensively in physics, engineering, and signal processing. It's the reason why sin(x) ≈ x for small angles!"
            }
        ],
        practice_questions: [
            {
                type: "short_answer",
                question: "Find lim(x→3) (x² - 9)/(x - 3)",
                hint: "Factor the numerator as a difference of squares: a² - b² = (a-b)(a+b)",
                answer: "6"
            },
            {
                type: "short_answer",
                question: "Find lim(x→0) (e^x - 1)/x",
                hint: "This is another fundamental limit. Think about the derivative of e^x at x=0",
                answer: "1"
            },
            {
                type: "multiple_choice",
                question: "What is lim(x→0) sin(x)/x?",
                options: ["0", "1", "Undefined", "∞"],
                correct_answer: "1"
            },
            {
                type: "multiple_choice",
                question: "If a function has a hole at x = a but the limit exists, what is this called?",
                options: [
                    "Jump discontinuity",
                    "Removable discontinuity",
                    "Infinite discontinuity",
                    "Continuous"
                ],
                correct_answer: "Removable discontinuity"
            },
            {
                type: "short_answer",
                question: "Find lim(x→4) (x² - 16)/(x - 4)",
                hint: "Remember: x² - 16 = (x-4)(x+4)",
                answer: "8"
            }
        ],
        quiz: {
            title: "Limits and Continuity Mastery Quiz",
            passing_score: 70,
            questions: [
                {
                    type: "multiple_choice",
                    question: "What does lim(x→a) f(x) = L mean?",
                    options: [
                        "f(a) = L",
                        "As x gets closer to a, f(x) gets closer to L",
                        "The function is undefined at a",
                        "f(x) equals L for all x"
                    ],
                    correct_answer: "As x gets closer to a, f(x) gets closer to L"
                },
                {
                    type: "multiple_choice",
                    question: "Which of the following is NOT a valid limit?",
                    options: [
                        "lim(x→2) x² = 4",
                        "lim(x→0) 1/x² = ∞",
                        "lim(x→0) sin(1/x) exists",
                        "lim(x→0) (x²/x) = 0"
                    ],
                    correct_answer: "lim(x→0) sin(1/x) exists"
                },
                {
                    type: "short_answer",
                    question: "Find lim(x→5) (x² - 25)/(x - 5)",
                    answer: "10"
                },
                {
                    type: "short_answer",
                    question: "Find lim(x→0) (tan x)/x",
                    hint: "tan x = sin x / cos x",
                    answer: "1"
                },
                {
                    type: "multiple_choice",
                    question: "In machine learning, limits appear in which context?",
                    options: [
                        "Gradient descent convergence",
                        "Learning rate decay",
                        "Model optimization",
                        "All of the above"
                    ],
                    correct_answer: "All of the above"
                }
            ]
        }
    }
};