import Link from "next/link";

const copy = {
  en: { title: "Privacy Policy", effective: "Effective 28 July 2026", contact: "contact form", paragraphs: [
    "Kyrios processes account details, learning activity, security information, support messages, and payment references to provide and secure the learning service. Card details are handled by Paystack and are not stored by Kyrios.",
    "We use this information to authenticate users, deliver courses, track progress, process purchases, prevent abuse, provide support, and meet legal and financial-record obligations. We do not sell personal information.",
    "Service providers may process limited information on our behalf, including hosting, database, email, monitoring, authentication, and payment providers. Records are kept only as long as needed for the service, security, or applicable legal obligations.",
    "You may update your profile, request a copy or correction of your information, or delete your learner account from Profile. Deletion anonymizes the account while retaining transaction records that must be kept for reconciliation or legal compliance.",
  ]},
  fr: { title: "Politique de confidentialité", effective: "En vigueur le 28 juillet 2026", contact: "formulaire de contact", paragraphs: [
    "Kyrios traite les informations du compte, l’activité d’apprentissage, les données de sécurité, les messages d’assistance et les références de paiement afin de fournir et sécuriser le service. Les données de carte sont traitées par Paystack et ne sont pas stockées par Kyrios.",
    "Nous utilisons ces données pour authentifier les utilisateurs, fournir les cours, suivre la progression, traiter les achats, prévenir les abus et fournir une assistance. Nous ne vendons pas les données personnelles.",
    "Des prestataires peuvent traiter des données limitées pour l’hébergement, la base de données, l’e-mail, la surveillance, l’authentification et le paiement. Les données ne sont conservées que pendant la durée nécessaire.",
    "Vous pouvez modifier votre profil, demander une copie ou une correction de vos données, ou supprimer votre compte depuis le Profil. La suppression anonymise le compte tout en conservant les registres de transaction requis.",
  ]},
  es: { title: "Política de privacidad", effective: "Vigente desde el 28 de julio de 2026", contact: "formulario de contacto", paragraphs: [
    "Kyrios trata datos de cuenta, actividad de aprendizaje, información de seguridad, mensajes de soporte y referencias de pago para prestar y proteger el servicio. Paystack procesa los datos de tarjeta y Kyrios no los almacena.",
    "Usamos estos datos para autenticar usuarios, ofrecer cursos, registrar el progreso, procesar compras, prevenir abusos y prestar soporte. No vendemos información personal.",
    "Proveedores de alojamiento, base de datos, correo, supervisión, autenticación y pagos pueden tratar datos limitados en nuestro nombre. Conservamos los registros solo durante el tiempo necesario.",
    "Puedes actualizar tu perfil, solicitar una copia o corrección de tus datos o eliminar tu cuenta desde Perfil. La eliminación anonimiza la cuenta y conserva los registros de transacciones legalmente necesarios.",
  ]},
};

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const text = copy[lang as keyof typeof copy] ?? copy.en;
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-20">
      <h1 className="text-4xl font-black">{text.title}</h1>
      <p className="mt-3 text-sm text-zinc-500">{text.effective}</p>
      <div className="mt-10 space-y-6 leading-7 text-zinc-700 dark:text-zinc-300">
        {text.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <p><Link className="text-primary underline" href={`/${lang}/contact`}>{text.contact}</Link></p>
      </div>
    </main>
  );
}
