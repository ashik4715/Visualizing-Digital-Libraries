/**
 * API client for communicating with the backend.
 */
import { Paper, Cluster, SearchResult, Stats, ClusteringMethod } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  /**
   * Get all papers with optional filters.
   */
  async getPapers(params?: {
    cluster_id?: number;
    year?: number;
    search?: string;
  }): Promise<Paper[]> {
    const queryParams = new URLSearchParams();
    if (params?.cluster_id !== undefined) {
      queryParams.append('cluster_id', params.cluster_id.toString());
    }
    if (params?.year !== undefined) {
      queryParams.append('year', params.year.toString());
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }

    const queryString = queryParams.toString();
    return fetchAPI<Paper[]>(`/api/papers${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get cluster information.
   */
  async getClusters(): Promise<Cluster[]> {
    return fetchAPI<Cluster[]>('/api/clusters');
  },

  /**
   * Re-cluster papers using the specified method.
   */
  async clusterPapers(method: ClusteringMethod, nClusters: number = 5): Promise<void> {
    await fetchAPI(`/api/cluster/${method}?n_clusters=${nClusters}`, {
      method: 'POST',
    });
  },

  /**
   * Search papers by keyword.
   */
  async searchPapers(query: string, limit: number = 50): Promise<SearchResult> {
    return fetchAPI<SearchResult>(`/api/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  },

  /**
   * Get collection statistics.
   */
  async getStats(): Promise<Stats> {
    return fetchAPI<Stats>('/api/stats');
  },
};

