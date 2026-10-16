# Track: databricks — Databricks

> Concept-only. No code. Product names change often here; check current names when writing.

## databricks-m01 — Platform
- databricks-m01-control-data-plane | Control plane and compute plane | What Databricks runs and what runs in your cloud account; serverless compute plane | code: no | related: databricks-m01-accounts-workspaces
- databricks-m01-accounts-workspaces | Accounts and workspaces | Account console, workspaces, regions, identity federation | code: no | related: databricks-m02-unity-catalog-overview
- databricks-m01-compute-types | Compute types | All-purpose, jobs, serverless and SQL warehouse compute, and what each is for | code: no | related: databricks-m08-serverless-vs-classic, pyspark-m10-managed-platforms
- databricks-m01-runtimes | Databricks Runtime | Runtime versions, LTS, ML runtime, and how they map to Spark versions | code: no | related: databricks-m01-compute-types
- databricks-m01-photon | Photon | The native vectorised engine, what it accelerates and when it does not help | code: no | related: pyspark-m07-catalyst-and-tungsten, fabric-m04-spark-performance-features

## databricks-m02 — Unity Catalog
- databricks-m02-unity-catalog-overview | Unity Catalog: metastore, catalogs and schemas | The three-level namespace and the objects UC governs | code: no | related: pyspark-m05-catalog-tables, tools-m06-unity-catalog
- databricks-m02-privileges | Privileges and ownership | Grants, inheritance, ownership, row filters and column masks | code: no | related: pyspark-m11-masking-security-auditing, snowflake-m06-rbac
- databricks-m02-lineage | Lineage in Unity Catalog | Automatic table and column lineage and its limits | code: no | related: tools-m06-lineage
- databricks-m02-volumes | Volumes | Governed storage for non-tabular files | code: no | related: databricks-m02-external-locations
- databricks-m02-external-locations | Storage credentials and external locations | How UC reaches cloud storage, managed versus external tables | code: no | related: tools-m03-object-storage
- databricks-m02-system-tables | System tables | Audit, billing, lineage and compute data as queryable tables | code: no | related: databricks-m07-dbu-cost-model, fabric-m08-auditing-monitoring
- databricks-m02-delta-sharing | Delta Sharing | Open protocol for sharing data across platforms and organisations | code: no | related: snowflake-m05-secure-data-sharing

## databricks-m03 — Data engineering
- databricks-m03-notebooks | Notebooks and the workspace | Databricks notebooks, Git folders, and where code should live | code: no | related: python-m08-notebooks-vs-scripts
- databricks-m03-jobs | Jobs (Lakeflow Jobs) (verify) | Multi-task workflows, triggers, retries and job compute | code: no | related: tools-m05-adf-fabric-pipelines
- databricks-m03-declarative-pipelines | Declarative pipelines (formerly Delta Live Tables) (verify) | Declaring tables and expectations; streaming tables and materialised views | code: no | related: pyspark-m11-validation-expectations, snowflake-m02-dynamic-tables
- databricks-m03-auto-loader | Auto Loader | Incremental file ingestion with schema inference and evolution | code: no | related: pyspark-m09-auto-loader
- databricks-m03-ingestion-connectors | Managed ingestion connectors (Lakeflow Connect) (verify) | Built-in connectors for databases and SaaS sources | code: no | related: tools-m01-managed-connectors
- databricks-m03-medallion-on-databricks | Medallion architecture on Databricks | How bronze, silver and gold map to UC catalogs, schemas and pipelines | code: no | related: pyspark-m08-medallion

## databricks-m04 — Delta on Databricks
- databricks-m04-optimization-features | Delta optimisations on Databricks | OPTIMIZE, deletion vectors, data skipping, auto compaction and optimised writes (verify) | code: no | related: pyspark-m08-delta-optimize-clustering
- databricks-m04-liquid-clustering | Liquid clustering | Flexible clustering that replaces partitioning and Z-order for many tables | code: no | related: pyspark-m08-delta-optimize-clustering, snowflake-m03-clustering
- databricks-m04-predictive-optimization | Predictive optimization | Databricks running maintenance automatically on managed tables (verify) | code: no | related: databricks-m04-optimization-features

## databricks-m05 — SQL and BI
- databricks-m05-sql-warehouses | SQL warehouses | Classic, pro and serverless SQL warehouses, sizing and scaling | code: no | related: snowflake-m01-virtual-warehouses
- databricks-m05-dashboards | AI/BI dashboards (verify) | Databricks-native dashboards and when to use an external BI tool instead | code: no | related: tools-m08-power-bi
- databricks-m05-genie | Genie and natural-language analytics (verify) | Asking questions in plain language over curated data | code: no | related: ai-m09-text-to-sql

## databricks-m06 — ML and AI
- databricks-m06-mlflow-on-databricks | MLflow on Databricks | Managed MLflow, experiments and models in Unity Catalog | code: no | related: tools-m10-mlflow, ml-m06-model-registry
- databricks-m06-feature-store | Feature engineering in Unity Catalog | Feature tables, online serving, point-in-time lookups (verify) | code: no | related: ml-m06-feature-stores
- databricks-m06-model-serving | Model serving | Real-time endpoints for custom models and foundation models (verify) | code: no | related: tools-m10-model-serving
- databricks-m06-vector-search | Vector search | Databricks' vector index synced from Delta tables | code: no | related: ai-m05-vector-search
- databricks-m06-agent-tooling | Agent tooling (verify) | Building, evaluating and governing agents on Databricks | code: no | related: ai-m06-tool-using-agents, ai-m08-evals

## databricks-m07 — DevOps and operations
- databricks-m07-asset-bundles | Databricks Asset Bundles (verify) | Defining jobs, pipelines and resources as code and deploying them per environment | code: no | related: tools-m09-cicd
- databricks-m07-terraform | Terraform for Databricks | Managing workspaces, UC objects and permissions with the Terraform provider | code: no | related: tools-m09-terraform
- databricks-m07-cicd | CI/CD on Databricks | Branching, testing and promoting code across workspaces | code: no | related: pyspark-m12-cicd
- databricks-m07-cluster-policies | Compute policies | Limiting what compute users can create to control cost and security | code: no | related: databricks-m07-dbu-cost-model
- databricks-m07-monitoring | Monitoring and observability | Job monitoring, query history, data quality monitoring (verify) | code: no | related: databricks-m02-system-tables
- databricks-m07-dbu-cost-model | DBUs and the cost model | How Databricks charges, cloud costs on top, and cost controls | code: no | related: fabric-m01-licensing-capacity, snowflake-m01-credits

## databricks-m08 — Decisions
- databricks-m08-when-databricks | When Databricks is the right choice | Databricks against Fabric and Snowflake from the Databricks side | code: no | related: fabric-m10-fabric-vs-databricks-vs-snowflake
- databricks-m08-serverless-vs-classic | Serverless vs classic compute | Start-up time, control, networking and cost trade-offs | code: no | related: databricks-m01-compute-types
- databricks-m08-governance-patterns | Governance patterns on Databricks | Catalog per environment or domain, workspace binding, sharing across teams | code: no | related: databricks-m02-unity-catalog-overview, fabric-m08-domains
