### Sign in/up/out ###

There will be six authentication modules facebook, google, signout, guest*, resource and session, as well as a helper module signin.

After passing through all these modules, the change object will have an `auth.user` property that contains the ID of the user; this will be used by the authorizer and by other subsequent modules.

\* guest will not be implemented for HeyNeighbor.

**The client** does sign in/up/out by sending an `auth` property on the change object. The response will set `app.user` to a user id for successful sign in/up, to `null` to indicate sign out, or leave it undefined and have a separate `app.signup` property containing a partial user object if a sign up is needed.

The `auth` property contains a facebook or google token or a session ID, for both sign in and sign up. During sign up, `auth` contains an additional `signup` property containing a partial user object.

```javascript
{
	auth: {
		facebook: "<access token>",
		signup: { /* Partial user object, including id */ }
	}
}
```

Unlike the current app, sign up does not rely on any server-side storage of a past unsuccessful sign in (guest with identity). The login token must be sent again, and a second facebook API call will be made during sign up. This one-time overhead allows us to avoid storing and invalidate guests.

**The socket module** stores in-memory session IDs for each connection, and adds it to every incoming change.

```javascript
{
	auth: {
		facebook: "<access token>",
		signup: { ... },
		resource: "<resource id>"
	}
}
```

**The facebook module** uses the access token to get the email address, name and picture and adds a partial user object to `auth.signin`.

```javascript
{
	auth: {
		facebook: "<access token>",
		resource: "<resource id>",
		signup: { ... },
		signin: {
			identities: [
				"mailto:<email address>",
				"facebook:<facebook id>"
			],
			params: {
				facebook: {
					picture: "<facebook picture url>",
					name: "<full name as on facebook>",
					token: "<facebook access token>"
				}
			}
		}
	},
	source: "<server or process id>"
}
```

**The signin module** makes a database query with the identities in partial to load a user.

If a user exists, it adds the user id to `auth.user` and to `response.app.user`, and the user object to `response.entities`. It then compares the signin object with the pre-existing user, and writes any updates to `entities`.

```javascript
{
	entities: {
		harish: {
			type: "user",
			identities: ["facebook:<facebook id>"]
		}
	},
	response: {
		app: { user: "harish" },
		entities: { harish: { /* full user object */ }
	},
	auth: {
		facebook: "<access token>",
		resource: "<resource id>",
		signin: { ... },
		user: "harish"
	},
	source: "<server or process id>"
}
```

If no user exists, and no `auth.signup` exists, `auth.signin` is copied to `response.app.signup`.

```javascript
{
	response: {
		app: { signup: { ... } }
	},
	auth: {
		facebook: "<access token>",
		resource: "<resource id>",
		signin: { ... },
		user: "harish"
	},
	source: "<server or process id>"
}
```

If `auth.signup` exists, `signin` is merged into it and the combined object is added to `entities` and `response.entities`. The id from signup is copied into `auth.user` and `response.app.user`.

```javascript
{
	entities: {
		harish: { /* full user object */ }
	},
	response: {
		app: { user: "harish" },
		entities: { harish: { /* full user object */ }
	},
	auth: {
		facebook: "<access token>",
		resource: "<resource id>",
		signin: { ... },
		signup: { ... },
		user: "harish"
	},
	source: "<server or process id>"
}
```

**The signout module** sets `auth.user` and `response.app.user` to null.

**The session module** does two things: If `auth.session` is defined, it decodes JWS and adds `auth.user`. If `response.app.user` is defined, adds `response.app.session` property with a JWS token.

**The resource module** has an in-memory map of resource IDs to user IDs. If `auth.user` is defined, this map is updated; otherwise, the map is read to add `auth.user`.  
