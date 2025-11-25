"""
Generate sample academic paper data for testing and demonstration.
"""
import json
import random
from typing import List
from backend.models.paper import Paper


# Sample data pools
TOPICS = {
    'Information Retrieval': {
        'keywords': ['information retrieval', 'search engines', 'ranking', 'relevance', 'query processing', 'indexing'],
        'venues': ['SIGIR', 'CIKM', 'WSDM', 'ECIR', 'ICTIR']
    },
    'Human-Computer Interaction': {
        'keywords': ['user interface', 'usability', 'user experience', 'interaction design', 'accessibility', 'user studies'],
        'venues': ['CHI', 'UIST', 'CSCW', 'IUI', 'DIS']
    },
    'Machine Learning': {
        'keywords': ['deep learning', 'neural networks', 'supervised learning', 'reinforcement learning', 'classification'],
        'venues': ['ICML', 'NeurIPS', 'ICLR', 'AAAI', 'IJCAI']
    },
    'Data Mining': {
        'keywords': ['clustering', 'pattern mining', 'association rules', 'classification', 'anomaly detection'],
        'venues': ['KDD', 'ICDM', 'SDM', 'PAKDD', 'PKDD']
    },
    'Natural Language Processing': {
        'keywords': ['text processing', 'sentiment analysis', 'named entity recognition', 'machine translation', 'language models'],
        'venues': ['ACL', 'EMNLP', 'NAACL', 'COLING', 'EACL']
    },
    'Computer Vision': {
        'keywords': ['image recognition', 'object detection', 'image segmentation', 'convolutional networks', 'visual understanding'],
        'venues': ['CVPR', 'ICCV', 'ECCV', 'BMVC', 'WACV']
    }
}

SAMPLE_TITLES = {
    'Information Retrieval': [
        'Advanced Ranking Algorithms for Web Search',
        'Query Expansion Techniques in Information Retrieval',
        'Personalized Search Results Using User Profiles',
        'Efficient Indexing Strategies for Large-Scale Search',
        'Relevance Feedback in Information Retrieval Systems',
        'Semantic Search: Beyond Keyword Matching',
        'Multi-Modal Information Retrieval Approaches',
        'Real-Time Search Ranking Optimization'
    ],
    'Human-Computer Interaction': [
        'Designing Intuitive User Interfaces for Mobile Applications',
        'Accessibility in Modern Web Applications',
        'User Experience Evaluation Methods',
        'Gesture-Based Interaction Systems',
        'Collaborative Filtering in User Interface Design',
        'Adaptive Interfaces Based on User Behavior',
        'Virtual Reality Interaction Paradigms',
        'Voice User Interface Design Principles'
    ],
    'Machine Learning': [
        'Deep Neural Networks for Image Classification',
        'Transfer Learning in Natural Language Processing',
        'Reinforcement Learning for Game Playing',
        'Federated Learning: Privacy-Preserving ML',
        'Explainable AI: Interpreting Model Decisions',
        'Few-Shot Learning Approaches',
        'Adversarial Training for Robust Models',
        'Meta-Learning: Learning to Learn'
    ],
    'Data Mining': [
        'Efficient Clustering Algorithms for Big Data',
        'Frequent Pattern Mining in Transactional Databases',
        'Anomaly Detection in Time Series Data',
        'Graph Mining Techniques for Social Networks',
        'Text Mining and Topic Modeling',
        'Streaming Data Mining Approaches',
        'Privacy-Preserving Data Mining',
        'Scalable Association Rule Mining'
    ],
    'Natural Language Processing': [
        'Transformer Models for Language Understanding',
        'Sentiment Analysis Using Deep Learning',
        'Named Entity Recognition in Multilingual Text',
        'Neural Machine Translation Systems',
        'Question Answering with Large Language Models',
        'Text Summarization Techniques',
        'Dialogue Systems and Conversational AI',
        'Low-Resource Language Processing'
    ],
    'Computer Vision': [
        'Object Detection Using YOLO Architecture',
        'Semantic Segmentation in Medical Imaging',
        'Face Recognition in Unconstrained Environments',
        'Video Understanding with Temporal Models',
        '3D Object Reconstruction from Images',
        'Image Captioning with Attention Mechanisms',
        'Few-Shot Learning for Visual Recognition',
        'Adversarial Attacks on Vision Systems'
    ]
}

SAMPLE_AUTHORS = [
    'Dr. Sarah Chen', 'Prof. Michael Johnson', 'Dr. Emily Rodriguez', 'Prof. David Kim',
    'Dr. Lisa Wang', 'Prof. James Anderson', 'Dr. Maria Garcia', 'Prof. Robert Taylor',
    'Dr. Jennifer Lee', 'Prof. Christopher Brown', 'Dr. Amanda White', 'Prof. Daniel Martinez',
    'Dr. Jessica Thompson', 'Prof. Matthew Davis', 'Dr. Nicole Wilson', 'Prof. Andrew Moore'
]

SAMPLE_ABSTRACTS = {
    'Information Retrieval': [
        'This paper presents novel ranking algorithms that improve search result relevance by incorporating user behavior signals and semantic understanding.',
        'We propose a query expansion framework that leverages knowledge graphs to enhance search query understanding and retrieval performance.',
        'This work introduces personalized search techniques that adapt to individual user preferences and search history.',
        'We develop efficient indexing strategies that enable real-time search over large-scale document collections with minimal latency.',
        'This paper explores relevance feedback mechanisms that learn from user interactions to improve search quality iteratively.'
    ],
    'Human-Computer Interaction': [
        'We present design principles for creating intuitive mobile interfaces that reduce cognitive load and improve user satisfaction.',
        'This work addresses accessibility challenges in modern web applications, proposing inclusive design patterns for diverse user needs.',
        'We introduce novel evaluation methods for assessing user experience that combine quantitative metrics with qualitative insights.',
        'This paper explores gesture-based interaction systems that enable natural and efficient human-computer communication.',
        'We propose adaptive interface designs that dynamically adjust based on user behavior patterns and preferences.'
    ],
    'Machine Learning': [
        'This paper presents deep neural network architectures that achieve state-of-the-art performance on image classification tasks.',
        'We explore transfer learning techniques that enable effective model adaptation across different domains and tasks.',
        'This work introduces reinforcement learning algorithms that master complex games through self-play and exploration.',
        'We propose federated learning frameworks that enable collaborative model training while preserving user privacy.',
        'This paper addresses the interpretability challenge in machine learning by developing explainable AI techniques.'
    ],
    'Data Mining': [
        'We present scalable clustering algorithms that efficiently process large-scale datasets using distributed computing frameworks.',
        'This work introduces frequent pattern mining techniques that discover meaningful associations in transactional data.',
        'We propose anomaly detection methods that identify unusual patterns in time series data with high accuracy.',
        'This paper explores graph mining algorithms for analyzing social network structures and community detection.',
        'We develop text mining approaches that extract topics and themes from large document collections.'
    ],
    'Natural Language Processing': [
        'This paper presents transformer-based models that achieve remarkable performance on various language understanding tasks.',
        'We explore deep learning approaches for sentiment analysis that capture nuanced emotional expressions in text.',
        'This work introduces multilingual named entity recognition systems that handle diverse languages effectively.',
        'We propose neural machine translation architectures that generate high-quality translations across language pairs.',
        'This paper addresses question answering challenges using large language models with improved reasoning capabilities.'
    ],
    'Computer Vision': [
        'We present object detection systems that achieve real-time performance with high accuracy on diverse object categories.',
        'This work introduces semantic segmentation methods for medical imaging that assist in clinical diagnosis.',
        'We propose face recognition systems that operate effectively in unconstrained real-world environments.',
        'This paper explores video understanding models that capture temporal dynamics and long-range dependencies.',
        'We develop 3D reconstruction techniques that generate accurate models from multiple viewpoint images.'
    ]
}


def generate_sample_papers(num_papers: int = 100) -> List[Paper]:
    """Generate a list of sample academic papers."""
    papers = []
    paper_id = 1
    
    for _ in range(num_papers):
        # Select a random topic
        topic = random.choice(list(TOPICS.keys()))
        topic_data = TOPICS[topic]
        
        # Select title, abstract, and venue
        title = random.choice(SAMPLE_TITLES[topic])
        
        abstract = random.choice(SAMPLE_ABSTRACTS[topic])
        venue = random.choice(topic_data['venues'])
        
        # Generate authors (1-4 authors per paper)
        num_authors = random.randint(1, 4)
        authors = random.sample(SAMPLE_AUTHORS, num_authors)
        
        # Generate keywords (mix of topic keywords and random variations)
        base_keywords = random.sample(topic_data['keywords'], min(3, len(topic_data['keywords'])))
        keywords = base_keywords + [f"{topic.lower()} research", "academic study"]
        
        # Generate year (2018-2024)
        year = random.randint(2018, 2024)
        
        # Generate citations (0-500, with some papers having more)
        citations = random.randint(0, 500) if random.random() > 0.1 else random.randint(500, 2000)
        
        paper = Paper(
            id=f"paper_{paper_id:04d}",
            title=title,
            authors=authors,
            abstract=abstract,
            keywords=keywords,
            year=year,
            venue=venue,
            citations=citations
        )
        
        papers.append(paper)
        paper_id += 1
    
    return papers


def save_papers_to_json(papers: List[Paper], filepath: str = 'data/sample_papers.json'):
    """Save papers to JSON file."""
    data = [paper.to_dict() for paper in papers]
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(papers)} papers to {filepath}")


def load_papers_from_json(filepath: str = 'data/sample_papers.json') -> List[Paper]:
    """Load papers from JSON file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return [Paper.from_dict(paper_data) for paper_data in data]


if __name__ == '__main__':
    # Generate and save sample papers
    papers = generate_sample_papers(num_papers=100)
    save_papers_to_json(papers)

