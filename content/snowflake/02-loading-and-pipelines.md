# Stages and COPY INTO
id: snowflake-m02-stages-and-copy
track: snowflake
verified: 2026-10

## What we're learning
A **stage** is a location of files Snowflake can load from or unload to:
- **Internal stages**: storage managed by Snowflake: a per-user stage (`@~`), a per-table stage (`@%table`), or **named internal stages**.
- **External stages**: pointers to your S3, Azure Blob/ADLS or GCS locations, normally secured with a **storage integration** (a Snowflake object holding a cloud identity, so no keys are stored in SQL).

**COPY INTO table** bulk-loads files from a stage using a **file format** (CSV, JSON, Avro, ORC, Parquet, XML), with options for error handling, column matching and simple transformations. Snowflake keeps **64 days of load metadata** per table so the same file is not loaded twice. **COPY INTO location** unloads query results to files.

## Benefit
COPY is the fast, parallel, idempotent way to bulk-load files, and load metadata makes reruns safe.

## Limits and misconceptions
- Many small files load slowly and cost more; aim for compressed files of roughly 100 to 250 MB.
- Files older than the load metadata window, or modified files, can be reloaded or skipped unexpectedly; manage file naming.
- COPY is batch; for continuous arrival use Snowpipe.

## Remember this
Stages point at files and COPY INTO bulk-loads them in parallel, remembering loaded files for 64 days.

## Related
tools-m03-object-storage, snowflake-m02-snowpipe, pyspark-m06-read-write-basics


# Snowpipe
id: snowflake-m02-snowpipe
track: snowflake
verified: 2026-10

## What we're learning
**Snowpipe** loads files continuously as they arrive. A **pipe** object wraps a COPY statement; with **auto-ingest**, cloud storage event notifications (S3 events, Azure Event Grid, GCS Pub/Sub) tell Snowflake about new files, and serverless compute loads them within about a minute. Alternatively applications call a REST endpoint to submit files.

Since December 2025 Snowpipe is billed at a **flat rate per GB** of data ingested, replacing the earlier compute-plus-per-file charge.

## Benefit
Near-continuous file ingestion without running or scheduling a warehouse, suited to file drops from applications, partners and CDC tools.

## Limits and misconceptions
- File-based: latency is about a minute, not seconds. For lower latency, use Snowpipe Streaming.
- Ordering of files is not guaranteed.
- Event notification setup needs cloud permissions and can silently stop if notifications are misconfigured; monitor pipe status.

## Remember this
Snowpipe auto-ingests new files from cloud storage with serverless COPY, billed per GB.

## Related
snowflake-m02-stages-and-copy, databricks-m03-auto-loader, pyspark-m09-auto-loader


# Snowpipe Streaming
id: snowflake-m02-snowpipe-streaming
track: snowflake
verified: 2026-10

## What we're learning
**Snowpipe Streaming** writes **rows** directly into Snowflake tables through an SDK or REST API, without staging files first. A newer **high-performance architecture** (GA during 2025 on all three clouds) uses SDKs for Java, Python and Node.js with a shared core, a server-side **PIPE** object for configuration and in-flight transformations, ingest-to-query latency of seconds, high throughput per table, and billing on data volume. Channels track offset tokens, so a client can resume exactly where it left off.

The **Snowflake Connector for Kafka** can use Snowpipe Streaming to land Kafka topics in tables.

## Benefit
Seconds-level freshness from Kafka, CDC tools or applications into Snowflake, without micro-batch file plumbing.

## Limits and misconceptions
- It lands rows; transformation still happens afterwards (dynamic tables, tasks) or in the pipe's simple transformations.
- Exactly-once depends on clients using offset tokens correctly.
- The older classic architecture still exists; check which one a tool uses.

## Remember this
Snowpipe Streaming writes rows straight into tables with seconds of latency, from SDKs, REST or the Kafka connector.

## Related
tools-m02-kafka, snowflake-m02-snowpipe, tools-m01-ingestion-styles


# Streams and tasks
id: snowflake-m02-streams-tasks
track: snowflake
verified: 2026-10

## What we're learning
Two building blocks for in-database pipelines:

- A **stream** records changes to a table (or view, dynamic table or Iceberg table) since the stream was last consumed. Querying it returns changed rows with metadata columns (`METADATA$ACTION`, `METADATA$ISUPDATE`). Types: **standard** (inserts, updates, deletes), **append-only**, and **insert-only** (for external and externally managed tables). The stream's offset advances only when it is consumed in a DML statement inside a transaction.
- A **task** runs SQL or a stored procedure on a schedule, or **triggered** when a stream has new data. Tasks can be **serverless** or use a named warehouse, and chain into **task graphs** (a root task with dependents and a finalizer).

Together: a stream on the raw table plus a task that MERGEs its changes into a clean table forms an incremental pipeline.

## Benefit
Incremental processing (only changed rows) entirely inside Snowflake, without external orchestration.

## Limits and misconceptions
- A stream that is not consumed within the table's data retention (extended automatically up to 14 days) becomes **stale** and must be recreated.
- A plain SELECT on a stream does not advance it.
- Many tasks and streams become hard to manage; dynamic tables are often simpler for transformation chains.

## Remember this
Streams track changed rows since last consumption, and tasks run SQL on schedules or when streams have data.

## Related
pyspark-m08-delta-change-data-feed, snowflake-m02-dynamic-tables, sql-m08-merge-upsert


# Dynamic tables
id: snowflake-m02-dynamic-tables
track: snowflake
verified: 2026-10

## What we're learning
A **dynamic table** is defined by a query and a **target lag** (for example `TARGET_LAG = '10 minutes'`, minimum 60 seconds, or `DOWNSTREAM`). Snowflake keeps the table's contents within that lag of its sources automatically, refreshing **incrementally** where the query allows (processing only changes) or with a full refresh otherwise. Dynamic tables can depend on other dynamic tables, forming a pipeline whose refresh Snowflake schedules as a graph. They run on a named warehouse.

## Benefit
Declarative pipelines in plain SQL: you state the result and the freshness, and Snowflake handles orchestration, change tracking and incremental logic that would otherwise need streams, tasks and MERGE code.

## Compared with
| | Dynamic tables | Streams + tasks | Materialized views |
|---|---|---|---|
| Definition | Any (most) SQL query | Procedural steps | Single-table queries, limited |
| Freshness control | Target lag | Schedule or trigger | Always current |
| Effort | Low | High | Low |

## Limits and misconceptions
- Some query constructs force full refresh, which can be expensive on large tables; check the refresh mode chosen.
- Non-deterministic functions and some features are not allowed in definitions.
- Lag is a target, not a guarantee; under-sized warehouses fall behind.

## Remember this
A dynamic table is a SQL query plus a target lag; Snowflake keeps it fresh, incrementally where possible.

## Related
databricks-m03-declarative-pipelines, snowflake-m02-streams-tasks, pyspark-m08-medallion


# External tables
id: snowflake-m02-external-tables
track: snowflake
verified: 2026-10

## What we're learning
An **external table** lets Snowflake query files in an external stage (S3, Azure, GCS) **without loading them**. Snowflake stores only metadata about the files (and optional partition columns derived from paths), refreshed automatically by event notifications or manually. Queries read the files at runtime. External tables are read-only and support insert-only streams.

## Benefit
Quick access to data lake files for exploration, occasional queries or data that another system owns, without duplicating storage.

## Limits and misconceptions
- Much slower than native tables: no micro-partition optimisation, limited pruning.
- For open, performant lake tables shared with other engines, **Iceberg tables** are now the preferred option; external tables are the older approach.
- Schema-on-read means bad files surface as query errors.

## Remember this
External tables query lake files in place, read-only and slower; Iceberg tables are the modern choice for shared lake data.

## Related
snowflake-m02-iceberg-tables, tools-m03-object-storage


# Apache Iceberg tables in Snowflake
id: snowflake-m02-iceberg-tables
track: snowflake
verified: 2026-10

## What we're learning
**Iceberg tables** store data as Parquet files with Iceberg metadata in storage you can choose, so other engines (Spark, Trino, Flink, DuckDB) can read the same tables. Two modes:

- **Snowflake as the catalog** (Snowflake-managed): full read and write from Snowflake, automatic maintenance; external engines read (and, since 2026, write) through Snowflake's **Horizon Catalog Iceberg REST endpoint**, built on Apache Polaris.
- **Externally managed**: another catalog (AWS Glue, Snowflake Open Catalog, Databricks Unity Catalog, Microsoft OneLake, or plain metadata files, and Delta tables via Delta Direct) owns the table; Snowflake connects through a **catalog integration** and can query it. **Catalog-linked databases** automatically discover and sync all tables in a remote Iceberg REST catalog.

Storage is an **external volume** in your cloud account, or Snowflake-managed storage. Iceberg spec v3 support became GA in 2026.

## Benefit
Open storage avoids lock-in and lets Snowflake share one copy of data with Spark, Databricks, Fabric and other engines, while keeping Snowflake's SQL, governance and performance.

## Limits and misconceptions
- Tables on your own external volume have no Snowflake Fail-safe; protection is your cloud storage's responsibility.
- Some Snowflake features and Iceberg features (for example row-level equality deletes) are not supported.
- Two catalogs can claim the same table; decide which catalog writes.

## Remember this
Snowflake Iceberg tables keep data in open Parquet and Iceberg metadata, managed by Snowflake or an external catalog, readable by other engines.

## Related
tools-m03-open-table-formats, snowflake-m08-iceberg-interoperability, pyspark-m08-iceberg-hudi
