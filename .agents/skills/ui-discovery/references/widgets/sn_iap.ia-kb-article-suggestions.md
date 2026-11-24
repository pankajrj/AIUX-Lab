# IA KB Article Suggestions

`sn_iap.ia-kb-article-suggestions` · custom · sdk-built

Displays a list of matching Knowledge Base articles for the user to review, each with a title and a clickable KB number link that opens the article in a new tab. Used when a KB search returns multiple candidate articles for an approval-related question.

**Best for:** displaying multiple candidate Knowledge Base articles returned from a KB search so the user can pick the one that fits their approval

## Import

```js
import '@servicenow/glide-widgets/sn_iap/ia-kb-article-suggestions';
```

Then use `<ia-kb-article-suggestions>` in a template.

## Notes

- Chat compatible.

## Source

Read this widget’s authored source before wiring it up — it is the
implementation, so it is the authority on properties, events, slots, methods
and how they behave. Say what it does NOT do as well: a widget that only
dispatches an event still needs the page to handle it.

**Always run this command to get it** — every time, including when you have
used this widget before:

```bash
node .claude/skills/ui-discovery/scripts/fetch-widget-source.js --key sn_iap.ia-kb-article-suggestions
```

Before running it, tell the user: “I found IA KB Article Suggestions as a possible match. To confirm its properties, events and behavior, I need to read only this widget’s authored source from the instance. This is read-only and caches the source locally for future use.”

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
