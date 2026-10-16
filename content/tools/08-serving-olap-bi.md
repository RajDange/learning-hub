# ClickHouse
id: tools-m08-clickhouse
track: tools
verified: 2026-10

## What we're learning
**ClickHouse** is an open-source (Apache 2.0) column-oriented **OLAP database** built for very fast aggregations over large volumes of event-style data. Its core is the **MergeTree** family of table engines: data is written in sorted parts that are merged in the background, a sparse primary index on the sort key lets queries skip most data, and variants (ReplacingMergeTree, AggregatingMergeTree, SummingMergeTree) handle deduplication and pre-aggregation. Materialized views transform data as it is inserted.

**ClickHouse Cloud** separates storage (object storage) from compute. Common uses are product analytics, observability (logs, metrics, traces), and user-facing dashboards over billions of rows.

## Benefit
Sub-second SQL aggregations on huge event tables with modest hardware, which is hard to achieve with a general warehouse at the same cost and concurrency.

## Compared with
| | ClickHouse | Cloud warehouse | Eventhouse (Fabric KQL) |
|---|---|---|---|
| Strength | Fast aggregations on events, high concurrency | General SQL analytics, governance | Logs and time series in Fabric |
| Updates and deletes | Limited, asynchronous | Full DML | Limited |
| Joins of large tables | Weaker | Strong | Weaker |
| Query language | SQL | SQL | KQL (and some SQL) |

## Limits and misconceptions
- Not a transactional database: updates and deletes are heavy operations, and there are no multi-statement transactions in the classic sense.
- Schema and sort-key design decide performance; a bad sort key means full scans.
- Large joins and highly normalised models are not its strength; denormalise for ClickHouse.

## Remember this
ClickHouse is a columnar OLAP database whose sorted MergeTree tables make aggregations over billions of events fast.

## Related
tools-m08-druid-pinot, fabric-m05-eventhouse-kql, tools-m04-warehouse-engines


# Apache Druid and Apache Pinot
id: tools-m08-druid-pinot
track: tools
verified: 2026-10

## What we're learning
Two open-source **real-time OLAP** stores built for low-latency queries on fresh event data, often directly from Kafka:

- **Apache Druid**: ingests streams (Kafka, Kinesis) and batches into time-partitioned **segments** with indexes, and serves fast slice-and-dice queries and time-series aggregations with high concurrency. Popular for operational analytics dashboards.
- **Apache Pinot** (from LinkedIn and Uber): designed for **user-facing analytics**, where thousands of end users query at once with millisecond latency (for example "who viewed your profile"). Offers rich indexes, including the **star-tree** index for pre-aggregation, and upserts on real-time tables. **StarTree** sells managed Pinot.

## Benefit
When analytics is part of a product or an operational screen used by many people at once, these stores keep latency low at a concurrency that warehouses are not designed or priced for.

## Limits and misconceptions
- They are serving layers, not general warehouses: limited joins, careful data modelling, and operational complexity (several node types).
- Data usually needs pre-processing and denormalisation before ingestion.
- For internal BI with modest concurrency, a warehouse, ClickHouse or Fabric's Eventhouse is usually simpler.

## Remember this
Druid and Pinot serve fresh event data to many concurrent users with millisecond latency; Pinot leans to user-facing analytics.

## Related
tools-m08-clickhouse, tools-m02-kafka, fabric-m10-when-not-fabric


# Power BI
id: tools-m08-power-bi
track: tools
verified: 2026-10

## What we're learning
**Power BI** is Microsoft's business intelligence tool:
- **Power BI Desktop** (free, Windows) to model data and build reports.
- The **Power BI service**, now a workload inside Microsoft Fabric, to publish, share, refresh and govern content.
- **Semantic models** (tables, relationships, DAX measures, row-level security) with Import, DirectQuery, Direct Lake and composite storage modes.
- Reports, dashboards, paginated reports, apps, Excel integration and Copilot.

Licensing combines per-user licences (Pro, Premium Per User) and capacity (Fabric F SKUs; legacy Premium P SKUs are being retired). A source-control-friendly report format (PBIR) and Git integration support development workflows.

## Benefit
Power BI is the default BI tool in Microsoft-centred organisations: strong modelling (DAX and VertiPaq), deep Microsoft 365 and Entra ID integration, and, inside Fabric, direct access to OneLake through Direct Lake.

## Compared with
| | Power BI | Tableau |
|---|---|---|
| Ecosystem | Microsoft (Fabric, 365, Entra) | Salesforce (Data Cloud, CRM) |
| Modelling | Strong semantic models, DAX | Visual exploration first; semantic layer growing |
| Authoring | Desktop on Windows, web | Desktop on Windows and macOS, web |
| Licensing | Per user plus Fabric capacity | Per user roles (Creator, Explorer, Viewer) |

## Limits and misconceptions
- DAX is powerful but hard; poor models lead to slow, wrong reports.
- Self-service without governance produces many conflicting models; certification and shared models are needed.
- Desktop is Windows-only.

## Remember this
Power BI pairs a strong semantic model engine with Microsoft's ecosystem, and inside Fabric reads OneLake directly.

## Related
fabric-m07-semantic-models, fabric-m07-direct-lake, tools-m08-tableau, tools-m08-semantic-layers


# Tableau
id: tools-m08-tableau
track: tools
verified: 2026-10

## What we're learning
**Tableau** is a visual analytics platform, part of **Salesforce** since 2019. Products: **Tableau Desktop** (authoring), **Tableau Cloud** (SaaS) and **Tableau Server** (self-managed), plus Tableau Prep for data preparation. Its strength is fast, flexible visual exploration: drag fields to build charts, with a powerful calculation and level-of-detail expression language. **Tableau Next** (2025) is an agentic analytics product on Salesforce's platform with a semantic layer (Tableau Semantics) and AI agents. With Salesforce now owning Informatica as well, Tableau sits in a broader Salesforce data stack.

## Benefit
Excellent for exploratory analysis and polished visual storytelling, platform-neutral across warehouses, and well established in organisations using Salesforce.

## Limits and misconceptions
- Governance and semantic consistency need deliberate design (published data sources, certified content).
- Licensing per role can be costly at scale.
- In Microsoft-centred estates, Power BI's integration with Fabric often wins on cost and convenience; in Salesforce-centred ones, Tableau's does.

## Remember this
Tableau is Salesforce's visual analytics platform, strongest at exploration, with Tableau Next adding semantics and AI agents.

## Related
tools-m08-power-bi, tools-m08-semantic-layers


# Semantic layers and metrics stores
id: tools-m08-semantic-layers
track: tools
verified: 2026-10

## What we're learning
A **semantic layer** defines business concepts (metrics such as revenue or active customers, dimensions, joins, filters) **once**, in one place, and exposes them to every consumer: BI tools, notebooks, applications and, increasingly, AI assistants. Without it, each report re-implements "revenue" slightly differently.

Options:
- **BI-embedded**: Power BI semantic models, Tableau published data sources and Tableau Semantics, Looker's LookML.
- **Platform-native**: Databricks metric views, Snowflake semantic views.
- **Universal (tool-independent)**: the **dbt Semantic Layer** powered by **MetricFlow** (open-sourced in 2025), **Cube** (open-source core plus cloud, with caching and APIs), **AtScale**.
- **Standards**: the **Open Semantic Interchange** initiative, launched in 2025 by Snowflake, dbt Labs, Salesforce and others, entered the Apache Incubator in 2026 as **Apache Ossie**, aiming for a vendor-neutral YAML format for semantic models.

## Benefit
One definition of each metric gives consistent numbers across tools and makes natural-language analytics (text-to-SQL, Genie, data agents) far more accurate, because the AI queries governed metrics instead of guessing joins.

## Limits and misconceptions
- A semantic layer adds another component to govern; if most consumption is one BI tool, its model may be enough.
- Universal layers depend on BI tools supporting their APIs; support varies.
- The standards are young; expect conversion between formats rather than true portability for now.

## Remember this
A semantic layer defines metrics once for every tool and for AI; it lives in the BI tool, the platform, or a universal layer.

## Related
fabric-m07-semantic-models, tools-m04-dbt, ai-m11-text-to-sql-assistant, databricks-m05-genie
