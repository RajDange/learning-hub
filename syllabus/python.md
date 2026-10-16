# Track: python — Python for Data, ML and AI

> An ecosystem map, not a syntax tutorial. Code only where it clarifies an idea.

## python-m01 — Language essentials for data work
- python-m01-types-mutability | Types, references and mutability | Names versus objects, mutable defaults, copies versus views | code: yes | related: python-m04-pandas-core
- python-m01-comprehensions-generators | Comprehensions, iterators and generators | Lazy iteration and why generators matter for large data | code: yes | related: pyspark-m01-lazy-evaluation
- python-m01-functions-decorators | Functions, closures and decorators | First-class functions, *args and **kwargs, decorators used by frameworks | code: yes | related: python-m01-classes-dataclasses
- python-m01-classes-dataclasses | Classes and dataclasses | When to use a class, dataclasses and Pydantic models for structured data | code: yes | related: python-m01-typing
- python-m01-errors-context-managers | Exceptions and context managers | try, except, finally, raising well, and with blocks for resources | code: yes | related: pyspark-m12-idempotency-retries
- python-m01-typing | Type hints | Annotations, mypy and pyright, and how libraries use hints at runtime | code: yes | related: python-m01-classes-dataclasses

## python-m02 — Environments and packaging
- python-m02-virtual-environments | Virtual environments and pip | Why isolation matters, venv, pip and the global environment trap | code: yes | related: python-m02-uv-poetry-lockfiles
- python-m02-uv-poetry-lockfiles | uv, Poetry and lock files | Modern project managers, pyproject.toml, requirements versus lock files | code: yes | related: python-m02-project-layout
- python-m02-project-layout | Project layout and packaging | src layout, packages, wheels, and making code importable | code: yes | related: pyspark-m12-packaging-config

## python-m03 — NumPy
- python-m03-numpy-arrays | NumPy arrays and broadcasting | ndarray, dtypes, shapes and broadcasting rules | code: yes | related: ml-m01-linear-algebra
- python-m03-vectorization | Vectorisation | Replacing Python loops with array operations, and why it is faster | code: yes | related: python-m07-profiling

## python-m04 — pandas and Polars
- python-m04-pandas-core | pandas DataFrames and indexing | Series, DataFrame, index, loc and iloc, copy versus view warnings | code: yes | related: pyspark-m14-pandas-api-on-spark
- python-m04-groupby-merge | groupby, merge and reshaping | Split-apply-combine, joins, pivot and melt in pandas | code: yes | related: pyspark-m03-groupby-aggregation
- python-m04-time-series | Time series in pandas | DatetimeIndex, resampling, rolling windows, time zones | code: yes | related: sql-m06-time-series
- python-m04-memory | Memory use in pandas | dtypes, categoricals, chunking, Arrow-backed types | code: yes | related: python-m07-arrow
- python-m04-pandas-vs-polars | pandas vs Polars | Eager versus lazy execution, expressions, performance, and when to pick each | code: yes | related: tools-m04-duckdb

## python-m05 — Visualisation
- python-m05-matplotlib-seaborn | matplotlib and seaborn | The base plotting library and the statistical layer on top | code: yes | related: python-m05-choosing-a-library
- python-m05-plotly | Plotly | Interactive charts and dashboards with Plotly and Dash | code: yes | related: python-m05-choosing-a-library
- python-m05-choosing-a-library | Choosing a visualisation library | Static versus interactive, notebooks versus apps versus BI tools | code: no | related: tools-m08-power-bi

## python-m06 — Data access
- python-m06-files-formats | Files and formats from Python | CSV, JSON, Parquet, Excel; pyarrow and fsspec for cloud storage | code: yes | related: pyspark-m06-file-formats
- python-m06-rest-apis | Calling REST APIs | requests and httpx, pagination, rate limits, retries and authentication | code: yes | related: pyspark-m13-ingestion-patterns
- python-m06-sqlalchemy | SQL from Python | DB-API drivers, SQLAlchemy engine and ORM, reading into DataFrames | code: yes | related: sql-m10-dynamic-sql-injection
- python-m06-eda-workflow | Cleaning and EDA workflow | A repeatable path from raw data to understanding: shape, types, missing values, distributions | code: yes | related: ml-m04-missing-data

## python-m07 — Performance
- python-m07-profiling | Profiling | Finding the slow part with cProfile, line profilers and memory profilers | code: yes | related: python-m03-vectorization
- python-m07-concurrency | Threads, processes and async | The GIL, multiprocessing, concurrent.futures and asyncio, and which fits I/O versus CPU work | code: yes | related: python-m06-rest-apis
- python-m07-arrow | Apache Arrow | The columnar in-memory format shared by pandas, Polars, DuckDB and Spark | code: yes | related: pyspark-m04-pandas-udfs-arrow, tools-m03-columnar-formats

## python-m08 — Engineering
- python-m08-config-logging | Configuration and logging | Environment variables, config files, the logging module | code: yes | related: pyspark-m12-logging-monitoring-debugging
- python-m08-pytest | Testing with pytest | Tests, fixtures, parametrisation and what to test in data code | code: yes | related: pyspark-m12-testing-pytest
- python-m08-git | Git for data work | Commits, branches, pull requests, and what not to commit | code: yes | related: fabric-m09-git-integration
- python-m08-docker-basics | Docker basics for Python | Packaging a Python app with its dependencies in an image | code: yes | related: tools-m09-docker
- python-m08-notebooks-vs-scripts | Notebooks vs scripts | Where notebooks shine, where they hurt, and how to move code out of them | code: no | related: databricks-m03-notebooks, fabric-m04-notebooks

## python-m09 — Stats and ML on-ramp
- python-m09-scipy-statsmodels | SciPy and statsmodels | Statistical tests, distributions and regression with inference | code: yes | related: ml-m01-hypothesis-testing
- python-m09-scikit-learn | scikit-learn overview | The estimator API, fit and predict, and what the library covers | code: yes | related: ml-m04-sklearn-pipelines
- python-m09-pytorch | PyTorch overview | Tensors, autograd and where PyTorch sits next to scikit-learn | code: yes | related: ml-m05-pytorch-concepts
