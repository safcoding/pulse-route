import React, { useState, useMemo } from 'react';

// --- TYPE DEFINITIONS ---
type IncidentStatus = 'Pending' | 'Ongoing' | 'Completed' | 'Cancelled';
type UnitType = 'BLS' | 'ALS' | 'CCT' | 'MICU';

interface HospitalUnit {
    type: UnitType;
    count: number;
    description: string;
}

interface Hospital {
    id: number;
    name: string;
    distance: string; // From the current incident location
    availableUnits: HospitalUnit[];
}

interface UnitDetail {
    callsign: string;
    distanceKm: number;
    etaMinutes: number;
    type: UnitType;
}

interface Incident {
  id: number;
  type: string;
  status: IncidentStatus;
  time: string;
  location: string;
  caller: string;
  responder: string | null;
  unitType: UnitType;
}

interface StatusTagProps {
  status: IncidentStatus;
}

interface IncidentCardProps {
  incident: Incident;
  // onAssignClick opens the assignment modal
  onAssignClick: (incident: Incident) => void;
  // onComplete handles direct completion
  onComplete: (id: number) => void;
  // onCancelClick opens the confirmation modal
  onCancelClick: (incident: Incident) => void;
}

// --- MOCK DATA ---
const initialIncidents: Incident[] = [
  {
    id: 1,
    type: "Medical Distress",
    status: "Pending",
    time: "5 mins ago",
    location: "Jalan USJ 1/20, Subang Jaya",
    caller: "Sarah Johnson",
    responder: null,
    unitType: "BLS",
  },
  {
    id: 2,
    type: "Accident",
    status: "Ongoing",
    time: "12 mins ago",
    location: "Kesas Highway near Subang Toll",
    caller: "Mike Davis",
    responder: "AMB KKM 12",
    unitType: "BLS",
  },
  {
    id: 3,
    type: "Structural Collapse",
    status: "Pending",
    time: "18 mins ago",
    location: "Taman Perindustrian USJ 1",
    caller: "Building Manager",
    responder: null,
    unitType: "ALS",
  },
  {
    id: 4,
    type: "Cardiac Arrest",
    status: "Completed",
    time: "45 mins ago",
    location: "SS15, Subang Jaya",
    caller: "Witness",
    responder: "AMB HSA JB 21",
    unitType: "ALS",
  },
  {
    id: 5,
    type: "Vehicle Fire",
    status: "Cancelled",
    time: "50 mins ago",
    location: "LDP Puchong",
    caller: "Police Officer",
    responder: null,
    unitType: "ALS",
  },
];

const MOCK_HOSPITALS: Hospital[] = [
    {
        id: 101,
        name: "Subang Jaya Medical Centre (SJMC)",
        distance: "3.5 km (Closest)",
        availableUnits: [
            { type: 'BLS', count: 3, description: 'Basic Life Support' },
            { type: 'ALS', count: 1, description: 'Advanced Life Support' },
            { type: 'CCT', count: 0, description: 'Critical Care Transport' },
            { type: 'MICU', count: 0, description: 'Mobile Intensive Care Unit' },
        ]
    },
    {
        id: 102,
        name: "Sunway Medical Centre",
        distance: "5.1 km",
        availableUnits: [
            { type: 'BLS', count: 1, description: 'Basic Life Support' },
            { type: 'ALS', count: 2, description: 'Advanced Life Support' },
            { type: 'CCT', count: 1, description: 'Critical Care Transport' },
            { type: 'MICU', count: 0, description: 'Mobile Intensive Care Unit' },
        ]
    },
];

// Mock Available Units for Step 2
const MOCK_AVAILABLE_UNITS: UnitDetail[] = [
    { callsign: "AMB KKM 15", distanceKm: 1.2, etaMinutes: 3, type: "BLS" },
    { callsign: "AMB JBWKL 08", distanceKm: 2.1, etaMinutes: 5, type: "BLS" },
    { callsign: "AMB HSA JB 33", distanceKm: 3.5, etaMinutes: 7, type: "BLS" },
    { callsign: "AMB KKM 42", distanceKm: 1.8, etaMinutes: 4, type: "ALS" },
    { callsign: "AMB JBWKL 01", distanceKm: 4.1, etaMinutes: 9, type: "ALS" },
    { callsign: "AMB PUTRA 02", distanceKm: 2.5, etaMinutes: 6, type: "CCT" },
];

// --- UTILITY COMPONENTS ---

const StatusTag: React.FC<StatusTagProps> = ({ status }) => {
  let color = '';
  const text = status;

  if (status === 'Pending') {
    color = 'bg-red-100 text-red-700';
  } else if (status === 'Ongoing') {
    color = 'bg-yellow-100 text-yellow-700';
  } else if (status === 'Completed') {
    color = 'bg-green-100 text-green-700';
  } else if (status === 'Cancelled') {
    color = 'bg-gray-200 text-gray-600';
  }

  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${color}`}>
      {text}
    </span>
  );
};

// ... (ConfirmationModal component remains the same)
const ConfirmationModal: React.FC<{
  incident: Incident | null;
  onConfirm: (id: number) => void;
  onClose: () => void;
}> = ({ incident, onConfirm, onClose }) => {
  if (!incident) return null;

  const handleConfirm = () => {
    onConfirm(incident.id);
    onClose();
  };

  return (
    // Modal Overlay
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
      {/* Modal Content */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all">
        <h3 className="text-xl font-bold text-red-600 mb-3">Confirm Cancellation</h3>
        <p className="text-gray-700 mb-6">
          Are you sure you want to cancel the incident: 
          <span className="font-semibold block mt-1">
            #{incident.id} - {incident.type} at {incident.location}?
          </span>
        </p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
          >
            Keep Open
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition shadow-md"
          >
            Yes, Cancel Incident
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Assignment Modal with Multi-Step Logic ---

const AssignmentModal: React.FC<{
    incident: Incident | null;
    onAssign: (id: number, unitCallsign: string, unitType: UnitType, notes: string) => void;
    onClose: () => void;
}> = ({ incident, onAssign, onClose }) => {
    
    // Step state: 1 (Select Type/Hospital), 2 (Select Specific Unit)
    const [step, setStep] = useState(1);

    const defaultHospitalId = MOCK_HOSPITALS.length > 0 ? MOCK_HOSPITALS[0].id : 0;
    
    // Form state storage
    const [selectedHospitalId, setSelectedHospitalId] = useState<number>(defaultHospitalId);
    const [selectedUnitType, setSelectedUnitType] = useState<UnitType>(incident?.unitType || 'BLS');
    const [notes, setNotes] = useState<string>('');
    const [selectedCallsign, setSelectedCallsign] = useState<string | null>(null);

    // Initial checks and early return
    if (MOCK_HOSPITALS.length === 0) return null;
    if (!incident) return null;

    const selectedHospital = MOCK_HOSPITALS.find(h => h.id === selectedHospitalId) || MOCK_HOSPITALS[0];
    const unitOptions = selectedHospital.availableUnits;
    
    // --- Handlers ---

    const handleHospitalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = parseInt(e.target.value);
        setSelectedHospitalId(id);
        setSelectedCallsign(null); // Reset callsign selection
        
        const newHospital = MOCK_HOSPITALS.find(h => h.id === id);
        const currentUnitAvailable = newHospital?.availableUnits.some(u => u.type === selectedUnitType && u.count > 0);
        
        if (!currentUnitAvailable && newHospital) {
            const firstAvailable = newHospital.availableUnits.find(u => u.count > 0)?.type || 'BLS';
            setSelectedUnitType(firstAvailable);
        }
    };
    
    // Proceed from Step 1 (Type Selection) to Step 2 (Unit Selection)
    const handleNextStep = () => {
        // Ensure the selected type has units available (in the mock unit pool)
        if (MOCK_AVAILABLE_UNITS.filter(u => u.type === selectedUnitType).length > 0) {
            setStep(2);
        } else {
            // Placeholder error handling for no units available
            console.error(`No specific ${selectedUnitType} units available in the mock pool for assignment.`);
            // In a real app, this would show an inline error message.
        }
    };
    
    // Final assignment from Step 2
    const handleFinalAssign = () => {
        if (selectedCallsign) {
            // Note: The `hospitalId` is no longer passed to the main onAssign function,
            // as the callsign is the definitive ID.
            onAssign(incident.id, selectedCallsign, selectedUnitType, notes);
            setStep(1); // Reset step state
            onClose();
        }
    };
    
    // --- Step 1: Hospital & Unit Type Selection ---
    const renderStep1 = () => {
        // We check if the currently selected unit type has any available count in the selected hospital.
        const isNextDisabled = unitOptions.find(u => u.type === selectedUnitType)?.count === 0;

        return (
            <>
                <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Step 1: Select Unit Type for Incident #{incident.id}</h3>

                {/* Hospital Selection Dropdown */}
                <div className="mb-6">
                    <label htmlFor="hospital-select" className="block text-sm font-semibold text-gray-700 mb-2">Select Dispatch Hospital</label>
                    <div className="relative">
                        <select
                            id="hospital-select"
                            value={selectedHospitalId}
                            onChange={handleHospitalChange}
                            className="w-full border border-gray-300 rounded-lg p-3 appearance-none focus:ring-indigo-500 focus:border-indigo-500 transition bg-white pr-10"
                        >
                            {MOCK_HOSPITALS.map((hospital) => (
                                <option key={hospital.id} value={hospital.id}>
                                    {hospital.name} ({hospital.distance})
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Select Unit Type */}
                <div className="mb-6">
                    <p className="font-semibold text-gray-700 mb-3">Select Required Unit Type</p>
                    <div className="space-y-3">
                        {unitOptions.map((unit) => (
                            <button
                                key={unit.type}
                                onClick={() => {
                                    setSelectedUnitType(unit.type);
                                    setSelectedCallsign(null); // Reset callsign when type changes
                                }}
                                disabled={unit.count === 0}
                                className={`w-full p-4 border rounded-xl text-left transition duration-150 flex justify-between items-center ${
                                    selectedUnitType === unit.type
                                        ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500'
                                        : unit.count > 0 
                                            ? 'border-gray-200 bg-white hover:border-indigo-300'
                                            : 'border-red-300 bg-red-50 opacity-60 cursor-not-allowed'
                                }`}
                            >
                                <div>
                                    <span className="font-bold text-base">{unit.type}</span>
                                    <span className="ml-2 text-gray-600">({unit.description})</span>
                                </div>
                                <span className={`text-sm font-semibold ${unit.count > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {unit.count > 0 ? `${unit.count} Available` : 'Unavailable'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Description/Notes */}
                <div className="mb-6">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                    <textarea
                        id="notes"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any additional notes for the responder..."
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
                    ></textarea>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleNextStep}
                        disabled={isNextDisabled}
                        className={`px-6 py-2 text-white font-bold rounded-lg transition shadow-md ${
                            isNextDisabled
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                    >
                        Next
                    </button>
                </div>
            </>
        );
    };

    // --- Step 2: Specific Unit Selection ---
    const renderStep2 = () => {
        const availableUnits = MOCK_AVAILABLE_UNITS
            .filter(u => u.type === selectedUnitType)
            // Sort by Estimated Time of Arrival (ETA)
            .sort((a, b) => a.etaMinutes - b.etaMinutes);
            
        const isAssignDisabled = !selectedCallsign;

        return (
            <>
                <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Step 2: Select {selectedUnitType} Unit</h3>
                <p className="text-sm text-gray-600 mb-4">Available units sorted by estimated arrival time (ETA).</p>

                {/* Unit List */}
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {availableUnits.map((unit) => (
                        <button
                            key={unit.callsign}
                            onClick={() => setSelectedCallsign(unit.callsign)}
                            className={`w-full p-4 border rounded-xl text-left transition duration-150 flex justify-between items-center ${
                                selectedCallsign === unit.callsign
                                    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500'
                                    : 'border-gray-200 bg-white hover:border-indigo-300'
                            }`}
                        >
                            <div className="flex items-center space-x-4">
                                {/* Unit Icon/Avatar Placeholder */}
                                <div className="h-10 w-10 flex items-center justify-center bg-indigo-100 text-indigo-700 font-bold rounded-full text-sm">
                                    {unit.callsign.split(' ').pop()}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">{unit.callsign}</p>
                                    <p className="text-xs text-gray-500">{unit.distanceKm.toFixed(1)} km away</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-indigo-600">{unit.etaMinutes} MINS</p>
                                <p className="text-xs text-green-600">Available</p>
                            </div>
                        </button>
                    ))}
                    {availableUnits.length === 0 && (
                         <div className="text-center p-4 text-gray-500 border border-dashed rounded-lg">
                            No specific {selectedUnitType} units are currently tracked for dispatch.
                         </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between space-x-3 pt-6 border-t mt-6">
                    <button
                        onClick={() => {
                            setStep(1);
                            setSelectedCallsign(null);
                        }}
                        className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleFinalAssign}
                        disabled={isAssignDisabled}
                        className={`px-6 py-2 text-white font-bold rounded-lg transition shadow-md ${
                            isAssignDisabled
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700'
                        }`}
                    >
                        Assign {selectedCallsign || 'Unit'} & Dispatch
                    </button>
                </div>
            </>
        );
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 transform transition-all">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
            </div>
        </div>
    );
};


const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onAssignClick, onComplete, onCancelClick }) => {
  const isPending = incident.status === 'Pending';
  const isOngoing = incident.status === 'Ongoing';
  const isInactive = incident.status === 'Completed' || incident.status === 'Cancelled';

  // Determine card appearance for inactive incidents in the 'All' list
  const cardClasses = isInactive 
    ? "bg-gray-100 p-4 mb-4 rounded-xl shadow-md border border-gray-200 opacity-70"
    : "bg-white p-4 mb-4 rounded-xl shadow-lg border border-gray-100";

  const actionButton = useMemo(() => {
    if (isPending) {
      return (
        <div className="flex space-x-2">
          <button
            onClick={() => onAssignClick(incident)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-150 shadow-md"
          >
            Assign Unit
          </button>
          <button
            onClick={() => onCancelClick(incident)} 
            className="w-12 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-lg transition duration-150 shadow-md text-xl"
            title="Cancel Incident"
          >
            &times;
          </button>
        </div>
      );
    }
    if (isOngoing) {
      return (
        <button
          onClick={() => onComplete(incident.id)}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-150 shadow-md"
        >
          Mark Completed
        </button>
      );
    }
    return (
      <button
        disabled
        className="w-full bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg cursor-not-allowed"
      >
        {incident.status}
      </button>
    );
  }, [incident, isPending, isOngoing, onAssignClick, onComplete, onCancelClick]);

  return (
    <div className={cardClasses}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-800">{incident.type}</h3>
        <StatusTag status={incident.status} />
      </div>

      <div className="text-sm text-gray-600 space-y-1 mb-4">
        <p>
          <span className="font-medium text-gray-500 mr-2">Time:</span>
          {incident.time}
        </p>
        <p>
          <span className="font-medium text-gray-500 mr-2">Location:</span>
          {incident.location}
        </p>
        <p>
          <span className="font-medium text-gray-500 mr-2">Caller:</span>
          {incident.caller}
        </p>
        
        {/* Unit and Responder details only appear once the incident is NOT Pending */}
        {incident.status !== 'Pending' && (
            <>
                {incident.responder && (
                  <p>
                    <span className="font-medium text-gray-500 mr-2">Unit:</span>
                    <span className="font-bold text-gray-800">{incident.responder}</span> 
                  </p>
                )}
                <p>
                  <span className="font-medium text-gray-500 mr-2">Unit Type:</span>
                  {incident.unitType}
                </p>
            </>
        )}
      </div>

      {!isInactive && actionButton}
      {isInactive && (
          <div className="pt-2 border-t mt-2 text-xs text-gray-500 text-center">
              Incident marked as {incident.status.toLowerCase()}.
          </div>
      )}
    </div>
  );
};

// --- MAIN APPLICATION COMPONENT ---
export default function App() {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [activeTab, setActiveTab] = useState<string>('All');
  
  const [incidentToCancel, setIncidentToCancel] = useState<Incident | null>(null);
  const [incidentToAssign, setIncidentToAssign] = useState<Incident | null>(null);

  interface Tab {
      name: string;
      status?: IncidentStatus;
      count: number;
  }

  // Calculate tab counts based on current state
  const tabs: Tab[] = useMemo(() => [
    // Count active incidents for the 'All' badge
    { name: 'All', count: incidents.filter(i => i.status === 'Pending' || i.status === 'Ongoing').length },
    { name: 'Pending Incident', status: 'Pending', count: incidents.filter(i => i.status === 'Pending').length },
    { name: 'Ongoing', status: 'Ongoing', count: incidents.filter(i => i.status === 'Ongoing').length },
    // NEW: Add Completed Tab
    { name: 'Completed', status: 'Completed', count: incidents.filter(i => i.status === 'Completed').length },
  ], [incidents]);

  const filteredIncidents = useMemo((): Incident[] => {
    if (activeTab === 'All') {
      // REQUIREMENT 2: Show all incidents, sorted with active ones first.
      const activeIncidents = incidents.filter(i => i.status === 'Pending' || i.status === 'Ongoing');
      const inactiveIncidents = incidents.filter(i => i.status === 'Completed' || i.status === 'Cancelled');
      
      // Sort active (e.g., oldest first for urgency)
      activeIncidents.sort((a, b) => a.id - b.id);
      // Sort inactive (e.g., newest completed/cancelled at the top of the inactive block)
      inactiveIncidents.sort((a, b) => b.id - a.id); 

      return [...activeIncidents, ...inactiveIncidents];
    }
    
    const targetTab = tabs.find(t => t.name === activeTab);
    
    if (targetTab && targetTab.status) {
        // Filter by the specific status (Pending, Ongoing, or Completed)
        return incidents.filter(i => i.status === targetTab.status);
    }
    return []; 
  }, [activeTab, incidents, tabs]); 
  
  // Handlers for Modals
  
  const handleOpenCancelModal = (incident: Incident) => {
      setIncidentToCancel(incident);
  };
  
  const handleCloseCancelModal = () => {
      setIncidentToCancel(null);
  };

  const handleConfirmCancel = (id: number): void => {
      setIncidents(prev => 
        prev.map(i => {
            if (i.id === id) {
                return { ...i, status: 'Cancelled' as IncidentStatus };
            }
            return i;
        })
      );
  };
  
  const handleOpenAssignModal = (incident: Incident) => {
      setIncidentToAssign(incident);
  };
  
  const handleCloseAssignModal = () => {
      setIncidentToAssign(null);
  };

  // Handler for marking incident as completed
  const handleComplete = (id: number): void => {
    // REQUIREMENT 1: Incident status is updated to 'Completed'
    setIncidents(prev => 
      prev.map(i => {
        if (i.id === id) {
          return { ...i, status: 'Completed' as IncidentStatus };
        }
        return i;
      })
    );
    // Optionally switch to 'Completed' tab after completion
    setActiveTab('Completed'); 
  };
  
  // Updated Handler for assignment confirmation from modal
  const handleConfirmAssign = (id: number, unitCallsign: string, unitType: UnitType, notes: string): void => {
    setIncidents(prev => 
      prev.map(i => {
        if (i.id === id) {
          return { 
            ...i, 
            status: 'Ongoing' as IncidentStatus, 
            responder: unitCallsign,
            unitType: unitType, 
          };
        }
        return i;
      })
    );
  };


  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-md mx-auto">
        <div className="text-2xl font-bold text-gray-900 mb-6">Subang Emergency Dispatch</div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`pb-3 text-sm font-medium transition duration-150 ${
                activeTab === tab.name
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.name} 
              {/* Only show badge if count > 0, except for Completed which always shows count */}
              {tab.count > 0 && (
                <span className={`ml-1 px-2 py-0.5 text-xs font-bold rounded-full ${
                    tab.name === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Incident List */}
        <div className="space-y-4">
          {filteredIncidents.length > 0 ? (
            filteredIncidents.map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                onAssignClick={handleOpenAssignModal}
                onComplete={handleComplete}
                onCancelClick={handleOpenCancelModal} 
              />
            ))
          ) : (
            <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-100 text-gray-500">
              No {activeTab === 'All' ? 'active' : activeTab.toLowerCase()} incidents at this time.
            </div>
          )}
        </div>
      </div>
      
      {/* Assignment Modal Render */}
      <AssignmentModal
        incident={incidentToAssign}
        onAssign={handleConfirmAssign}
        onClose={handleCloseAssignModal}
      />
      
      {/* Confirmation Modal Render */}
      <ConfirmationModal
        incident={incidentToCancel}
        onConfirm={handleConfirmCancel}
        onClose={handleCloseCancelModal}
      />
    </div>
  );
}