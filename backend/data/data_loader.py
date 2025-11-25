"""
Data loading utilities for academic papers.
"""
import json
from typing import List
from backend.models.paper import Paper


def load_papers(filepath: str = 'data/sample_papers.json') -> List[Paper]:
    """Load papers from JSON file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return [Paper.from_dict(paper_data) for paper_data in data]
    except FileNotFoundError:
        print(f"File {filepath} not found. Generating sample data...")
        # Import here to avoid circular dependencies
        import os
        import sys
        from pathlib import Path
        # Add project root to path
        project_root = Path(__file__).parent.parent.parent
        if str(project_root) not in sys.path:
            sys.path.insert(0, str(project_root))
        from backend.data.sample_data_generator import generate_sample_papers, save_papers_to_json
        # Ensure data directory exists
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        papers = generate_sample_papers(num_papers=100)
        save_papers_to_json(papers, filepath)
        return papers

