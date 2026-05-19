import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | BRT Overloading Detection and Monitoring System',
  description: 'Operator sign-in for the BRT vehicle overloading detection and monitoring platform.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
