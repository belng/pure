#Valid - a promising alternative#

A valid percentage is an integer between zero and hundred:

	valid(percentage).isInteger().isInRange(0, 100)
	.then ( /* ... */ )


The basic unit of validation is NOT a datatype, it is a validation or
sanitization *function* - think `isInteger`, `isInRange` etc.

This is because we often want different mixes of validation and
sanitization on the same data type. Examples below will make this use case
clearer.

The function name convention is:

- isType() - a validator
- makeType() - a sanitizer

Irrespective of the name, each returns a promise-like object on which other
sanitization/validation function calls can be chained.

Validation failure causes the promise to be rejected; success causes it to be
resolved with a valid value.

## Usage examples ##

	// using built-ins to validate entity id's

	valid(value)
		.isString()
		.matches(/^[a-z0-9\-]{3,}$/) // breaking convention here because isMatching() isDumb.
		.then(
			(val) => { /* handle a successful validation here */ },
			(err) => { /* handle unsuccessful validation here */}
		);

	// using a custom validator; (how to define it? that comes further down)

	valid(value)
		.isEntityId()

	// simple sanitization + validation

	valid(value)
		.makeLowerCase()
		.isEntityId()

	// full sanitization and a uniqueness validator

	valid(value)
		.makeEntityId()
		.isUniqueEntityId()

	// full sanitization including uniqueness

	valid(value)
		.makeUniqueEntityId()


## Defining functions ##

The `library.fn.pluginName` approach is shamelessly lifted from JQuery.

	// a simple example composing other functions

	valid.fn.isEntityId = function () {
		return this.isString().matches(/^[0-9a-z\-]{3,}$/);
	}

	// a much more complex example.

	valid.fn.makeUniqueEntityId = function () {
		let promise = valid();

		this.then(function (id) {
			core.emit("getEntities", { ref: id + "*" }, function (err, payload) {
				if (err) promise.reject(err);

				let taken = {};
				payload.results.forEach((entity) => { taken[entity.id] = true; });

				if (!taken[id]) promise.resolve(id);

				for(let i = 0; i < 9; i++) {
					if(!taken[id + i]) promise.resolve(id + i);
				}

				// All options from 1 through 9 are taken.
				promise.reject(valid.error("No variation of " + id + " is available"));
			});

		}, function (err) {
			// A failure in a previous function; pass it through.
			promise.reject(err);
		});

		return promise;
	}


## The library ##

It turns out that it's just 5 lines, so code beats explanation:

	function valid () {
		var promise = Object.create(valid.fn);
		if(arguments.length > 0) promise.resolve(arguments[1]);
		return promise;
	}

	valid.fn = new Promise();

	// valid() return values aren't children of Promise.prototype, they are grandchildren.
	// But they *should* behave just like regular promises (i.e. their uncles and aunts).

Of course, we have to also write the built-in functions:

	valid.fn.isString = function () {
		let promise = valid();

		this.then((val) => {
			if (typeof val === "string") {
				promise.resolve(val);
			} else {
				promise.reject(valid.error(""));
			}
		});

		return promise;
	}
