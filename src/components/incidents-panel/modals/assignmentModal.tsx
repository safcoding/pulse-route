import { useState } from 'react';
import type { Incident, UnitType } from '~/components/mockData/types';
import { MOCK_HOSPITALS, MOCK_AVAILABLE_UNITS } from '~/components/mockData/incidents';

interface AssignmentModalProps {
    incident: Incident | null;
    onAssign: (id: number, unitCallsign: string, unitType: UnitType, notes: string) => void;
    onClose: () => void;
}

export function AssignmentModal({ incident, onAssign, onClose }: AssignmentModalProps) {
    const [step, setStep] = useState(1);
    const [selectedHospital, setSelectedHospital] = useState<number | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<string>('');
    const [notes, setNotes] = useState('');

    if (!incident) return null;

    const handleProceedToStep2 = () => {
        if (selectedHospital !== null) {
            setStep(2);
        }
    };

    const handleFinalAssign = () => {
        if (selectedUnit) {
            const unitDetail = MOCK_AVAILABLE_UNITS.find(u => u.callsign === selectedUnit);
            onAssign(incident.id, selectedUnit, unitDetail?.type ?? 'BLS', notes);
            // Reset
            setStep(1);
            setSelectedHospital(null);
            setSelectedUnit('');
            setNotes('');
            onClose();
        }
    };

    const renderStep1 = () => (
        <>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Select Hospital</h3>
            <p className="text-gray-600 mb-4">Incident #{incident.id} - {incident.type}</p>

            <div className="space-y-3 mb-6">
                {MOCK_HOSPITALS.map((hospital) => (
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
                            <span className="text-sm text-gray-500">{hospital.distance}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                            {hospital.availableUnits.map((unit, idx) => (
                                <div key={idx}>
                                    <span className="font-semibold">{unit.type}:</span> {unit.count} units ({unit.description})
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

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
                Hospital: {MOCK_HOSPITALS.find(h => h.id === selectedHospital)?.name}
            </p>

            <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Available Units</label>
                <div className="space-y-2">
                    {MOCK_AVAILABLE_UNITS.map((unit) => (
                        <div
                            key={unit.callsign}
                            onClick={() => setSelectedUnit(unit.callsign)}
                            className={`cursor-pointer border rounded-lg p-3 transition ${
                                selectedUnit === unit.callsign
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-blue-300'
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="font-bold text-gray-900">{unit.callsign}</span>
                                    <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded">{unit.type}</span>
                                </div>
                                <div className="text-right text-sm text-gray-600">
                                    <div>{unit.distanceKm} km away</div>
                                    <div className="text-green-600 font-semibold">ETA: {unit.etaMinutes} min</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
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