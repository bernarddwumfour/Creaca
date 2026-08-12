import Link from "next/link";

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-20">
      <h1 className="text-4xl font-black">Terms of Service</h1>
      <p className="mt-3 text-sm text-zinc-500">Effective 28 July 2026</p>
      <div className="mt-10 space-y-6 leading-7 text-zinc-700 dark:text-zinc-300">
        <p>You must provide accurate account information, protect your credentials, and use Kyrios lawfully. Course access is personal and may not be resold, shared, scraped, or used to disrupt the service.</p>
        <p>Prices and the access period shown at checkout apply to your purchase. Payment is processed by Paystack. Subscription cancellation prevents future renewal where renewal is enabled; access already paid for continues through the displayed period unless fraud or misuse requires suspension.</p>
        <p>Digital course purchases are normally final after access is granted. If a duplicate charge, technical failure, or materially unavailable service occurs, contact support within 14 days so the transaction can be reviewed. Approved refunds return through the original payment method.</p>
        <p>Learning materials are provided for education and do not guarantee employment, certification, income, or a particular result. Kyrios may update these terms and will provide notice when a material change affects existing users.</p>
        <p>For billing, cancellation, or account questions, use the <Link className="text-primary underline" href={`/${lang}/contact`}>support form</Link>.</p>
      </div>
    </main>
  );
}
