import React from "react";
import { Star, Quote } from "lucide-react";

export default function Testimonials({ t }: { t: any }) {
  // We use the items array from the dictionary
  const items = t.items;

  return (
    <section className="bg-white dark:bg-[#18181b] py-24 overflow-hidden relative transition-colors duration-500">
      
      {/* --- BACKGROUND DECOR (BUBBLES) --- */}
      <div className="absolute top-[-30%] right-[-5%] w-[65%] h-[55%] bg-orange-500/25 dark:bg-orange-600/10 rounded-full blur-[130px] pointer-events-none z-0 animate-[pulse_10s_ease-in-out_infinite]" />

      <div className="absolute bottom-[-15%] left-[-10%] w-[70%] h-[60%] bg-primary/20 dark:bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0 animate-[pulse_8s_ease-in-out_infinite]" />
      
      <div className="absolute top-[20%] right-[-5%] w-80 h-80 bg-orange-600/15 dark:bg-orange-600/10 rounded-full blur-[100px] animate-[pulse_10s_infinite]" />
      <div className="absolute bottom-[10%] right-[5%] w-48 h-48 bg-primary/10 rounded-full blur-[60px] animate-[pulse_7s_infinite_2s]" />

      <div className="absolute bottom-[-25%] left-[20%] w-[60%] h-[40%] bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="lg:container mx-auto px-6 relative z-10">
        
        {/* --- CRESCA THEMED HEADER --- */}
        <div className="max-w-xl space-y-4 mb-16">
          <h2 className="text-primary font-bold uppercase tracking-[0.3em] text-xs">{t.title}</h2>
          <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {t.subtitle} <span className="text-orange-600 relative inline-block">
              {t.subtitleAccent}
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-orange-600/0 via-orange-600/50 to-orange-600/0 blur-sm"></span>
            </span>
          </h3>
        </div>

        <div className="relative mx-auto">
          {items.map((testimonial: any, idx: number) => (
            <input
              key={`radio-${testimonial.id}`}
              type="radio"
              name="testimonial-swipe"
              id={testimonial.id}
              className="peer hidden"
              defaultChecked={idx === 0}
            />
          ))}

          {/* SWIPING TRACK */}
          <div className="relative w-full overflow-hidden rounded-3xl">
            <div className="flex transition-transform duration-700 ease-in-out w-[400%]" id="swipe-track">
              {items.map((testimonial: any) => (
                <div key={`slide-${testimonial.id}`} className="w-1/4 px-2">
                  
                  {/* CARD STRUCTURE */}
                  <div className="group relative p-[2px] rounded-3xl transition-all duration-700 overflow-hidden bg-slate-100/50 dark:bg-zinc-900/50 shadow-sm">
                    
                    <div className="absolute w-[96%] h-[96%] top-[2%] left-[2%] z-1 bg-slate-100 dark:bg-zinc-900 rounded-[1.4rem]" />

                    {/* FIERY BORDER */}
                    <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,#ea580c_230deg,transparent_210deg)] opacity-40 group-hover:opacity-100 animate-[spin_4s_linear_infinite] transition-opacity duration-500 pointer-events-none" />

                    {/* GLASS CONTENT LAYER */}
                    <div className="relative h-full flex flex-col p-8 md:p-12 rounded-3xl bg-white/80 dark:bg-[#111114]/80 backdrop-blur-2xl z-10 border border-slate-100 dark:border-white/5 overflow-hidden min-h-[320px] justify-center">
                      
                      <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/2 to-transparent animate-[shimmer_3s_infinite]" />
                      
                      <Quote className="absolute top-8 right-8 w-12 h-12 text-primary/60 dark:text-primary/60" strokeWidth={3} />
                      
                      <div className="flex gap-1 mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-orange-500 text-orange-500" />
                        ))}
                      </div>

                      <p className="text-base md:text-lg font-bold text-slate-800 dark:text-zinc-200 italic leading-relaxed mb-8">
                        "{testimonial.content}"
                      </p>

                      <div className="flex items-center gap-4">
                        <div className="text-3xl w-10 h-10 flex items-center justify-center select-none">
                          {testimonial.flag}
                        </div>
                        <div>
                          <h4 className="text-slate-900 dark:text-white font-black text-sm uppercase tracking-tight">{testimonial.name}</h4>
                          <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">{testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FLAG CONTROLS */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-6">
            {items.map((testimonial: any) => (
              <label
                key={`label-${testimonial.id}`}
                htmlFor={testimonial.id}
                className="cursor-pointer relative transition-all duration-300 active:scale-90"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-slate-200 dark:border-white/10 flex items-center justify-center text-3xl bg-white dark:bg-zinc-900 transition-all duration-300 hover:border-orange-600 hover:scale-110 shadow-sm overflow-hidden">
                  {testimonial.flag}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-12deg); }
          100% { transform: translateX(450%) skewX(-12deg); }
        }
        
        #${items[0].id}:checked ~ div #swipe-track { transform: translateX(0%); }
        #${items[1].id}:checked ~ div #swipe-track { transform: translateX(-25%); }
        #${items[2].id}:checked ~ div #swipe-track { transform: translateX(-50%); }
        #${items[3].id}:checked ~ div #swipe-track { transform: translateX(-75%); }

        ${items.map((testimonial: any) => `
          #${testimonial.id}:checked ~ div label[for="${testimonial.id}"] div {
            border-color: #ea580c;
            transform: scale(1.15);
            box-shadow: 0 0 20px rgba(234, 88, 12, 0.4);
          }
        `).join('')}
      `}} />
    </section>
  );
}