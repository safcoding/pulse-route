'use client';
import Map from '~/components/map';

// CORRECTED PATH: Now using '../' because this page is located directly inside the 'app' directory.
import IncidentsPanel from '../components/ui/incidentsPanel'; 

// Renaming the imported component for clarity, as its default export is 'App'
const IncidentTracker = IncidentsPanel; 

export default function DispatcherDashboardPage() {
  return (
    // Tailwind classes for a full-height, split-screen layout
    <div className="flex h-screen overflow-hidden bg-gray-50">
      
      {/* 1. Incidents Panel (Left Side - ~30% width) */}
      <div className="w-full md:w-1/3 border-r border-gray-200 overflow-y-auto">
        <IncidentTracker /> 
      </div>

      {/* 2. Main Map / Responder View (Right Side - ~70% width) */}
      <div className="flex-1 p-6 flex flex-col">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Optimal Route Map</h1>
        <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center text-gray-400 text-lg">
          <Map />
        </div>
        
        {/* You will eventually add the Active Responders panel here */}
        <div className="mt-4 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
            Active Responder List placeholder.
        </div>
      </div>
    </div>
  );
}