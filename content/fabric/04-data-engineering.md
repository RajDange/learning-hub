# Notebooks in Fabric
id: fabric-m04-notebooks
track: fabric
verified: 2026-10

## What we're learning
Fabric **notebooks** are the main place to write Spark code (PySpark, Spark SQL, Scala, SparkR) against OneLake. Each notebook can attach a **default lakehouse**, which becomes the default file system and catalog for relative paths and unqualified table names.

There are also **Python notebooks** that run on a single small machine without Spark (2 vCores and 16 GB by default, configurable), with libraries such as pandas, Polars, DuckDB and delta-rs preinstalled. They suit small data, where a Spark cluster is overkill.

**NotebookUtils** (formerly MSSparkUtils, which still works but is being retired) gives helpers for files, secrets, running other notebooks (`run`, `runMultiple` with dependencies), and reading workspace variables.

Notebooks can be run interactively, scheduled, called from a pipeline's Notebook activity, or started through the job scheduler REST API, with parameters passed in.

## Benefit
One tool for exploration and production transformation, with direct access to every lakehouse in the tenant you have permission to read.

## Limits and misconceptions
- A notebook is not a software project. Shared logic belongs in libraries (published through environments) or Spark job definitions, with tests.
- Each interactive notebook starts its own Spark session and consumes capacity while the session is alive. High concurrency mode lets several notebooks share one.
- The choice of default lakehouse affects what relative paths and `saveAsTable` mean; deploying a notebook to another workspace needs a deployment rule or parameter to point it at the right lakehouse.

## Remember this
Fabric notebooks run Spark or plain Python against OneLake, with a default lakehouse and NotebookUtils for orchestration helpers.

## Related
pyspark-m01-sparksession, fabric-m04-spark-pools, python-m08-notebooks-vs-scripts, fabric-m09-deployment-pipelines


# Spark pools, environments and runtimes
id: fabric-m04-spark-pools
track: fabric
verified: 2026-10

## What we're learning
Fabric manages Spark clusters for you. Three ideas control them:

- **Starter pools**: pre-warmed medium-node clusters that usually start a session in seconds. They fall back to a normal start of a few minutes in busy regions, with private networking, or with non-default settings.
- **Custom pools**: created by a workspace admin with a chosen node size (Small 4 vCores up to XX-Large 64 vCores), autoscale limits and dynamic executor allocation. They start in a few minutes unless configured as scheduled live pools.
- **Environments**: an item that bundles the **runtime version**, compute settings, Spark properties, and public or custom **libraries**. Attach an environment to a notebook or job, or set it as the workspace default, so code runs with the same dependencies everywhere.

Capacity maps to Spark cores: **1 CU = 2 Spark vCores**, with up to 3 times burst. An F64 offers 128 vCores, 384 with burst. You pay only while sessions run.

**Runtimes** (October 2026): Runtime 2.0 is GA and recommended (Spark 4.x, Python 3.13, Java 21); Runtime 1.3 (Spark 3.5) has announced end of support, with an extended support window into 2027. Older runtimes are retired.

## Benefit
No cluster administration: you choose a size and libraries, Fabric handles provisioning, and environments make dependencies reproducible across development and production.

## Limits and misconceptions
- Library installation adds start-up time; "full" publish mode pre-builds a snapshot and is recommended for production.
- Moving between runtimes can break code (Spark 4 enables ANSI mode by default, Scala and Java versions change). Test before switching.
- Capacity is shared: big Spark jobs compete with reports and warehouse queries on the same capacity.

## Remember this
Starter pools start fast, custom pools fit special needs, and environments pin the runtime and libraries your code needs.

## Related
pyspark-m10-managed-platforms, pyspark-m10-dynamic-allocation, pyspark-m14-spark-4, fabric-m01-licensing-capacity


# Spark job definitions
id: fabric-m04-spark-job-definitions
track: fabric
verified: 2026-10

## What we're learning
A **Spark job definition** is a Fabric item that runs a packaged Spark program, much like `spark-submit`. You give it one main file (a `.py` file for PySpark, or a `.jar` with a main class for Scala and Java), optional reference files, command-line arguments, at least one lakehouse reference, an environment, and an optional **retry policy**. It runs batch or long-running streaming jobs and can be scheduled or called from a pipeline.

## Benefit
It separates production code from interactive notebooks: the code is built and tested in a normal repository, packaged by CI, and deployed as a file, which suits engineering teams and compiled JVM code. Retry policies make streaming jobs restart after failures.

## Compared with
| | Notebook | Spark job definition |
|---|---|---|
| Authoring | Interactive cells | Files from your IDE or CI |
| Best for | Exploration, light production | Packaged, tested, long-running or streaming jobs |
| Testing | Harder | Normal unit tests on modules |
| Retry policy | Via pipeline | Built in |

## Limits and misconceptions
- There is no interactive output; debugging relies on logs and the Spark UI.
- Jobs with retry policies must be **idempotent**, because a retry reruns the whole program.
- Microsoft does not publish a formal decision rule between notebooks and job definitions; the comparison above is a common engineering practice.

## Remember this
A Spark job definition is Fabric's spark-submit: a packaged program with arguments, environment and retries.

## Related
pyspark-m10-spark-submit, pyspark-m12-packaging-config, pyspark-m12-idempotency-retries, fabric-m04-notebooks


# Spark performance features in Fabric
id: fabric-m04-spark-performance-features
track: fabric
verified: 2026-10

## What we're learning
Fabric adds several features on top of open-source Spark:

- **Native execution engine**: runs supported Spark SQL operators in vectorised C++ (built on the open-source Velox and Apache Gluten projects) instead of the JVM. It accelerates Parquet, Delta and CSV scans and common operators, and falls back to normal Spark automatically for unsupported parts (for example JSON and XML reads and Structured Streaming). Enabled per environment or with a Spark setting. Microsoft reports large speed-ups on TPC-DS benchmarks; real gains depend on the workload.
- **High concurrency mode**: several notebooks (by default 5, configurable) from the same user with the same default lakehouse and settings share one Spark session. Sessions start much faster and only the first notebook is billed.
- **Optimistic job admission**: jobs are admitted with their minimum cores and grow if capacity allows, so more jobs fit on a capacity. When the capacity is full, interactive jobs are rejected and batch jobs are queued.
- **Autotune** (tuning shuffle partitions and broadcast thresholds with ML) was a preview tied to an older runtime; treat it as legacy (verify before relying on it).

## Benefit
These features cut cost and wait time without code changes, which matters on a shared capacity.

## Limits and misconceptions
- The native engine is not universal; check the Spark advisor for fallback warnings to see which parts of a job actually ran natively.
- None of this fixes bad design: skew, tiny files and unnecessary shuffles still dominate run time.
- Release notes have occasionally described these features inconsistently (for example the native engine's preview wording). Check the current docs before making commitments.

## Remember this
Fabric speeds Spark up with a native C++ engine and session sharing, but the fundamentals of partitioning and shuffle still decide performance.

## Related
pyspark-m07-catalyst-and-tungsten, pyspark-m07-aqe, databricks-m01-photon, pyspark-m07-skew
