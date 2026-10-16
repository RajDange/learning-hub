# Experiments and ML models
id: fabric-m06-experiments-models
track: fabric
verified: 2026-10

## What we're learning
Fabric's Data Science workload uses **MLflow** for machine learning bookkeeping, surfaced as two item types:

- An **experiment** item groups training **runs**. Each run records parameters, metrics, artefacts and the code environment, logged with the MLflow API or autologging from notebooks.
- An **ML model** item is a registered model with **versions**. Each version keeps its metrics, parameters, signature and tags, and versions can be compared in the UI. MLflow 3 is supported.

For **batch scoring**, Fabric offers `PREDICT`: score a Spark DataFrame or table with a registered model through SynapseML's `MLFlowTransformer`, Spark SQL, a UDF, or a wizard that generates the scoring notebook. Supported model flavours include scikit-learn, XGBoost, LightGBM, PyTorch, TensorFlow, ONNX and others.

## Benefit
Training, tracking, registering and batch scoring happen next to the data in OneLake, under the same workspace permissions and Git support as everything else.

## Limits and misconceptions
- `PREDICT` requires an MLflow model with a **signature**.
- Fabric is strongest at batch scoring. Real-time model endpoints exist (verify current status), but dedicated serving platforms are more mature for low-latency APIs.
- MLflow concepts (runs, registry, signatures) are the same as elsewhere; see the ML track for the ideas.

## Remember this
Fabric experiments and models are MLflow under the hood, with PREDICT for batch scoring in Spark.

## Related
ml-m06-experiment-tracking, ml-m06-model-registry, tools-m10-mlflow, ml-m06-batch-vs-online-serving


# AutoML and ML tooling in Fabric
id: fabric-m06-automl
track: fabric
verified: 2026-10

## What we're learning
**AutoML** automatically tries algorithms and hyperparameters and returns the best model by a chosen metric. In Fabric it is powered by **FLAML**, an open-source AutoML library from Microsoft, and supports binary and multi-class classification, regression and forecasting. You can call it from code, or use a **low-code AutoML wizard** that asks for the data, target and goal (quick prototype, interpretable, best fit or custom) and then generates a notebook you can read and edit.

Trials can run as many parallel pandas-based models on Spark, or as Spark-based models for larger data. Results are logged to an experiment like any other run.

## Benefit
A fast, documented baseline: in minutes you learn whether the data contains signal and what a reasonable score looks like, before investing in feature engineering.

## Limits and misconceptions
- AutoML optimises the metric you give it on the data you give it. It cannot fix leakage, a wrong target or biased data.
- Models trained in Spark mode do not log the schema needed for `PREDICT` (per Microsoft's docs), so scoring takes extra work.
- The generated notebook is a starting point, not a production pipeline.
- The wizard's preview or GA status was not clearly stated in the docs checked (October 2026).

## Remember this
Fabric AutoML (FLAML) finds a strong baseline model quickly, but the problem framing and data quality are still your job.

## Related
ml-m04-hyperparameter-tuning, ml-m02-data-leakage, fabric-m06-experiments-models


# Copilot and AI features
id: fabric-m06-copilot-ai-features
track: fabric
verified: 2026-10

## What we're learning
Fabric embeds generative AI in three ways:

- **Copilot** inside workloads: generating Power Query steps in dataflows, building pipelines, writing SQL and KQL, creating Power BI report pages and summaries, and helping in notebooks. Some are GA and some preview (notebook and warehouse Copilot were preview in Microsoft's mid-2026 status table).
- **Fabric data agents** (formerly "AI skills"): a configured assistant that answers natural-language questions over up to five sources (lakehouse, warehouse, semantic model, KQL database, mirrored database and more) by generating read-only SQL, DAX or KQL. You guide it with instructions and example queries, and it can be used from Microsoft 365 Copilot, Copilot Studio and Teams. Microsoft's pages disagreed on GA versus preview in 2026 (verify).
- **AI functions**: one-line calls such as `ai.summarize`, `ai.classify`, `ai.extract`, `ai.translate` and `ai.analyze_sentiment` applied to DataFrame columns in pandas or PySpark, with T-SQL equivalents in the warehouse.

Copilot requires a **paid F2 or larger** capacity (or P SKU); it is not available on trial capacities, and capacities outside the US or EU data boundary need a tenant setting for cross-geo processing.

## Benefit
Faster authoring, self-service questions for business users, and text enrichment inside ordinary pipelines.

## Limits and misconceptions
- Every AI call consumes capacity units; large AI-function runs over millions of rows can be expensive.
- Data agents answer only as well as the underlying model and schema descriptions allow. Answers are capped in size and limited to supported sources.
- Generated code and queries must be reviewed. Copilot is an assistant, not a reviewer.
- Tenant admins control Copilot and cross-geo processing through tenant settings, which is a governance decision.

## Remember this
Copilot helps authors, data agents answer business questions over governed data, and AI functions enrich columns, all on paid capacity.

## Related
ai-m09-platform-ai-features, ai-m09-text-to-sql, fabric-m08-tenant-settings, ai-m08-hallucinations
