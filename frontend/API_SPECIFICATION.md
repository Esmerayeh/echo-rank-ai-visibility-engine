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

### GET /history
Fetches recent analysis history.
- Returns: Array of `{ id, url, visibilityScore, timestamp }`

### GET /dashboard-metrics
Fetches summary metrics for the dashboard.
- Returns: Latest metrics and trend data.

### POST /optimize
Optimizes article content.
- Body: `{ content: string }`
- Returns: Optimized title, sections, and FAQs.

### GET /topic-map
Generates topic authority map data based on latest analysis.
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
Generates content for export.
- Body: `{ content: string, fileName: string, fileType: string }`
- Returns: `{ url: string }` (Returns '#' for local fallback)

### POST /upload
Placeholder for file uploads.
- Body: `FormData` (file: File)
- Returns: `{ url: string }`

## Auth Routes (/auth)

### POST /register
Registers a new user.
- Body: `{ email, password, name? }`

### POST /login
Authenticates a user.
- Body: `{ email, password }`

### POST /refresh
Refreshes the access token.
- Body: `{ refreshToken }`

### GET /me
Retrieves current user info.
- Headers: `Authorization: Bearer <accessToken>`

