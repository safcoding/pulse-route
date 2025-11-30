import { apiGet, apiPost, apiDelete } from '../client';
import type {
  ApiResponse,
  CreateScenarioRequest,
  CreateScenarioResponse,
  SeedIncidentsRequest,
  SeedIncidentsResponse,
  AnalyzeTextRequest,
  AnalyzeTextResponse,
  SimulationStatus,
} from '../types';

/**
 * Create a demo scenario (God Mode)
 * Creates a new incident without triggering phone call simulation
 */
export async function createScenario(
  data: CreateScenarioRequest
): Promise<CreateScenarioResponse> {
  const response = await apiPost<ApiResponse<CreateScenarioResponse>, CreateScenarioRequest>(
    '/api/simulation/scenario',
    data
  );
  return response.data;
}

/**
 * Seed multiple random incidents for demo purposes
 */
export async function seedIncidents(
  data: SeedIncidentsRequest
): Promise<SeedIncidentsResponse> {
  const response = await apiPost<ApiResponse<SeedIncidentsResponse>, SeedIncidentsRequest>(
    '/api/simulation/seed',
    data
  );
  return response.data;
}

/**
 * Mock AI analysis of incident description text
 */
export async function analyzeText(
  data: AnalyzeTextRequest
): Promise<AnalyzeTextResponse> {
  const response = await apiPost<ApiResponse<AnalyzeTextResponse>, AnalyzeTextRequest>(
    '/api/ai/analyze',
    data
  );
  return response.data;
}

/**
 * Get status of all active simulations
 */
export async function getSimulationStatus(): Promise<SimulationStatus> {
  const response = await apiGet<ApiResponse<SimulationStatus>>(
    '/api/simulation/status'
  );
  return response.data;
}

/**
 * Cancel a specific simulation by incident ID
 */
export async function cancelSimulation(incidentId: string): Promise<void> {
  await apiDelete(`/api/dispatch/simulations/${incidentId}`);
}

/**
 * Cancel all active simulations
 */
export async function cancelAllSimulations(): Promise<void> {
  await apiDelete('/api/simulation/all');
}
