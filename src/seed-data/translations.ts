export const translatedCourseSlugs = [
  "javascript-fundamentals", "cybersecurity-fundamentals", "python-for-data-science",
  "digital-marketing-fundamentals", "project-management-fundamentals", "ai-fundamentals-for-managers",
] as const;

export const localizedCourseMetadata = {
  es: { prefix: "", short: "Curso práctico con fundamentos, ejemplos y resultados aplicables.", full: "Aprende paso a paso con explicaciones claras, ejemplos prácticos y actividades basadas en situaciones reales." },
  pt: { prefix: "", short: "Curso prático com fundamentos, exemplos e resultados aplicáveis.", full: "Aprenda passo a passo com explicações claras, exemplos práticos e atividades baseadas em situações reais." },
  fr: { prefix: "", short: "Cours pratique avec bases, exemples et résultats applicables.", full: "Apprenez pas à pas avec des explications claires, des exemples pratiques et des activités concrètes." },
  de: { prefix: "", short: "Praxisnaher Kurs mit Grundlagen, Beispielen und anwendbaren Ergebnissen.", full: "Lerne Schritt für Schritt mit klaren Erklärungen, praktischen Beispielen und realistischen Übungen." },
} as const;

export const translatedTitles: Record<string, Record<string, string>> = {
  "javascript-fundamentals": { es: "Fundamentos de JavaScript", pt: "Fundamentos de JavaScript", fr: "Fondamentaux de JavaScript", de: "JavaScript-Grundlagen" },
  "cybersecurity-fundamentals": { es: "Fundamentos de ciberseguridad", pt: "Fundamentos de cibersegurança", fr: "Fondamentaux de la cybersécurité", de: "Grundlagen der Cybersicherheit" },
  "python-for-data-science": { es: "Python para ciencia de datos", pt: "Python para ciência de dados", fr: "Python pour la science des données", de: "Python für Data Science" },
  "digital-marketing-fundamentals": { es: "Fundamentos de marketing digital", pt: "Fundamentos de marketing digital", fr: "Fondamentaux du marketing numérique", de: "Grundlagen des digitalen Marketings" },
  "project-management-fundamentals": { es: "Fundamentos de gestión de proyectos", pt: "Fundamentos de gestão de projetos", fr: "Fondamentaux de la gestion de projet", de: "Grundlagen des Projektmanagements" },
  "ai-fundamentals-for-managers": { es: "Fundamentos de IA para directivos", pt: "Fundamentos de IA para gestores", fr: "Fondamentaux de l’IA pour les managers", de: "KI-Grundlagen für Führungskräfte" },
};

export const lessonTemplates = {
  es: { module: "Módulo", summary: "Lección práctica sobre", content: "En esta lección estudiarás los conceptos esenciales de {title}. Sigue los ejemplos, relaciona cada idea con el curso y completa una práctica para comprobar tu comprensión." },
  pt: { module: "Módulo", summary: "Aula prática sobre", content: "Nesta aula você estudará os conceitos essenciais de {title}. Acompanhe os exemplos, relacione cada ideia ao curso e conclua uma prática para verificar sua compreensão." },
  fr: { module: "Module", summary: "Leçon pratique sur", content: "Dans cette leçon, vous étudierez les concepts essentiels de {title}. Suivez les exemples, reliez chaque idée au cours et terminez un exercice pour vérifier votre compréhension." },
  de: { module: "Modul", summary: "Praxislektion zu", content: "In dieser Lektion lernst du die wesentlichen Konzepte von {title}. Arbeite die Beispiele durch, ordne jede Idee in den Kurs ein und prüfe dein Verständnis mit einer Übung." },
} as const;
