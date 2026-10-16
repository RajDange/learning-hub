# Execution plans
id: sql-m09-execution-plans
track: sql

## What we're learning
An **execution plan** shows how the optimiser decided to run a query: which indexes, which join algorithms, in what order, with estimated and actual row counts.

- **SQL Server**: estimated plan (`Ctrl+L` in SSMS, `SET SHOWPLAN_XML ON`) and **actual plan** (`Ctrl+M`, includes real row counts and warnings); the **Query Store** keeps plan history and regressions.
- **Oracle**: `EXPLAIN PLAN FOR ...` with `DBMS_XPLAN.DISPLAY` (estimates), and `DBMS_XPLAN.DISPLAY_CURSOR` with `ALLSTATS LAST` (actual rows after running with the `GATHER_PLAN_STATISTICS` hint); SQL Monitor for long queries.

What to look for:
- **Estimated versus actual rows**: large mismatches mean bad statistics or parameter issues.
- **Scans versus seeks**: full scans on large tables for selective queries suggest a missing index or a non-sargable predicate.
- **Join type**: nested loops (good for few rows), hash join (large unsorted inputs), merge join (sorted inputs).
- **Expensive sorts, spills to tempdb**, key lookups repeated millions of times, implicit conversions.

## Benefit
Plans turn guessing into diagnosis; nearly every slow query can be explained by reading its plan.

## Code snippet
```sql
-- Oracle: actual row counts per step
SELECT /*+ GATHER_PLAN_STATISTICS */ c.region, SUM(o.amount)
FROM orders o JOIN customers c ON c.customer_id = o.customer_id
WHERE o.order_date >= DATE '2025-01-01'
GROUP BY c.region;

SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY_CURSOR(NULL, NULL, 'ALLSTATS LAST'));
```

## Limits and misconceptions
- Estimated cost percentages are model numbers, not time. Compare actual rows and reads.
- The plan used in production may differ from the one you see (parameters, statistics, settings).
- Cloud warehouses and Spark have their own plan tools (Snowflake Query Profile, Spark explain and UI).

## Remember this
Read the actual plan and compare estimated with actual rows first; mismatches, scans and spills point to the cause.

## Related
pyspark-m07-explain-plans, snowflake-m03-query-profile, sql-m09-statistics


# Index types
id: sql-m09-indexes
track: sql

## What we're learning
Indexes are additional structures that let the engine find rows without scanning the whole table.

**SQL Server**:
- **Clustered index**: the table itself stored in key order (one per table). Choose a narrow, increasing, unique key.
- **Nonclustered index**: a separate B-tree with key columns and a pointer; **INCLUDE** columns make it **covering**, avoiding lookups.
- **Filtered index**: indexes only rows matching a predicate (for example active rows).
- **Columnstore** (clustered or nonclustered): columnar, compressed storage for analytics; batch-mode execution.

**Oracle**:
- **B-tree** (default), **unique**, **composite**, **function-based** (index on `UPPER(name)`).
- **Bitmap**: for low-cardinality columns in data warehouses; bad for concurrent OLTP writes.
- **Index-organised tables** (like clustered), **partitioned indexes** (local or global).

Cloud warehouses (Snowflake, Fabric Warehouse, BigQuery) have no user-managed B-tree indexes; they rely on micro-partition pruning, clustering and services such as search optimisation.

## Benefit
The right index turns a seconds-long scan into a millisecond seek; columnstore turns analytic scans over millions of rows into fast compressed reads.

## Limits and misconceptions
- Every index slows inserts, updates and deletes and costs storage; more indexes are not always better.
- Composite index column order matters: an index on (a, b) helps filters on a, or a and b, not b alone (except skip-scan in Oracle).
- Indexes help only sargable predicates.

## Remember this
Clustered and nonclustered B-trees serve OLTP lookups, columnstore and bitmap serve analytics, and cloud warehouses replace indexes with pruning.

## Related
sql-m09-sargability, snowflake-m03-search-optimization, sql-m09-execution-plans


# Statistics and cardinality estimation
id: sql-m09-statistics
track: sql

## What we're learning
The optimiser chooses plans from **estimates** of how many rows each step returns (cardinality). Estimates come from **statistics**: histograms of value distributions and density information on columns and indexes.

- **SQL Server** creates and updates statistics automatically (`AUTO_CREATE_STATISTICS`, `AUTO_UPDATE_STATISTICS`) when enough rows change; `UPDATE STATISTICS` and maintenance jobs refresh them; histograms have up to 200 steps. The **cardinality estimator** version depends on the database compatibility level.
- **Oracle** gathers statistics with `DBMS_STATS`, by default in a nightly maintenance window; **histograms** handle skewed columns; **dynamic sampling** and adaptive plans adjust at runtime; extended statistics capture correlated columns.

Typical failures: stale statistics after large loads, skewed data where an average hides extremes, correlated predicates (`city = 'Paris' AND country = 'France'` estimated as independent), and table variables or functions with fixed guesses.

## Benefit
Most bad plans are bad estimates. Fresh, appropriate statistics are the cheapest performance fix.

## Limits and misconceptions
- After a large ETL load, gather or update statistics before querying, rather than waiting for the automatic threshold.
- Full-scan statistics on huge tables are expensive; sampling is usually adequate except for skewed keys.
- Cloud warehouses maintain statistics automatically, but Spark and Fabric Lakehouse tables may need `ANALYZE TABLE` for good join decisions.

## Remember this
The optimiser plans from statistics; refresh them after big loads and add histograms or extended stats for skewed or correlated data.

## Related
sql-m09-execution-plans, sql-m09-parameter-sniffing, pyspark-m07-catalyst-and-tungsten


# Sargability
id: sql-m09-sargability
track: sql

## What we're learning
A predicate is **sargable** (Search ARGument ABLE) when the engine can use an index seek or partition pruning to evaluate it. Wrapping the **column** in a function or expression usually makes it non-sargable, forcing a scan:

| Non-sargable | Sargable rewrite |
|---|---|
| `WHERE YEAR(order_date) = 2025` | `WHERE order_date >= '2025-01-01' AND order_date < '2026-01-01'` |
| `WHERE CAST(ts AS DATE) = '2025-10-15'` (often) | `WHERE ts >= '2025-10-15' AND ts < '2025-10-16'` |
| `WHERE amount * 1.2 > 100` | `WHERE amount > 100 / 1.2` |
| `WHERE UPPER(name) = 'SMITH'` | case-insensitive collation, or a function-based index (Oracle) / computed column index (SQL Server) |
| `WHERE name LIKE '%smith'` | full-text search, or reverse-key techniques |
| `WHERE ISNULL(status, 'X') = 'X'` | `WHERE status = 'X' OR status IS NULL` |

**Implicit conversions** are a hidden form: comparing an `NVARCHAR` parameter with a `VARCHAR` column, or a number with a string column, can convert every row's column value and prevent seeks.

## Benefit
Rewriting predicates is often the cheapest and most dramatic performance fix, and the same principle drives partition pruning in Spark, Snowflake and Fabric.

## Limits and misconceptions
- SQL Server can still seek on `CAST(datetime_col AS DATE)` in some cases, but relying on that is fragile.
- Leading wildcards are inherently unsargable for B-tree indexes.

## Remember this
Keep the column bare on one side of the predicate; move functions and arithmetic to the constant side, and match data types.

## Related
sql-m09-indexes, pyspark-m07-pruning-and-pushdown, sql-m06-time-series


# Parameter sniffing
id: sql-m09-parameter-sniffing
track: sql

## What we're learning
SQL Server compiles a stored procedure or parameterised query once and **caches the plan**, optimised for the parameter values used at first compilation ("sniffed"). If data is **skewed**, a plan good for one value (a small customer with 10 orders: index seek and nested loops) can be terrible for another (a huge customer with 10 million orders), or vice versa. Symptom: the same procedure is sometimes fast and sometimes very slow, and "fixes itself" after a restart or recompile.

Mitigations in SQL Server:
- `OPTION (RECOMPILE)` on the statement: a fresh plan each run (costs CPU).
- `OPTIMIZE FOR (@p = value)` or `OPTIMIZE FOR UNKNOWN`.
- Query Store **plan forcing**, and in SQL Server 2022 **Parameter Sensitive Plan optimisation**, which caches several plans per parameter range.
- Splitting logic into separate procedures for very different cases.

**Oracle** has the equivalent through **bind variable peeking**, mitigated by **adaptive cursor sharing**, which creates different child cursors for different selectivity ranges, and by SQL plan baselines.

## Benefit
Recognising parameter sniffing saves days of chasing "random" slowness in production stored procedures.

## Limits and misconceptions
- Parameter sniffing is usually helpful; it is a problem only with skewed data.
- Copying parameters into local variables changes estimates to averages; it is a blunt workaround, not a fix.
- Clearing the whole plan cache to fix one query hurts everything else.

## Remember this
Cached plans fit the first parameter values; with skewed data use recompile hints, Query Store forcing or PSP optimisation (Oracle: adaptive cursor sharing).

## Related
sql-m09-statistics, sql-m09-execution-plans, sql-m10-stored-procedures


# Table partitioning
id: sql-m09-partitioning
track: sql

## What we're learning
**Partitioning** splits one logical table into physical pieces by a key, usually date:

- **SQL Server**: a **partition function** defines boundary values and a **partition scheme** maps partitions to filegroups; tables and indexes are created on the scheme. **Partition switching** moves a whole partition in or out as a metadata operation.
- **Oracle** (Partitioning option, an extra-cost Enterprise Edition option): range, list, hash, composite and **interval** partitioning (new partitions created automatically); **partition exchange** and local or global indexes.

Benefits come from **partition elimination** (queries filtering on the key read only matching partitions) and from **maintenance**: the **sliding window** pattern loads a new period by switching in a staged partition and removes the oldest by switching out or dropping, without big DELETEs.

## Benefit
Large fact tables become manageable: fast loads and purges, partition-level index maintenance, and faster date-filtered queries.

## Limits and misconceptions
- Partitioning is primarily a manageability feature; for single-row lookups it does not make queries faster and can make them slower.
- Queries that do not filter on the partition key read all partitions.
- Too many tiny partitions add overhead, as in Spark.
- In cloud warehouses there is no explicit partitioning (Snowflake micro-partitions, Fabric Warehouse); in lakehouses, folder partitioning or clustering plays the role.

## Remember this
Partition big tables by date for elimination and sliding-window loads and purges; it is mainly for manageability, not lookups.

## Related
pyspark-m06-partitioning-bucketing, sql-m08-bulk-operations, snowflake-m01-micro-partitions


# Query hints
id: sql-m09-hints
track: sql

## What we're learning
Hints override optimiser decisions:

- **SQL Server**: table hints (`WITH (INDEX(ix_name))`, `FORCESEEK`), join hints (`LOOP`, `HASH`, `MERGE`), and query hints with `OPTION (...)` such as `RECOMPILE`, `MAXDOP n`, `OPTIMIZE FOR`, `USE HINT('...')`. Query Store hints can apply hints without changing code.
- **Oracle**: comment hints after the first keyword: `/*+ INDEX(t ix_name) */`, `/*+ FULL(t) */`, `/*+ LEADING(a b) USE_HASH(b) */`, `/*+ PARALLEL(t 8) */`, `/*+ APPEND */`. **SQL plan baselines** and SQL profiles fix plans without hints in code.
- **Spark and Snowflake**: Spark supports join and partitioning hints; Snowflake has almost no optimiser hints by design.

## Benefit
When the optimiser is wrong and statistics cannot fix it, a hint can resolve a production incident quickly.

## Limits and misconceptions
- Hints freeze a decision: data changes, upgrades and new indexes can make a hinted plan the worst choice.
- An invalid Oracle hint is silently ignored, so typos go unnoticed.
- Migrated code full of hints often performs badly on the new platform; remove hints first and re-tune.
- Prefer fixing statistics, indexes and query shape; use plan forcing tools (Query Store, baselines) over code hints when possible.

## Remember this
Hints override the optimiser for proven problems; they age badly, so prefer statistics, indexing and plan management.

## Related
pyspark-m05-hints, sql-m09-parameter-sniffing, sql-m09-execution-plans
