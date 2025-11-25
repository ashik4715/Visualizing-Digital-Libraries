/**
 * TypeScript types for the Digital Library Visualization application.
 */

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  keywords: string[];
  year: number;
  venue: string;
  citations: number;
  cluster_id: number | null;
  cluster_name: string | null;
}

export interface Cluster {
  id: number;
  name: string;
  top_words: string[];
  size?: number;
}

export interface SearchResult {
  query: string;
  results: Paper[];
  total: number;
}

export interface Stats {
  total_papers: number;
  total_clusters: number;
  current_method: string;
  year_range: {
    min: number;
    max: number;
  };
  citations: {
    total: number;
    average: number;
    max: number;
  };
  venues: number;
}

export type ClusteringMethod = 'lda' | 'kmeans' | 'hierarchical';

