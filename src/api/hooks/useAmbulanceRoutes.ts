import { useState, useEffect } from 'react';
import { subscribeToRouteUpdates, getAllAmbulanceRoutes, type AmbulanceRouteData } from './useSocket';

/**
 * Hook to subscribe to ambulance route updates
 * Returns a map of ambulance IDs to their route data
 */
export function useAmbulanceRoutes(): Map<number, AmbulanceRouteData> {
  const [routes, setRoutes] = useState<Map<number, AmbulanceRouteData>>(() => getAllAmbulanceRoutes());

  useEffect(() => {
    const unsubscribe = subscribeToRouteUpdates(() => {
      setRoutes(getAllAmbulanceRoutes());
    });

    return unsubscribe;
  }, []);

  return routes;
}
