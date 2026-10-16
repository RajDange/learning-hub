# Semi-structured data and VARIANT
id: snowflake-m04-variant
track: snowflake
verified: 2026-10

## What we're learning
Snowflake stores semi-structured data (JSON, Avro, ORC, Parquet, XML) in the **VARIANT** type, alongside **ARRAY** and **OBJECT**. A VARIANT value can be up to **128 MB** (raised from 16 MB in 2025). Internally Snowflake extracts frequently occurring paths into columnar form, so querying common fields is fast.

You query with **path notation** (`payload:customer.id::string`, `payload:items[0].sku`) and cast with `::`. **FLATTEN**, used with `LATERAL`, turns arrays or objects into rows (returning columns such as `VALUE`, `INDEX`, `KEY`, `PATH`). Functions like `PARSE_JSON`, `OBJECT_CONSTRUCT` and `ARRAY_AGG` build and parse values.

## Benefit
Raw JSON from APIs and events can be loaded as-is and queried immediately, with schema decisions deferred to later layers, while still benefiting from columnar storage and pruning for common paths.

## Limits and misconceptions
- Querying deep or irregular paths is slower than typed columns; extract important fields into typed columns in curated tables.
- Casting is your responsibility; a missing path returns NULL silently.
- Very large single values strain performance; some operations still hit older 16 MB limits in edge cases.

## Remember this
VARIANT stores JSON-like data natively; use path notation and FLATTEN to query it, and promote important fields to typed columns.

## Related
sql-m07-json, pyspark-m14-spark-4, pyspark-m04-complex-types


# Time Travel and Fail-safe
id: snowflake-m04-time-travel-fail-safe
track: snowflake
verified: 2026-10

## What we're learning
Snowflake keeps historical data in two stages after changes or drops:

- **Time Travel**: you can query data **as it was** at a past time or before a statement (`SELECT ... AT(TIMESTAMP => ...)`, `BEFORE(STATEMENT => ...)`), clone past states, and **UNDROP** dropped tables, schemas and databases. Retention is 1 day by default; up to **90 days** on Enterprise Edition for permanent objects; transient and temporary tables allow at most 1 day.
- **Fail-safe**: a further **7 days** after Time Travel ends, for permanent tables only, during which **only Snowflake Support** can recover data for disaster recovery. It is not queryable by users.

Both consume storage for changed and deleted data.

## Benefit
Accidental deletes, bad loads and "what did this table look like last Tuesday?" questions are solved with SQL, without restoring backups.

## Limits and misconceptions
- Fail-safe is not a backup you control; plan replication or other backups for real disaster recovery needs.
- Long retention on tables that are rewritten often (full reloads) multiplies storage costs; use transient tables for staging data that does not need history.
- Iceberg tables on your own external volume do not get Fail-safe.

## Remember this
Time Travel lets you query and restore past data for up to 90 days; Fail-safe adds 7 days that only Snowflake Support can recover from.

## Related
pyspark-m08-delta-time-travel-vacuum, sql-m06-temporal-tables, snowflake-m04-zero-copy-cloning


# Zero-copy cloning
id: snowflake-m04-zero-copy-cloning
track: snowflake
verified: 2026-10

## What we're learning
`CREATE TABLE dev_orders CLONE orders` (and the same for schemas and databases) creates a **clone** instantly, without copying data: the clone initially points to the same micro-partitions as the source. Only when either side changes do new micro-partitions get written and stored separately. Clones can be combined with Time Travel to clone a past state (`CLONE orders AT(TIMESTAMP => ...)`).

## Benefit
Full-size development and test environments, safe experiments before risky changes, and point-in-time snapshots cost seconds and almost no storage at first.

## Limits and misconceptions
- Storage grows as the clone and source diverge.
- Grants are not always copied the same way for every object type; check privileges after cloning, especially for schemas and databases.
- Cloning production data into development copies its sensitive data too; apply masking or use governed policies that follow the data.

## Remember this
Cloning creates instant copies that share storage until changes diverge, ideal for test environments and snapshots.

## Related
snowflake-m04-time-travel-fail-safe, snowflake-m08-cicd


# Snowpark
id: snowflake-m04-snowpark
track: snowflake
verified: 2026-10

## What we're learning
**Snowpark** lets you write data logic in **Python, Java or Scala** that runs **inside Snowflake**:

- A **DataFrame API** (similar to PySpark) that is translated to SQL and executed lazily by warehouses, so data does not leave Snowflake.
- **User-defined functions** (scalar, table and aggregate) and **stored procedures** written in Python, Java or Scala, running in secure sandboxes on the warehouse.
- **pandas on Snowflake**: the pandas API executed in Snowflake (based on Modin).
- **Snowpark Container Services**: run containers (custom apps, models, services) on Snowflake-managed compute pools.

## Benefit
Python teams can build pipelines and ML features on Snowflake data without exporting it, using familiar DataFrame and pandas styles, under Snowflake governance.

## Limits and misconceptions
- Snowpark DataFrames are not Spark: there is no cluster to tune, and code becomes SQL, so performance follows Snowflake's engine and warehouse size.
- Python UDFs that process rows one at a time are slow, as in Spark; prefer DataFrame operations or vectorised UDFs.
- Third-party Python packages must be available in Snowflake's Anaconda channel or uploaded; network access from UDFs needs external access integrations.

## Remember this
Snowpark runs Python, Java and Scala DataFrames, UDFs and procedures inside Snowflake, so data stays put.

## Related
pyspark-m02-columns-and-expressions, snowflake-m07-snowpark-ml, pyspark-m04-udfs
