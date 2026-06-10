# @conduit-ai/sdk

The JavaScript/TypeScript SDK for building applications on top of Conduit — an
AI coding agent. The SDK is a thin, fully-typed client for the **Conduit
server**: a headless HTTP server that owns sessions, talks to LLM providers,
runs tools, and streams everything back as events.

If you want to build your own chat UI (web, desktop, terminal, whatever), this
SDK is the contract. The built-in TUI (`@conduit-ai/tui`) is just one consumer of
it — everything it does, your app can do too.

> **Use the `/v2` API.** This package ships two generations of the client. `/v2`
> is the current one and is what the TUI uses; the root export (`@conduit-ai/sdk`)
> is the older v1 shape (`{ path, body }` params) and is kept for compatibility.
> All examples below use `/v2`.

---

## Table of contents

1. [Mental model](#1-mental-model)
2. [Install](#2-install)
3. [Getting a server](#3-getting-a-server)
4. [Quick start](#4-quick-start)
5. [The client](#5-the-client)
6. [Core data model](#6-core-data-model-session--message--part)
7. [Sending input](#7-sending-input-prompt--shell--command)
8. [Events: the live stream](#8-events-the-live-stream)
9. [Building reactive chat state (the sync pattern)](#9-building-reactive-chat-state-the-sync-pattern)
10. [Providers & models](#10-providers--models)
11. [Permissions & questions](#11-permissions--questions)
12. [Session management](#12-session-management)
13. [Putting it together: a minimal chat loop](#13-putting-it-together-a-minimal-chat-loop)
14. [API surface](#14-api-surface)
15. [Authentication & deployment notes](#15-authentication--deployment-notes)

---

## 1. Mental model

```
┌─────────────────────┐         HTTP + SSE          ┌──────────────────────────┐
│   Your chat UI       │ ──────  requests  ────────▶ │   Conduit server         │
│  (this SDK)          │                             │  (`conduit serve`)       │
│                      │ ◀────── event stream ────── │  sessions, providers,    │
│                      │        (SSE, GlobalEvent)   │  tools, LSP, MCP, files   │
└─────────────────────┘                             └──────────────────────────┘
```

Two things to internalize:

- **The server is the source of truth.** You never mutate chat state locally and
  hope it sticks. You call a method (e.g. `session.prompt`), and the *result* of
  that work — new messages, streaming text, tool calls, permission requests —
  comes back to you as **events** on a single stream. Your UI is a projection of
  those events.

- **Everything is scoped to a directory.** A Conduit server is multi-project: a
  single server process handles requests for any working directory. You tell it
  which one you mean via the `directory` option on the client (sent as the
  `x-conduit-directory` header / query param on every request). One server, many
  projects.

This is exactly how the TUI works — it boots a server, opens the event stream,
and renders a reactive store fed entirely by events.

---

## 2. Install

```bash
bun add @conduit-ai/sdk      # or npm / pnpm / yarn
```

You also need the `conduit` binary available if you want the SDK to spawn a
local server for you (see next section). Install it from the project's install
script, or point the SDK at an already-running server.

---

## 3. Getting a server

The client talks to a server over HTTP. You have three options.

### Option A — Let the SDK spawn a local server

`createConduitServer()` shells out to the `conduit` binary (`conduit serve …`),
waits for it to print its listen URL, and hands you `{ url, close() }`.

```ts
import { createConduitServer } from "@conduit-ai/sdk/v2"

const server = await createConduitServer({
  hostname: "127.0.0.1", // default
  port: 4096,            // default
  timeout: 5000,         // ms to wait for startup, default
  // config: { logLevel: "INFO" },   // optional Conduit config, passed via env
})

console.log(server.url) // e.g. http://127.0.0.1:4096
// ... use it ...
server.close()           // kills the child process
```

`config` is serialized into the `CONDUIT_CONFIG_CONTENT` env var the server reads
at startup.

### Option B — Connect to an already-running server

Run the server yourself (in a container, a sidecar, a dev terminal):

```bash
conduit serve --hostname 0.0.0.0 --port 4096
# prints: conduit server listening on http://0.0.0.0:4096
```

Then just point the client at it (see [§5](#5-the-client)). No `createConduitServer` needed.

### Option C — In-process transport (advanced)

The client accepts a custom `fetch` and a custom event source instead of a URL it
dials over the network. The TUI uses this: it runs the server inside a `Worker`
and passes a `fetch` that proxies requests over the worker channel, plus an
`events` object that streams `GlobalEvent`s from the worker. This avoids opening
a real TCP port. See [§5](#5-the-client) and [§8](#8-events-the-live-stream) for
the hooks (`fetch`, `events`). Most apps will not need this — use A or B.

### `createConduit()` — server + client in one call

```ts
import { createConduit } from "@conduit-ai/sdk/v2"

const { client, server } = await createConduit({ port: 4096 })
```

---

## 4. Quick start

```ts
import { createConduit } from "@conduit-ai/sdk/v2"

const { client, server } = await createConduit()

// 1. Open the event stream FIRST, so you don't miss anything.
const events = await client.global.event()
;(async () => {
  for await (const event of events.stream) {
    // event.payload.type tells you what happened
    console.log(event.payload.type, event.payload.properties)
  }
})()

// 2. Create a session (a conversation).
const created = await client.session.create({
  directory: process.cwd(),
})
const sessionID = created.data!.id

// 3. Send a prompt. The assistant's reply arrives as EVENTS, not as the
//    return value of this call.
await client.session.prompt({
  sessionID,
  model: { providerID: "anthropic", modelID: "claude-opus-4-8" },
  parts: [{ type: "text", text: "List the files in this project." }],
})

// Watch the event loop above print message.updated / message.part.delta /
// tool calls / message.part.updated as the assistant works.
```

---

## 5. The client

```ts
import { createConduitClient } from "@conduit-ai/sdk/v2"

const client = createConduitClient({
  baseUrl: "http://127.0.0.1:4096", // the server URL (omit if using `fetch`)
  directory: "/abs/path/to/project", // scopes all requests to this project
  headers: { Authorization: "Bearer …" }, // e.g. server password (see §15)
  fetch: customFetch,                 // optional: override transport (Option C)
  signal: abortController.signal,     // optional: abort all in-flight requests
})
```

Key behaviors:

- **`directory`** is added to every request as `x-conduit-directory` (and as a
  query param). This is how one server serves many projects. You can also pass
  `directory` / `workspace` per-call on most methods if you mix projects.
- **Return shape.** By default methods return
  `{ data, error, request, response }` — they do **not** throw on HTTP errors.
  Check `.error`, or pass `{ throwOnError: true }` as the second arg to get the
  unwrapped `data` and exceptions instead:
  ```ts
  const session = await client.session.get({ sessionID }, { throwOnError: true })
  ```
- **Interceptors.** `client.interceptors.request|response|error` let you inject
  auth, logging, retries, etc.

---

## 6. Core data model: Session → Message → Part

A chat UI renders three nested entities. These are the exact types exported from
`@conduit-ai/sdk/v2`.

### Session

A conversation, scoped to a project directory.

```ts
type Session = {
  id: string
  slug: string
  projectID: string
  directory: string
  parentID?: string          // set for forked / sub-sessions
  title: string
  agent?: string
  model?: { id: string; providerID: string; variant?: string }
  cost?: number
  tokens?: { input; output; reasoning; cache: { read; write } }
  summary?: { additions; deletions; files; diffs?: SnapshotFileDiff[] }
  share?: { url: string }
  time: { created: number; updated: number; archived?: number }
  // …revert, permission ruleset, metadata
}
```

### Message — `UserMessage | AssistantMessage`

A message is the envelope; the actual content lives in its **parts**.

```ts
type UserMessage = {
  id: string; sessionID: string; role: "user"
  time: { created: number }
  agent: string
  model: { providerID: string; modelID: string; variant?: string }
}

type AssistantMessage = {
  id: string; sessionID: string; role: "assistant"
  parentID: string                 // the user message it answers
  providerID: string; modelID: string; agent: string
  time: { created: number; completed?: number }   // completed set when done
  cost: number
  tokens: { input; output; reasoning; cache: { read; write } }
  error?: ProviderAuthError | UnknownError | MessageAbortedError | …  // why it stopped
  finish?: string
}
```

### Part — the renderable content (`type Part`)

Parts are appended to a message as the assistant works. The `type` discriminant
tells your UI how to render each one:

| `type`        | Render as                                              |
|---------------|--------------------------------------------------------|
| `text`        | assistant/user prose (`.text`)                         |
| `reasoning`   | thinking/Chain-of-thought (`.text`)                    |
| `tool`        | a tool call with live `.state` (see below)             |
| `file`        | an attachment (`.mime`, `.url`, `.filename`)           |
| `agent`       | an `@agent` mention                                    |
| `subtask`     | a delegated sub-agent task (`.prompt`, `.description`) |
| `patch`       | a file patch (`.hash`, `.files`)                       |
| `snapshot`    | a workspace snapshot marker                            |
| `step-start` / `step-finish` | turn boundaries (token/cost accounting) |
| `retry`       | a retried provider call (`.attempt`, `.error`)         |
| `compaction`  | context-window compaction marker                       |

A **`tool` part** carries a state machine you should render live:

```ts
type ToolPart = {
  type: "tool"; id; sessionID; messageID
  callID: string; tool: string        // e.g. tool = "bash", "read", "edit"
  state:
    | { status: "pending";  input; raw }
    | { status: "running";  input; title?; time: { start } }
    | { status: "completed"; input; output: string; title; time; attachments?: FilePart[] }
    | { status: "error";    input; error: string; time }
}
```

Common shapes:
- A `TextPart` is `{ id, sessionID, messageID, type: "text", text, time? }`.
- A `FilePart` is `{ …, type: "file", mime, url, filename?, source? }`.

---

## 7. Sending input: prompt / shell / command

All three create a user message in the session and kick off work; results stream
back as events.

### `session.prompt` — the normal chat path

```ts
await client.session.prompt({
  sessionID,
  model: { providerID: "anthropic", modelID: "claude-opus-4-8" },
  agent: "build",                 // optional named agent
  variant: undefined,             // optional model variant
  tools: { bash: true },          // optional per-call tool allow/deny
  parts: [
    { type: "text", text: "Refactor this file." },
    { type: "file", mime: "text/x-typescript", url: "file:///abs/path.ts" },
    // { type: "agent", name: "reviewer" },
  ],
})
```

The **input part** types you can send (`parts`):
`TextPartInput`, `FilePartInput`, `AgentPartInput`, `SubtaskPartInput`.

```ts
type TextPartInput = { type: "text"; text: string; id?: string; … }
type FilePartInput = { type: "file"; mime: string; url: string; filename?: string; source? }
```

`POST /session/{sessionID}/message` under the hood.

### `session.shell` — run a shell command in the session

```ts
await client.session.shell({
  sessionID,
  command: "bun test",
  model: { providerID, modelID },
  agent: "build",
})
```

### `session.command` — run a registered slash-command

```ts
await client.session.command({
  sessionID,
  command: "compact",            // the "/compact" command, minus the slash
  arguments: "",
  model: `${providerID}/${modelID}`,
  agent,
})
```

### Stop generation

```ts
await client.session.abort({ sessionID })
```

---

## 8. Events: the live stream

This is the heart of a Conduit UI. One long-lived **Server-Sent Events** stream
delivers every state change.

```ts
const events = await client.global.event({
  signal: ctrl.signal,
  sseMaxRetryAttempts: 0,   // handle reconnection yourself if you want control
})

for await (const event of events.stream) {
  handle(event)
}
```

`global.event()` returns `{ stream: AsyncGenerator<GlobalEvent> }`.

### The event envelope

```ts
type GlobalEvent = {
  directory: string
  project?: string
  workspace?: string
  payload: {
    id: string
    type: string                       // discriminant — see below
    properties: { …shape depends on type… }
  }
}
```

Filter by `event.directory` to the project you care about, then switch on
`event.payload.type`.

### The events a chat UI must handle

| `payload.type`           | Meaning / what to do                                            |
|--------------------------|-----------------------------------------------------------------|
| `session.created`        | a new session exists — add it to your list                      |
| `session.updated`        | session metadata changed (title, cost, tokens)                  |
| `session.deleted`        | remove it                                                       |
| `session.idle`           | the assistant finished its turn — stop the spinner              |
| `session.error`          | a turn failed — surface the error                               |
| `message.updated`        | a message was created/changed — upsert into your message list   |
| `message.removed`        | drop the message                                                |
| `message.part.updated`   | a part was created/finalized — upsert into the message's parts  |
| `message.part.delta`     | **streaming**: append `.delta` to part field `.field` (see below)|
| `message.part.removed`   | drop the part                                                   |
| `permission.asked`       | the agent needs approval — show a prompt (see §11)              |
| `permission.replied`     | clear the pending prompt                                        |
| `question.asked` / `question.replied` / `question.rejected` | structured Q&A to the user |
| `lsp.updated`, `mcp.tools.changed`, `file.watcher.updated`, `installation.update-available` | ambient status you may surface |

> There are `*.v2` and `*.1` variants of several of these in the type union
> (e.g. `permission.v2.asked`, `message.updated.1`). They correspond to
> experimental/workspace event channels. Start by handling the un-suffixed names;
> add the others if you opt into those features.

### Streaming text (`message.part.delta`)

The assistant's text and reasoning arrive incrementally. A delta event names the
part, the field to grow, and the chunk:

```ts
case "message.part.delta": {
  const { partID, messageID, field, delta } = event.payload.properties
  // append `delta` to the existing string in part[field], e.g. field === "text"
  part[field] = (part[field] ?? "") + delta
}
```

Then a final `message.part.updated` gives you the completed part.

### Reconnection & batching (what the TUI does)

- It opens the stream, and on disconnect **reconnects with exponential backoff**
  (1s → 30s).
- It **batches** events that arrive within ~16ms into a single render pass to
  avoid thrashing the UI on fast streams.

You should do the same: a chat that re-renders per-delta with no batching will
feel janky under load.

---

## 9. Building reactive chat state (the sync pattern)

You don't fetch the whole world up front; you **hydrate on demand + apply
events**. The TUI keeps a single store shaped roughly like:

```ts
{
  session: Session[]
  message:    { [sessionID: string]: Message[] }
  part:       { [messageID: string]: Part[] }
  permission: { [sessionID: string]: PermissionRequest[] }
  question:   { [sessionID: string]: QuestionRequest[] }
  provider:   Provider[]
  agent:      Agent[]
  // … lsp, mcp, vcs, todos, config
}
```

The recipe:

1. **On startup**, load the essentials:
   `provider.list`, `app.agents`, `config.get`, `path.get`, `project.current`,
   and (if resuming) `session.list`.
2. **Open the event stream** (§8) and reduce events into the store
   (upsert on `message.updated` / `message.part.updated`, append on
   `message.part.delta`, etc.).
3. **When the user opens a session**, hydrate it:
   ```ts
   const [session, messages, todos, diff] = await Promise.all([
     client.session.get({ sessionID }, { throwOnError: true }),
     client.session.messages({ sessionID }),   // returns messages + their parts
     client.session.todo({ sessionID }),
     client.session.diff({ sessionID }),
   ])
   ```
   Merge into the store; from then on, events keep it current.

This "hydrate then stream" model means your UI is always consistent whether the
change came from your own action or from another client connected to the same
server.

---

## 10. Providers & models

```ts
// Everything Conduit knows about (from the models.dev catalog):
const all = await client.provider.list()

// Only providers that are actually configured/authenticated right now:
const active = await client.v2.provider.list()

// Models:
const models = await client.v2.model.list()
```

A model is identified by `{ providerID, modelID }` (e.g.
`{ providerID: "anthropic", modelID: "claude-opus-4-8" }`) and optionally a
`variant`. That pair is what you pass to `session.prompt` / `session.create`.

Providers auto-load when their API-key env var is set on the **server**
(e.g. `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`), or via stored credentials
(`conduit auth login`), or config. See the main project docs for details — your
UI just lists what `provider.list` returns and lets the user pick.

---

## 11. Permissions & questions

When an agent wants to run a sensitive tool (run a command, edit a file), the
server emits `permission.asked` and **blocks** until you reply. Your UI must
surface it and call back.

```ts
// 1. You receive a `permission.asked` event; render its properties.
//    The request carries an `id` (requestID), sessionID, and tool details.

// 2. Reply:
await client.permission.reply({
  requestID,
  reply: "once",     // "once" | "always" | "reject"
  directory,
  // message: "…"    // optional note, e.g. why you rejected
})
```

- `once` — allow this one call.
- `always` — allow and remember (persisted to the session's permission ruleset).
- `reject` — deny; the agent is told and continues without it.

**Questions** are the same pattern for structured input (the agent asks the user
to choose something):

```ts
await client.question.reply({ requestID, answers: [["my answer"]] })
await client.question.reject({ requestID })
```

A `permission.replied` / `question.replied` event then clears the pending item
from your store.

---

## 12. Session management

```ts
client.session.create({ directory, agent, model: { providerID, id, variant } })
client.session.list({ start })          // recent sessions (filter by directory)
client.session.get({ sessionID })       // one session's metadata
client.session.messages({ sessionID })  // full message + part history
client.session.todo({ sessionID })      // the session's todo list
client.session.diff({ sessionID })      // aggregated file diff
client.session.abort({ sessionID })     // stop the current turn
client.session.fork({ sessionID })      // branch into a new session
client.session.delete({ sessionID })
```

`create` returns `{ data: Session }` — grab `data.id` for subsequent calls.
Note `create` takes the model as `{ providerID, id, variant }` (key `id`),
while `prompt` takes `{ providerID, modelID }`.

---

## 13. Putting it together: a minimal chat loop

```ts
import { createConduit } from "@conduit-ai/sdk/v2"
import type { GlobalEvent, Message, Part } from "@conduit-ai/sdk/v2"

const { client } = await createConduit()
const directory = process.cwd()

// In-memory projection of server state.
const messages = new Map<string, Message>()
const parts = new Map<string, Part[]>() // messageID -> parts

// 1. Stream events into the projection.
const events = await client.global.event()
;(async () => {
  for await (const e of events.stream) {
    if (e.directory !== directory) continue
    const p = e.payload
    switch (p.type) {
      case "message.updated":
        messages.set(p.properties.info.id, p.properties.info)
        break
      case "message.part.updated": {
        const part = p.properties.part
        const list = parts.get(part.messageID) ?? []
        const i = list.findIndex((x) => x.id === part.id)
        i >= 0 ? (list[i] = part) : list.push(part)
        parts.set(part.messageID, list)
        render()
        break
      }
      case "message.part.delta": {
        const { messageID, partID, field, delta } = p.properties
        const part: any = parts.get(messageID)?.find((x) => x.id === partID)
        if (part) { part[field] = (part[field] ?? "") + delta; render() }
        break
      }
      case "permission.asked":
        // prompt the user, then:
        // await client.permission.reply({ requestID: p.properties.id, reply: "once", directory })
        break
      case "session.idle":
        render() // turn finished
        break
    }
  }
})()

// 2. Start a session and send a message.
const { data: session } = await client.session.create({ directory })
await client.session.prompt({
  sessionID: session!.id,
  model: { providerID: "anthropic", modelID: "claude-opus-4-8" },
  parts: [{ type: "text", text: "Hello! What does this project do?" }],
})

function render() {
  // draw `messages` + `parts` however your UI does it
}
```

That's the whole contract: **stream events → project to state → render**, and
**call methods → more events**.

---

## 14. API surface

The v2 client (`client`) groups methods into namespaces. The ones a chat UI
touches most:

| Namespace            | What it covers                                              |
|----------------------|-------------------------------------------------------------|
| `client.session`     | create, list, get, messages, prompt, shell, command, abort, fork, todo, diff, delete |
| `client.global`      | `event()` (the SSE stream), health, config                  |
| `client.provider`    | list providers (and `client.v2.provider` for active only)   |
| `client.v2.model`    | list models                                                 |
| `client.permission`  | list, reply                                                 |
| `client.question`    | reply, reject                                               |
| `client.path`        | current working directory info                              |
| `client.project`     | list / current project                                      |
| `client.file`        | list, read, status                                          |
| `client.find`        | text (ripgrep), files, symbols (LSP)                        |
| `client.vcs`         | diff, status, apply                                         |
| `client.config`      | get / update settings                                       |
| `client.tool`        | list available tools, status                                |
| `client.command`     | list registered slash-commands                              |
| `client.agent` (`app.agents`) | list configured agents                             |
| `client.auth`        | set / remove provider credentials                           |
| `client.mcp`, `client.lsp`, `client.pty`, `client.worktree` | MCP servers, language servers, terminals, git worktrees |

Every method is fully typed — let your editor autocomplete the params and return
types. The generated source of truth is `src/v2/gen/sdk.gen.ts` and the types in
`src/v2/gen/types.gen.ts`; the OpenAPI spec is `packages/sdk/openapi.json`.

---

## 15. Authentication & deployment notes

- **Server password.** `conduit serve` warns if `CONDUIT_SERVER_PASSWORD` is
  unset — an unsecured server. For anything beyond localhost, set it and send the
  credential from the client via `headers` (e.g. `Authorization`).
- **Bind address.** Default is `127.0.0.1`. To accept remote connections, start
  with `--hostname 0.0.0.0` and put it behind TLS/auth you control.
- **Provider keys live on the server**, not in the client. Set
  `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / etc. in the server's environment (or
  use `conduit auth login`). The client only ever names a model; the server holds
  the secret.
- **One server, many clients.** Multiple UIs can connect to the same server and
  the same session; they'll all receive the same event stream. Scope each client
  to a `directory`.

---

## Reference: how the TUI uses this

If you want a living example, read these in `@conduit-ai/tui`:

- `src/context/sdk.tsx` — creates the client, owns the SSE stream, batches events.
- `src/context/sync.tsx` — reduces events into a reactive store (the §9 pattern).
- `src/component/prompt/index.tsx` — builds `parts` and calls `session.prompt` /
  `shell` / `command`.
- `src/routes/session/permission.tsx` & `question.tsx` — the §11 reply flows.
- `src/context/local.tsx` — model/agent selection and persistence.

The TUI is wired with the in-process transport (Option C), but the SDK surface it
calls is identical to what you'd use over HTTP.
