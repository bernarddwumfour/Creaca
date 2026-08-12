'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { dict, Lang } from '@/lib/dictionary/dictionary';
import { ENDPOINTS } from '@/lib/endpoints';
import api from '@/lib/axios';

export default function PaymentSuccessPage() {
  const { lang: rawLang } = useParams<{ lang: string }>();
  const lang = (rawLang in dict ? rawLang : 'en') as Lang;
  const t = dict[lang].pages.payments;
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const [state, setState] = useState<'verifying' | 'success' | 'pending' | 'failed'>('verifying');

  useEffect(() => {
    if (!reference) {
      setState('failed');
      return;
    }
    api.get(ENDPOINTS.PAYMENTS.VERIFY, { params: { reference } })
      .then(({ data }) => setState(data.data?.status === 'success' ? 'success' : 'pending'))
      .catch(() => setState('failed'));
  }, [reference]);

  return <main className="min-h-[70vh] flex items-center justify-center px-4 bg-white dark:bg-[#111114]">
    <section className="w-full max-w-lg rounded-2xl border p-8 text-center dark:border-zinc-800">
      {state === 'verifying' && <Loader2 className="mx-auto mb-5 h-12 w-12 animate-spin text-emerald-600" />}
      {state === 'success' && <CheckCircle2 className="mx-auto mb-5 h-12 w-12 text-emerald-600" />}
      {(state === 'failed' || state === 'pending') && <XCircle className="mx-auto mb-5 h-12 w-12 text-amber-500" />}
      <h1 className="text-2xl font-black">{t[state]}</h1>
      {state !== 'verifying' && <p className="mt-3 text-zinc-600 dark:text-zinc-400">{state === 'success' ? t.successBody : state === 'pending' ? t.pendingBody : t.failed}</p>}
      <Button asChild className="mt-6"><Link href={`/${lang}/dashboard`}>{t.dashboard}</Link></Button>
    </section>
  </main>;
}
