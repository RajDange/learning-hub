# groupBy, aggregation, rollup and cube
id: pyspark-m03-groupby-aggregation
track: pyspark

## What we're learning
`groupBy(keys).agg(...)` collapses rows with the same key into one row and computes aggregate expressions: `sum`, `count`, `avg`, `min`, `max`, `countDistinct`, `collect_list`, `first`, `percentile_approx` and many more.

`rollup` and `cube` add **subtotals**. `rollup("region", "country")` returns totals per country, per region and a grand total. `cube` returns every combination of the keys, including country without region. Subtotal rows have null in the rolled-up columns; `grouping()` tells you whether a null is a real null or a subtotal marker.

## Benefit
One aggregation pass replaces many separate queries, and Spark does most of the work before the shuffle by computing **partial aggregates** on each partition (like a combiner in MapReduce).

## Code snippet
```python
from pyspark.sql import functions as F

summary = (orders.groupBy("region", "country")
           .agg(F.sum("amount").alias("revenue"),
                F.countDistinct("customer_id").alias("customers"),
                F.max("order_date").alias("last_order")))

subtotals = (orders.rollup("region", "country")
             .agg(F.sum("amount").alias("revenue"),
                  F.grouping("country").alias("is_region_total")))
```

## Limits and misconceptions
- `groupBy` is a wide transformation: rows with the same key must move to the same partition.
- `countDistinct` cannot use partial aggregation as cheaply; on huge data prefer `approx_count_distinct`.
- `collect_list` on a hot key can build a huge array and run an executor out of memory.
- `first()` after `groupBy` is not deterministic unless the data inside the group is ordered, which a groupBy does not guarantee. Use a window function for "latest row per key".

## Remember this
groupBy shuffles once and aggregates partially first; rollup and cube add subtotal rows marked by grouping().

## Related
pyspark-m07-shuffle, pyspark-m07-skew, pyspark-m03-window-functions, sql-m01-logical-processing-order


# Joins in Spark
id: pyspark-m03-joins
track: pyspark

## What we're learning
`df.join(other, on, how)` combines two DataFrames. Supported `how` values: `inner`, `left`, `right`, `full`, `left_semi` (keep left rows that have a match, add no columns), `left_anti` (keep left rows with no match) and `cross`.

The `on` argument can be a column name, a list of names, or a boolean expression. Passing names (`on="customer_id"`) keeps one copy of the key; passing an expression (`a.id == b.id`) keeps both, which leads to "ambiguous column" errors later.

## Benefit
Semi and anti joins replace the clumsy "left join then filter for null" pattern, and choosing the right `on` form avoids duplicate-column headaches.

## Code snippet
```python
# Same-name key: one customer_id column in the result
enriched = orders.join(customers, on="customer_id", how="left")

# Different key names: alias the sides to keep them apart
o, c = orders.alias("o"), customers.alias("c")
enriched = o.join(c, F.col("o.cust_ref") == F.col("c.customer_id"), "left") \
            .select("o.*", F.col("c.segment"))

# Orders whose customer is missing from the master table
orphans = orders.join(customers, "customer_id", "left_anti")
```

## Limits and misconceptions
- A key that is duplicated on both sides multiplies rows. Check key uniqueness on the dimension side before blaming Spark for wrong totals.
- Null keys never match with `==`. Use `eqNullSafe` if nulls should match.
- How Spark executes the join (broadcast, sort-merge, shuffle hash) matters more for speed than the join type. See the join strategies lesson.
- Range or inequality joins cannot use hash or sort-merge on the range part and can be very slow on large data.

## Remember this
Join on column names to avoid duplicate keys, use left_semi and left_anti for existence checks, and watch for key duplication.

## Related
sql-m01-join-semantics, pyspark-m07-broadcast-joins, sql-m02-semi-anti-joins, pyspark-m02-nulls


# Union and set operations
id: pyspark-m03-union
track: pyspark

## What we're learning
- `union(other)` appends rows **by position**. Column names are ignored, so swapped columns silently mix data. It keeps duplicates, like SQL `UNION ALL`.
- `unionByName(other, allowMissingColumns=True)` appends **by name** and fills missing columns with nulls. This is almost always what you want.
- `intersect`, `intersectAll`, `subtract` (SQL `EXCEPT DISTINCT`) and `exceptAll` give set logic.

## Benefit
`unionByName` makes combining monthly extracts, multiple source systems or evolving schemas safe. `exceptAll` is a quick way to diff two datasets during migration testing.

## Code snippet
```python
all_orders = orders_2024.unionByName(orders_2025, allowMissingColumns=True)

# Rows in source not in target, keeping duplicates
missing = source.exceptAll(target)
```

## Limits and misconceptions
- `union` does not deduplicate. Add `.distinct()` if you need SQL `UNION` behaviour, and accept the shuffle.
- `union` is cheap (no shuffle) but unioning hundreds of DataFrames in a loop builds a huge plan; read the files in one call instead when you can.
- Types must be compatible; Spark widens where it can (int to long) and fails otherwise.

## Remember this
Use unionByName, not union, unless you have checked column order yourself.

## Related
sql-m01-set-operations, pyspark-m11-reconciliation, pyspark-m08-delta-schema-evolution


# Pivot and unpivot
id: pyspark-m03-pivot-unpivot
track: pyspark

## What we're learning
**Pivot** turns distinct values of one column into new columns, with an aggregate in each cell: `groupBy("product").pivot("month").sum("qty")`.

**Unpivot** does the reverse, turning columns into rows. Since Spark 3.4 there is `df.unpivot(ids, values, variableColumnName, valueColumnName)` (alias `melt`). Before that, people used `stack()` in a SQL expression.

## Benefit
Pivoting produces report-shaped tables; unpivoting turns spreadsheet-shaped or wide legacy tables into tidy rows that are easy to aggregate and load.

## Code snippet
```python
# Pass the values list: Spark skips an extra job to find distinct months
wide = sales.groupBy("product").pivot("month", ["2025-01", "2025-02", "2025-03"]).sum("qty")

long = wide.unpivot(ids=["product"], values=["2025-01", "2025-02", "2025-03"],
                    variableColumnName="month", valueColumnName="qty")
```

## Limits and misconceptions
- Without an explicit values list, `pivot` runs a separate job to collect distinct values, and an unexpected value adds a column.
- Spark caps automatic pivot columns (`spark.sql.pivotMaxValues`, default 10,000). Wide pivots are a sign the result belongs in a BI tool, not a table.
- Unpivoted value columns must share a compatible type.

## Remember this
Pivot with an explicit values list; unpivot wide legacy tables into rows early.

## Related
sql-m05-pivot-unpivot, pyspark-m03-groupby-aggregation


# Explode and nested data
id: pyspark-m03-explode-nested
track: pyspark

## What we're learning
JSON, Avro and API data often contain arrays and nested structs. To analyse them as rows:

- `explode(array_col)` returns one row per element and drops rows with empty or null arrays. `explode_outer` keeps them with a null.
- `posexplode` also returns the element's position.
- `explode` on a map returns `key` and `value` columns.
- Struct fields are reached with dot notation: `F.col("address.city")`, or all at once with `"address.*"`.
- `inline` explodes an array of structs straight into columns.

## Benefit
Flattening nested data once, near ingestion, gives downstream users ordinary tables and lets Spark prune unused nested fields.

## Code snippet
```python
# order: {order_id, customer: {id, city}, lines: [{sku, qty}, ...]}
lines = (orders
         .select("order_id", "customer.city", F.explode_outer("lines").alias("line"))
         .select("order_id", "city", "line.sku", "line.qty"))
```

## Limits and misconceptions
- Exploding multiplies rows. Exploding two independent arrays in sequence gives a cross product of their elements, usually a bug.
- Exploding a very large array per row can create huge partitions; repartition afterwards if needed.
- Sometimes you should not flatten: higher-order functions can filter or transform arrays in place without exploding.

## Remember this
explode turns array elements into rows; use explode_outer to keep empty ones and never explode two arrays blindly.

## Related
pyspark-m04-complex-types, sql-m07-json, pyspark-m06-file-formats


# Window functions in Spark
id: pyspark-m03-window-functions
track: pyspark

## What we're learning
A window function computes a value for each row from a **window** of related rows, without collapsing them like `groupBy` does. You define the window with `Window.partitionBy(...).orderBy(...)` and optionally a frame (`rowsBetween` or `rangeBetween`).

Common functions: `row_number`, `rank`, `dense_rank`, `lag`, `lead`, `sum`/`avg` over a frame for running totals and moving averages, `first`/`last` with `ignorenulls`.

## Benefit
Windows answer "latest record per key", "change since previous row", "running balance" and "rank within group" in one pass, without self-joins.

## Code snippet
```python
from pyspark.sql import Window, functions as F

w = Window.partitionBy("account_id").orderBy("txn_ts")
running = Window.partitionBy("account_id").orderBy("txn_ts") \
                .rowsBetween(Window.unboundedPreceding, Window.currentRow)

txns = (txns
        .withColumn("prev_amount", F.lag("amount").over(w))
        .withColumn("balance", F.sum("amount").over(running))
        .withColumn("seq", F.row_number().over(w)))
```

## Limits and misconceptions
- A window with `orderBy` but no explicit frame uses `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`. Ties in the order column then share one running total. Specify `rowsBetween` when you mean rows.
- `partitionBy` shuffles by the window key, and all rows of one key go to one task: a skewed key makes one slow task.
- A window with no `partitionBy` moves all data to a single partition. Spark warns about it; take the warning seriously.

## Remember this
Windows compute per-row results over related rows; always state the frame when you mean rows, and partition by a key.

## Related
sql-m03-window-frames, sql-m03-ranking, pyspark-m07-skew, pyspark-m03-deduplication


# Deduplication patterns
id: pyspark-m03-deduplication
track: pyspark

## What we're learning
Two kinds of duplicates need two tools:

- **Exact or key duplicates where any copy will do**: `dropDuplicates(["key"])` keeps one arbitrary row per key.
- **Versions of a record where one specific copy must win** (the latest update, the highest priority source): use `row_number()` over a window ordered by your rule, then keep row 1.

## Benefit
Most change feeds, API pulls and file re-deliveries contain repeats. Choosing deterministic deduplication makes reruns produce the same result, which is the basis of idempotent pipelines.

## Code snippet
```python
from pyspark.sql import Window, functions as F

w = Window.partitionBy("customer_id").orderBy(F.col("updated_at").desc(), F.col("ingest_ts").desc())
latest = (changes.withColumn("rn", F.row_number().over(w))
                 .filter("rn = 1").drop("rn"))
```

## Limits and misconceptions
- `dropDuplicates` without a full ordering is **not deterministic**: which row survives can change between runs.
- Add a tie-breaker to the window order (ingest time, file name, sequence number) so two rows with the same `updated_at` do not swap.
- In streaming, `dropDuplicates` keeps state forever unless you add a watermark; see the stateful streaming lesson.
- Spark 3.5 added `dropDuplicatesWithinWatermark` for streaming.

## Remember this
dropDuplicates keeps any copy; when one copy must win, rank with row_number and a full tie-breaking order.

## Related
sql-m05-deduplication, pyspark-m03-window-functions, pyspark-m12-idempotency-retries, pyspark-m09-stateful-operations
