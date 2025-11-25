'use client';

import React from 'react';
import { Cluster } from '@/lib/types';

interface TopicFilterProps {
  clusters: Cluster[];
  selectedCluster: number | null;
  onClusterSelect: (clusterId: number | null) => void;
  colors: string[];
}

export default function TopicFilter({
  clusters,
  selectedCluster,
  onClusterSelect,
  colors,
}: TopicFilterProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Topics</h3>
      <div className="space-y-2">
        <button
          onClick={() => onClusterSelect(null)}
          className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
            selectedCluster === null
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Topics
        </button>
        {clusters.map((cluster, index) => (
          <button
            key={cluster.id}
            onClick={() => onClusterSelect(cluster.id)}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
              selectedCluster === cluster.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{cluster.name}</div>
              {cluster.size !== undefined && (
                <div className="text-xs opacity-75">{cluster.size} papers</div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

