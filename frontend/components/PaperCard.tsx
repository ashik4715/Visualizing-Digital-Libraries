'use client';

import React from 'react';
import { Paper } from '@/lib/types';

interface PaperCardProps {
  paper: Paper;
  onClose?: () => void;
}

export default function PaperCard({ paper, onClose }: PaperCardProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
          <h2 className="text-2xl font-bold text-gray-900 pr-4">{paper.title}</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              aria-label="Close"
            >
              ×
            </button>
          )}
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Authors</h3>
            <p className="text-gray-800">{paper.authors.join(', ')}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Abstract</h3>
            <p className="text-gray-700 leading-relaxed">{paper.abstract}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Year</h3>
              <p className="text-gray-800">{paper.year}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Venue</h3>
              <p className="text-gray-800">{paper.venue}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Citations</h3>
              <p className="text-gray-800">{paper.citations}</p>
            </div>
            {paper.cluster_name && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Topic</h3>
                <p className="text-gray-800">{paper.cluster_name}</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {paper.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

