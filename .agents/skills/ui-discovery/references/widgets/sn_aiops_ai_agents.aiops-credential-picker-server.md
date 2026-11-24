# AIOps Credential Picker/Creator (Server Script)

`sn_aiops_ai_agents.aiops-credential-picker-server` · custom · instance-authored

Credential picker/creator: a radio group where the user either selects an existing credential from a caller-supplied list, or creates a new one by entering a name, username, and password. Creating a new credential inserts a row into the basic_auth_credentials table via the widget's own server-side handler (invoked through this.server.get with GlideRecordSecure); only the resulting sys_id and a display name ("name - username") flow onward — the password is never echoed back.

**Best for:** When the user needs to either pick an existing credential or create a brand-new one (name, username, password) as part of setting up an integration.

## Import

```js
import '@servicenow/glide-widgets/sn_aiops_ai_agents/aiops-credential-picker-server';
```

Then use `<aiops-credential-picker-server>` in a template.

## Notes

- Has a server script — data is fetched server-side. The source below includes it as `(server script)`. Read it before calling `this.server.get(input)`: it defines which `input` keys are honored and what shape lands in `data`. An input key it does not read is silently ignored — the call succeeds and nothing happens.
- Chat compatible.
- Depends on widgets: aiops-option-select.

## Source

Read this widget’s authored source before wiring it up — it is the
implementation, so it is the authority on properties, events, slots, methods
and how they behave. Say what it does NOT do as well: a widget that only
dispatches an event still needs the page to handle it.

**Always run this command to get it** — every time, including when you have
used this widget before:

```bash
node .claude/skills/ui-discovery/scripts/fetch-widget-source.js --key sn_aiops_ai_agents.aiops-credential-picker-server
```

Before running it, tell the user: “I found AIOps Credential Picker/Creator (Server Script) as a possible match. To confirm its properties, events and behavior, I need to read only this widget’s authored source from the instance. This is read-only and caches the source locally for future use.”

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
