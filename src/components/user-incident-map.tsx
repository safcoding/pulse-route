'use client';

import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useCreateScenario } from '~/api/hooks';
import type { CreateScenarioRequest } from '~/api/types';

interface TempMarker {
  lat: number;
  lng: number;
}

// Simple red marker icon
const incidentIcon = L.divIcon({
  html: `<div style="background: #DC2626; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
  className: 'custom-marker',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function MapClickHandler({
  onMapClick
}: {
  onMapClick: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function UserIncidentMap() {
  const [tempMarker, setTempMarker] = useState<TempMarker | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form state
  const [description, setDescription] = useState('');
  const [callerName, setCallerName] = useState('');
  const [callerPhone, setCallerPhone] = useState('');

  const createScenario = useCreateScenario({
    onSuccess: () => {
      setSuccess(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        setTempMarker(null);
        setShowForm(false);
        setDescription('');
        setCallerName('');
        setCallerPhone('');
        setSuccess(false);
      }, 3000);
    },
    onError: (error) => {
      console.error('Failed to create scenario:', error);
      alert('Failed to report emergency. Please try again.');
    },
  });

  const handleMapClick = (lat: number, lng: number) => {
    setTempMarker({ lat, lng });
    setShowForm(true);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tempMarker) return;

    const scenarioData: CreateScenarioRequest = {
      lat: tempMarker.lat,
      lng: tempMarker.lng,
      description,
      callerName: callerName || undefined,
      callerPhone: callerPhone || undefined,
    };

    createScenario.mutate(scenarioData);
  };

  const handleCancel = () => {
    setTempMarker(null);
    setShowForm(false);
    setDescription('');
    setCallerName('');
    setCallerPhone('');
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[3.0580, 101.5920]}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <MapClickHandler onMapClick={handleMapClick} />

        {tempMarker && (
          <Marker
            position={[tempMarker.lat, tempMarker.lng]}
            icon={incidentIcon}
          />
        )}
      </MapContainer>

      {/* Incident Form Modal */}
      {showForm && (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-1000 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            {success ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">Incident Reported!</h3>
                <p className="text-gray-600">Emergency services have been notified.</p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Report Emergency</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Caller Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={callerName}
                      onChange={(e) => setCallerName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your name"
                    />
                  </div>

                  {/* Caller Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={callerPhone}
                      onChange={(e) => setCallerPhone(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  {/* Emergency Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Describe the Emergency *
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Man collapsed, chest pain, difficulty breathing"
                      rows={3}
                      required
                    />
                  </div>

                  {/* Location Display */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Location</div>
                    <div className="text-sm font-mono text-gray-700">
                      {tempMarker?.lat.toFixed(6)}, {tempMarker?.lng.toFixed(6)}
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-xs text-purple-800">
                      <strong>AI Analysis:</strong> The system will analyze your description to determine
                      incident category, severity, and triage type for optimal dispatch.
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
                      disabled={createScenario.isPending}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition"
                      disabled={createScenario.isPending}
                    >
                      {createScenario.isPending ? 'Reporting...' : 'Report Emergency'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}