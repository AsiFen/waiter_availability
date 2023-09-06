
-- CREATE TABLE waiters (
--  id serial PRIMARY KEY,
--  username VARCHAR NOT NULL
-- );

-- CREATE TABLE weekdays (
--     id serial PRIMARY KEY,
--     weekday VARCHAR NOT NULL
-- );

-- CREATE TABLE schedule (
--     id serial PRIMARY KEY,
--     waiter_id INTEGER,
--     weekday_id INTEGER, 
--     FOREIGN KEY(waiter_id) REFERENCES waiters(id),
--    FOREIGN KEY(weekday_id) REFERENCES weekdays(id)
-- )
-- ;
CREATE TABLE user_selections (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    day VARCHAR(255) NOT NULL,
    selected BOOLEAN NOT NULL
);
