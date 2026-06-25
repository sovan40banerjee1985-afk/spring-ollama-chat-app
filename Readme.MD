# LLM Chat API

A full-stack chat application backed by a local LLM (Ollama), built with Spring Boot, PostgreSQL, and React. Started as an Anthropic API integration, then swapped to a local model — without touching the controller, entity, repository, or DTOs.

![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1-brightgreen)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![React](https://img.shields.io/badge/React-Vite-61DAFB)

## What this is

A REST API that takes a chat message, sends it to an LLM, and persists the full conversation history in PostgreSQL — paired with a minimal React frontend to demonstrate the integration end-to-end.

The interesting part isn't the chat UI. It's the backend design: the LLM provider sits behind a small service abstraction, so the app went from calling Anthropic's hosted API to calling a local Ollama model by changing **two files** — a config class and a service class. The controller, the database entity, the repository, and the DTOs never moved.

## Architecture

```
┌─────────────┐      HTTP/JSON      ┌──────────────────┐
│   React UI  │ ──────────────────► │  ChatController   │
│ (Vite +     │ ◄────────────────── │  (REST layer)      │
│  Tailwind)  │                     └────────┬───────────┘
└─────────────┘                              │
                                              ▼
                                    ┌──────────────────┐
                                    │ ChatMessageRepo   │──► PostgreSQL
                                    │ (JPA / Hibernate) │    (chat_message table)
                                    └──────────────────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │   OllamaService    │──► Ollama
                                    │  (LLM provider)    │    (localhost:11434)
                                    └──────────────────┘
```

Each message exchange does two DB writes (user message, then assistant reply) and one outbound call to the LLM provider, all within a single request.

## Why provider abstraction matters here

The LLM-calling logic lives entirely inside one service class (`OllamaService`, originally `AnthropicService`), configured through one `@ConfigurationProperties` class. Everything else in the app — the entity, the repository, the controller, the DTOs — has no idea which provider is behind the scenes. Swapping providers meant:

- Writing a new config class (`OllamaConfig`) with the new base URL and model name
- Writing a new service class with a different request/response JSON shape
- Updating one constructor injection in the controller

That's it. No other class changed. This is the Strategy pattern in practice — useful here, and the same idea scales to a multi-provider setup later (Anthropic, OpenAI, Ollama, selectable per request).

## Tech stack

**Backend**
- Java 21, Spring Boot 4.1
- Spring Data JPA + Hibernate
- PostgreSQL 16 (via Docker Compose)
- Spring `RestClient` for outbound HTTP calls
- Maven

**Frontend**
- React (Vite)
- Tailwind CSS v4

**LLM**
- [Ollama](https://ollama.com) running `llama3.2` locally — no API key, no billing, no network dependency once pulled

## Getting started

### Prerequisites
- Java 21+
- Maven
- Docker (for PostgreSQL)
- [Ollama](https://ollama.com/download) installed locally
- Node.js (for the frontend)

### 1. Start PostgreSQL

```bash
docker compose up -d
```

This spins up Postgres on `localhost:5432` with the `llmchat` database auto-created.

### 2. Pull and run the model

```bash
ollama pull llama3.2
```

Ollama serves its API automatically on `localhost:11434` once installed — no separate start step needed.

### 3. Run the backend

```bash
mvn spring-boot:run
```

Boots on `localhost:8080`. Hibernate auto-creates the `chat_message` table on first run (`ddl-auto: update`).

### 4. Run the frontend

```bash
cd llm-chat-frontend
npm install
npm run dev
```

Opens on `localhost:5173`.

### 5. Chat

Open the browser, type a message. The flow: message saved → sent to Ollama → reply saved → reply rendered.

## API

**`POST /api/chat`**

Request:
```json
{
  "message": "Hello!",
  "conversationId": null
}
```

`conversationId` is optional — omit it (or pass `null`) to start a new conversation; the response returns the generated ID so you can continue the thread.

Response:
```json
{
  "conversationId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "reply": "Hi there! How can I help you today?",
  "createdAt": "2026-06-24T17:50:19.774121Z"
}
```

## Project structure

```
src/main/java/com/example/chat_app/
├── config/        # OllamaConfig — binds application.yml properties
├── controller/     # ChatController — REST endpoint, request/response wiring
├── dto/           # ChatRequest, ChatResponse — API contract, decoupled from the entity
├── model/         # ChatMessage — JPA entity
├── repository/     # ChatMessageRepository — Spring Data JPA
└── service/       # OllamaService — the only class that talks to the LLM
```

## What's tested

Unit tests cover `OllamaService` directly (no Spring context, plain object construction) — verifying failure behavior when the LLM endpoint is unreachable. More coverage planned for the controller layer using `@WebMvcTest` and a mocked service.

## Known limitations / what's next

This is a learning project, built deliberately in layers to understand each piece (Spring Data JPA, config binding, `RestClient`, provider abstraction) rather than scaffolded all at once. Current gaps, in priority order:

- **No conversation memory sent to the LLM** — message history is persisted in Postgres, but each request to Ollama only includes the latest message, not prior turns. The model has no context of what was said earlier in the same conversation.
- **No global error handling** — a failed LLM call currently surfaces as a raw 500 with a stack trace, not a clean JSON error response.
- **Controller-level CORS** (`@CrossOrigin` on the class) rather than a global `CorsConfigurationSource` — fine for one controller, won't scale if more endpoints are added.
- **No streaming** — responses wait for the full LLM reply rather than streaming tokens back as they're generated.

## Background

This project was built to learn Spring Boot's integration patterns with LLM APIs — config binding, REST clients, JPA persistence, and request/response DTO design — using a real (if minimal) full-stack slice rather than isolated exercises. It started on Anthropic's hosted API and moved to a local Ollama model partway through, which became a useful forcing function for getting the provider abstraction right.