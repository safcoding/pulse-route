'use client';
import dynamic from 'next/dynamic';
import IncidentsPanel from '../components/incidents-panel/incidentsPanel';
import { SimulationControlPanel } from '../components/SimulationControlPanel';
import { useDispatchSocket } from '~/api/hooks';

// Dynamic imports to prevent SSR issues with Leaflet
const MapLegend = dynamic(
  () => import('../components/ui/mapIcons').then((mod) => ({ default: mod.MapLegend })),
  { ssr: false }
);

// Dynamic import for Map component (required for Leaflet SSR compatibility)
const Map = dynamic(() => import('~/components/map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-xl">
      <div className="text-gray-500">Loading map...</div>
    </div>
  )
});

const IncidentTracker = IncidentsPanel;

export default function DispatcherDashboardPage() {
  // Initialize WebSocket connection for real-time updates
  const { isConnected } = useDispatchSocket();

  return (
    // Tailwind classes for a full-height, split-screen layout
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* 1. Incidents Panel (Left Side - ~30% width) */}
      <div className="w-full md:w-1/3 border-r border-gray-200 overflow-y-auto">
        <IncidentTracker />
      </div>

      {/* 2. Main Map / Responder View (Right Side - ~70% width) */}
      <div className="flex-1 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Emergency Response Map</h1>
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1 text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              {isConnected ? 'Live' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden relative">
          <Map />

          {/* Map Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-1000">
            <MapLegend />
          </div>
        </div>

        {/* Active Responders Summary */}
        <div className="mt-4 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-3">Active Units Summary</h2>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">3</p>
              <p className="text-xs text-gray-600">Available</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">2</p>
              <p className="text-xs text-gray-600">Dispatched</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">1</p>
              <p className="text-xs text-gray-600">En Route</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">2</p>
              <p className="text-xs text-gray-600">On Scene</p>
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Control Panel (God Mode) */}
      <SimulationControlPanel />
    </div>
  );
}