'use client'
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Popup, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// --- Icons Configuration ---
const driverIcon = L.icon({
  iconUrl: "/ambulance.png",
  iconSize: [45, 45],
  iconAnchor: [5, 5],
  popupAnchor: [0, -20],
});

// Standard Leaflet markers for Start/End (or use your own images)
const locationIcon = L.icon({
  iconUrl: "/incident.png",
  iconSize: [30, 30],
  iconAnchor: [5, 5],
  popupAnchor: [1, -34],
});

// --- Simulation Data ---
// 1. Restaurant Location
const restaurantPos: [number, number] = [3.0552, 101.5850];

// 2. User Location
const userPos: [number, number] = [3.0580, 101.5900];

// 3. The Route (A list of coordinates connecting them)
// In a real app, you would get this from a Routing API (like OSRM or Mapbox)
const routePath: [number, number][] = [
  [3.0552, 101.5850], // Start
  [3.0555, 101.5855],
  [3.0560, 101.5860],
  [3.0565, 101.5870],
  [3.0570, 101.5880],
  [3.0575, 101.5890],
  [3.0580, 101.5900]  // End
];

export default function Map() {
  const [currentStep, setCurrentStep] = useState(0);

  // Animation Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        // If we reached the end, restart (or stop)
        if (prev >= routePath.length - 1) return 0;
        return prev + 1;
      });
    }, 1000); // Move every 1 second

    return () => clearInterval(interval);
  }, []);

  // Calculate current position based on step
  const driverPosition: [number, number] = routePath[currentStep] ?? routePath[0]!;

  return (
    <MapContainer
      center={[3.0565, 101.5875]} // Center between the two points
      zoom={16}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <© OpenStreetMap contributors © CARTO'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {/* 1. The Route Line */}
      <Polyline positions={routePath} color="blue" weight={5} opacity={0.6} />

      {/* 2. Restaurant Marker */}
      <Marker position={restaurantPos} icon={locationIcon}>
        <Popup>Restaurant: Burger King</Popup>
      </Marker>

      {/* 3. User Marker */}
      <Marker position={userPos} icon={locationIcon}>
        <Popup>Customer: John Doe</Popup>
      </Marker>

      {/* 4. The Moving Driver */}
      <Marker position={driverPosition} icon={driverIcon}>
        <Popup>Driver is here!</Popup>
      </Marker>

    </MapContainer>
  );
}