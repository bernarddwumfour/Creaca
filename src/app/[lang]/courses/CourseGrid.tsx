'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Clock, Star, ArrowRightCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Lang } from '@/lib/dictionary/dictionary';
import Link from 'next/link';

const COURSE_DATA = {
    en: {
        categories: ['All Topics', 'Analysis', 'Algebra', 'Applied'],
        showing: "Showing",
        coursesLabel: "AI Learning Modules",
        learnMore: "Start Solving",
        items: [
            { title: "Adaptive Calculus", desc: "Master limits and integrals with real-time AI feedback and dynamic visualizations.", level: "Advanced", duration: "12 Weeks", rating: 4.9, image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800", category: "Analysis" },
            { title: "Linear Algebra & AI", desc: "Understand vector spaces and matrices, the foundational logic behind modern neural networks.", level: "Intermediate", duration: "8 Weeks", rating: 5.0, image: "https://images.unsplash.com/photo-1509228468518-180dd48a5791?q=80&w=800", category: "Algebra" },
            { title: "Probability Models", desc: "Explore stochastic processes and predictive modeling with AI-generated datasets.", level: "Intermediate", duration: "10 Weeks", rating: 4.8, image: "https://images.unsplash.com/photo-1551288049-bbbda536ad39?q=80&w=800", category: "Applied" },
            { title: "Abstract Algebra", desc: "A deep dive into groups, rings, and fields for cryptographic and security applications.", level: "Advanced", duration: "14 Weeks", rating: 4.7, image: "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?q=80&w=800", category: "Algebra" },
            { title: "Financial Math", desc: "Apply mathematical analysis to markets using AI-driven quantitative strategies.", level: "Advanced", duration: "16 Weeks", rating: 4.9, image: "https://images.unsplash.com/photo-1611974714658-54d930c88339?q=80&w=800", category: "Applied" },
            { title: "Numerical Analysis", desc: "Learn the algorithms that allow computers to solve complex physical simulations.", level: "Intermediate", duration: "6 Weeks", rating: 4.6, image: "https://images.unsplash.com/photo-1596495573826-3946d022210c?q=80&w=800", category: "Analysis" },
        ]
    },
    fr: {
        categories: ['Tous les sujets', 'Analyse', 'Algèbre', 'Appliqué'],
        showing: "Affichage de",
        coursesLabel: "Modules d'IA",
        learnMore: "Commencer à résoudre",
        items: [
            { title: "Calcul Adaptatif", desc: "Maîtrisez les limites et intégrales avec un feedback IA en temps réel et des visualisations.", level: "Avancé", duration: "12 Semaines", rating: 4.9, image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800", category: "Analyse" },
            { title: "Algèbre Linéaire & IA", desc: "Comprenez les espaces vectoriels, la logique fondamentale derrière les réseaux de neurones.", level: "Intermédiaire", duration: "8 Semaines", rating: 5.0, image: "https://images.unsplash.com/photo-1509228468518-180dd48a5791?q=80&w=800", category: "Algèbre" },
            { title: "Modèles Probabilistes", desc: "Explorez les processus stochastiques avec des ensembles de données générés par l'IA.", level: "Intermédiaire", duration: "10 Semaines", rating: 4.8, image: "https://images.unsplash.com/photo-1551288049-bbbda536ad39?q=80&w=800", category: "Appliqué" },
            { title: "Algèbre Abstraite", desc: "Plongée dans les groupes et anneaux pour les applications en cryptographie.", level: "Avancé", duration: "14 Semaines", rating: 4.7, image: "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?q=80&w=800", category: "Algèbre" },
            { title: "Mathématiques Financières", desc: "Appliquez l'analyse mathématique aux marchés via des stratégies quantitatives IA.", level: "Avancé", duration: "16 Semaines", rating: 4.9, image: "https://images.unsplash.com/photo-1611974714658-54d930c88339?q=80&w=800", category: "Appliqué" },
            { title: "Analyse Numérique", desc: "Apprenez les algorithmes permettant de résoudre des simulations physiques complexes.", level: "Intermédiaire", duration: "6 Semaines", rating: 4.6, image: "https://images.unsplash.com/photo-1596495573826-3946d022210c?q=80&w=800", category: "Analyse" },
        ]
    },
    es: {
        categories: ['Todos los temas', 'Análisis', 'Álgebra', 'Aplicada'],
        showing: "Mostrando",
        coursesLabel: "Módulos de IA",
        learnMore: "Empezar a resolver",
        items: [
            { title: "Cálculo Adaptativo", desc: "Domina límites e integrales con retroalimentación de IA y visualizaciones dinámicas.", level: "Avanzado", duration: "12 Semanas", rating: 4.9, image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800", category: "Análisis" },
            { title: "Álgebra Lineal e IA", desc: "Entiende espacios vectoriales y matrices, la lógica base de las redes neuronales.", level: "Intermedio", duration: "8 Semanas", rating: 5.0, image: "https://images.unsplash.com/photo-1509228468518-180dd48a5791?q=80&w=800", category: "Álgebra" },
            { title: "Modelos Probabilísticos", desc: "Explora procesos estocásticos con conjuntos de datos generados por IA.", level: "Intermedio", duration: "10 Semanas", rating: 4.8, image: "https://images.unsplash.com/photo-1551288049-bbbda536ad39?q=80&w=800", category: "Aplicada" },
            { title: "Álgebra Abstracta", desc: "Inmersión en grupos y anillos para aplicaciones de criptografía y seguridad.", level: "Avanzado", duration: "14 Semanas", rating: 4.7, image: "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?q=80&w=800", category: "Álgebra" },
            { title: "Mates Financieras", desc: "Aplica análisis matemático a los mercados usando estrategias cuantitativas de IA.", level: "Avanzado", duration: "16 Semanas", rating: 4.9, image: "https://images.unsplash.com/photo-1611974714658-54d930c88339?q=80&w=800", category: "Aplicada" },
            { title: "Análisis Numérico", desc: "Aprende los algoritmos que permiten resolver simulaciones físicas complejas.", level: "Intermedio", duration: "6 Semanas", rating: 4.6, image: "https://images.unsplash.com/photo-1596495573826-3946d022210c?q=80&w=800", category: "Análisis" },
        ]
    }
};

export default function CourseGrid({ lang }: { lang: Lang }) {
    const t = COURSE_DATA[lang] || COURSE_DATA.en;
    const [activeTab, setActiveTab] = useState(t.categories[0]);

    const filteredCourses = activeTab === t.categories[0]
        ? t.items
        : t.items.filter(course => course.category === activeTab);

    return (
        <div className="container mx-auto px-6">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-6 mb-16">
                <div className="flex bg-gray-100/50  dark:bg-[#18181b] rounded-full p-1 border border-gray-200 dark:border-zinc-800">
                    {t.categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={`px-6 py-2 text-sm rounded-full transition-all duration-300 ${activeTab === cat
                                    ? 'bg-white text-black shadow-sm font-bold'
                                    : 'text-gray-500 dark:text-gray-300 dark:hover:text-primary  hover:text-primary'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="text-sm font-bold text-zinc-900">
                    {t.showing} <span className="text-primary">{filteredCourses.length}</span> {t.coursesLabel}
                </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredCourses.map((course) => (
                    <div key={course.title} className="group p-[3px] rounded-xl  overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-slate-100/50 dark:bg-zinc-900/50 overflow-hidden rounded-2xl shadow-xl relative z-10">
                        <div className="absolute w-[98%] h-[98%] top-[1%] left-[1%] overflow-hidden bg-slate-100 dark:bg-zinc-900 shadow-xs hover:shadow-sm rounded-sm" />
                        <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,#ea580c_230deg,transparent_210deg)] opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-opacity duration-500 pointer-events-none -z-1" style={{ animationDuration: '3s' }} />
                        

                        <div className="relative h-full bg-white/50 dark:bg-[#111114]/80 backdrop-blur-2xl z-10 border border-slate-100 dark:border-white/5 overflow-hidden rounded-lg">
                            <div className="relative h-[240px] w-full overflow-hidden ">
                                <Image src={course.image} fill alt={course.title} className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
                                    {course.category}
                                </div>
                            </div>
                   

                            <div className="p-8 space-y-4 flex flex-col flex-grow">
                            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-20 bg-gradient-to-r from-transparent via-white/2 to-transparent animate-[shimmer_3s_infinite]" />                         

                                <div className="flex items-center gap-1 text-amber-500">
                                    <Star size={14} fill="currentColor" />
                                    <span className="text-xs font-bold text-zinc-900 dark:text-gray-500">{course.rating}</span>
                                </div>
                                <h3 className="text-2xl font-black text-zinc-900 dark:text-gray-200 leading-tight group-hover:text-primary transition-colors">
                                    {course.title}
                                </h3>
                                <p className="text-zinc-500 text-sm leading-relaxed">{course.desc}</p>
                                <div className="pt-4 mt-auto grid grid-cols-2 gap-4 border-t border-zinc-50">
                                    <div className="flex items-center gap-2 text-zinc-600 dark:text-gray-400">
                                        <Clock size={16} className="text-primary" />
                                        <span className="text-xs font-medium">{course.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-600 dark:text-gray-400">
                                        <Zap size={16} className="text-primary" />
                                        <span className="text-xs font-medium">{course.level}</span>
                                    </div>
                                </div>
                                
                                <Button asChild className="w-full mt-6 rounded-xl font-bold py-6  group/btn">
                                <Link href={`/${lang}/courses/${course.title}`}>
                                {t.learnMore} <ArrowRightCircle className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                                    
                                </Button>
                            </div>
                        </div>

                        <style dangerouslySetInnerHTML={{ __html: `@keyframes shimmer { 0% { transform: translateX(-150%) skewX(-20deg); } 100% { transform: translateX(450%) skewX(-20deg); } }` }} />

                    </div>
                ))}
            </div>
        </div>
    );
}