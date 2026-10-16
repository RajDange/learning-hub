# Scheduling vs orchestration
id: tools-m05-scheduling-vs-orchestration
track: tools
verified: 2026-10

## What we're learning
A **scheduler** runs a job at a time: cron, Windows Task Scheduler, a SQL Agent job. An **orchestrator** runs a **workflow**: many tasks with dependencies, across systems, and handles what happens when things go wrong.

What a real orchestrator provides:
- **Dependencies**: run B after A succeeds; run C and D in parallel.
- **Triggers**: time schedules, events (a file arrived, an upstream table updated), or data-aware scheduling.
- **Retries and timeouts** with backoff, and alerting on failure.
- **Parameters and backfills**: rerun a workflow for a past date range.
- **Observability**: run history, logs, durations, and lineage of what produced what.
- **Code and deployment**: workflows defined as code or versioned definitions.

## Benefit
Once pipelines have more than a few steps, orchestration is what makes failures visible and recoverable instead of silent. Most "the report is wrong" incidents are really "a step failed and nothing noticed".

## Compared with
| | Cron-style scheduler | Orchestrator |
|---|---|---|
| Unit | One job | Graph of tasks |
| Dependencies | Time-based guesses | Explicit |
| Failure handling | Manual | Retries, alerts, partial reruns |
| Backfill | Script by hand | Built in |
| Examples | cron, SQL Agent | Airflow, Dagster, Prefect, ADF, Fabric pipelines, Databricks Jobs |

## Limits and misconceptions
- Orchestrators coordinate work; they should not do heavy data processing themselves.
- One orchestrator for everything is ideal but rare; most estates have a central orchestrator plus platform-native jobs. Keep the dependency between them explicit.
- Event-driven triggers reduce idle waiting but make runs harder to predict; combine with SLAs and monitoring.

## Remember this
A scheduler starts a job at a time; an orchestrator runs dependent tasks with retries, alerts, parameters and backfills.

## Related
tools-m05-airflow, tools-m05-adf-fabric-pipelines, pyspark-m12-orchestration-airflow


# Apache Airflow
id: tools-m05-airflow
track: tools
verified: 2026-10

## What we're learning
**Apache Airflow** is the most widely used open-source orchestrator. Workflows are **DAGs** written in Python. Each DAG contains **tasks** created from **operators** (run a SQL query, start a Databricks job, call an API, run Python) and **sensors** (wait for a condition). The **scheduler** decides what should run, **executors** (Local, Celery, Kubernetes, and others) run task processes, and a web UI shows runs and logs. Thousands of provider packages connect to cloud services and tools.

**Airflow 3** (April 2025, with 3.3 in July 2026) brought:
- **DAG versioning**: a run finishes on the version it started with.
- **Assets** (formerly datasets) and `@asset` for data-aware scheduling, plus event-driven triggers.
- A new UI on a REST API, and a **Task SDK** with task isolation from the metadata database.
- Backfills managed by the scheduler and remote execution options.

Managed Airflow: Amazon MWAA, Google Cloud Composer, Astronomer (Astro), and an Apache Airflow job item in Microsoft Fabric.

## Benefit
Airflow can orchestrate almost anything, across clouds and tools, with workflows in version-controlled Python and a large community.

## Limits and misconceptions
- Airflow is a coordinator, not a data processor; pulling large data into workers is an anti-pattern.
- Self-hosting means operating the scheduler, database, executors and upgrades; most teams use a managed service.
- Task-centric design means Airflow knows tasks ran, not necessarily which data they produced; assets improve this.
- Upgrading from Airflow 2 to 3 requires code changes (imports, removed features).

## Remember this
Airflow orchestrates Python-defined DAGs of tasks across any system; Airflow 3 added versioning, assets and task isolation.

## Related
pyspark-m12-orchestration-airflow, tools-m05-dagster, tools-m05-prefect, tools-m05-scheduling-vs-orchestration


# Dagster
id: tools-m05-dagster
track: tools
verified: 2026-10

## What we're learning
**Dagster** is an open-source orchestrator built around **software-defined assets**: instead of describing tasks, you declare the data assets (tables, files, ML models) your code produces and what they depend on. Dagster derives the execution graph from those declarations, tracks when each asset was last materialised, and can run **asset checks** (data quality tests) attached to them. It also offers partitions (by date or key), sensors and schedules, and a components system and `dg` command line for project structure. **Dagster+** is the managed offering (serverless or hybrid).

## Benefit
Thinking in assets matches how data teams reason ("is the revenue table fresh and correct?") and gives built-in lineage, freshness and quality per asset, plus strong local development and testing.

## Compared with
| | Dagster | Airflow |
|---|---|---|
| Core concept | Assets (data) | Tasks (work) |
| Lineage and freshness | Built in per asset | Via assets (Airflow 3) and add-ons |
| Testing locally | Strong focus | Possible, less central |
| Ecosystem size | Smaller | Largest |

## Limits and misconceptions
- A smaller community and fewer integrations than Airflow, and fewer engineers who know it.
- The asset model is a different way of thinking; migrating Airflow DAGs is a redesign, not a translation.
- Like any orchestrator, it coordinates compute that runs elsewhere.

## Remember this
Dagster orchestrates by declaring data assets and their dependencies, giving built-in lineage, freshness and checks.

## Related
tools-m05-airflow, tools-m05-prefect, tools-m07-data-observability


# Prefect
id: tools-m05-prefect
track: tools
verified: 2026-10

## What we're learning
**Prefect** is a Python-native workflow orchestrator. Workflows are ordinary Python functions decorated as **flows** and **tasks**, so control flow (loops, conditionals, dynamic task creation) is just Python, without a separate DAG file. Prefect 3.x is current.

Its **hybrid model** separates the control plane (Prefect Cloud or a self-hosted Prefect server, which stores state and schedules) from execution: **workers** in your own infrastructure poll **work pools** and run flows on processes, containers, Kubernetes or serverless platforms, so code and data stay in your environment.

## Benefit
Very low friction for Python teams: an existing script becomes an observable, retryable, scheduled workflow with a few decorators, and dynamic workflows are natural.

## Limits and misconceptions
- Fewer pre-built integrations than Airflow, and a smaller talent pool.
- Python-centric: less suited to teams whose work is mainly SQL or platform-native jobs.
- Like other orchestrators, it does not replace a processing engine.

## Remember this
Prefect turns plain Python functions into orchestrated flows, with a hosted control plane and execution in your own infrastructure.

## Related
tools-m05-airflow, tools-m05-dagster, tools-m05-scheduling-vs-orchestration


# ADF, Fabric pipelines and Databricks Jobs as orchestrators
id: tools-m05-adf-fabric-pipelines
track: tools
verified: 2026-10

## What we're learning
Data platforms ship their own orchestrators:

- **Azure Data Factory** and **Fabric Data Factory pipelines**: visual pipelines with activities, control flow, schedules and event triggers. Fabric pipelines can run notebooks, dataflows, Copy jobs, stored procedures and semantic model refreshes natively, and can call external services.
- **Databricks Lakeflow Jobs** (formerly Workflows): multi-task jobs with notebooks, pipelines, SQL, dbt, Python wheels and JARs, if/else and for-each logic, retries and triggers on schedule, file arrival or table updates.
- **Snowflake tasks** and task graphs: scheduled or triggered SQL and Snowpark within Snowflake.

The alternative is a **separate orchestrator** (Airflow, Dagster, Prefect) that calls these platforms through APIs.

## Benefit
Platform-native orchestration needs no extra infrastructure, understands the platform's items and security natively, and is often enough when most work happens on one platform.

## Compared with
| | Platform-native | Separate orchestrator |
|---|---|---|
| Setup | None | Extra service to run or buy |
| Cross-platform workflows | Limited | Strong |
| Workflow as code | Varies (JSON, YAML, UI) | Python |
| Vendor lock-in | Higher | Lower |
| Lineage across platforms | Weak | Possible (OpenLineage) |

## Limits and misconceptions
- Mixing several orchestrators without a clear owner leads to hidden cross-platform dependencies and "who triggers what" confusion.
- Platform orchestrators evolve with the platform (renames, new triggers); check current features.
- A visual pipeline is still code: put it in Git and review changes.

## Remember this
Use the platform's own orchestrator when work lives on one platform; add a separate orchestrator when workflows span many systems.

## Related
fabric-m03-pipelines, databricks-m03-jobs, tools-m01-azure-data-factory, tools-m05-scheduling-vs-orchestration
