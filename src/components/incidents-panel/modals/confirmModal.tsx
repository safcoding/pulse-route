import type { UIIncident } from '../incidentsPanel';

interface ConfirmationModalProps {
  incident: UIIncident | null;
  onConfirm: (id: string) => void;
  onClose: () => void;
}

export function ConfirmationModal({ incident, onConfirm, onClose }: ConfirmationModalProps) {
  if (!incident) return null;

  const handleConfirm = () => {
    onConfirm(incident.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-9999 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all">
        <h3 className="text-xl font-bold text-red-600 mb-3">Confirm Cancellation</h3>
        <p className="text-gray-700 mb-6">
          Are you sure you want to cancel incident
          <span className="font-semibold block mt-1">#{incident.id} - {incident.type}?</span>
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
          >
            Keep Open
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  );
}