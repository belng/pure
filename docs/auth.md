### Sign in/up/out ###

There will be eight authentication modules facebook, google, signin, signup, signout, guest*, resource and session.

After passing through all these modules, the change object will have an `auth.user` property that contains the ID of the user; this will be used by the authorizer and by other subsequent modules.

\* guest will not be implemented for HeyNeighbor.

#### Example

During sign-up, the dialogue between client and server is something like:

```
1. client: { auth: { facebook: { token: "9b6dba..." } } }
2. server: { app: { signup: { identities: [ ... ], signedIdentities: "<jws(identities)>", params... } } }
3. client: { auth: { signup: { id: "abc", identities, signedIdentities, params } } }
4. server: { app: { session: "<jws()>" } }
```

Module order is:

1. **facebook / google**
   reads auth.facebook or auth.google and writes the auth.signin partial user object

3. **signin**
   Reads auth.signin, loads user and if exists deletes auth.signin and sets auth.user = id

4. **signup**
   If auth.signin still exists, moves it to response.signup and adds signedIdentities.
   If auth.signup exists, verifies signedIdentities, moves it to entities[id] and adds auth.user = id

5. **session**
    If auth.user is defined, adds response.app.session = jws.sign(auth.user)
    If auth.session is defined, adds auth.user = jws.verify(auth.session).sub

6. **resource**
    If auth.user is defined, sets resmap[auth.resource] = auth.user
    Else, sets auth.user = resmap[auth.resource]; resmap is a module-local JS variable.

#### Details

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

Unlike the current app, sign up does not rely on any server-side storage of a past unsuccessful sign in (guest with identity); instead the response `app.signup` will contain a special `signedIdentities` token that must be sent back to the server when the user creates the account.

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

**The guest module** is unspecified.

**The signout module** sets `auth.user` and `response.app.user` to null.

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

**The signup module**

If no `auth.signup` exists, `auth.signin` is copied to `response.app.signup`.

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

If `auth.signup` exists, it is moved to `entities` as well as `response.entities`. The id from signup is copied into `auth.user` and `response.app.user`.

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


**The session module** does two things: If `auth.session` is defined, it decodes JWS and adds `auth.user`. If `response.app.user` is defined, adds `response.app.session` property with a JWS token.

**The resource module** has an in-memory map of resource IDs to user IDs. If `auth.user` is defined, this map is updated; otherwise, the map is read to add `auth.user`.  
