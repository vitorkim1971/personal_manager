import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface MainLayoutProps {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export default function MainLayout({ title, action, children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Sidebar />
      <div className="ml-[280px]">
        <Topbar title={title} action={action} />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

