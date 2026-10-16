# Deduplication
id: sql-m05-deduplication
track: sql

## What we're learning
Duplicates come in two kinds: **exact duplicates** (every column identical, often from reloading a file twice) and **key duplicates** (several versions of the same business key with different values). Approaches:

- **Finding them**: `GROUP BY key HAVING COUNT(*) > 1`.
- **Selecting one row per key**: `ROW_NUMBER() OVER (PARTITION BY key ORDER BY rule)` and keep row 1. The ORDER BY is the business rule (latest update, preferred source) plus a tie-breaker.
- **Deleting duplicates in place**: in SQL Server, delete through a CTE (`WITH d AS (... ROW_NUMBER() ...) DELETE FROM d WHERE rn > 1`); in Oracle, delete by `ROWID` keeping `MIN(ROWID)` or the ROWIDs with `rn = 1`; in Snowflake, recreate the table with `QUALIFY ROW_NUMBER() ... = 1` or use `INSERT OVERWRITE`.
- `SELECT DISTINCT` removes exact duplicates in query results only.

## Benefit
Deterministic deduplication makes loads idempotent and reports trustworthy, and understanding the source of duplicates often reveals an upstream bug.

## Code snippet
```sql
-- T-SQL: keep the most recent row per customer, delete the rest
WITH d AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY customer_id
                               ORDER BY updated_at DESC, load_id DESC) AS rn
  FROM stg_customers
)
DELETE FROM d WHERE rn > 1;

-- Oracle: delete exact duplicates, keep one physical row
DELETE FROM stg_customers a
WHERE a.ROWID > (SELECT MIN(b.ROWID) FROM stg_customers b
                 WHERE b.customer_id = a.customer_id AND b.updated_at = a.updated_at);
```

## Limits and misconceptions
- `DISTINCT` hides duplicates instead of fixing them, and costs a sort or hash.
- Without a tie-breaker, the surviving row can change between runs.
- Add a unique constraint or primary key where the platform enforces it (SQL Server, Oracle) to stop duplicates at the source; analytical platforms (Snowflake, Fabric Warehouse, Delta) usually do not enforce uniqueness.

## Remember this
Find duplicates with GROUP BY HAVING, keep one per key with ROW_NUMBER and a full tie-breaking order, and fix the cause upstream.

## Related
pyspark-m03-deduplication, sql-m03-ranking, sql-m05-top-n-per-group


# Top N per group
id: sql-m05-top-n-per-group
track: sql

## What we're learning
"The three best-selling products per category", "the latest order per customer": three standard solutions:

1. **Window function** (portable): rank within each group, filter in an outer query. `QUALIFY` makes this a one-liner in Snowflake, Databricks SQL and Fabric Warehouse.
2. **APPLY / LATERAL** with `TOP` or `FETCH FIRST` per group: very efficient when an index on (group, order column) exists, typical in SQL Server.
3. Oracle also offers `FETCH FIRST n ROWS` inside `LATERAL`, and the older `KEEP (DENSE_RANK FIRST ORDER BY ...)` aggregate for "value from the top row".

## Benefit
Top-N per group is one of the most common analytical requests; knowing the patterns avoids slow correlated subqueries and wrong results with ties.

## Code snippet
```sql
-- Portable
SELECT * FROM (
  SELECT p.*, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY units_sold DESC, product_id) AS rn
  FROM product_sales p
) x WHERE rn <= 3;

-- Snowflake / Databricks SQL / Fabric Warehouse
SELECT * FROM product_sales
QUALIFY ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY units_sold DESC, product_id) <= 3;

-- Oracle: latest order amount per customer without a subquery
SELECT customer_id, MAX(amount) KEEP (DENSE_RANK LAST ORDER BY order_date) AS latest_amount
FROM orders GROUP BY customer_id;
```

## Limits and misconceptions
- Decide what ties mean: ROW_NUMBER returns exactly N; RANK may return more.
- On huge tables, the window approach sorts every group; APPLY with an index reads only N rows per group.

## Remember this
Rank within groups and filter (or QUALIFY), or use APPLY with TOP per group when an index supports it.

## Related
sql-m03-ranking, sql-m02-apply-lateral, sql-m05-deduplication


# Pivot and unpivot
id: sql-m05-pivot-unpivot
track: sql

## What we're learning
**Pivot** turns row values into columns (months across the top); **unpivot** turns columns into rows.

- **Conditional aggregation** works everywhere: `SUM(CASE WHEN month = 1 THEN qty END) AS jan`.
- **PIVOT / UNPIVOT operators** exist in T-SQL, Oracle (11g+), Snowflake and Spark SQL, with slightly different syntax. All require the list of output columns in the query; truly dynamic columns need dynamic SQL (Snowflake supports `PIVOT ... IN (ANY)` and a subquery list).
- Unpivot can also be done with `CROSS APPLY (VALUES ...)` in T-SQL, which handles several column groups and keeps NULL control.

## Benefit
Wide legacy tables (one column per month or per measure) are common in migrations; unpivoting them gives tidy, flexible tables. Pivoting produces report-shaped output when a BI tool is not involved.

## Code snippet
```sql
-- Conditional aggregation (portable)
SELECT product_id,
       SUM(CASE WHEN month_no = 1 THEN qty END) AS jan,
       SUM(CASE WHEN month_no = 2 THEN qty END) AS feb,
       SUM(CASE WHEN month_no = 3 THEN qty END) AS mar
FROM monthly_sales GROUP BY product_id;

-- T-SQL unpivot with CROSS APPLY (VALUES)
SELECT w.product_id, v.month_no, v.qty
FROM wide_sales w
CROSS APPLY (VALUES (1, w.jan), (2, w.feb), (3, w.mar)) v(month_no, qty)
WHERE v.qty IS NOT NULL;
```

## Limits and misconceptions
- UNPIVOT operators drop NULL values by default (Oracle has `INCLUDE NULLS`).
- Pivoting for presentation is usually better done in the BI layer; storing pivoted tables makes adding a month a schema change.

## Remember this
Conditional aggregation pivots portably, and unpivoting wide legacy tables into rows makes them usable.

## Related
pyspark-m03-pivot-unpivot, sql-m10-dynamic-sql-injection


# Replacing cursors with set-based SQL
id: sql-m05-replacing-cursors
track: sql

## What we're learning
A **cursor** (or a `WHILE` loop, or PL/SQL `FOR rec IN (SELECT ...) LOOP`) processes rows one at a time. Relational engines are optimised for **set-based** operations, where one statement handles all rows and the optimiser picks the plan. Row-by-row code in legacy systems is a top cause of slow batch jobs, sometimes nicknamed "RBAR" (row by agonising row).

Typical rewrites:
- Running totals in a loop to window functions.
- "For each row, look up and update" to `UPDATE ... FROM` (T-SQL), `MERGE`, or correlated updates.
- Insert-if-missing loops to `MERGE` or `INSERT ... WHERE NOT EXISTS`.
- Sequential numbering to `ROW_NUMBER()`.
- In Oracle, when a loop is truly needed, `BULK COLLECT` and `FORALL` reduce context switches between PL/SQL and SQL dramatically.

## Benefit
Rewrites often turn hours into seconds, and set-based code translates far more easily to Spark, Snowflake or Fabric during migration, where cursors are slow or unavailable.

## Code snippet
```sql
-- Row-by-row (slow): loop over orders, look up price, update total
-- Set-based (fast), T-SQL:
UPDATE o SET o.total = o.qty * p.unit_price
FROM orders o JOIN prices p ON p.product_id = o.product_id
WHERE o.total IS NULL;

-- Oracle equivalent with MERGE
MERGE INTO orders o
USING prices p ON (p.product_id = o.product_id)
WHEN MATCHED THEN UPDATE SET o.total = o.qty * p.unit_price WHERE o.total IS NULL;
```

## Limits and misconceptions
- Some logic is genuinely sequential (each row depends on the previous result in non-additive ways); recursive CTEs or careful window logic may still express it, otherwise a loop over **batches** rather than rows.
- Very large single updates can bloat transaction logs and lock tables; set-based does not mean one giant statement. Batch by key ranges.

## Remember this
Replace row-by-row loops with window functions, joins in UPDATE, MERGE and ROW_NUMBER; loop over batches, never single rows.

## Related
sql-m10-stored-procedures, sql-m08-merge-upsert, sql-m08-bulk-operations, sql-m03-lag-lead-running-totals
