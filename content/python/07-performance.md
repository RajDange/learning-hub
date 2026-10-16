# Profiling
id: python-m07-profiling
track: python

## What we're learning
**Profiling** measures where time and memory actually go, instead of guessing:

- **cProfile** (standard library): counts calls and time per function; view results with `snakeviz` or `pstats`.
- **line_profiler**: time per line inside chosen functions.
- **py-spy** and **Scalene**: sampling profilers that attach to running processes with little overhead; Scalene also separates Python, native and memory time.
- **Memory**: `tracemalloc` (standard library), `memray`, and `df.memory_usage(deep=True)` for pandas.
- **Quick timing**: `time.perf_counter()` around blocks, `%timeit` in notebooks.

For Spark jobs, the equivalent is the Spark UI and query plans, not Python profilers.

## Benefit
Profiling usually shows that one function or one loop takes most of the time, so effort goes where it matters.

## Code snippet
```bash
python -m cProfile -o profile.out jobs/build_features.py
```
```bash
py-spy top --pid 12345
```

## Limits and misconceptions
- Profilers add overhead; deterministic profilers distort very fast functions.
- Optimising before measuring wastes time on code that was never slow.
- I/O waits (network, database) show as time in socket or driver calls; the fix is batching or concurrency, not faster Python.

## Remember this
Measure with a profiler first; the slow part is rarely where you guess.

## Related
python-m03-vectorization, python-m07-concurrency, pyspark-m07-stages-tasks-scheduler


# Threads, processes and async
id: python-m07-concurrency
track: python

## What we're learning
Python offers three ways to do several things at once, suited to different bottlenecks:

- **Threads** (`threading`, `concurrent.futures.ThreadPoolExecutor`): good for **I/O-bound** work (API calls, database queries, file downloads), where threads wait on the network. In standard CPython, the **Global Interpreter Lock (GIL)** lets only one thread run Python bytecode at a time, so threads do not speed up pure-Python CPU work. (Python 3.13+ offers an experimental free-threaded build without the GIL, and 3.14 made it officially supported; libraries are catching up.)
- **Processes** (`multiprocessing`, `ProcessPoolExecutor`): separate interpreters, each with its own GIL, for **CPU-bound** work; data passed between processes is serialised, which costs time and memory.
- **asyncio** (`async`/`await`, with `httpx` or `aiohttp`): one thread handling thousands of concurrent I/O operations through an event loop; efficient but requires async-compatible libraries throughout.

NumPy, pandas, Polars and DuckDB release the GIL inside their compiled code, so they can use several cores anyway.

## Benefit
Choosing the right model turns a sequential API extractor taking an hour into one taking minutes, without over-engineering CPU work.

## Code snippet
```python
from concurrent.futures import ThreadPoolExecutor

def fetch(table):
    return extract_table(table)          # I/O-bound: waits on the database

with ThreadPoolExecutor(max_workers=8) as pool:
    results = list(pool.map(fetch, ["orders", "customers", "products", "invoices"]))
```

## Limits and misconceptions
- More workers than the source allows causes throttling or overload; respect rate limits and connection limits.
- Processes on Windows start with `spawn`, so code must be guarded by `if __name__ == "__main__":`.
- For data larger than one machine, use Spark rather than multiprocessing.

## Remember this
Threads or asyncio for waiting on I/O, processes for CPU-bound Python, and vectorised libraries already use multiple cores.

## Related
python-m06-rest-apis, python-m07-profiling, pyspark-m01-spark-architecture


# Apache Arrow
id: python-m07-arrow
track: python

## What we're learning
**Apache Arrow** is a standard **in-memory columnar format**: a language-independent layout for tables in memory, with typed columns, null bitmaps and efficient strings. Because many tools use the same layout, data can pass between them **without copying or converting** (zero-copy).

Who uses it:
- **pandas** (Arrow-backed dtypes, and Arrow strings by default in pandas 3), **Polars** (built on Arrow), **DuckDB** (reads and writes Arrow directly).
- **PySpark**: pandas UDFs, `toPandas()` and `createDataFrame(pandas_df)` use Arrow to move data between the JVM and Python.
- **pyarrow**: reading and writing Parquet, datasets over many files, compute functions.
- **Arrow Flight** and **ADBC**: high-speed transport and database connectivity in Arrow format (used by Dremio, Snowflake, DuckDB and others).

Parquet is the **on-disk** columnar format; Arrow is the **in-memory** one, and they convert efficiently.

## Benefit
Arrow is why moving data between Spark, pandas, Polars and DuckDB is fast today, and why a mixed toolset no longer means serialisation bottlenecks.

## Code snippet
```python
import pyarrow.parquet as pq
import duckdb, polars as pl

table = pq.read_table("orders.parquet", columns=["region", "amount"])   # Arrow table
pl_df = pl.from_arrow(table)                                             # zero-copy where possible
duckdb.sql("SELECT region, SUM(amount) FROM table GROUP BY region").show()  # DuckDB reads the Arrow variable
```

## Limits and misconceptions
- Zero-copy needs compatible types; some conversions (for example to NumPy for nullable integers) still copy.
- Arrow is in memory; it does not replace Parquet for storage.

## Remember this
Arrow is the shared in-memory columnar format that lets Spark, pandas, Polars and DuckDB exchange data without costly conversion.

## Related
pyspark-m04-pandas-udfs-arrow, tools-m03-columnar-formats, python-m04-memory, python-m04-pandas-vs-polars
