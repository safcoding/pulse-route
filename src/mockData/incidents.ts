import type { Incident, Hospital, UnitDetail } from "./types";

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 1,
    type: "Medical Distress",
    status: "Pending",
    time: "5 mins ago",
    location: "Jalan USJ 1/20, Subang Jaya",
    caller: "Sarah Johnson",
    responder: null,
    unitType: "BLS",
  },
  {
    id: 2,
    type: "Vehicle Collision",
    status: "Ongoing",
    time: "12 mins ago",
    location: "Persiaran Kewajipan, USJ 1",
    caller: "Ahmad bin Ali",
    responder: "Unit Alpha-7",
    unitType: "ALS",
  },
  {
    id: 3,
    type: "Fire Alarm",
    status: "Completed",
    time: "45 mins ago",
    location: "Jalan USJ 3/1E",
    caller: "Building Manager",
    responder: "Unit Bravo-3",
    unitType: "BLS",
  },
];

export const MOCK_HOSPITALS: Hospital[] = [
    {
        id: 1,
        name: "Subang Jaya Medical Centre",
        distance: "2.1 km",
        availableUnits: [
            { type: "BLS", count: 3, description: "Basic Life Support" },
            { type: "ALS", count: 2, description: "Advanced Life Support" },
        ]
    },
    {
        id: 2,
        name: "Columbia Asia Hospital",
        distance: "3.5 km",
        availableUnits: [
            { type: "BLS", count: 2, description: "Basic Life Support" },
            { type: "CCT", count: 1, description: "Critical Care Transport" },
        ]
    },
];

export const MOCK_AVAILABLE_UNITS: UnitDetail[] = [
    { callsign: "BLS-01", distanceKm: 1.2, etaMinutes: 4, type: "BLS" },
    { callsign: "BLS-02", distanceKm: 2.5, etaMinutes: 7, type: "BLS" },
    { callsign: "ALS-01", distanceKm: 3.1, etaMinutes: 9, type: "ALS" },
    { callsign: "CCT-01", distanceKm: 4.0, etaMinutes: 12, type: "CCT" },
];