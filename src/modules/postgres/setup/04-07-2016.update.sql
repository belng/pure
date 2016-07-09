ALTER TABLE contacts
    ADD valid text DEFAULT 'unsure',
    ADD lastmailtime bigint DEFAULT NULL,
    ADD lastmailverifytime bigint DEFAULT NULL;

CREATE INDEX ON contacts ((contact->>'email'), lastmailverifytime);
CREATE INDEX ON contacts ((contact->>'email'), valid, lastmailtime);
