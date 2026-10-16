# Great Expectations
id: tools-m07-great-expectations
track: tools
verified: 2026-10

## What we're learning
**Great Expectations** (the open-source library is now called **GX Core**, version 1.x since August 2024) is a Python framework for testing data. Its concepts:

- **Expectations**: declarative assertions such as `expect_column_values_to_not_be_null` or `expect_column_values_to_be_between`.
- **Expectation suites**: named collections of expectations for a dataset.
- **Data sources, data assets and batch definitions**: how GX connects to pandas, Spark or SQL databases and which slice of data to test.
- **Validation definitions and checkpoints**: run a suite against a batch and trigger **actions** (store results, notify).
- **Data Docs**: generated HTML reports of results.

**GX Cloud** is the commercial SaaS with a UI and AI-assisted expectation generation.

## Benefit
A large library of ready-made checks and readable reports, usable across pandas, Spark and SQL engines, which suits Python-centric teams that want quality checks inside their pipelines.

## Limits and misconceptions
- The 1.0 release changed the API substantially; older tutorials and code (pre-1.0) do not apply.
- Configuration has a learning curve compared with simpler YAML-based tools.
- Checks only help if failures stop or quarantine data and someone owns the response.

## Remember this
GX Core lets Python pipelines declare expectations about data, validate batches and publish readable results.

## Related
pyspark-m11-validation-expectations, tools-m07-soda, tools-m07-deequ, tools-m07-data-contracts


# Soda
id: tools-m07-soda
track: tools
verified: 2026-10

## What we're learning
**Soda** is a data quality tool where checks are written in YAML rather than code. Earlier versions used the **SodaCL** check language (`row_count > 0`, `missing_count(email) = 0`, freshness, duplicates, schema checks). **Soda v4** (2026) made **data contracts** the default way to define expectations: a YAML contract per dataset describing columns, types and quality rules, which Soda then verifies against the data. **Soda Core** is the open-source engine; **Soda Cloud** adds a UI, alerting, anomaly detection and AI-assisted contract creation.

## Benefit
Analysts and engineers can define and read checks without writing Python, and the contract approach links quality rules directly to the agreement between data producers and consumers.

## Limits and misconceptions
- The v3-to-v4 shift (SodaCL to contracts) means older examples may not match current docs.
- Checks run as queries against the data source; many checks on huge tables cost compute.
- Like any tool, it needs ownership of failures to be useful.

## Remember this
Soda checks data with YAML definitions, and since v4 centres on data contracts verified against each dataset.

## Related
tools-m07-great-expectations, tools-m07-data-contracts, tools-m07-data-observability


# Deequ and PyDeequ
id: tools-m07-deequ
track: tools
verified: 2026-10

## What we're learning
**Deequ** is an open-source library from AWS Labs, written in Scala on Apache Spark, for "unit tests for data". It computes data quality **metrics** (completeness, uniqueness, distinctness, size, correlation) in efficient Spark passes, checks **constraints** against them, stores metrics over time in a **metrics repository** for anomaly detection, and can **suggest constraints** by profiling data. **PyDeequ** is a Python wrapper. AWS Glue Data Quality builds on the same ideas.

## Benefit
Deequ is designed for large Spark datasets: it batches many metrics into few scans, which matters when tables have billions of rows.

## Limits and misconceptions
- PyDeequ talks to the JVM through py4j, so it does **not** work with Spark Connect, which rules it out on serverless and standard-access compute on several platforms.
- Releases are infrequent; check compatibility with your Spark version.
- Newer Spark-native alternatives and platform features (Databricks pipeline expectations, data quality monitoring, GX, Soda) may be easier to adopt.

## Remember this
Deequ computes and checks data quality metrics efficiently on Spark, but PyDeequ's JVM dependency limits it on modern Spark Connect platforms.

## Related
pyspark-m11-validation-expectations, pyspark-m14-spark-connect, tools-m07-great-expectations


# Data observability platforms
id: tools-m07-data-observability
track: tools
verified: 2026-10

## What we're learning
**Data observability** applies monitoring ideas from software to data: instead of writing every rule by hand, a platform watches datasets continuously and alerts on anomalies. The common "pillars":

- **Freshness**: did the table update when expected?
- **Volume**: did row counts change unusually?
- **Schema**: did columns appear, disappear or change type?
- **Distribution**: did values shift (null rate, averages, categories)?
- **Lineage**: what is upstream and downstream, to find root cause and impact.

Products include **Monte Carlo**, **Bigeye**, **Anomalo** (ML-based anomaly detection), **Metaplane** (acquired by Datadog in 2025), Sifflet, Elementary (dbt-native), and platform features such as Databricks data quality monitoring and Purview data health.

## Benefit
Observability catches the problems nobody wrote a test for (a source silently sending half the rows, a currency field switching units) and shortens time to detect and resolve incidents.

## Compared with
| | Rule-based testing (GX, Soda, dbt tests) | Observability platforms |
|---|---|---|
| Definition | You write each rule | Learned baselines plus rules |
| Coverage | What you anticipated | Broad, including the unexpected |
| Noise | Low if rules are good | Needs tuning to avoid alert fatigue |
| Cost | Mostly compute | Licence plus compute |

## Limits and misconceptions
- Anomaly detection produces false alarms, especially around holidays and business events; tuning and ownership routing are essential.
- Observability detects; it does not fix. Incident processes and data owners are needed.
- Monitoring every table can be expensive in warehouse compute; prioritise important assets.

## Remember this
Data observability watches freshness, volume, schema, distribution and lineage automatically to catch the problems no test anticipated.

## Related
tools-m07-great-expectations, tools-m06-lineage, ml-m06-drift-monitoring, ai-m11-dq-triage-agent


# Data contracts
id: tools-m07-data-contracts
track: tools
verified: 2026-10

## What we're learning
A **data contract** is an explicit, versioned agreement between a data **producer** (an application team, a source system owner) and its **consumers** about a dataset: schema (columns, types, meaning), quality rules, freshness and availability (SLAs), ownership, and how changes are announced.

Contracts are written as files, often in YAML. The **Open Data Contract Standard (ODCS)**, maintained by the Bitol project under LF AI & Data (v3.2 in 2026), is the main open format; **datacontract-cli** can lint contracts, test data against them and export them to dbt, SQL DDL, JSON Schema, Avro and others.

Enforcement happens in several places: CI checks that block breaking schema changes, schema registries for streams, dbt model contracts, quality tests in pipelines (Soda v4 uses contracts natively), and catalogs that publish contracts for discovery.

## Benefit
Contracts move quality upstream: producers learn that a column rename breaks finance reporting before they ship it, instead of the data team discovering it at month end.

## Limits and misconceptions
- A contract nobody enforces is documentation. Automate checks at the producer's CI and at ingestion.
- Contracts need organisational buy-in from producers, which is harder than writing YAML.
- Start with the few datasets where breakage hurts most.

## Remember this
A data contract is an enforced, versioned agreement on schema, quality and ownership between producer and consumers.

## Related
tools-m02-schema-registry, tools-m04-dbt, tools-m07-soda, pyspark-m08-delta-schema-evolution
