# Cortex AI features
id: snowflake-m07-cortex
track: snowflake
verified: 2026-10

## What we're learning
**Snowflake Cortex** is Snowflake's set of AI services running inside the platform:

- **Cortex AI Functions** (also called AISQL): SQL functions that call large language models on table data: `AI_COMPLETE`, `AI_CLASSIFY`, `AI_FILTER`, `AI_AGG`, `AI_EXTRACT`, `AI_SENTIMENT`, `AI_SUMMARIZE_AGG`, `AI_TRANSLATE`, `AI_EMBED`, `AI_PARSE_DOCUMENT`, `AI_TRANSCRIBE`, `AI_REDACT` and others. They replace the older `SNOWFLAKE.CORTEX.*` functions. Billed by tokens.
- **Cortex Search**: managed hybrid (vector and keyword) search over text, used for RAG.
- **Cortex Analyst**: natural-language questions turned into SQL over **semantic views** that define metrics and relationships.
- **Cortex Agents** (GA November 2025): orchestrate Analyst, Search and other tools to answer multi-step questions.
- User-facing products built on these were renamed in 2026: **Snowflake Intelligence** became **Snowflake CoWork** (a business-user agent), and the coding assistant **Cortex Code** is now called **CoCo**.

Data stays inside Snowflake's security boundary, and AI spend can be controlled with budgets.

## Benefit
Analysts can classify, extract and summarise text with SQL, and teams can build governed search and question-answering on Snowflake data without moving it to an external AI service.

## Limits and misconceptions
- Model availability varies by region; cross-region inference may need to be enabled.
- Running AI functions over millions of rows can be expensive; test on samples and set budgets.
- Text-to-SQL quality depends on semantic view quality.
- Product names and statuses changed often in 2025-2026; check current documentation.

## Remember this
Cortex brings LLM functions to SQL, plus managed search, text-to-SQL over semantic views, and agents, all inside Snowflake.

## Related
ai-m09-platform-ai-features, ai-m05-rag-overview, ai-m09-text-to-sql, tools-m08-semantic-layers


# Snowflake ML
id: snowflake-m07-snowpark-ml
track: snowflake
verified: 2026-10

## What we're learning
**Snowflake ML** is the set of tools for the machine learning lifecycle on Snowflake:

- **Feature Store**: feature views over Snowflake tables, with point-in-time lookups for training (an online store was in preview in 2026).
- **Model training**: Python with Snowpark, or the **Container Runtime** (CPU and GPU compute pools with popular ML libraries) through notebooks or **ML Jobs** submitted from any IDE.
- **Experiment tracking** (GA 2026).
- **Model Registry**: versions, metrics and deployment of models for batch inference in warehouses or real-time inference on Snowpark Container Services.
- **ML Observability**: monitoring of drift and performance.

## Benefit
Training and serving next to governed data, with the same roles and policies, avoids exporting data to a separate ML platform.

## Limits and misconceptions
- For large-scale deep learning or advanced experimentation, dedicated ML platforms may still be stronger.
- GPU compute pools cost credits while running; manage their lifecycle.
- Some components were preview in 2026; check status for production use.

## Remember this
Snowflake ML provides feature store, container-based training, experiment tracking, registry and serving inside Snowflake's governance.

## Related
ml-m06-ml-on-platforms, snowflake-m04-snowpark, ml-m06-feature-stores, ml-m06-model-registry


# Snowflake Notebooks
id: snowflake-m07-notebooks
track: snowflake
verified: 2026-10

## What we're learning
**Snowflake Notebooks** run Python, SQL and Markdown cells inside Snowflake. The newer form, **Notebooks in Workspaces** (GA February 2026), runs on the **Container Runtime** with CPU or GPU compute pools, keeps files in Git-backed workspaces, and supports popular Python ML libraries. The older notebooks ran on a warehouse runtime and still exist. Workspaces also host Python files and Streamlit apps.

## Benefit
Exploration, feature engineering and model training happen next to governed data, with no local data copies and with Git for versioning.

## Limits and misconceptions
- Notebook compute pools cost credits while active; set idle timeouts.
- The two notebook runtimes differ in capabilities; check which one a team is using.
- As on any platform, notebook-only logic is hard to test; move reusable code to modules.

## Remember this
Snowflake Notebooks run Python and SQL next to the data, with container runtimes and Git-backed workspaces.

## Related
python-m08-notebooks-vs-scripts, snowflake-m07-snowpark-ml, databricks-m03-notebooks
