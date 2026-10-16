# Window frames: ROWS vs RANGE
id: sql-m03-window-frames
track: sql

## What we're learning
A window function computes a value per row over a **window** of related rows: `function() OVER (PARTITION BY ... ORDER BY ... frame)`.

- `PARTITION BY` splits rows into groups (like GROUP BY, but rows are kept).
- `ORDER BY` orders rows within each partition.
- The **frame** picks which rows of the partition count for the current row:
  - `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW`: physical rows.
  - `RANGE BETWEEN ...`: logical range of the ORDER BY value; rows with equal values (**peers**) are included together. Oracle, Spark and Snowflake also support value offsets such as `RANGE BETWEEN INTERVAL '7' DAY PRECEDING AND CURRENT ROW`; SQL Server's RANGE supports only UNBOUNDED and CURRENT ROW.
  - `GROUPS` (some engines): groups of peers.

**The default frame trap**: when you specify `ORDER BY` without a frame, the default is `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`. With duplicate order values, all peers get the same running total, which looks like a bug. In SQL Server the RANGE default is also slower than ROWS because it spills to an on-disk worktable.

## Benefit
Specifying the frame explicitly makes running totals and moving averages correct and, in SQL Server, faster.

## Code snippet
```sql
SELECT account_id, txn_ts, amount,
       SUM(amount) OVER (PARTITION BY account_id ORDER BY txn_ts, txn_id
                         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS balance,
       AVG(amount) OVER (PARTITION BY account_id ORDER BY txn_ts, txn_id
                         ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS avg_last_7
FROM transactions;
```

## Limits and misconceptions
- Add a unique tie-breaker (`txn_id`) to ORDER BY so results are deterministic.
- `LAST_VALUE` with the default frame returns the current row, not the partition's last; set `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`.
- Ranking functions (`ROW_NUMBER`, `RANK`) ignore frames.

## Remember this
Always state ROWS frames for running calculations; the default RANGE frame groups ties and surprises people.

## Related
pyspark-m03-window-functions, sql-m03-lag-lead-running-totals, sql-m01-logical-processing-order


# Ranking functions
id: sql-m03-ranking
track: sql

## What we're learning
Four ranking functions, differing in how they treat ties (rows with equal ORDER BY values):

| Value order | ROW_NUMBER | RANK | DENSE_RANK |
|---|---|---|---|
| 100 | 1 | 1 | 1 |
| 90 | 2 | 2 | 2 |
| 90 | 3 | 2 | 2 |
| 80 | 4 | 4 | 3 |

- `ROW_NUMBER()`: unique sequential numbers; ties broken arbitrarily unless ORDER BY is unique.
- `RANK()`: ties share a rank, then a gap.
- `DENSE_RANK()`: ties share a rank, no gap.
- `NTILE(n)`: splits rows into n roughly equal buckets (quartiles, deciles).
- `PERCENT_RANK()` and `CUME_DIST()` give relative positions between 0 and 1.

## Benefit
Ranking drives deduplication (keep row 1), top-N per group, league tables and bucketing customers into segments.

## Code snippet
```sql
SELECT region, salesperson, revenue,
       RANK()  OVER (PARTITION BY region ORDER BY revenue DESC) AS rank_in_region,
       NTILE(4) OVER (ORDER BY revenue DESC) AS revenue_quartile
FROM sales_summary;
```

## Limits and misconceptions
- `ROW_NUMBER` with a non-unique ORDER BY is non-deterministic: reruns can pick different rows. Add tie-breakers.
- Choose RANK or DENSE_RANK deliberately when asking for "top 3": with ties, RANK may return more than 3 rows per group when filtering `<= 3`.

## Remember this
ROW_NUMBER is unique, RANK leaves gaps after ties, DENSE_RANK does not; pick the one that matches the business meaning of ties.

## Related
sql-m05-top-n-per-group, sql-m05-deduplication, pyspark-m03-window-functions


# LAG, LEAD and running totals
id: sql-m03-lag-lead-running-totals
track: sql

## What we're learning
Offset functions read values from other rows in the same partition:

- `LAG(col, n, default)`: value from n rows before (default 1).
- `LEAD(col, n, default)`: value from n rows after.
- `FIRST_VALUE` and `LAST_VALUE` (watch the frame) and, in Oracle, Snowflake and SQL Server 2022, `IGNORE NULLS` to carry the last known value forward.

Aggregate window functions with a frame give **running totals** (`SUM ... ROWS UNBOUNDED PRECEDING`) and **moving averages**.

## Benefit
Period-over-period change, time between events, carrying forward the last known status and cumulative balances become one pass, without self joins.

## Code snippet
```sql
SELECT customer_id, order_date, amount,
       amount - LAG(amount) OVER (PARTITION BY customer_id ORDER BY order_date) AS change_vs_prev,
       DATEDIFF(day, LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date),
                order_date) AS days_since_prev,          -- T-SQL; Oracle: order_date - LAG(order_date)
       SUM(amount) OVER (PARTITION BY customer_id ORDER BY order_date
                         ROWS UNBOUNDED PRECEDING) AS lifetime_value
FROM orders;
```

## Limits and misconceptions
- LAG returns NULL for the first row of a partition; supply a default or handle it.
- "Previous row" is only meaningful with a deterministic order; add tie-breakers.
- Date arithmetic differs by dialect: `DATEDIFF` in T-SQL and Snowflake, subtraction of dates in Oracle, `datediff` in Spark.

## Remember this
LAG and LEAD compare a row with its neighbours, and framed SUMs give running totals, all in one pass.

## Related
sql-m03-window-frames, sql-m03-gaps-and-islands, sql-m06-time-series


# Gaps and islands
id: sql-m03-gaps-and-islands
track: sql

## What we're learning
An **island** is a run of consecutive values (consecutive days a user was active, consecutive months a contract was valid, consecutive sequence numbers); a **gap** is a missing range between them.

The classic technique for islands: for consecutive integers or dates, the difference between the value and its `ROW_NUMBER()` is constant within an island. Group by that difference to get each island's start and end.

For gaps, compare each value with the next (`LEAD`) and keep pairs where the difference is more than one step.

## Benefit
Streaks, outages, contiguous validity periods and missing sequence numbers (lost records in a migration) are common questions with no obvious single SQL function; this pattern solves them in one pass.

## Code snippet
```sql
-- Islands of consecutive active days per user
WITH d AS (
  SELECT DISTINCT user_id, activity_date FROM activity
), g AS (
  SELECT user_id, activity_date,
         DATEADD(day, -ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY activity_date),
                 activity_date) AS grp                 -- Oracle: activity_date - ROW_NUMBER() ...
  FROM d
)
SELECT user_id, MIN(activity_date) AS streak_start, MAX(activity_date) AS streak_end,
       COUNT(*) AS days
FROM g GROUP BY user_id, grp;

-- Gaps in an invoice sequence
SELECT invoice_no + 1 AS gap_start, next_no - 1 AS gap_end
FROM (SELECT invoice_no, LEAD(invoice_no) OVER (ORDER BY invoice_no) AS next_no FROM invoices) x
WHERE next_no - invoice_no > 1;
```

## Limits and misconceptions
- Remove duplicates first, or ROW_NUMBER breaks the arithmetic.
- For timestamps rather than whole days, define "consecutive" with a gap threshold (that becomes sessionization).

## Remember this
Value minus ROW_NUMBER is constant within a run of consecutive values; group by it to find islands, and use LEAD to find gaps.

## Related
sql-m03-sessionization, sql-m03-ranking, sql-m06-calendar-tables


# Sessionization
id: sql-m03-sessionization
track: sql

## What we're learning
**Sessionization** groups a user's events into sessions: a new session starts when the gap since the previous event exceeds a threshold (for example 30 minutes). The standard two-step pattern:

1. Use `LAG` to compute the time since the previous event, and flag the row as a new session start when the gap exceeds the threshold (or there is no previous event).
2. A running `SUM` of the flags gives a session number per user.

Spark has a built-in `session_window` for streams and batch; Snowflake and others use the same LAG plus running-sum approach in SQL.

## Benefit
Sessions are the unit for web and app analytics (session length, pages per session, conversion per session), for call-centre contact handling and for machine operating periods.

## Code snippet
```sql
WITH e AS (
  SELECT user_id, event_ts,
         CASE WHEN LAG(event_ts) OVER (PARTITION BY user_id ORDER BY event_ts) IS NULL
                OR DATEDIFF(minute, LAG(event_ts) OVER (PARTITION BY user_id ORDER BY event_ts),
                            event_ts) > 30
              THEN 1 ELSE 0 END AS new_session
  FROM events
)
SELECT user_id, event_ts,
       SUM(new_session) OVER (PARTITION BY user_id ORDER BY event_ts
                              ROWS UNBOUNDED PRECEDING) AS session_no
FROM e;
```

## Limits and misconceptions
- The threshold is a business decision; analyse gap distributions before choosing it.
- Out-of-order or late events change sessions; recompute affected users rather than appending.
- Sessions spanning midnight or partitions by date need care in incremental processing.

## Remember this
Flag a new session when the gap since the previous event exceeds a threshold, then a running sum of flags numbers the sessions.

## Related
sql-m03-gaps-and-islands, sql-m11-funnels, pyspark-m09-event-time-watermarks
