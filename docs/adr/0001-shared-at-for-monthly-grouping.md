# Use shared_at timestamp for monthly feed grouping

The public API groups links by month for site builds and static archives. We use `shared_at` (when the link was marked Shared) rather than `created_at` (when the link was saved). A link saved on March 28th but triaged and shared on April 2nd belongs to April — the monthly feed represents "what I shared this month," not "what I saved this month." This matches the intent of a reading list and gives the owner control: the month a link appears in is determined by when they consciously surfaced it, not when it landed in the queue.
