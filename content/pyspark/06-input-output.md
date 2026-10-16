# Reading and writing data, save modes
id: pyspark-m06-read-write-basics
track: pyspark

## What we're learning
`spark.read` returns a **DataFrameReader**: you set `format`, `options` and an optional `schema`, then `load` a path or table. `df.write` returns a **DataFrameWriter**: you set `format`, `mode`, options, optional `partitionBy`, then `save` to a path or `saveAsTable`.

**Save modes** decide what happens when the target exists:

| Mode | Behaviour |
|---|---|
| `error` / `errorifexists` (default) | Fail |
| `append` | Add new files |
| `overwrite` | Replace existing data |
| `ignore` | Do nothing if data exists |

## Benefit
One consistent API covers files, tables, JDBC and streaming sinks, and the mode makes the write intent explicit.

## Code snippet
```python
df = (spark.read.format("csv")
      .option("header", True).option("delimiter", ";")
      .schema("id INT, name STRING, amount DECIMAL(18,2)")
      .load("/landing/customers/2025-10-15/"))

(df.write.format("delta")
   .mode("overwrite")
   .option("replaceWhere", "load_date = '2025-10-15'")   # Delta: overwrite one slice only
   .saveAsTable("bronze.customers"))
```

## Limits and misconceptions
- Plain-file `overwrite` deletes the old files and then writes new ones. If the job fails in between, the data is gone. Delta and other table formats make overwrite atomic.
- `append` on files has no deduplication: a rerun appends the same data twice.
- By default overwrite on a partitioned file table replaces **all** partitions. Set `spark.sql.sources.partitionOverwriteMode=dynamic` to replace only partitions present in the new data, or use Delta's `replaceWhere`.
- Output is one file per task per partition value, so many small partitions mean many small files.

## Remember this
Readers set format, options and schema; writers set format and mode, and only a table format makes overwrite safe.

## Related
pyspark-m08-delta-lake, pyspark-m06-partitioning-bucketing, pyspark-m12-idempotency-retries


# File formats: CSV, JSON, Parquet, ORC, Avro, and compression
id: pyspark-m06-file-formats
track: pyspark

## What we're learning
- **CSV**: text, row-based, no types, many dialects. Good for exchange, poor for analytics.
- **JSON**: text, row-based, nested, self-describing but verbose. Line-delimited JSON (one object per line) splits well; a single big JSON array does not (`multiLine` option).
- **Parquet**: binary, columnar, typed, with min/max statistics per row group. Spark's default and the base of Delta and Iceberg.
- **ORC**: columnar like Parquet, from the Hive world.
- **Avro**: binary, row-based, typed, with schema evolution rules. Common in Kafka and for landing raw records.

**Compression** codecs: `snappy` (Spark's default for Parquet, fast), `zstd` (smaller, still fast; increasingly common), `gzip` (small, slow, and a gzipped CSV cannot be split across tasks).

## Benefit
Columnar formats let Spark read only the needed columns and skip row groups by statistics, which often cuts I/O by 90 percent or more compared with CSV.

## Compared with
| Format | Layout | Types | Splittable | Typical role |
|---|---|---|---|---|
| CSV | Row | No | Yes, unless gzipped | Exchange, legacy extracts |
| JSON lines | Row | Loose | Yes | APIs, logs |
| Avro | Row | Yes | Yes | Streams, raw landing |
| Parquet / ORC | Column | Yes | Yes | Analytics storage |

## Limits and misconceptions
- CSV options matter: `header`, `delimiter`, `quote`, `escape`, `multiLine`, `encoding`, `mode` (`PERMISSIVE`, `DROPMALFORMED`, `FAILFAST`) and `columnNameOfCorruptRecord` to capture bad rows.
- Parquet files are immutable; updates need a table format on top.
- Avro support ships as the built-in `spark-avro` module, but on plain Apache Spark it must be added as a package.

## Remember this
Land raw data in whatever the source gives you, but store analytical data in a columnar format, usually Parquet under a table format.

## Related
tools-m03-columnar-formats, pyspark-m08-delta-lake, pyspark-m02-schema-and-types, python-m07-arrow


# XML and Excel files
id: pyspark-m06-xml-and-excel
track: pyspark

## What we're learning
Legacy systems often hand over XML or spreadsheets.

- **XML**: Spark 4.0 includes a native XML data source (`spark.read.format("xml").option("rowTag", "order")`), which grew out of the `spark-xml` library. On earlier versions you add `spark-xml` as a package. Databricks runtimes include XML support. You choose a `rowTag`; each matching element becomes a row and nested elements become structs and arrays.
- **Excel**: there is no built-in Excel reader in Apache Spark. Options are the third-party `spark-excel` library, reading with pandas (`pd.read_excel`) on the driver and converting, or asking the source to export CSV. Some platforms add their own Excel connectors (verify for your platform).

## Benefit
Knowing the options avoids building fragile custom parsers for formats Spark can already read.

## Code snippet
```python
orders = (spark.read.format("xml")
          .option("rowTag", "Order")
          .schema("OrderId STRING, Customer STRUCT<Id: STRING>, Lines STRUCT<Line: ARRAY<STRUCT<Sku: STRING, Qty: INT>>>")
          .load("/landing/erp/orders/*.xml"))

import pandas as pd
small = spark.createDataFrame(pd.read_excel("/dbfs/landing/rates.xlsx", sheet_name="FX"))
```

## Limits and misconceptions
- A single huge XML file cannot be split efficiently; many medium files parallelise better.
- Schema inference on XML is slow and guesses types; declare a schema.
- Reading Excel through pandas runs on the driver only. Fine for reference data, wrong for large files.
- Merged cells, multiple header rows and formulas make spreadsheets unreliable sources. Agree a clean export format with the business when you can.

## Remember this
XML is readable natively in Spark 4 (via spark-xml before), while Excel is a small-data, driver-side job.

## Related
pyspark-m13-mainframe-flat-files, sql-m07-xml, pyspark-m06-file-formats


# JDBC reads and writes
id: pyspark-m06-jdbc
track: pyspark

## What we're learning
Spark reads from and writes to relational databases through **JDBC**. By default a JDBC read is a **single query over a single connection**, so one task pulls the whole table. To parallelise, give Spark a numeric or date `partitionColumn` with `lowerBound`, `upperBound` and `numPartitions`; it then runs that many range queries in parallel. Alternatively, pass a list of `predicates`, one query per predicate.

Other key options: `fetchsize` (rows per round trip), `query` or `dbtable` (a table or a subquery), `pushDownPredicate`, and for writes `batchsize`, `isolationLevel` and `truncate`.

## Benefit
Correct partitioning turns a multi-hour single-threaded extract into a parallel one, while keeping control over how hard you hit the source database.

## Code snippet
```python
orders = (spark.read.format("jdbc")
          .option("url", "jdbc:sqlserver://erp-db:1433;databaseName=Sales")
          .option("dbtable", "(SELECT * FROM dbo.Orders WHERE OrderDate >= '2025-01-01') q")
          .option("partitionColumn", "OrderId")
          .option("lowerBound", 1).option("upperBound", 50_000_000)
          .option("numPartitions", 16)
          .option("fetchsize", 10_000)
          .option("user", user).option("password", password)   # from a secret store
          .load())
```

## Limits and misconceptions
- `lowerBound` and `upperBound` only set the stride; rows outside them are still read, by the first and last partition. Skewed key ranges give skewed partitions.
- Each partition is a separate query, possibly at a different moment, so the result is not a consistent snapshot unless the source supports it.
- `numPartitions` is also the number of concurrent connections. Agree it with the database owner.
- JDBC writes are row inserts in batches; for large loads into SQL Server or Azure SQL, bulk-copy connectors are much faster.

## Remember this
A JDBC read is single-threaded until you give it a partition column or predicates, and every partition is another connection to the source.

## Related
pyspark-m13-jdbc-oracle-sqlserver, pyspark-m13-incremental-loads, tools-m09-secrets-identity


# Partitioning and bucketing on disk
id: pyspark-m06-partitioning-bucketing
track: pyspark

## What we're learning
**Partitioning on disk** (`df.write.partitionBy("country", "load_date")`) writes one folder per value: `.../country=DE/load_date=2025-10-15/`. Queries that filter on these columns read only the matching folders (**partition pruning**).

**Bucketing** (`bucketBy(n, "customer_id").sortBy(...)` with `saveAsTable`) hashes rows into a fixed number of files per partition. Two tables bucketed the same way on the join key can be joined without a shuffle.

These are separate from in-memory partitions, which control parallelism inside a job.

## Benefit
Good disk partitioning makes common filters cheap, and enables safe partition-level overwrites for reloads and backfills.

## Code snippet
```python
(events.write.format("parquet")
       .partitionBy("event_date")
       .mode("overwrite")
       .save("/lake/silver/events"))

spark.read.parquet("/lake/silver/events").filter("event_date = '2025-10-15'")  # reads one folder
```

## Limits and misconceptions
- **Over-partitioning** is the classic mistake: partitioning by a high-cardinality column (customer, timestamp) creates millions of tiny files and slows everything. Aim for partitions of roughly 1 GB or more, and use low-cardinality columns such as date.
- Bucketing works only through the catalog (`saveAsTable`), mostly with Hive-style tables, and is not supported for Delta tables. It is rarely used in modern lakehouses.
- With Delta, Databricks now recommends liquid clustering instead of partitioning for many tables, especially those under about 1 TB (verify current guidance).

## Remember this
Partition on disk by a low-cardinality filter column such as date; too many partitions is worse than none.

## Related
pyspark-m07-pruning-and-pushdown, pyspark-m08-delta-optimize-clustering, pyspark-m07-partitions, sql-m09-partitioning
