/*
  # Add unique index for post slugs

  1. Changes
    - Add unique index on posts collection for slug field
    - Ensure slugs are unique across all posts
*/

CREATE UNIQUE INDEX IF NOT EXISTS posts_slug_idx ON posts (slug);