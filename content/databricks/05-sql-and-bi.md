# SQL warehouses
id: databricks-m05-sql-warehouses
track: databricks
verified: 2026-10

## What we're learning
A **SQL warehouse** is Databricks compute dedicated to SQL: the SQL editor, dashboards, Genie, BI tools (Power BI, Tableau) and JDBC/ODBC clients. Three types:

- **Serverless**: starts in seconds, uses Photon, predictive I/O and intelligent workload management to queue and scale quickly. Recommended default.
- **Pro**: in your cloud account, with Photon and predictive I/O, but slower start (minutes) and less automatic scaling.
- **Classic**: the most basic type.

Sizes run from 2X-Small upward; **scaling** adds clusters for concurrency (classic and pro use a min and max cluster count; serverless scales automatically). Size up when single queries spill or run long; scale out when queries queue.

## Benefit
SQL users get warehouse-like performance on lakehouse tables governed by Unity Catalog, without moving data into a separate warehouse.

## Compared with
| | Databricks SQL warehouse | Snowflake virtual warehouse | Fabric Warehouse |
|---|---|---|---|
| Storage | Delta/Iceberg in your lake | Snowflake storage or Iceberg | Delta in OneLake |
| Start | Seconds (serverless) | Seconds | Always available on capacity |
| Billing | DBUs per second | Credits per second | Capacity units |

## Limits and misconceptions
- The UI creates serverless warehouses by default, but the API defaults to classic; check automation scripts.
- Idle warehouses cost money until auto-stop; set short auto-stop for ad hoc use.
- Performance still depends on table layout (clustering, file sizes).

## Remember this
SQL warehouses are Databricks' SQL compute for BI; prefer serverless, scale up for heavy queries and out for concurrency.

## Related
snowflake-m01-virtual-warehouses, databricks-m01-photon, tools-m04-warehouse-engines


# AI/BI dashboards
id: databricks-m05-dashboards
track: databricks
verified: 2026-10

## What we're learning
**AI/BI dashboards** are Databricks' built-in dashboards: datasets defined by SQL over Unity Catalog tables, visualisations (with AI help to create charts), filters and cross-filtering, schedules and subscriptions, and embedding. Dashboards can be published with the publisher's credentials or each viewer's own, shared with account users who do not use the workspace, and managed in Git and bundles.

## Benefit
Quick, governed dashboards next to the data, without a separate BI licence or extract, useful for engineering metrics, operational views and simple business reporting.

## Compared with
| | AI/BI dashboards | Power BI / Tableau |
|---|---|---|
| Modelling | SQL datasets, metric views | Rich semantic models |
| Licensing | Included with Databricks compute | Separate BI licences |
| Enterprise BI features | Growing | Mature (paginated reports, apps, wide distribution) |

## Limits and misconceptions
- Not a full replacement for an enterprise BI platform with complex models, row-level security in the model and broad distribution.
- Each dashboard query runs on a SQL warehouse; popular dashboards need warehouse sizing and caching.

## Remember this
AI/BI dashboards give quick governed dashboards on Databricks; enterprise BI still often lives in Power BI or Tableau.

## Related
databricks-m05-sql-warehouses, tools-m08-power-bi, databricks-m05-genie


# Genie and natural-language analytics
id: databricks-m05-genie
track: databricks
verified: 2026-10

## What we're learning
**Genie** is Databricks' natural-language analytics. Business users ask questions in plain language and Genie generates SQL over curated data, returns answers, tables and charts, and shows the SQL it ran. In 2026 Databricks renamed **Genie spaces** to **Genie agents** and the business-user interface (formerly Databricks One) to **Genie One**; the coding assistant became **Genie Code**.

A Genie agent is curated by a data team: up to a limited number of tables, views or **metric views**, plus instructions, example SQL queries and benchmark questions to measure accuracy. It runs on a pro or serverless SQL warehouse and respects Unity Catalog permissions. A conversation API lets other apps use it.

## Benefit
Self-service answers for business users on governed data, with the data team controlling scope and definitions instead of every user writing their own SQL.

## Limits and misconceptions
- Accuracy depends on curation: clear table and column descriptions, metric views and example queries matter more than the model.
- Generated SQL can be wrong while looking plausible; benchmarks and review of common questions are essential.
- Billing and naming changed in 2026 (Databricks announced no charge for Genie One and Genie agents until early 2027); check current terms.

## Remember this
Genie answers business questions by generating SQL over a curated, governed set of tables and metrics; curation decides accuracy.

## Related
ai-m09-text-to-sql, tools-m08-semantic-layers, fabric-m06-copilot-ai-features, ai-m11-text-to-sql-assistant
