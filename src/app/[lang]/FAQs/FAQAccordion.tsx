'use client';
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
    question: string;
    answer: string;
}

export default function FAQAccordion({ items }: { items: FAQItem[] }) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="mx-auto space-y-4">
            {items.map((item, index) => (
                <div 
                    key={index}
                    className={`group transition-all duration-300 border-l-4 ${
                        openIndex === index 
                        ? 'border-primary bg-primary/5 rounded-r-xl' 
                        : 'border-transparent bg-zinc-50 hover:bg-zinc-100 rounded-xl'
                    }`}
                >
                    <button
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        className="w-full flex items-center justify-between p-5 md:p-6 text-left"
                    >
                        <span className={`text-base md:text-lg font-bold transition-colors ${openIndex === index ? 'text-zinc-900' : 'text-zinc-600'}`}>
                            {item.question}
                        </span>
                        <ChevronDown 
                            className={`transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-primary' : 'text-zinc-400'}`} 
                            size={20} 
                        />
                    </button>
                    
                    <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="p-5 md:p-6 pt-0 text-zinc-500 text-sm md:text-base leading-relaxed">
                            {item.answer}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}