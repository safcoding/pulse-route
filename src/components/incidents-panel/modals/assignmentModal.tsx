import { useState } from 'react';
import type { UIIncident } from '../incidentsPanel';
import { useHospitals, useIncidentCandidates, useAssignAmbulance } from '~/api/hooks';
import type { Hospital } from '~/api/types';

interface AssignmentModalProps {
    incident: UIIncident | null;
    onAssign: (id: string, unitCallsign: string, unitType: string, notes: string) => void;
    onClose: () => void;
}

export function AssignmentModal({ incident, onAssign, onClose }: AssignmentModalProps) {
    const [step, setStep] = useState(1);
    const [selectedHospital, setSelectedHospital] = useState<number | null>(null);
    const [selectedAmbulanceId, setSelectedAmbulanceId] = useState<number | null>(null);
    const [notes, setNotes] = useState('');

    const { data: hospitals = [], isLoading: hospitalsLoading } = useHospitals({
        enabled: !!incident,
    });

    // Fetch ambulance candidates from the backend
    const { data: candidates = [], isLoading: candidatesLoading } = useIncidentCandidates(
        incident?.id ?? '',
        {
            enabled: !!incident && step === 2,
        }
    );

    const assignAmbulance = useAssignAmbulance({
        onSuccess: () => {
            handleReset();
            onClose();
        },
    });

    const loading = hospitalsLoading;

    const handleReset = () => {
        setStep(1);
        setSelectedHospital(null);
        setSelectedAmbulanceId(null);
        setNotes('');
    };

    if (!incident) return null;

    const handleProceedToStep2 = () => {
        if (selectedHospital !== null) {
            setStep(2);
        }
    };

    const handleFinalAssign = () => {
        if (selectedAmbulanceId && incident) {
            const candidate = candidates.find(c => c.id === selectedAmbulanceId);

            // Call the API to assign the ambulance
            assignAmbulance.mutate({
                incidentId: incident.id,
                data: {
                    ambulanceId: selectedAmbulanceId,
                    dispatcherNotes: notes || undefined,
                },
            });

            // Also call the parent callback
            onAssign(incident.id, candidate?.callsign ?? String(selectedAmbulanceId), candidate?.type ?? 'BLS', notes);
        }
    };

    // Calculate distance (placeholder - implement with actual route calculation)
    const calculateDistance = (_hospital: Hospital) => {
        return `${(Math.random() * 5 + 1).toFixed(1)} km`;
    };

    const renderStep1 = () => (
        <>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Select Hospital</h3>
            <p className="text-gray-600 mb-4">Incident #{incident.id} - {incident.type}</p>

            {loading ? (
                <div className="text-center py-8 text-gray-500">Loading hospitals...</div>
            ) : (
                <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                    {hospitals.map((hospital: Hospital) => (
                        <div
                            key={hospital.id}
                            onClick={() => setSelectedHospital(hospital.id)}
                            className={`cursor-pointer border rounded-lg p-4 transition ${selectedHospital === hospital.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-gray-900">{hospital.name}</h4>
                                <span className="text-sm text-gray-500">{calculateDistance(hospital)}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                                <div className="mb-1">
                                    <span className="font-semibold">Ambulances:</span> {hospital.ambulanceCount} available
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {hospital.capabilities.map((cap, idx) => (
                                        <span key={idx} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                            {cap}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-end space-x-3">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition">
                    Cancel
                </button>
                <button
                    onClick={handleProceedToStep2}
                    disabled={selectedHospital === null}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
                >
                    Next: Select Unit
                </button>
            </div>
        </>
    );

    const renderStep2 = () => (
        <>
            <button
                onClick={() => setStep(1)}
                className="mb-4 text-blue-600 hover:underline text-sm font-medium"
            >
                ← Back to Hospital Selection
            </button>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">Assign Unit</h3>
            <p className="text-gray-600 mb-4">
                Hospital: {hospitals.find((h: Hospital) => h.id === selectedHospital)?.name}
            </p>

            <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Available Ambulances</label>
                {candidatesLoading ? (
                    <div className="text-center py-4 text-gray-500">Loading ambulances...</div>
                ) : candidates.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 border border-gray-200 rounded-lg">
                        No ambulances available for this incident
                    </div>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {candidates.map((candidate) => (
                            <div
                                key={candidate.id}
                                onClick={() => setSelectedAmbulanceId(candidate.id)}
                                className={`cursor-pointer border rounded-lg p-3 transition ${selectedAmbulanceId === candidate.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-blue-300'
                                    }`}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="font-bold text-gray-900">{candidate.callsign}</span>
                                        <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded">{candidate.type}</span>
                                        <span className="ml-2 text-xs text-gray-600">
                                            {candidate.hospitalName}
                                        </span>
                                    </div>
                                    <div className="text-right text-sm text-gray-600">
                                        <div className="text-green-600 font-semibold">
                                            ETA: {Math.ceil(candidate.etaSeconds / 60)} min
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {(candidate.distanceMeters / 1000).toFixed(1)} km
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dispatch Notes (Optional)</label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Additional instructions for the responder..."
                />
            </div>

            <div className="flex justify-end space-x-3">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition">
                    Cancel
                </button>
                <button
                    onClick={handleFinalAssign}
                    disabled={!selectedAmbulanceId || assignAmbulance.isPending}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
                >
                    {assignAmbulance.isPending ? 'Assigning...' : 'Confirm Assignment'}
                </button>
            </div>
        </>
    );

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-9999 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 transform transition-all">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
            </div>
        </div>
    );
}