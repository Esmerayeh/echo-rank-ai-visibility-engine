# EchoRank API Specification

All endpoints are public and do not require authentication.

## AI Routes (/ai)

### POST /analyze
Starts an analysis or retrieves cached result.
- Body: `{ type: 'url' | 'article' | 'competitor', url?, content?, targetUrl?, competitorUrl? }`
- Returns: `{ id, isDeepAnalysisComplete, metrics, radarData, insights, recommendations, citationRadar, competitorAnalysis? }`
- Note: If `isDeepAnalysisComplete` is false, results are preliminary.

### GET /analysis/:id
Polls status and retrieves latest results for a specific analysis.
- Returns: `{ id, isDeepAnalysisComplete, metrics, radarData, insights, recommendations, citationRadar, competitorAnalysis? }`

### GET /dashboard-metrics
Fetches summary metrics for the dashboard.
- Returns: Latest metrics and trend data.

### POST /optimize
Optimizes article content.
- Body: `{ content: string }`
- Returns: Optimized title, sections, and FAQs.

### GET /topic-map
Generates topic authority map data.
- Body: `{ topic: string, audience: string, goal: string }`
- Returns: Topics and connections.

### POST /generate
Generates AI-optimized content.
- Body: `{ topic: string, audience: string, goal: string }`
- Returns: Structured article with FAQs.

### POST /simulate

Simulates an AI answer and ranking.

- Body: `{ question: string }`

- Returns: Simulated answer and visibility suggestions.



### POST /export

Generates and uploads a file to storage.

- Body: `{ content: string, fileName: string, fileType: string }`

- Returns: `{ url: string }`



### POST /upload

Uploads a file to storage.

- Body: `FormData` (file: File)

- Returns: `{ url: string }`
