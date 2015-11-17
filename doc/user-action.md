Merge user and init into a new user action used for:

- initializing a connection
- signing in
- signing up
- signing out
- profile update

OccupantOf and MemberOf are removed, and must be retrieved using separate queries.

Schema
------
{
	id: actionID,
	type: "user",
	to: "me",
	time: timestamp,
	
	from: String,
	old: User,	// Previous user object
	user: User,	// New user object
	
	session: sessionID,
	resource: resourceID,
	origin: Origin,
	
	suggestedNick: String,
	auth: Authentication,
	
	identities: [Identity] // Populated by the *-auth server modules
}


Initialization of a new connection
----------------------------------

Immediately after a socket is opened, the client MUST send a user action, which
MUST contain `session`. It MAY also contain `suggestedNick` or `auth`. It MUST
NOT contain `user`.

Subsequent actions sent on the same socket SHOULD NOT send `session`.


Sign in
-------

Sign-in user actions MUST contain `auth`.


Sign up and updates
-------------------

Update user actions MUST contain `user`. `user.identities` MUST NOT contain any
identities that are not already saved on the server for that user.

When identities need to be added, such as during sign up or when linking extra
social accounts, `auth` MUST be passed.


Sign out
--------

Sign-out MUST contain `user` with `id: "guest"`.


Server-side processing of user actions
--------------------------------------

1.	entityloader: if the session exists, `old` is populated with the
	associated user object and `from` with the user id.

2.	authorizer rules (in order):
 - allow if there is no `user` or if `user` has no `id`
 - allow if `user.id` is `"guest"`
 - allow if `user.id` equals `old.id`
 - reject if `user.id` is already in the database
 - reject if there is no `auth`
 - allow if `old` is undefined or guest
 - reject otherwise

3.	*-auth: if `auth` exists, `identities` is populated
	with data from facebook / google / persona / jws. If authentication fails,
	an error is thrown.
	
4.	signin: if `identities` exists and a user exists with the first 
	identity, populates `old`.

5.	guest-initializer: if no old property exists and user object has no id,
	populate with an empty guest user, taking suggestedNick into consideration
	and ensuring no duplicates.	If `user.id` is `"guest"`, it populates `user` 
	similarly.
	
6.	*-picture-provider: if `auth` exists, the user's picture URL is loaded from
	facebook/google and applied to `user`. If the user property does not exist,
	an empty one is created.
	
7.	user-builder: (1) Verifies that `user` does not contain identities that do
	not appear in `old` (deletions are allowed). (2) If `user.id` is null or
	matches `old.id`, extends `old` with `user` sets this object as the new 
	`user`; (3) Adds items from `identities` to `user.identities`.

8.	storage: Inserts or updates the value of `user` into the database. If 
	`user.id` is not equal to `from`, delete `from`.

9.	session-saver: If `user.id` is not equal to `from`, update the session.

10. presence-manager: If `user.id` is not equal to `from` and the userid `from`
	is occupying rooms, emit aways from `from` and backs from `user.id`.


Client-side semantics
---------------------

Whenever a user object is received, set the current user to that.

Sign-up-required is indicated when a user with auth is returned with a guest as
`user.id` and there are `identities`.
