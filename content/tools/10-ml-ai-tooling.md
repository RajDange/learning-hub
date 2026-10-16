# MLflow
id: tools-m10-mlflow
track: tools
verified: 2026-10

## What we're learning
**MLflow** is the most widely used open-source platform for the ML lifecycle (Linux Foundation; version 3.x since mid-2025). Its parts:

- **Tracking**: log parameters, metrics, artefacts and code versions for each training **run**, grouped into **experiments**, with a UI to compare runs. Autologging covers common libraries.
- **Models**: a standard packaging format with **flavours** (scikit-learn, XGBoost, PyTorch, transformers and more) and a **signature** describing inputs and outputs. MLflow 3 made the **LoggedModel** a first-class object linked to runs, traces and evaluations.
- **Model Registry**: versions, **aliases** (such as `@champion`; the older stage labels are deprecated), tags and lineage.
- **GenAI features**: **tracing** of LLM and agent calls (OpenTelemetry-compatible), evaluation with LLM judges and scorers, a prompt registry, and a gateway.

MLflow is built into Databricks (models registered in Unity Catalog) and Fabric (experiment and model items), and runs self-hosted anywhere.

## Benefit
A common, open record of how every model was built and which version is in production, which is the basis of reproducibility, comparison and governance across platforms.

## Limits and misconceptions
- MLflow tracks and packages; it does not schedule training, build features or monitor drift on its own.
- A self-hosted server needs a database, artefact storage, authentication and upgrades (some 3.x upgrades require schema migrations).
- Managed versions (Databricks, Fabric, Azure ML) differ in features and permissions from open source.

## Remember this
MLflow records runs, packages models with signatures, registers versions with aliases, and now traces and evaluates GenAI apps.

## Related
ml-m06-experiment-tracking, ml-m06-model-registry, databricks-m06-mlflow-on-databricks, fabric-m06-experiments-models


# Feature store products
id: tools-m10-feature-stores
track: tools
verified: 2026-10

## What we're learning
A feature store keeps ML features (customer's orders in the last 30 days, average basket size) in two forms: an **offline store** (warehouse or lake tables for training, with point-in-time correct joins) and an **online store** (a low-latency key-value store for real-time inference). Products:

- **Feast**: the main open-source feature store (pre-1.0, frequent releases). It defines features in code and plugs into existing offline stores (BigQuery, Snowflake, Redshift, Spark, Postgres) and online stores (Redis, DynamoDB, Postgres).
- **Databricks** feature engineering in Unity Catalog: any Delta table with a primary key is a feature table, with declarative feature views, an online store backed by Lakebase, and lineage. Databricks acquired **Tecton** in 2025.
- **Amazon SageMaker Feature Store**, Google's feature store in its agent platform (formerly Vertex AI Feature Store), and Snowflake's feature store in Snowflake ML.

## Benefit
Features are computed once, reused across models, and served online with the same definitions used in training, which prevents training-serving skew.

## Limits and misconceptions
- Many teams do not need a feature store: batch scoring from well-modelled warehouse tables is often enough.
- Online stores add an operational system with latency and freshness SLAs.
- Point-in-time correctness only works if feature tables keep timestamps and history.

## Remember this
Feature store products manage offline features for training and online features for serving from one definition; adopt one when features are shared and served in real time.

## Related
ml-m06-feature-stores, databricks-m06-feature-store, ml-m02-data-leakage


# Vector databases and vector search
id: tools-m10-vector-databases
track: tools
verified: 2026-10

## What we're learning
**Vector search** finds items whose embeddings are closest to a query embedding, the core of retrieval-augmented generation (RAG), semantic search and recommendations. Exact search compares against every vector; at scale, **approximate nearest neighbour (ANN)** indexes trade a little recall for speed:

- **HNSW**: a graph index, in memory, fast with high recall, memory-hungry.
- **IVF** (and IVF-PQ): clusters vectors and searches only nearby clusters; cheaper to build.
- **DiskANN**: a graph index on SSD for billion-scale data with little RAM.
- **Quantisation** (product, scalar, binary) shrinks vectors at some cost in accuracy.

Two kinds of products:
- **Dedicated vector databases**: Pinecone (managed), Weaviate, Milvus (Zilliz Cloud), Qdrant, Chroma.
- **Vector features in existing systems**: pgvector for PostgreSQL, Elasticsearch and OpenSearch, Azure AI Search, MongoDB Atlas, Databricks AI Search (formerly Vector Search), Snowflake Cortex Search, Fabric's SQL database and Eventhouse vector types.

## Benefit
Choosing vector features inside a platform you already run avoids another database, while dedicated databases offer scale, performance tuning and specialised features.

## Limits and misconceptions
- Vector search alone often misses exact terms (product codes, names); **hybrid** search with keyword matching usually performs better.
- Filtering by metadata (department, permissions) can hurt recall with some indexes; check how the product combines filters with ANN.
- Embeddings change when you change the model; re-embedding a large corpus is a real cost.
- Row-level permissions on retrieved documents are often your responsibility.

## Remember this
Vector search uses ANN indexes such as HNSW, IVF or DiskANN; start with vector features in your existing platform and add hybrid keyword search.

## Related
ai-m05-vector-search, ai-m05-hybrid-search, ai-m03-embeddings, databricks-m06-vector-search


# Model serving platforms
id: tools-m10-model-serving
track: tools
verified: 2026-10

## What we're learning
**Model serving** puts a trained model behind an API so applications can get predictions in real time. Options:

- **Managed platforms**: Amazon SageMaker AI endpoints, Azure Machine Learning online endpoints and Microsoft Foundry model deployments, Google's agent platform endpoints (formerly Vertex AI), Databricks Model Serving (custom models, foundation model APIs, external models behind a gateway).
- **Open-source servers on Kubernetes**: **KServe** (CNCF), **Seldon** (moved to a source-available licence in 2024), **BentoML**, **Ray Serve**, **NVIDIA Triton** for multi-framework GPU inference.
- **LLM-specific engines**: **vLLM** and similar engines with continuous batching and efficient memory for large language models, often exposing OpenAI-compatible APIs.

Key concerns are latency, throughput, autoscaling (including scale to zero), GPU use, versioning and safe rollout (canary, A/B), and monitoring.

## Benefit
A serving platform turns a model file into a reliable service with scaling, versioning and monitoring, instead of a fragile custom web app.

## Limits and misconceptions
- Many use cases do not need real-time serving; scheduled batch scoring into a table is cheaper and simpler.
- GPU serving is expensive; idle endpoints cost money unless they scale to zero, which adds cold-start latency.
- Licences differ (Seldon's change is an example); check before standardising on open-source servers.

## Remember this
Serve models in real time only when needed, using a managed endpoint or a Kubernetes serving framework, with vLLM-style engines for LLMs.

## Related
ml-m06-batch-vs-online-serving, ai-m10-deployment, databricks-m06-model-serving, tools-m09-kubernetes
