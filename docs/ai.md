# Beatly AI

Beatly's default AI provider is local Ollama.

## Environment

```text
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:3b
```

No paid AI API key is required by default.

## Local Setup

Install and run Ollama, then pull the configured model:

```powershell
ollama pull qwen2.5:3b
ollama serve
```

## Behavior

AI features use backend routes and authenticated user analytics. If Ollama is unavailable, AI routes should return safe errors and the frontend should show unavailable/error states instead of crashing.

## Provider Notes

Provider classes exist for multiple AI vendors, but production defaults to Ollama. Do not commit provider secrets. If a hosted provider is enabled later, add the required env vars to `.env.example` and this document.
