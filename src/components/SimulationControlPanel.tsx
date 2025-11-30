import { useState } from 'react';
import { useCreateScenario } from '~/api/hooks';

interface SimulationControlPanelProps {
    onScenarioCreated?: () => void;
}

export function SimulationControlPanel({ onScenarioCreated }: SimulationControlPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [latitude, setLatitude] = useState('3.1390');
    const [longitude, setLongitude] = useState('101.6869');
    const [description, setDescription] = useState('');

    const createScenario = useCreateScenario({
        onSuccess: () => {
            // Reset form
            setDescription('');
            setIsOpen(false);
            onScenarioCreated?.();
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        createScenario.mutate({
            lat: parseFloat(latitude),
            lng: parseFloat(longitude),
            description,
        });
    };

    const handleSetCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLatitude(position.coords.latitude.toFixed(4));
                    setLongitude(position.coords.longitude.toFixed(4));
                },
                (error) => {
                    console.error('Error getting location:', error);
                    alert('Unable to get current location');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser');
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-9999 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-3 rounded-full shadow-lg font-bold text-sm flex items-center gap-2 transition-all hover:scale-105"
                title="God Mode - Create Simulation Scenario"
            >
                <span className="text-xl">⚡</span>
                God Mode
            </button>

            {/* Modal/Popover */}
            {isOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-9998 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-2xl">⚡</span>
                                Create Scenario
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Location
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <input
                                                type="number"
                                                step="0.0001"
                                                value={latitude}
                                                onChange={(e) => setLatitude(e.target.value)}
                                                placeholder="Latitude"
                                                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="number"
                                                step="0.0001"
                                                value={longitude}
                                                onChange={(e) => setLongitude(e.target.value)}
                                                placeholder="Longitude"
                                                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleSetCurrentLocation}
                                        className="mt-2 text-xs text-purple-600 hover:text-purple-700 font-medium"
                                    >
                                        📍 Use my current location
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Incident Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe the emergency (e.g., 'Man collapsed, chest pain, difficulty breathing')"
                                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        rows={4}
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        AI will analyze this to determine incident category, severity, and triage type
                                    </p>
                                </div>

                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                    <p className="text-xs text-gray-700">
                                        <span className="font-semibold">What happens next:</span>
                                        <br />
                                        1. AI analyzes the description
                                        <br />
                                        2. Creates a user and incident
                                        <br />
                                        3. Broadcasts to all dispatchers
                                        <br />
                                        4. Appears instantly on the map
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createScenario.isPending}
                                    className="px-4 py-2 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
                                >
                                    {createScenario.isPending ? 'Creating...' : '⚡ Create Scenario'}
                                </button>
                            </div>

                            {createScenario.isError && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-700">
                                        Error: {createScenario.error instanceof Error ? createScenario.error.message : 'Failed to create scenario'}
                                    </p>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
