# Calendar and date dimension tables
id: sql-m06-calendar-tables
track: sql

## What we're learning
A **calendar table** (date dimension) has one row per date, with precomputed attributes: year, quarter, month, week number, day of week, is_weekend, is_holiday, fiscal year and period, working-day number, and anything else the business uses. Facts join to it on the date key.

It is generated once for a range of years with a recursive CTE, a numbers table, or a generator function (`GENERATE_SERIES` in SQL Server 2022, `CONNECT BY LEVEL` in Oracle, `GENERATOR` in Snowflake, `sequence` and `explode` in Spark).

## Benefit
- Reports group by fiscal periods or ISO weeks consistently without repeating date logic.
- Days with no activity still appear (left join from the calendar), which keeps charts and averages honest.
- Business-day calculations ("5 working days after") become simple lookups.

## Code snippet
```sql
-- SQL Server 2022+
SELECT d.dt,
       YEAR(d.dt) AS year_no, DATEPART(quarter, d.dt) AS quarter_no,
       DATEPART(iso_week, d.dt) AS iso_week,
       CASE WHEN DATENAME(weekday, d.dt) IN ('Saturday','Sunday') THEN 1 ELSE 0 END AS is_weekend
FROM (SELECT DATEADD(day, value, '2020-01-01') AS dt
      FROM GENERATE_SERIES(0, 4017)) d;

-- Oracle
SELECT DATE '2020-01-01' + LEVEL - 1 AS dt FROM dual CONNECT BY LEVEL <= 4018;
```

## Limits and misconceptions
- Holidays differ by country and change; maintain them as data, not code.
- `DATENAME` and week numbering depend on language and `DATEFIRST` settings in SQL Server; ISO weeks avoid ambiguity.
- In star schemas, Power BI and other BI tools expect a proper date table for time intelligence.

## Remember this
A calendar table precomputes date attributes and fills missing days, making time reporting consistent and simple.

## Related
sql-m06-time-series, fabric-m07-semantic-models, sql-m11-cohorts-retention


# Time series queries
id: sql-m06-time-series
track: sql

## What we're learning
Common time-series operations in SQL:

- **Bucketing**: truncate timestamps to a period: `DATE_TRUNC('hour', ts)` (Snowflake, Spark, Fabric), `DATETRUNC(hour, ts)` (SQL Server 2022), `TRUNC(ts, 'HH24')` (Oracle), or `DATE_BIN` for arbitrary intervals (SQL Server 2022).
- **Filling gaps**: left join from a calendar or generated time series so empty periods show zero.
- **Period-over-period**: `LAG(value, 12)` over months for year-over-year, or join to the same period last year via the calendar table.
- **Rolling windows**: moving averages with `ROWS BETWEEN n PRECEDING AND CURRENT ROW` (after filling gaps), or `RANGE` with interval offsets in Oracle and Snowflake.
- **Time zones**: store UTC, convert for display (`AT TIME ZONE` in T-SQL and Oracle, `CONVERT_TIMEZONE` in Snowflake, `from_utc_timestamp` in Spark).

## Benefit
Correct bucketing and gap filling are what make trend charts, SLAs and capacity reports accurate.

## Code snippet
```sql
-- Hourly event counts with empty hours shown as zero (Snowflake)
WITH hours AS (
  SELECT DATEADD(hour, SEQ4(), '2025-10-15 00:00'::timestamp) AS hr
  FROM TABLE(GENERATOR(ROWCOUNT => 24))
)
SELECT h.hr, COUNT(e.event_id) AS events
FROM hours h
LEFT JOIN events e ON DATE_TRUNC('hour', e.event_ts) = h.hr
GROUP BY h.hr ORDER BY h.hr;
```

## Limits and misconceptions
- A moving average over rows is wrong if periods are missing; fill gaps first.
- Daylight saving changes create 23- and 25-hour days in local time; aggregate in UTC or handle explicitly.
- Filtering with a function on the timestamp column (`WHERE CAST(ts AS DATE) = ...`) can prevent index or partition use; filter with a range instead.

## Remember this
Bucket with date truncation, fill gaps from a calendar, compare periods with LAG or calendar joins, and keep timestamps in UTC.

## Related
sql-m06-calendar-tables, sql-m03-lag-lead-running-totals, python-m04-time-series, sql-m09-sargability


# Slowly changing dimensions in SQL
id: sql-m06-scd
track: sql

## What we're learning
Dimensions such as customer or product change over time. Designs:

- **Type 1**: overwrite. No history; reports always show current attributes.
- **Type 2**: keep history. Each version is a row with a **surrogate key**, `valid_from`, `valid_to` (often `9999-12-31` for current) and an `is_current` flag. Facts store the surrogate key valid at the time of the event.
- **Type 3**: keep the previous value in an extra column. Limited history.
- **Type 6** (hybrid 1+2+3): type 2 rows plus a current-value column on every row.

A type 2 load in SQL: find changed rows by comparing tracked attributes (null-safe), **expire** the current versions (`UPDATE ... SET valid_to = load_date, is_current = 0`), then **insert** new versions. It can be done with two statements in a transaction, or with MERGE using the "insert via a NULL key" trick.

## Benefit
Type 2 answers "what did we know, and how was this customer classified, at the time of each sale", which audits and accurate historical reporting require.

## Code snippet
```sql
-- T-SQL, two-step type 2 load inside a transaction
BEGIN TRAN;
UPDATE d SET d.valid_to = s.load_date, d.is_current = 0
FROM dim_customer d JOIN stg_customer s ON s.customer_id = d.customer_id
WHERE d.is_current = 1
  AND (d.segment <> s.segment OR (d.segment IS NULL AND s.segment IS NOT NULL)
       OR (d.segment IS NOT NULL AND s.segment IS NULL));

INSERT INTO dim_customer (customer_id, segment, valid_from, valid_to, is_current)
SELECT s.customer_id, s.segment, s.load_date, '9999-12-31', 1
FROM stg_customer s
WHERE NOT EXISTS (SELECT 1 FROM dim_customer d
                  WHERE d.customer_id = s.customer_id AND d.is_current = 1);
COMMIT;
```

## Limits and misconceptions
- Track only meaningful attributes; tracking everything creates versions for noise.
- Late-arriving changes and corrections to history need special handling (inserting versions in the middle).
- Facts must look up the surrogate key valid at the event date; a join on the natural key with `is_current = 1` gives current, not historical, attributes.

## Remember this
Type 1 overwrites, type 2 expires the old row and inserts a new version with validity dates; facts store the version's surrogate key.

## Related
pyspark-m08-scd-patterns, sql-m08-merge-upsert, sql-m06-temporal-tables, sql-m01-null-logic


# System-versioned temporal tables and flashback
id: sql-m06-temporal-tables
track: sql

## What we're learning
Databases can keep row history automatically:

- **SQL Server temporal tables** (system-versioned, SQL Server 2016+, Azure SQL): the table has `ValidFrom`/`ValidTo` period columns and a linked **history table**. Every update or delete moves the old version to history automatically. Query past states with `FOR SYSTEM_TIME AS OF '2025-06-30'`, `BETWEEN`, or `ALL`.
- **Oracle Flashback Query**: `SELECT ... AS OF TIMESTAMP` or `AS OF SCN` reads past data from undo, within the undo retention. **Flashback Data Archive** (Total Recall) keeps long-term history.
- Lakehouse and cloud equivalents: Delta time travel, Snowflake Time Travel.

## Benefit
Audit trails and "what did this record look like before?" questions are answered without triggers or hand-built history tables, and accidental changes can be inspected and reversed.

## Code snippet
```sql
-- SQL Server
CREATE TABLE dbo.Customer (
  CustomerId INT PRIMARY KEY, Segment NVARCHAR(20),
  ValidFrom DATETIME2 GENERATED ALWAYS AS ROW START,
  ValidTo   DATETIME2 GENERATED ALWAYS AS ROW END,
  PERIOD FOR SYSTEM_TIME (ValidFrom, ValidTo)
) WITH (SYSTEM_VERSIONING = ON (HISTORY_TABLE = dbo.CustomerHistory));

SELECT * FROM dbo.Customer FOR SYSTEM_TIME AS OF '2025-06-30T00:00:00';

-- Oracle
SELECT * FROM customers AS OF TIMESTAMP (SYSTIMESTAMP - INTERVAL '2' HOUR) WHERE customer_id = 42;
```

## Limits and misconceptions
- System time is when the database changed, not when the business change happened. For business-effective dates you still need SCD-style modelling.
- History tables grow; set retention policies.
- Oracle Flashback Query depends on undo retention and can fail with "snapshot too old" for older times.

## Remember this
Temporal tables and flashback keep system-time history automatically; business-effective history still needs dimensional modelling.

## Related
snowflake-m04-time-travel-fail-safe, pyspark-m08-delta-time-travel-vacuum, sql-m06-scd, sql-m10-triggers
