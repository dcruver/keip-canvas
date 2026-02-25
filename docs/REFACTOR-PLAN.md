# Keip Canvas Refactor Plan

## Vision Shift

**From:** Diagram-first tool with an AI assistant bolted on as an afterthought.

**To:** AI assistant-first tool where the canvas is the visualization of what the assistant builds.

The original model assumed developers would drag and drop components to assemble routes. The new model assumes developers describe what they need in natural language, the assistant generates a route, and the canvas shows the result. Visual editing remains available for inspection and iterative refinement, but it is no longer the primary interaction surface.

## Current Architecture

```
XSD Parser → EIP Component Definitions (JSON) → Canvas UI → EIP Flow (JSON) → Flow Translator → XML
```

The XSD Parser fetches Spring Integration XSD files and builds a catalog of available components. The canvas consumes that catalog to populate the drag-and-drop palette. Users assemble a flow visually, which is serialized to a JSON representation. The Flow Translator converts that JSON to Spring Integration XML.

The AI assistant sits outside this pipeline, backed by a custom Ollama Modelfile wrapping a 32B base model. It has experimental integration with the canvas but is not the primary UX.

## Revised Architecture

```
Chat → LiteLLM → LLM → Spring Integration XML → Flow Translator (fromXml) → EIP Flow (JSON) → Canvas
```

The assistant becomes the entry point. Users describe a route; the LLM generates Spring Integration XML. The Flow Translator's existing `fromXml` path parses that XML into an EIP Flow, which the canvas renders. Users can inspect, edit, and iterate visually. The canvas's existing `toXml` path can serialize edits back to XML for deployment.

The Flow Translator is already bidirectional -- no new translation work is required for this pivot.

## Changes by Component

### Assistant
- Remove Ollama-specific backend and custom Modelfile
- Replace with LiteLLM client using OpenAI-compatible API
- Introduce semantic model names (e.g., `route-generator`) that map to provider models via LiteLLM config
- Elevate the assistant UI from experimental sidebar to primary interface

### LiteLLM
- New container in the stack
- Ships with a starter config mapping semantic model names to configurable provider endpoints
- Users configure their backend once (OpenAI, Anthropic, Azure, vLLM, etc.) -- keip-canvas code does not change

### XSD Parser
- Demoted from required pipeline step to optional validation/tooling
- Component definitions it generates may still be useful as structured context fed to the LLM
- No longer drives the drag-and-drop palette as the primary UX path

### Flow Translator
- Core translation logic unchanged
- `fromXml` path becomes critical: AI-generated XML → EIP Flow → canvas render
- Containerized (this was previously the hardest piece to set up)

### Canvas UI
- Rendering and editing logic reused as-is
- Primary input shifts from drag-and-drop to AI-generated flow
- Visual editing remains available for inspection and iterative refinement

### Schemas
- JSON schemas remain as the contract between components
- May serve as structured context for LLM prompts

## Container Stack

```yaml
services:
  keip-canvas-ui:     # nginx serving the React SPA
  flow-translator:    # Java webapp (XML <-> Flow JSON translation)
  litellm:            # OpenAI-compatible proxy, routes to user's model backend
```

Ollama is not included. Users are assumed to have access to a frontier model -- public API key (OpenAI, Anthropic) or enterprise-hosted endpoint (Azure OpenAI, internal vLLM, etc.). LiteLLM handles the routing.

Getting started:
1. `docker compose up`
2. Configure `litellm-config.yaml` with your model endpoint
3. Open the canvas, start describing routes

## LiteLLM Configuration

Semantic model names decouple keip-canvas from provider decisions. Example config:

```yaml
model_list:
  - model_name: route-generator
    litellm_params:
      model: anthropic/claude-sonnet-4-6   # or openai/gpt-4o, azure/..., etc.
      api_key: os.environ/ANTHROPIC_API_KEY
```

Users swap the provider by updating this file, not the application code. This mirrors the pattern used in Agentic Modernization's LiteLLM stack.

## Work Phases

### Phase 1: Containerization
- Dockerfile for flow-translator webapp
- Dockerfile for canvas UI (nginx)
- `docker-compose.yml` with litellm, flow-translator, canvas-ui
- Starter `litellm-config.yaml` with documented placeholders
- Update README with compose-based getting-started

### Phase 2: Assistant-First UX
- Replace Ollama calls with LiteLLM (OpenAI-compatible endpoint)
- Wire `fromXml` path: LLM XML output → flow-translator → canvas render
- Elevate assistant UI to primary interface
- Ensure canvas edits round-trip back to XML context for continued conversation

### Phase 3: XSD Parser Demotion
- Make XSD Parser optional (no longer required for startup)
- Evaluate using parsed component definitions as LLM prompt context
- Simplify component addition workflow

### Phase 4: Documentation and Blog Post
- Update architecture docs to reflect new design
- Write "AI-first keip-canvas" blog post
  - Angle: vision shift, architecture before/after, docker compose getting started
  - Demonstrate: describe a route → assistant generates XML → canvas renders it
  - Highlight: LiteLLM backend abstraction, runs anywhere

## Blog Post Angle

"I rebuilt keip-canvas as an AI-first tool you can run locally in one command."

The narrative arc: the original architecture was shaped by available model capabilities in 2023. The refactor is the architecture catching up to where models actually are. The XSD parser existed to give the tool schema awareness; a frontier model doesn't need that scaffold. The Ollama requirement existed because frontier access was expensive or unavailable for self-hosted tools; LiteLLM makes any backend work. The drag-and-drop canvas was the primary UX because AI generation wasn't reliable enough; it is now.

Before: install Ollama, build a custom 32B model, set up a Java service, serve the UI.
After: `docker compose up`.
