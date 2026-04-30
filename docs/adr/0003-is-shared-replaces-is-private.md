# is_shared replaces is_private with inverted default

The public visibility flag is `is_shared` (default false) rather than `is_private` (default false). The original model made everything public unless explicitly marked private. The new model requires an explicit share action — nothing is public until you choose to surface it during triage. This matches the mental model: you Stash everything, then consciously decide what to Share. The `shared_at` timestamp is set when `is_shared` is first set to true and is used for monthly feed grouping.
