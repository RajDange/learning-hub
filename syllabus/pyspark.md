# Track: pyspark — PySpark

> Home of Spark concepts and of Delta Lake. Code where it clarifies.

## pyspark-m01 — Foundations
- pyspark-m01-spark-architecture | Spark architecture: driver, executors, cluster manager | Who does what in a Spark application and how work is spread across machines | code: no | related: pyspark-m10-cluster-managers, pyspark-m07-stages-tasks-scheduler
- pyspark-m01-sparksession | SparkSession, SparkContext and running locally | The entry point objects, configuration, and a local session for learning | code: yes | related: pyspark-m14-spark-connect
- pyspark-m01-rdd-vs-dataframe | RDD vs DataFrame (and a note on Dataset) | Low-level RDDs versus optimised DataFrames; why Dataset is Scala and Java only | code: yes | related: pyspark-m07-catalyst-and-tungsten
- pyspark-m01-lazy-evaluation | Lazy evaluation: transformations and actions | Why nothing runs until an action, narrow versus wide transformations | code: yes | related: pyspark-m01-dag-and-lineage, pyspark-m07-shuffle
- pyspark-m01-dag-and-lineage | The DAG and RDD lineage | How Spark turns a plan into a DAG of stages and uses lineage to recompute lost data | code: no | related: pyspark-m07-stages-tasks-scheduler, pyspark-m11-data-lineage

## pyspark-m02 — DataFrame basics
- pyspark-m02-schema-and-types | Schemas and data types | Inferred versus explicit schemas, StructType, common types and decimal precision | code: yes | related: pyspark-m06-file-formats
- pyspark-m02-columns-and-expressions | Columns, expressions, select and filter | Column objects, select, withColumn, filter, cast, alias and lit | code: yes | related: pyspark-m05-sql-on-dataframes
- pyspark-m02-nulls | Working with nulls | Null semantics in Spark, isNull, coalesce, na functions and null-safe equality | code: yes | related: sql-m01-null-logic
- pyspark-m02-sort-distinct-sample | Sorting, distinct, limit and sampling | Ordering, deduplicating rows, limiting and sampling, and what each costs | code: yes | related: pyspark-m07-shuffle

## pyspark-m03 — Transformations
- pyspark-m03-groupby-aggregation | groupBy, aggregation, rollup and cube | Aggregate functions, multiple aggregations, subtotals with rollup and cube | code: yes | related: pyspark-m07-shuffle
- pyspark-m03-joins | Joins in Spark | Join types, join keys, duplicate column names and how Spark executes joins | code: yes | related: sql-m01-join-semantics, pyspark-m07-broadcast-joins
- pyspark-m03-union | Union and set operations | union versus unionByName, intersect, subtract and schema alignment | code: yes | related: sql-m01-set-operations
- pyspark-m03-pivot-unpivot | Pivot and unpivot | Turning rows into columns and back | code: yes | related: sql-m05-pivot-unpivot
- pyspark-m03-explode-nested | Explode and nested data | Flattening arrays and structs into rows and columns | code: yes | related: pyspark-m04-complex-types
- pyspark-m03-window-functions | Window functions in Spark | Partitioning and ordering, ranking, lag and lead, running totals | code: yes | related: sql-m03-window-frames, sql-m03-ranking
- pyspark-m03-deduplication | Deduplication patterns | dropDuplicates versus window-based latest-record logic | code: yes | related: sql-m05-deduplication

## pyspark-m04 — Functions and custom logic
- pyspark-m04-builtin-functions | Built-in functions: string, date, math, conditional | The functions module and why built-ins beat custom code | code: yes | related: pyspark-m04-udfs
- pyspark-m04-complex-types | Arrays, maps, structs, JSON and regex | Working with nested and semi-structured values, including higher-order functions | code: yes | related: sql-m07-json, pyspark-m03-explode-nested
- pyspark-m04-udfs | Python UDFs | When a user-defined function is needed, and its cost across the Python and JVM boundary | code: yes | related: pyspark-m04-pandas-udfs-arrow
- pyspark-m04-pandas-udfs-arrow | pandas UDFs and Apache Arrow | Vectorised UDFs, mapInPandas and applyInPandas, Arrow as the transfer format | code: yes | related: python-m07-arrow, pyspark-m04-udfs
- pyspark-m04-broadcast-and-accumulators | Broadcast variables and accumulators | Sharing read-only data with executors, counters, and the accumulator retry pitfall | code: yes | related: pyspark-m07-broadcast-joins

## pyspark-m05 — Spark SQL
- pyspark-m05-sql-on-dataframes | Spark SQL, views, subqueries and CTEs | Mixing SQL and DataFrame code, temporary and global views | code: yes | related: sql-m04-ctes, pyspark-m02-columns-and-expressions
- pyspark-m05-catalog-tables | Catalog, databases and tables | Managed versus external tables, the metastore, three-level namespaces | code: yes | related: databricks-m02-unity-catalog-overview, tools-m06-catalogs-explained
- pyspark-m05-hints | Query hints | Join hints, partitioning hints and when to leave the optimiser alone | code: yes | related: pyspark-m07-broadcast-joins, sql-m09-hints

## pyspark-m06 — Input and output
- pyspark-m06-read-write-basics | Reading and writing data, save modes | DataFrameReader and DataFrameWriter, options, append, overwrite, ignore, error | code: yes | related: pyspark-m08-delta-lake
- pyspark-m06-file-formats | File formats: CSV, JSON, Parquet, ORC, Avro, and compression | Row versus columnar formats, schema handling, compression codecs | code: yes | related: tools-m03-columnar-formats
- pyspark-m06-xml-and-excel | XML and Excel files | Reading XML and spreadsheets, and why they are awkward at scale (verify) | code: yes | related: pyspark-m13-mainframe-flat-files
- pyspark-m06-jdbc | JDBC reads and writes | Parallel reads with partition columns, predicate pushdown, batch writes | code: yes | related: pyspark-m13-jdbc-oracle-sqlserver
- pyspark-m06-partitioning-bucketing | Partitioning and bucketing on disk | partitionBy folder layout, over-partitioning, bucketing and when it helps | code: yes | related: pyspark-m07-pruning-and-pushdown, sql-m09-partitioning

## pyspark-m07 — Performance and internals
- pyspark-m07-partitions | Partitions, repartition and coalesce | In-memory partitions, how many you need, repartition versus coalesce | code: yes | related: pyspark-m07-shuffle
- pyspark-m07-shuffle | Shuffle | What a shuffle is, why it is expensive, and shuffle partitions | code: no | related: pyspark-m07-skew, pyspark-m07-aqe
- pyspark-m07-skew | Data skew | Spotting skewed keys and fixing them with AQE, salting or broadcast | code: yes | related: pyspark-m07-aqe
- pyspark-m07-caching | Caching and persistence | cache, persist, storage levels, and when caching hurts | code: yes | related: pyspark-m07-spill-memory-gc
- pyspark-m07-broadcast-joins | Broadcast joins and join strategies | Broadcast hash, sort-merge and shuffle hash joins | code: yes | related: pyspark-m03-joins, pyspark-m05-hints
- pyspark-m07-aqe | Adaptive Query Execution | Runtime re-optimisation: coalescing partitions, switching joins, splitting skew | code: no | related: pyspark-m07-skew
- pyspark-m07-catalyst-and-tungsten | Catalyst optimiser and Tungsten engine | Logical and physical planning, whole-stage code generation, off-heap memory | code: no | related: pyspark-m07-explain-plans
- pyspark-m07-explain-plans | Reading explain plans | explain modes and what to look for: scans, exchanges, joins, filters | code: yes | related: pyspark-m07-catalyst-and-tungsten, sql-m09-execution-plans
- pyspark-m07-pruning-and-pushdown | Partition pruning, column pruning and predicate pushdown | Reading less data; dynamic partition pruning | code: no | related: pyspark-m06-partitioning-bucketing
- pyspark-m07-spill-memory-gc | Memory, spill and garbage collection | Executor memory regions, spill to disk, GC pressure and out-of-memory errors | code: no | related: pyspark-m10-resources-sizing
- pyspark-m07-stages-tasks-scheduler | Jobs, stages, tasks and the Spark UI | Scheduler, task slots, external shuffle service, reading the Spark UI | code: no | related: pyspark-m01-dag-and-lineage

## pyspark-m08 — Lakehouse and table formats
- pyspark-m08-delta-lake | Delta Lake: ACID tables on files | Transaction log, ACID guarantees, schema enforcement; the home lesson for Delta | code: yes | related: tools-m03-open-table-formats, fabric-m02-delta-in-fabric
- pyspark-m08-delta-merge | MERGE and upserts in Delta | Upsert, delete and insert in one statement; matching rules and duplicates | code: yes | related: sql-m08-merge-upsert, pyspark-m08-scd-patterns
- pyspark-m08-delta-time-travel-vacuum | Time travel, restore and vacuum | Reading old versions, restoring, retention and vacuum | code: yes | related: snowflake-m04-time-travel-fail-safe
- pyspark-m08-delta-optimize-clustering | Compaction, Z-order and liquid clustering | Small files, OPTIMIZE, Z-ordering and clustering for data skipping (verify) | code: yes | related: databricks-m04-liquid-clustering, fabric-m02-delta-in-fabric
- pyspark-m08-delta-schema-evolution | Schema enforcement and evolution | mergeSchema, column mapping, renaming and type changes | code: yes | related: pyspark-m08-delta-lake
- pyspark-m08-delta-change-data-feed | Change data feed | Reading row-level changes from a Delta table for downstream CDC | code: yes | related: tools-m01-ingestion-styles, pyspark-m13-incremental-loads
- pyspark-m08-iceberg-hudi | Apache Iceberg and Apache Hudi | The other open table formats from a Spark point of view | code: no | related: tools-m03-open-table-formats
- pyspark-m08-scd-patterns | Slowly changing dimensions in Spark | SCD type 1 and type 2 with MERGE | code: yes | related: sql-m06-scd
- pyspark-m08-medallion | Medallion architecture | Bronze, silver and gold layers, what each holds, and criticism of the pattern | code: no | related: databricks-m03-medallion-on-databricks, fabric-m02-lakehouse

## pyspark-m09 — Structured Streaming
- pyspark-m09-streaming-model | The Structured Streaming model | Streams as unbounded tables, micro-batches, sources and sinks | code: yes | related: tools-m02-flink-vs-spark-streaming
- pyspark-m09-triggers-output-modes | Triggers and output modes | Processing-time, available-now and once triggers; append, update, complete; continuous processing | code: yes | related: pyspark-m09-streaming-model
- pyspark-m09-event-time-watermarks | Event time, watermarks and windows | Late data, tumbling and sliding windows, how watermarks bound state | code: yes | related: pyspark-m09-stateful-operations
- pyspark-m09-stateful-operations | Stateful operations and state stores | Aggregations, deduplication and arbitrary stateful processing; state store providers (verify) | code: yes | related: pyspark-m09-checkpointing
- pyspark-m09-checkpointing | Checkpointing and recovery | Offsets, commits, state in the checkpoint, and what breaks when the query changes | code: yes | related: pyspark-m09-exactly-once
- pyspark-m09-stream-joins | Stream-static and stream-stream joins | Join types allowed on streams and why watermarks matter for them | code: yes | related: pyspark-m03-joins
- pyspark-m09-sinks-foreachbatch | Sinks and foreachBatch | File, Delta, Kafka and console sinks; foreachBatch for MERGE and multi-sink writes | code: yes | related: pyspark-m08-delta-merge
- pyspark-m09-kafka-eventhubs-kinesis | Kafka, Event Hubs and Kinesis sources | Reading from message brokers: offsets, partitions, starting positions | code: yes | related: tools-m02-kafka, tools-m02-event-hubs, tools-m02-kinesis
- pyspark-m09-exactly-once | Exactly-once and backpressure | End-to-end guarantees, idempotent sinks, rate limits such as maxOffsetsPerTrigger | code: no | related: pyspark-m12-idempotency-retries
- pyspark-m09-auto-loader | Auto Loader and incremental file ingestion | Incremental file discovery with cloudFiles on Databricks, and open alternatives | code: yes | related: databricks-m03-auto-loader

## pyspark-m10 — Cluster and deployment
- pyspark-m10-cluster-managers | Cluster managers: YARN, Kubernetes, standalone | How Spark gets resources in each mode and when each is used | code: no | related: tools-m09-kubernetes, pyspark-m01-spark-architecture
- pyspark-m10-spark-submit | spark-submit and deploy modes | Client versus cluster mode, packaging dependencies | code: yes | related: pyspark-m12-packaging-config
- pyspark-m10-resources-sizing | Executor sizing and resources | Cores, memory, overhead, and sizing rules of thumb | code: yes | related: pyspark-m07-spill-memory-gc
- pyspark-m10-dynamic-allocation | Dynamic allocation and autoscaling | Adding and removing executors with load; how managed autoscaling differs | code: no | related: pyspark-m10-managed-platforms
- pyspark-m10-managed-platforms | Managed Spark platforms compared | Databricks, EMR, Dataproc, Synapse and Fabric Spark side by side | code: no | related: databricks-m01-compute-types, fabric-m04-spark-pools

## pyspark-m11 — Data quality and governance
- pyspark-m11-validation-expectations | Validation, profiling and expectations | Profiling data, rule checks, Delta constraints and expectation frameworks | code: yes | related: tools-m07-great-expectations, tools-m07-deequ
- pyspark-m11-reconciliation | Reconciliation between source and target | Row counts, sums, hashes and diffs at scale | code: yes | related: sql-m12-reconciliation
- pyspark-m11-data-lineage | Data lineage (not RDD lineage) | Tracking which datasets feed which, OpenLineage and catalog lineage | code: no | related: tools-m06-lineage, pyspark-m01-dag-and-lineage
- pyspark-m11-masking-security-auditing | Masking, access control and auditing | Column masking, row filters, catalog permissions and audit trails for Spark data | code: no | related: databricks-m02-privileges, fabric-m08-sql-granular-security

## pyspark-m12 — Engineering practices
- pyspark-m12-testing-pytest | Testing PySpark code with pytest | Unit tests with a local session, DataFrame comparison, test data | code: yes | related: python-m08-pytest
- pyspark-m12-packaging-config | Project structure, packaging, configuration and style | Modules instead of notebooks, wheels, config files, versioning | code: yes | related: python-m02-project-layout
- pyspark-m12-logging-monitoring-debugging | Logging, monitoring and debugging | Driver and executor logs, metrics, common errors and how to read them | code: yes | related: pyspark-m07-stages-tasks-scheduler
- pyspark-m12-cicd | CI/CD for Spark jobs | Build, test and deploy pipelines for Spark code | code: no | related: tools-m09-cicd, databricks-m07-asset-bundles
- pyspark-m12-orchestration-airflow | Orchestrating Spark with Airflow | Running Spark jobs from DAGs, operators and dependencies | code: yes | related: tools-m05-airflow
- pyspark-m12-idempotency-retries | Idempotency, retries and error handling | Designing jobs that are safe to rerun | code: yes | related: pyspark-m09-exactly-once

## pyspark-m13 — Migration and integration
- pyspark-m13-ingestion-patterns | Ingestion and extraction patterns | Full, incremental and CDC extraction; landing zones; APIs as sources | code: no | related: tools-m01-ingestion-styles
- pyspark-m13-jdbc-oracle-sqlserver | Reading Oracle and SQL Server via JDBC | Drivers, partitioned reads, type mapping and source load | code: yes | related: pyspark-m06-jdbc, sql-m12-dialect-translation
- pyspark-m13-mainframe-flat-files | Mainframe extracts and flat files | Fixed-width files, EBCDIC, COBOL copybooks and packed decimals | code: yes | related: pyspark-m06-file-formats
- pyspark-m13-incremental-loads | Incremental loads and watermark columns | High-water marks, late-arriving rows, deletes | code: yes | related: pyspark-m08-delta-merge
- pyspark-m13-backfill-cutover | Backfill and cutover | Loading history, running old and new in parallel, switching over safely | code: no | related: pyspark-m11-reconciliation, fabric-m10-migrating-from-legacy

## pyspark-m14 — Newer APIs
- pyspark-m14-pandas-api-on-spark | pandas API on Spark | pandas-style code on Spark (formerly Koalas), and where it differs from pandas | code: yes | related: python-m04-pandas-core
- pyspark-m14-spark-connect | Spark Connect | Thin client and server architecture, what it enables and limits | code: yes | related: pyspark-m01-sparksession
- pyspark-m14-spark-4 | Notable Spark 4 changes (verify) | ANSI mode by default, VARIANT type, Python data sources and other changes | code: yes | related: snowflake-m04-variant
