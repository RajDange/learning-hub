# Delta optimisations on Databricks
id: databricks-m04-optimization-features
track: databricks
verified: 2026-10

## What we're learning
On top of open-source Delta, Databricks adds features that keep tables fast with little manual work:

- **OPTIMIZE** compacts small files (and clusters data when clustering is defined).
- **Optimized writes** and **auto compaction** produce right-sized files at write time and compact small files after writes; they are always on for MERGE, UPDATE and DELETE, and file sizes are tuned automatically for Unity Catalog managed tables.
- **Deletion vectors** mark deleted or updated rows instead of rewriting whole files, making DELETE, UPDATE and MERGE much cheaper; files are cleaned up later by OPTIMIZE or purge.
- **Data skipping** uses file-level statistics (by default on the first 32 columns for external tables; chosen automatically for managed tables).
- **Predictive I/O** (with Photon) speeds up selective reads and updates.

## Benefit
Tables stay healthy under frequent writes and updates without hand-tuned maintenance jobs.

## Limits and misconceptions
- Deletion vectors and some other features upgrade the table protocol; external readers (other engines, older runtimes) must support them.
- Statistics on irrelevant columns cost write time; on external tables choose stats columns deliberately.
- Managed tables get the most automation; external tables need more manual care.

## Remember this
Databricks keeps Delta tables fast with optimized writes, auto compaction, deletion vectors and data skipping, most automatic on managed tables.

## Related
pyspark-m08-delta-optimize-clustering, databricks-m04-predictive-optimization, pyspark-m07-pruning-and-pushdown


# Liquid clustering
id: databricks-m04-liquid-clustering
track: databricks
verified: 2026-10

## What we're learning
**Liquid clustering** organises a Delta table's data by up to four **clustering keys** (`CLUSTER BY (customer_id, event_date)`) so that queries filtering on those keys skip most files. Unlike partitioning and Z-order:

- Clustering is **incremental**: OPTIMIZE clusters new data without rewriting the whole table.
- **Keys can be changed** later without rewriting existing data.
- It handles high-cardinality keys and skewed data that would make partitioning explode into tiny files.

**Automatic liquid clustering** (`CLUSTER BY AUTO`, GA in 2025) lets Databricks choose and change keys based on the query workload, for Unity Catalog managed tables with predictive optimization. Databricks recommends liquid clustering for new tables instead of partitioning or Z-order.

## Benefit
Good data skipping without having to guess a partitioning scheme up front, and without painful rewrites when query patterns change.

## Limits and misconceptions
- Cannot be combined with partitioning or Z-order on the same table; converting existing partitioned tables needs recent runtimes.
- Clustering only helps queries that filter on the keys.
- Clustering happens during OPTIMIZE (or automatically with predictive optimization), so newly written data is not clustered immediately.

## Remember this
Liquid clustering replaces partitioning and Z-order with incremental, changeable clustering keys, chosen automatically if you let it.

## Related
pyspark-m08-delta-optimize-clustering, snowflake-m03-clustering, databricks-m04-predictive-optimization


# Predictive optimization
id: databricks-m04-predictive-optimization
track: databricks
verified: 2026-10

## What we're learning
**Predictive optimization** runs table maintenance automatically on **Unity Catalog managed tables**: OPTIMIZE (compaction and clustering), VACUUM (removing old files) and ANALYZE (statistics). Databricks decides when maintenance is worthwhile from table usage and runs it on serverless compute. It is enabled by default for accounts created since late 2024 and was being rolled out to existing accounts through 2026. Settings inherit from account to catalog to schema to table, and history is visible in a system table.

## Benefit
No more scheduled maintenance jobs that run on the wrong tables at the wrong time; tables stay compact, clustered and with fresh statistics.

## Limits and misconceptions
- Works only for managed tables; external tables still need your own maintenance.
- It is billed (on the serverless jobs SKU); monitor its cost in system tables.
- Automatic VACUUM uses the table's retention settings; if you rely on long time travel, set retention explicitly.

## Remember this
Predictive optimization runs OPTIMIZE, VACUUM and ANALYZE for you on managed tables, billed as serverless usage.

## Related
databricks-m04-optimization-features, pyspark-m08-delta-time-travel-vacuum, databricks-m02-system-tables
