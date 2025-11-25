# Technical Documentation

## Architecture Overview

The Digital Library Visualization system follows a client-server architecture:

```
┌─────────────────┐         HTTP/REST          ┌─────────────────┐
│                 │ ◄─────────────────────────► │                 │
│   Next.js       │                             │   FastAPI       │
│   Frontend      │                             │   Backend       │
│                 │                             │                 │
│  - React        │                             │  - Python       │
│  - TypeScript   │                             │  - Clustering   │
│  - D3.js        │                             │  - Data Models  │
│  - Tailwind CSS │                             │                 │
└─────────────────┘                             └─────────────────┘
```

## Backend Architecture

### Directory Structure
```
backend/
├── api/              # FastAPI REST endpoints
│   └── main.py
├── clustering/       # Clustering algorithms
│   ├── base_clustering.py
│   ├── lda_clustering.py
│   ├── kmeans_clustering.py
│   └── hierarchical_clustering.py
├── data/            # Data processing
│   ├── data_loader.py
│   └── sample_data_generator.py
├── models/          # Data models
│   └── paper.py
└── requirements.txt
```

### API Endpoints

#### `GET /`
Returns API information and available endpoints.

#### `GET /api/papers`
Get all papers with optional filtering.

**Query Parameters:**
- `cluster_id` (optional): Filter by cluster ID
- `year` (optional): Filter by publication year
- `search` (optional): Search in title, abstract, keywords

**Response:** Array of Paper objects

#### `GET /api/clusters`
Get cluster information.

**Response:** Array of Cluster objects with metadata

#### `POST /api/cluster/{method}`
Re-cluster papers using specified method.

**Path Parameters:**
- `method`: One of `lda`, `kmeans`, `hierarchical`

**Query Parameters:**
- `n_clusters` (default: 5): Number of clusters (2-20)

**Response:** Clustering result with metadata

#### `GET /api/search`
Search papers by keyword.

**Query Parameters:**
- `q`: Search query (required)
- `limit` (default: 50): Maximum results (1-200)

**Response:** Search results with relevance scores

#### `GET /api/stats`
Get collection statistics.

**Response:** Statistics including total papers, clusters, year range, citations

### Clustering Algorithms

#### LDA (Latent Dirichlet Allocation)
- **Implementation**: `LDAClustering`
- **Library**: Gensim
- **Method**: Probabilistic topic modeling
- **Use Case**: Discovering latent topics in paper collections
- **Parameters**: Number of topics, passes, alpha

#### K-means
- **Implementation**: `KMeansClustering`
- **Library**: scikit-learn
- **Method**: TF-IDF vectorization + K-means clustering
- **Use Case**: Efficient partitioning of papers
- **Parameters**: Number of clusters, max features, n-grams

#### Hierarchical (Agglomerative)
- **Implementation**: `HierarchicalClustering`
- **Library**: scikit-learn
- **Method**: Ward linkage with Euclidean distance
- **Use Case**: Multi-level topic hierarchies
- **Parameters**: Number of clusters, linkage method

### Data Models

#### Paper
```python
@dataclass
class Paper:
    id: str
    title: str
    authors: List[str]
    abstract: str
    keywords: List[str]
    year: int
    venue: str
    citations: int
    cluster_id: Optional[int]
    cluster_name: Optional[str]
```

## Frontend Architecture

### Directory Structure
```
frontend/
├── app/              # Next.js App Router
│   ├── layout.tsx
│   └── page.tsx
├── components/       # React components
│   ├── BubbleChart.tsx
│   ├── PaperCard.tsx
│   ├── SearchBar.tsx
│   └── TopicFilter.tsx
├── lib/             # Utilities
│   ├── api.ts
│   └── types.ts
└── styles/
    └── globals.css
```

### Components

#### BubbleChart
- **Purpose**: Main visualization component
- **Technology**: D3.js force simulation
- **Features**:
  - Force-directed layout
  - Zoom and pan
  - Hover tooltips
  - Click interactions
  - Color-coded clusters
  - Size-based on citations

#### PaperCard
- **Purpose**: Detailed paper view modal
- **Features**:
  - Full paper metadata
  - Author information
  - Abstract display
  - Keywords visualization
  - Citation statistics

#### SearchBar
- **Purpose**: Real-time search interface
- **Features**:
  - Instant search as you type
  - Clear button
  - Search icon
  - Responsive design

#### TopicFilter
- **Purpose**: Filter papers by topic cluster
- **Features**:
  - Cluster list with colors
  - Paper counts per cluster
  - Active state indication
  - "All Topics" option

### API Client

The `api.ts` module provides a typed interface to the backend:

```typescript
api.getPapers(params?)
api.getClusters()
api.clusterPapers(method, nClusters)
api.searchPapers(query, limit)
api.getStats()
```

## Setup Instructions

### Backend Setup

1. **Install Python dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Generate sample data (optional):**
```bash
python -m backend.data.sample_data_generator
```

3. **Run the API server:**
```bash
python -m backend.api.main
# Or using uvicorn:
uvicorn backend.api.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Install Node.js dependencies:**
```bash
cd frontend
npm install
```

2. **Run the development server:**
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

3. **Build for production:**
```bash
npm run build
npm start
```

## Configuration

### Environment Variables

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend**: No environment variables required for basic setup.

### API Configuration

CORS is configured to allow requests from:
- `http://localhost:3000`
- `http://127.0.0.1:3000`

To add more origins, modify `backend/api/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "YOUR_ORIGIN"],
    ...
)
```

## Data Format

### Paper JSON Structure
```json
{
  "id": "paper_0001",
  "title": "Paper Title",
  "authors": ["Author 1", "Author 2"],
  "abstract": "Paper abstract...",
  "keywords": ["keyword1", "keyword2"],
  "year": 2023,
  "venue": "Conference Name",
  "citations": 42,
  "cluster_id": 0,
  "cluster_name": "Topic 1: keyword1, keyword2"
}
```

### Cluster JSON Structure
```json
{
  "id": 0,
  "name": "Topic 1: keyword1, keyword2",
  "top_words": ["word1", "word2", "word3"],
  "size": 20
}
```

## Deployment

### Backend Deployment

**Using Docker:**
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Using cloud platforms:**
- Heroku: Use `Procfile` with `web: uvicorn api.main:app --host 0.0.0.0 --port $PORT`
- AWS: Deploy using Elastic Beanstalk or Lambda
- Google Cloud: Use Cloud Run or App Engine

### Frontend Deployment

**Using Vercel (recommended for Next.js):**
```bash
npm install -g vercel
vercel
```

**Using Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build
CMD ["npm", "start"]
```

**Static Export:**
```bash
npm run build
# Output in .next/out
```

## Performance Considerations

### Backend
- Clustering operations are CPU-intensive; consider caching results
- For large datasets (>1000 papers), consider:
  - Incremental clustering
  - Background job processing
  - Result caching
  - Database storage for papers

### Frontend
- D3 force simulation can be heavy with >500 nodes
- Consider:
  - Virtualization for large datasets
  - Level-of-detail rendering
  - Web Workers for clustering calculations
  - Lazy loading of paper details

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS settings include frontend origin
   - Check that backend is running

2. **Clustering Takes Too Long**
   - Reduce number of clusters
   - Use K-means (faster than LDA)
   - Reduce max_features in vectorization

3. **Visualization Not Rendering**
   - Check browser console for errors
   - Ensure D3.js is installed
   - Verify data is loaded correctly

4. **API Connection Failed**
   - Verify backend is running on port 8000
   - Check `NEXT_PUBLIC_API_URL` environment variable
   - Verify CORS configuration

## Testing

### Backend Testing
```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest backend/tests/
```

### Frontend Testing
```bash
# Install test dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom jest

# Run tests
npm test
```

## Contributing

1. Follow Python PEP 8 style guide for backend code
2. Use TypeScript strict mode for frontend
3. Write tests for new features
4. Update documentation for API changes
5. Follow semantic versioning

## License

[Specify your license here]

