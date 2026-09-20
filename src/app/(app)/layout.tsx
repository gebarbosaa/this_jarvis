import { BottomNav } from '@/components/nav/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-paper">
      <div className="mx-auto max-w-md px-4 pb-28 pt-8">{children}</div>
      <BottomNav />
    </div>
  );
}