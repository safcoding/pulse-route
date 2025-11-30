// ============================================
// Common Types
// ============================================

export interface Location {
  lat: number;
  lng: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

// ============================================
// Hospital Types
// ============================================

export type HospitalCapability = 'PCI' | 'STROKE' | 'TRAUMA' | 'BURNS' | 'PEDIATRIC' | 'GENERAL';
export type HospitalStatus = 'OPEN' | 'DIVERTING' | 'CLOSED';

export interface Hospital {
  id: number;
  name: string;
  location: Location;
  capabilities: HospitalCapability[];
  ambulanceCount: number;
  status?: HospitalStatus;
  load?: number;
  createdAt: string;
  updatedAt: string;
}

export interface HospitalWithAmbulances extends Hospital {
  ambulances: Ambulance[];
}

export interface UpdateHospitalStatusRequest {
  status: HospitalStatus;
  load: number;
}

// ============================================
// Ambulance Types
// ============================================

export type AmbulanceType = 'BLS' | 'ALS' | 'CCT' | 'RRV';
export type AmbulanceStatus = 'IDLE' | 'EN_ROUTE' | 'ON_SCENE' | 'TRANSPORTING';

export interface Ambulance {
  id: number;
  callsign: string;
  type: AmbulanceType;
  status: AmbulanceStatus;
  location: Location;
  hospital?: {
    id: number;
    name: string;
  };
  hospitalId?: number;
}

export interface UpdateAmbulanceStatusRequest {
  status: AmbulanceStatus;
}

export interface UpdateAmbulanceLocationRequest {
  lat: number;
  lng: number;
}

// ============================================
// Incident Types
// ============================================

export type TriageType = 'STEMI' | 'Stroke' | 'Trauma' | 'Burns' | 'Pediatric' | 'General';
export type IncidentStatus = 
  | 'PENDING' 
  | 'ASSIGNED' 
  | 'EN_ROUTE' 
  | 'ARRIVED' 
  | 'TRANSPORTING' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface Incident {
  id: string;
  location: Location;
  triage: TriageType;
  status: IncidentStatus;
  assignedAmbulanceId: number | null;
  recommendedHospitalId: string | null;
  etaSeconds: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateIncidentRequest {
  location: Location;
  triage: TriageType;
}

export interface HospitalRecommendation {
  hospital: Hospital;
  score: number;
  etaSeconds: number;
  distanceMeters: number;
}

export interface CreateIncidentResponse {
  incident: Incident;
  recommendations: HospitalRecommendation[];
}

export interface AssignAmbulanceRequest {
  ambulanceId: string;
}

export interface AssignAmbulanceResponse {
  incident: Incident;
  ambulance: Ambulance;
}

export interface UpdateIncidentStatusRequest {
  status: IncidentStatus;
}

// ============================================
// Dispatch Types
// ============================================

export type Severity = 'HIGH' | 'LOW';

export interface DispatchRequest {
  incidentId: string;
  lat: number;
  lng: number;
  requiredType?: AmbulanceType;
  severity?: Severity;
  triageType?: TriageType;
}

export interface GeoJsonLineString {
  type: 'LineString';
  coordinates: [number, number][];
}

export interface DispatchResponse {
  ambulanceId: number;
  ambulanceCallsign: string;
  etaSeconds: number;
  distanceMeters: number;
  route: GeoJsonLineString;
}

export interface DispatchCandidate {
  ambulance: Ambulance;
  etaSeconds: number;
  distanceMeters: number;
}

// ============================================
// Hazard Types
// ============================================

export type HazardType = 'FLOOD' | 'ACCIDENT' | 'ROADBLOCK' | 'CONSTRUCTION' | 'OTHER';

export interface HazardBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface Hazard {
  id: string;
  type: HazardType;
  description: string;
  bounds: HazardBounds;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHazardRequest {
  type: HazardType;
  description: string;
  bounds: HazardBounds;
}

export interface UpdateHazardRequest {
  active?: boolean;
  description?: string;
}

// ============================================
// Routing Types
// ============================================

export interface CalculateRouteRequest {
  origin: Location;
  destination: Location;
}

export interface Route {
  geometry: GeoJsonLineString;
  etaSeconds: number;
  distanceMeters: number;
}

export interface CalculateRouteResponse {
  route: Route;
}

// ============================================
// WebSocket Event Types
// ============================================

export type WebSocketEventType = 
  | 'AMBULANCE_UPDATE'
  | 'HOSPITAL_SELECTED'
  | 'SIMULATION_COMPLETE'
  | 'SIMULATION_CANCELLED';

export interface WebSocketMessage<T = unknown> {
  type: WebSocketEventType;
  data: T;
  timestamp: string;
}

export interface AmbulanceUpdateEvent {
  ambulanceId: number;
  location: Location;
  status: AmbulanceStatus;
}

export interface HospitalSelectedEvent {
  incidentId: string;
  hospitalId: number;
  hospitalName: string;
}

export interface SimulationCompleteEvent {
  incidentId: string;
  ambulanceId: number;
  completedAt: string;
}

export interface SimulationCancelledEvent {
  incidentId: string;
  reason: string;
}
