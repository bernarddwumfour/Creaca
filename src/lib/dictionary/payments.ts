export const paymentsDict = {
  en: {
    verifying: 'Verifying your payment…', success: 'Payment successful', pending: 'Payment pending', failed: 'Payment verification failed',
    successBody: 'Your access is now active.', pendingBody: 'Your payment has not completed yet. Please check again shortly.',
    cancelled: 'Payment cancelled', cancelledBody: 'Nothing was charged. You can return and try again.', dashboard: 'Go to dashboard', courses: 'Browse courses', packages: 'View packages', retry: 'Try again',
  },
  fr: {
    verifying: 'Vérification de votre paiement…', success: 'Paiement réussi', pending: 'Paiement en attente', failed: 'Échec de la vérification du paiement',
    successBody: 'Votre accès est maintenant actif.', pendingBody: "Votre paiement n'est pas encore terminé. Réessayez dans quelques instants.",
    cancelled: 'Paiement annulé', cancelledBody: "Aucun montant n'a été débité. Vous pouvez réessayer.", dashboard: 'Accéder au tableau de bord', courses: 'Parcourir les cours', packages: 'Voir les forfaits', retry: 'Réessayer',
  },
  es: {
    verifying: 'Verificando tu pago…', success: 'Pago realizado', pending: 'Pago pendiente', failed: 'No se pudo verificar el pago',
    successBody: 'Tu acceso ya está activo.', pendingBody: 'Tu pago aún no ha finalizado. Vuelve a intentarlo en unos instantes.',
    cancelled: 'Pago cancelado', cancelledBody: 'No se realizó ningún cargo. Puedes volver a intentarlo.', dashboard: 'Ir al panel', courses: 'Explorar cursos', packages: 'Ver paquetes', retry: 'Intentar de nuevo',
  },
} as const;
