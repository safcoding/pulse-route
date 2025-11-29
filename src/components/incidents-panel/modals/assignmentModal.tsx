import { useState, useEffect } from 'react';
import type { Incident, UnitType } from '~/mockData/types';
import { getHospitals, getAmbulances } from '~/services/api';

interface AssignmentModalProps {
    incident: Incident | null;
    onAssign: (id: number, unitCallsign: string, unitType: UnitType, notes: string) => void;
    onClose: () => void;
}

// Define the actual API response types
interface HospitalFromAPI {
    id: number;
    name: string;
    location: {
        lat: number;
        lng: number;
    };
    capabilities: string[];
    ambulanceCount: number;
    createdAt: string;
    updatedAt: string;
}

interface AmbulanceFromAPI {
    id: number;
    callsign: string;
    type: string;
    status: string;
    hospitalId: number;
    location: {
        lat: number;
        lng: number;
    };
}

export function AssignmentModal({ incident, onAssign, onClose }: AssignmentModalProps) {
    const [step, setStep] = useState(1);
    const [selectedHospital, setSelectedHospital] = useState<number | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [hospitals, setHospitals] = useState<HospitalFromAPI[]>([]);
    const [ambulances, setAmbulances] = useState<AmbulanceFromAPI[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (incident) {
            async function fetchData() {
                setLoading(true);
                try {
                    const [hospitalsData, ambulancesData] = await Promise.all([
                        getHospitals(),
                        getAmbulances()
                    ]);
                    console.log('Hospitals:', hospitalsData);
                    console.log('Ambulances:', ambulancesData);
                    setHospitals(hospitalsData);
                    setAmbulances(ambulancesData);
                } catch (err) {
                    console.error('Failed to fetch data:', err);
                } finally {
                    setLoading(false);
                }
            }
            fetchData();
        }
    }, [incident]);

    if (!incident) return null;

    const handleProceedToStep2 = () => {
        if (selectedHospital !== null) {
            setStep(2);
        }
    };

    const handleFinalAssign = () => {
        if (selectedUnit) {
            const ambulance = ambulances.find(a => a.callsign === selectedUnit);
            onAssign(incident.id, selectedUnit, (ambulance?.type as UnitType) ?? 'BLS', notes);
            // Reset
            setStep(1);
            setSelectedHospital(null);
            setSelectedUnit('');
            setNotes('');
            onClose();
        }
    };

    // Calculate distance (you can implement a proper distance calculation later)
    const calculateDistance = (hospital: HospitalFromAPI) => {
        // Placeholder - replace with actual distance calculation if you have incident location
        return `${(Math.random() * 5 + 1).toFixed(1)} km`;
    };

    // Filter ambulances for selected hospital
    const availableAmbulances = ambulances.filter(
        a => a.hospitalId === selectedHospital && a.status === 'available'
    );

    const renderStep1 = () => (
        <>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Select Hospital</h3>
            <p className="text-gray-600 mb-4">Incident #{incident.id} - {incident.type}</p>

            {loading ? (
                <div className="text-center py-8 text-gray-500">Loading hospitals...</div>
            ) : (
                <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                    {hospitals.map((hospital) => (
                        <div
                            key={hospital.id}
                            onClick={() => setSelectedHospital(hospital.id)}
                            className={`cursor-pointer border rounded-lg p-4 transition ${
                                selectedHospital === hospital.id
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
                Hospital: {hospitals.find(h => h.id === selectedHospital)?.name}
            </p>

            <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Available Ambulances</label>
                {availableAmbulances.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 border border-gray-200 rounded-lg">
                        No ambulances available at this hospital
                    </div>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {availableAmbulances.map((ambulance) => (
                            <div
                                key={ambulance.id}
                                onClick={() => setSelectedUnit(ambulance.callsign)}
                                className={`cursor-pointer border rounded-lg p-3 transition ${
                                    selectedUnit === ambulance.callsign
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-300'
                                }`}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="font-bold text-gray-900">{ambulance.callsign}</span>
                                        <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded">{ambulance.type}</span>
                                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                            {ambulance.status}
                                        </span>
                                    </div>
                                    <div className="text-right text-sm text-gray-600">
                                        <div className="text-green-600 font-semibold">Ready to dispatch</div>
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
                    disabled={!selectedUnit}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
                >
                    Confirm Assignment
                </button>
            </div>
        </>
    );

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 transform transition-all">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
            </div>
        </div>
    );
}