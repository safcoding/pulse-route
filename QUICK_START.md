# Quick Start Guide - New Simulation APIs

This guide shows you how to quickly integrate the new simulation APIs into your frontend.

## 1. Create Scenario on Map Click

```typescript
'use client';

import { useCreateScenario } from '@/api/hooks';
import { Map } from '@/components/map';

export function DispatchMap() {
  const createScenario = useCreateScenario({
    onSuccess: (data) => {
      console.log('Scenario created:', data.incident);
      // Incident will automatically appear in dispatcher list via WebSocket
    },
  });

  const handleMapClick = (lat: number, lng: number) => {
    createScenario.mutate({
      lat,
      lng,
      description: 'Medical emergency reported',
      callerName: 'Anonymous Caller',
    });
  };

  return <Map onClick={handleMapClick} />;
}
```

## 2. Show Pending Incidents in Dispatcher List

```typescript
'use client';

import { useIncidents } from '@/api/hooks';

export function IncidentsList() {
  // Only get PENDING incidents
  const { data: incidents, isLoading } = useIncidents('PENDING');

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Incoming Incidents ({incidents?.length ?? 0})</h2>
      {incidents?.map((incident) => (
        <IncidentCard key={incident.id} incident={incident} />
      ))}
    </div>
  );
}
```

## 3. Show Ambulance Candidates

```typescript
'use client';

import { useIncidentCandidates } from '@/api/hooks';

interface Props {
  incidentId: string;
}

export function AmbulanceCandidates({ incidentId }: Props) {
  const { data: candidates, isLoading } = useIncidentCandidates(incidentId);

  if (isLoading) return <div>Finding ambulances...</div>;

  return (
    <div>
      <h3>Available Ambulances</h3>
      {candidates?.map((candidate) => (
        <div key={candidate.id}>
          <strong>{candidate.callsign}</strong> - 
          ETA: {Math.round(candidate.etaSeconds / 60)} min
          ({(candidate.distanceMeters / 1000).toFixed(1)} km)
        </div>
      ))}
    </div>
  );
}
```

## 4. Assign Ambulance (Starts Simulation Immediately)

```typescript
'use client';

import { useAssignAmbulance } from '@/api/hooks';

interface Props {
  incidentId: string;
  ambulanceId: number;
}

export function AssignButton({ incidentId, ambulanceId }: Props) {
  const assignAmbulance = useAssignAmbulance({
    onSuccess: () => {
      // Simulation starts immediately
      // Ambulance will begin moving on map via WebSocket updates
      console.log('Ambulance dispatched and moving!');
    },
  });

  const handleAssign = () => {
    assignAmbulance.mutate({
      incidentId,
      data: {
        ambulanceId,
        dispatcherNotes: 'Dispatched via emergency system',
      },
    });
  };

  return (
    <button onClick={handleAssign} disabled={assignAmbulance.isPending}>
      {assignAmbulance.isPending ? 'Dispatching...' : 'Dispatch'}
    </button>
  );
}
```

## 5. Listen for Real-Time Updates

```typescript
'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { incidentKeys } from '@/api/hooks';
import type {
  WebSocketMessage,
  IncidentAddedEvent,
  AmbulanceUpdateEvent,
  IncidentUpdateEvent,
} from '@/api/types';

export function useRealtimeUpdates() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000/ws/dispatch');

    ws.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);

      switch (message.type) {
        case 'INCIDENT_ADDED': {
          const data = message.data as IncidentAddedEvent;
          console.log('New incident:', data);
          // Refresh incident lists
          queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
          break;
        }

        case 'AMBULANCE_UPDATE': {
          const data = message.data as AmbulanceUpdateEvent;
          // Update ambulance position on map
          updateAmbulanceMarker(data.id, { lat: data.lat, lng: data.lng });
          break;
        }

        case 'INCIDENT_UPDATE': {
          const data = message.data as IncidentUpdateEvent;
          console.log('Incident status changed:', data.status);
          queryClient.invalidateQueries({ 
            queryKey: incidentKeys.detail(data.incidentId) 
          });
          break;
        }

        case 'SIMULATION_COMPLETE': {
          console.log('Ambulance arrived at scene');
          break;
        }
      }
    };

    return () => ws.close();
  }, [queryClient]);
}

// Use in your root layout/page
export function RootLayout({ children }) {
  useRealtimeUpdates();
  return <>{children}</>;
}
```

## 6. Seed Demo Data

```typescript
'use client';

import { useSeedIncidents } from '@/api/hooks';

export function AdminPanel() {
  const seedIncidents = useSeedIncidents({
    onSuccess: (data) => {
      console.log(`Created ${data.created} demo incidents`);
    },
  });

  const handleSeed = () => {
    seedIncidents.mutate({
      count: 5,
      centerLat: 3.0569,
      centerLng: 101.5851,
      radiusKm: 10,
    });
  };

  return (
    <button onClick={handleSeed}>
      Seed 5 Random Incidents
    </button>
  );
}
```

## 7. Check Simulation Status

```typescript
'use client';

import { useSimulationStatus } from '@/api/hooks';

export function SimulationMonitor() {
  // Auto-refreshes every 5 seconds
  const { data: status } = useSimulationStatus();

  return (
    <div>
      <h3>Active Simulations: {status?.activeSimulations ?? 0}</h3>
      {status?.incidents.map((sim) => (
        <div key={sim.incidentId}>
          Incident {sim.incidentId} - Ambulance {sim.ambulanceId}
        </div>
      ))}
    </div>
  );
}
```

## Complete Demo Workflow Component

```typescript
'use client';

import { useState } from 'react';
import {
  useIncidents,
  useIncidentCandidates,
  useAssignAmbulance,
  useCreateScenario,
} from '@/api/hooks';

export function DispatcherWorkflow() {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  const createScenario = useCreateScenario();
  const { data: pendingIncidents } = useIncidents('PENDING');
  const { data: candidates } = useIncidentCandidates(selectedIncidentId ?? '');
  const assignAmbulance = useAssignAmbulance();

  // Step 1: Create scenario by clicking map
  const handleMapClick = (lat: number, lng: number) => {
    createScenario.mutate({
      lat,
      lng,
      description: 'Emergency reported',
    });
  };

  // Step 2: Select incident from list
  const handleSelectIncident = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
  };

  // Step 3: Assign best ambulance
  const handleDispatch = () => {
    if (!selectedIncidentId || !candidates?.[0]) return;

    assignAmbulance.mutate({
      incidentId: selectedIncidentId,
      data: {
        ambulanceId: candidates[0].id,
      },
    });

    setSelectedIncidentId(null);
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Map */}
      <div className="col-span-2">
        <Map onClick={handleMapClick} />
      </div>

      {/* Sidebar */}
      <div>
        <h2>Pending Incidents</h2>
        {pendingIncidents?.map((incident) => (
          <div
            key={incident.id}
            onClick={() => handleSelectIncident(incident.id)}
            className={selectedIncidentId === incident.id ? 'selected' : ''}
          >
            {incident.description}
          </div>
        ))}

        {selectedIncidentId && (
          <>
            <h3>Available Ambulances</h3>
            {candidates?.map((c) => (
              <div key={c.id}>
                {c.callsign} - {Math.round(c.etaSeconds / 60)} min
              </div>
            ))}
            <button onClick={handleDispatch}>Dispatch</button>
          </>
        )}
      </div>
    </div>
  );
}
```

## Important Notes

1. **Simulation Starts Immediately**: When you call `useAssignAmbulance`, the backend immediately starts moving the ambulance. No additional API calls needed.

2. **WebSocket Updates**: Ambulance positions update every 1 second via WebSocket events. Make sure to listen for `AMBULANCE_UPDATE` events.

3. **Auto-Refresh**: Use React Query's built-in caching and invalidation. The hooks automatically refresh data when mutations succeed.

4. **Type Safety**: All hooks are fully typed. TypeScript will catch errors at compile time.

5. **Error Handling**: All hooks support `onError` callbacks for handling failures.

For complete documentation, see `API_DOCUMENTATION.md`.
