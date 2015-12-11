This is a proposed set of changes to the client-side store implementation that
will allow get-triggered queries, "loading" or "missing" in store.getX() return
values, and localStorage.

Apart from the "loading" mentioned above and changes to the `textsById` and
`threadsById` indexes, there will be no changes in the public API.

Five properties in the store change:

- **entities** hold all raw data
- **indexes** make access faster
- **knowledge** keeps track of what data is available on client
- **pending** keeps track of queries in progress
- **recent** keeps of what data was accessed most recently

Before going into the details, it will be helpful to recollect two existing
concepts:

- current store schema, especially texts, threads, entities and indexes
- pendingQueries for de-duplication code in store/socket.js

### Query keys

pendingQueries uses keys like `scrollback/getTexts/<time>/before/<number>`. The
new store requires a similar classification structure for queries that return
arrays of objects, but instead of a single key it will have a three parts —
*resultType*, *partitionKey* and *resultRange*.

Examples of resultTypes for different queries
  - **roomUsers** for getUsers queries with a "relatedRoom" property
  - **pathItems** for getTexts or getThreads
  - *[future]* **queryEntities** for getEntities queries with a "q" filter
  - *[future]* **prefixRooms** for getRooms with a "ref" ending in "*"

The resultType determines the partition key; and the convention is that the
first word describes the partition key (room, path, query) and the second word
the type of the object returned (Users, Rooms, Items).

Examples of partitionKeys for different resultTypes:
  - "murugeshpalya" for roomUsers
  - "bangalore" (threads), "nodejs/all" (texts) etc. for pathItems

The resultType also determines the sort order; for example pathItems are
sorted by time, prefixRooms may be sorted alphabetically, etc. This in turn
affects the format of the resultRange.

Range can be either `{ start, before/after }` or `{ start, end }` depending
on where it is used.

### Changes to store schema

nav, app, context etc. remain unchanged.

In addition to rooms, users and relations, **entities** will store texts and
threads as well, indexed by ID. The textById and threadById indexes can
therefore be removed.

Queries with ref, which return only one element, are also tracked inside
entities using "loading" and "missing" strings instead of objects.

```
entities: {
	scrollback: { /* room object */ },
	<thread id>: { /* thread object */ },
	harish_nodejs: { /* relation object */ },
	loading_id: "loading",
	invalid_id: "missing"
}
```

All **indexes** will now follow a well-defined structure based on the query
type, `{ resultType: { partitionKey: [sortedArray] } }`. The arrays must
contain references to objects in entities and must be sorted by the key
appropriate to the resultType.

```
indexes: {
	roomUsers: { roomId: [sorted array of users] }
	userRooms: { userId: [sorted array of rooms] }
	pathItems: { path:   [sorted array of items] }
}
```

**Knowledge** tracks all queries except `ref` queries, and have the format
`{ resultType: { partitionKey: [array of resultRanges] } }`. resultRanges are
in the `{start, end }` format and adjacent or overlapping ones are merged
automatically.

It is updated when queries return results and on back-dn and away-dn.

```
knowledge: {
	pathItems: { murugeshpalya: [{ start: <time>, end: null }]}
},
```

**Pending** is a reimplementation of pendingQueries from socket, using the
format `{ resultType: { partitionKey: [array of resultRanges] } }`. Arrays are
not merged. A special property `length` keeps track of the total number of
outstanding queries.

It is updated when queries are made and when they complete.

```
pending: {
	roomUsers: { bangalore: [{ start: null, end: null }] },
	length: 1
},
```

**Recent** is not part of the state object — it is not updated through setState
and its changes do not trigger stateChange events; it is updated by store when
getX() is called, and used to delete unused data and reclaim memory. It has the
format `{ resultType: { partitionKey: [array of resultRangeTimes] } }`.

ResultRangeTimes are `{ start, end, time }`, and while they are not merged,
they are sorted and overlaps are normalized in favour of the more recent time.

```
recent: {
	roomUsers: { bangalore: [{ start: null, end: null, time: <timestamp> }] },
},
```

### Optional callback to `store.getX()` functions

`getTexts`, `getThreads` etc. will take an optional callback as the final
argument. They will continue to return immediately with the available data,
preserving current behavior. If a callback is provided, it will additionally be
invoked once, whenever all the requested data becomes available.
