##Echo Rank: AI Visibility Engine (LLMEO)

##Brand Reputation & AI Visibility Command CenterEcho Rank is a specialized platform for LLM Engine Optimization (LLMEO). As search transitions from keyword-based indexing to generative AI summaries, Echo Rank provides the diagnostic tools to ensure a brand is accurately perceived, cited, and recommended by Large Language Models.Project StructurePlaintext

echo-rank-ai-visibility-engine/
├── backend/
│   ├── app.py              # Flask application entry point
│   ├── core/
│   │   ├── analyzer.py     # URL scraping and AIRI logic
│   │   ├── llm_client.py   # LangChain/LLM orchestration
│   │   └── optimizer.py    # Brand Voice Tuner algorithms
│   ├── models/             # Database schemas
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Template for environment variables
├── frontend/
│   ├── src/
│   │   ├── components/     # UI components (Mirror, Tuner, etc.)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── visualizations/ # Three.js entity mapping logic
│   │   └── App.jsx
│   ├── public/             # Static assets
│   ├── package.json        # Node.js dependencies
│   └── vite.config.js      # Vite configuration
├── docs/                   # Additional documentation
└── README.md


##Core Features

The AI Mirror: Generates a real-time "Shadow Summary" to visualize how an LLM currently describes your brand.

AI Readability Index (AIRI): A metric that analyzes content for Semantic Density and Fact Concentration.

The Brand Voice Tuner: Suggests "Fact Injections" to convert marketing prose into high-authority AI training data.

Entity Mapping: Uses 3D visualization (Three.js) to show brand positioning within an LLM's latent space.


##Technical Architecture

The engine uses a decoupled architecture to handle high-latency AI orchestration and real-time data scraping.

Component                                           Technology                                       Role
Frontend                                           React 18 / Vite                 Interactive dashboard and real-time UI.
Visualization                                      Three.js                        3D mapping of semantic clusters and entities.
Backend                                            Python Flask                    API orchestration and scraping pipelines.
AI Layer                                           LangChain / Mattr               LLM prompting, summarization, and scoring.
Authentication                                     OAuth 2.0                       Secure integration using loopback (127.0.0.1) URIs.

##Quick Start Guide

#Prerequisites
Python 3.9+ and Node.js 18+
API Keys for OpenAI or Gemini
A Search API key (Serper, Google Custom Search, etc.)

#1. Installation
git clone https://github.com/Esmerayeh/echo-rank-ai-visibility-engine.git
cd echo-rank-ai-visibility-engine

# Setup Backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Setup Frontend
cd ../frontend
npm install

#2. ConfigurationCreate a .env file in the /backend directory:Code snippetOPENAI_API_KEY=your_api_key
SEARCH_API_KEY=your_search_key
FLASK_ENV=development

#3. ExecutionRun Backend:Bashpython app.py
Run Frontend: npm run dev

Access the dashboard at http://localhost:5173
