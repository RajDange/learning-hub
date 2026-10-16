# Track: snowflake — Snowflake

> Concept-only. No code.

## snowflake-m01 — Architecture
- snowflake-m01-three-layer-architecture | Storage, compute and cloud services | The three layers and why separating them matters | code: no | related: tools-m04-warehouse-engines
- snowflake-m01-virtual-warehouses | Virtual warehouses | Compute clusters, sizes, auto-suspend and auto-resume | code: no | related: snowflake-m03-warehouse-sizing-multicluster
- snowflake-m01-micro-partitions | Micro-partitions | Automatic immutable storage units, metadata and pruning | code: no | related: snowflake-m03-clustering, pyspark-m07-pruning-and-pushdown
- snowflake-m01-editions | Editions | Standard, Enterprise, Business Critical and Virtual Private Snowflake, and which features need which | code: no | related: snowflake-m01-credits
- snowflake-m01-credits | Credits and billing | Compute credits, storage, serverless features and data transfer costs | code: no | related: snowflake-m08-resource-monitors-cost, databricks-m07-dbu-cost-model

## snowflake-m02 — Loading and pipelines
- snowflake-m02-stages-and-copy | Stages and COPY INTO | Internal and external stages, file formats, bulk loading and unloading | code: no | related: tools-m03-object-storage
- snowflake-m02-snowpipe | Snowpipe | Continuous file loading triggered by cloud events | code: no | related: snowflake-m02-stages-and-copy, databricks-m03-auto-loader
- snowflake-m02-snowpipe-streaming | Snowpipe Streaming | Row-level streaming ingestion without files, and the Kafka connector | code: no | related: tools-m02-kafka
- snowflake-m02-streams-tasks | Streams and tasks | Change tracking on tables and scheduled or triggered SQL tasks | code: no | related: pyspark-m08-delta-change-data-feed
- snowflake-m02-dynamic-tables | Dynamic tables | Declarative pipelines defined by a query and a target lag | code: no | related: databricks-m03-declarative-pipelines
- snowflake-m02-external-tables | External tables | Querying files in cloud storage without loading them | code: no | related: snowflake-m02-iceberg-tables
- snowflake-m02-iceberg-tables | Apache Iceberg tables in Snowflake | Snowflake-managed and externally managed Iceberg tables, catalogs (verify) | code: no | related: tools-m03-open-table-formats, snowflake-m08-iceberg-interoperability

## snowflake-m03 — Performance
- snowflake-m03-caching-layers | Caching layers | Result cache, warehouse local disk cache and metadata | code: no | related: snowflake-m01-three-layer-architecture
- snowflake-m03-clustering | Clustering keys and automatic clustering | When natural clustering is not enough, cost of reclustering | code: no | related: snowflake-m01-micro-partitions, databricks-m04-liquid-clustering
- snowflake-m03-search-optimization | Search optimization service | Point lookups and selective filters on large tables | code: no | related: sql-m09-indexes
- snowflake-m03-query-acceleration | Query acceleration service | Offloading parts of large scans to serverless compute | code: no | related: snowflake-m03-warehouse-sizing-multicluster
- snowflake-m03-warehouse-sizing-multicluster | Warehouse sizing and multi-cluster warehouses | Scaling up for big queries, scaling out for concurrency | code: no | related: snowflake-m01-virtual-warehouses
- snowflake-m03-query-profile | Query profile | Reading the query profile: spilling, pruning, exploding joins | code: no | related: sql-m09-execution-plans, pyspark-m07-explain-plans

## snowflake-m04 — Data features
- snowflake-m04-variant | Semi-structured data and VARIANT | Storing JSON, Avro and Parquet data, FLATTEN and path notation | code: no | related: sql-m07-json
- snowflake-m04-time-travel-fail-safe | Time Travel and Fail-safe | Querying past data, UNDROP, retention, and the fail-safe period | code: no | related: pyspark-m08-delta-time-travel-vacuum
- snowflake-m04-zero-copy-cloning | Zero-copy cloning | Cloning databases, schemas and tables without copying storage | code: no | related: snowflake-m04-time-travel-fail-safe
- snowflake-m04-snowpark | Snowpark | DataFrame APIs and code running inside Snowflake compute | code: no | related: pyspark-m02-columns-and-expressions

## snowflake-m05 — Sharing
- snowflake-m05-secure-data-sharing | Secure data sharing | Sharing live data without copies, reader accounts, cross-region sharing | code: no | related: databricks-m02-delta-sharing
- snowflake-m05-marketplace | Snowflake Marketplace | Finding and publishing data products and apps | code: no | related: snowflake-m05-secure-data-sharing
- snowflake-m05-clean-rooms | Data clean rooms | Joint analysis without exposing raw data | code: no | related: snowflake-m05-secure-data-sharing

## snowflake-m06 — Security and governance
- snowflake-m06-rbac | Role-based access control | Roles, role hierarchy, system roles, ownership and future grants | code: no | related: databricks-m02-privileges, fabric-m08-workspace-roles
- snowflake-m06-masking-policies | Dynamic data masking | Masking policies, conditional masking, tag-based masking | code: no | related: fabric-m08-sql-granular-security
- snowflake-m06-row-access-policies | Row access policies | Row-level security with mapping tables | code: no | related: snowflake-m06-masking-policies
- snowflake-m06-tags-classification | Object tags and data classification | Tagging objects, automatic sensitive data classification | code: no | related: fabric-m08-sensitivity-labels
- snowflake-m06-network-policies | Network policies and private connectivity | IP allow lists, network rules, PrivateLink | code: no | related: snowflake-m06-rbac
- snowflake-m06-horizon | Snowflake Horizon (verify) | The governance and discovery features grouped under one name | code: no | related: tools-m06-catalogs-explained

## snowflake-m07 — AI and ML
- snowflake-m07-cortex | Cortex AI features (verify) | LLM functions, Cortex Search and Cortex Analyst | code: no | related: ai-m09-platform-ai-features, ai-m05-rag-overview
- snowflake-m07-snowpark-ml | Snowflake ML (verify) | Training, model registry and feature store inside Snowflake | code: no | related: ml-m06-ml-on-platforms
- snowflake-m07-notebooks | Snowflake Notebooks (verify) | Notebooks running on Snowflake compute | code: no | related: python-m08-notebooks-vs-scripts

## snowflake-m08 — Operations and decisions
- snowflake-m08-resource-monitors-cost | Resource monitors and cost control | Credit quotas, budgets, warehouse settings that control spend | code: no | related: snowflake-m01-credits
- snowflake-m08-cicd | CI/CD and change management for Snowflake | Schema change tools, Git integration, environments by cloning (verify) | code: no | related: tools-m09-cicd
- snowflake-m08-vs-databricks-fabric | Snowflake vs Databricks vs Fabric | When Snowflake is the right choice, from the Snowflake side | code: no | related: fabric-m10-fabric-vs-databricks-vs-snowflake
- snowflake-m08-iceberg-interoperability | Iceberg interoperability | Using Snowflake with other engines through Iceberg and catalogs (verify) | code: no | related: tools-m03-format-interoperability
