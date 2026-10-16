# Experiment tracking
id: ml-m06-experiment-tracking
track: ml

## What we're learning
**Experiment tracking** records every training run so results can be compared and reproduced:

- **Parameters**: hyperparameters, feature set version, data snapshot or version.
- **Metrics**: validation and test scores, per epoch for neural networks.
- **Artefacts**: the model file, plots, feature importances, confusion matrices.
- **Context**: code version (Git commit), environment and library versions, who ran it and when.

Tools: **MLflow** (open source, built into Databricks and Fabric), Weights & Biases, Neptune, Comet, and cloud ML platforms. Runs are grouped into **experiments**; the UI compares runs side by side.

## Benefit
"Which model was better, and how was it trained?" becomes a lookup instead of an archaeology project, and the best run can be promoted straight to a registry.

## Code snippet
```python
import mlflow

mlflow.set_experiment("churn-model")
with mlflow.start_run():
    mlflow.log_params({"model": "lightgbm", "num_leaves": 63, "features": "v3"})
    model.fit(X_train, y_train)
    mlflow.log_metric("val_auc", val_auc)
    mlflow.sklearn.log_model(model, "model", input_example=X_train.head(5))
```

## Limits and misconceptions
- Tracking is only as good as what is logged; log data versions and code commits, not just metrics.
- Hundreds of unlabelled runs are noise; name and tag runs.
- Tracking is not monitoring; production behaviour needs separate monitoring.

## Remember this
Log parameters, metrics, artefacts, data version and code version for every run so models can be compared and reproduced.

## Related
tools-m10-mlflow, ml-m06-model-registry, fabric-m06-experiments-models, ml-m06-testing-reproducibility


# Model registry
id: ml-m06-model-registry
track: ml

## What we're learning
A **model registry** is the catalogue of trained models intended for use:

- Each model has a **name** and numbered **versions**, linked to the run that produced them (parameters, metrics, data, code).
- **Aliases** (such as `champion` and `challenger`) or stages mark which version serves where; deployment code loads by alias, so promotion is a metadata change.
- **Approval workflows**, descriptions, tags and **permissions** control who can register and promote.
- **Lineage** links models to training data and downstream endpoints.

Examples: MLflow Model Registry, models in Unity Catalog on Databricks, ML model items in Fabric, Snowflake Model Registry, cloud ML platform registries.

## Benefit
A registry gives one answer to "which model is in production, who approved it, and what was it trained on?", which audits and incident response require.

## Limits and misconceptions
- Registering a model does not deploy it; serving or batch scoring must load it.
- Promotion should be gated by evaluation and checks, not done by hand.
- Models trained on personal data inherit that data's governance requirements.

## Remember this
A model registry versions approved models, marks the serving version with aliases, and links each to its training run and data.

## Related
databricks-m06-mlflow-on-databricks, ml-m06-experiment-tracking, ml-m06-batch-vs-online-serving


# Batch vs online serving
id: ml-m06-batch-vs-online-serving
track: ml

## What we're learning
Two main ways to use a model in production:

- **Batch scoring**: on a schedule, score many records at once and write predictions to a table (nightly churn scores for all customers, weekly demand forecasts). Runs in Spark, SQL warehouses (`PREDICT`, AI functions) or jobs.
- **Online (real-time) serving**: the model sits behind an API and scores one request at a time with low latency (fraud check during payment, recommendations on a page). Needs a serving platform, autoscaling, and features available in real time (online feature store).
- **Streaming scoring** sits in between: score events as they flow through Spark or Flink.

## Benefit
Choosing batch when possible is cheaper and simpler; choosing online only when the decision truly happens in real time avoids building infrastructure nobody needs.

## Compared with
| | Batch | Online |
|---|---|---|
| Latency | Minutes to hours | Milliseconds |
| Infrastructure | Scheduled job | Endpoint, autoscaling, monitoring |
| Features | From warehouse or lake | From online store, computed fast |
| Cost | Low | Higher (always-on capacity) |
| Typical use | CRM lists, planning | Fraud at checkout, personalisation |

## Limits and misconceptions
- Online serving introduces training-serving skew risks if features are computed differently; share feature definitions.
- Batch predictions go stale; refresh frequency must match how fast inputs change.

## Remember this
Score in batch unless the decision happens in real time; online serving adds endpoints, online features and higher cost.

## Related
tools-m10-model-serving, ml-m06-feature-stores, databricks-m06-model-serving


# Drift and model monitoring
id: ml-m06-drift-monitoring
track: ml

## What we're learning
Models degrade because the world changes. What to monitor:

- **Data (input) drift**: feature distributions shift (new customer mix, a new product line, a changed upstream code). Measured with statistics such as population stability index (PSI), KL divergence or Kolmogorov-Smirnov tests per feature.
- **Prediction drift**: the distribution of scores changes.
- **Concept drift**: the relationship between features and target changes (fraud patterns adapt), so the same inputs mean something different.
- **Performance**: actual accuracy once **labels** arrive, which may take days or months (loan defaults), so proxies and input drift serve as early warnings.
- **Operational health**: latency, errors, throughput, and data quality of inputs (missing features, nulls).

## Benefit
Monitoring catches silent model failure before it shows up as business losses, and tells you when to retrain.

## Limits and misconceptions
- Not all drift hurts performance; alert on drift that matters, prioritised by feature importance.
- Many "model problems" are upstream data problems (a broken pipeline sending nulls); monitor data quality too.
- Delayed labels mean performance monitoring always lags.

## Remember this
Monitor input drift, prediction drift and data quality as early warnings, and real performance once labels arrive.

## Related
ml-m06-retraining, tools-m07-data-observability, ai-m10-monitoring


# Retraining strategies
id: ml-m06-retraining
track: ml

## What we're learning
Models need refreshing as data changes. Strategies:

- **Scheduled retraining**: monthly or weekly, simple and predictable.
- **Triggered retraining**: when drift or performance thresholds are crossed.
- **Continuous training**: automated pipelines that retrain on new data frequently (common in recommendation and ads).

A safe retraining pipeline: fetch training data with point-in-time correctness, train, **evaluate against the current production model** (champion versus challenger) on recent holdout data, check fairness and sanity, register the new version, then roll out gradually (**shadow** deployment, **canary** or A/B test) with the ability to **roll back**.

## Benefit
Automated, gated retraining keeps models current without risking a worse model reaching production unnoticed.

## Limits and misconceptions
- Retraining on recent data alone can forget rare but important patterns; choose the window deliberately.
- Feedback loops: a model's own decisions change future data (approved loans only produce default labels for approved customers).
- Retraining does not fix a broken problem framing or broken data.

## Remember this
Retrain on a schedule or trigger, but always compare against the current champion and roll out gradually with rollback.

## Related
ml-m06-drift-monitoring, ml-m06-model-registry, ml-m06-testing-reproducibility


# Feature stores
id: ml-m06-feature-stores
track: ml

## What we're learning
A **feature store** manages features (inputs to models) as shared, governed data:

- **Feature definitions** written once (for example "customer purchases in the last 30 days") and reused by many models.
- An **offline store** of historical feature values, with **point-in-time joins**: when building training data, each label gets the feature values as they were at that moment, preventing leakage.
- An **online store** holding the latest values for low-latency lookups during real-time inference.
- **Consistency**: the same definition feeds training and serving, avoiding training-serving skew.
- Discovery, lineage and access control for features.

Products are covered in the tools track (Feast, Databricks, SageMaker, Snowflake and others).

## Benefit
Teams stop rebuilding the same features in every project, and point-in-time correctness removes a major source of leakage.

## Limits and misconceptions
- A feature store is infrastructure; it pays off when several models share features or need real-time serving.
- Point-in-time correctness requires timestamped feature history.
- Ownership of shared features must be clear, or the store fills with stale, undocumented features.

## Remember this
A feature store defines features once, serves point-in-time correct history for training and fresh values online, keeping training and serving consistent.

## Related
tools-m10-feature-stores, ml-m02-data-leakage, ml-m06-batch-vs-online-serving


# Testing and reproducibility in ML
id: ml-m06-testing-reproducibility
track: ml

## What we're learning
ML code needs the same engineering discipline as any code, plus some extra checks:

**Reproducibility**
- Pin library versions and environments (lock files, containers).
- Fix random seeds; record them.
- Version **data** (snapshots, Delta time travel versions, dataset hashes) along with code and models.
- Log everything with experiment tracking.

**Testing**
- Unit tests for feature functions and preprocessing.
- **Data tests**: schema, ranges, nulls and distributions of training and scoring inputs.
- **Model tests**: performance above a baseline on a fixed holdout, no big drop versus the current model, sanity checks (invariance: changing the customer's name does not change the score; directional: higher debt should not lower risk).
- **Fairness** checks per group.
- **Integration tests** that load the registered model and score sample inputs exactly as production will.

## Benefit
A model that cannot be reproduced cannot be audited, debugged or safely retrained; tests catch regressions before they reach users.

## Limits and misconceptions
- Perfect bit-for-bit reproducibility on GPUs is hard; aim for statistically equivalent results.
- Testing on the same data used for tuning gives false confidence.

## Remember this
Pin environments, fix seeds and version data, and test features, data, model quality and behaviour before promotion.

## Related
ml-m06-experiment-tracking, python-m08-pytest, python-m02-uv-poetry-lockfiles


# ML on Spark, Fabric, Databricks and Snowflake
id: ml-m06-ml-on-platforms
track: ml

## What we're learning
How the data platforms support ML (details in each platform track):

- **Spark MLlib**: distributed algorithms (linear models, trees, gradient-boosted trees, ALS, clustering) and pipelines for data too large for one machine. For deep learning, distributed training uses tools such as TorchDistributor or Ray on Spark clusters. Many teams prepare features in Spark and train with single-node libraries on samples or aggregated data, or use pandas UDFs to train many small models in parallel.
- **Microsoft Fabric**: notebooks with Spark and Python, MLflow-based experiments and model items, AutoML (FLAML), PREDICT for batch scoring, AI functions.
- **Databricks**: ML runtimes, MLflow with models in Unity Catalog, feature engineering with an online store, Model Serving, vector search, agent tooling, GPU compute.
- **Snowflake**: Snowflake ML with feature store, model registry, container runtime for training (CPU and GPU), ML Jobs, and serving on Snowpark Container Services; Cortex for AI functions.

## Benefit
Training and scoring next to governed data avoids copying data to separate ML systems, and reuses the platform's security, lineage and compute.

## Limits and misconceptions
- Distributed training adds complexity; use it only when data or model size requires.
- Platform ML features differ in maturity; dedicated ML platforms may still be better for advanced research.
- MLflow is the common thread, which helps portability of tracking and models across platforms.

## Remember this
Spark scales feature engineering and some algorithms, while Fabric, Databricks and Snowflake each wrap MLflow-style tracking, registries and scoring around governed data.

## Related
fabric-m06-experiments-models, databricks-m06-mlflow-on-databricks, snowflake-m07-snowpark-ml, pyspark-m04-pandas-udfs-arrow
