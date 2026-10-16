# Built-in functions: string, date, math, conditional
id: pyspark-m04-builtin-functions
track: pyspark

## What we're learning
`pyspark.sql.functions` (imported as `F`) holds hundreds of functions that run inside the JVM:

- **String**: `upper`, `trim`, `concat_ws`, `substring`, `split`, `regexp_replace`, `lpad`, `format_string`.
- **Date and time**: `to_date`, `to_timestamp`, `date_format`, `date_add`, `datediff`, `months_between`, `date_trunc`, `current_timestamp`, `from_utc_timestamp`.
- **Math**: `round`, `bround` (banker's rounding), `abs`, `pow`, `greatest`, `least`.
- **Conditional**: `when(...).otherwise(...)`, `coalesce`, `nullif`, `ifnull`.

## Benefit
Built-ins are optimised by Catalyst, compiled by Tungsten and never cross into Python. Replacing a Python UDF with built-ins is often the single biggest speed-up in a PySpark job.

## Code snippet
```python
from pyspark.sql import functions as F

df = (df
      .withColumn("order_date", F.to_date("order_ts_str", "yyyy-MM-dd HH:mm:ss"))
      .withColumn("month", F.date_trunc("month", "order_date"))
      .withColumn("band", F.when(F.col("amount") >= 1000, "large")
                           .when(F.col("amount") >= 100, "medium")
                           .otherwise("small"))
      .withColumn("name", F.initcap(F.trim("name"))))
```

## Limits and misconceptions
- Date patterns follow Java's `DateTimeFormatter` rules since Spark 3.0 (`yyyy`, `MM`, `dd`, `HH`), not Python's `%Y-%m-%d`.
- When ANSI mode is off, a failed parse returns null; when ANSI mode is on (the default in Spark 4.0), it raises an error. `try_to_timestamp` and other `try_` functions return null on purpose.
- `when` without `otherwise` returns null for unmatched rows.
- Check the function list before writing a UDF. Functions are added every release.

## Remember this
Reach for pyspark.sql.functions first; a built-in is almost always faster than anything you write in Python.

## Related
pyspark-m04-udfs, pyspark-m02-columns-and-expressions, pyspark-m14-spark-4, sql-m12-dialect-translation


# Arrays, maps, structs, JSON and regex
id: pyspark-m04-complex-types
track: pyspark

## What we're learning
Spark handles nested data natively:

- **Structs** group fields: `F.struct(...)` builds one, `col("a.b")` reads one.
- **Arrays**: `array_contains`, `size`, `array_distinct`, `array_sort`, `element_at`, `arrays_zip`, `flatten`.
- **Maps**: `map_keys`, `map_values`, `element_at(map, key)`, `map_from_entries`.
- **JSON strings**: `from_json(col, schema)` parses into structs, `to_json` serialises, `get_json_object` and `json_tuple` extract single paths, `schema_of_json` infers a schema from a sample.
- **Regex**: `regexp_extract`, `regexp_replace`, `rlike`.
- **Higher-order functions** apply a lambda to each element without exploding: `transform`, `filter`, `exists`, `forall`, `aggregate`, `zip_with`.

## Benefit
Keeping data nested where it makes sense, and parsing JSON once with a declared schema, avoids row explosions and keeps logic in fast JVM code.

## Code snippet
```python
payload_schema = "device STRING, readings ARRAY<STRUCT<ts: TIMESTAMP, temp: DOUBLE>>"

events = (raw
          .withColumn("p", F.from_json("body", payload_schema))
          .withColumn("hot_readings", F.filter("p.readings", lambda r: r.temp > 80))
          .withColumn("max_temp", F.array_max(F.transform("p.readings", lambda r: r.temp)))
          .withColumn("site", F.regexp_extract("p.device", r"^([A-Z]+)-", 1)))
```

## Limits and misconceptions
- The lambdas in `transform` and `filter` look like Python but are translated to Spark expressions; you cannot call arbitrary Python inside them.
- `from_json` returns null for rows that do not match the schema (in the default permissive mode). Count nulls after parsing.
- `get_json_object` re-parses the string every call; parse once with `from_json` if you need several fields.
- Spark 4.0 adds a `VARIANT` type for semi-structured data, which avoids declaring a schema up front.

## Remember this
Parse JSON once with a schema, and use higher-order functions to work inside arrays without exploding them.

## Related
pyspark-m03-explode-nested, sql-m07-json, pyspark-m14-spark-4, snowflake-m04-variant


# Python UDFs
id: pyspark-m04-udfs
track: pyspark

## What we're learning
A **user-defined function** (UDF) runs your own Python function on each row. You wrap a function with `F.udf(func, returnType)` or the `@F.udf` decorator, and Spark calls it from executors.

Behind the scenes, each executor starts Python worker processes. Rows are serialised from the JVM, sent to Python, processed one at a time, and the results are sent back. Catalyst treats the UDF as a black box: it cannot push filters through it or optimise it.

## Benefit
UDFs let you use logic that has no built-in equivalent: a Python library for address parsing, a checksum algorithm, a call into a business-rules module.

## Code snippet
```python
from pyspark.sql import functions as F
from pyspark.sql.types import StringType

@F.udf(returnType=StringType())
def normalise_iban(raw):
    if raw is None:
        return None
    return raw.replace(" ", "").upper()

df = df.withColumn("iban", normalise_iban("iban_raw"))
# Here the built-ins would do the same job faster:
df = df.withColumn("iban", F.upper(F.regexp_replace("iban_raw", " ", "")))
```

## Limits and misconceptions
- Row-at-a-time Python UDFs are typically several times slower than built-ins, because of serialisation and Python execution.
- The declared return type is not checked by Python; a mismatch quietly yields nulls.
- UDFs must handle `None` themselves.
- Spark may call a UDF more times than you expect (for example when an expression is reused), so UDFs should be pure: no side effects, no external writes.
- Spark 3.5 added Arrow-optimised Python UDFs (`useArrow=True`) that reduce serialisation cost; pandas UDFs remain the main vectorised option.

## Remember this
A Python UDF is a black box that ships every row to Python; use it only when no built-in or pandas UDF fits.

## Related
pyspark-m04-pandas-udfs-arrow, pyspark-m04-builtin-functions, pyspark-m01-spark-architecture


# pandas UDFs and Apache Arrow
id: pyspark-m04-pandas-udfs-arrow
track: pyspark

## What we're learning
A **pandas UDF** (vectorised UDF) receives whole batches of rows as pandas Series or DataFrames instead of one row at a time. Data moves between the JVM and Python in **Apache Arrow** columnar format, which avoids per-row serialisation.

Main forms:
- **Series to Series** (`@pandas_udf("double")`): a vectorised column function.
- **Series to scalar**: a custom aggregate usable in `groupBy().agg()`.
- **`groupBy().applyInPandas(func, schema)`**: run a pandas function on each group, for example to fit a small model per store.
- **`mapInPandas(func, schema)`**: process each partition as an iterator of pandas DataFrames.

## Benefit
You keep the Python ecosystem (NumPy, pandas, scikit-learn, SciPy) and get performance far closer to built-ins than row UDFs.

## Code snippet
```python
import pandas as pd
from pyspark.sql.functions import pandas_udf

@pandas_udf("double")
def fahrenheit_to_celsius(f: pd.Series) -> pd.Series:
    return (f - 32) * 5 / 9

def fit_per_store(pdf: pd.DataFrame) -> pd.DataFrame:
    slope = pdf["sales"].diff().mean()
    return pd.DataFrame({"store_id": [pdf["store_id"].iloc[0]], "trend": [slope]})

trends = sales.groupBy("store_id").applyInPandas(fit_per_store, "store_id string, trend double")
```

## Limits and misconceptions
- `applyInPandas` loads one whole group into one Python worker's memory. A skewed group can cause out-of-memory errors.
- Arrow batch size is set by `spark.sql.execution.arrow.maxRecordsPerBatch`.
- Still slower than built-ins; vectorised does not mean free.
- Arrow is also what makes `toPandas()` and `createDataFrame(pandas_df)` fast when `spark.sql.execution.arrow.pyspark.enabled` is on.

## Remember this
pandas UDFs move data in Arrow batches, so Python libraries can run on Spark at near-vectorised speed.

## Related
python-m07-arrow, pyspark-m04-udfs, pyspark-m07-skew, python-m04-pandas-core


# Broadcast variables and accumulators
id: pyspark-m04-broadcast-and-accumulators
track: pyspark

## What we're learning
Two shared-variable tools from the RDD era that still matter:

- A **broadcast variable** sends a read-only value (a lookup dictionary, a small model) to every executor once, instead of with every task. Created with `spark.sparkContext.broadcast(value)` and read with `.value`.
- An **accumulator** is a counter or sum that tasks add to and only the driver reads, for example "rows that failed parsing".

## Benefit
Broadcasting a lookup used inside a UDF avoids shipping it thousands of times. Accumulators give cheap side-channel metrics without an extra pass over the data.

## Code snippet
```python
country_names = spark.sparkContext.broadcast({"DE": "Germany", "FR": "France"})
bad_rows = spark.sparkContext.accumulator(0)

def parse(row):
    if row.amount is None:
        bad_rows.add(1)
    return country_names.value.get(row.country, "Unknown")
```

## Limits and misconceptions
- **The retry pitfall**: accumulator updates made inside **transformations** can be applied more than once when a task is retried, a stage is recomputed or speculative execution runs a duplicate task. Only updates inside **actions** (such as `foreach`) are guaranteed to be applied exactly once. Treat accumulators in transformations as approximate.
- Accumulators are only updated when an action runs; reading one before that gives zero.
- Broadcast values must fit in driver and executor memory.
- For joining with a small table, use a **broadcast join** on DataFrames instead of a broadcast variable plus UDF.

## Remember this
Broadcast ships read-only data once per executor; accumulators in transformations can over-count on retries, so do not use them for exact business numbers.

## Related
pyspark-m07-broadcast-joins, pyspark-m04-udfs, pyspark-m07-stages-tasks-scheduler
