# API Documentation - Emergency Dispatch System Frontend

This document provides a comprehensive guide to all available APIs, their TypeScript types, React hooks, and usage examples.

## Table of Contents
- [Simulation APIs](#simulation-apis)
- [Incident APIs](#incident-apis)
- [WebSocket Events](#websocket-events)
- [React Hooks](#react-hooks)
- [Usage Examples](#usage-examples)

---

## Simulation APIs

### Create Scenario (God Mode)
Creates a demo incident without triggering phone call simulation.

**Endpoint:** `POST /api/simulation/scenario`

**TypeScript Type:**
```typescript
interface CreateScenarioRequest {
  lat: number;
  lng: number;
  description: string;
  callerName?: string;
  callerPhone?: string;
}

interface CreateScenarioResponse {
  incident: Incident;
  user: {
    id: number;
    name: string;
    phone: string;
  };
  analysis: {
    category: IncidentCategory; // 'MEDICAL' | 'FIRE' | 'ACCIDENT' | 'OTHER'
    severity: Severity; // 'HIGH' | 'LOW'
    triageType?: TriageType;
    confidence: number;
  };
}
```

**Example:**
```typescript
import { createScenario } from '@/api/services';

const response = await createScenario({
  lat: 3.0733,
  lng: 101.6067,
  description: "Serious car crash at Sunway Pyramid, two people trapped",
  callerName: "John Doe",
  callerPhone: "+60123456789"
});
```

---

### Seed Random Incidents
Create multiple random incidents for demo purposes.

**Endpoint:** `POST /api/simulation/seed`

**TypeScript Type:**
```typescript
interface SeedIncidentsRequest {
  count: number;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
}

interface SeedIncidentsResponse {
  created: number;
  incidents: Incident[];
}
```

**Example:**
```typescript
import { seedIncidents } from '@/api/services';

const response = await seedIncidents({
  count: 5,
  centerLat: 3.0569,
  centerLng: 101.5851,
  radiusKm: 5
});
```

---

### AI Text Analysis
Mock AI analysis of incident description.

**Endpoint:** `POST /api/ai/analyze`

**TypeScript Type:**
```typescript
interface AnalyzeTextRequest {
  text: string;
}

interface AnalyzeTextResponse {
  category: IncidentCategory;
  severity: Severity;
  triageType?: TriageType;
  confidence: number;
  keywords: string[];
}
```

**Example:**
```typescript
import { analyzeText } from '@/api/services';

const analysis = await analyzeText({
  text: "Elderly male complaining of crushing chest pain"
});
// Returns: { category: "MEDICAL", severity: "HIGH", triageType: "STEMI", ... }
```

---

### Get Simulation Status
Get all active simulations.

**Endpoint:** `GET /api/simulation/status`

**TypeScript Type:**
```typescript
interface SimulationStatus {
  activeSimulations: number;
  incidents: Array<{
    incidentId: string;
    ambulanceId: number;
    startedAt: string;
  }>;
}
```

---

### Cancel Simulation
Cancel a specific simulation.

**Endpoint:** `DELETE /api/dispatch/simulations/:incidentId`

**Example:**
```typescript
import { cancelSimulation } from '@/api/services';

await cancelSimulation('inc-123');
```

---

### Cancel All Simulations
Cancel all active simulations.

**Endpoint:** `DELETE /api/simulation/all`

---

## Incident APIs

### Get Ambulance Candidates
Get ranked list of best ambulances for an incident.

**Endpoint:** `GET /incidents/:id/candidates`

**TypeScript Type:**
```typescript
interface AmbulanceCandidate {
  id: number;
  callsign: string;
  type: AmbulanceType; // 'BLS' | 'ALS' | 'CCT' | 'RRV'
  etaSeconds: number;
  distanceMeters: number;
  hospitalName: string;
}
```

**Example:**
```typescript
import { getIncidentCandidates } from '@/api/services';

const candidates = await getIncidentCandidates('inc-123');
// Returns array sorted by ETA
```

---

### Assign Ambulance (Updated)
Assign ambulance and **immediately start simulation**.

**Endpoint:** `POST /incidents/:id/assign`

**TypeScript Type:**
```typescript
interface AssignAmbulanceRequest {
  ambulanceId: number;
  dispatcherNotes?: string;
}

interface AssignAmbulanceResponse {
  incident: Incident; // Status: DISPATCHED
  ambulance: Ambulance; // Status: EN_ROUTE
}
```

**Example:**
```typescript
import { assignAmbulanceToIncident } from '@/api/services';

const result = await assignAmbulanceToIncident('inc-123', {
  ambulanceId: 101,
  dispatcherNotes: "Heavy traffic on main road, use alternative route"
});
// Simulation starts immediately, ambulance begins moving
```

---

### Get Incidents with Filter
List incidents with optional status filter.

**Endpoint:** `GET /incidents?status=PENDING`

**Example:**
```typescript
import { getIncidents } from '@/api/services';

const pendingIncidents = await getIncidents('PENDING');
const allIncidents = await getIncidents();
```

---

## WebSocket Events

Connect to: `ws://localhost:3000/ws/dispatch`

### Event Types

#### 1. INCIDENT_ADDED
Fired when a new scenario/incident is created.

**TypeScript Type:**
```typescript
interface IncidentAddedEvent {
  incidentId: string;
  lat: number;
  lng: number;
  category: IncidentCategory;
  severity: Severity;
  description?: string;
  status: IncidentStatus;
}
```

**When:** After `POST /api/simulation/scenario`  
**Action:** Add incident to dispatcher's incoming list and map

---

#### 2. AMBULANCE_UPDATE
Fired every 1 second during simulation for live movement.

**TypeScript Type:**
```typescript
interface AmbulanceUpdateEvent {
  id: number;
  ambulanceId?: number;
  location: Location;
  lat: number;
  lng: number;
  status: AmbulanceStatus;
  phase?: 'TO_SCENE' | 'TO_HOSPITAL' | 'RETURNING';
  route?: GeoJsonLineString; // NEW: Full route polyline
  etaSeconds?: number; // NEW: Estimated time to destination
}

interface GeoJsonLineString {
  type: 'LineString';
  coordinates: [number, number][]; // [lng, lat] format
}
```

**When:** During active simulation  
**Action:** 
- Update ambulance marker position on map
- Draw route polyline from current position to destination
- Display ETA countdown in UI

**Example:**
```typescript
{
  "type": "AMBULANCE_UPDATE",
  "data": {
    "id": 101,
    "ambulanceId": 101,
    "lat": 3.0733,
    "lng": 101.6067,
    "status": "EN_ROUTE",
    "phase": "TO_SCENE",
    "route": {
      "type": "LineString",
      "coordinates": [
        [101.6067, 3.0733],
        [101.6100, 3.0750],
        [101.6150, 3.0780]
      ]
    },
    "etaSeconds": 240
  }
}
```

---

#### 3. INCIDENT_UPDATE
Fired when incident status changes.

**TypeScript Type:**
```typescript
interface IncidentUpdateEvent {
  incidentId: string;
  status: IncidentStatus;
  assignedAmbulanceId?: number | null;
  dispatcherNotes?: string;
}
```

**When:** Status changes (e.g., PENDING → DISPATCHED)  
**Action:** Update incident card in UI

---

#### 4. HOSPITAL_SELECTED
Fired when ambulance leaves the scene and destination hospital is selected.

**TypeScript Type:**
```typescript
interface HospitalSelectedEvent {
  incidentId: string;
  hospitalId: number;
  hospitalName: string;
  hospital?: {
    id: number;
    name: string;
  };
}
```

**When:** After ambulance picks up patient  
**Action:** Update UI to show destination hospital

---

#### 5. INCIDENT_DELETED
Fired when incident is deleted.

**TypeScript Type:**
```typescript
interface IncidentDeletedEvent {
  incidentId: string;
}
```

**Action:** Remove from list/map

---

#### 6. SIMULATION_COMPLETE
Fired when ambulance reaches destination.

**TypeScript Type:**
```typescript
interface SimulationCompleteEvent {
  incidentId: string;
  ambulanceId: number;
  completedAt: string;
}
```

---

## React Hooks

### Simulation Hooks

```typescript
import {
  useCreateScenario,
  useSeedIncidents,
  useAnalyzeText,
  useSimulationStatus,
  useCancelSimulation,
  useCancelAllSimulations
} from '@/api/hooks';
```

#### useCreateScenario
```typescript
const createScenario = useCreateScenario({
  onSuccess: (data) => {
    console.log('Scenario created:', data.incident.id);
  }
});

createScenario.mutate({
  lat: 3.0733,
  lng: 101.6067,
  description: "Car crash at Sunway"
});
```

#### useSimulationStatus
```typescript
const { data: status } = useSimulationStatus();
// Auto-refreshes every 5 seconds
console.log(status?.activeSimulations); // Number of active simulations
```

---

### Incident Hooks

```typescript
import {
  useIncidents,
  useIncidentCandidates,
  useAssignAmbulance,
  useDeleteIncident
} from '@/api/hooks';
```

#### useIncidents (with filter)
```typescript
// Get only pending incidents
const { data: pendingIncidents } = useIncidents('PENDING');

// Get all incidents
const { data: allIncidents } = useIncidents();
```

#### useIncidentCandidates
```typescript
const { data: candidates } = useIncidentCandidates('inc-123');
// Returns ranked ambulances by ETA
```

#### useAssignAmbulance
```typescript
const assignAmbulance = useAssignAmbulance({
  onSuccess: () => {
    console.log('Ambulance assigned, simulation started');
  }
});

assignAmbulance.mutate({
  incidentId: 'inc-123',
  data: {
    ambulanceId: 101,
    dispatcherNotes: "Proceed with caution"
  }
});
```

---

## Usage Examples

### Complete Demo Workflow

```typescript
import { useCreateScenario, useIncidentCandidates, useAssignAmbulance } from '@/api/hooks';

function DispatcherPanel() {
  const createScenario = useCreateScenario();
  const assignAmbulance = useAssignAmbulance();
  
  // 1. Click map to create scenario
  const handleMapClick = (lat: number, lng: number) => {
    createScenario.mutate({
      lat,
      lng,
      description: "Medical emergency - person collapsed",
      callerName: "Jane Smith"
    });
  };
  
  // 2. Get candidates for incident
  const { data: candidates } = useIncidentCandidates(selectedIncidentId);
  
  // 3. Assign best ambulance (starts simulation immediately)
  const handleAssign = () => {
    assignAmbulance.mutate({
      incidentId: selectedIncidentId,
      data: {
        ambulanceId: candidates[0].id,
        dispatcherNotes: "First responder unit"
      }
    });
  };
  
  return (
    <div>
      {/* Your UI */}
    </div>
  );
}
```

---

### Listening to WebSocket Events

```typescript
import { useEffect } from 'react';
import type { 
  WebSocketMessage, 
  IncidentAddedEvent, 
  AmbulanceUpdateEvent 
} from '@/api/types';

function useWebSocketUpdates() {
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000/ws/dispatch');
    
    ws.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      switch (message.type) {
        case 'INCIDENT_ADDED': {
          const data = message.data as IncidentAddedEvent;
          // Add to incident list
          break;
        }
        
        case 'AMBULANCE_UPDATE': {
          const data = message.data as AmbulanceUpdateEvent;
          // Update ambulance marker position
          updateAmbulancePosition(data.id, { 
            lat: data.lat, 
            lng: data.lng 
          });
          break;
        }
        
        case 'INCIDENT_UPDATE': {
          // Refresh incident details
          break;
        }
      }
    };
    
    return () => ws.close();
  }, []);
}
```

---

### Seed Demo Data

```typescript
import { useSeedIncidents } from '@/api/hooks';

function AdminPanel() {
  const seedIncidents = useSeedIncidents();
  
  const handleSeedDemo = () => {
    seedIncidents.mutate({
      count: 10,
      centerLat: 3.0569,
      centerLng: 101.5851,
      radiusKm: 8
    });
  };
  
  return (
    <button onClick={handleSeedDemo}>
      Seed 10 Random Incidents
    </button>
  );
}
```

---

## Updated Type Definitions

### Incident (Updated)
```typescript
interface Incident {
  id: string;
  location: Location;
  triage: TriageType;
  status: IncidentStatus; // Now includes 'DISPATCHED'
  category?: IncidentCategory; // NEW
  description?: string; // NEW
  isAiGenerated?: boolean; // NEW
  dispatcherNotes?: string; // NEW
  assignedAmbulanceId: number | null;
  recommendedHospitalId: string | null;
  etaSeconds: number | null;
  createdAt?: string;
  updatedAt?: string;
}
```

### Ambulance (Updated)
```typescript
interface Ambulance {
  id: number;
  callsign: string;
  type: AmbulanceType;
  status: AmbulanceStatus;
  location: Location;
  capabilities?: string[]; // NEW
  hospital?: {
    id: number;
    name: string;
  };
  hospitalId?: number;
}
```

---

## Key Changes Summary

1. **New Simulation APIs**: Create scenarios, seed data, AI analysis
2. **Enhanced Incidents**: Candidates endpoint, filter support, delete capability
3. **Updated Assignment Flow**: Simulation starts immediately on assignment
4. **Real-time Updates**: 7 WebSocket event types for live UI updates
5. **React Hooks**: Fully typed hooks for all new APIs
6. **Type Safety**: Comprehensive TypeScript interfaces for all requests/responses

---

## Development Notes

- All hooks use React Query for caching and invalidation
- WebSocket events automatically trigger UI updates when used with hooks
- Simulation runs at 1 second intervals for smooth animation
- All mutations automatically invalidate relevant query caches
- Error handling is built into all API client functions
