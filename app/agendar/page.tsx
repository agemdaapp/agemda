// Esta página foi movida para /(tenant)/page.tsx
// Redireciona para a landing page principal
import { redirect } from 'next/navigation';

export default function AgendarPage() {
  redirect('/');
}
