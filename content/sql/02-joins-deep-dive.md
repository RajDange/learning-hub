# Semi joins and anti joins
id: sql-m02-semi-anti-joins
track: sql

## What we're learning
A **semi join** returns rows from the left table that have **at least one** match on the right, without duplicating them and without adding right-side columns. An **anti join** returns left rows with **no** match.

SQL expresses them as:
- Semi join: `WHERE EXISTS (SELECT 1 FROM ... WHERE correlated condition)` or `WHERE key IN (SELECT ...)`.
- Anti join: `WHERE NOT EXISTS (...)`. Avoid `NOT IN` when the subquery column can contain NULL (it returns nothing), and avoid `LEFT JOIN ... WHERE right.key IS NULL` when the join could multiply rows (it works but is less clear).

Spark SQL has explicit `LEFT SEMI JOIN` and `LEFT ANTI JOIN` syntax. Optimisers in SQL Server, Oracle and Snowflake recognise EXISTS patterns and use semi or anti join operators in the plan.

## Benefit
Existence checks ("customers with an order in 2025", "orders without an invoice") are common; semi and anti joins express them correctly and efficiently, without the row multiplication of a normal join.

## Code snippet
```sql
-- Customers who ordered in 2025 (each customer once)
SELECT c.* FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o
              WHERE o.customer_id = c.customer_id AND o.order_date >= '2025-01-01');

-- Orders with no invoice
SELECT o.* FROM orders o
WHERE NOT EXISTS (SELECT 1 FROM invoices i WHERE i.order_id = o.order_id);
```

## Limits and misconceptions
- `IN` with a list of thousands of literals is not a semi join; load the list into a table.
- The column list inside EXISTS does not matter; `SELECT 1` is a convention.

## Remember this
Use EXISTS for "has a match" and NOT EXISTS for "has no match"; NOT IN breaks when NULLs appear.

## Related
sql-m01-null-logic, pyspark-m03-joins, sql-m01-join-semantics


# APPLY and LATERAL
id: sql-m02-apply-lateral
track: sql

## What we're learning
A normal join combines two independent tables. **APPLY** (T-SQL) and **LATERAL** (Oracle 12c+, PostgreSQL, Snowflake, Spark SQL) let the right side be a subquery or function that **refers to columns of the current left row**, run once per left row:

- `CROSS APPLY` / `CROSS JOIN LATERAL`: like an inner join; left rows with no right rows are dropped.
- `OUTER APPLY` / `LEFT JOIN LATERAL ... ON TRUE`: like a left join; left rows are kept with NULLs.

Oracle supports both `CROSS APPLY`/`OUTER APPLY` and `LATERAL` from 12c. Snowflake uses `LATERAL` with `FLATTEN` to explode semi-structured data.

## Benefit
APPLY solves "for each row, get the top N related rows" and "call a table-valued function per row" cleanly, and is often faster than window-function alternatives when an index supports the inner query.

## Code snippet
```sql
-- T-SQL: the three latest orders per customer
SELECT c.customer_id, o.order_id, o.order_date
FROM customers c
CROSS APPLY (SELECT TOP (3) order_id, order_date
             FROM orders o
             WHERE o.customer_id = c.customer_id
             ORDER BY order_date DESC) o;

-- Snowflake: one row per array element
SELECT e.id, f.value:sku::string AS sku
FROM events e, LATERAL FLATTEN(input => e.payload:items) f;
```

## Limits and misconceptions
- Without a suitable index the inner query runs as a scan per left row, which is slow on large tables.
- Scalar functions per row in APPLY can hide expensive logic; inline table-valued functions are optimised much better.

## Remember this
APPLY and LATERAL run a correlated subquery per left row, ideal for top-N-per-row and per-row table functions.

## Related
sql-m05-top-n-per-group, sql-m07-json, sql-m10-functions


# Non-equi joins and self joins
id: sql-m02-non-equi-self-joins
track: sql

## What we're learning
A **non-equi join** uses a condition other than equality: ranges (`BETWEEN`), inequalities, or overlaps. Typical uses:
- Mapping a value into bands: an order amount to a discount tier with `amount BETWEEN tier.low AND tier.high`.
- Point-in-time lookups: a transaction to the exchange rate valid on its date (`t.date >= r.valid_from AND t.date < r.valid_to`).
- Overlapping intervals: bookings that overlap (`a.start < b.end AND b.start < a.end`).

A **self join** joins a table to itself under different aliases: employees to managers, an event to the previous event, or rows to compare within the same table.

## Benefit
Many business rules are ranges, not equalities; non-equi joins express them directly, and self joins answer "compare a row with related rows of the same kind".

## Code snippet
```sql
-- Exchange rate valid at the transaction date (half-open interval avoids double matches)
SELECT t.txn_id, t.amount * r.rate AS amount_eur
FROM transactions t
JOIN fx_rates r
  ON r.currency = t.currency
 AND t.txn_date >= r.valid_from
 AND t.txn_date <  r.valid_to;

-- Overlapping bookings for the same room
SELECT a.booking_id, b.booking_id
FROM bookings a JOIN bookings b
  ON a.room_id = b.room_id AND a.booking_id < b.booking_id
 AND a.start_ts < b.end_ts AND b.start_ts < a.end_ts;
```

## Limits and misconceptions
- Range joins cannot use hash joins on the range part; on big data they can be very slow (nested loops). Include an equality key where possible, and in Spark consider bucketing by time or range-join hints.
- Use half-open intervals (`>= start AND < end`) to avoid a value matching two ranges at boundaries.
- Comparing to the previous row is usually simpler and faster with `LAG` than with a self join.

## Remember this
Non-equi joins express ranges and overlaps; include an equality key, use half-open intervals, and prefer LAG over self joins for previous-row logic.

## Related
sql-m03-lag-lead-running-totals, sql-m06-scd, sql-m01-join-semantics
