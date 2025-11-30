import { useMemo } from 'react';
import type { UIIncident } from './incidentsPanel';
import { StatusTag } from './StatusTag';

interface IncidentCardProps {
  incident: UIIncident;
  onAssignClick: (incident: UIIncident) => void;
  onComplete: (id: string) => void;
  onCancelClick: (incident: UIIncident) => void;
}

export function IncidentCard({ incident, onAssignClick, onComplete, onCancelClick }: IncidentCardProps) {
  const isPending = incident.status === 'Pending';
  const isOngoing = incident.status === 'Ongoing';
  const isCompleted = incident.status === 'Completed';

  const cardBorderClass = useMemo(() => {
    if (isPending) return 'border-l-4 border-l-red-500';
    if (isOngoing) return 'border-l-4 border-l-yellow-500';
    if (isCompleted) return 'border-l-4 border-l-green-500';
    return 'border-l-4 border-l-gray-300';
  }, [isPending, isOngoing, isCompleted]);

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow ${cardBorderClass}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{incident.type}</h3>
          <p className="text-xs text-gray-500">{incident.time}</p>
        </div>
        <StatusTag status={incident.status} />
      </div>

      <div className="space-y-1 text-sm text-gray-700 mb-3">
        <div className="flex items-start">
          <span className="font-semibold mr-2">📍</span>
          <span>{incident.location}</span>
        </div>
        <div className="flex items-start">
          <span className="font-semibold mr-2">📞</span>
          <span>{incident.caller}</span>
        </div>
        {incident.responder && (
          <div className="flex items-start">
            <span className="font-semibold mr-2">🚑</span>
            <span className="text-blue-600 font-medium">{incident.responder}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-3">
        {isPending && (
          <>
            <button
              onClick={() => onAssignClick(incident)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-3 rounded transition"
            >
              Assign Unit
            </button>
            <button
              onClick={() => onCancelClick(incident)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold py-2 px-3 rounded transition"
            >
              Cancel
            </button>
          </>
        )}

        {isOngoing && (
          <button
            onClick={() => onComplete(incident.id)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 px-3 rounded transition"
          >
            Mark Complete
          </button>
        )}

        {isCompleted && (
          <div className="w-full text-center text-sm text-gray-500 py-2">
            ✅ Incident Resolved
          </div>
        )}
      </div>
    </div>
  );
}