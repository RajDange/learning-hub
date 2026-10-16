# Caching layers
id: snowflake-m03-caching-layers
track: snowflake
verified: 2026-10

## What we're learning
Snowflake has three caches:

- **Result cache** (cloud services layer): the result of a query is kept for 24 hours (extended each time it is reused, up to 31 days). An identical query on unchanged data by a user with the same access returns instantly, **without a running warehouse and without credits**. Non-deterministic functions (such as `RANDOM()`) and changed data prevent reuse.
- **Warehouse cache** (local disk and memory of a running warehouse): micro-partitions read recently are kept locally, so later queries on the same data read faster. It is lost when the warehouse suspends.
- **Metadata cache** (cloud services): statistics about micro-partitions answer queries such as `COUNT(*)` or `MIN/MAX` on a column without scanning data.

## Benefit
Dashboards that rerun the same queries become nearly free, and good warehouse design (shared warehouses for similar workloads, sensible auto-suspend) keeps data warm.

## Limits and misconceptions
- A tiny change in query text (spacing aside, which is normalised in some cases) or any data change invalidates the result cache.
- Very aggressive auto-suspend saves credits but discards the warehouse cache; for BI warehouses a few minutes of idle time is often cheaper overall.
- Caching hides real query cost during testing; disable the result cache (`USE_CACHED_RESULT = FALSE`) when benchmarking.

## Remember this
The result cache returns identical queries free for 24 hours, the warehouse cache keeps recent data local until suspend, and metadata answers simple aggregates.

## Related
snowflake-m01-three-layer-architecture, snowflake-m03-warehouse-sizing-multicluster, ai-m10-caching


# Clustering keys and automatic clustering
id: snowflake-m03-clustering
track: snowflake
verified: 2026-10

## What we're learning
Natural clustering (data stored in load order) works well when queries filter on the load order, typically date. When very large tables are queried mainly on another column (customer, region) and pruning is poor, you can define a **clustering key**: `ALTER TABLE orders CLUSTER BY (customer_id, order_date)`. **Automatic Clustering**, a serverless background service, then reorganises micro-partitions so rows with similar key values sit together, and keeps doing so as data changes. Clustering health is measured by **clustering depth** (`SYSTEM$CLUSTERING_INFORMATION`).

## Benefit
Selective queries on large tables scan far fewer micro-partitions, reducing time and warehouse credits.

## Limits and misconceptions
- Recommended only for **very large** tables (multi-terabyte range) with clear filter patterns; small tables do not benefit.
- Reclustering costs serverless credits and causes storage churn (new micro-partitions, more Time Travel and Fail-safe storage), especially on frequently updated tables.
- Choose a few low-to-medium cardinality columns or expressions (for example `DATE(ts)`), not a unique ID.

## Remember this
Clustering keys plus Automatic Clustering restore pruning on very large tables, at a continuing serverless and storage cost.

## Related
snowflake-m01-micro-partitions, databricks-m04-liquid-clustering, pyspark-m08-delta-optimize-clustering


# Search optimization service
id: snowflake-m03-search-optimization
track: snowflake
verified: 2026-10

## What we're learning
The **search optimization service** (Enterprise Edition) builds and maintains a persistent search access path for chosen tables or columns. It speeds up **highly selective** queries that micro-partition pruning cannot help much: equality lookups on high-cardinality columns (`WHERE customer_email = '...'`), `IN` lists, substring and regex searches, lookups into VARIANT fields, and geospatial predicates. It is enabled per table or per column and maintained by serverless compute.

## Benefit
Point lookups on huge tables (for example customer service screens or investigation queries) go from scanning most of a table to reading a handful of micro-partitions.

## Limits and misconceptions
- It costs storage and serverless credits for maintenance; enable it on specific columns, not whole wide tables.
- It does not help large aggregations or queries returning many rows.
- It is not a B-tree index; there is no uniqueness or ordering.

## Remember this
Search optimization accelerates selective point lookups and searches on large tables, at extra storage and maintenance cost.

## Related
sql-m09-indexes, snowflake-m03-clustering


# Query acceleration service
id: snowflake-m03-query-acceleration
track: snowflake
verified: 2026-10

## What we're learning
The **query acceleration service (QAS)** (Enterprise Edition) lets a warehouse offload parts of eligible queries, mainly large scans with selective filters or aggregations, to additional **serverless compute**. A **scale factor** caps how much extra compute a warehouse may use relative to its size. New Gen2 and new multi-cluster warehouses have QAS enabled by default with a scale factor of 2 (as of 2026), and adaptive warehouses include it automatically.

## Benefit
Occasional outlier queries (an analyst scanning a year of data) finish quickly without permanently upsizing the warehouse for everyone.

## Limits and misconceptions
- Only some query shapes are eligible; `SYSTEM$ESTIMATE_QUERY_ACCELERATION` and query history show whether a query would benefit.
- Extra serverless credits are charged when acceleration is used; set the scale factor deliberately.
- It does not fix queuing from many concurrent users; that is multi-cluster's job.

## Remember this
QAS offloads parts of big scan-heavy queries to serverless compute so a warehouse can handle outliers without upsizing.

## Related
snowflake-m03-warehouse-sizing-multicluster, snowflake-m01-credits


# Warehouse sizing and multi-cluster warehouses
id: snowflake-m03-warehouse-sizing-multicluster
track: snowflake
verified: 2026-10

## What we're learning
Two different scaling problems need two different tools:

- **Scale up** (a bigger warehouse size) when **single queries** are slow, spill to storage or process lots of data. Each size step doubles compute and credits per hour, so a well-parallelised query runs roughly twice as fast for about the same total credits.
- **Scale out** with **multi-cluster warehouses** (Enterprise Edition) when **many concurrent queries** queue. Snowflake starts additional clusters of the same size between a minimum and maximum count. **Scaling policies**: **Standard** (default) starts clusters quickly to avoid queuing; **Economy** waits until there is enough work to keep a new cluster busy for several minutes, saving credits at the cost of some queuing.

Separate warehouses per workload (loading, transformation, BI, data science) prevent one from slowing another and make costs visible.

## Benefit
Right-sizing per workload is the main lever on both performance and Snowflake cost.

## Limits and misconceptions
- Bigger warehouses do not help small, simple queries; they only cost more.
- Multi-cluster does not make an individual query faster.
- Spilling to local or remote storage in the Query Profile is the main sign that a warehouse is too small for a query.
- Adaptive warehouses (2026) automate much of this choice, within limits you set.

## Remember this
Scale up for heavy single queries, scale out with multi-cluster warehouses for concurrency, and separate warehouses by workload.

## Related
snowflake-m01-virtual-warehouses, snowflake-m03-query-profile, snowflake-m08-resource-monitors-cost


# Query profile
id: snowflake-m03-query-profile
track: snowflake
verified: 2026-10

## What we're learning
The **Query Profile** in Snowsight shows how a query executed: a graph of operators (TableScan, Filter, Join, Aggregate, Sort) with the time and rows of each, plus statistics. What to look for:

- **Most expensive nodes**: where time went.
- **Partitions scanned versus partitions total** on TableScan: poor pruning means the filter does not match data layout.
- **Bytes spilled to local storage** or **remote storage**: the warehouse ran out of memory; consider a larger size or a less memory-hungry query. Remote spilling is especially slow.
- **Exploding joins**: a join that outputs far more rows than its inputs, usually a missing or wrong join condition (row multiplication).
- **UNION** where **UNION ALL** would do (an unnecessary duplicate-removal step), and large sorts.
- Time spent queuing or compiling, visible in query history.

## Benefit
The profile turns "the query is slow" into a specific cause: no pruning, too small a warehouse, or a bad join.

## Limits and misconceptions
- A result served from the result cache has no meaningful profile; disable caching to analyse.
- Profiles show one execution; check query history for patterns across runs.

## Remember this
In the Query Profile, check pruning, spilling and exploding joins first; they explain most slow Snowflake queries.

## Related
sql-m09-execution-plans, pyspark-m07-explain-plans, snowflake-m01-micro-partitions, sql-m01-join-semantics
