# NULL and three-valued logic
id: sql-m01-null-logic
track: sql

## What we're learning
In SQL, `NULL` means "unknown". Any comparison with NULL (`=`, `<>`, `>`) returns **UNKNOWN**, not TRUE or FALSE. SQL therefore uses **three-valued logic**: TRUE, FALSE, UNKNOWN. `WHERE` and `JOIN ... ON` keep a row only when the condition is TRUE, so UNKNOWN rows silently disappear.

Consequences:
- `WHERE status <> 'CLOSED'` drops rows where status is NULL.
- `NOT IN (subquery)` returns **no rows at all** if the subquery contains a single NULL, because `x NOT IN (1, NULL)` means `x <> 1 AND x <> NULL`, which is never TRUE.
- Aggregates ignore NULLs (`AVG` of 10 and NULL is 10); `COUNT(col)` skips NULLs, `COUNT(*)` does not.
- `GROUP BY` and `DISTINCT` treat all NULLs as one group, although NULL does not equal NULL in comparisons.

Tools: `IS NULL`, `IS NOT NULL`, `COALESCE`, `NULLIF`; null-safe comparison with `IS [NOT] DISTINCT FROM` (SQL Server 2022+, Spark SQL, Snowflake; Spark also has `<=>`). Oracle offers `NVL`, `NVL2` and `DECODE`, which treats two NULLs as equal.

**Oracle trap**: Oracle treats the empty string `''` as NULL. `WHERE col = ''` never matches in Oracle; in SQL Server, Spark and Snowflake `''` is a real value. Migrations from Oracle often change row counts because of this.

## Benefit
Most "the numbers don't match" bugs in reports and migrations are NULL bugs. Knowing three-valued logic finds them quickly.

## Code snippet
```sql
-- Safe "not in": NOT EXISTS ignores NULLs in the subquery
SELECT c.customer_id
FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM blocked b WHERE b.customer_id = c.customer_id);

-- Change detection that treats NULL = NULL as unchanged (SQL Server 2022+, Spark, Snowflake)
SELECT s.id FROM src s JOIN tgt t ON t.id = s.id
WHERE s.email IS DISTINCT FROM t.email;
```

## Limits and misconceptions
- `ANSI_NULLS OFF` in old SQL Server code changes comparison behaviour; it is deprecated, but legacy code may rely on it.
- `ISNULL` (SQL Server) and `COALESCE` differ in return type rules; `COALESCE` is the portable choice.

## Remember this
NULL comparisons are UNKNOWN and filtered out; use IS NULL, NOT EXISTS and null-safe comparison, and remember Oracle's empty string is NULL.

## Related
pyspark-m02-nulls, sql-m02-semi-anti-joins, sql-m12-dialect-translation


# Logical query processing order
id: sql-m01-logical-processing-order
track: sql

## What we're learning
SQL is written in one order but evaluated logically in another:

1. `FROM` and `JOIN` (including `ON`)
2. `WHERE`
3. `GROUP BY`
4. `HAVING`
5. `SELECT` (expressions, window functions, aliases)
6. `DISTINCT`
7. `ORDER BY`
8. `TOP` / `OFFSET ... FETCH` / `LIMIT`

This **logical** order explains many rules:
- A column alias defined in `SELECT` cannot be used in `WHERE` or `GROUP BY` (in T-SQL and Oracle) because those run earlier; it can be used in `ORDER BY`.
- Window functions cannot appear in `WHERE`; filter them in an outer query, or with `QUALIFY` where supported (Snowflake, Databricks SQL, Fabric Warehouse; not in SQL Server or Oracle).
- `HAVING` filters groups after aggregation; `WHERE` filters rows before.

The optimiser may execute physically in any order that gives the same result.

## Benefit
This one list resolves a large class of "why does this error?" and "why is this result wrong?" questions.

## Code snippet
```sql
-- Fails in T-SQL and Oracle: alias not yet defined at WHERE
-- SELECT amount * 1.2 AS gross FROM orders WHERE gross > 100;

SELECT *
FROM (SELECT o.*, amount * 1.2 AS gross FROM orders o) x
WHERE gross > 100;

-- Snowflake / Databricks: filter a window result directly
SELECT * FROM orders
QUALIFY ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC) = 1;
```

## Limits and misconceptions
- Some engines relax rules: Snowflake and Spark SQL allow referencing select aliases in `WHERE` and `GROUP BY` in many cases. Portable code should not rely on it.
- Logical order is not execution order; do not use it to reason about performance.

## Remember this
FROM, WHERE, GROUP BY, HAVING, SELECT, DISTINCT, ORDER BY, then TOP or LIMIT: this logical order explains alias and window-function rules.

## Related
sql-m01-join-semantics, sql-m03-window-frames, pyspark-m05-sql-on-dataframes


# Join semantics
id: sql-m01-join-semantics
track: sql

## What we're learning
- **INNER JOIN** keeps pairs of rows where the ON condition is TRUE.
- **LEFT (OUTER) JOIN** keeps all left rows; unmatched ones get NULLs for right columns. **RIGHT** is the mirror; **FULL** keeps both sides.
- **CROSS JOIN** pairs every row with every row.

Two traps cause most join bugs:

1. **ON versus WHERE in outer joins**. A condition on the right table in `WHERE` removes the NULL-extended rows and turns a LEFT JOIN into an inner join. Put right-table filters in `ON` to keep unmatched left rows.
2. **Row multiplication**. If a key is not unique on one side, each left row is repeated once per match, inflating sums. Joining orders to a payments table with several payments per order doubles order amounts.

Oracle's old `(+)` outer join syntax and SQL Server's long-removed `*=` appear in legacy code and should be rewritten to ANSI joins.

## Benefit
Correct joins are the difference between right and wrong totals; these two rules catch most errors.

## Code snippet
```sql
-- All customers, with only their 2025 orders (filter in ON keeps customers without orders)
SELECT c.customer_id, o.order_id
FROM customers c
LEFT JOIN orders o
  ON o.customer_id = c.customer_id
 AND o.order_date >= DATE '2025-01-01';

-- Check uniqueness before trusting a join
SELECT order_id, COUNT(*) FROM payments GROUP BY order_id HAVING COUNT(*) > 1;
```

## Limits and misconceptions
- NULL keys never match in equality joins.
- Joining on columns of different types forces implicit conversions, which can be slow and give surprising matches (string `'01'` versus number `1`).

## Remember this
Put outer-join filters in ON, and check key uniqueness before trusting sums after a join.

## Related
pyspark-m03-joins, sql-m02-semi-anti-joins, sql-m01-null-logic, snowflake-m03-query-profile


# Set operations
id: sql-m01-set-operations
track: sql

## What we're learning
Set operators combine results of queries with the same number of columns and compatible types, matched **by position**:

- `UNION ALL`: all rows from both, duplicates kept. Cheapest.
- `UNION`: duplicates removed (requires a sort or hash step).
- `INTERSECT`: rows in both.
- `EXCEPT` (T-SQL, Spark SQL, Snowflake, Oracle 21c+) / `MINUS` (Oracle; Snowflake also accepts it): rows in the first not in the second.

Set operators treat NULLs as equal to each other when comparing rows, unlike `=`. Oracle 21c and later and some other engines also support `ALL` variants of INTERSECT and EXCEPT that keep duplicates.

## Benefit
`EXCEPT` in both directions is a fast way to diff two tables during migration testing, and `UNION ALL` is the efficient way to append results.

## Code snippet
```sql
-- Rows in source missing or different in target (and vice versa)
SELECT id, amount, status FROM src
EXCEPT
SELECT id, amount, status FROM tgt;

SELECT id, amount, status FROM tgt
EXCEPT
SELECT id, amount, status FROM src;
```

## Limits and misconceptions
- Columns match by position, not name; a swapped column order silently mixes data.
- `UNION` where `UNION ALL` would do adds an expensive deduplication step; a common performance mistake.
- `EXCEPT` and `INTERSECT` remove duplicates; counts can differ from row-level reality if the data has duplicates.

## Remember this
Prefer UNION ALL unless duplicates must go, match columns by position carefully, and use EXCEPT both ways to diff tables.

## Related
pyspark-m03-union, sql-m12-reconciliation, sql-m01-null-logic
