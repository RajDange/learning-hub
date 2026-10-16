# Resource monitors and cost control
id: snowflake-m08-resource-monitors-cost
track: snowflake
verified: 2026-10

## What we're learning
Snowflake gives several cost controls:

- **Resource monitors** track **warehouse** credit use over a period against a quota, and can notify, suspend after running queries finish, or suspend immediately at thresholds (for example notify at 80 percent, suspend at 100 percent). They apply only to warehouses, not to serverless features.
- **Budgets** set spending limits with notifications for the whole account or custom groups of objects, including **serverless features and AI functions**, with user-defined actions available since 2026.
- **Warehouse settings**: right size, short auto-suspend for ad hoc warehouses, statement timeouts, maximum cluster counts.
- **Cost management** views in Snowsight and `ACCOUNT_USAGE` and `ORGANIZATION_USAGE` views for detailed analysis, with **object tags** for chargeback.

## Benefit
Credit consumption is visible and bounded, which prevents the classic surprise bill from a forgotten large warehouse or a runaway serverless feature.

## Limits and misconceptions
- Resource monitors do not cover serverless costs (Snowpipe, clustering, search optimisation, AI); use budgets for those.
- Suspending warehouses mid-day stops business work; pair hard limits with alerts and ownership.
- Usage views lag by up to a few hours.

## Remember this
Resource monitors cap warehouse credits, budgets cover everything including serverless and AI, and tags plus usage views enable chargeback.

## Related
snowflake-m01-credits, fabric-m10-capacity-sizing-cost, databricks-m07-dbu-cost-model


# CI/CD and change management for Snowflake
id: snowflake-m08-cicd
track: snowflake
verified: 2026-10

## What we're learning
Options for managing Snowflake objects as code:

- **Git integration**: Snowflake can connect to Git repositories and run files from them.
- **Snowflake CLI** (`snow`): deploy objects, apps and Snowpark code from scripts and CI pipelines.
- **DCM Projects** (declarative change management, GA August 2026): declare the desired state of databases, schemas, tables and other objects; Snowflake computes and applies the changes. Some object types and commands were still preview.
- **dbt Projects on Snowflake**: dbt run natively inside Snowflake.
- **Terraform provider** (stable resources GA from its 2.x line): accounts, warehouses, roles, grants, databases.
- Community tools such as **schemachange** for versioned migration scripts.
- **Zero-copy cloning** to create test environments from production quickly.

## Benefit
Version-controlled, reviewed changes replace manual DDL in production, and clones make realistic testing cheap.

## Limits and misconceptions
- Declarative tools and imperative migration scripts manage state differently; mixing them on the same objects causes drift.
- Data changes and grants need as much care as DDL.
- Cloned production data in test environments carries sensitive data; apply policies.

## Remember this
Manage Snowflake as code with Git, the CLI, DCM Projects, dbt and Terraform, and test changes on zero-copy clones.

## Related
tools-m09-cicd, snowflake-m04-zero-copy-cloning, tools-m04-dbt, tools-m09-terraform


# Snowflake vs Databricks vs Fabric
id: snowflake-m08-vs-databricks-fabric
track: snowflake
verified: 2026-10

## What we're learning
From the Snowflake side (the full comparison lives in the Fabric track), Snowflake tends to fit when:

- The core users are **SQL analysts and engineers** who want a warehouse that needs almost no administration.
- **Data sharing** with partners, subsidiaries or customers, and the Marketplace, are important.
- **Multi-cloud** deployment is needed (AWS, Azure, GCP), including cross-region and cross-cloud replication.
- Strong **workload isolation** and per-second, per-warehouse cost visibility matter.

Snowflake has moved well beyond a warehouse: Snowpark for Python, Iceberg tables for open storage, Cortex AI, Snowflake ML, Openflow for ingestion and a managed PostgreSQL service. It is a weaker fit when heavy Spark-based engineering, custom streaming logic or deep ML research dominate (Databricks) or when the organisation wants Power BI-centric SaaS in Microsoft 365 (Fabric). Combining Snowflake with Fabric (bidirectional Iceberg access is GA) or Databricks (Iceberg REST catalogs) is common.

## Benefit
A clear view of Snowflake's centre of gravity, simplicity, SQL and sharing, helps decide where it should own workloads and where it should interoperate.

## Limits and misconceptions
- Consumption pricing is simple to understand but easy to overspend without governance.
- Classic Snowflake storage is proprietary; Iceberg tables reduce lock-in at some feature cost.

## Remember this
Snowflake fits SQL-first, low-administration, sharing-heavy and multi-cloud needs, and increasingly interoperates through Iceberg.

## Related
fabric-m10-fabric-vs-databricks-vs-snowflake, databricks-m08-when-databricks, snowflake-m08-iceberg-interoperability


# Iceberg interoperability
id: snowflake-m08-iceberg-interoperability
track: snowflake
verified: 2026-10

## What we're learning
Snowflake uses Apache Iceberg to work with other engines in both directions:

- **Other engines reading Snowflake data**: Snowflake-managed Iceberg tables are exposed through the **Horizon Catalog Iceberg REST endpoint** (built on Apache Polaris), so Spark, Trino, Flink or Databricks can read them, and since 2026 write to them, with Snowflake policies enforced.
- **Snowflake reading other platforms' data**: **catalog integrations** connect to external Iceberg REST catalogs, such as AWS Glue, Databricks Unity Catalog and Microsoft OneLake. **Catalog-linked databases** automatically discover and sync the tables in such a catalog. Delta tables can be read through Delta Direct.
- **Microsoft Fabric**: bidirectional Iceberg access between Snowflake and OneLake became GA in January 2026.
- **Snowflake Open Catalog** (managed Apache Polaris) remains for existing customers; new customers are directed to Horizon Catalog.

## Benefit
One copy of data in open storage can be produced by one platform and consumed by another, for example Snowflake tables read by Power BI through OneLake, or Databricks tables queried from Snowflake, without pipelines that copy data.

## Limits and misconceptions
- Interoperability covers the Iceberg feature set both sides support; some Snowflake and Iceberg features do not translate.
- Each platform enforces its own permissions; govern who writes and who is the primary catalog.
- Cross-cloud or cross-region reads add egress cost and latency.

## Remember this
Snowflake shares Iceberg tables through its Horizon REST catalog and reads other platforms' Iceberg catalogs, including Unity Catalog and OneLake.

## Related
tools-m03-format-interoperability, snowflake-m02-iceberg-tables, fabric-m02-delta-in-fabric
