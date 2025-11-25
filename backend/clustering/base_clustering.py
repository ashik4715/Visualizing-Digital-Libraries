"""
Base class for clustering algorithms.
"""
from abc import ABC, abstractmethod
from typing import List, Tuple
from backend.models.paper import Paper


class BaseClustering(ABC):
    """Abstract base class for clustering algorithms."""
    
    @abstractmethod
    def cluster(self, papers: List[Paper], n_clusters: int = 5) -> Tuple[List[Paper], List[dict]]:
        """
        Cluster papers into topics.
        
        Args:
            papers: List of Paper objects to cluster
            n_clusters: Number of clusters to create
            
        Returns:
            Tuple of (updated papers with cluster assignments, cluster metadata)
        """
        pass
    
    @abstractmethod
    def get_method_name(self) -> str:
        """Get the name of the clustering method."""
        pass

