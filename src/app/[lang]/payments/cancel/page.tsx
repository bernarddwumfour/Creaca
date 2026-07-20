import Link from 'next/link';
import { XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { dict, Lang } from '@/lib/dictionary/dictionary';

export default async function PaymentCancelPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang in dict ? rawLang : 'en') as Lang;
  const t = dict[lang].pages.payments;
  return <main className="min-h-[70vh] flex items-center justify-center px-4 bg-white dark:bg-[#111114]">
    <section className="w-full max-w-lg rounded-2xl border p-8 text-center dark:border-zinc-800">
      <XCircle className="mx-auto mb-5 h-12 w-12 text-zinc-500" />
      <h1 className="text-2xl font-black">{t.cancelled}</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">{t.cancelledBody}</p>
      <div className="mt-6 flex justify-center gap-3"><Button asChild><Link href={`/${lang}/courses`}>{t.courses}</Link></Button><Button asChild variant="outline"><Link href={`/${lang}/packages`}>{t.packages}</Link></Button></div>
    </section>
  </main>;
}
