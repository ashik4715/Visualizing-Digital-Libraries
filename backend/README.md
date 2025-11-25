# Backend - Digital Library Visualization

Python backend service for clustering and serving academic paper data.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Generate sample data (if needed):
```bash
python -m backend.data.sample_data_generator
```

3. Run the API server:
```bash
python -m backend.api.main
```

Or using uvicorn directly:
```bash
uvicorn backend.api.main:app --reload --port 8000
```

## API Endpoints

- `GET /` - API information
- `GET /api/papers` - Get all papers (supports query params: `cluster_id`, `year`, `search`)
- `GET /api/clusters` - Get cluster information
- `POST /api/cluster/{method}` - Re-cluster papers (methods: `lda`, `kmeans`, `hierarchical`)
- `GET /api/search?q={query}` - Search papers
- `GET /api/stats` - Get collection statistics

## Clustering Methods

1. **LDA (Latent Dirichlet Allocation)**: Topic modeling approach
2. **K-means**: TF-IDF vectorization with K-means clustering
3. **Hierarchical**: Agglomerative clustering with ward linkage

