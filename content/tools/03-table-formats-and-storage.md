# Parquet and ORC
id: tools-m03-columnar-formats
track: tools
verified: 2026-10

## What we're learning
**Columnar file formats** store each column's values together instead of each row's values together. The two main ones:

- **Apache Parquet**: a file is split into **row groups** (often 128 MB to 1 GB); each row group holds a **column chunk** per column, divided into **pages**. The **footer** holds the schema and per-column statistics (min, max, null count). Encodings (dictionary, run-length, delta) and compression codecs (Snappy, ZSTD, GZIP, LZ4) shrink data. Optional page indexes and bloom filters help skip more. **Parquet modular encryption** can encrypt columns with different keys.
- **Apache ORC**: similar ideas with **stripes** instead of row groups, rich indexes and statistics at several levels; historically tied to Hive.

Newer formats such as **Vortex** and **Lance** aim at faster random access and AI workloads, but Parquet remains the standard.

## Benefit
Analytical queries read a few columns of many rows. Columnar layout lets engines read only those columns, compress them well (similar values sit together), and skip row groups whose statistics cannot match a filter.

## Limits and misconceptions
- Files are immutable: updating a row means rewriting the file. Table formats (Delta, Iceberg, Hudi) manage that on top.
- Statistics only skip data if values are clustered; random order defeats them.
- Too many small files (each with its own footer and overhead) destroy the benefit.
- Columnar formats are poor for single-row lookups and frequent small writes, which are what OLTP databases are for.

## Remember this
Parquet stores columns in row groups with footer statistics, so engines read only needed columns and skip irrelevant chunks.

## Related
pyspark-m06-file-formats, tools-m03-open-table-formats, python-m07-arrow, pyspark-m07-pruning-and-pushdown


# Delta Lake, Apache Iceberg and Apache Hudi compared
id: tools-m03-open-table-formats
track: tools
verified: 2026-10

## What we're learning
A **table format** turns a folder of Parquet files into a table with transactions, schema, history and statistics. Three open formats lead:

- **Delta Lake** (Linux Foundation; 4.x line in 2026): a transaction log of JSON commits and checkpoints. Default in Databricks and Fabric. UniForm can also write Iceberg metadata.
- **Apache Iceberg** (1.x releases, table spec v3 adding deletion vectors, row lineage and a variant type): a metadata tree tracked by a **catalog**; the **Iceberg REST catalog** API is the interoperability standard, implemented by Apache Polaris, Unity Catalog, AWS Glue, S3 Tables, Snowflake and others. Hidden partitioning and partition evolution.
- **Apache Hudi** (1.x): built for upsert-heavy and incremental workloads, with record-level indexes and copy-on-write or merge-on-read tables.

**DuckLake** (v1.0 in 2026) is a newer approach that stores table metadata in a SQL database instead of files.

## Benefit
Open table formats are what let one copy of data serve many engines without vendor lock-in. The choice decides which engines and catalogs work natively with your data.

## Compared with
| | Delta Lake | Iceberg | Hudi |
|---|---|---|---|
| Metadata | Log in `_delta_log` | Metadata files + catalog | Timeline + indexes |
| Strongest ecosystem | Databricks, Fabric, Spark | Snowflake, AWS, Trino, Flink, BigQuery | Upsert-heavy Spark and Flink stacks |
| Partitioning | Partitions or liquid clustering | Hidden partitioning, evolution | Partitions + indexes |
| Catalog needed | Optional (path or catalog) | Yes, in practice | Optional |

## Limits and misconceptions
- "Open" format does not mean every engine supports every feature or version (for example Iceberg v3 or Delta deletion vectors). Check reader support before enabling features.
- The formats are converging; for many organisations the platform choice decides the format, not the other way round.
- A table format without maintenance (compaction, snapshot expiry, vacuum) degrades over time.

## Remember this
Delta, Iceberg and Hudi all add transactions to Parquet; Iceberg is the most engine-neutral, Delta leads in Databricks and Fabric, Hudi targets upserts.

## Related
pyspark-m08-delta-lake, pyspark-m08-iceberg-hudi, tools-m03-format-interoperability, snowflake-m02-iceberg-tables


# Object storage: ADLS, S3 and GCS
id: tools-m03-object-storage
track: tools
verified: 2026-10

## What we're learning
Cloud data lakes sit on **object storage**: virtually unlimited, cheap, durable storage of files (objects) addressed by key.

- **Amazon S3**: buckets and keys; strongly consistent for reads after writes since 2020. Storage classes from Standard to Glacier Deep Archive. **S3 Express One Zone** offers low-latency single-zone buckets; **S3 Tables** offers managed Iceberg tables with automatic maintenance.
- **Azure Data Lake Storage Gen2**: Azure Blob Storage with the **hierarchical namespace** enabled, giving real directories, atomic renames and POSIX-like ACLs, accessed with `abfss://`. Tiers: Hot, Cool, Cold, Archive. Fabric's OneLake is built on it.
- **Google Cloud Storage**: buckets with Standard, Nearline, Coldline and Archive classes; strongly consistent; hierarchical-namespace buckets are available.

## Benefit
Separating storage from compute is the foundation of the lakehouse: many engines and clusters share one copy of data, and you pay for storage and compute independently.

## Limits and misconceptions
- Object stores are not file systems: listing large prefixes is slow, and renaming a "directory" on plain S3 means copying every object. Table formats and hierarchical namespaces exist partly to work around this.
- Request costs and egress charges matter at scale: millions of tiny files cost money to list and read, and cross-region or cross-cloud reads are billed.
- Archive tiers are offline; data must be rehydrated before use, which takes hours.
- Security is configured per account and bucket (identity, network, encryption); a public bucket is a classic data breach.

## Remember this
Object storage is the cheap, durable, shared foundation of every lakehouse, but it is not a file system: mind small files, listing and egress.

## Related
fabric-m01-onelake, databricks-m02-external-locations, snowflake-m02-stages-and-copy, tools-m11-cloud-map-ingest-store


# Table format interoperability
id: tools-m03-format-interoperability
track: tools
verified: 2026-10

## What we're learning
Because platforms favour different formats, several mechanisms let one table be read as another:

- **Delta UniForm**: a Delta table also writes Iceberg metadata, so Iceberg readers can read it. Supported in Delta Lake and Databricks.
- **Fabric OneLake table format virtualization**: OneLake generates Iceberg metadata for Delta tables and Delta metadata for Iceberg tables, with documented limits.
- **Apache XTable** (incubating at Apache): translates metadata between Delta, Iceberg and Hudi without rewriting data files.
- **Iceberg REST catalogs**: a common API that many engines speak (Snowflake, Spark, Trino, Flink, DuckDB). Unity Catalog, Apache Polaris (a top-level Apache project since 2026), AWS Glue and S3 Tables expose it, so an engine can find and read tables managed elsewhere.
- **Catalog federation**: platforms read other catalogs' tables directly, for example Databricks federation to Hive or Glue, Snowflake catalog-linked databases, Fabric shortcuts and mirroring of Unity Catalog.

## Benefit
Interoperability lets, for example, Databricks write a table, Snowflake query it and Power BI read it from Fabric, without three copies and three pipelines.

## Limits and misconceptions
- Translation usually supports a subset of features: recent table features (deletion vectors, new types, column renames) may not translate, and writes are often limited to the "home" format.
- Metadata conversion adds latency between a commit and its visibility in the other format.
- Two catalogs governing one table raises the question of which one's permissions apply. Decide on a primary catalog.

## Remember this
UniForm, OneLake virtualization, XTable and Iceberg REST catalogs let one copy be read in several formats, with feature and permission caveats.

## Related
tools-m03-open-table-formats, snowflake-m08-iceberg-interoperability, fabric-m02-delta-in-fabric, databricks-m02-unity-catalog-overview
