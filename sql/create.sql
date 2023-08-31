-- CREATE TABLE admin(
--     weekday VARCHAR NOT NULL,
--     waiter VARCHAR NOT NULL
-- );

CREATE TABLE waiters(

       username VARCHAR NOT NULL, 
     weekday VARCHAR NOT NULL

    -- FOREIGN KEY (username) REFERENCES admin(waiter)
);