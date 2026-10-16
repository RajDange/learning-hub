# Cloud map: ingestion, streaming and storage
id: tools-m11-cloud-map-ingest-store
track: tools
verified: 2026-10

## What we're learning
Each cloud offers a similar set of building blocks under different names. For the ingestion and storage layers:

| Role | AWS | Azure | Google Cloud |
|---|---|---|---|
| Object storage | Amazon S3 | ADLS Gen2 / Blob Storage (OneLake in Fabric) | Cloud Storage |
| Managed Iceberg storage | S3 Tables | OneLake (Delta, Iceberg virtualised) | BigLake managed tables |
| Event streaming | Kinesis Data Streams, Amazon MSK (Kafka) | Event Hubs (Kafka endpoint) | Pub/Sub, Managed Service for Apache Kafka |
| Messaging and events | SQS, SNS, EventBridge | Service Bus, Event Grid | Pub/Sub, Eventarc |
| Stream delivery to storage | Amazon Data Firehose | Event Hubs Capture, Fabric Eventstreams | Pub/Sub subscriptions to BigQuery and Storage |
| Database CDC and replication | AWS DMS | ADF CDC, Fabric mirroring, Copy job | Datastream |
| Batch data movement | AWS Glue, DMS | Azure Data Factory, Fabric Data Factory | Data Fusion, Storage Transfer Service |

## Benefit
A mapping like this lets you translate architecture diagrams and job descriptions between clouds, and spot when a multi-cloud estate is running three tools for the same job.

## Limits and misconceptions
- Equivalent does not mean identical: limits, pricing and semantics differ (for example Event Hubs speaks the Kafka protocol but is not Kafka).
- Names change often (Kinesis Data Firehose became Amazon Data Firehose); check current names.
- Third-party tools (Kafka, Debezium, Fivetran, Databricks, Snowflake) run across clouds and often replace native services.

## Remember this
Every cloud has object storage, a streaming service, a CDC service and a batch mover; the names differ more than the ideas.

## Related
tools-m03-object-storage, tools-m02-kafka, tools-m01-ingestion-styles, tools-m02-kinesis


# Cloud map: processing and orchestration
id: tools-m11-cloud-map-process-orchestrate
track: tools
verified: 2026-10

## What we're learning
For the processing and orchestration layers:

| Role | AWS | Azure | Google Cloud |
|---|---|---|---|
| Managed Spark | Amazon EMR (EC2, EKS, Serverless), AWS Glue | Azure Databricks, Fabric Spark, Synapse Spark (earlier service) | Dataproc, Serverless for Apache Spark |
| Serverless SQL on the lake | Amazon Athena (Trino-based) | Fabric SQL analytics endpoint, Synapse serverless SQL | BigQuery (with BigLake) |
| Data warehouse | Amazon Redshift (provisioned, Serverless) | Fabric Data Warehouse (Synapse dedicated pools earlier) | BigQuery |
| Stream processing | Managed Service for Apache Flink | Stream Analytics, Fabric Real-Time Intelligence, Databricks | Dataflow (Apache Beam) |
| Managed Airflow | Amazon MWAA | Fabric Apache Airflow job | Cloud Composer |
| Native orchestration | Step Functions, Glue workflows | Data Factory / Fabric pipelines | Workflows |

Databricks and Snowflake run on all three clouds and are often the processing layer regardless of cloud.

## Benefit
Seeing the layers side by side helps judge which parts of a migration are a rename and which are a real redesign.

## Limits and misconceptions
- Service boundaries differ: BigQuery is both serverless SQL and warehouse; Fabric bundles several roles into one SaaS.
- Feature parity is never complete; the details (networking, security integration, pricing units) drive real decisions.

## Remember this
Each cloud pairs managed Spark, serverless SQL, a warehouse, stream processing and an orchestrator; Databricks and Snowflake sit across all three.

## Related
pyspark-m10-managed-platforms, tools-m04-warehouse-engines, tools-m05-airflow, tools-m04-trino-presto


# Cloud map: governance, BI and ML
id: tools-m11-cloud-map-govern-serve
track: tools
verified: 2026-10

## What we're learning
For governance, consumption and ML (names as of October 2026):

| Role | AWS | Azure / Microsoft | Google Cloud |
|---|---|---|---|
| Technical catalog | AWS Glue Data Catalog | OneLake catalog, Unity Catalog (Azure Databricks) | Dataplex Universal Catalog, BigLake metastore |
| Access governance | Lake Formation | OneLake security, Purview policies | Dataplex, BigQuery IAM and policy tags |
| Business catalog and governance | Amazon SageMaker Catalog (built on DataZone) | Microsoft Purview Unified Catalog | Dataplex Universal Catalog |
| BI | Amazon QuickSight (Quick Suite branding, verify) | Power BI | Looker, Looker Studio |
| ML platform | Amazon SageMaker AI and SageMaker Unified Studio | Azure Machine Learning, Microsoft Foundry | Gemini Enterprise Agent Platform (formerly Vertex AI) |
| Generative AI models | Amazon Bedrock | Microsoft Foundry (Azure OpenAI and others) | Gemini models via the agent platform |

Recent renames worth knowing: Azure AI Studio became Azure AI Foundry and then **Microsoft Foundry** (2025); Google rebranded **Vertex AI** as the **Gemini Enterprise Agent Platform** (April 2026); Google's Data Catalog was retired in favour of **Dataplex Universal Catalog**; AWS launched the "next generation" of **SageMaker** (Unified Studio, Catalog, Lakehouse) and renamed the classic service **SageMaker AI**.

## Benefit
Governance and AI are where vendor naming changes fastest; a current map prevents designing around retired or renamed services.

## Limits and misconceptions
- Platform catalogs (Unity Catalog, Snowflake Horizon) govern across clouds for their own platform; cloud-native catalogs govern their own cloud. Few tools govern everything.
- Renames often keep old API names, so documentation and code can disagree.
- This table will age quickly; recheck before decisions.

## Remember this
Each cloud has a catalog, an access layer, a BI tool and an ML platform; their names change fast, so check current names before designing.

## Related
tools-m06-catalogs-explained, tools-m10-model-serving, tools-m08-power-bi, tools-m06-purview
