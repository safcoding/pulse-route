'use client';

import dynamic from 'next/dynamic';
import { SimulationControlPanel } from '~/components/SimulationControlPanel';

const UserIncidentMap = dynamic(() => import('~/components/user-incident-map'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full flex items-center justify-center bg-gray-100">
      <div className="text-gray-500">Loading map...</div>
    </div>
  )
});

export default function UserIncidentPage() {
  return (
    <div className="h-screen w-full flex flex-col">
      <header className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Report Emergency</h1>
        <p className="text-sm text-gray-600">Click on the map to report an emergency incident</p>
      </header>

      <div className="flex-1">
        <UserIncidentMap />
      </div>

      {/* Simulation Control Panel (God Mode) */}
      <SimulationControlPanel />
    </div>
  );
}