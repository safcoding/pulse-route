import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { env } from '~/env';
import type {
  WebSocketMessage,
  AmbulanceUpdateEvent,
  IncidentAddedEvent,
  IncidentUpdateEvent,
  IncidentDeletedEvent,
  HospitalSelectedEvent,
  Ambulance,
  Incident,
  GeoJsonLineString,
} from '../types';
import { ambulanceKeys } from './useAmbulances';
import { incidentKeys } from './useIncidents';

const WS_URL = env.NEXT_PUBLIC_API_URL.replace('http', 'ws') + '/ws/dispatch';

// Store for ambulance routes and ETAs (shared across components)
export interface AmbulanceRouteData {
  route: GeoJsonLineString;
  etaSeconds: number;
  phase?: 'TO_SCENE' | 'TO_HOSPITAL' | 'RETURNING';
}

const ambulanceRoutesStore = new Map<number, AmbulanceRouteData>();
const routeUpdateListeners = new Set<() => void>();

export function getAmbulanceRoute(ambulanceId: number): AmbulanceRouteData | undefined {
  return ambulanceRoutesStore.get(ambulanceId);
}

export function getAllAmbulanceRoutes(): Map<number, AmbulanceRouteData> {
  return new Map(ambulanceRoutesStore);
}

export function subscribeToRouteUpdates(callback: () => void): () => void {
  routeUpdateListeners.add(callback);
  return () => {
    routeUpdateListeners.delete(callback);
  };
}

function notifyRouteUpdate() {
  routeUpdateListeners.forEach(listener => listener());
}

/**
 * Hook to manage WebSocket connection to the dispatch server
 * Listens for real-time updates and syncs with React Query cache
 */
export function useDispatchSocket() {
  const ws = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;
  const [isConnected, setIsConnected] = useState(false);

  const handleAmbulanceUpdate = useCallback(
    (data: AmbulanceUpdateEvent | undefined) => {
      if (!data) {
        console.warn('Received AMBULANCE_UPDATE with no data');
        return;
      }

      const ambulanceId = data.ambulanceId ?? data.id;
      if (!ambulanceId) {
        console.warn('AMBULANCE_UPDATE missing ambulanceId:', data);
        return;
      }

      // Store route and ETA data if present
      if (data.route || data.etaSeconds !== undefined) {
        if (data.route) {
          console.log('📍 Storing route for ambulance', ambulanceId, {
            coordinatesCount: data.route.coordinates?.length,
            eta: data.etaSeconds,
            phase: data.phase
          });
          ambulanceRoutesStore.set(ambulanceId, {
            route: data.route,
            etaSeconds: data.etaSeconds ?? 0,
            phase: data.phase,
          });
          notifyRouteUpdate();
        }
      } else {
        console.log('⚠️ AMBULANCE_UPDATE received without route data for ambulance', ambulanceId, data);
      }

      // Update specific ambulance in cache
      queryClient.setQueryData<Ambulance>(
        ambulanceKeys.detail(ambulanceId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            location: data.location ?? { lat: data.lat, lng: data.lng },
            status: data.status,
          };
        }
      );

      // Update ambulance in list cache
      queryClient.setQueriesData<Ambulance[]>(
        { queryKey: ambulanceKeys.lists() },
        (old) => {
          if (!old) return old;
          return old.map((ambulance) =>
            ambulance.id === ambulanceId
              ? {
                  ...ambulance,
                  location: data.location ?? { lat: data.lat, lng: data.lng },
                  status: data.status,
                }
              : ambulance
          );
        }
      );
    },
    [queryClient]
  );

  const handleIncidentAdded = useCallback(
    (data: IncidentAddedEvent | undefined) => {
      if (!data) {
        console.warn('Received INCIDENT_ADDED with no data');
        return;
      }
      // Invalidate incident lists to refetch with new incident
      void queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
    },
    [queryClient]
  );

  const handleIncidentUpdate = useCallback(
    (data: IncidentUpdateEvent | undefined) => {
      if (!data || !data.incidentId) {
        console.warn('Received INCIDENT_UPDATE with invalid data:', data);
        return;
      }

      const incidentId = data.incidentId;

      // Update specific incident in cache
      queryClient.setQueryData<Incident>(
        incidentKeys.detail(incidentId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            status: data.status,
            assignedAmbulanceId: data.assignedAmbulanceId ?? old.assignedAmbulanceId,
            dispatcherNotes: data.dispatcherNotes ?? old.dispatcherNotes,
          };
        }
      );

      // Update incident in list cache
      queryClient.setQueriesData<Incident[]>(
        { queryKey: incidentKeys.lists() },
        (old) => {
          if (!old) return old;
          return old.map((incident) =>
            incident.id === incidentId
              ? {
                  ...incident,
                  status: data.status,
                  assignedAmbulanceId: data.assignedAmbulanceId ?? incident.assignedAmbulanceId,
                  dispatcherNotes: data.dispatcherNotes ?? incident.dispatcherNotes,
                }
              : incident
          );
        }
      );
    },
    [queryClient]
  );

  const handleIncidentDeleted = useCallback(
    (data: IncidentDeletedEvent | undefined) => {
      if (!data || !data.incidentId) {
        console.warn('Received INCIDENT_DELETED with invalid data:', data);
        return;
      }

      // Remove incident from cache
      queryClient.removeQueries({ queryKey: incidentKeys.detail(data.incidentId) });

      // Update incident lists
      queryClient.setQueriesData<Incident[]>(
        { queryKey: incidentKeys.lists() },
        (old) => {
          if (!old) return old;
          return old.filter((incident) => incident.id !== data.incidentId);
        }
      );
    },
    [queryClient]
  );

  const handleHospitalSelected = useCallback(
    (data: HospitalSelectedEvent | undefined) => {
      if (!data) {
        console.warn('Received HOSPITAL_SELECTED with no data');
        return;
      }
      console.log('Hospital selected:', data.hospital?.name ?? data.hospitalName, 'for incident', data.incidentId);
      // Could store this for visualization later
    },
    []
  );

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data as string) as WebSocketMessage;

        if (!message || !message.type) {
          console.warn('Invalid WebSocket message format:', message);
          return;
        }

        switch (message.type) {
          case 'AMBULANCE_UPDATE':
            handleAmbulanceUpdate(message.data as AmbulanceUpdateEvent | undefined);
            break;
          case 'INCIDENT_ADDED':
            handleIncidentAdded(message.data as IncidentAddedEvent | undefined);
            break;
          case 'INCIDENT_UPDATE':
            handleIncidentUpdate(message.data as IncidentUpdateEvent | undefined);
            break;
          case 'INCIDENT_DELETED':
            handleIncidentDeleted(message.data as IncidentDeletedEvent | undefined);
            break;
          case 'HOSPITAL_SELECTED':
            handleHospitalSelected(message.data as HospitalSelectedEvent | undefined);
            break;
          case 'SIMULATION_COMPLETE':
          case 'SIMULATION_CANCELLED':
            // Log for debugging but don't handle yet
            console.log('WebSocket event:', message.type, message.data);
            break;
          default:
            console.warn('Unknown WebSocket message type:', message);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    },
    [handleAmbulanceUpdate, handleIncidentAdded, handleIncidentUpdate, handleIncidentDeleted, handleHospitalSelected]
  );

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      ws.current.onmessage = handleMessage;

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);

        // Attempt reconnection with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * 2 ** reconnectAttemptsRef.current, 30000);
          console.log(`Reconnecting in ${delay}ms...`);

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connect();
          }, delay);
        } else {
          console.error('Max reconnection attempts reached');
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [handleMessage]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  return {
    isConnected,
  };
}
