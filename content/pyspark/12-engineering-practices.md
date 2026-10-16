# Testing PySpark code with pytest
id: pyspark-m12-testing-pytest
track: pyspark

## What we're learning
PySpark transformations are ordinary Python functions that take and return DataFrames, so they can be unit tested with **pytest**:

- A **session-scoped fixture** creates one local SparkSession for all tests (starting Spark is slow).
- Each test builds a tiny input DataFrame from literal rows, calls the function, and compares the result with an expected DataFrame.
- `pyspark.testing.assertDataFrameEqual` (Spark 3.5+) and `assertSchemaEqual` compare DataFrames with readable error messages; `chispa` is a popular library for older versions.

## Benefit
Tests catch logic errors (wrong join type, null handling, off-by-one dates) in seconds on a laptop, instead of hours later in a cluster run, and they make refactoring safe.

## Code snippet
```python
# conftest.py
import pytest
from pyspark.sql import SparkSession

@pytest.fixture(scope="session")
def spark():
    return (SparkSession.builder.master("local[2]")
            .config("spark.sql.shuffle.partitions", "2").getOrCreate())

# test_orders.py
from pyspark.testing import assertDataFrameEqual
from pipeline.orders import add_order_band

def test_add_order_band(spark):
    df = spark.createDataFrame([(1, 50.0), (2, 1500.0)], "id INT, amount DOUBLE")
    expected = spark.createDataFrame([(1, 50.0, "small"), (2, 1500.0, "large")],
                                     "id INT, amount DOUBLE, band STRING")
    assertDataFrameEqual(add_order_band(df), expected)
```

## Limits and misconceptions
- Code must be **structured to be testable**: functions that take DataFrames, not notebooks that read from fixed paths and write to production tables.
- Local tests do not catch scale problems (skew, memory); those need performance tests on representative data.
- Keep test data tiny and explicit; reading samples from production is slow and leaks data into repositories.

## Remember this
Write transformations as functions of DataFrames and test them with pytest and a shared local session.

## Related
python-m08-pytest, pyspark-m12-packaging-config, pyspark-m01-sparksession, ml-m06-testing-reproducibility


# Project structure, packaging, configuration and style
id: pyspark-m12-packaging-config
track: pyspark

## What we're learning
Production Spark code looks like a normal Python project:

- **Layout**: a package (`src/pipeline/`) with modules for reading, transforming and writing; thin entry-point scripts or notebooks that call it; `tests/` beside it.
- **Packaging**: build a **wheel** (`pyproject.toml`) and install it on the cluster or in the platform environment (Databricks libraries or bundles, Fabric environments, `--py-files` for spark-submit).
- **Configuration**: paths, table names, dates and environment differences come from config files or parameters, not hard-coded strings. One code base runs in dev, test and prod.
- **Style and versioning**: a formatter and linter (for example `ruff`), type hints, semantic versions for the package, and a changelog.

## Benefit
Packaged, configured code can be tested, reviewed, versioned and deployed the same way in every environment, which notebooks full of copied cells cannot.

## Code snippet
```python
# src/pipeline/jobs/load_orders.py
import argparse
from pipeline.config import load_config
from pipeline.orders import clean_orders

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--env", required=True)
    p.add_argument("--run-date", required=True)
    args = p.parse_args()
    cfg = load_config(args.env)                     # e.g. config/prod.yaml
    raw = spark.read.table(cfg["tables"]["orders_bronze"]).filter(f"load_date = '{args.run_date}'")
    clean_orders(raw).write.mode("overwrite").option("replaceWhere", f"load_date = '{args.run_date}'") \
        .saveAsTable(cfg["tables"]["orders_silver"])
```

## Limits and misconceptions
- Notebooks are fine as entry points and for exploration; the problem is business logic that exists only inside them.
- Library versions on the cluster must match what you tested with; pin them.
- Secrets never go in config files; read them from a secret store at runtime.

## Remember this
Put logic in a tested, versioned package, keep notebooks and scripts thin, and drive environments from configuration.

## Related
python-m02-project-layout, pyspark-m10-spark-submit, python-m08-config-logging, databricks-m07-asset-bundles


# Logging, monitoring and debugging
id: pyspark-m12-logging-monitoring-debugging
track: pyspark

## What we're learning
Three sources of evidence when a Spark job misbehaves:

- **Logs**: the driver log contains your own Python logging and the main error; executor logs contain task-level errors (and Python worker tracebacks for UDFs). Use the standard `logging` module on the driver; avoid `print` inside UDFs.
- **Metrics**: the Spark UI and event logs (stage durations, shuffle sizes, spill, GC), plus platform metrics (cluster CPU and memory, capacity usage). Business metrics such as rows read, written and rejected should be logged by the job itself and stored.
- **Plans**: `explain()` and the SQL tab show what Spark actually did.

Reading errors: the Python traceback usually wraps a Java one. Look for the **first** `Caused by:` in the JVM stack and the actual Python error inside `PythonException` blocks.

## Benefit
Most production failures fall into a few patterns (out of memory, skew, schema mismatch, missing files, source unavailable). Good logs and the Spark UI turn hours of guessing into minutes.

## Code snippet
```python
import logging
log = logging.getLogger("pipeline.orders")

rows_in = raw.count()
clean = clean_orders(raw)
clean.write.mode("append").saveAsTable("silver.orders")
log.info("orders run_date=%s rows_in=%d", run_date, rows_in)
```

## Limits and misconceptions
- Extra `count()` calls for logging cost a full scan each; collect metrics from write statistics (Delta history, `operationMetrics`) where possible.
- Logs on autoscaling clusters disappear with the nodes unless log delivery to storage is configured.
- `AnalysisException` means a problem in the query (names, types) found before running; `SparkException` with task failures means a runtime problem in the data or resources.

## Remember this
Use the driver log for your messages, the first JVM "Caused by" for the real error, and the Spark UI for where time went.

## Related
pyspark-m07-stages-tasks-scheduler, python-m08-config-logging, pyspark-m07-explain-plans, databricks-m07-monitoring


# CI/CD for Spark jobs
id: pyspark-m12-cicd
track: pyspark

## What we're learning
**Continuous integration (CI)** runs automatically on every pull request: formatting and lint checks, unit tests with a local Spark session, and building the wheel. **Continuous delivery (CD)** deploys the built artefact and job definitions to environments (dev, test, prod), often with an approval before production.

A typical flow:
1. Developer pushes a branch; CI runs lint and pytest.
2. After review and merge, CD builds the package and deploys it with the platform's tooling: Databricks Asset Bundles, Fabric Git integration or deployment APIs, `spark-submit` artefacts to EMR, or Terraform for infrastructure.
3. Integration tests run against a test environment with representative data.
4. Promotion to production uses the same artefact with production configuration.

## Benefit
Every change is tested and deployed the same way, which removes "it worked in my notebook" failures and gives an audit trail of what ran in production.

## Limits and misconceptions
- CI with local Spark proves logic, not performance or platform permissions; keep an integration stage.
- Data changes are not code changes: schema migrations and backfills need their own controlled steps.
- Do not give CI pipelines broad production credentials; use workload identity federation and least privilege.

## Remember this
CI tests and builds on every change; CD deploys the same artefact through environments with configuration and approvals.

## Related
tools-m09-cicd, databricks-m07-asset-bundles, fabric-m09-git-integration, pyspark-m12-testing-pytest


# Orchestrating Spark with Airflow
id: pyspark-m12-orchestration-airflow
track: pyspark

## What we're learning
An orchestrator runs jobs in the right order, on schedule, with retries and alerts. With **Apache Airflow**, a pipeline is a **DAG** of tasks defined in Python. Spark work is triggered through operators rather than running inside Airflow:

- `SparkSubmitOperator` for clusters you reach with spark-submit.
- Provider operators for managed platforms: Databricks (`DatabricksRunNowOperator`, `DatabricksSubmitRunOperator`), EMR, Dataproc, and others.
- Sensors or dataset- or asset-based scheduling to start when upstream data is ready.

Airflow passes parameters (such as the logical date) so each run processes the right slice.

## Benefit
Airflow coordinates Spark with everything around it: extracts, dbt models, quality checks, notifications and downstream refreshes, across platforms.

## Code snippet
```python
from airflow.sdk import dag, task   # Airflow 3 task SDK; Airflow 2 used airflow.decorators
from airflow.providers.databricks.operators.databricks import DatabricksRunNowOperator
import pendulum

@dag(schedule="0 2 * * *", start_date=pendulum.datetime(2025, 1, 1), catchup=False)
def orders_daily():
    load = DatabricksRunNowOperator(task_id="load_orders", job_id=12345,
                                    job_parameters={"run_date": "{{ ds }}"})
    @task
    def notify():
        print("orders loaded")
    load >> notify()

orders_daily()
```

## Limits and misconceptions
- Airflow is not a processing engine: do not pull large data into Airflow workers.
- Platform-native orchestrators (Databricks jobs, Fabric pipelines) may be simpler when everything runs on one platform.
- Each task should be idempotent so retries and backfills are safe.

## Remember this
Airflow schedules and sequences Spark jobs through operators; the processing still happens on the Spark platform.

## Related
tools-m05-airflow, tools-m05-adf-fabric-pipelines, pyspark-m12-idempotency-retries, databricks-m03-jobs


# Idempotency, retries and error handling
id: pyspark-m12-idempotency-retries
track: pyspark

## What we're learning
A job is **idempotent** when running it twice for the same input gives the same result as running it once. Failures, retries, reruns and backfills all happen in practice, so every job should be idempotent.

Patterns:
- **Overwrite a slice, not append**: write the run's date or batch with `replaceWhere` or dynamic partition overwrite, so a rerun replaces it.
- **MERGE on business keys** instead of insert, so repeated rows update rather than duplicate.
- **Deterministic logic**: no `current_timestamp()` as business data, no random sampling without seeds, deterministic deduplication.
- **Track processed inputs**: checkpoints in streaming, processed-file logs or watermarks in batch.
- **Fail loudly**: raise errors on quality failures; do not swallow exceptions and write partial results.

Retries belong at the right level: task retries in Spark, job retries in the orchestrator, with backoff for flaky sources.

## Benefit
Idempotent jobs turn a 2 a.m. failure into "just rerun it", and make backfills of history routine.

## Code snippet
```python
(daily.write.format("delta")
      .mode("overwrite")
      .option("replaceWhere", f"order_date = '{run_date}'")   # rerun replaces only this day
      .saveAsTable("silver.orders"))
```

## Limits and misconceptions
- Retrying a non-idempotent job (plain append) creates duplicates.
- External side effects (sending emails, calling APIs, publishing messages) are hard to make idempotent; isolate them and record what was sent.
- Catching every exception to keep a pipeline "green" hides data loss.

## Remember this
Design every job so a rerun replaces or merges its own output; then retries and backfills are safe.

## Related
pyspark-m09-exactly-once, pyspark-m08-delta-merge, pyspark-m06-read-write-basics, pyspark-m13-backfill-cutover
