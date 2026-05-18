import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { BackofficeNav } from '@/components/backoffice/BackofficeNav';

export default async function BackofficeLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    redirect('/auth/login?redirect=/backoffice');
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <BackofficeNav />
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
