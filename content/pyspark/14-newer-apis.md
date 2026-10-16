# pandas API on Spark
id: pyspark-m14-pandas-api-on-spark
track: pyspark

## What we're learning
The **pandas API on Spark** (`import pyspark.pandas as ps`) lets you write pandas-style code that runs distributed on Spark. It started as the separate **Koalas** project and was merged into PySpark in Spark 3.2; Koalas itself is no longer developed.

`ps.read_csv`, `psdf.groupby(...).sum()`, `psdf["col"].apply(...)` and many other pandas operations work, translated into Spark plans. You can convert with `psdf.to_spark()`, `sdf.pandas_api()` and `psdf.to_pandas()`.

## Benefit
Analysts and data scientists who know pandas can scale existing code to data that does not fit in one machine's memory, with a smaller rewrite than moving to the DataFrame API.

## Code snippet
```python
import pyspark.pandas as ps

psdf = ps.read_parquet("/lake/silver/orders")
monthly = (psdf[psdf["status"] == "SHIPPED"]
           .groupby(psdf["order_date"].dt.to_period("M").astype(str))["amount"].sum())
print(monthly.head(12))
```

## Limits and misconceptions
- Not every pandas feature is supported, and some behave differently (row order is not guaranteed, for example).
- pandas relies on a row **index**; maintaining a default index on distributed data is expensive. Setting `compute.default_index_type` to `distributed` avoids a costly sequential index.
- Operations that need the whole dataset in order (some `apply`s, `iloc` positional access) can be slow or move data to one node.
- For new production pipelines, the DataFrame API remains the better-documented and more predictable choice.

## Remember this
The pandas API on Spark (formerly Koalas) scales pandas-style code, but indexes and ordering make it less efficient than native DataFrames.

## Related
python-m04-pandas-core, pyspark-m01-rdd-vs-dataframe, pyspark-m04-pandas-udfs-arrow


# Spark Connect
id: pyspark-m14-spark-connect
track: pyspark

## What we're learning
Classically, a PySpark program **is** the driver: your Python process starts a JVM and talks to it directly. **Spark Connect** (introduced in Spark 3.4) splits this into a **thin client** and a **Spark server**. The client builds unresolved query plans and sends them over gRPC; the server analyses, optimises and executes them and streams results back as Arrow batches.

You connect with `SparkSession.builder.remote("sc://host:15002").getOrCreate()`. The lightweight `pyspark-client` package (Spark 4.0) contains just the client, without the JVM.

## Benefit
- Applications, IDEs and notebooks can use a remote Spark cluster without running a JVM locally.
- Client crashes or memory problems do not take down the shared driver, and the server can be upgraded independently of clients.
- Databricks serverless compute, Databricks Connect and some notebook environments are built on it.

## Code snippet
```python
from pyspark.sql import SparkSession
spark = SparkSession.builder.remote("sc://spark-server:15002").getOrCreate()
spark.read.table("silver.orders").groupBy("region").count().show()
```

## Limits and misconceptions
- APIs that depend on the JVM driver are not available: `SparkContext`, RDDs, `sparkContext.broadcast`, accumulators, and libraries that reach into the JVM through py4j (for example PyDeequ).
- Most DataFrame, SQL, UDF and streaming APIs work. Check compatibility before migrating code that uses RDDs.
- Errors are reported from the server, so some stack traces are less detailed.

## Remember this
Spark Connect turns PySpark into a thin gRPC client of a remote Spark server; DataFrames work, RDD and JVM-dependent APIs do not.

## Related
pyspark-m01-sparksession, databricks-m08-serverless-vs-classic, pyspark-m01-rdd-vs-dataframe


# Notable Spark 4 changes
id: pyspark-m14-spark-4
track: pyspark

## What we're learning
Apache Spark 4.0 was released in May 2025, followed by 4.1 (December 2025) and 4.2 (July 2026). Changes that matter for PySpark users (check release notes for your exact version):

- **ANSI SQL mode on by default**: invalid casts, overflow and division by zero raise errors instead of silently returning null. Code that relied on silent nulls needs `try_cast`, `try_divide` and similar functions.
- **VARIANT data type**: stores semi-structured data (JSON) in an efficient binary form, queryable without declaring a schema up front (`parse_json`, `variant_get`).
- **Python data source API**: write custom batch and streaming data sources in pure Python.
- **Spark Connect** improvements and the `pyspark-client` package.
- **Streaming**: the `transformWithState` API for arbitrary stateful processing, and a state data source to read streaming state. Spark 4.1 (December 2025) added a **real-time mode** for millisecond-latency stateless streaming queries.
- **SQL features**: SQL pipe syntax (`FROM t |> WHERE ... |> SELECT ...`), session variables, SQL user-defined functions, collation support.
- **Native XML** data source, and **plotting** directly on PySpark DataFrames.
- **Platform changes**: Java 17 or 21 required (Java 8 and 11 dropped), Scala 2.13 only, Python 3.9+ (newer minimums in later 4.x versions), Mesos support removed.

## Benefit
Knowing the breaking changes (especially ANSI mode and Java versions) prevents surprises when platforms move their default runtime to Spark 4, as Fabric Runtime 2.0 and recent Databricks runtimes have done.

## Limits and misconceptions
- Managed platforms ship their own builds and may differ from Apache Spark in defaults and backported features.
- ANSI mode can be turned off (`spark.sql.ansi.enabled=false`) as a migration crutch, but it is better to fix the code.
- Later 4.x releases add features after this lesson was written; treat the list as a starting point (verify).

## Remember this
Spark 4 makes ANSI errors the default, adds VARIANT, Python data sources and better Spark Connect, and drops old Java, Scala and Mesos.

## Related
pyspark-m04-builtin-functions, snowflake-m04-variant, pyspark-m06-xml-and-excel, fabric-m04-spark-pools
