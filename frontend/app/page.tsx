'use client';

import React, { useEffect, useState } from 'react';
import { Paper, Cluster, ClusteringMethod } from '@/lib/types';
import { api } from '@/lib/api';
import BubbleChart from '@/components/BubbleChart';
import PaperCard from '@/components/PaperCard';
import SearchBar from '@/components/SearchBar';
import TopicFilter from '@/components/TopicFilter';

// Color palette for clusters
const CLUSTER_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#6366f1', // indigo
];

export default function Home() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [filteredPapers, setFilteredPapers] = useState<Paper[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [clusteringMethod, setClusteringMethod] = useState<ClusteringMethod>('kmeans');
  const [nClusters, setNClusters] = useState(5);
  const [isClustering, setIsClustering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Filter papers based on search and cluster selection
  useEffect(() => {
    let filtered = papers;

    // Filter by cluster
    if (selectedCluster !== null) {
      filtered = filtered.filter((p) => p.cluster_id === selectedCluster);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.abstract.toLowerCase().includes(query) ||
          p.keywords.some((kw) => kw.toLowerCase().includes(query)) ||
          p.authors.some((a) => a.toLowerCase().includes(query))
      );
    }

    setFilteredPapers(filtered);
  }, [papers, selectedCluster, searchQuery]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [papersData, clustersData] = await Promise.all([
        api.getPapers(),
        api.getClusters(),
      ]);
      setPapers(papersData);
      setFilteredPapers(papersData);
      setClusters(clustersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClustering = async () => {
    try {
      setIsClustering(true);
      setError(null);
      await api.clusterPapers(clusteringMethod, nClusters);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cluster papers');
      console.error('Error clustering:', err);
    } finally {
      setIsClustering(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClusterSelect = (clusterId: number | null) => {
    setSelectedCluster(clusterId);
  };

  const clustersWithColors = clusters.map((cluster, index) => ({
    ...cluster,
    color: CLUSTER_COLORS[index % CLUSTER_COLORS.length],
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading papers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Digital Library Visualization
          </h1>
          <p className="text-gray-600">
            Interactive visualization of academic papers grouped by topic clusters
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-1 space-y-4">
            <SearchBar onSearch={handleSearch} />
            
            <TopicFilter
              clusters={clustersWithColors}
              selectedCluster={selectedCluster}
              onClusterSelect={handleClusterSelect}
              colors={CLUSTER_COLORS}
            />

            {/* Clustering Controls */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Clustering</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Method
                  </label>
                  <select
                    value={clusteringMethod}
                    onChange={(e) => setClusteringMethod(e.target.value as ClusteringMethod)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="kmeans">K-means</option>
                    <option value="lda">LDA</option>
                    <option value="hierarchical">Hierarchical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Clusters
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="20"
                    value={nClusters}
                    onChange={(e) => setNClusters(parseInt(e.target.value) || 5)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleClustering}
                  disabled={isClustering}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isClustering ? 'Clustering...' : 'Re-cluster Papers'}
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Papers:</span>
                  <span className="font-semibold">{papers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Clusters:</span>
                  <span className="font-semibold">{clusters.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Filtered:</span>
                  <span className="font-semibold">{filteredPapers.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Visualization */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Paper Visualization</h2>
                <div className="text-sm text-gray-600">
                  Showing {filteredPapers.length} of {papers.length} papers
                </div>
              </div>
              {filteredPapers.length > 0 ? (
                <BubbleChart
                  papers={filteredPapers}
                  clusters={clustersWithColors}
                  onPaperClick={setSelectedPaper}
                />
              ) : (
                <div className="flex items-center justify-center h-96 text-gray-500">
                  <div className="text-center">
                    <p className="text-lg mb-2">No papers found</p>
                    <p className="text-sm">Try adjusting your filters or search query</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Paper Detail Modal */}
      {selectedPaper && (
        <PaperCard paper={selectedPaper} onClose={() => setSelectedPaper(null)} />
      )}
    </div>
  );
}

