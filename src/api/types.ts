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
  capabilities?: string[];
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
  | 'DISPATCHED'
  | 'EN_ROUTE' 
  | 'ARRIVED' 
  | 'TRANSPORTING' 
  | 'COMPLETED' 
  | 'CANCELLED';

export type IncidentCategory = 'MEDICAL' | 'FIRE' | 'ACCIDENT' | 'OTHER';

export interface Incident {
  id: string;
  // Backend returns lat/lng separately, not in a location object
  lat?: number;
  lng?: number;
  location?: Location; // For backwards compatibility
  triage: TriageType;
  status: IncidentStatus;
  category?: IncidentCategory;
  description?: string;
  isAiGenerated?: boolean;
  dispatcherNotes?: string;
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
  ambulanceId: number;
  dispatcherNotes?: string;
}

export interface AssignAmbulanceResponse {
  incident: Incident;
  ambulance: Ambulance;
}

export interface AmbulanceCandidate {
  id: number;
  callsign: string;
  type: AmbulanceType;
  etaSeconds: number;
  distanceMeters: number;
  hospitalName: string;
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
// Simulation Types
// ============================================

export interface CreateScenarioRequest {
  lat: number;
  lng: number;
  description: string;
  callerName?: string;
  callerPhone?: string;
}

export interface CreateScenarioResponse {
  incident: Incident;
  user: {
    id: number;
    name: string;
    phone: string;
  };
  analysis: {
    category: IncidentCategory;
    severity: Severity;
    triageType?: TriageType;
    confidence: number;
  };
}

export interface SeedIncidentsRequest {
  count: number;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
}

export interface SeedIncidentsResponse {
  created: number;
  incidents: Incident[];
}

export interface AnalyzeTextRequest {
  text: string;
}

export interface AnalyzeTextResponse {
  category: IncidentCategory;
  severity: Severity;
  triageType?: TriageType;
  confidence: number;
  keywords: string[];
}

export interface SimulationStatus {
  activeSimulations: number;
  incidents: Array<{
    incidentId: string;
    ambulanceId: number;
    startedAt: string;
  }>;
}

// ============================================
// WebSocket Event Types
// ============================================

export type WebSocketEventType = 
  | 'AMBULANCE_UPDATE'
  | 'HOSPITAL_SELECTED'
  | 'SIMULATION_COMPLETE'
  | 'SIMULATION_CANCELLED'
  | 'INCIDENT_ADDED'
  | 'INCIDENT_UPDATE'
  | 'INCIDENT_DELETED';

export interface WebSocketMessage<T = unknown> {
  type: WebSocketEventType;
  data: T;
  timestamp: string;
}

export interface AmbulanceUpdateEvent {
  id: number;
  ambulanceId?: number;
  location: Location;
  lat: number;
  lng: number;
  status: AmbulanceStatus;
  phase?: 'TO_SCENE' | 'TO_HOSPITAL' | 'RETURNING';
  route?: GeoJsonLineString;
  etaSeconds?: number;
}

export interface HospitalSelectedEvent {
  incidentId: string;
  hospitalId: number;
  hospitalName: string;
  hospital?: {
    id: number;
    name: string;
  };
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

export interface IncidentAddedEvent {
  incidentId: string;
  lat: number;
  lng: number;
  category: IncidentCategory;
  severity: Severity;
  description?: string;
  status: IncidentStatus;
}

export interface IncidentUpdateEvent {
  incidentId: string;
  status: IncidentStatus;
  assignedAmbulanceId?: number | null;
  dispatcherNotes?: string;
}

export interface IncidentDeletedEvent {
  incidentId: string;
}
