# When Databricks is the right choice
id: databricks-m08-when-databricks
track: databricks
verified: 2026-10

## What we're learning
Seen from the Databricks side (the full three-way comparison is in the Fabric track), Databricks tends to fit when:

- **Engineering and data science are central**: complex Spark pipelines, streaming, ML training and AI applications, with teams comfortable in Python and code.
- **Multi-cloud or non-Azure clouds** are required: Databricks runs on AWS, Azure and GCP with the same platform.
- **Open formats and control** matter: Delta and Iceberg in your own storage, Unity Catalog with open APIs, configurable classic compute when needed.
- **Unified governance across data and AI**: tables, files, models, features and agents in one catalog with lineage.

It is a weaker fit when the organisation is mostly SQL analysts and Power BI users on Microsoft 365, where Fabric's SaaS integration may be simpler, or when the need is a low-administration SQL warehouse with heavy data sharing, where Snowflake is strong. Combinations are common: Databricks for engineering with Power BI or Fabric for reporting (through mirroring of Unity Catalog or Direct Lake via shortcuts).

## Benefit
Framing the choice around team skills and workload type, rather than feature lists, leads to decisions that survive the next round of product announcements.

## Limits and misconceptions
- Databricks also offers SQL warehousing, dashboards and natural-language analytics; it is not only for engineers, but its centre of gravity is code.
- Total cost depends on discipline: autoscaling and serverless make it easy to spend more.

## Remember this
Choose Databricks when code-heavy engineering, streaming, ML and AI on open formats across clouds are central.

## Related
fabric-m10-fabric-vs-databricks-vs-snowflake, snowflake-m08-vs-databricks-fabric, databricks-m08-serverless-vs-classic


# Serverless vs classic compute
id: databricks-m08-serverless-vs-classic
track: databricks
verified: 2026-10

## What we're learning
Databricks increasingly defaults to serverless. The trade-offs:

**Serverless** (notebooks, jobs, pipelines, SQL warehouses):
- Starts in seconds (SQL) or quickly (jobs), scales automatically, upgrades automatically, Photon always on.
- No VMs, networks or images to manage; the DBU price includes infrastructure.
- Limits: no R, RDD API or Scala notebooks, limited Spark settings, no init scripts, Spark Connect-based APIs only, and networking to private sources through Databricks-managed configurations.

**Classic** (configured clusters):
- Full control of node types, GPUs, runtime version, libraries, init scripts and Spark settings.
- Runs in your own network, with your own private connectivity patterns.
- You manage sizing, idle time and upgrades, and pay the cloud VM bill separately.

## Benefit
Choosing per workload (serverless for most notebooks, jobs and BI; classic for special libraries, GPUs, legacy RDD code or strict network designs) gives fast start-up and low admin without losing flexibility where it matters.

## Compared with
| | Serverless | Classic |
|---|---|---|
| Start time | Seconds to a few minutes | Minutes (faster with pools) |
| Configuration | Minimal | Full |
| Network | Databricks-managed, with private options | Your VNet or VPC |
| Billing | DBUs incl. infrastructure | DBUs + cloud VMs |
| Code limits | Spark Connect APIs only | Everything, depending on access mode |

## Limits and misconceptions
- Serverless is not always cheaper; long, steady, well-sized jobs can cost less on classic job compute. Measure.
- Moving legacy code to serverless often requires removing RDD and `sparkContext` usage.

## Remember this
Serverless trades configuration for speed and no infrastructure work; keep classic for code, networking or hardware that serverless cannot handle.

## Related
databricks-m01-compute-types, pyspark-m14-spark-connect, databricks-m07-dbu-cost-model


# Governance patterns on Databricks
id: databricks-m08-governance-patterns
track: databricks
verified: 2026-10

## What we're learning
Common Unity Catalog patterns used by organisations in 2026:

- **Catalog per environment** (`dev`, `test`, `prod`), sometimes combined with **catalog per domain** (`finance_prod`, `sales_prod`), with schemas for layers or data products.
- **Workspace-catalog binding**: production catalogs bound to production workspaces only, or bound read-only to development workspaces so developers can test against real data without writing to it.
- **Managed tables by default**, so predictive optimization and automatic features apply, with external locations only for data that must live elsewhere.
- **Groups and service principals**, never individuals, in grants; ownership of catalogs and schemas by groups.
- **ABAC with governed tags** for sensitive data (personal data, financial data) instead of per-table row filters and masks.
- **Delta Sharing** (OpenSharing) and federation for data used across business units or organisations, rather than copies.
- **System tables** for audit, lineage and cost reporting per domain.

## Benefit
These patterns give domain teams autonomy within guardrails, which is the data mesh idea implemented with platform features.

## Limits and misconceptions
- Catalog design is hard to change later; involve domain owners early.
- Too many catalogs and schemas with inconsistent naming make discovery worse; publish conventions.
- Governance is also process: owners, certification, access reviews.

## Remember this
Separate catalogs by environment and domain, bind them to the right workspaces, prefer managed tables, grant to groups, and protect sensitive data with tag-based policies.

## Related
databricks-m02-unity-catalog-overview, databricks-m02-privileges, fabric-m08-domains, databricks-m03-medallion-on-databricks
