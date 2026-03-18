# Echo Rank: AI Visibility Engine (LLMEO)
### Brand Reputation & AI Visibility Command Center

**Echo Rank** is a specialized platform for **LLM Engine Optimization (LLMEO)**. As search transitions from keyword-based indexing to generative AI summaries, Echo Rank provides the diagnostic tools to ensure a brand is accurately perceived, cited, and recommended by Large Language Models.

---

## Project Structure

```text
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

#Core Features
{ The AI Mirror }: Generates a real-time "Shadow Summary" to visualize how an LLM currently describes your brand.

{ AI Readability Index (AIRI) }: A metric that analyzes content for Semantic Density and Fact Concentration.

{ The Brand Voice Tuner }: Suggests "Fact Injections" to convert marketing prose into high-authority AI training data.

{ Entity Mapping }: Uses 3D visualization (Three.js) to show brand positioning within an LLM's latent space.
