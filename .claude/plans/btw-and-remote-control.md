# Q's Strategic Briefing: `/btw` and `/remote-control` Features

**Date:** 2026-03-11
**Classification:** OPERATIONAL PLANNING
**Status:** Ready for implementation

---

## Executive Summary

Two new slash commands for the Grep Build Electron app:
1. **`/btw`** -- Ephemeral side question with dismissible overlay response
2. **`/rc` (alias `/remote-control`)** -- Remote control session with URL/QR code

Both operate through the Claude Code CLI via the SDK's `query()` / `streamInput()` mechanism.

---

## Current Architecture (Reconnaissance Findings)

### Message Flow
```
InputArea.handleSubmit()
  -> session.store.sendMessage(sessionId, message, attachments)
    -> electronAPI.claude.sendMessage(sessionId, message, ...)
      -> claude.service.ts: streamMessage() -> query({prompt, ...})
        -> SDK spawns Claude Code CLI process
        -> Async generator yields SDKMessages back
        -> Events emitted via IPC to renderer
```

### Key Observations
1. **Slash commands are handled by the CLI process**, not the SDK. When you send `/compact` via `streamInput()`, the CLI interprets it.
2. **`streamInput()`** exists and works -- it injects messages into an active query. Used for `/compact` and message queueing.
3. **The `Query` object** is stored in `activeQueryObjects` Map, keyed by sessionId.
4. **Messages sent while streaming** are queued in `messageQueue` and injected via `injectMessage()` when `onStreamChunk` fires.
5. **`sendMessage()`** creates a NEW `query()` call when not streaming. When already streaming, it queues and injects via `streamInput()`.

---

## Feature 1: `/btw` (Ephemeral Side Question)

### Design Decision: SDK Route vs Direct API

**Option A: Send `/btw` through the CLI via `streamInput()`**
- Pro: CLI may natively handle `/btw` if it's a built-in slash command
- Pro: Minimal new code
- Con: Response arrives through the same stream as main conversation -- hard to separate
- Con: If CLI doesn't support `/btw`, it just gets sent as a regular message

**Option B: Make a separate Anthropic API call (bypass CLI entirely)**
- Pro: Completely isolated from conversation history
- Pro: Full control over display (overlay, dismissible)
- Pro: Works even when CLI is mid-stream processing
- Con: Needs its own API key handling, model selection
- Con: Doesn't have conversation context (but that's arguably the point of "ephemeral")

**RECOMMENDATION: Option B -- Direct API call.**

The entire point of `/btw` is that it's ephemeral and doesn't pollute history. Sending it through the CLI/SDK would add it to the conversation. A separate API call is the clean approach.

### Implementation Plan

#### Phase 1: Intercept `/btw` in InputArea (Renderer)

**File: `src/renderer/components/chat/InputArea.tsx`**

In `handleSubmit()`, before calling `sendMessage()`:
```
1. Check if message starts with `/btw ` (case-insensitive)
2. If yes, extract the question text (everything after `/btw `)
3. Instead of calling sendMessage(), call a new store action: `askBtw(sessionId, question)`
4. Do NOT add a user message to the chat history
```

#### Phase 2: New IPC Channel + Main Process Handler

**File: `src/shared/constants/channels.ts`**
- Add `CLAUDE_BTW_ASK: 'claude:btw-ask'`
- Add `CLAUDE_BTW_RESPONSE: 'claude:btw-response'`
- Add `CLAUDE_BTW_ERROR: 'claude:btw-error'`

**File: `src/main/ipc/claude.ipc.ts`**
- Register handler for `CLAUDE_BTW_ASK`

**File: `src/main/services/claude.service.ts`**
- New method: `askBtw(sessionId: string, question: string): Promise<void>`
- Uses the Anthropic SDK directly (not claude-agent-sdk's `query()`)
- Streams response back via `CLAUDE_BTW_RESPONSE` IPC events
- Uses same API key and model as the active session
- System prompt: minimal -- just "Answer this quick question concisely."
- No tools, no conversation history, no file access

**File: `src/main/preload.ts`**
- Expose `electronAPI.claude.askBtw(sessionId, question)` invoke
- Expose `electronAPI.claude.onBtwResponse(callback)` listener
- Expose `electronAPI.claude.onBtwError(callback)` listener

#### Phase 3: Store Actions (Renderer State)

**File: `src/renderer/stores/session.store.ts`**

New state:
```typescript
btw: {
  [sessionId: string]: {
    question: string;
    response: string;
    isStreaming: boolean;
    error?: string;
  } | null;
}
```

New actions:
- `askBtw(sessionId, question)` -- calls IPC, sets btw state
- `dismissBtw(sessionId)` -- clears btw state
- Subscribe to `CLAUDE_BTW_RESPONSE` and `CLAUDE_BTW_ERROR` in `subscribeToClaude()`

#### Phase 4: Overlay UI Component

**File: `src/renderer/components/chat/BtwOverlay.tsx`** (NEW)

A dismissible floating panel that:
- Appears above the chat, anchored to bottom-right or as a modal overlay
- Shows the question at the top (small, muted)
- Streams the response with markdown rendering
- Has a dismiss button (X) and Escape key handler
- Uses the app's existing brutalist design language
- Auto-dismisses after 30 seconds of inactivity (configurable)

**File: `src/renderer/components/chat/ChatContainer.tsx`**
- Read `btw` state from store
- Render `<BtwOverlay>` when btw state exists for current session

### Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| API key not available | Low | Fall back to error message in overlay |
| User sends `/btw` with no active session | Medium | Check session status, show inline error |
| Response is very long | Medium | Cap overlay height with scroll, add "copy" button |
| Concurrent `/btw` requests | Low | Cancel previous btw request when new one arrives |
| Streaming `/btw` while main stream active | HIGH (by design) | Separate API call ensures no interference |

### Files Changed (Feature 1)
1. `src/renderer/components/chat/InputArea.tsx` -- intercept `/btw`
2. `src/shared/constants/channels.ts` -- 3 new channels
3. `src/main/ipc/claude.ipc.ts` -- register btw handler
4. `src/main/services/claude.service.ts` -- `askBtw()` method
5. `src/main/preload.ts` -- expose btw API
6. `src/renderer/stores/session.store.ts` -- btw state + actions
7. `src/renderer/components/chat/BtwOverlay.tsx` -- NEW overlay component
8. `src/renderer/components/chat/ChatContainer.tsx` -- render overlay

---

## Feature 2: `/rc` (Remote Control)

### Design Decision: How to Route `/rc`

Unlike `/btw`, `/rc` MUST go through the Claude Code CLI because:
1. The CLI handles session registration with Anthropic's cloud infrastructure
2. The CLI manages the remote control WebSocket/tunnel lifecycle
3. The CLI returns a URL that connects to its own process

**RECOMMENDATION: Send `/rc` through the existing `streamInput()` mechanism, then parse the response for the URL/QR code data.**

### How `/rc` Works in Claude Code CLI

When you type `/rc` in Claude Code:
1. CLI registers the session with Anthropic's servers
2. CLI starts a local tunnel/WebSocket listener
3. CLI responds with a URL (e.g., `https://claude.ai/remote/abc123`) and possibly a QR code (as text art or data)
4. The remote control session stays active until explicitly stopped

### Implementation Plan

#### Phase 1: Intercept `/rc` in InputArea + Route Through CLI

**File: `src/renderer/components/chat/InputArea.tsx`**

In `handleSubmit()`:
```
1. Check if message is `/rc` or `/remote-control`
2. If yes, call a new store action: `startRemoteControl(sessionId)`
3. Still show the user message in chat (unlike /btw, this is a real command)
```

**Key insight:** The message still goes through `sendMessage()` -> CLI. But the renderer needs to watch for the response and extract the URL.

#### Phase 2: Detect Remote Control Response in Stream

**File: `src/main/services/claude.service.ts`**

In the `streamMessage()` async generator loop where we process SDKMessages:
```
1. Watch for text_delta events that contain a URL pattern matching remote control
   (e.g., `https://claude.ai/remote/` or similar Anthropic URL pattern)
2. When detected, emit a special IPC event: CLAUDE_RC_STARTED
3. Include the URL in the event payload
```

**File: `src/shared/constants/channels.ts`**
- Add `CLAUDE_RC_STARTED: 'claude:rc-started'`
- Add `CLAUDE_RC_STOPPED: 'claude:rc-stopped'`

**File: `src/main/preload.ts`**
- Expose `electronAPI.claude.onRcStarted(callback)` listener
- Expose `electronAPI.claude.onRcStopped(callback)` listener

#### Phase 3: Store State for Remote Control

**File: `src/renderer/stores/session.store.ts`**

New state:
```typescript
remoteControl: {
  [sessionId: string]: {
    url: string;
    isActive: boolean;
    startedAt: Date;
  } | null;
}
```

New actions:
- `setRemoteControl(sessionId, url)` -- set from IPC event
- `clearRemoteControl(sessionId)` -- clear when stopped
- Subscribe to `CLAUDE_RC_STARTED` / `CLAUDE_RC_STOPPED` in `subscribeToClaude()`

#### Phase 4: Remote Control UI Component

**File: `src/renderer/components/chat/RemoteControlPanel.tsx`** (NEW)

A persistent panel (not a dismissible overlay like /btw) that shows:
- The remote control URL as a clickable link
- A QR code generated client-side from the URL (use `qrcode` npm package -- tiny, no native deps)
- A "Copy URL" button
- A "Stop Remote Control" button
- Session status indicator (active/connecting/disconnected)
- Elapsed time since started

For QR code generation, use `qrcode` package (or `qrcode.react` for React component):
```bash
npm install qrcode.react
```
This is a small, well-maintained package with no native dependencies -- safe for Electron.

**File: `src/renderer/components/chat/ChatContainer.tsx`**
- Read `remoteControl` state from store
- Render `<RemoteControlPanel>` above the input area when RC is active

#### Phase 5: Stop Remote Control

When user clicks "Stop":
1. Send `/rc stop` (or whatever the CLI stop command is) via `injectMessage()`
2. Clear the `remoteControl` state
3. The panel disappears

**CAVEAT:** We need to verify what the actual stop command is. The CLI may use `/rc stop`, `/rc off`, or just send another `/rc` to toggle. This requires testing with the actual CLI.

### Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| CLI doesn't support `/rc` yet | UNKNOWN | Test first. If not supported, feature is blocked on CLI update |
| URL pattern unknown | HIGH | Need to test CLI output to know exact format. Build flexible regex |
| QR code package size | Low | qrcode.react is ~15KB gzipped |
| Remote control disconnects silently | Medium | Periodic health check via CLI, or watch for disconnect events in stream |
| Session stops but UI doesn't update | Medium | Watch for stream events indicating RC ended |
| Multiple RC sessions on same device | Low | Only allow one RC per session, show warning |

### Files Changed (Feature 2)
1. `src/renderer/components/chat/InputArea.tsx` -- detect `/rc` for UI flag (optional)
2. `src/shared/constants/channels.ts` -- 2 new channels
3. `src/main/services/claude.service.ts` -- detect RC URL in stream events
4. `src/main/preload.ts` -- expose RC event listeners
5. `src/renderer/stores/session.store.ts` -- RC state + actions
6. `src/renderer/components/chat/RemoteControlPanel.tsx` -- NEW panel component
7. `src/renderer/components/chat/ChatContainer.tsx` -- render RC panel
8. `package.json` -- add `qrcode.react` dependency

---

## Implementation Order

### Recommended Sequence

**Feature 1 (`/btw`) first** because:
- It's self-contained (no CLI dependency questions)
- It exercises the new IPC pattern (direct API call)
- Easier to test and validate
- Provides immediate user value

**Feature 2 (`/rc`) second** because:
- Depends on CLI support (needs verification)
- More complex lifecycle management
- URL pattern detection is speculative until tested

### Phase Breakdown

```
Phase 1 (Day 1): /btw - Backend
  - IPC channels
  - claude.service.ts: askBtw() with direct Anthropic API
  - preload.ts exposure
  - IPC handler registration

Phase 2 (Day 1): /btw - Frontend
  - InputArea intercept
  - session.store.ts btw state
  - BtwOverlay.tsx component
  - ChatContainer integration

Phase 3 (Day 2): /btw - Polish
  - Streaming response rendering
  - Keyboard shortcuts (Escape to dismiss)
  - Error handling
  - Edge cases (no API key, empty question)

Phase 4 (Day 2): /rc - Research
  - Test CLI `/rc` command manually
  - Document actual response format
  - Identify start/stop commands

Phase 5 (Day 3): /rc - Implementation
  - Stream event detection
  - IPC channels + handlers
  - Store state
  - RemoteControlPanel.tsx
  - QR code integration

Phase 6 (Day 3): /rc - Polish
  - Stop command
  - Health checking
  - Error states
```

---

## Common Pitfalls to Avoid

1. **DO NOT send `/btw` through `query()`** -- it will pollute conversation history
2. **DO NOT create a second `query()` call for `/btw`** -- only one query per session is supported
3. **DO NOT block the main stream for `/btw`** -- it must be fully independent
4. **DO NOT hardcode the RC URL pattern** -- make it configurable/regex-based
5. **DO NOT forget to handle the case where API key is in electron-store vs env** -- `askBtw()` needs the same key retrieval logic as `streamMessage()`
6. **DO NOT skip the Foundry (Azure) path** -- if user has Foundry configured, `/btw` should use it too

---

## Testing Strategy

### /btw
- [ ] Send `/btw what is 2+2` -- overlay appears with response
- [ ] Send `/btw` while Claude is actively streaming -- both work independently
- [ ] Press Escape -- overlay dismisses
- [ ] Send another `/btw` while overlay is open -- replaces previous
- [ ] Check conversation history -- no `/btw` messages present
- [ ] No API key configured -- error shown in overlay

### /rc
- [ ] Send `/rc` -- panel appears with URL and QR code
- [ ] URL is clickable and valid
- [ ] QR code scans correctly from phone
- [ ] "Copy URL" copies to clipboard
- [ ] "Stop" button terminates RC and removes panel
- [ ] Session ends -- RC panel clears automatically
- [ ] Send `/rc` when already active -- shows appropriate response

---

## Architecture Diagram

```
/btw Flow:
  InputArea -> intercept -> store.askBtw()
    -> IPC: claude:btw-ask
      -> claude.service.askBtw()
        -> Anthropic API (direct, streaming)
          -> IPC: claude:btw-response (chunks)
            -> store.btw[sessionId] updated
              -> BtwOverlay renders

/rc Flow:
  InputArea -> sendMessage() (normal flow)
    -> claude.service.streamMessage()
      -> query() -> CLI process
        -> CLI handles /rc, returns URL in stream
          -> streamMessage detects URL pattern
            -> IPC: claude:rc-started
              -> store.remoteControl[sessionId] set
                -> RemoteControlPanel renders
```

---

## Dependencies

### /btw
- `@anthropic-ai/sdk` (already installed -- used for direct API calls)
- No new npm packages needed

### /rc
- `qrcode.react` -- QR code rendering (NEW, ~15KB)
- CLI must support `/rc` command (EXTERNAL DEPENDENCY -- verify first)

---

## Open Questions

1. **Does the Claude Code CLI currently support `/rc`?** This is a blocking question for Feature 2. If not, we need to either wait for CLI support or implement the registration ourselves.

2. **What is the exact URL format for remote control?** Need to test with the CLI to know the pattern.

3. **Should `/btw` have conversation context?** Currently planned as fully ephemeral (no context). Could optionally include a summary of recent conversation for better answers, but this adds complexity.

4. **Should `/btw` responses be copyable/saveable?** A "Copy to clipboard" button on the overlay would be useful.

5. **Rate limiting on `/btw`?** Since it makes separate API calls, rapid `/btw` usage could be expensive. Consider a cooldown or warning.
