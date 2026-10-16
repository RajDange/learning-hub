# Reconciliation queries
id: sql-m12-reconciliation
track: sql

## What we're learning
During a migration, **reconciliation** proves the new system holds the same data and produces the same results as the old one. SQL patterns, run on both sides and compared:

1. **Counts** per table and per partition key (date, company, region).
2. **Aggregates**: `SUM` of amounts, `MIN`/`MAX` of dates and keys, `COUNT(DISTINCT key)`, null counts per column.
3. **Checksums**: a hash per row over normalised business columns, aggregated per partition. T-SQL: `HASHBYTES('SHA2_256', CONCAT_WS('|', ...))` or `CHECKSUM_AGG(BINARY_CHECKSUM(...))` (fast but collision-prone); Oracle: `STANDARD_HASH(...)` or `ORA_HASH`; Snowflake: `HASH_AGG(*)`; Spark: `xxhash64`.
4. **Row-level diff** for partitions whose checksums differ: `EXCEPT`/`MINUS` both ways, or a `FULL OUTER JOIN` on the key comparing columns.
5. **Report-level** comparison: key business figures from the old and new reports.

## Benefit
Layered reconciliation catches errors early and pinpoints them, and gives users evidence that the new numbers can be trusted.

## Code snippet
```sql
-- Per-day fingerprint (T-SQL). Normalise before hashing: trim, fixed decimal scale, UTC, NULL marker.
SELECT order_date, COUNT(*) AS n, SUM(CAST(amount AS DECIMAL(18,2))) AS total,
       CHECKSUM_AGG(CHECKSUM(order_id, customer_id, CAST(amount AS DECIMAL(18,2)), status)) AS chk
FROM dbo.Orders
GROUP BY order_date;

-- Row-level differences for one day (both directions)
SELECT order_id, customer_id, amount, status FROM src_orders WHERE order_date = '2025-10-15'
EXCEPT
SELECT order_id, customer_id, amount, status FROM tgt_orders WHERE order_date = '2025-10-15';
```

## Limits and misconceptions
- Different engines hash differently; compare hashes computed on the same platform (bring both datasets together) or compare counts and sums across platforms.
- Type differences (DATE with time in Oracle, decimal scale, trailing spaces, empty string versus NULL) cause false differences; normalise first.
- Reconcile against a fixed source snapshot.

## Remember this
Compare counts, then aggregates, then partition checksums, then row diffs where checksums differ, after normalising values.

## Related
pyspark-m11-reconciliation, sql-m01-set-operations, pyspark-m13-backfill-cutover, sql-m12-data-type-mapping


# Translating between Oracle, T-SQL, Spark SQL and Snowflake
id: sql-m12-dialect-translation
track: sql

## What we're learning
Most SQL translates directly; the differences cluster in a few areas:

| Area | Oracle | T-SQL | Spark SQL | Snowflake |
|---|---|---|---|---|
| Row limit | `FETCH FIRST n ROWS ONLY`, `ROWNUM` | `TOP (n)`, `OFFSET/FETCH` | `LIMIT n` | `LIMIT n`, `TOP n` |
| NULL replace | `NVL`, `NVL2`, `COALESCE` | `ISNULL`, `COALESCE` | `nvl`, `coalesce` | `NVL`, `IFNULL`, `COALESCE` |
| Conditional | `DECODE`, `CASE` | `IIF`, `CASE` | `if`, `CASE` | `IFF`, `DECODE`, `CASE` |
| Concatenation | `\|\|` (NULL treated as empty) | `+` (NULL makes NULL), `CONCAT` | `\|\|`, `concat` | `\|\|`, `CONCAT` |
| Current time | `SYSDATE`, `SYSTIMESTAMP` | `GETDATE()`, `SYSDATETIME()` | `current_timestamp()` | `CURRENT_TIMESTAMP()` |
| Date add | `d + 1`, `ADD_MONTHS` | `DATEADD(day, 1, d)` | `date_add`, `add_months` | `DATEADD(day, 1, d)` |
| String position | `INSTR` | `CHARINDEX` | `instr`, `locate` | `POSITION`, `CHARINDEX` |
| Sequences | `seq.NEXTVAL` | `IDENTITY`, `SEQUENCE` | identity columns (Delta) | `AUTOINCREMENT`, sequences |
| Outer join (legacy) | `(+)` | none | none | `(+)` supported |
| Hierarchies | `CONNECT BY` | recursive CTE | recursive CTE (recent) | both |
| Empty string | equals NULL | a value | a value | a value |

Behaviour differences matter more than syntax: Oracle's empty string as NULL, `DATE` containing a time in Oracle, integer division (`5/2 = 2` in T-SQL, `2.5` in Oracle and Snowflake), case sensitivity of identifiers and string comparison (collations), and implicit conversions.

Tools help: SQLGlot (open source) and vendor tools such as Snowflake's SnowConvert, Microsoft's migration assistants, and Databricks' code converters, followed by testing.

## Benefit
Knowing where dialects differ focuses review on the risky spots instead of reading every line with equal suspicion.

## Limits and misconceptions
- Automated translation handles syntax; semantic differences (NULL, dates, division, collation) need tests with real data.
- Procedural code (PL/SQL packages, T-SQL procedures with cursors) usually needs redesign, not translation.

## Remember this
Syntax converts with tools; behaviour differences (empty strings, dates, division, collation) need deliberate tests.

## Related
sql-m12-data-type-mapping, pyspark-m13-jdbc-oracle-sqlserver, sql-m01-null-logic, sql-m12-reconciliation


# Data type mapping across platforms
id: sql-m12-data-type-mapping
track: sql

## What we're learning
Type mismatches are a top source of migration bugs. Key mappings:

| Concept | Oracle | SQL Server | Spark / Delta | Snowflake | Watch out |
|---|---|---|---|---|---|
| Exact numbers | `NUMBER(p,s)`; `NUMBER` without precision | `DECIMAL(p,s)`, `INT`, `BIGINT` | `DECIMAL(p,s)` (max 38), `INT`, `BIGINT` | `NUMBER(p,s)` (max 38) | Oracle `NUMBER` with no precision can hold huge or highly precise values; choose a target precision deliberately |
| Money | `NUMBER(19,4)` | `MONEY`, `DECIMAL(19,4)` | `DECIMAL(19,4)` | `NUMBER(19,4)` | never `FLOAT` |
| Floating | `BINARY_DOUBLE`, `FLOAT` | `FLOAT`, `REAL` | `DOUBLE`, `FLOAT` | `FLOAT` (double) | rounding differences |
| Date | `DATE` (includes time!) | `DATE` (no time) | `DATE` | `DATE` | Oracle `DATE` usually maps to a timestamp |
| Timestamp | `TIMESTAMP`, `TIMESTAMP WITH TIME ZONE` | `DATETIME` (~3 ms), `DATETIME2` (100 ns), `DATETIMEOFFSET` | `TIMESTAMP` (UTC-normalised), `TIMESTAMP_NTZ` | `TIMESTAMP_NTZ`, `_LTZ`, `_TZ` | precision and time zone semantics |
| Text | `VARCHAR2(n BYTE/CHAR)`, `NVARCHAR2`, `CLOB` | `VARCHAR(n)`, `NVARCHAR(n)`, `(MAX)` | `STRING` | `VARCHAR` (up to 128 MB) | byte versus character lengths, Unicode |
| Boolean | none before 23ai (`NUMBER(1)`, `CHAR(1)`) | `BIT` | `BOOLEAN` | `BOOLEAN` | `'Y'/'N'` conventions |
| Binary | `RAW`, `BLOB` | `VARBINARY` | `BINARY` | `BINARY` | |
| GUID | `RAW(16)` | `UNIQUEIDENTIFIER` | `STRING` | `VARCHAR` | byte order |

## Benefit
A deliberate type map, agreed before building pipelines, prevents silent truncation, rounding, time-zone shifts and failed loads.

## Limits and misconceptions
- Profile real data (maximum lengths, precision used, presence of time parts) instead of copying declared types blindly.
- Time zones are the subtlest issue: decide whether each timestamp is UTC, local without zone, or zone-aware.
- Character length semantics (bytes versus characters) break multi-byte text such as accented names.

## Remember this
Map types deliberately: Oracle NUMBER needs a chosen precision, Oracle DATE has a time, and timestamps need an explicit time-zone decision.

## Related
pyspark-m02-schema-and-types, sql-m12-dialect-translation, pyspark-m13-jdbc-oracle-sqlserver
