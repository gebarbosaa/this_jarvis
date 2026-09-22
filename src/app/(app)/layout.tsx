import { Sidebar } from '@/components/nav/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-paper">
      <Sidebar />
      <div className="lg:pl-[252px]">
        <main className="mx-auto min-h-dvh w-full max-w-[1440px] px-4 pb-8 pt-[76px] sm:px-6 sm:pt-8 lg:px-8 lg:pb-12 lg:pt-8 xl:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
