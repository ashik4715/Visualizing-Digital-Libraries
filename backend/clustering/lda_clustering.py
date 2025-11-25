"""
LDA (Latent Dirichlet Allocation) clustering implementation.
"""
from typing import List, Tuple
import gensim
from gensim import corpora
from gensim.models import LdaModel
import re
from backend.models.paper import Paper
from backend.clustering.base_clustering import BaseClustering


class LDAClustering(BaseClustering):
    """LDA-based topic modeling for paper clustering."""
    
    def __init__(self):
        self.model = None
        self.dictionary = None
    
    def _preprocess_text(self, text: str) -> List[str]:
        """Preprocess text for LDA."""
        # Convert to lowercase and split
        text = text.lower()
        # Remove special characters and digits
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        # Split into words
        words = text.split()
        # Remove short words (less than 3 characters)
        words = [w for w in words if len(w) > 2]
        return words
    
    def cluster(self, papers: List[Paper], n_clusters: int = 5) -> Tuple[List[Paper], List[dict]]:
        """Cluster papers using LDA topic modeling."""
        # Prepare documents
        documents = []
        for paper in papers:
            text = paper.get_text_for_clustering()
            words = self._preprocess_text(text)
            documents.append(words)
        
        # Create dictionary and corpus
        self.dictionary = corpora.Dictionary(documents)
        # Filter extremes
        self.dictionary.filter_extremes(no_below=2, no_above=0.5)
        corpus = [self.dictionary.doc2bow(doc) for doc in documents]
        
        # Train LDA model
        self.model = LdaModel(
            corpus=corpus,
            id2word=self.dictionary,
            num_topics=n_clusters,
            random_state=42,
            passes=10,
            alpha='auto',
            per_word_topics=True
        )
        
        # Assign clusters to papers
        cluster_metadata = []
        for i in range(n_clusters):
            topic_words = self.model.show_topic(i, topn=10)
            topic_name = f"Topic {i+1}: {', '.join([word for word, _ in topic_words[:3]])}"
            cluster_metadata.append({
                'id': i,
                'name': topic_name,
                'top_words': [word for word, _ in topic_words]
            })
        
        # Assign each paper to its dominant topic
        for idx, paper in enumerate(papers):
            doc_topics = self.model.get_document_topics(corpus[idx])
            # Get the topic with highest probability
            dominant_topic = max(doc_topics, key=lambda x: x[1])
            paper.cluster_id = dominant_topic[0]
            paper.cluster_name = cluster_metadata[dominant_topic[0]]['name']
        
        return papers, cluster_metadata
    
    def get_method_name(self) -> str:
        """Get the name of the clustering method."""
        return "LDA (Latent Dirichlet Allocation)"

