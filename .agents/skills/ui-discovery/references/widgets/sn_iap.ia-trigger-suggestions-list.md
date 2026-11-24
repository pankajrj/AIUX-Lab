# IA Trigger Suggestions List

`sn_iap.ia-trigger-suggestions-list` · custom · sdk-built

Card list of AI-suggested trigger conditions (plus a "Define my own" option) surfaced inside the conversation panel, so the user can pick which trigger condition to use for a new intelligent approval.

**Best for:** Letting the conversational agent ask the user to choose a trigger/approval condition, or describe one in their own words, while creating an intelligent approval.

## Import

```js
import '@servicenow/glide-widgets/sn_iap/ia-trigger-suggestions-list';
```

Then use `<ia-trigger-suggestions-list>` in a template.

## Notes

- Has a server script — data is fetched server-side. The source below includes it as `(server script)`. Read it before calling `this.server.get(input)`: it defines which `input` keys are honored and what shape lands in `data`. An input key it does not read is silently ignored — the call succeeds and nothing happens.
- Chat compatible.

## Source

Read this widget’s authored source before wiring it up — it is the
implementation, so it is the authority on properties, events, slots, methods
and how they behave. Say what it does NOT do as well: a widget that only
dispatches an event still needs the page to handle it.

**Always run this command to get it** — every time, including when you have
used this widget before:

```bash
node .claude/skills/ui-discovery/scripts/fetch-widget-source.js --key sn_iap.ia-trigger-suggestions-list
```

Before running it, tell the user: “I found IA Trigger Suggestions List as a possible match. To confirm its properties, events and behavior, I need to read only this widget’s authored source from the instance. This is read-only and caches the source locally for future use.”

The command **is** the cache. It asks the instance for this widget’s current
version (one row, one column), prints the locally stored copy when it still
matches, and re-pulls only when the widget has changed — so running it again
costs almost nothing and is the only way to know the source is current. Do not
substitute any local file for it: a widget edited or redeployed since the last
fetch would give you props and event names that no longer exist, and nothing
anywhere would report it.

If the fetch fails, it prints one short `reason:` line. Tell the user
specifically what happened: this widget looked like a match, but its current
properties and events could not be read from the instance (give the reason),
so you are setting it aside rather than guessing an API that may have changed.
Make clear this is **not** “no widget matched” — a reusable widget exists and
could not be verified right now. Then continue with the offline component
catalog.

Do not fall back to an older copy of this widget’s source, and do not build
from what you remember of it. A widget edited or redeployed since then has
different props and events, and code written against the old ones compiles,
renders, and silently does nothing.

Widget discovery is optional: do not block the work, do not retry during the
same task, and do not expose raw errors, commands or credentials.
