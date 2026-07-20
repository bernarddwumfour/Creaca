export const COURSE_CONTENT: Record<string, any> = {
  en: {
    enroll: "Enroll Now", preview: "Free Preview", outcomesTitle: "Learning Outcomes", curriculumTitle: "Curriculum", unitsLabel: "Practical Modules", nativeSupport: "Native-Language Support", ratingLabel: "Verified Learner Rating", durationLabel: "10–12 Weeks",
    levels: { advanced: "Advanced", intermediate: "Intermediate" },
    descPrefix: "This practical", descMid: "course uses adaptive AI guidance to help you master", descSuffix: "in your preferred language.",
    data: {
      "Web Development Foundations": {
        category: "Development",
        lessons: [
          { title: "How the Web Works", duration: "35m", locked: false },
          { title: "Build a Page with HTML", duration: "55m", locked: true },
          { title: "Style Interfaces with CSS", duration: "1h 10m", locked: true },
          { title: "Add Interactivity with JavaScript", duration: "1h 30m", locked: true },
        ],
        outcomes: ["Explain how browsers load websites", "Build accessible web pages", "Publish a responsive project"],
      },
      "Data Analysis Essentials": {
        category: "Data",
        lessons: [
          { title: "Understand Data and Questions", duration: "40m", locked: false },
          { title: "Clean and Explore a Dataset", duration: "1h 20m", locked: true },
          { title: "Communicate Insights Clearly", duration: "55m", locked: true },
        ],
        outcomes: ["Prepare data for analysis", "Find useful patterns", "Present evidence-based recommendations"],
      },
    },
  },
  fr: {
    enroll: "S’inscrire", preview: "Aperçu Gratuit", outcomesTitle: "Objectifs d’Apprentissage", curriculumTitle: "Programme", unitsLabel: "Modules Pratiques", nativeSupport: "Aide dans Votre Langue", ratingLabel: "Note des Apprenants Vérifiée", durationLabel: "10 à 12 Semaines",
    levels: { advanced: "Avancé", intermediate: "Intermédiaire" },
    descPrefix: "Ce cours pratique de", descMid: "utilise un accompagnement IA adaptatif pour vous aider à maîtriser", descSuffix: "dans la langue de votre choix.", data: {},
  },
  es: {
    enroll: "Inscribirse", preview: "Vista Previa", outcomesTitle: "Resultados de Aprendizaje", curriculumTitle: "Programa", unitsLabel: "Módulos Prácticos", nativeSupport: "Apoyo en Tu Idioma", ratingLabel: "Valoración Verificada", durationLabel: "10–12 Semanas",
    levels: { advanced: "Avanzado", intermediate: "Intermedio" },
    descPrefix: "Este curso práctico de", descMid: "usa orientación adaptativa con IA para ayudarte a dominar", descSuffix: "en el idioma que prefieras.", data: {},
  },
};

export const LESSON_MODULES: Record<string, any> = {
  "How the Web Works": {
    module_title: "How the Web Works", topic: "Web Development Foundations", difficulty: "beginner", estimated_duration_minutes: 35,
    learning_objectives: ["Describe the roles of browsers and servers", "Recognize URLs, HTTP requests, and responses", "Use developer tools to inspect a web page", "Explain the path from an idea to a published website"],
    lesson: [
      { type: "text", title: "What Happens When You Visit a Website?", content: "Your browser sends a request to a server, the server returns files and data, and the browser turns them into the page you see. Understanding this flow helps you diagnose problems and build faster, more reliable websites." },
      { type: "definition", term: "Browser", definition: "An application that requests, interprets, and displays web content." },
      { type: "definition", term: "Web server", definition: "A computer and application that receive web requests and return pages, files, or data." },
      { type: "text", title: "The Request and Response Cycle", content: "A URL identifies a resource. DNS helps locate its server. The browser sends an HTTP request, and the server answers with a status code, headers, and content." },
      { type: "example", title: "Inspect a Live Page", content: "Open your browser’s developer tools, select the Network panel, reload the page, and inspect the document request and its status code." },
      { type: "tip", content: "When a page fails, check the browser console and Network panel first. They often reveal the exact request or file causing the problem." },
    ],
    worked_examples: [{ problem: "A page returns HTTP 404. What does that tell you?", steps: ["Confirm the requested URL", "Read the response status", "Check whether the route or file exists", "Correct the path and retry"], answer: "The requested resource was not found.", explanation: "A 404 response means the server was reached but could not find a matching resource." }],
    practice_questions: [
      { type: "short_answer", question: "Which application renders HTML, CSS, and JavaScript for a user?", hint: "You are using one to view this page.", answer: "browser" },
      { type: "multiple_choice", question: "Which status code usually means a request succeeded?", options: ["200", "404", "500", "301"], correct_answer: "200" },
    ],
    quiz: { title: "How the Web Works Quiz", passing_score: 70, questions: [
      { type: "multiple_choice", question: "What does DNS help a browser find?", options: ["A server’s address", "A CSS color", "A password", "A keyboard layout"], correct_answer: "A server’s address" },
      { type: "multiple_choice", question: "Where can you inspect browser network requests?", options: ["Developer tools", "A text editor only", "The recycle bin", "A calculator"], correct_answer: "Developer tools" },
      { type: "short_answer", question: "What protocol is commonly used for web requests?", answer: "HTTP" },
    ] },
  },
};
