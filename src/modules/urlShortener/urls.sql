DROP TABLE IF EXISTS urls;

CREATE TABLE urls (
	shorturl text NOT NULL UNIQUE,
	longurl text NOT NULL,
	count integer DEFAULT 0 NOT NULL
);