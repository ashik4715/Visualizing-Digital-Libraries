"""
K-means clustering implementation using TF-IDF vectors.
"""
from typing import List, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import numpy as np
from backend.models.paper import Paper
from backend.clustering.base_clustering import BaseClustering


class KMeansClustering(BaseClustering):
    """K-means clustering for papers using TF-IDF text embeddings."""
    
    def __init__(self):
        self.vectorizer = None
        self.kmeans = None
    
    def cluster(self, papers: List[Paper], n_clusters: int = 5) -> Tuple[List[Paper], List[dict]]:
        """Cluster papers using K-means on TF-IDF vectors."""
        # Prepare documents
        documents = [paper.get_text_for_clustering() for paper in papers]
        
        # Create TF-IDF vectors
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.8
        )
        tfidf_matrix = self.vectorizer.fit_transform(documents)
        
        # Perform K-means clustering
        self.kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        cluster_labels = self.kmeans.fit_predict(tfidf_matrix)
        
        # Get feature names
        feature_names = self.vectorizer.get_feature_names_out()
        
        # Create cluster metadata
        cluster_metadata = []
        for i in range(n_clusters):
            # Get cluster center
            cluster_center = self.kmeans.cluster_centers_[i]
            # Get top terms for this cluster
            top_indices = cluster_center.argsort()[-10:][::-1]
            top_terms = [feature_names[idx] for idx in top_indices]
            cluster_name = f"Cluster {i+1}: {', '.join(top_terms[:3])}"
            
            cluster_metadata.append({
                'id': i,
                'name': cluster_name,
                'top_words': top_terms
            })
        
        # Assign clusters to papers
        for idx, paper in enumerate(papers):
            paper.cluster_id = int(cluster_labels[idx])
            paper.cluster_name = cluster_metadata[cluster_labels[idx]]['name']
        
        return papers, cluster_metadata
    
    def get_method_name(self) -> str:
        """Get the name of the clustering method."""
        return "K-means (TF-IDF)"

