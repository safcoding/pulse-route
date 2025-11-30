import L from 'leaflet';
import React, { useState } from 'react';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/** Incident severity levels */
export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';

/** Incident status */
export type IncidentStatus = 'pending' | 'ongoing' | 'completed' | 'cancelled';

/** Responder status */
export type ResponderStatus = 'available' | 'dispatched' | 'en_route' | 'on_scene' | 'returning';

// =============================================================================
// SVG ICON GENERATORS - Create custom SVG icons for Leaflet markers
// =============================================================================

/**
 * Creates an SVG string for incident markers with a pulsing effect for active incidents
 */
const createIncidentSvg = (severity: IncidentSeverity, status: IncidentStatus): string => {
  const colors: Record<IncidentSeverity, { fill: string; stroke: string }> = {
    critical: { fill: '#DC2626', stroke: '#991B1B' },   // Red
    high: { fill: '#F97316', stroke: '#C2410C' },       // Orange
    medium: { fill: '#EAB308', stroke: '#A16207' },     // Yellow
    low: { fill: '#22C55E', stroke: '#15803D' },        // Green
  };

  const color = colors[severity];
  const isPending = status === 'pending';
  const isOngoing = status === 'ongoing';
  const pulseAnimation = (isPending || isOngoing) ? `
    <animate attributeName="r" values="12;16;12" dur="1.5s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite"/>
  ` : '';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -5 50 60" width="32" height="40">
      <!-- Pulse effect for active incidents -->
      ${(isPending || isOngoing) ? `
        <circle cx="20" cy="20" r="12" fill="${color.fill}" opacity="0.4">
          ${pulseAnimation}
        </circle>
      ` : ''}
      
      <!-- Main marker pin shape -->
      <path d="M20 0 C8.954 0 0 8.954 0 20 C0 35 20 50 20 50 C20 50 40 35 40 20 C40 8.954 31.046 0 20 0 Z" 
            fill="${color.fill}" stroke="${color.stroke}" stroke-width="2"/>
      
      <!-- Exclamation mark icon -->
      <circle cx="20" cy="18" r="10" fill="white" opacity="0.9"/>
      <text x="20" y="23" text-anchor="middle" font-size="16" font-weight="bold" fill="${color.fill}">!</text>
      
      ${status === 'completed' ? `
        <!-- Checkmark overlay for completed -->
        <circle cx="32" cy="8" r="7" fill="#22C55E" stroke="white" stroke-width="2"/>
        <path d="M28 8 L31 11 L36 5" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
      ` : ''}
    </svg>
  `;
};

/**
 * Creates an SVG string for ambulance markers
 */
const createAmbulanceSvg = (status: ResponderStatus): string => {
  const statusColors: Record<ResponderStatus, string> = {
    available: '#22C55E',     // Green
    dispatched: '#3B82F6',    // Blue
    en_route: '#8B5CF6',      // Purple
    on_scene: '#F97316',      // Orange
    returning: '#6B7280',     // Gray
  };

  const color = statusColors[status];
  const isMoving = status === 'en_route' || status === 'dispatched';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="45" height="45">
      <!-- Status indicator ring -->
      <circle cx="20" cy="20" r="18" fill="white" stroke="${color}" stroke-width="3"/>
      
      ${isMoving ? `
        <!-- Movement pulse for en_route -->
        <circle cx="20" cy="20" r="18" fill="none" stroke="${color}" stroke-width="2" opacity="0.5">
          <animate attributeName="r" values="18;24;18" dur="1s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.5;0;0.5" dur="1s" repeatCount="indefinite"/>
        </circle>
      ` : ''}
      
      <!-- Ambulance icon -->
      <rect x="8" y="12" width="24" height="14" rx="2" fill="white" stroke="${color}" stroke-width="2"/>
      <rect x="8" y="12" width="8" height="14" fill="${color}"/>
      <path d="M20 16 v6 M17 19 h6" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="12" cy="28" r="3" fill="${color}"/>
      <circle cx="28" cy="28" r="3" fill="${color}"/>
    </svg>
  `;
};

/**
 * Creates an SVG string for hospital markers
 */
const createHospitalSvg = (): string => {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="36" height="36">
      <!-- Background circle -->
      <circle cx="20" cy="20" r="18" fill="#FEE2E2" stroke="#DC2626" stroke-width="2"/>
      
      <!-- Hospital building icon -->
      <rect x="14" y="10" width="12" height="20" fill="white" stroke="#DC2626" stroke-width="2"/>
      <path d="M17 18 h6 M20 15 v6" stroke="#DC2626" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  `;
};

// =============================================================================
// LEAFLET ICON FACTORIES - Create L.DivIcon instances for use with react-leaflet
// =============================================================================

/**
 * Creates a Leaflet icon for incidents
 */
export const createIncidentIcon = (severity: IncidentSeverity, status: IncidentStatus): L.DivIcon => {
  const svg = createIncidentSvg(severity, status);
  
  return L.divIcon({
    html: svg,
    className: 'incident-marker',
    iconSize: [32, 40],
    iconAnchor: [16, 40],  // Bottom center of the pin
    popupAnchor: [0, -40], // Above the marker
  });
};

/**
 * Creates a Leaflet icon for ambulances
 */
export const createAmbulanceIcon = (status: ResponderStatus): L.DivIcon => {
  const svg = createAmbulanceSvg(status);
  
  return L.divIcon({
    html: svg,
    className: 'responder-marker',
    iconSize: [45, 45],
    iconAnchor: [22, 22],  // Center of the icon
    popupAnchor: [0, -25], // Above the marker
  });
};

/**
 * Creates a Leaflet icon for hospitals
 */
export const createHospitalIcon = (): L.DivIcon => {
  const svg = createHospitalSvg();
  
  return L.divIcon({
    html: svg,
    className: 'facility-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],  // Center of the icon
    popupAnchor: [0, -20], // Above the marker
  });
};

// =============================================================================
// PRE-BUILT ICON INSTANCES - Ready-to-use icons for common scenarios
// =============================================================================

export const MapIcons = {
  // Incident icons by severity and status
  incident: {
    critical: {
      pending: createIncidentIcon('critical', 'pending'),
      ongoing: createIncidentIcon('critical', 'ongoing'),
      completed: createIncidentIcon('critical', 'completed'),
    },
    high: {
      pending: createIncidentIcon('high', 'pending'),
      ongoing: createIncidentIcon('high', 'ongoing'),
      completed: createIncidentIcon('high', 'completed'),
    },
    medium: {
      pending: createIncidentIcon('medium', 'pending'),
      ongoing: createIncidentIcon('medium', 'ongoing'),
      completed: createIncidentIcon('medium', 'completed'),
    },
    low: {
      pending: createIncidentIcon('low', 'pending'),
      ongoing: createIncidentIcon('low', 'ongoing'),
      completed: createIncidentIcon('low', 'completed'),
    },
  },

  // Ambulance icons by status
  ambulance: {
    available: createAmbulanceIcon('available'),
    dispatched: createAmbulanceIcon('dispatched'),
    en_route: createAmbulanceIcon('en_route'),
    on_scene: createAmbulanceIcon('on_scene'),
    returning: createAmbulanceIcon('returning'),
  },

  // Hospital icon
  hospital: createHospitalIcon(),
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get the appropriate incident icon based on severity and status
 */
export const getIncidentIcon = (severity: IncidentSeverity, status: IncidentStatus): L.DivIcon => {
  return createIncidentIcon(severity, status);
};

/**
 * Get the appropriate ambulance icon based on status
 */
export const getAmbulanceIcon = (status: ResponderStatus): L.DivIcon => {
  return createAmbulanceIcon(status);
};

/**
 * Get the hospital icon
 */
export const getHospitalIcon = (): L.DivIcon => {
  return createHospitalIcon();
};

// =============================================================================
// MAP LEGEND COMPONENT - Collapsible legend for map markers
// =============================================================================

export const MapLegend: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
      >
        <h3 className="font-semibold text-gray-800 text-sm">Map Legend</h3>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Collapsible Content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="px-3 pb-3 space-y-3">
          {/* Incidents */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-600">Incidents</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span>Critical</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              <span>High Priority</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span>Low</span>
            </div>
          </div>

          {/* Ambulances */}
          <div className="space-y-1 pt-2 border-t">
            <p className="text-xs font-medium text-gray-600">Ambulances</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span>Dispatched</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-purple-500"></span>
              <span>En Route</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              <span>On Scene</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-gray-500"></span>
              <span>Returning</span>
            </div>
          </div>

          {/* Facilities */}
          <div className="space-y-1 pt-2 border-t">
            <p className="text-xs font-medium text-gray-600">Facilities</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-red-200 border border-red-500"></span>
              <span>Hospital</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapIcons;