import { env } from '../env';

const API_BASE_URL = env.NEXT_PUBLIC_API_URL;

export async function getHospitals() {
  const response = await fetch(`${API_BASE_URL}/hospitals`);
  if (!response.ok) throw new Error('Failed to fetch hospitals');
  const json = await response.json();
  // Extract the data array from the response
  return json.data || [];
}

export async function getHospitalById(id: number) {
  const response = await fetch(`${API_BASE_URL}/hospitals/${id}`);
  if (!response.ok) throw new Error('Failed to fetch hospital');
  const json = await response.json();
  return json.data || json;
}

export async function getIncidents() {
  const response = await fetch(`${API_BASE_URL}/incidents`);
  if (!response.ok) throw new Error('Failed to fetch incidents');
  const json = await response.json();
  return json.data || [];
}

export async function createIncident(data: any) {
  const response = await fetch(`${API_BASE_URL}/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create incident');
  const json = await response.json();
  return json.data || json;
}

export async function updateIncident(id: number, data: any) {
  const response = await fetch(`${API_BASE_URL}/incidents/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update incident');
  const json = await response.json();
  return json.data || json;
}

export async function getAmbulances() {
  const response = await fetch(`${API_BASE_URL}/ambulances`);
  if (!response.ok) throw new Error('Failed to fetch ambulances');
  const json = await response.json();
  return json.data || [];
}