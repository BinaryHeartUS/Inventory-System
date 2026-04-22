CREATE TABLE test_table (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL
);

INSERT INTO test_table (name) VALUES ('test name');