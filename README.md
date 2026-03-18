Echo Rank: AI Visibility Engine (LLMEO)Brand Reputation & AI Visibility Command CenterEcho Rank is a specialized platform for LLM Engine Optimization (LLMEO). As search transitions from keyword-based indexing to generative AI summaries, Echo Rank provides the diagnostic tools to ensure a brand is accurately perceived, cited, and recommended by Large Language Models.Project StructurePlaintextecho-rank-ai-visibility-engine/
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
Core FeaturesThe AI Mirror: Generates a real-time "Shadow Summary" to visualize how an LLM currently describes your brand.AI Readability Index (AIRI): A metric that analyzes content for Semantic Density and Fact Concentration.The Brand Voice Tuner: Suggests "Fact Injections" to convert marketing prose into high-authority AI training data.Entity Mapping: Uses 3D visualization (Three.js) to show brand positioning within an LLM's latent space.Technical ArchitectureThe engine uses a decoupled architecture to handle high-latency AI orchestration and real-time data scraping.ComponentTechnologyRoleFrontendReact 18 / ViteInteractive dashboard and real-time UI.VisualizationThree.js3D mapping of semantic clusters and entities.BackendPython FlaskAPI orchestration and scraping pipelines.AI LayerLangChain / MattrLLM prompting, summarization, and scoring.AuthenticationOAuth 2.0Secure integration using loopback (127.0.0.1) URIs.Quick Start GuidePrerequisitesPython 3.9+ and Node.js 18+API Keys for OpenAI or GeminiA Search API key (Serper, Google Custom Search, etc.)1. InstallationBashgit clone https://github.com/Esmerayeh/echo-rank-ai-visibility-engine.git
cd echo-rank-ai-visibility-engine

# Setup Backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Setup Frontend
cd ../frontend
npm install
2. ConfigurationCreate a .env file in the /backend directory:Code snippetOPENAI_API_KEY=your_api_key
SEARCH_API_KEY=your_search_key
FLASK_ENV=development
3. ExecutionRun Backend:Bashpython app.py
Run Frontend:Bashnpm run dev
Access the dashboard at http://localhost:5173
