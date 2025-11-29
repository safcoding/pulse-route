export type IncidentStatus = 'Pending' | 'Ongoing' | 'Completed' | 'Cancelled';
export type UnitType = 'BLS' | 'ALS' | 'CCT' | 'MICU';

export interface HospitalUnit {
    type: UnitType;
    count: number;
    description: string;
}

export interface Hospital {
    id: number;
    name: string;
    distance: string;
    availableUnits: HospitalUnit[];
}

export interface UnitDetail {
    callsign: string;
    distanceKm: number;
    etaMinutes: number;
    type: UnitType;
}

export interface Incident {
  id: number;
  type: string;
  status: IncidentStatus;
  time: string;
  location: string;
  caller: string;
  responder: string | null;
  unitType: UnitType;
}