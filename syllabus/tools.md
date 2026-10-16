# Track: tools — Tools and Technologies Landscape

> Concept-only, organised by role in the architecture. Each lesson: what it does, what it replaces or complements, when to choose it.

## tools-m01 — Ingestion and CDC
- tools-m01-ingestion-styles | Batch, CDC and streaming ingestion | The three ways to move data into a platform and how to choose between them | code: no | related: pyspark-m13-ingestion-patterns, pyspark-m09-streaming-model
- tools-m01-debezium | Debezium and log-based CDC | Reading database transaction logs into Kafka, and what log-based CDC requires from the source | code: no | related: tools-m02-kafka, fabric-m02-mirroring
- tools-m01-managed-connectors | Managed connectors: Fivetran, Airbyte and similar | SaaS and open-source connector platforms, pricing models, when to buy instead of build | code: no | related: tools-m01-azure-data-factory, databricks-m03-ingestion-connectors
- tools-m01-azure-data-factory | Azure Data Factory | Azure's cloud ETL and orchestration service, integration runtimes, and its relation to Fabric | code: no | related: fabric-m03-pipelines, tools-m05-adf-fabric-pipelines

## tools-m02 — Streaming platforms
- tools-m02-kafka | Apache Kafka | The distributed log: topics, partitions, consumer groups, retention, and the managed offerings | code: no | related: pyspark-m09-kafka-eventhubs-kinesis, tools-m02-schema-registry
- tools-m02-event-hubs | Azure Event Hubs | Azure's managed event ingestion service, its Kafka endpoint, and tiers | code: no | related: tools-m02-kafka, fabric-m05-eventstreams
- tools-m02-kinesis | Amazon Kinesis | AWS streaming services: Data Streams and Firehose, and how they differ from Kafka | code: no | related: tools-m02-kafka
- tools-m02-pulsar | Apache Pulsar | Pulsar's split of brokers and storage, multi-tenancy, and when it is chosen over Kafka | code: no | related: tools-m02-kafka
- tools-m02-flink-vs-spark-streaming | Apache Flink vs Spark Structured Streaming | Record-at-a-time versus micro-batch processing, state, latency and operational trade-offs | code: no | related: pyspark-m09-streaming-model, pyspark-m09-stateful-operations
- tools-m02-schema-registry | Schema registries | Managing Avro, Protobuf and JSON Schema for event streams; compatibility rules | code: no | related: tools-m07-data-contracts, tools-m02-kafka

## tools-m03 — Table formats and storage
- tools-m03-columnar-formats | Parquet and ORC | Columnar file layout, row groups, statistics, compression, and why analytics uses them | code: no | related: pyspark-m06-file-formats
- tools-m03-open-table-formats | Delta Lake, Apache Iceberg and Apache Hudi compared | What a table format adds on top of files and how the three differ | code: no | related: pyspark-m08-delta-lake, pyspark-m08-iceberg-hudi
- tools-m03-object-storage | Object storage: ADLS, S3 and GCS | Buckets and containers, hierarchical namespace, consistency, cost tiers | code: no | related: fabric-m01-onelake
- tools-m03-format-interoperability | Table format interoperability | Delta UniForm, Apache XTable, Iceberg REST catalogs and reading one format as another (verify) | code: no | related: snowflake-m08-iceberg-interoperability, fabric-m02-delta-in-fabric

## tools-m04 — Processing and query engines
- tools-m04-spark | Apache Spark in the landscape | Where Spark fits among engines and when a smaller tool is enough | code: no | related: pyspark-m01-spark-architecture, tools-m04-duckdb
- tools-m04-trino-presto | Trino and Presto | Federated SQL query engines over many sources, and their managed forms such as Athena and Starburst | code: no | related: tools-m04-warehouse-engines
- tools-m04-dbt | dbt | SQL-based transformation with testing, documentation and lineage; dbt Core versus the managed platform | code: no | related: tools-m05-scheduling-vs-orchestration, tools-m07-data-contracts
- tools-m04-duckdb | DuckDB | In-process analytical database for single-machine work on Parquet and more | code: no | related: python-m04-pandas-vs-polars, tools-m04-spark
- tools-m04-warehouse-engines | Cloud warehouse engines | Snowflake, BigQuery, Redshift, Synapse and Fabric Warehouse as a category | code: no | related: snowflake-m01-three-layer-architecture, fabric-m02-warehouse

## tools-m05 — Orchestration
- tools-m05-scheduling-vs-orchestration | Scheduling vs orchestration | Cron versus dependency-aware orchestration; what an orchestrator must provide | code: no | related: tools-m05-airflow
- tools-m05-airflow | Apache Airflow | DAGs, operators, sensors, executors, and managed Airflow offerings | code: no | related: pyspark-m12-orchestration-airflow
- tools-m05-dagster | Dagster | Asset-based orchestration and how it differs from task-based tools | code: no | related: tools-m05-airflow
- tools-m05-prefect | Prefect | Python-native workflow orchestration and its hybrid execution model | code: no | related: tools-m05-airflow
- tools-m05-adf-fabric-pipelines | ADF, Fabric pipelines and Databricks Jobs as orchestrators | Platform-native orchestration versus a separate orchestrator | code: no | related: fabric-m03-pipelines, databricks-m03-jobs

## tools-m06 — Catalog, governance and lineage
- tools-m06-catalogs-explained | Technical, business and enterprise data catalogs | Metastores versus discovery catalogs versus governance suites | code: no | related: pyspark-m05-catalog-tables
- tools-m06-unity-catalog | Unity Catalog in the landscape | Databricks' governance layer and the open-source Unity Catalog project | code: no | related: databricks-m02-unity-catalog-overview
- tools-m06-purview | Microsoft Purview | Data map, unified catalog, information protection and how it spans Azure, Fabric and beyond (verify) | code: no | related: fabric-m08-purview-integration
- tools-m06-datahub-openmetadata | DataHub and OpenMetadata | Open-source metadata platforms, ingestion of metadata, and when to choose one | code: no | related: tools-m06-catalogs-explained
- tools-m06-lineage | Data lineage and OpenLineage | How lineage is captured, column versus table lineage, and the OpenLineage standard | code: no | related: pyspark-m11-data-lineage, fabric-m08-lineage-impact
- tools-m06-enterprise-catalogs | Enterprise catalogs: Collibra, Alation, Informatica | Governance-led commercial catalogs and how they relate to platform catalogs | code: no | related: tools-m06-catalogs-explained

## tools-m07 — Data quality and observability
- tools-m07-great-expectations | Great Expectations | Expectation suites, checkpoints and data docs (verify) | code: no | related: pyspark-m11-validation-expectations
- tools-m07-soda | Soda | Checks written in a YAML language, scanning and alerting | code: no | related: tools-m07-great-expectations
- tools-m07-deequ | Deequ and PyDeequ | Spark-native data quality checks and constraint suggestions from AWS Labs | code: no | related: pyspark-m11-validation-expectations
- tools-m07-data-observability | Data observability platforms | Freshness, volume, schema and distribution monitoring; Monte Carlo and similar tools | code: no | related: tools-m06-lineage
- tools-m07-data-contracts | Data contracts | Agreements between producers and consumers on schema, quality and meaning; how they are enforced | code: no | related: tools-m02-schema-registry

## tools-m08 — Serving, OLAP and BI
- tools-m08-clickhouse | ClickHouse | Column-oriented OLAP database for fast aggregations over large event data | code: no | related: tools-m08-druid-pinot, fabric-m05-eventhouse-kql
- tools-m08-druid-pinot | Apache Druid and Apache Pinot | Real-time OLAP stores for user-facing analytics with low latency | code: no | related: tools-m08-clickhouse
- tools-m08-power-bi | Power BI | Microsoft's BI tool: models, reports, service, and its place inside Fabric | code: no | related: fabric-m07-semantic-models
- tools-m08-tableau | Tableau | Salesforce's visual analytics tool and how it compares with Power BI | code: no | related: tools-m08-power-bi
- tools-m08-semantic-layers | Semantic layers and metrics stores | Defining metrics once for every tool: dbt semantic layer, Cube, and BI models | code: no | related: fabric-m07-semantic-models, tools-m04-dbt

## tools-m09 — Infrastructure and DevOps
- tools-m09-docker | Docker and containers | Images, containers, registries and why data teams use them | code: no | related: python-m08-docker-basics
- tools-m09-kubernetes | Kubernetes | Container orchestration and how data tools such as Spark and Airflow run on it | code: no | related: pyspark-m10-cluster-managers
- tools-m09-terraform | Terraform and infrastructure as code | Declaring cloud resources in code, state, plans, and alternatives such as Bicep | code: no | related: databricks-m07-terraform
- tools-m09-cicd | CI/CD for data platforms | Build, test and deploy pipelines with GitHub Actions or Azure DevOps for data code | code: no | related: pyspark-m12-cicd, fabric-m09-git-integration
- tools-m09-secrets-identity | Secrets and identity | Key vaults, service principals, managed identities and workload identity for data pipelines | code: no | related: tools-m09-cicd

## tools-m10 — ML and AI tooling
- tools-m10-mlflow | MLflow | Tracking, models, registry and its role across Databricks, Fabric and elsewhere | code: no | related: ml-m06-experiment-tracking, ml-m06-model-registry
- tools-m10-feature-stores | Feature store products | Feast, Databricks and cloud feature stores: offline and online stores | code: no | related: ml-m06-feature-stores
- tools-m10-vector-databases | Vector databases and vector search | Dedicated vector databases versus vector features in existing databases | code: no | related: ai-m05-vector-search
- tools-m10-model-serving | Model serving platforms | Hosting models behind an API: managed endpoints, open-source servers, LLM serving | code: no | related: ml-m06-batch-vs-online-serving, ai-m10-deployment

## tools-m11 — Cross-cloud map
- tools-m11-cloud-map-ingest-store | Cloud map: ingestion, streaming and storage | How AWS, Azure and GCP services line up for ingestion, messaging and storage | code: no | related: tools-m03-object-storage, tools-m02-kafka
- tools-m11-cloud-map-process-orchestrate | Cloud map: processing and orchestration | Spark services, warehouses, serverless SQL and orchestrators on each cloud | code: no | related: pyspark-m10-managed-platforms, tools-m04-warehouse-engines
- tools-m11-cloud-map-govern-serve | Cloud map: governance, BI and ML | Catalogs, security, BI and ML services on each cloud | code: no | related: tools-m06-catalogs-explained, tools-m10-model-serving
