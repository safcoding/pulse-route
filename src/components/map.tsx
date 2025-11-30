'use client'
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Popup, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { 
  MapIcons, 
  getIncidentIcon, 
  getAmbulanceIcon, 
  getHospitalIcon,
  type IncidentSeverity,
  type IncidentStatus,
  type ResponderStatus 
} from "./ui/mapIcons";

// --- Mock Data for Emergency Dispatch ---

// Hospital locations in Subang Jaya area
const hospitals = [
  { id: 1, name: "Subang Jaya Medical Centre (SJMC)", position: [3.0480, 101.5920] as [number, number] },
  { id: 2, name: "Sunway Medical Centre", position: [3.0650, 101.6050] as [number, number] },
];

// Active incidents
const incidents = [
  { 
    id: 1, 
    type: "Medical Distress", 
    severity: "critical" as IncidentSeverity, 
    status: "pending" as IncidentStatus,
    position: [3.0552, 101.5850] as [number, number],
    location: "Jalan USJ 1/20, Subang Jaya"
  },
  { 
    id: 2, 
    type: "Accident", 
    severity: "high" as IncidentSeverity, 
    status: "ongoing" as IncidentStatus,
    position: [3.0620, 101.5780] as [number, number],
    location: "Kesas Highway near Subang Toll"
  },
];

// Ambulance units
const ambulances = [
  { 
    id: 1, 
    callsign: "AMB KKM 12", 
    status: "en_route" as ResponderStatus,
    position: [3.0580, 101.5820] as [number, number],
    assignedIncident: 2
  },
  { 
    id: 2, 
    callsign: "AMB HSA JB 21", 
    status: "available" as ResponderStatus,
    position: [3.0460, 101.5950] as [number, number],
    assignedIncident: null
  },
  { 
    id: 3, 
    callsign: "AMB KKM 15", 
    status: "on_scene" as ResponderStatus,
    position: [3.0620, 101.5780] as [number, number],
    assignedIncident: 2
  },
];

// Route from ambulance to incident (dispatch route)
const dispatchRoutePath: [number, number][] = [
  [3.0500, 101.5900], // Start (near Hospital)
  [3.0510, 101.5890],
  [3.0525, 101.5875],
  [3.0540, 101.5860],
  [3.0552, 101.5850]  // End (Incident)
];

// Route from incident back to hospital (return route)
const returnRoutePath: [number, number][] = [
  [3.0700, 101.5950], // Start (completed incident location)
  [3.0690, 101.5970],
  [3.0675, 101.5990],
  [3.0660, 101.6020],
  [3.0650, 101.6050]  // End (Sunway Medical Centre)
];

export default function Map() { 
  // Dispatch ambulance state
  const [dispatchStep, setDispatchStep] = useState(0);
  const [dispatchAmbulance, setDispatchAmbulance] = useState({
    callsign: "AMB JBWKL 08",
    status: "dispatched" as ResponderStatus,
  });

  // Returning ambulance state
  const [returnStep, setReturnStep] = useState(0);
  const [returnAmbulance, setReturnAmbulance] = useState({
    callsign: "AMB PUTRA 05",
    status: "returning" as ResponderStatus,
  });

  // Animation Logic for dispatch ambulance (going to incident)
  useEffect(() => {
    const interval = setInterval(() => {
      setDispatchStep((prev) => {
        if (prev >= dispatchRoutePath.length - 1) {
          // When arrived, change status to on_scene
          setDispatchAmbulance(amb => ({ ...amb, status: "on_scene" as ResponderStatus }));
          return prev;
        }
        // While moving, status is en_route
        setDispatchAmbulance(amb => ({ ...amb, status: "en_route" as ResponderStatus }));
        return prev + 1;
      });
    }, 1500); // Move every 1.5 seconds

    return () => clearInterval(interval);
  }, []);

  // Animation Logic for returning ambulance (going back to hospital)
  useEffect(() => {
    const interval = setInterval(() => {
      setReturnStep((prev) => {
        if (prev >= returnRoutePath.length - 1) {
          // When arrived at hospital, change status to available
          setReturnAmbulance(amb => ({ ...amb, status: "available" as ResponderStatus }));
          return prev;
        }
        return prev + 1;
      });
    }, 1800); // Move every 1.8 seconds (slightly slower)

    return () => clearInterval(interval);
  }, []);

  // Dispatch ambulance position and remaining path
  const dispatchPosition = dispatchRoutePath[dispatchStep] ?? dispatchRoutePath[dispatchRoutePath.length - 1]!;
  const dispatchRemainingPath = dispatchRoutePath.slice(dispatchStep);

  // Return ambulance position and remaining path
  const returnPosition = returnRoutePath[returnStep] ?? returnRoutePath[returnRoutePath.length - 1]!;
  const returnRemainingPath = returnRoutePath.slice(returnStep);

  return(
    <MapContainer 
      center={[3.0580, 101.5920]} // Center on Subang Jaya
      zoom={14} 
      scrollWheelZoom={true}   
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {/* Dispatch Route Line - Purple dashed (to incident) */}
      {dispatchRemainingPath.length > 1 && (
        <Polyline 
          positions={dispatchRemainingPath} 
          color="#8B5CF6" 
          weight={4} 
          opacity={0.7}
          dashArray="10, 10"
        />
      )}

      {/* Return Route Line - Gray dashed (back to hospital) */}
      {returnRemainingPath.length > 1 && (
        <Polyline 
          positions={returnRemainingPath} 
          color="#6B7280" 
          weight={4} 
          opacity={0.7}
          dashArray="10, 10"
        />
      )}

      {/* Hospital Markers */}
      {hospitals.map((hospital) => (
        <Marker 
          key={`hospital-${hospital.id}`}
          position={hospital.position} 
          icon={MapIcons.hospital}
        >
          <Popup>
            <div className="font-semibold text-red-600">{hospital.name}</div>
            <div className="text-sm text-gray-600">Emergency Department</div>
          </Popup>
        </Marker>
      ))}

      {/* Incident Markers */}
      {incidents.map((incident) => (
        <Marker 
          key={`incident-${incident.id}`}
          position={incident.position} 
          icon={getIncidentIcon(incident.severity, incident.status)}
        >
          <Popup>
            <div className="font-bold text-gray-800">{incident.type}</div>
            <div className="text-sm text-gray-600">{incident.location}</div>
            <div className={`text-xs mt-1 font-semibold ${
              incident.status === 'pending' ? 'text-red-600' : 
              incident.status === 'ongoing' ? 'text-yellow-600' : 'text-green-600'
            }`}>
              Status: {incident.status.toUpperCase()}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Static Ambulance Markers */}
      {ambulances.map((ambulance) => (
        <Marker 
          key={`ambulance-${ambulance.id}`}
          position={ambulance.position} 
          icon={getAmbulanceIcon(ambulance.status)}
        >
          <Popup>
            <div className="font-bold text-indigo-700">{ambulance.callsign}</div>
            <div className={`text-sm font-semibold ${
              ambulance.status === 'available' ? 'text-green-600' :
              ambulance.status === 'en_route' ? 'text-purple-600' :
              ambulance.status === 'on_scene' ? 'text-orange-600' : 'text-gray-600'
            }`}>
              {ambulance.status.replace('_', ' ').toUpperCase()}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Animated Moving Ambulance - Dispatch (going to incident) */}
      <Marker 
        position={dispatchPosition} 
        icon={getAmbulanceIcon(dispatchAmbulance.status)}
      >
        <Popup>
          <div className="font-bold text-indigo-700">{dispatchAmbulance.callsign}</div>
          <div className={`text-sm font-semibold ${
            dispatchAmbulance.status === 'en_route' ? 'text-purple-600' : 'text-orange-600'
          }`}>
            {dispatchAmbulance.status === 'en_route' ? 'EN ROUTE TO INCIDENT' : 'ON SCENE'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Responding to: Medical Distress
          </div>
        </Popup>
      </Marker>

      {/* Animated Moving Ambulance - Return (going back to hospital) */}
      <Marker 
        position={returnPosition} 
        icon={getAmbulanceIcon(returnAmbulance.status)}
      >
        <Popup>
          <div className="font-bold text-indigo-700">{returnAmbulance.callsign}</div>
          <div className={`text-sm font-semibold ${
            returnAmbulance.status === 'returning' ? 'text-gray-600' : 'text-green-600'
          }`}>
            {returnAmbulance.status === 'returning' ? 'RETURNING TO HOSPITAL' : 'AVAILABLE'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Destination: Sunway Medical Centre
          </div>
        </Popup>
      </Marker>

    </MapContainer>
  );
}