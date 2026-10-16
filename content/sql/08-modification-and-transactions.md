# MERGE and upserts
id: sql-m08-merge-upsert
track: sql

## What we're learning
`MERGE` (T-SQL, Oracle, Snowflake, Spark SQL with Delta, Fabric Warehouse) compares a **source** with a **target** on a key and, in one statement, updates matched rows, inserts unmatched source rows, and (in T-SQL, Snowflake and Delta) deletes target rows not in the source.

Dialect differences:
- **T-SQL**: `WHEN MATCHED`, `WHEN NOT MATCHED [BY TARGET]`, `WHEN NOT MATCHED BY SOURCE`, an `OUTPUT` clause; the statement must end with a semicolon.
- **Oracle**: `WHEN MATCHED THEN UPDATE ... [WHERE ...] [DELETE WHERE ...]`, `WHEN NOT MATCHED THEN INSERT`; the ON condition columns cannot be updated.
- **Snowflake and Delta**: several conditional `WHEN MATCHED AND ...` clauses; Delta supports `WHEN NOT MATCHED BY SOURCE`.

## Benefit
Atomic, idempotent upserts for incremental loads, CDC application and dimension maintenance.

## Code snippet
```sql
MERGE INTO dim_product AS t
USING stg_product AS s
   ON t.product_id = s.product_id
WHEN MATCHED AND (t.name <> s.name OR t.price <> s.price) THEN
     UPDATE SET t.name = s.name, t.price = s.price, t.updated_at = CURRENT_TIMESTAMP
WHEN NOT MATCHED THEN
     INSERT (product_id, name, price, updated_at)
     VALUES (s.product_id, s.name, s.price, CURRENT_TIMESTAMP);
```

## Limits and misconceptions
- **Duplicate source keys** cause errors (or non-deterministic updates in some engines). Deduplicate the source first.
- SQL Server's MERGE has a history of bugs and concurrency pitfalls (race conditions without `HOLDLOCK`); many SQL Server teams prefer separate UPDATE and INSERT in a transaction for high-concurrency OLTP.
- Updating only changed rows (the `AND` condition) avoids unnecessary writes, log growth and triggers firing.
- Comparisons in the change condition must be null-safe.

## Remember this
MERGE upserts and optionally deletes in one atomic statement; deduplicate the source, update only real changes, and mind SQL Server's concurrency caveats.

## Related
pyspark-m08-delta-merge, sql-m06-scd, sql-m05-deduplication, sql-m01-null-logic


# Bulk operations
id: sql-m08-bulk-operations
track: sql

## What we're learning
Loading or changing millions of rows needs different techniques from single-row DML:

- **Bulk load**: SQL Server `BULK INSERT`, `bcp` and `SqlBulkCopy`; Oracle **SQL*Loader**, **external tables** and direct-path `INSERT /*+ APPEND */`; Snowflake `COPY INTO`; Fabric Warehouse `COPY INTO`.
- **Minimal logging**: in SQL Server, bulk inserts into heaps or empty tables with `TABLOCK` under the simple or bulk-logged recovery model log only page allocations; Oracle direct-path inserts with `NOLOGGING` similarly reduce redo. Both trade recoverability for speed.
- **Batching large deletes and updates**: loop over key ranges or use `DELETE TOP (n)` (T-SQL) repeatedly, committing each batch, to avoid huge transaction logs, lock escalation and long blocking.
- **Partition switching** (SQL Server) and **partition exchange** (Oracle): swap a fully loaded staging table into a partitioned table as a metadata operation.

## Benefit
The right bulk technique turns hour-long loads into minutes and avoids filling transaction logs or blocking users.

## Code snippet
```sql
-- T-SQL: delete old rows in batches
DECLARE @rows INT = 1;
WHILE @rows > 0
BEGIN
    DELETE TOP (50000) FROM dbo.EventLog WHERE EventDate < '2024-01-01';
    SET @rows = @@ROWCOUNT;
END;

-- Oracle: direct-path insert
INSERT /*+ APPEND */ INTO sales_hist SELECT * FROM sales_stage;
COMMIT;
```

## Limits and misconceptions
- Minimal logging and NOLOGGING affect backups and recovery; coordinate with DBAs.
- Disabling indexes and constraints speeds loads but they must be rebuilt and validated afterwards.
- In cloud warehouses, many small INSERT statements are an anti-pattern; batch through files and COPY.

## Remember this
Use bulk loaders, minimal logging where acceptable, batched deletes and partition switching instead of row-by-row DML.

## Related
sql-m08-locking-deadlocks, sql-m09-partitioning, snowflake-m02-stages-and-copy, sql-m05-replacing-cursors


# Transactions and isolation levels
id: sql-m08-isolation-levels
track: sql

## What we're learning
A **transaction** groups statements so they succeed or fail together (**ACID**: atomic, consistent, isolated, durable). **Isolation levels** decide what a transaction can see of others' uncommitted or concurrent work. Anomalies they prevent: **dirty reads** (reading uncommitted data), **non-repeatable reads** (a row changes between two reads), **phantoms** (new rows appear in a range).

| Level | Dirty read | Non-repeatable | Phantom |
|---|---|---|---|
| Read uncommitted | possible | possible | possible |
| Read committed | no | possible | possible |
| Repeatable read | no | no | possible |
| Serializable | no | no | no |
| Snapshot | no | no | no (but write conflicts) |

Engine behaviour:
- **SQL Server** default is read committed **with locking**: readers block writers and vice versa. Enabling **READ_COMMITTED_SNAPSHOT (RCSI)** uses row versions so readers do not block writers; **SNAPSHOT** isolation gives transaction-level consistency. `NOLOCK` (read uncommitted) is widely misused and can return missing or duplicated rows.
- **Oracle** uses multi-version read consistency by default: readers never block writers and see a consistent snapshot as of statement start; `SERIALIZABLE` gives transaction-level snapshots. There is no dirty read in Oracle.
- **Snowflake** and **Fabric Warehouse**: snapshot-style isolation; Snowflake uses read committed for statements in transactions.

## Benefit
Understanding isolation explains blocking, inconsistent reports, and why moving from SQL Server to Oracle or a cloud warehouse changes concurrency behaviour.

## Limits and misconceptions
- `WITH (NOLOCK)` is not a performance fix; it trades correctness for less blocking. RCSI is usually the right answer.
- Snapshot isolation can fail updates with conflict errors; code must retry.
- Long transactions hold locks or versions and hurt everyone.

## Remember this
Isolation levels trade consistency for concurrency; Oracle and RCSI use row versions so readers do not block writers, and NOLOCK can return wrong data.

## Related
sql-m08-locking-deadlocks, fabric-m02-warehouse, sql-m10-error-handling


# Locking, blocking and deadlocks
id: sql-m08-locking-deadlocks
track: sql

## What we're learning
Databases lock data to keep transactions isolated. **Blocking** happens when one session waits for a lock held by another; **deadlock** happens when two sessions each hold a lock the other needs, so neither can proceed. The engine detects deadlocks and kills one transaction (the **victim**), which receives an error (SQL Server error 1205, Oracle ORA-00060).

SQL Server details: locks at row, page and table level; **lock escalation** from many row locks to a table lock (around 5,000 locks per statement); shared, update and exclusive lock modes. Oracle locks rows in the data block itself and never escalates; readers do not take locks.

Common causes of deadlocks:
- Two procedures updating the same tables **in opposite order**.
- Missing indexes, so updates scan and lock far more rows than needed.
- Long transactions that hold locks while doing slow work (calls to external systems, user input).

## Benefit
Most "the system froze" incidents in OLTP and ETL are blocking chains or deadlocks; knowing the causes guides the fix.

## Limits and misconceptions
- Deadlocks cannot be eliminated entirely in busy systems; applications must **retry** victims.
- Fixes: access tables in a consistent order, keep transactions short, index foreign keys and filter columns, use row-versioning isolation (RCSI) to remove reader-writer blocking, batch big updates.
- Diagnose with SQL Server's `system_health` extended event (deadlock graphs) or Oracle trace files and `V$LOCK` / `V$SESSION`.

## Remember this
Blocking is waiting, deadlock is a cycle the engine breaks by killing one side; keep transactions short, ordered and indexed, and retry victims.

## Related
sql-m08-isolation-levels, sql-m08-bulk-operations, sql-m10-error-handling
