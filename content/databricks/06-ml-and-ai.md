# MLflow on Databricks
id: databricks-m06-mlflow-on-databricks
track: databricks
verified: 2026-10

## What we're learning
Databricks runs a **managed MLflow** (MLflow 3 since mid-2025) integrated with the workspace and Unity Catalog:

- **Experiments** track training runs from notebooks and jobs, with autologging for common libraries.
- **Models in Unity Catalog** are the model registry: models are named `catalog.schema.model`, have versions and **aliases** (for example `@champion`), and get UC permissions, lineage to training data, and audit.
- **GenAI features**: tracing of LLM and agent calls (traces can be stored in Unity Catalog), evaluation with LLM judges, prompt management, and deployment jobs that run evaluation and approval before deploying a model version.

## Benefit
Models are governed like tables: the same permissions, lineage and environments (dev and prod catalogs) apply, and promotion between environments is controlled.

## Limits and misconceptions
- The older workspace model registry is legacy; new work should register models in Unity Catalog.
- MLflow tracks and registers; scheduling training and monitoring drift need jobs and data quality monitoring.
- Moving models between catalogs (dev to prod) is a deliberate copy or registration step, not automatic.

## Remember this
On Databricks, MLflow tracks experiments and registers models in Unity Catalog with versions, aliases, permissions and lineage.

## Related
tools-m10-mlflow, ml-m06-model-registry, ml-m06-experiment-tracking, databricks-m06-model-serving


# Feature engineering in Unity Catalog
id: databricks-m06-feature-store
track: databricks
verified: 2026-10

## What we're learning
In Databricks, **any Delta table with a primary key in Unity Catalog can be a feature table**. Features are joined to training data with **point-in-time** lookups (using a timestamp key) so training never sees future values. Newer **feature views** (GA in October 2026) let you declare features more declaratively. For real-time inference, features are published to an **online feature store** backed by **Lakebase**, Databricks' managed PostgreSQL service, and served automatically to models deployed with Model Serving. Databricks acquired the feature platform company **Tecton** in 2025.

## Benefit
Features are defined once, governed and discoverable in Unity Catalog, reused across models, and served online with the same values used in training.

## Limits and misconceptions
- The older workspace feature store is deprecated.
- Online serving adds a separate store with its own cost and freshness to monitor.
- Point-in-time correctness requires timestamped feature history; snapshot-only tables leak future data.

## Remember this
On Databricks, feature tables are UC Delta tables with primary keys, joined point-in-time for training and published to a Lakebase-backed online store for serving.

## Related
ml-m06-feature-stores, tools-m10-feature-stores, ml-m02-data-leakage


# Model serving
id: databricks-m06-model-serving
track: databricks
verified: 2026-10

## What we're learning
**Model Serving** deploys models as serverless REST endpoints that scale automatically (including to zero). It serves:

- **Custom models** registered with MLflow (scikit-learn, XGBoost, PyTorch, custom Python), including agents.
- **Foundation model APIs**: hosted open and proprietary LLMs, pay-per-token or with provisioned throughput.
- **External models**: endpoints that proxy third-party providers, so applications call one interface.

Governance for model and LLM endpoints (rate limits, usage tracking, guardrails, logging) is handled by a gateway layer, renamed **Unity Gateway** (Unity AI Gateway in some pages) in 2026. Endpoint usage and inference logs are available in system tables.

## Benefit
Deploying a model becomes configuration rather than building and operating your own API servers, with Unity Catalog permissions and monitoring built in.

## Limits and misconceptions
- Real-time endpoints cost money while provisioned; scale-to-zero adds cold-start latency.
- Batch scoring in jobs is often cheaper and enough.
- GPU capacity for large models may be limited per region.

## Remember this
Model Serving hosts custom models, foundation models and external model proxies as serverless endpoints, governed through a gateway.

## Related
tools-m10-model-serving, ml-m06-batch-vs-online-serving, ai-m10-gateways


# Vector search
id: databricks-m06-vector-search
track: databricks
verified: 2026-10

## What we're learning
Databricks' vector search (renamed **AI Search** in June 2026) maintains vector indexes over Unity Catalog data:

- **Delta Sync indexes** stay in sync with a source Delta table (which needs change data feed). Databricks can compute embeddings for you with a chosen embedding model, or you supply your own embedding column.
- **Direct Vector Access** indexes are written to directly through an API.
- **Hybrid search** combines vector similarity with keyword (BM25) matching using rank fusion; full-text indexes were in beta in 2026.

Endpoints come in standard and storage-optimised forms for different scales.

## Benefit
RAG applications on Databricks keep their retrieval index automatically up to date with governed source tables, without a separate vector database.

## Limits and misconceptions
- Index-level access control does not apply row or column permissions of the source table; filter results yourself or create separate indexes.
- Each endpoint has limits on number of indexes and vectors.
- Embedding model changes require re-embedding.

## Remember this
Databricks vector search (now AI Search) keeps vector and hybrid indexes in sync with Delta tables for RAG.

## Related
ai-m05-vector-search, tools-m10-vector-databases, ai-m05-hybrid-search


# Agent tooling
id: databricks-m06-agent-tooling
track: databricks
verified: 2026-10

## What we're learning
Databricks groups its agent capabilities under **Agent Bricks** (names changed repeatedly in 2025-2026; earlier terms include Mosaic AI Agent Framework). The pieces:

- **Building**: code-first agents (with a CLI and agent server) or no-code agents through **Genie agents**; tools can be Unity Catalog functions, vector search indexes, Genie agents and external APIs, including MCP servers.
- **Evaluating**: MLflow 3 evaluation with LLM judges and human review, using traces of each agent step.
- **Governing**: agents and their tools are Unity Catalog objects; the gateway enforces rate limits, logging and guardrails; memory can be stored in Lakebase.
- **Deploying**: agents are served through Model Serving.

Some earlier packaged agents (such as the multi-agent supervisor and knowledge assistant) were marked legacy in October 2026 in favour of the newer approach.

## Benefit
Agents built on governed data with tracing and evaluation built in, which addresses the main enterprise blockers: permissions, quality measurement and auditability.

## Limits and misconceptions
- Product names and recommended paths change quickly; check current documentation before choosing an approach.
- Platform tooling does not remove the core agent risks (wrong tool use, prompt injection, cost blowups); evaluation and guardrails are still your job.

## Remember this
Databricks agent tooling (Agent Bricks) builds agents on Unity Catalog tools, evaluates them with MLflow traces and judges, and serves them through Model Serving.

## Related
ai-m06-tool-using-agents, ai-m08-evals, ai-m06-mcp, databricks-m06-model-serving
