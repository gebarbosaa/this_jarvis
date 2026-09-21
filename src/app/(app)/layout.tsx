import { Sidebar } from '@/components/nav/Sidebar';
import { BottomNav } from '@/components/nav/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-paper">
      <Sidebar />
      <div className="lg:pl-[270px]">
        <main className="mx-auto min-h-dvh w-full max-w-[1480px] px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-10 lg:pt-8">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
