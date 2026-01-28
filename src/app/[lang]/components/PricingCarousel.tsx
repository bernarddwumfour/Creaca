"use client";
import React, { useRef } from 'react';
import { Sparkles, Check, ChevronLeft, ChevronRight } from 'lucide-react';

interface Plan {
  title: string;
  price: number;
  features: string[];
  buttonText: string;
  mostPopular?: boolean;
}

export default function PricingCarousel({ data }: { data: Plan[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const moveDistance = clientWidth * 0.8; // Move roughly one card at a time
      const scrollTo = direction === 'left' ? scrollLeft - moveDistance : scrollLeft + moveDistance;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="lg:col-span-3 w-full group">
      {/* Scroll Container */}
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-12 pt-4  px-4 -mx-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {data.map((plan, index) => (
          <div
            key={index}
            className={`snap-center shrink-0 scale-95 p-8 rounded-3xl w-[290px] md:w-[350px]  transition-all duration-300 hover:-translate-y-2 flex flex-col relative ${
              plan.mostPopular
                ? 'bg-gradient-to-b from-primary to-[#c47b2c] text-white ring-4 ring-primary/20 scale-100 z-10 '
                : 'bg-card border border-border text-card-foreground'
            }`}
          >
            {plan.mostPopular && (
              <div className="flex items-center text-[10px] gap-1 py-1 px-3 text-primary absolute -top-3 left-8 rounded-full bg-white font-black uppercase tracking-tighter shadow-md">
                <Sparkles size={12} fill="currentColor" />
                <span>Recommended</span>
              </div>
            )}

            <p className="text-sm font-bold opacity-80 uppercase tracking-widest">{plan.title}</p>
            <div className="flex items-baseline gap-1 mt-4">
              <span className="text-4xl font-black">${plan.price}</span>
              <span className="text-sm opacity-70">/month</span>
            </div>

            <div className="mt-8 space-y-4 flex-grow">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`mt-1 p-0.5 rounded-full ${plan.mostPopular ? 'bg-white/20' : 'bg-primary/10'}`}>
                    <Check size={14} className={plan.mostPopular ? 'text-white' : 'text-primary'} strokeWidth={4} />
                  </div>
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>

            <button className={`mt-10 w-full py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${
              plan.mostPopular ? 'bg-white text-primary hover:bg-slate-50' : 'bg-primary text-white hover:opacity-90'
            }`}>
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-4 mt-2 lg:justify-start justify-center">
        <button 
          onClick={() => scroll('left')}
          className="p-3 rounded-full border border-border bg-card text-foreground hover:bg-primary hover:text-white transition-all shadow-sm active:scale-90"
          aria-label="Previous plans"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={() => scroll('right')}
          className="p-3 rounded-full border border-border bg-card text-foreground hover:bg-primary hover:text-white transition-all shadow-sm active:scale-90"
          aria-label="Next plans"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}