# Track: fabric — Microsoft Fabric

> Concept-only. No code. Governance and security get extra depth.

## fabric-m01 — Fundamentals
- fabric-m01-what-is-fabric | What Microsoft Fabric is | The SaaS analytics platform, its workloads (experiences) and items, and what "SaaS" means here | code: no | related: fabric-m01-onelake, fabric-m10-fabric-vs-databricks-vs-snowflake
- fabric-m01-onelake | OneLake | One logical lake per tenant, Delta as the common format, OneLake file explorer and ABFS paths | code: no | related: fabric-m02-shortcuts, pyspark-m08-delta-lake, tools-m03-object-storage
- fabric-m01-tenants-capacities-workspaces | Tenants, capacities and workspaces | The containment hierarchy: tenant, capacity, workspace, item; regions and how they relate | code: no | related: fabric-m01-licensing-capacity, fabric-m08-domains
- fabric-m01-licensing-capacity | Licensing and capacity units | F SKUs, capacity units, per-user licences, bursting, smoothing and throttling, pause and resume | code: no | related: fabric-m10-capacity-sizing-cost, fabric-m08-auditing-monitoring
- fabric-m01-fabric-vs-synapse-adf-premium | Fabric vs Synapse, ADF and Power BI Premium | What Fabric absorbed from earlier Azure services and what changed | code: no | related: fabric-m10-migrating-from-legacy, tools-m01-azure-data-factory

## fabric-m02 — Storage
- fabric-m02-lakehouse | Lakehouse | Files and Tables areas, Delta tables, Spark-first item with an automatic SQL endpoint | code: no | related: fabric-m02-sql-analytics-endpoint, fabric-m10-lakehouse-vs-warehouse, pyspark-m08-medallion
- fabric-m02-warehouse | Warehouse | T-SQL first item with full DML, multi-table transactions, Delta storage in OneLake | code: no | related: fabric-m10-lakehouse-vs-warehouse, fabric-m08-sql-granular-security
- fabric-m02-sql-analytics-endpoint | SQL analytics endpoint | Read-only T-SQL view over Lakehouse Delta tables, metadata sync, what it cannot do | code: no | related: fabric-m02-lakehouse, fabric-m02-warehouse
- fabric-m02-shortcuts | Shortcuts | Virtual links to data in OneLake, ADLS, S3, GCS and others without copying; security and caching | code: no | related: fabric-m01-onelake, fabric-m02-mirroring
- fabric-m02-mirroring | Mirroring | Near real-time replication of operational databases into OneLake as Delta; database, metadata and open mirroring (verify) | code: no | related: tools-m01-ingestion-styles, tools-m01-debezium
- fabric-m02-delta-in-fabric | Delta format in Fabric | Why every engine reads Delta, V-Order, table maintenance and Iceberg interoperability (verify) | code: no | related: pyspark-m08-delta-lake, pyspark-m08-delta-optimize-clustering, tools-m03-format-interoperability

## fabric-m03 — Data integration
- fabric-m03-pipelines | Data Factory pipelines | Orchestration activities, copy activity, control flow, triggers and how they compare to ADF | code: no | related: tools-m05-adf-fabric-pipelines, fabric-m03-copy-job
- fabric-m03-dataflows-gen2 | Dataflows Gen2 | Power Query low-code transformation, output destinations, when it fits and its cost profile | code: no | related: fabric-m03-pipelines
- fabric-m03-copy-job | Copy job | Simplified bulk and incremental copy, when to use it instead of a pipeline (verify) | code: no | related: fabric-m03-pipelines, pyspark-m13-incremental-loads
- fabric-m03-gateways | On-premises and VNet data gateways | How Fabric reaches data behind a firewall and which items can use which gateway | code: no | related: fabric-m10-migrating-from-legacy

## fabric-m04 — Data engineering
- fabric-m04-notebooks | Notebooks in Fabric | Spark notebooks, default lakehouse, notebookutils, scheduling and pipeline use | code: no | related: pyspark-m01-sparksession, fabric-m04-spark-pools
- fabric-m04-spark-pools | Spark pools, environments and runtimes | Starter pools, custom pools, environments for libraries and settings, Fabric runtime versions | code: no | related: pyspark-m10-managed-platforms, pyspark-m10-dynamic-allocation
- fabric-m04-spark-job-definitions | Spark job definitions | Running packaged Spark code as a Fabric item, versus notebooks | code: no | related: pyspark-m10-spark-submit, pyspark-m12-packaging-config
- fabric-m04-spark-performance-features | Spark performance features in Fabric | Native execution engine, autotune, high concurrency and session sharing (verify) | code: no | related: pyspark-m07-catalyst-and-tungsten, pyspark-m07-aqe

## fabric-m05 — Real-Time Intelligence
- fabric-m05-rti-overview | Real-Time Intelligence overview | The Real-Time hub and how the pieces fit; when to use each item | code: no | related: tools-m01-ingestion-styles, pyspark-m09-streaming-model
- fabric-m05-eventstreams | Eventstreams | No-code event ingestion and routing from sources to destinations, with simple transforms | code: no | related: tools-m02-event-hubs, tools-m02-kafka
- fabric-m05-eventhouse-kql | Eventhouse and KQL databases | Time-series and log-optimised storage and Kusto Query Language; OneLake availability | code: no | related: fabric-m05-real-time-dashboards, tools-m08-clickhouse
- fabric-m05-activator | Activator | Rules on streaming or report data that trigger alerts and actions | code: no | related: fabric-m05-eventstreams
- fabric-m05-real-time-dashboards | Real-time dashboards | KQL-backed dashboards versus Power BI reports for live data | code: no | related: fabric-m07-reports, fabric-m05-eventhouse-kql

## fabric-m06 — Data science and AI
- fabric-m06-experiments-models | Experiments and ML models | MLflow-backed experiment and model items, PREDICT for batch scoring | code: no | related: ml-m06-experiment-tracking, ml-m06-model-registry, tools-m10-mlflow
- fabric-m06-automl | AutoML and ML tooling in Fabric | Low-code AutoML and the data science tooling around it (verify) | code: no | related: ml-m04-hyperparameter-tuning
- fabric-m06-copilot-ai-features | Copilot and AI features | Copilot across workloads, data agents and AI functions; capacity requirements (verify) | code: no | related: ai-m09-platform-ai-features, ai-m09-text-to-sql

## fabric-m07 — BI
- fabric-m07-semantic-models | Semantic models | The star-schema model behind Power BI reports; storage modes and why the model matters | code: no | related: tools-m08-semantic-layers, fabric-m07-direct-lake
- fabric-m07-direct-lake | Direct Lake | Reading Delta tables in OneLake directly into the VertiPaq engine; framing and fallback | code: no | related: fabric-m07-semantic-models, fabric-m02-delta-in-fabric
- fabric-m07-reports | Reports, dashboards and apps | Power BI reports in Fabric, distribution through apps, paginated reports | code: no | related: tools-m08-power-bi, fabric-m09-deployment-pipelines

## fabric-m08 — Governance and security
- fabric-m08-governance-overview | Governance model in Fabric | Admin roles and layers of control: tenant, domain, capacity, workspace, item, data | code: no | related: fabric-m08-tenant-settings, fabric-m08-domains
- fabric-m08-tenant-settings | Tenant settings and admin portal | What tenant settings control, delegation to domains and capacities, settings that matter for governance | code: no | related: fabric-m08-governance-overview
- fabric-m08-domains | Domains | Grouping workspaces by business area for federated governance and data mesh | code: no | related: fabric-m08-governance-overview, tools-m06-catalogs-explained
- fabric-m08-workspace-roles | Workspace roles | Admin, Member, Contributor, Viewer and what each can do | code: no | related: fabric-m08-item-permissions
- fabric-m08-item-permissions | Item permissions and sharing | Sharing single items, Read, ReadData, ReadAll, Build and similar permissions (verify) | code: no | related: fabric-m08-workspace-roles, fabric-m08-onelake-security
- fabric-m08-onelake-security | OneLake security | Role-based access to folders and tables in OneLake enforced across engines (verify) | code: no | related: fabric-m08-sql-granular-security, fabric-m02-shortcuts
- fabric-m08-sql-granular-security | Row, column and object level security | RLS, CLS, OLS and dynamic data masking in Warehouse, SQL endpoint and semantic models | code: no | related: fabric-m08-onelake-security, snowflake-m06-row-access-policies
- fabric-m08-sensitivity-labels | Sensitivity labels and DLP | Microsoft Purview Information Protection labels in Fabric, inheritance, data loss prevention policies | code: no | related: fabric-m08-purview-integration
- fabric-m08-purview-integration | Microsoft Purview and the OneLake catalog | Fabric's own catalog and how Purview scans and governs Fabric (verify) | code: no | related: tools-m06-purview, fabric-m08-lineage-impact
- fabric-m08-lineage-impact | Lineage and impact analysis | Workspace lineage view, item-level impact analysis, limits of built-in lineage | code: no | related: tools-m06-lineage, pyspark-m11-data-lineage
- fabric-m08-endorsement | Endorsement | Promoted, certified and master data labels and who can apply them (verify) | code: no | related: fabric-m08-purview-integration
- fabric-m08-auditing-monitoring | Auditing and monitoring | Audit logs, the admin monitoring workspace, the Capacity Metrics app and the monitoring hub | code: no | related: fabric-m01-licensing-capacity, databricks-m02-system-tables

## fabric-m09 — ALM and DevOps
- fabric-m09-git-integration | Git integration | Connecting workspaces to Azure DevOps or GitHub, what is source controlled, branching patterns | code: no | related: fabric-m09-deployment-pipelines, tools-m09-cicd
- fabric-m09-deployment-pipelines | Deployment pipelines | Promoting content through development, test and production stages, deployment rules | code: no | related: fabric-m09-git-integration
- fabric-m09-apis-automation | REST APIs and automation | Fabric REST APIs, service principals, CLI and CI/CD tooling concepts (verify) | code: no | related: fabric-m09-git-integration, databricks-m07-asset-bundles

## fabric-m10 — Decisions
- fabric-m10-lakehouse-vs-warehouse | Lakehouse vs Warehouse (and Eventhouse) | Choosing the store by skills, workload, write patterns and security needs | code: no | related: fabric-m02-lakehouse, fabric-m02-warehouse, fabric-m05-eventhouse-kql
- fabric-m10-fabric-vs-databricks-vs-snowflake | Fabric vs Databricks vs Snowflake | Strengths, trade-offs and common combinations of the three platforms | code: no | related: databricks-m08-when-databricks, snowflake-m08-vs-databricks-fabric
- fabric-m10-capacity-sizing-cost | Capacity sizing and cost | Estimating capacity, separating workloads, reservations, monitoring consumption | code: no | related: fabric-m01-licensing-capacity, fabric-m08-auditing-monitoring
- fabric-m10-migrating-from-legacy | Migrating from legacy platforms to Fabric | Paths from SQL Server, Synapse, ADF, on-prem ETL and Power BI Premium | code: no | related: pyspark-m13-backfill-cutover, sql-m12-reconciliation
- fabric-m10-when-not-fabric | When not to use Fabric | Situations where another platform or a simpler tool is the better choice | code: no | related: fabric-m10-fabric-vs-databricks-vs-snowflake
