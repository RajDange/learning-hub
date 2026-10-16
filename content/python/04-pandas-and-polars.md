# pandas DataFrames and indexing
id: python-m04-pandas-core
track: python

## What we're learning
**pandas** is the standard Python library for tabular data on one machine. A **DataFrame** is a table of named columns, each a **Series** with one dtype, plus an **index** (row labels). Key ideas:

- **Selection**: `df["col"]`, `df[["a", "b"]]`; `.loc[rows, cols]` selects by **label**; `.iloc[rows, cols]` by **position**; boolean masks filter rows (`df[df["amount"] > 0]`).
- **The index** aligns data: arithmetic between two Series matches on index labels, not position, which is powerful and occasionally surprising.
- **Assignment**: `df.loc[mask, "col"] = value` updates in place; chained indexing (`df[mask]["col"] = value`) may modify a temporary copy. pandas 3 adopted **copy-on-write**, which makes this behaviour consistent.
- Method chaining with `.assign`, `.query`, `.pipe` keeps transformations readable.

## Benefit
pandas is the lingua franca for small and medium data: exploration, quick transformations, tests, and input to plotting and ML libraries.

## Code snippet
```python
import pandas as pd

orders = pd.read_parquet("orders.parquet")
eu_large = (orders
            .query("region == 'EU' and amount > 1000")
            .assign(amount_k=lambda d: d["amount"] / 1000)
            .loc[:, ["order_id", "customer_id", "amount_k"]])
first_row = orders.iloc[0]
```

## Limits and misconceptions
- pandas works in memory on one machine; a rule of thumb is that you need several times the data size in RAM.
- Index alignment can introduce NaNs when labels do not match; reset or align indexes deliberately.
- Many teams now use a default integer index everywhere and treat the index as an implementation detail.

## Remember this
A DataFrame is labelled columns plus an index; select with loc by label and iloc by position, and avoid chained assignment.

## Related
python-m04-groupby-merge, pyspark-m14-pandas-api-on-spark, python-m01-types-mutability


# groupby, merge and reshaping
id: python-m04-groupby-merge
track: python

## What we're learning
pandas' core relational operations:

- **groupby** follows **split-apply-combine**: split rows by keys, apply an aggregation or transformation per group, combine results. `df.groupby("region").agg(revenue=("amount", "sum"), orders=("order_id", "nunique"))` uses named aggregation. `.transform` returns a value per original row (group share, group mean).
- **merge** joins DataFrames like SQL: `how="inner" | "left" | "right" | "outer"`, `on=` or `left_on=`/`right_on=`, with `validate="one_to_many"` to check key uniqueness and `indicator=True` to see where each row came from.
- **concat** stacks DataFrames vertically or horizontally.
- **Reshaping**: `pivot_table` (long to wide with aggregation), `melt` (wide to long), `stack`/`unstack`.

## Benefit
The same mental model as SQL and Spark (group, join, pivot) applies, so logic moves easily between tools.

## Code snippet
```python
summary = (orders.merge(customers, on="customer_id", how="left", validate="many_to_one")
                 .groupby(["region", "segment"], as_index=False)
                 .agg(revenue=("amount", "sum"), customers=("customer_id", "nunique")))

orders["share_of_customer"] = orders["amount"] / orders.groupby("customer_id")["amount"].transform("sum")
long = wide.melt(id_vars="product", var_name="month", value_name="qty")
```

## Limits and misconceptions
- `merge` silently multiplies rows when keys are duplicated; use `validate=`.
- `groupby` drops NaN keys by default (`dropna=False` keeps them).
- `.apply` with custom Python functions per group is slow; prefer built-in aggregations.

## Remember this
groupby is split-apply-combine, merge is a SQL join (validate the keys), and melt and pivot_table reshape between long and wide.

## Related
pyspark-m03-groupby-aggregation, pyspark-m03-joins, sql-m05-pivot-unpivot


# Time series in pandas
id: python-m04-time-series
track: python

## What we're learning
pandas has rich time-series support:

- Parse to `datetime64` with `pd.to_datetime` (format and `utc=True` explicit).
- A **DatetimeIndex** enables time-based selection (`df.loc["2025-10"]`).
- **resample** changes frequency (`df.resample("1h").sum()`, `"MS"` for month start) with aggregation or filling.
- **rolling** windows (`df["x"].rolling("7D").mean()`) and **expanding** cumulative statistics.
- **shift** and **diff** compare with previous periods.
- **Time zones**: `tz_localize` attaches a zone to naive times, `tz_convert` converts between zones.

## Benefit
Monitoring metrics, sensor data and sales series can be bucketed, smoothed and compared in a few lines, which is the bread and butter of operational analytics and forecasting preparation.

## Code snippet
```python
s = (pd.read_parquet("readings.parquet")
       .assign(ts=lambda d: pd.to_datetime(d["ts"], utc=True))
       .set_index("ts")["temperature"])

hourly = s.resample("1h").mean()
smoothed = hourly.rolling("24h").mean()
local = hourly.tz_convert("Europe/Amsterdam")
yoy = hourly - hourly.shift(24 * 365)
```

## Limits and misconceptions
- Mixing naive and time-zone-aware timestamps raises errors or silently misaligns data; standardise on UTC.
- `resample` produces rows for empty periods (filled with NaN or 0 depending on aggregation); decide how to treat gaps.
- Daylight saving makes some local days 23 or 25 hours long.

## Remember this
Use a UTC DatetimeIndex, resample to change frequency, rolling for moving windows, and shift for period comparisons.

## Related
sql-m06-time-series, ml-m03-forecasting, python-m04-pandas-core


# Memory use in pandas
id: python-m04-memory
track: python

## What we're learning
pandas DataFrames often use far more memory than the file they came from. Levers to reduce it:

- **dtypes**: downcast numbers (`int64` to `int32`, `float64` to `float32` where precision allows).
- **Categoricals**: repeated strings (country, status) stored as integer codes plus a small dictionary: often 10 times smaller and faster to group.
- **Arrow-backed types**: `dtype_backend="pyarrow"` on read uses Apache Arrow memory, with efficient strings and proper nullable types; pandas 3 uses an Arrow-based string type by default.
- **Read less**: `columns=` on `read_parquet`, `usecols=` and `dtype=` on `read_csv`, filters on Parquet reads.
- **Chunking**: `read_csv(chunksize=...)` processes large files in pieces.
- Inspect with `df.memory_usage(deep=True)` and `df.info(memory_usage="deep")`.

## Benefit
Halving memory often decides whether a job runs on a laptop or a small VM at all, and avoids moving to a cluster unnecessarily.

## Code snippet
```python
df = pd.read_csv("events.csv",
                 usecols=["user_id", "country", "event", "ts"],
                 dtype={"country": "category", "event": "category"},
                 parse_dates=["ts"])
print(df.memory_usage(deep=True).sum() / 1e6, "MB")
```

## Limits and misconceptions
- Categoricals with very many unique values give little benefit.
- Downcasting can overflow or lose precision; check ranges.
- If data still does not fit, switch tools (Polars, DuckDB, Spark) rather than fighting pandas.

## Remember this
Shrink pandas memory with correct dtypes, categoricals, Arrow types and reading only needed columns; beyond that, change tools.

## Related
python-m07-arrow, python-m04-pandas-vs-polars, python-m06-files-formats


# pandas vs Polars
id: python-m04-pandas-vs-polars
track: python

## What we're learning
**Polars** is a DataFrame library written in Rust on Apache Arrow memory. Compared with pandas:

- **Expressions**: transformations are written as column expressions (`pl.col("amount").sum().over("region")`) rather than index-based operations, similar to Spark.
- **Lazy execution**: `pl.scan_parquet(...)` builds a query plan that is optimised (predicate and projection pushdown) before running, like Spark; eager mode also exists.
- **Multithreaded** by default, and a **streaming** engine processes larger-than-memory data in batches.
- **No index**: rows are positional; joins and groupings are explicit.

pandas remains the most widely supported library (plotting, scikit-learn, countless tutorials and integrations).

## Benefit
Polars is often several times faster and more memory-efficient than pandas on medium data, and its lazy, expression-based style is closer to Spark and SQL.

## Compared with
| | pandas | Polars |
|---|---|---|
| Engine | NumPy / Arrow, mostly single-threaded | Rust, Arrow, multithreaded |
| Execution | Eager | Lazy or eager |
| Index | Yes | No |
| Ecosystem support | Universal | Growing; converts to pandas and Arrow easily |
| Larger than memory | Chunking by hand | Streaming engine |

## Code snippet
```python
import polars as pl

result = (pl.scan_parquet("orders/*.parquet")
            .filter(pl.col("region") == "EU")
            .group_by("customer_id")
            .agg(pl.col("amount").sum().alias("revenue"))
            .sort("revenue", descending=True)
            .collect())
```

## Limits and misconceptions
- Polars is single-machine; for data beyond one large machine use Spark.
- Some libraries expect pandas; converting is cheap via Arrow but not free.
- DuckDB is a strong SQL-first alternative for the same scale.

## Remember this
Polars is a fast, lazy, expression-based DataFrame library; pandas has the broadest ecosystem. Both are single-machine.

## Related
tools-m04-duckdb, python-m07-arrow, pyspark-m01-lazy-evaluation, python-m04-pandas-core
