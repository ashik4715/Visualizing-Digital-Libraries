# Digital Academic Library Visualization System

A modern web-based visualization system for exploring academic papers through interactive topic-clustered bubble visualizations. This project combines Python-based data mining algorithms with a Next.js/TypeScript frontend to enhance information retrieval and human-computer interaction in academic research.

## 🎯 Project Overview

This system transforms traditional text-based paper listings into an intuitive visual interface where papers are displayed as interactive bubbles, grouped by research topics. The visualization enables researchers to:

- **Discover relationships** between papers across different topics
- **Understand thematic landscapes** of research domains
- **Navigate large collections** efficiently through visual exploration
- **Identify research trends** and emerging topics

## ✨ Key Features

- **Multi-Algorithm Clustering**: Switch between LDA, K-means, and Hierarchical clustering methods
- **Interactive Bubble Visualization**: Force-directed layout with zoom, pan, and hover interactions
- **Advanced Filtering**: Filter by topic, search by keyword, filter by year
- **Real-Time Re-clustering**: Dynamically adjust clustering parameters and see instant results
- **Paper Details**: Comprehensive modal views with full paper metadata
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ Architecture

### Backend (Python)

- **FastAPI**: High-performance REST API
- **Clustering Algorithms**: LDA, K-means, Hierarchical clustering
- **Data Processing**: TF-IDF vectorization, text preprocessing
- **Sample Data**: Realistic academic paper metadata generator

### Frontend (Next.js/TypeScript)

- **Next.js 14**: React framework with App Router
- **D3.js**: Force-directed graph visualization
- **Tailwind CSS**: Modern, responsive styling
- **TypeScript**: Type-safe development

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install Python dependencies:

```bash
pip install -r requirements.txt
```

3. Generate sample data (optional):

```bash
python -m backend.data.sample_data_generator
```

4. Start the API server:

```bash
python -m backend.api.main
```

The API will be available at `http://localhost:8000`

### API Explorer (Swagger UI)

- Visit `http://localhost:8000/docs` for the interactive Swagger experience (the root URL redirects here automatically).
- Use it to try every endpoint, inspect request/response schemas, and share live API examples.
- The raw OpenAPI schema is also available at `http://localhost:8000/openapi.json`.

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install Node.js dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 📁 Start Servers

1. Backend

```bash
python run_backend.py
```

OR

```bash
uvicorn backend.api.main:app --reload
```

2. Frontend

```bash
npm run dev
```

## 📁 Project Structure

```
Visualizing-Digital-Libraries/
├── backend/                    # Python clustering service
│   ├── clustering/            # Clustering algorithms
│   ├── data/                  # Data processing
│   ├── api/                   # FastAPI REST endpoints
│   ├── models/                # Data models
│   └── requirements.txt
├── frontend/                  # Next.js application
│   ├── app/                   # Next.js app directory
│   ├── components/            # React components
│   ├── lib/                   # Utilities and API client
│   └── styles/                # Global styles
├── data/                      # Sample data storage
├── docs/                      # Documentation
│   ├── PROJECT_DESCRIPTION.md # For Professor Hoeber
│   └── TECHNICAL_DOCS.md      # Technical documentation
└── README.md
```

## 📚 Documentation

- **[Project Description](docs/PROJECT_DESCRIPTION.md)**: Comprehensive overview focusing on Information Retrieval and HCI aspects
- **[Technical Documentation](docs/TECHNICAL_DOCS.md)**: Detailed technical documentation, API reference, and setup instructions

## 🔬 Research Focus

### Information Retrieval

- Document clustering and organization
- Search and retrieval mechanisms
- Relevance ranking and scoring
- Multi-algorithm clustering comparison

### Human-Computer Interaction

- Visual information retrieval
- Interactive exploration interfaces
- User experience design
- Accessibility considerations

## 🛠️ API Endpoints

- `GET /api/papers` - Get all papers (supports filtering)
- `GET /api/clusters` - Get cluster information
- `POST /api/cluster/{method}` - Re-cluster papers
- `GET /api/search` - Search papers by keyword
- `GET /api/stats` - Get collection statistics

See [Technical Documentation](docs/TECHNICAL_DOCS.md) for detailed API reference.

## 🎨 Clustering Methods

1. **LDA (Latent Dirichlet Allocation)**: Probabilistic topic modeling using Gensim
2. **K-means**: TF-IDF vectorization with K-means clustering
3. **Hierarchical**: Agglomerative clustering with ward linkage

## 🔮 Future Research Directions

- Multi-dimensional clustering (temporal, citation networks)
- Integration with real academic databases (arXiv, DBLP)
- Advanced search with query expansion
- Personalized recommendation systems
- User behavior analytics
- Machine learning for relevance ranking

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

[Specify your license here]

## 👥 Credits

Developed for University of Regina - Digital Libraries course
Project concept by Ashikur Rahman
Supervised by Dr. Hoeber

---

**Note**: This project demonstrates modern web development practices, data mining techniques, and user-centered design principles in the context of academic library visualization.
