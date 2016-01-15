# Libs/Infra
- Cache:pruning
- Cache:watch
- Lambda: imagemagick version


# Server
## Completed
- store [hkv]
- facebook [hkv]
- google [hkv]
- resource [hkv]
- session [hkv]
- signin [hkv]
- signup [hkv]
- email [cks]
- http [hkv]

## Underway
- socket [hkv]
- postgres [ars]
- upload [cks]

## Pending, required
- store:statechange-aggregation
- authorizer [hks]
- count [cks]
- note [cks]
- score [cks]
- push
  - hold for 2 minutes before sending
  - send text/thread edits also

## Pending, desired
- localforage
- postgres:fulltext
- debug
- guard
  - ratelimit threads/user
  - sql sanitization in query join/link propnames

# Client

## Little things
- Make account settings more discoverable
- Make Thread/text/room menu more discoverable
- Make clear notes button more intuitive
- Show room name when inside a thread
- Show progress/spinner during queries (after pure)
- Stickers
- Warn users when posting phone number/email in public

## Short term
- Onboarding with places picker
- "Introduce yourself" CTA wizard
- "Hometown" experiment

## Medium term
- Switch app and web to Pure API
- Full text search
- My activity feed in home
- Watch/unwatch threads
- Heart threads and texts
- User profile page, ranks
- Private chat UI
- Topics filtering
- Avatar upload
- Generate/parse referral URLs + reward screen
- Delete user account

## Long term
- Mobile number verification
- Report a troll (text menu)
- Server-side rendering (SEO)
- Auto-reply bot

## Icebox (to discuss)

- Admin move post from one room to another
- Admin announcements
- Admin pinned post
-
