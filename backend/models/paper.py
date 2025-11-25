from dataclasses import dataclass
from typing import List, Optional
from datetime import datetime


@dataclass
class Paper:
    """Data model for academic papers."""
    id: str
    title: str
    authors: List[str]
    abstract: str
    keywords: List[str]
    year: int
    venue: str
    citations: int = 0
    cluster_id: Optional[int] = None
    cluster_name: Optional[str] = None
    
    def to_dict(self) -> dict:
        """Convert Paper to dictionary for JSON serialization."""
        return {
            'id': self.id,
            'title': self.title,
            'authors': self.authors,
            'abstract': self.abstract,
            'keywords': self.keywords,
            'year': self.year,
            'venue': self.venue,
            'citations': self.citations,
            'cluster_id': self.cluster_id,
            'cluster_name': self.cluster_name
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Paper':
        """Create Paper from dictionary."""
        return cls(
            id=data['id'],
            title=data['title'],
            authors=data['authors'],
            abstract=data['abstract'],
            keywords=data['keywords'],
            year=data['year'],
            venue=data['venue'],
            citations=data.get('citations', 0),
            cluster_id=data.get('cluster_id'),
            cluster_name=data.get('cluster_name')
        )
    
    def get_text_for_clustering(self) -> str:
        """Get combined text for clustering (title + abstract + keywords)."""
        return f"{self.title} {' '.join(self.keywords)} {self.abstract}"

