# Stash

A personal link management system. You save links you want to go through, triage them into your collection, and optionally share some of them publicly. Think jewel thief: you score the goods, stash what's worth keeping, and fence a few pieces to the world.

## Language

**Link**:
A saved URL with metadata (title, description, image, tags). The atomic unit of the system.
_Avoid_: Bookmark, item, entry

**The Score**:
The queue of links that have been saved but not yet triaged. Everything lands here first.
_Avoid_: Inbox, pending, unread, queue

**Stashed**:
A link that has been triaged out of The Score and kept in the collection. No further action is required — it may be an article you went through, a reference you're keeping, or anything in between.
_Avoid_: Read, watched, consumed, archived, processed

**Shared**:
A flag on a Stashed link that makes it visible in the public feed. Not all Stashed links are Shared. Sharing records a `shared_at` timestamp used for monthly grouping.
_Avoid_: Public, published, visible

**Monthly Feed**:
The public API response for a given calendar month, grouped by `shared_at` (when the link was Shared, not when it was saved). The canonical output for site builds and archives.

**Triage**:
The daily workflow of going through The Score and moving each link to Stashed or deleting it.
_Avoid_: Review, process, read

## Relationships

- A **Link** starts in **The Score**
- **Triage** moves a Link from **The Score** to **Stashed**, or deletes it
- A **Stashed** link may be marked **Shared** to appear in the public feed
- **Shared** is a property of a **Stashed** link — a link in **The Score** cannot be Shared
- A **Monthly Feed** contains only **Stashed** links marked **Shared**, grouped by `shared_at`
- Search spans only **Stashed** links — **The Score** is not searchable

## Example dialogue

> **Dev:** "Should the public API return everything that's been Stashed?"
> **Domain expert:** "No — only what's been marked Shared. Stashed is my private collection; Shared is what I've chosen to surface."

> **Dev:** "When a user reads an article, do we need to record that?"
> **Domain expert:** "No. Moving it out of The Score is the action. Whether I read it, skimmed it, or just decided to keep it — it's all just Stashed."

## Flagged ambiguities

- "read" and "watched" were used early on as status values — resolved: these states do not exist. The only transition is Score → Stashed.
- "pending" was the original code term for The Score — resolved: rename to align with domain language.
