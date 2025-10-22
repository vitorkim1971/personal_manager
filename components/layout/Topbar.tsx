'use client';

import React from 'react';

interface TopbarProps {
  title: string;
  action?: React.ReactNode;
}

export default function Topbar({ title, action }: TopbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      {action && <div>{action}</div>}
    </div>
  );
}

