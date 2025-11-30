# New APIs Implementation Summary

All new simulation and enhanced incident APIs have been successfully implemented in the frontend.

## Files Created/Modified

### New Files
1. **`src/api/services/simulation.ts`** - Simulation API service layer
2. **`src/api/hooks/useSimulation.ts`** - React hooks for simulation APIs
3. **`API_DOCUMENTATION.md`** - Comprehensive API documentation

### Modified Files
1. **`src/api/types.ts`** - Added new types:
   - `IncidentCategory`, `CreateScenarioRequest`, `SeedIncidentsRequest`, etc.
   - Updated WebSocket event types
   - Updated `Incident` and `Ambulance` interfaces

2. **`src/api/services/incidents.ts`** - Added:
   - `getIncidentCandidates()` - Get ranked ambulances
   - `deleteIncident()` - Delete incidents
   - Updated `getIncidents()` with status filter
   - Updated `assignAmbulanceToIncident()` types

3. **`src/api/hooks/useIncidents.ts`** - Added:
   - `useIncidentCandidates()` - Hook for ambulance candidates
   - `useDeleteIncident()` - Hook for deleting incidents
   - Updated `useIncidents()` with status filter parameter

4. **`src/api/services/index.ts`** - Export simulation service
5. **`src/api/hooks/index.ts`** - Export simulation hooks

## Available APIs

### Simulation APIs (God Mode)
- ✅ `POST /api/simulation/scenario` - Create demo scenario
- ✅ `POST /api/simulation/seed` - Seed random incidents
- ✅ `POST /api/ai/analyze` - Mock AI text analysis
- ✅ `GET /api/simulation/status` - Get simulation status
- ✅ `DELETE /api/dispatch/simulations/:id` - Cancel simulation
- ✅ `DELETE /api/simulation/all` - Cancel all simulations

### Enhanced Incident APIs
- ✅ `GET /incidents?status=PENDING` - Filter by status
- ✅ `GET /incidents/:id/candidates` - Get ranked ambulances
- ✅ `POST /incidents/:id/assign` - Assign + start simulation
- ✅ `DELETE /incidents/:id` - Delete incident

### WebSocket Events
- ✅ `INCIDENT_ADDED` - New scenario created
- ✅ `INCIDENT_UPDATE` - Status changed
- ✅ `INCIDENT_DELETED` - Incident removed
- ✅ `AMBULANCE_UPDATE` - Live position (every 1s)
- ✅ `SIMULATION_COMPLETE` - Journey finished
- ✅ `SIMULATION_CANCELLED` - Simulation stopped
- ✅ `HOSPITAL_SELECTED` - Hospital chosen

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

### Updated Incident Hooks
```typescript
import {
  useIncidents,           // Now supports status filter
  useIncidentCandidates,  // NEW - Get ranked ambulances
  useAssignAmbulance,     // Updated - Starts simulation immediately
  useDeleteIncident       // NEW - Delete incidents
} from '@/api/hooks';
```

## Usage Example

```typescript
// 1. Create scenario (God Mode)
const createScenario = useCreateScenario();
createScenario.mutate({
  lat: 3.0733,
  lng: 101.6067,
  description: "Car crash at Sunway Pyramid"
});

// 2. Get ambulance candidates
const { data: candidates } = useIncidentCandidates(incidentId);

// 3. Assign ambulance (starts simulation immediately)
const assignAmbulance = useAssignAmbulance();
assignAmbulance.mutate({
  incidentId,
  data: {
    ambulanceId: candidates[0].id,
    dispatcherNotes: "Proceed with caution"
  }
});

// 4. Listen for live updates via WebSocket
// Ambulance position updates every 1 second
```

## Type Safety

All APIs are fully typed with TypeScript:
- Request/Response interfaces
- WebSocket event types
- React Query hooks with proper generics
- Compile-time type checking for all API calls

## Next Steps

1. Integrate `useCreateScenario` into your map click handler
2. Use `useIncidentCandidates` in dispatcher UI for ambulance selection
3. Connect WebSocket listeners for real-time map updates
4. Add UI for seeding demo data with `useSeedIncidents`

For complete documentation, see **`API_DOCUMENTATION.md`**
