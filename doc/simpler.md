# Objects #

## Entity ##

The base class of all users, rooms, threads, texts and categories.

- id
- type
- tags [array of texts]
- createTime
- updateTime

### Storage ###

Postgres table inheritance is used to construct a hierarchy:

```
      Entity
  +-----+-----+
User         Item
        +-----+-----+
      Root         Post
```

## Item ##

A room, a category, a thread or a text. Anything that is followable.

- name [display name for rooms, title of threads]
- body [text content or description]
- parentIds [array of room, thread or category IDs]
- creatorId [user who created the room or sent the text]
- updaterId
- createTime
- updateTime
- length [number of direct children]
- voteScore [calculated from upvotes/downvotes]
- location [lat, lon]
- guides [jsonb visible to all]
- params [jsonb visible only to owners]
- public [flag: shows up in search?]
- terms [database-internal]

The `parentIds` property of a thread will contain a room and categories
while that of a text will contain a thread, room and categories. This
removes the need to recursively query ancestors.

Rooms and categories are “_roots_" — they have no parents. While all
items can have moderators, followers, visitors and banned users, only
roots can have owners.

A thread or text descendant of multiple roots is under the shared
ownership; this situation is analogous to a single room having two
owners today.

### Storage ###

`items` is the base table with two subtables — `roots` for rooms and
categories, and `posts` for texts and threads. `location`, `private`
and `public` will only be present on the `roots` table.

## User ##

- id
- name
- classes ["mailto", "twitter", "guest"]
- identities [unique, "mailto:abc@def.com"]
- timezone
- locale
- createTime
- updateTime
- karma [integer]
- experience [integer]
- params [jsonb]

## Relation ##

A relation between an item by a user, containing presence and
affiliation information. We treat this now as a full object.

Relations also contain upvotes and downvotes and an “interest” score
that may be used for prioritizing notifications.

- userId
- itemId
- role
- roleTime
- status [overall/higest]
- statuses [map of resource to status]
- statusTime [of overall status change]
- adminId
- message
- transitionRole
- transitionType
- transitionTime
- vote [zero, positive or negative]
- interest [integer, 100 = default]
- public [flag]
- params [jsonb]

### RelUsers and RelItems ###

These are user and item objects with an additional property `rel` which
contains a rel object.

### Storage ###

`rootrels` and `postrels` may be stored in subtables to improve perf
for `rootrels` queries that will be more frequent.

## Note ##

- userId
- itemId
- type
- group
- score
- data
- createTime
- readTime
- dismissTime

# Actions #

Common properties

- id
- type
- time
- sessionId
- resourceId

- note
- notify

Actions now always contain the underlying object in a separate
property.

## setItem ##
- item [object]

- user
- old [the old item being overwritten, if any]
- parents [map with parentID as key]
- rels [map this item's and parents' Ids as key]

## setUser ##
- auth [sent on signin or signout]
  - guest [suggested nick or signout], facebook, google

- user [sent on signup/save or generated from auth]
  - identities [should not accept if not in old]

- old [the user from the current session]

If get is specified the response may also have:

- notes [array of note objects]
- relRoots [related rooms and categories]

## setUserRels ##

Join, part, away, back, voting

- rels [map of itemId to rel objects]

- user
- items [map of itemId to item objects]
- parents [map of parentId to parent item objects]
- old [map of itemId to old rel objects]

## setItemRels ##

Admit/expel

- itemId
- rels [map of userId to rel objects]

- user [the administrator]
- item
- parents [map of parentId to parent item objects]
- old [map of itemId to old rel objects]


# Queries #

There are two options; one (below) is to similar to what we have now; the
other is to use GraphQL.

## getEntities ##

Used for generating the page when a user goes to sb.lk/:id

## getItems ##

Used for getting threads and texts while browsing, autocomplete rooms and
categories, etc.

## getUsers ##

Autocomplete usernames, show a user profile.

## getRels ##

Get names for the people list or a user’s room list

## getNotes ##

Get an array of note objects.

# Action/query chaining #

To improve startup perf, we should allow the client to send a `setUser`
(currently init), `getItems` (getting occupant/member rooms), getItems
for featured rooms and `getNotes` to the server in one shot without
waiting for responses. server socket should queue them to ensure that
they execute in the right order. client socket should ensure that the
setUser is the first one.
