CREATE TABLE urls (
	shorturl text PRIMARY KEY,
	longurl text NOT NULL
);

CREATE TABLE articles (
	url text NOT NULL,
	rawjson jsonb NOT NULL,
	terms tsvector NOT NULL
);

CREATE TABLE feeds (
	url text PRIMARY KEY,
	mtbu float(24) NOT NULL,
	lastrequesttime bigint NOT NULL,
	lastupdatetime bigint NOT NULL
);