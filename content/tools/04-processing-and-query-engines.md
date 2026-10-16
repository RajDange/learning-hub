# Apache Spark in the landscape
id: tools-m04-spark
track: tools
verified: 2026-10

## What we're learning
**Apache Spark** is a general-purpose distributed processing engine: one engine for batch ETL, SQL, streaming and machine learning, with APIs in Python, SQL, Scala, Java and R. It runs on clusters of many machines and reads almost any source. Spark 4.x is current (4.2 in July 2026). It is the engine underneath Databricks, Fabric Spark, Synapse Spark, EMR, Glue and Dataproc.

Where Spark sits among engines:
- **Versus warehouse SQL engines** (Snowflake, Fabric Warehouse, BigQuery): Spark handles complex code-based transformations, semi-structured data and ML; warehouses are simpler for pure SQL with many concurrent users.
- **Versus single-node engines** (DuckDB, Polars, pandas): Spark scales to terabytes and beyond, but carries cluster start-up and coordination overhead.
- **Versus Trino**: Trino is optimised for interactive federated SQL queries; Spark for long, fault-tolerant jobs.

## Benefit
One skill set and one engine across batch, streaming and ML, portable across every major cloud platform.

## Limits and misconceptions
- For data that fits on one machine (up to tens or low hundreds of GB), DuckDB or Polars are often faster and much cheaper.
- Spark is not a serving database: it is poor at high-concurrency, low-latency lookups.
- Spark performance needs understanding of partitions, shuffles and skew; it is not automatic.

## Remember this
Spark is the general-purpose distributed engine for big batch, streaming and ML; use smaller engines when data fits on one machine.

## Related
pyspark-m01-spark-architecture, tools-m04-duckdb, pyspark-m10-managed-platforms, tools-m04-trino-presto


# Trino and Presto
id: tools-m04-trino-presto
track: tools
verified: 2026-10

## What we're learning
**Presto** was created at Facebook as a fast distributed SQL engine for interactive queries over data lakes. It later split:
- **PrestoDB**, under the Linux Foundation's Presto Foundation, now focused on a C++ execution engine (Prestissimo, built on Velox).
- **Trino** (formerly PrestoSQL, renamed in 2020), developed by the original creators with very frequent numbered releases (release 484 in October 2026). **Starburst** sells Trino commercially (Starburst Enterprise and Galaxy).

Both use a coordinator and workers, query data in place through **connectors** (Hive, Iceberg, Delta, Hudi, PostgreSQL, MySQL, Kafka, and many more), and can **federate**: join a table in S3 with one in PostgreSQL in a single query. **Amazon Athena** is a serverless service based on Trino (engine version 3).

## Benefit
Interactive SQL over a data lake and other sources without loading data into a warehouse first, which suits exploration, ad hoc analysis and querying Iceberg tables from many tools.

## Limits and misconceptions
- Classic Trino favours speed over fault tolerance: a worker failure fails the query (fault-tolerant execution modes exist but add overhead). Long heavy ETL is often better in Spark.
- Federation is convenient but slow for large cross-source joins; data still moves over the network.
- Without a table format and good file layout, lake queries are slow regardless of the engine.

## Remember this
Trino (and PrestoDB) are distributed SQL engines for interactive, federated queries over lakes and databases; Athena is serverless Trino.

## Related
tools-m04-warehouse-engines, tools-m04-spark, tools-m03-open-table-formats


# dbt
id: tools-m04-dbt
track: tools
verified: 2026-10

## What we're learning
**dbt** ("data build tool") is the standard way to manage **SQL transformations** inside a warehouse or lakehouse. You write each model as a `SELECT` statement; dbt works out dependencies from `ref()` calls, builds tables or views in the right order, and adds:

- **Tests** (unique, not null, relationships, custom) on models.
- **Documentation** and a lineage graph generated from the project.
- **Incremental models**, snapshots (SCD type 2), macros (Jinja templating) and packages.
- **Model contracts** that enforce column names and types.
- The **Semantic Layer**, powered by MetricFlow (open-sourced in 2025), for defining metrics once.

dbt runs on Snowflake, Databricks, Fabric Warehouse, BigQuery, Redshift, Postgres and others through adapters. **dbt Core** is the open-source command line; the **dbt platform** (formerly dbt Cloud) adds a hosted IDE, scheduling and a catalog. dbt Labs merged with Fivetran in June 2026, and a Rust-based engine (Fusion, the basis of dbt v2, in alpha in mid-2026) is replacing the Python engine over time.

## Benefit
dbt brings software engineering (version control, testing, code review, CI) to SQL transformation, and makes the T in ELT maintainable by analysts as well as engineers.

## Limits and misconceptions
- dbt orchestrates SQL that the warehouse executes; it does not move data between systems or process data itself.
- Very complex procedural logic, ML or non-SQL processing belongs elsewhere (Python models exist on some platforms but are limited).
- Large projects need conventions (layers, naming, ownership) or they become as tangled as the stored procedures they replaced.
- Licensing and packaging changed in 2025-2026 (dbt v2 alpha, Fusion); check current terms before standardising.

## Remember this
dbt manages SQL transformations as tested, documented, dependency-ordered models that the warehouse runs.

## Related
tools-m05-scheduling-vs-orchestration, tools-m07-data-contracts, tools-m08-semantic-layers, sql-m10-stored-procedures


# DuckDB
id: tools-m04-duckdb
track: tools
verified: 2026-10

## What we're learning
**DuckDB** is an **in-process** analytical database: a library you import into Python, R, Java or a command line, like SQLite but built for analytics. It uses a columnar, vectorised engine, runs complex SQL fast on a single machine, and reads **Parquet, CSV, JSON, Iceberg and Delta** files directly, including from S3, Azure and GCS. It integrates with pandas, Polars and Arrow without copying data.

Version 1.5 is current (October 2026), with a 2.0 release scheduled. **MotherDuck** offers a serverless cloud service built on DuckDB, and **DuckLake** is a table format from the DuckDB team that keeps metadata in a SQL database.

## Benefit
Many "big data" tasks are actually medium data. DuckDB handles tens or hundreds of GB on a laptop or a single VM in seconds, with no cluster, which makes it ideal for exploration, local development, tests, small pipelines and embedded analytics.

## Compared with
| | DuckDB | Spark | pandas |
|---|---|---|---|
| Scale | One machine, larger than memory | Clusters, petabytes | One machine, in memory |
| Interface | SQL (plus Python API) | DataFrame and SQL | Python API |
| Start-up | Instant | Seconds to minutes | Instant |
| Concurrency | One writer process | Many jobs | Single process |

## Limits and misconceptions
- Single-writer design: not a shared multi-user database server.
- Scales up, not out: for data beyond one large machine, use a distributed engine.
- File-based lakes still need governance; DuckDB alone does not provide permissions or a catalog.

## Remember this
DuckDB is a fast in-process SQL engine for analytics on one machine, often replacing a cluster for medium-sized data.

## Related
python-m04-pandas-vs-polars, tools-m04-spark, python-m07-arrow, tools-m03-open-table-formats


# Cloud warehouse engines
id: tools-m04-warehouse-engines
track: tools
verified: 2026-10

## What we're learning
A **cloud data warehouse** is a managed SQL engine for analytics: columnar storage, massively parallel query execution, SQL security and high concurrency, with little or no infrastructure to manage. The main products:

- **Snowflake**: storage, compute (virtual warehouses) and services separated; multi-cloud; strong sharing.
- **Google BigQuery**: serverless, priced on data scanned or on reserved capacity (editions with autoscaling slots).
- **Amazon Redshift**: provisioned clusters (RA3 and newer Graviton-based RG nodes in 2026) or Redshift Serverless; strong AWS integration.
- **Fabric Data Warehouse**: T-SQL warehouse storing Delta in OneLake, billed by Fabric capacity.
- **Databricks SQL**: SQL warehouses on the lakehouse with Photon.
- **Azure Synapse dedicated SQL pools**: the earlier Azure MPP warehouse; still supported, with Microsoft's new investment in Fabric.

The line between warehouse and lakehouse is blurring: warehouses read open table formats (Iceberg), and lakehouses provide warehouse-grade SQL.

## Benefit
Warehouses give analysts and BI tools fast, concurrent SQL with governance, without managing clusters or file layouts.

## Limits and misconceptions
- Pricing models differ widely (per query scanned, per second of compute, capacity); the same workload can cost very different amounts. Model costs with real queries.
- Proprietary storage (where used) can mean lock-in and egress costs to get data out; open-format options reduce this.
- Warehouses are not built for ML training or unstructured data, though most now add features in that direction.

## Remember this
Cloud warehouses are managed, parallel SQL engines; choose by ecosystem, pricing model and openness of storage.

## Related
snowflake-m01-three-layer-architecture, fabric-m02-warehouse, databricks-m05-sql-warehouses, fabric-m10-fabric-vs-databricks-vs-snowflake
