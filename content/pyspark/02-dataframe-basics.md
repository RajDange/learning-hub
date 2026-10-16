# Schemas and data types
id: pyspark-m02-schema-and-types
track: pyspark

## What we're learning
Every DataFrame has a **schema**: an ordered list of column names, types and nullability, held as a `StructType` of `StructField`s. Spark gets a schema in one of three ways: from the source itself (Parquet, Delta, Avro and JDBC carry types), by **inference** (sampling CSV or JSON), or from a schema **you declare**.

Common types: `StringType`, `IntegerType`, `LongType`, `DoubleType`, `DecimalType(p, s)`, `DateType`, `TimestampType`, `BooleanType`, and the complex types `ArrayType`, `MapType` and `StructType`.

## Benefit
An explicit schema makes a pipeline predictable. It avoids a full extra pass over CSV or JSON for inference, stops a column silently becoming a string when one bad row appears, and documents what the job expects.

## Code snippet
```python
from pyspark.sql.types import StructType, StructField, StringType, DecimalType, DateType

schema = StructType([
    StructField("order_id", StringType(), nullable=False),
    StructField("amount", DecimalType(18, 2)),
    StructField("order_date", DateType()),
])
df = spark.read.schema(schema).option("header", True).csv("/landing/orders/")

# The same schema as a DDL string
df = spark.read.schema("order_id STRING, amount DECIMAL(18,2), order_date DATE").csv(...)
df.printSchema()
```

## Limits and misconceptions
- `nullable=False` on read is a hint, not a constraint. Spark does not reject nulls from files because of it; use table constraints or validation for that.
- Use `DecimalType` for money. `DoubleType` is binary floating point and cannot represent 0.10 exactly.
- Oracle `NUMBER` without precision and SQL Server `DATETIME` need deliberate mapping; see the migration lessons.
- Timestamps are stored in UTC and displayed in the session time zone (`spark.sql.session.timeZone`). `TIMESTAMP_NTZ` exists for values without a time zone.

## Remember this
Declare schemas for text sources and use decimals for money; inference is a convenience, not a contract.

## Related
pyspark-m06-file-formats, sql-m12-data-type-mapping, pyspark-m08-delta-schema-evolution, pyspark-m11-validation-expectations


# Columns, expressions, select and filter
id: pyspark-m02-columns-and-expressions
track: pyspark

## What we're learning
DataFrame code is built from **column expressions**. `F.col("amount")` does not hold data; it describes a column that Spark will compute. You combine expressions with operators and functions, then use them in a few core methods:

- `select` picks or computes columns; `withColumn` adds or replaces one column; `withColumns` does several at once.
- `filter` (alias `where`) keeps rows where an expression is true.
- `cast` changes type, `alias` renames an expression, `lit` wraps a constant, `withColumnRenamed` renames a column.

## Benefit
Because expressions are descriptions, not Python code that runs per row, Spark can optimise them and run them in the JVM. Building transformations as expressions is the habit that separates fast PySpark from slow PySpark.

## Code snippet
```python
from pyspark.sql import functions as F

out = (df
       .filter((F.col("status") == "SHIPPED") & (F.col("amount") > 0))   # & and |, with brackets
       .withColumn("amount_eur", F.col("amount") * F.lit(0.92))
       .withColumn("order_year", F.year("order_date"))
       .select("order_id", F.col("customer_id").alias("cust"), "amount_eur", "order_year"))

# The same filter as a SQL expression string
df.filter("status = 'SHIPPED' AND amount > 0")
```

## Limits and misconceptions
- Use `&`, `|` and `~` with brackets, not Python's `and`, `or`, `not`, which raise an error on columns.
- Calling `withColumn` in a long loop builds a deep plan that is slow to analyse. Use one `select` or `withColumns` instead.
- `df.amount` attribute access works but breaks for names with spaces or that clash with DataFrame methods; `F.col("amount")` is safer.

## Remember this
A column is an expression, not data; build logic from expressions so Spark can optimise it.

## Related
pyspark-m04-builtin-functions, pyspark-m05-sql-on-dataframes, pyspark-m01-lazy-evaluation


# Working with nulls
id: pyspark-m02-nulls
track: pyspark

## What we're learning
Spark SQL follows SQL's null rules: any comparison with null gives null, and a filter keeps only rows where the condition is true. So `F.col("country") != "DE"` drops rows where `country` is null, which surprises many people.

Tools for nulls:
- `isNull()`, `isNotNull()` to test.
- `F.coalesce(a, b, ...)` returns the first non-null value.
- `df.na.fill(...)`, `df.na.drop(...)`, `df.na.replace(...)` for bulk handling.
- `eqNullSafe` (SQL `<=>`) treats two nulls as equal, useful in joins and change detection.

## Benefit
Most silent data bugs in pipelines are null bugs: rows dropped by a filter, joins that miss rows, counts that disagree with the source. Knowing the rules prevents them.

## Code snippet
```python
from pyspark.sql import functions as F

# Keep rows that are not DE, including unknown country
df.filter((F.col("country") != "DE") | F.col("country").isNull())

# Change detection that treats null == null as "unchanged"
changed = src.join(tgt, "id").filter(~src.email.eqNullSafe(tgt.email))

df.na.fill({"discount": 0})
```

## Limits and misconceptions
- `count("col")` counts non-null values; `count("*")` counts rows.
- Aggregates such as `sum` and `avg` ignore nulls, so the average of (10, null) is 10, not 5.
- Joins on a nullable key never match null to null with `==`.
- Empty strings are not nulls in Spark. Oracle treats `''` as null, so data migrated from Oracle may need care.

## Remember this
Null is "unknown", so comparisons with it are never true; test for it explicitly and use null-safe equality where two unknowns should match.

## Related
sql-m01-null-logic, pyspark-m03-joins, sql-m12-dialect-translation


# Sorting, distinct, limit and sampling
id: pyspark-m02-sort-distinct-sample
track: pyspark

## What we're learning
Four everyday operations with very different costs:

- `orderBy` / `sort` produces a total order across all partitions. Spark samples the data to pick ranges and then shuffles everything. `sortWithinPartitions` only sorts inside each partition and needs no shuffle.
- `distinct()` and `dropDuplicates([...])` remove duplicates. Both shuffle so equal rows meet.
- `limit(n)` returns at most n rows. Without an `orderBy` the rows are arbitrary.
- `sample(fraction=...)` returns a random approximate fraction; `sampleBy` does stratified sampling by a column.

## Benefit
Knowing which operations shuffle lets you avoid paying for a global sort or distinct that nobody needs, which is one of the most common sources of slow jobs.

## Code snippet
```python
df.orderBy(F.col("amount").desc_nulls_last()).limit(10)   # top 10, Spark optimises to a top-k
df.select("customer_id").distinct().count()
df.sample(fraction=0.01, seed=42)                          # about 1 percent
```

## Limits and misconceptions
- `sample(0.01)` does not return exactly 1 percent; it is a per-row coin flip.
- Sorting before writing files does not guarantee order when you read them back, unless the reader preserves it. Never rely on file order.
- `limit` followed by more transformations can still scan a lot of data, because Spark may need many partitions to find n rows.
- For distinct counts on huge data, `approx_count_distinct` is far cheaper and usually accurate within a few percent.

## Remember this
Global sorts and distincts shuffle everything; ask whether you need them before you write them.

## Related
pyspark-m07-shuffle, pyspark-m03-deduplication, pyspark-m03-window-functions
