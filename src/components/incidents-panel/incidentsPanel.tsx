import { useState, useMemo } from 'react';
import type { Incident, IncidentStatus, UnitType } from '../mockData/types';
import { MOCK_INCIDENTS } from '../mockData/incidents';
import { IncidentCard } from './incidentCard';
import { AssignmentModal } from './modals/assignmentModal';
import { ConfirmationModal } from './modals/confirmModal';

export default function IncidentsPanel() {
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [incidentToCancel, setIncidentToCancel] = useState<Incident | null>(null);
  const [incidentToAssign, setIncidentToAssign] = useState<Incident | null>(null);

  const tabs = ['All', 'Pending', 'Ongoing', 'Completed'];

  const filteredIncidents = useMemo(() => {
    if (activeTab === 'All') return incidents;
    return incidents.filter(inc => inc.status === activeTab);
  }, [activeTab, incidents]);

  const handleComplete = (id: number) => {
    setIncidents(prev => 
      prev.map(inc => inc.id === id ? { ...inc, status: 'Completed' as IncidentStatus } : inc)
    );
  };

  const handleConfirmCancel = (id: number) => {
    setIncidents(prev => 
      prev.map(inc => inc.id === id ? { ...inc, status: 'Cancelled' as IncidentStatus } : inc)
    );
  };

  const handleConfirmAssign = (id: number, unitCallsign: string, unitType: UnitType, notes: string) => {
    setIncidents(prev =>
      prev.map(inc =>
        inc.id === id
          ? { ...inc, status: 'Ongoing' as IncidentStatus, responder: unitCallsign, unitType }
          : inc
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-md mx-auto">
        <div className="text-2xl font-bold text-gray-900 mb-6">Subang Emergency Dispatch</div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6 bg-white p-1 rounded-lg shadow-sm">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 text-sm font-semibold rounded transition ${
                activeTab === tab
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
            <div className="text-center text-gray-500 py-12">No incidents in this category</div>
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