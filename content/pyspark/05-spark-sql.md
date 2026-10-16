# Spark SQL, views, subqueries and CTEs
id: pyspark-m05-sql-on-dataframes
track: pyspark

## What we're learning
Spark SQL and the DataFrame API are two front ends to the same engine. Both produce the same logical plan, go through the same Catalyst optimiser and run at the same speed. You can mix them freely:

- `df.createOrReplaceTempView("orders")` registers a DataFrame as a **temporary view** visible to this session.
- `createOrReplaceGlobalTempView` makes a view visible across sessions of the same application, under the `global_temp` schema.
- `spark.sql("SELECT ...")` returns a DataFrame you can continue with in Python.
- Subqueries (`IN`, `EXISTS`, scalar) and CTEs (`WITH ... AS`) work as in other SQL dialects.

## Benefit
Teams can write each step in the language that reads best: SQL for set logic that analysts will review, Python for control flow, parameters and reuse. Migrated SQL from Oracle or SQL Server can often run with modest translation.

## Code snippet
```python
orders.createOrReplaceTempView("orders")
customers.createOrReplaceTempView("customers")

top = spark.sql("""
    WITH revenue AS (
        SELECT customer_id, SUM(amount) AS total
        FROM orders WHERE order_date >= :start
        GROUP BY customer_id)
    SELECT c.name, r.total
    FROM revenue r JOIN customers c USING (customer_id)
    QUALIFY ROW_NUMBER() OVER (ORDER BY r.total DESC) <= 10
""", args={"start": "2025-01-01"})
```

## Limits and misconceptions
- Named parameters (`args=`) are supported from Spark 3.4; avoid building SQL with f-strings from user input.
- `QUALIFY` is supported in recent Spark and Databricks SQL (verify for your runtime); in older versions, wrap the window in a subquery.
- Temporary views disappear when the session ends. For persistence, write a table.
- A CTE is not materialised by default; it is inlined into the plan, so referencing it twice can compute it twice.

## Remember this
SQL and DataFrames compile to the same plan, so pick whichever reads better for each step.

## Related
sql-m04-ctes, pyspark-m05-catalog-tables, pyspark-m02-columns-and-expressions, sql-m10-dynamic-sql-injection


# Catalog, databases and tables
id: pyspark-m05-catalog-tables
track: pyspark

## What we're learning
Spark keeps table definitions in a **catalog** (metastore). A table has a name, a schema, a format and a storage location. Two kinds matter:

- **Managed tables**: the catalog owns both metadata and files. `DROP TABLE` deletes the data.
- **External (unmanaged) tables**: the catalog stores only metadata pointing at a path you control. `DROP TABLE` leaves the files.

Classic Spark uses a two-level name (`database.table`) backed by a Hive metastore. Unity Catalog and other modern catalogs add a third level: `catalog.schema.table`. `spark.catalog` lets you list databases, tables and columns from code.

## Benefit
Tables give data a stable name independent of file paths, let SQL users find it, and are where governance (permissions, lineage, tags) attaches.

## Code snippet
```python
spark.sql("CREATE SCHEMA IF NOT EXISTS sales")
orders.write.format("delta").mode("overwrite").saveAsTable("sales.orders")   # managed

spark.sql("""CREATE TABLE IF NOT EXISTS sales.orders_ext
             USING DELTA LOCATION 'abfss://lake@acct.dfs.core.windows.net/sales/orders'""")  # external

[t.name for t in spark.catalog.listTables("sales")]
```

## Limits and misconceptions
- "Database" and "schema" mean the same thing in Spark SQL.
- In the classic Hive metastore, permissions are weak or absent; governance comes from the platform catalog (Unity Catalog, OneLake, Glue with Lake Formation).
- A path read with `spark.read.load(path)` bypasses catalog permissions where the platform allows path access at all.

## Remember this
Managed tables let the catalog own the files; external tables only point at them, and modern catalogs add a third naming level.

## Related
databricks-m02-unity-catalog-overview, tools-m06-catalogs-explained, fabric-m02-lakehouse, pyspark-m08-delta-lake


# Query hints
id: pyspark-m05-hints
track: pyspark

## What we're learning
Hints tell the optimiser to choose a plan it might not choose itself. Spark supports:

- **Join hints**: `BROADCAST` (alias `BROADCASTJOIN`, `MAPJOIN`), `MERGE` (sort-merge), `SHUFFLE_HASH`, `SHUFFLE_REPLICATE_NL`.
- **Partitioning hints**: `COALESCE(n)`, `REPARTITION(n, col)`, `REPARTITION_BY_RANGE`, `REBALANCE`.

In SQL they go in a comment after `SELECT`; in Python you call `df.hint("broadcast")` or `F.broadcast(df)`.

## Benefit
When statistics are missing or wrong, a hint can turn a 30-minute sort-merge join into a two-minute broadcast join, or fix a write that produces thousands of tiny files.

## Code snippet
```python
from pyspark.sql import functions as F
result = facts.join(F.broadcast(dim_country), "country_code")

spark.sql("""
  SELECT /*+ BROADCAST(c), REBALANCE(order_date) */ o.*, c.name
  FROM orders o JOIN countries c ON o.country_code = c.code
""")
```

## Limits and misconceptions
- A hint is a request, not an order. Spark ignores a broadcast hint for a full outer join, for example.
- Hints freeze a decision that may become wrong as data grows. A broadcast of a "small" table that grows to 5 GB can crash executors.
- With Adaptive Query Execution, Spark already switches to broadcast at runtime when a side turns out small. Try AQE before hints.

## Remember this
Hints override the optimiser; use them for proven problems and revisit them when data volumes change.

## Related
pyspark-m07-broadcast-joins, pyspark-m07-aqe, sql-m09-hints
