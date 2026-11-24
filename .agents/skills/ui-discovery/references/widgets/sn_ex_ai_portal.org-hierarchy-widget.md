# Organizational chart

`sn_ex_ai_portal.org-hierarchy-widget` · custom · sdk-built

An interactive organizational chart widget that displays employee hierarchies with manager chains and direct reports. Features include an employee search picker, expandable/collapsible nodes, load-more functionality for large teams, and detailed employee cards with contact information. Supports navigation to user profiles and provides client tools for programmatic org chart loading.

**Best for:** Visualizing organizational hierarchies and reporting structures. Ideal for employee directories, profile pages, and HR applications where users need to explore manager chains, direct reports, and team structures interactively.

## Import

```js
import '@servicenow/glide-widgets/sn_ex_ai_portal/org-hierarchy-widget';
```

Then use `<org-hierarchy-widget>` in a template.

## Notes

- Has a server script — data is fetched server-side. The source below includes it as `(server script)`. Read it before calling `this.server.get(input)`: it defines which `input` keys are honored and what shape lands in `data`. An input key it does not read is silently ignored — the call succeeds and nothing happens.
- Depends on widgets: sn_ex_ai_portal.employee-picker, sn_ex_ai_portal.empty-state-message, sn_ex_ai_portal.org-chart-card.

## Source

Read this widget’s authored source before wiring it up — it is the
implementation, so it is the authority on properties, events, slots, methods
and how they behave. Say what it does NOT do as well: a widget that only
dispatches an event still needs the page to handle it.

**Always run this command to get it** — every time, including when you have
used this widget before:

```bash
node .claude/skills/ui-discovery/scripts/fetch-widget-source.js --key sn_ex_ai_portal.org-hierarchy-widget
```

Before running it, tell the user: “I found Organizational chart as a possible match. To confirm its properties, events and behavior, I need to read only this widget’s authored source from the instance. This is read-only and caches the source locally for future use.”

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
