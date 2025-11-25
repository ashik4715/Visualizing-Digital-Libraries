"""
FastAPI backend for Digital Library Visualization.
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from backend.models.paper import Paper
from backend.data.data_loader import load_papers
from backend.clustering.lda_clustering import LDAClustering
from backend.clustering.kmeans_clustering import KMeansClustering
from backend.clustering.hierarchical_clustering import HierarchicalClustering

app = FastAPI(title="Digital Library Visualization API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
papers: List[Paper] = []
clusters: List[dict] = []
current_method: str = "kmeans"


# Pydantic models for API responses
class PaperResponse(BaseModel):
    id: str
    title: str
    authors: List[str]
    abstract: str
    keywords: List[str]
    year: int
    venue: str
    citations: int
    cluster_id: Optional[int] = None
    cluster_name: Optional[str] = None

    class Config:
        from_attributes = True


class ClusterResponse(BaseModel):
    id: int
    name: str
    top_words: List[str]
    size: Optional[int] = None


@app.on_event("startup")
async def startup_event():
    """Load papers and perform initial clustering on startup."""
    global papers, clusters, current_method
    papers = load_papers()
    # Perform initial clustering
    await recluster_papers("kmeans")


async def recluster_papers(method: str, n_clusters: int = 5):
    """Re-cluster papers using the specified method."""
    global papers, clusters, current_method
    
    if method == "lda":
        clusterer = LDAClustering()
    elif method == "kmeans":
        clusterer = KMeansClustering()
    elif method == "hierarchical":
        clusterer = HierarchicalClustering()
    else:
        raise ValueError(f"Unknown clustering method: {method}")
    
    papers, clusters = clusterer.cluster(papers, n_clusters=n_clusters)
    current_method = method


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Digital Library Visualization API",
        "version": "1.0.0",
        "endpoints": {
            "/api/papers": "Get all papers",
            "/api/clusters": "Get cluster information",
            "/api/cluster/{method}": "Re-cluster papers",
            "/api/search": "Search papers"
        }
    }


@app.get("/api/papers", response_model=List[PaperResponse])
async def get_papers(
    cluster_id: Optional[int] = Query(None, description="Filter by cluster ID"),
    year: Optional[int] = Query(None, description="Filter by publication year"),
    search: Optional[str] = Query(None, description="Search in title, abstract, keywords")
):
    """Get all papers with optional filtering."""
    global papers
    
    filtered_papers = papers
    
    # Filter by cluster
    if cluster_id is not None:
        filtered_papers = [p for p in filtered_papers if p.cluster_id == cluster_id]
    
    # Filter by year
    if year is not None:
        filtered_papers = [p for p in filtered_papers if p.year == year]
    
    # Search
    if search:
        search_lower = search.lower()
        filtered_papers = [
            p for p in filtered_papers
            if (search_lower in p.title.lower() or
                search_lower in p.abstract.lower() or
                any(search_lower in kw.lower() for kw in p.keywords))
        ]
    
    return filtered_papers


@app.get("/api/clusters", response_model=List[ClusterResponse])
async def get_clusters():
    """Get cluster information."""
    global clusters
    return clusters


@app.post("/api/cluster/{method}")
async def cluster_papers(
    method: str,
    n_clusters: int = Query(5, ge=2, le=20, description="Number of clusters")
):
    """Re-cluster papers using the specified method."""
    valid_methods = ["lda", "kmeans", "hierarchical"]
    if method not in valid_methods:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid method. Must be one of: {', '.join(valid_methods)}"
        )
    
    try:
        await recluster_papers(method, n_clusters)
        return {
            "message": f"Papers clustered using {method}",
            "method": method,
            "n_clusters": n_clusters,
            "clusters": len(clusters)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/search")
async def search_papers(
    q: str = Query(..., description="Search query"),
    limit: int = Query(50, ge=1, le=200, description="Maximum number of results")
):
    """Search papers by keyword."""
    global papers
    
    query_lower = q.lower()
    results = []
    
    for paper in papers:
        score = 0
        # Title match (highest weight)
        if query_lower in paper.title.lower():
            score += 10
        # Keyword match
        for keyword in paper.keywords:
            if query_lower in keyword.lower():
                score += 5
        # Abstract match
        if query_lower in paper.abstract.lower():
            score += 2
        
        if score > 0:
            results.append((paper, score))
    
    # Sort by score (descending)
    results.sort(key=lambda x: x[1], reverse=True)
    
    # Return top results
    return {
        "query": q,
        "results": [paper.to_dict() for paper, _ in results[:limit]],
        "total": len(results)
    }


@app.get("/api/stats")
async def get_stats():
    """Get statistics about the paper collection."""
    global papers, clusters
    
    if not papers:
        return {"error": "No papers loaded"}
    
    years = [p.year for p in papers]
    citations = [p.citations for p in papers]
    
    return {
        "total_papers": len(papers),
        "total_clusters": len(clusters),
        "current_method": current_method,
        "year_range": {
            "min": min(years),
            "max": max(years)
        },
        "citations": {
            "total": sum(citations),
            "average": sum(citations) / len(citations) if citations else 0,
            "max": max(citations) if citations else 0
        },
        "venues": len(set(p.venue for p in papers))
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

