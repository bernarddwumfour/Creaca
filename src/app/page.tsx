import { redirect } from 'next/navigation';

export default function RootPage() {
  // This executes on the server
  // It immediately sends anyone landing on "/" to "/en"
  redirect('/en');
}