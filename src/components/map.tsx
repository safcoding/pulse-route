'use client'
import { useMemo } from "react";
import { MapContainer, TileLayer, Popup, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  getIncidentIcon,
  getAmbulanceIcon,
  getHospitalIcon,
  type IncidentSeverity,
  type IncidentStatus,
  type ResponderStatus
} from "./ui/mapIcons";
import { useHospitals, useAmbulances, useActiveIncidents, useAmbulanceMovement } from "~/api/hooks";
import type { Ambulance, Incident, AmbulanceStatus, IncidentStatus as ApiIncidentStatus } from "~/api/types";

// Map API statuses to UI types
function mapAmbulanceStatus(status: AmbulanceStatus): ResponderStatus {
  const mapping: Record<AmbulanceStatus, ResponderStatus> = {
    'IDLE': 'available',
    'EN_ROUTE': 'en_route',
    'ON_SCENE': 'on_scene',
    'TRANSPORTING': 'returning',
  };
  return mapping[status];
}

function mapIncidentStatus(status: ApiIncidentStatus): IncidentStatus {
  const mapping: Partial<Record<ApiIncidentStatus, IncidentStatus>> = {
    'PENDING': 'pending',
    'ASSIGNED': 'ongoing',
    'DISPATCHED': 'ongoing',
    'EN_ROUTE': 'ongoing',
    'ARRIVED': 'ongoing',
    'TRANSPORTING': 'ongoing',
    'COMPLETED': 'completed',
    'CANCELLED': 'cancelled',
  };
  return mapping[status] ?? 'pending';
}

function getIncidentSeverity(_incident: Incident): IncidentSeverity {
  // This could be based on triage type or other factors
  // For now, return 'high' as default
  return 'high';
}

export default function Map() {
  const { data: hospitals = [], isLoading: hospitalsLoading } = useHospitals();
  const { data: ambulances = [], isLoading: ambulancesLoading } = useAmbulances();
  const { data: incidents = [], isLoading: incidentsLoading } = useActiveIncidents();

  // Use ambulance movement hook for smooth transitions
  const ambulancePositions = useAmbulanceMovement(ambulances);

  // Calculate center of map based on incidents or default to Kuala Lumpur
  const mapCenter: [number, number] = useMemo(() => {
    if (incidents.length > 0) {
      const firstIncident = incidents.find(inc =>
        (inc.location?.lat && inc.location?.lng) || (inc.lat && inc.lng)
      );
      if (firstIncident) {
        const lat = firstIncident.location?.lat ?? firstIncident.lat;
        const lng = firstIncident.location?.lng ?? firstIncident.lng;
        if (lat !== undefined && lng !== undefined) {
          return [lat, lng];
        }
      }
    }
    return [3.1390, 101.6869]; // Default: KL center
  }, [incidents]);

  if (hospitalsLoading || ambulancesLoading || incidentsLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading map data...</div>
      </div>
    );
  }

  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {/* Hospital Markers */}
      {hospitals.map((hospital) => (
        <Marker
          key={`hospital-${hospital.id}`}
          position={[hospital.location.lat, hospital.location.lng]}
          icon={getHospitalIcon()}
        >
          <Popup>
            <div className="font-semibold text-red-600">{hospital.name}</div>
            <div className="text-sm text-gray-600">
              Ambulances: {hospital.ambulanceCount}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Capabilities: {hospital.capabilities.join(', ')}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Incident Markers */}
      {incidents
        .filter(incident => {
          const lat = incident.location?.lat ?? incident.lat;
          const lng = incident.location?.lng ?? incident.lng;
          return lat !== undefined && lng !== undefined;
        })
        .map((incident) => {
          const lat = incident.location?.lat ?? incident.lat!;
          const lng = incident.location?.lng ?? incident.lng!;

          return (
            <Marker
              key={`incident-${incident.id}`}
              position={[lat, lng]}
              icon={getIncidentIcon(getIncidentSeverity(incident), mapIncidentStatus(incident.status))}
            >
              <Popup>
                <div className="font-bold text-gray-800">{incident.triage}</div>
                <div className="text-sm text-gray-600">
                  {lat.toFixed(4)}, {lng.toFixed(4)}
                </div>
                {incident.description && (
                  <div className="text-xs text-gray-500 mt-1">{incident.description}</div>
                )}
                <div className={`text-xs mt-1 font-semibold ${incident.status === 'PENDING' ? 'text-red-600' :
                    incident.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                  Status: {incident.status}
                </div>
                {incident.assignedAmbulanceId && (
                  <div className="text-xs text-blue-600 mt-1">
                    Assigned: Ambulance #{incident.assignedAmbulanceId}
                  </div>
                )}
              </Popup>
            </Marker>
          );
        })}

      {/* Ambulance Markers with Smooth Movement */}
      {ambulances.map((ambulance) => {
        const position = ambulancePositions.get(ambulance.id) ?? ambulance.location;

        return (
          <Marker
            key={`ambulance-${ambulance.id}`}
            position={[position.lat, position.lng]}
            icon={getAmbulanceIcon(mapAmbulanceStatus(ambulance.status))}
          >
            <Popup>
              <div className="font-bold text-indigo-700">{ambulance.callsign}</div>
              <div className="text-sm text-gray-600">{ambulance.type}</div>
              {ambulance.hospital && (
                <div className="text-xs text-gray-500 mt-1">
                  Base: {ambulance.hospital.name}
                </div>
              )}
              <div className={`text-sm font-semibold mt-1 ${ambulance.status === 'IDLE' ? 'text-green-600' :
                ambulance.status === 'EN_ROUTE' ? 'text-purple-600' :
                  ambulance.status === 'ON_SCENE' ? 'text-orange-600' : 'text-gray-600'
                }`}>
                {ambulance.status.replace('_', ' ')}
              </div>
            </Popup>
          </Marker>
        );
      })}

    </MapContainer>
  );
}