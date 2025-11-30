'use client';

import { useState, useMemo } from 'react';
import { IncidentCard } from './IncidentCard';
import { AssignmentModal } from './modals/assignmentModal';
import { ConfirmationModal } from './modals/confirmModal';
import { useIncidents, useUpdateIncidentStatus } from '~/api/hooks';
import type { Incident, IncidentStatus as ApiIncidentStatus } from '~/api/types';

// Map API status to UI display status
type UIIncidentStatus = 'Pending' | 'Ongoing' | 'Completed' | 'Cancelled';

function mapApiStatusToUI(status: ApiIncidentStatus): UIIncidentStatus {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'ASSIGNED':
    case 'EN_ROUTE':
    case 'ARRIVED':
    case 'TRANSPORTING':
      return 'Ongoing';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return 'Pending';
  }
}

// UI-friendly incident type for display
export interface UIIncident {
  id: string;
  type: string;
  status: UIIncidentStatus;
  time: string;
  location: string;
  caller: string;
  responder: string | null;
  unitType: string;
  // Original API data
  originalData: Incident;
}

function transformIncidentForUI(incident: Incident): UIIncident {
  // Handle both location object and separate lat/lng fields from backend
  const lat = incident.location?.lat ?? incident.lat;
  const lng = incident.location?.lng ?? incident.lng;

  return {
    id: incident.id,
    type: incident.triage,
    status: mapApiStatusToUI(incident.status),
    time: incident.createdAt
      ? new Date(incident.createdAt).toLocaleString()
      : 'Unknown',
    location: (lat !== undefined && lng !== undefined)
      ? `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      : 'Unknown location',
    caller: 'Dispatcher',
    responder: incident.assignedAmbulanceId
      ? `Ambulance #${incident.assignedAmbulanceId}`
      : null,
    unitType: 'ALS',
    originalData: incident,
  };
}

export default function IncidentsPanel() {
  const { data: incidents = [], isLoading, error } = useIncidents();
  const updateIncidentStatus = useUpdateIncidentStatus();

  const [activeTab, setActiveTab] = useState<string>('All');
  const [incidentToCancel, setIncidentToCancel] = useState<UIIncident | null>(null);
  const [incidentToAssign, setIncidentToAssign] = useState<UIIncident | null>(null);

  const tabs = ['All', 'Pending', 'Ongoing', 'Completed'];

  const uiIncidents = useMemo(() => {
    return incidents.map(transformIncidentForUI);
  }, [incidents]);

  const filteredIncidents = useMemo(() => {
    if (activeTab === 'All') return uiIncidents;
    return uiIncidents.filter((inc) => inc.status === activeTab);
  }, [activeTab, uiIncidents]);

  const handleComplete = (id: string) => {
    updateIncidentStatus.mutate({
      id,
      data: { status: 'COMPLETED' },
    });
  };

  const handleConfirmCancel = (id: string) => {
    updateIncidentStatus.mutate({
      id,
      data: { status: 'CANCELLED' },
    });
  };

  const handleConfirmAssign = (
    id: string,
    unitCallsign: string,
    unitType: string,
    _notes: string
  ) => {
    // This will be handled by the assignment modal using the assign mutation
    console.log('Assigning', { id, unitCallsign, unitType });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 font-sans">
        <div className="max-w-md mx-auto">
          <div className="text-2xl font-bold text-gray-900 mb-6">
            Subang Emergency Dispatch
          </div>
          <div className="text-center text-gray-500 py-12">Loading incidents...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 font-sans">
        <div className="max-w-md mx-auto">
          <div className="text-2xl font-bold text-gray-900 mb-6">
            Subang Emergency Dispatch
          </div>
          <div className="text-center text-red-500 py-12">
            Error loading incidents: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-md mx-auto">
        <div className="text-2xl font-bold text-gray-900 mb-6">
          Subang Emergency Dispatch
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6 bg-white p-1 rounded-lg shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 text-sm font-semibold rounded transition ${activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Incident List */}
        <div className="space-y-4">
          {filteredIncidents.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              No incidents in this category
            </div>
          ) : (
            filteredIncidents.map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                onAssignClick={setIncidentToAssign}
                onComplete={handleComplete}
                onCancelClick={setIncidentToCancel}
              />
            ))
          )}
        </div>
      </div>

      <AssignmentModal
        incident={incidentToAssign}
        onAssign={handleConfirmAssign}
        onClose={() => setIncidentToAssign(null)}
      />

      <ConfirmationModal
        incident={incidentToCancel}
        onConfirm={handleConfirmCancel}
        onClose={() => setIncidentToCancel(null)}
      />
    </div>
  );
}