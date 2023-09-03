-- CREATE TABLE admin(
--     weekday VARCHAR NOT NULL,
--     waiter VARCHAR NOT NULL
-- );

CREATE TABLE waiters(
--  id serial PRIMARY KEY,
 username VARCHAR NOT NULL, 
 weekday VARCHAR NOT NULL
    -- FOREIGN KEY (username) REFERENCES admin(waiter)
);