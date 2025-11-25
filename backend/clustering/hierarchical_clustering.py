"""
Hierarchical (Agglomerative) clustering implementation.
"""
from typing import List, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import AgglomerativeClustering
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from backend.models.paper import Paper
from backend.clustering.base_clustering import BaseClustering


class HierarchicalClustering(BaseClustering):
    """Hierarchical clustering for papers using TF-IDF vectors."""
    
    def __init__(self):
        self.vectorizer = None
        self.clustering = None
    
    def cluster(self, papers: List[Paper], n_clusters: int = 5) -> Tuple[List[Paper], List[dict]]:
        """Cluster papers using hierarchical clustering."""
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
        
        # Perform hierarchical clustering
        self.clustering = AgglomerativeClustering(
            n_clusters=n_clusters,
            linkage='ward',
            metric='euclidean'
        )
        cluster_labels = self.clustering.fit_predict(tfidf_matrix.toarray())
        
        # Get feature names
        feature_names = self.vectorizer.get_feature_names_out()
        
        # Create cluster metadata by analyzing papers in each cluster
        cluster_metadata = []
        for i in range(n_clusters):
            # Get papers in this cluster
            cluster_indices = np.where(cluster_labels == i)[0]
            cluster_docs = [documents[idx] for idx in cluster_indices]
            
            # Calculate term frequencies for this cluster
            if cluster_docs:
                cluster_text = ' '.join(cluster_docs)
                cluster_vector = self.vectorizer.transform([cluster_text])
                cluster_center = cluster_vector.toarray()[0]
                top_indices = cluster_center.argsort()[-10:][::-1]
                top_terms = [feature_names[idx] for idx in top_indices if cluster_center[idx] > 0]
            else:
                top_terms = []
            
            if not top_terms:
                top_terms = [f"term_{j}" for j in range(3)]
            
            cluster_name = f"Group {i+1}: {', '.join(top_terms[:3])}"
            
            cluster_metadata.append({
                'id': i,
                'name': cluster_name,
                'top_words': top_terms[:10] if top_terms else [],
                'size': len(cluster_indices)
            })
        
        # Assign clusters to papers
        for idx, paper in enumerate(papers):
            paper.cluster_id = int(cluster_labels[idx])
            paper.cluster_name = cluster_metadata[cluster_labels[idx]]['name']
        
        return papers, cluster_metadata
    
    def get_method_name(self) -> str:
        """Get the name of the clustering method."""
        return "Hierarchical (Agglomerative)"

