import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { env } from '~/env';
import type {
  WebSocketMessage,
  AmbulanceUpdateEvent,
  IncidentAddedEvent,
  IncidentUpdateEvent,
  IncidentDeletedEvent,
  Ambulance,
  Incident,
} from '../types';
import { ambulanceKeys } from './useAmbulances';
import { incidentKeys } from './useIncidents';

const WS_URL = env.NEXT_PUBLIC_API_URL.replace('http', 'ws') + '/ws/dispatch';

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

  const handleAmbulanceUpdate = useCallback(
    (data: AmbulanceUpdateEvent) => {
      const ambulanceId = data.ambulanceId ?? data.id;

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
    (_data: IncidentAddedEvent) => {
      // Invalidate incident lists to refetch with new incident
      void queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
    },
    [queryClient]
  );

  const handleIncidentUpdate = useCallback(
    (data: IncidentUpdateEvent) => {
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
    (data: IncidentDeletedEvent) => {
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

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data as string) as WebSocketMessage;

        switch (message.type) {
          case 'AMBULANCE_UPDATE':
            handleAmbulanceUpdate(message.data as AmbulanceUpdateEvent);
            break;
          case 'INCIDENT_ADDED':
            handleIncidentAdded(message.data as IncidentAddedEvent);
            break;
          case 'INCIDENT_UPDATE':
            handleIncidentUpdate(message.data as IncidentUpdateEvent);
            break;
          case 'INCIDENT_DELETED':
            handleIncidentDeleted(message.data as IncidentDeletedEvent);
            break;
          case 'HOSPITAL_SELECTED':
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
    [handleAmbulanceUpdate, handleIncidentAdded, handleIncidentUpdate, handleIncidentDeleted]
  );

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttemptsRef.current = 0;
      };

      ws.current.onmessage = handleMessage;

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');

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
    isConnected: ws.current?.readyState === WebSocket.OPEN,
  };
}
