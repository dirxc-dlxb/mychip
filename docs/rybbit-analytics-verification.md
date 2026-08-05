# Rybbit analytics verification

## Scope

- Production domain: `mychip.vercel.app`
- Rybbit script: `https://analytics.earnlearning.com/api/script.js`
- Site ID: `29d42ae566b5`
- Custom event: `guide_started`

## Privacy

The event sends only `entry_point: "demo" | "serial"`. It does not send the participant serial, a name, or any other input value.

## Behaviour

- The Rybbit script is injected only when the hostname is `mychip.vercel.app`. Development and Vercel preview hosts do not load it.
- A valid serial or the demo button begins the guide and schedules one `guide_started` event.
- The event waits briefly for Rybbit to be ready, then gives up without interrupting the guide.
- A session key and an in-memory queue prevent duplicate events in the same browser session.

## Changed files

- `index.html`: production-only analytics loader.
- `app.js`: privacy-safe, retrying, de-duplicated custom event.
- `tests/analytics-implementation.test.mjs`: static implementation checks.

## Verification

Initial checks failed because the analytics script loaded on every host and the event had no session deduplication. The current checks confirm the production-domain guard, conditional loader, readiness retry, deduplication, and absence of the serial value in the event payload.

A production-browser test verified that leaving and re-entering the demo opens the dashboard without console errors even when the Rybbit tracker is unavailable. The controlled test browser blocks the external Rybbit script, so final ingestion must be viewed from a normal browser in the MyChip Rybbit site; production Pageview tracking was previously observed there.

## Reference

The instructor-provided Rybbit endpoint uses the same custom-event API: `window.rybbit.trackEvent(eventName, eventData)`: https://www.rybbit.io/docs/guides/react/gatsby
