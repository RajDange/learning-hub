# Files and formats from Python
id: python-m06-files-formats
track: python

## What we're learning
Python reads and writes every common data format:

- **CSV**: `pandas.read_csv` / `polars.read_csv`; the standard library `csv` module for streaming rows. Watch encodings, delimiters, quoting and dtypes.
- **JSON**: the `json` module; `pandas.read_json(lines=True)` for JSON lines; `pd.json_normalize` to flatten nested records.
- **Parquet**: `pyarrow.parquet`, `pandas.read_parquet`, `polars.read_parquet` / `scan_parquet`, DuckDB. Column selection and row-group filters make reads efficient.
- **Excel**: `pandas.read_excel` with `openpyxl`.
- **Delta and Iceberg**: `deltalake` (delta-rs) and `pyiceberg` read and write lakehouse tables without Spark.
- **Cloud storage**: **fsspec** and its implementations (`s3fs`, `adlfs`, `gcsfs`) give pandas, Polars and pyarrow a file-system interface to S3, ADLS and GCS URLs.

## Benefit
Knowing these lets small jobs, tests and utilities work directly with lake data and source files, without a Spark cluster.

## Code snippet
```python
import pandas as pd
from deltalake import DeltaTable

df = pd.read_parquet("abfss://lake@acct.dfs.core.windows.net/silver/orders/",
                     columns=["order_id", "amount"],
                     storage_options={"account_name": "acct", "anon": False})
recent = DeltaTable("s3://lake/silver/customers").to_pandas()
```

## Limits and misconceptions
- Reading Delta or Iceberg with small libraries may not support every table feature (deletion vectors, column mapping); check versions.
- Writing to a lakehouse table from several tools concurrently needs a proper table format and catalog, not plain files.
- Credentials for cloud storage should come from identity (managed identity, environment), not code.

## Remember this
pandas, Polars, pyarrow and DuckDB read every format; fsspec reaches cloud storage, and delta-rs and pyiceberg read lakehouse tables without Spark.

## Related
pyspark-m06-file-formats, tools-m03-columnar-formats, python-m07-arrow


# Calling REST APIs
id: python-m06-rest-apis
track: python

## What we're learning
Many sources are SaaS applications exposing **REST APIs**. A robust Python extractor handles:

- **HTTP client**: `requests` (synchronous) or `httpx` (sync and async), with **sessions** for connection reuse and **timeouts** always set.
- **Authentication**: API keys, OAuth 2.0 client credentials (fetch and refresh tokens), managed identity tokens for cloud APIs. Secrets come from a vault or environment.
- **Pagination**: page numbers, offsets, cursors or `next` links; loop until done, ideally as a generator.
- **Rate limits**: respect `429 Too Many Requests` and `Retry-After`; back off exponentially with jitter (the `tenacity` library helps).
- **Incremental extraction**: request only records changed since the last run, using an `updated_since` parameter and a stored watermark.
- **Landing**: write raw responses (JSON lines) to storage first, then parse downstream.

## Benefit
Most "the API pipeline is flaky" problems come from missing timeouts, retries, pagination edge cases and rate limits; handling them makes extractors reliable.

## Code snippet
```python
import httpx, time

def fetch_all(url, token, since):
    with httpx.Client(timeout=30, headers={"Authorization": f"Bearer {token}"}) as client:
        params = {"updated_since": since, "limit": 500}
        while url:
            r = client.get(url, params=params)
            if r.status_code == 429:
                time.sleep(int(r.headers.get("Retry-After", "5")))
                continue
            r.raise_for_status()
            body = r.json()
            yield from body["items"]
            url, params = body.get("next"), None    # cursor link includes its own params
```

## Limits and misconceptions
- APIs change without warning; validate responses and alert on schema changes.
- Managed connectors (Fivetran, Airbyte, platform connectors) may be cheaper than maintaining your own for common SaaS sources.
- Parallel requests can hit rate limits faster; concurrency must respect quotas.

## Remember this
A good API extractor sets timeouts, handles auth, pages through cursors, backs off on 429s, extracts incrementally and lands raw JSON first.

## Related
pyspark-m13-ingestion-patterns, tools-m01-managed-connectors, python-m07-concurrency, tools-m09-secrets-identity


# SQL from Python
id: python-m06-sqlalchemy
track: python

## What we're learning
Python talks to databases through **DB-API drivers**: `pyodbc` or `mssql-python` for SQL Server, `oracledb` for Oracle, `psycopg` for PostgreSQL, `snowflake-connector-python`, `databricks-sql-connector`. Each provides connections, cursors, `execute` with **parameters**, and transactions.

**SQLAlchemy** adds a common layer on top:
- **Engine** and connection pooling, with a URL per database.
- **Core**: SQL expressions built in Python, portable across dialects, plus `text()` for raw SQL with bound parameters.
- **ORM**: classes mapped to tables, for application-style code.

pandas reads and writes through it: `pd.read_sql(query, engine, params=...)`, `df.to_sql(...)`. Polars and DuckDB can also read from databases efficiently (for example with ConnectorX or ADBC drivers based on Arrow).

## Benefit
Parameterised, pooled database access from Python for extraction, reconciliation checks, metadata queries and small loads.

## Code snippet
```python
from sqlalchemy import create_engine, text
import pandas as pd

engine = create_engine("oracle+oracledb://user:pwd@erp-db:1521/?service_name=ERPPDB")
with engine.connect() as conn:
    df = pd.read_sql(text("SELECT * FROM sales.orders WHERE order_date >= :d"),
                     conn, params={"d": "2025-10-01"})
```

## Limits and misconceptions
- Never build SQL with f-strings from inputs; bind parameters to avoid injection.
- `df.to_sql` inserts row batches and is slow for large loads; use bulk loaders (`bcp`, COPY, `fast_executemany` in pyodbc) or files.
- Pulling large tables into pandas on one machine runs out of memory; extract in chunks or use Spark.

## Remember this
Use DB-API drivers with bound parameters, SQLAlchemy for engines and portability, and bulk tools rather than to_sql for large loads.

## Related
sql-m10-dynamic-sql-injection, pyspark-m06-jdbc, python-m01-errors-context-managers


# Cleaning and EDA workflow
id: python-m06-eda-workflow
track: python

## What we're learning
**Exploratory data analysis (EDA)** is a repeatable routine to understand a new dataset before building on it:

1. **Shape and types**: rows, columns, dtypes; do types match meaning (IDs as strings, dates parsed)?
2. **Keys**: is the supposed key unique? Any duplicates?
3. **Missing values**: count and pattern per column; is missing random or meaningful?
4. **Distributions**: `describe()`, histograms, value counts; outliers, impossible values (negative ages, future dates).
5. **Categories**: unexpected spellings, case variants, codes not in the reference list.
6. **Relationships**: joins to reference tables (orphans), correlations, time trends and gaps.
7. **Document** findings and turn them into cleaning steps and data quality rules.

Profiling tools (ydata-profiling, Sweetviz, Data Wrangler in VS Code and Fabric) generate much of this automatically.

## Benefit
Most downstream problems (wrong joins, misleading metrics, failed models) trace back to something visible in the first hour of EDA.

## Code snippet
```python
df.info()
df.describe(include="all").T
df.isna().mean().sort_values(ascending=False).head(10)       # share missing per column
df["customer_id"].duplicated().sum()
df["status"].str.strip().str.upper().value_counts(dropna=False)
```

## Limits and misconceptions
- Cleaning in a notebook without recording the steps makes results unreproducible; move cleaning into code with tests.
- Do not "fix" data silently; flag and discuss anomalies with source owners.
- EDA on a sample may miss rare but important problems; profile the full data where possible.

## Remember this
Check shape, keys, missing values, distributions, categories and relationships, then turn findings into coded cleaning steps and quality rules.

## Related
ml-m04-missing-data, pyspark-m11-validation-expectations, python-m05-matplotlib-seaborn
