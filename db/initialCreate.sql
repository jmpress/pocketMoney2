CREATE TABLE envelopes (
    envelope_id integer PRIMARY KEY,
    envelope_name varchar(14) UNIQUE NOT NULL,
    current_value float,
    budgeted_value float,
    isIncome boolean
);

CREATE TABLE transactions (
    transaction_id integer PRIMARY KEY,
    wd_envelope_id integer REFERENCES envelopes(envelope_id) ON DELETE CASCADE,
    transaction_date date,
    payment_recipient varchar(14),
    payment_amount float
);