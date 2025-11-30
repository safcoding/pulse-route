import { env } from '~/env';


const API_BASE_URL: string = env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message?: string
  ) {
    super(message ?? `API Error: ${status} ${statusText}`);
    this.name = 'ApiError';
  }
}

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

interface ErrorBody {
  message?: string;
  error?: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message: string | undefined;
    try {
      const errorBody = (await response.json()) as ErrorBody;
      message = errorBody.message ?? errorBody.error;
    } catch {
      // Ignore JSON parsing errors
    }
    throw new ApiError(response.status, response.statusText, message);
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}

function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  return url.toString();
}

export async function apiGet<T>(endpoint: string, options?: FetchOptions): Promise<T> {
  const { params, ...fetchOptions } = options ?? {};
  const url = buildUrl(endpoint, params);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions?.headers,
    },
    ...fetchOptions,
  });

  return handleResponse<T>(response);
}

export async function apiPost<T, D = unknown>(
  endpoint: string,
  data?: D,
  options?: FetchOptions
): Promise<T> {
  const { params, ...fetchOptions } = options ?? {};
  const url = buildUrl(endpoint, params);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions?.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
    ...fetchOptions,
  });

  return handleResponse<T>(response);
}

export async function apiPatch<T, D = unknown>(
  endpoint: string,
  data?: D,
  options?: FetchOptions
): Promise<T> {
  const { params, ...fetchOptions } = options ?? {};
  const url = buildUrl(endpoint, params);

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions?.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
    ...fetchOptions,
  });

  return handleResponse<T>(response);
}

export async function apiPut<T, D = unknown>(
  endpoint: string,
  data?: D,
  options?: FetchOptions
): Promise<T> {
  const { params, ...fetchOptions } = options ?? {};
  const url = buildUrl(endpoint, params);

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions?.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
    ...fetchOptions,
  });

  return handleResponse<T>(response);
}

export async function apiDelete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
  const { params, ...fetchOptions } = options ?? {};
  const url = buildUrl(endpoint, params);

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions?.headers,
    },
    ...fetchOptions,
  });

  return handleResponse<T>(response);
}
