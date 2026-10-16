# Lakehouse vs Warehouse (and Eventhouse)
id: fabric-m10-lakehouse-vs-warehouse
track: fabric
verified: 2026-10

## What we're learning
Fabric offers several stores that all keep data in OneLake. Microsoft's decision guide frames the choice by **team skills** and **workload**:

- **Lakehouse**: Spark and Python people; all data shapes (files, semi-structured, tables); data engineering and data science. Read-only SQL through the endpoint.
- **Warehouse**: T-SQL people; star-schema enterprise warehousing; stored-procedure ELT; **multi-table transactions** and full DML in SQL.
- **Eventhouse**: streaming, logs and time-series data with high ingestion rates and KQL queries.
- **SQL database in Fabric**: operational (OLTP) workloads and apps, on the Azure SQL engine, mirrored to OneLake automatically.

Because all of them write Delta to OneLake, the choice is not exclusive. A common pattern is **lakehouse for bronze and silver** (Spark ingestion and cleaning) and **warehouse or lakehouse for gold**, depending on who maintains the final model.

## Benefit
Choosing by skills and write pattern, not by fashion, keeps teams productive and avoids rebuilding later.

## Compared with
| Need | Lakehouse | Warehouse | Eventhouse |
|---|---|---|---|
| Main language | PySpark, Spark SQL | T-SQL | KQL |
| Write through SQL | No (read-only endpoint) | Yes | Limited |
| Multi-table transactions | No | Yes | No |
| Unstructured files | Yes | No | No |
| High-rate streaming | Possible with Spark | No | Yes |

## Limits and misconceptions
- "Warehouse is faster" or "lakehouse is cheaper" are not reliable rules; both run on the same capacity and engines tuned for different access patterns.
- Mixing is fine, but each extra store adds security rules to maintain. Decide where each layer lives and keep to it.

## Remember this
Pick the Lakehouse for Spark teams and all data shapes, the Warehouse for T-SQL teams needing transactions, and the Eventhouse for streaming and time series.

## Related
fabric-m02-lakehouse, fabric-m02-warehouse, fabric-m05-eventhouse-kql, pyspark-m08-medallion


# Fabric vs Databricks vs Snowflake
id: fabric-m10-fabric-vs-databricks-vs-snowflake
track: fabric
verified: 2026-10

## What we're learning
The three platforms overlap heavily: all offer lakehouse-style storage on open formats, SQL warehousing, Spark or Spark-like processing, ML and AI features, and governance. They differ in **centre of gravity**:

- **Microsoft Fabric**: SaaS, capacity-based pricing, Power BI built in, deep Microsoft 365 and Purview integration. Strongest when the organisation is Microsoft-centred and BI is the main consumer.
- **Databricks**: Spark-native lakehouse with Unity Catalog, strong data engineering, streaming and ML or AI tooling, running on AWS, Azure or GCP. Strongest for engineering-heavy and ML-heavy teams that want control.
- **Snowflake**: SQL-first managed warehouse with near-zero administration, strong data sharing and a marketplace, extended with Snowpark, Iceberg tables and Cortex AI. Strongest for SQL-centric analytics and data sharing.

Many organisations combine them: Databricks or Snowflake as the engineering or warehouse core, with Fabric and Power BI for reporting through mirroring or shortcuts.

## Benefit
A clear view of each platform's strengths keeps the decision about fit, skills and operating model rather than feature checklists, which change monthly.

## Compared with
| | Fabric | Databricks | Snowflake |
|---|---|---|---|
| Delivery | SaaS | Managed PaaS, serverless options | SaaS |
| Pricing | Capacity (CU), always-on unless paused | DBUs per use plus cloud costs | Credits per use plus storage |
| Native table format | Delta (Iceberg via virtualization) | Delta (Iceberg via UniForm and managed Iceberg) | Snowflake tables and Iceberg tables |
| Main languages | T-SQL, PySpark, KQL, DAX | PySpark, SQL, Scala | SQL, Python via Snowpark |
| Governance | OneLake catalog, Purview | Unity Catalog | Horizon features |
| BI | Power BI built in | AI/BI dashboards, external BI | External BI |
| Clouds | Azure | AWS, Azure, GCP | AWS, Azure, GCP |

## Limits and misconceptions
- Benchmarks published by vendors favour the vendor. Test with your own workloads.
- Capacity pricing (Fabric) and consumption pricing (Databricks, Snowflake) make cost comparisons tricky: idle capacity costs money, but so does unbounded consumption.
- Feature gaps close quickly; re-evaluate yearly rather than relying on old comparisons.

## Remember this
Fabric centres on Microsoft and BI, Databricks on engineering and ML, Snowflake on SQL and sharing, and many estates combine them.

## Related
databricks-m08-when-databricks, snowflake-m08-vs-databricks-fabric, fabric-m10-when-not-fabric, tools-m04-warehouse-engines


# Capacity sizing and cost
id: fabric-m10-capacity-sizing-cost
track: fabric
verified: 2026-10

## What we're learning
Sizing a Fabric capacity is iterative:

1. **Estimate**: Microsoft's **Fabric SKU Estimator** (preview) takes data volume, batch cycles, workloads and users and suggests a SKU.
2. **Prove**: run representative workloads on a trial or pay-as-you-go capacity and watch the **Capacity Metrics app** for CU use, smoothing and throttling.
3. **Separate**: put workloads with different risk on different capacities, for example production reporting apart from development and ad hoc Spark.
4. **Commit**: buy **reservations** for the steady base (1 or 3 years), keep pay-as-you-go or pausable capacities for variable needs.
5. **Govern**: use surge protection, capacity overage settings, workspace assignment rules and the Chargeback app.

Licensing interacts with size: below **F64**, every report viewer needs a Pro or PPU licence, so a smaller capacity can cost more in total when there are many viewers.

## Benefit
Right-sizing avoids both throttled users and paying for idle capacity, which are the two most common Fabric cost complaints.

## Limits and misconceptions
- The estimator is an estimate; Microsoft says to validate with real workloads.
- Smoothing makes background jobs look cheap in the moment and expensive 24 hours later. Look at the smoothed usage, not just peaks.
- Storage in OneLake is billed separately, as is mirroring beyond its free allowance.
- Pausing saves money only for capacities not needed by scheduled jobs or report users.

## Remember this
Estimate, prove with the Metrics app, separate risky workloads, reserve the base, and remember viewer licences below F64.

## Related
fabric-m01-licensing-capacity, fabric-m08-auditing-monitoring, databricks-m07-dbu-cost-model, snowflake-m08-resource-monitors-cost


# Migrating from legacy platforms to Fabric
id: fabric-m10-migrating-from-legacy
track: fabric
verified: 2026-10

## What we're learning
Typical sources and the Fabric tooling for each:

- **SQL Server, Synapse dedicated SQL pools (and Teradata metadata, preview)** to **Warehouse**: the **Migration Assistant for Fabric Data Warehouse** imports a DACPAC, SQL scripts or a live connection, translates schema, code and security, flags problems (with Copilot help to fix them), and moves data with Copy job. Unsupported features (for example triggers, some function types) need redesign.
- **Azure Data Factory and Synapse pipelines** to **Fabric pipelines**: an upgrade experience (preview) and a PowerShell module convert pipelines; ADF can also be "mounted" in Fabric unchanged. SSIS packages have no direct home.
- **Synapse Spark** to **Fabric Spark**: a Spark migration assistant moves notebooks, job definitions and pools.
- **Operational databases** to **mirroring**, and **on-premises systems** through gateways with Copy job.
- **Power BI Premium** to **F SKU** capacities by reassigning workspaces.

The steps around the tools matter as much: inventory and lineage of what exists, a target design (stores, workspaces, domains, security), parallel running with **reconciliation**, and a planned cutover.

## Benefit
A deliberate migration reuses what translates directly and redesigns what does not, instead of copying old problems into a new platform.

## Limits and misconceptions
- Tools translate code, not intent. Performance tuning, security models and orchestration often need redesign.
- Validate numbers: run old and new in parallel and reconcile counts and totals before switching consumers.
- Watch Fabric constraints that may block a lift-and-shift: Warehouse T-SQL gaps, Private Link limitations, and region availability.

## Remember this
Fabric's assistants translate code and schema, but a migration still needs a target design, parallel running and reconciliation.

## Related
pyspark-m13-backfill-cutover, sql-m12-reconciliation, fabric-m01-fabric-vs-synapse-adf-premium, sql-m12-dialect-translation


# When not to use Fabric
id: fabric-m10-when-not-fabric
track: fabric
verified: 2026-10

## What we're learning
Fabric is not the best answer everywhere. Consider alternatives when:

- **Strict network isolation is mandatory**: with tenant-level Private Link or blocked public access, several features stop working (starter pools, the on-premises gateway, Copilot, some exports, the Govern tab, Capacity Metrics app, Purview scanning, trial capacities). Check the current list against your requirements.
- **You need deep infrastructure control**: custom cluster images, specific VM types, fine-grained networking per job. PaaS services such as Databricks or self-managed Spark give more control.
- **You are multi-cloud by policy**: Fabric runs on Azure; Databricks and Snowflake run on several clouds.
- **The workload is tiny**: a few small databases and reports may be cheaper with Power BI Pro and an Azure SQL database, or DuckDB on a laptop.
- **You need low-latency serving or OLTP at scale**: user-facing APIs and high-concurrency serving belong in operational databases or real-time OLAP engines.
- **A feature you depend on is still preview**: regulated production workloads may need GA support.
- **Your region is not supported** for the workloads you need.

## Benefit
Knowing the limits early prevents a platform decision from failing late in a project, and keeps Fabric for the problems it solves well.

## Limits and misconceptions
- This list changes with every monthly release; treat it as questions to ask, not permanent truths.
- "Not Fabric" for one workload does not mean "not Fabric" for the organisation. Mixed architectures are normal.

## Remember this
Avoid or limit Fabric where strict network isolation, multi-cloud, infrastructure control, tiny scale or low-latency serving dominate.

## Related
fabric-m10-fabric-vs-databricks-vs-snowflake, fabric-m03-gateways, tools-m08-druid-pinot, fabric-m10-capacity-sizing-cost
