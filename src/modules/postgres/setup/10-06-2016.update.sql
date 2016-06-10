ALTER TABLE users ALTER COLUMN updatetime SET DEFAULT extract(epoch from now())*1000;
ALTER TABLE items ALTER COLUMN updatetime SET DEFAULT extract(epoch from now())*1000;
ALTER TABLE rels ALTER COLUMN updatetime SET DEFAULT extract(epoch from now())*1000;
