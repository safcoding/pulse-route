import { useState, useEffect, useRef } from 'react';
import type { Location, Ambulance } from '../types';

/**
 * Hook to manage smooth ambulance movement on the map
 * Interpolates between positions for smooth transitions instead of jumps
 */
export function useAmbulanceMovement(ambulances: Ambulance[], interpolationDuration = 1000) {
  const [positions, setPositions] = useState<Map<number, Location>>(new Map());
  const previousPositions = useRef<Map<number, Location>>(new Map());
  const animationFrames = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    const currentAnimationFrames = animationFrames.current;

    ambulances.forEach((ambulance) => {
      const currentPos = ambulance.location;
      const previousPos = previousPositions.current.get(ambulance.id);

      // If this is the first position or ambulance is IDLE, set directly
      if (!previousPos || ambulance.status === 'IDLE') {
        setPositions((prev) => {
          const next = new Map(prev);
          next.set(ambulance.id, currentPos);
          return next;
        });
        previousPositions.current.set(ambulance.id, currentPos);
        return;
      }

      // Check if position actually changed
      if (previousPos.lat === currentPos.lat && previousPos.lng === currentPos.lng) {
        return;
      }

      // Cancel any existing animation for this ambulance
      const existingFrame = animationFrames.current.get(ambulance.id);
      if (existingFrame) {
        cancelAnimationFrame(existingFrame);
      }

      // Start smooth interpolation
      const startTime = performance.now();
      const startPos = previousPos;
      const endPos = currentPos;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / interpolationDuration, 1);

        // Easing function for smoother movement (easeInOutQuad)
        const easeProgress =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        const interpolatedPos: Location = {
          lat: startPos.lat + (endPos.lat - startPos.lat) * easeProgress,
          lng: startPos.lng + (endPos.lng - startPos.lng) * easeProgress,
        };

        setPositions((prev) => {
          const next = new Map(prev);
          next.set(ambulance.id, interpolatedPos);
          return next;
        });

        if (progress < 1) {
          const frameId = requestAnimationFrame(animate);
          animationFrames.current.set(ambulance.id, frameId);
        } else {
          // Animation complete
          previousPositions.current.set(ambulance.id, endPos);
          animationFrames.current.delete(ambulance.id);
        }
      };

      const frameId = requestAnimationFrame(animate);
      animationFrames.current.set(ambulance.id, frameId);
    });

    // Cleanup: cancel all animations on unmount
    return () => {
      currentAnimationFrames.forEach((frameId) => {
        cancelAnimationFrame(frameId);
      });
      currentAnimationFrames.clear();
    };
  }, [ambulances, interpolationDuration]);

  return positions;
}

/**
 * Alternative: Get interpolated position for a single ambulance
 */
export function useAmbulancePosition(ambulance: Ambulance | undefined, interpolationDuration = 1000): Location | null {
  const [position, setPosition] = useState<Location | null>(null);
  const previousPosition = useRef<Location | null>(null);
  const animationFrame = useRef<number | null>(null);

  useEffect(() => {
    if (!ambulance) {
      setPosition(null);
      return;
    }

    const currentPos = ambulance.location;
    const previousPos = previousPosition.current;

    // If this is the first position or ambulance is IDLE, set directly
    if (!previousPos || ambulance.status === 'IDLE') {
      setPosition(currentPos);
      previousPosition.current = currentPos;
      return;
    }

    // Check if position actually changed
    if (previousPos.lat === currentPos.lat && previousPos.lng === currentPos.lng) {
      return;
    }

    // Cancel any existing animation
    if (animationFrame.current !== null) {
      cancelAnimationFrame(animationFrame.current);
    }

    // Start smooth interpolation
    const startTime = performance.now();
    const startPos = previousPos;
    const endPos = currentPos;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / interpolationDuration, 1);

      // Easing function for smoother movement (easeInOutQuad)
      const easeProgress =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const interpolatedPos: Location = {
        lat: startPos.lat + (endPos.lat - startPos.lat) * easeProgress,
        lng: startPos.lng + (endPos.lng - startPos.lng) * easeProgress,
      };

      setPosition(interpolatedPos);

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        previousPosition.current = endPos;
        animationFrame.current = null;
      }
    };

    animationFrame.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [ambulance, interpolationDuration]);

  return position;
}
