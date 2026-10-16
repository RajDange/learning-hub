# Text-to-SQL
id: ai-m09-text-to-sql
track: ai
verified: 2026-10

## What we're learning
**Text-to-SQL** turns a natural-language question into a SQL query, runs it, and presents the answer. Simple academic benchmarks (Spider 1.0) are largely solved, but enterprise-style benchmarks show the real difficulty: on **Spider 2.0** (large real schemas with hundreds or thousands of columns, multi-step queries, dialects such as Snowflake and BigQuery), the best systems in the original 2024 paper solved only around 10 to 20 percent; top agentic systems on the leaderboard reached roughly 60 to 75 percent by 2026. On **BIRD**, top systems approach but do not match human accuracy.

What makes it work in practice:
- **A semantic layer** or curated metric definitions, so the model selects governed metrics and joins instead of inventing them.
- **Schema retrieval**: only relevant tables and columns, with good descriptions, sample values and example queries.
- **Validation loops**: run the query (read-only, row-limited), check errors and results, and retry.
- **Clarifying questions** for ambiguous requests.
- Showing the SQL and the definitions used, so users can verify.

Platform products include Databricks Genie, Fabric data agents and Copilot, Snowflake Cortex Analyst, and BI tools' natural-language features.

## Benefit
Business users get answers without writing SQL, and analysts save time on routine queries, provided definitions are governed.

## Limits and misconceptions
- An executable query can still be semantically wrong; benchmarks scoring execution accuracy overstate usefulness.
- Always run generated SQL with the user's own permissions, read-only, with limits.
- Most failures come from ambiguous business terms, not SQL syntax.

## Remember this
Text-to-SQL works when backed by a semantic layer, curated schema context, read-only execution and validation; enterprise accuracy is still far from perfect.

## Related
ai-m11-text-to-sql-assistant, tools-m08-semantic-layers, databricks-m05-genie, snowflake-m07-cortex


# LLM-based extraction
id: ai-m09-llm-extraction
track: ai
verified: 2026-10

## What we're learning
Many business inputs are unstructured: invoices, contracts, emails, support tickets, forms, call transcripts. **LLM-based extraction** turns them into structured records:

1. Parse the document (text, layout, OCR or a multimodal model for scans and images).
2. Prompt the model with a **schema** (fields, types, allowed values, definitions) and use **structured outputs** for valid JSON.
3. **Validate**: types, ranges, cross-field rules (line totals sum to the invoice total), reference data lookups.
4. Route low-confidence or failing records to **human review**; feed corrections back into the evaluation set.
5. Load results into tables with lineage to the source document.

Platforms offer this in SQL and pipelines (AI functions in Fabric, Snowflake `AI_EXTRACT` and document parsing, Databricks AI functions).

## Benefit
Processes that needed manual data entry or brittle template rules can be automated across varied document layouts.

## Code snippet
```python
from pydantic import BaseModel
from typing import Optional

class ContractTerms(BaseModel):
    counterparty: str
    start_date: Optional[str]          # ISO date; null if not stated
    end_date: Optional[str]
    notice_period_days: Optional[int]
    auto_renewal: Optional[bool]

# send ContractTerms.model_json_schema() as the response schema, then:
terms = ContractTerms.model_validate_json(model_response)
```

## Limits and misconceptions
- Accuracy must be measured per field on a labelled sample; overall impressions mislead.
- Allow nulls; forcing a value invites invented data.
- Cost scales with document length and volume; estimate tokens per document.
- Personal and confidential data in documents brings privacy obligations.

## Remember this
Extract with a schema and structured outputs, validate with rules, send uncertain records to people, and measure accuracy per field.

## Related
ai-m04-structured-outputs, ai-m09-unstructured-pipelines, ai-m08-hallucinations


# Metadata enrichment
id: ai-m09-metadata-enrichment
track: ai
verified: 2026-10

## What we're learning
Catalogs are only useful when tables and columns have descriptions, owners, tags and glossary links, and most do not. LLMs can draft this metadata:

- **Descriptions** of tables and columns from names, sample values, lineage, SQL definitions and existing documentation.
- **Classification and tags**: identifying personal data, financial data, codes and identifiers, suggesting sensitivity labels.
- **Glossary mapping**: linking columns to business terms.
- **Query and usage summaries**: what a table is used for, from query logs.

Platforms include AI-generated descriptions and classification (Unity Catalog AI-generated comments, Snowflake classification with AI modes, Purview and catalog vendors' AI features).

## Benefit
Drafting metadata at scale makes discovery and governance practical for estates with thousands of tables, and gives stewards something to review instead of a blank page.

## Limits and misconceptions
- Generated descriptions can be confidently wrong; treat them as drafts that owners approve, and mark them as AI-generated.
- Classification should combine LLMs with rule-based and pattern detectors; sensitive data missed is a compliance risk.
- Sending sample data to a model has privacy implications; use platform-integrated features or masked samples.

## Remember this
Use LLMs to draft descriptions, tags and glossary links for catalogs, with human owners approving what is published.

## Related
tools-m06-catalogs-explained, snowflake-m06-tags-classification, fabric-m08-purview-integration


# Data quality triage with LLMs
id: ai-m09-dq-triage
track: ai
verified: 2026-10

## What we're learning
Data quality and observability tools produce many alerts. LLMs help **triage** them:

- **Summarise** the failure in plain language: what check failed, how badly, since when.
- **Gather context** with tools: recent pipeline runs and errors, upstream schema changes, lineage, recent code commits, similar past incidents.
- **Suggest likely causes** (a source sent duplicate files; a column was renamed upstream; a holiday explains low volume).
- **Route** to the right owner with a severity estimate, and draft the incident note.

Humans decide fixes and confirm causes; the LLM reduces the time from alert to understanding.

## Benefit
Faster triage means shorter data incidents and less alert fatigue for on-call engineers.

## Limits and misconceptions
- Suggested causes are hypotheses; acting on them automatically (reloading, deleting) needs approval.
- Triage quality depends on available context: lineage, run logs and ownership metadata.
- Logs and data samples can contain sensitive information; control what the model sees.

## Remember this
LLMs speed up data quality triage by summarising failures, gathering context through tools and suggesting causes, while people decide the fix.

## Related
ai-m11-dq-triage-agent, tools-m07-data-observability, tools-m06-lineage


# Unstructured data pipelines
id: ai-m09-unstructured-pipelines
track: ai
verified: 2026-10

## What we're learning
GenAI makes **unstructured data** (documents, emails, images, audio, video) usable at scale, and data engineering now builds pipelines for it:

1. **Ingest** files and their metadata (source, owner, permissions, timestamps) into governed storage (volumes, lakehouse Files, stages).
2. **Parse**: text extraction, OCR, layout and table recognition, transcription for audio, multimodal models for images.
3. **Enrich**: classification, entity and field extraction, summaries, language detection, PII detection and redaction.
4. **Chunk and embed** for search and RAG; keep chunks linked to source documents and their **access rights**.
5. **Store** structured results in tables and vectors in indexes; track lineage.
6. **Process incrementally**: only new and changed documents, with deletes propagated to indexes.

Platform features cover much of this (AI functions and document parsing in Databricks, Snowflake and Fabric; vector search services; Auto Loader-style incremental ingestion).

## Benefit
Treating documents as a governed data product, rather than one-off scripts per chatbot, gives reusable, permission-aware, up-to-date content for many AI applications.

## Limits and misconceptions
- Parsing quality (tables, scans, multi-column layouts) often limits everything downstream.
- Permissions must flow from source documents to chunks and indexes, or AI apps leak data.
- Re-processing with a new parser or embedding model is a backfill; plan for it.

## Remember this
Build unstructured pipelines like data pipelines: ingest with metadata and permissions, parse, enrich, chunk and embed incrementally, with lineage.

## Related
ai-m05-chunking, ai-m09-llm-extraction, databricks-m02-volumes, pyspark-m09-auto-loader


# AI features in Fabric, Databricks and Snowflake (verify)
id: ai-m09-platform-ai-features
track: ai
verified: 2026-10

## What we're learning
All three platforms bring generative AI next to governed data (names as of October 2026; they change often):

| Capability | Microsoft Fabric | Databricks | Snowflake |
|---|---|---|---|
| AI functions in SQL or DataFrames | AI functions (pandas, PySpark, T-SQL) | AI functions in SQL | Cortex AI Functions (AISQL) |
| Natural language to data | Copilot, Fabric data agents | Genie (agents, Genie One) | Cortex Analyst, CoWork (formerly Snowflake Intelligence) |
| Vector or hybrid search | Vector types in SQL database and Eventhouse, Azure AI Search | AI Search (formerly Vector Search) | Cortex Search |
| Agents | Data agents, Fabric IQ (preview) | Agent Bricks | Cortex Agents |
| Model serving and gateways | Microsoft Foundry integration | Model Serving, Unity Gateway | Cortex, model serving on containers |
| Coding assistants | Copilot in notebooks and SQL | Genie Code | CoCo (Cortex Code) |

Common traits: data stays within the platform's security boundary, permissions from the catalog apply, usage is billed in the platform's units, and semantic definitions (semantic models, metric views, semantic views) drive natural-language accuracy.

## Benefit
Platform AI features let data teams add extraction, classification, search and question answering to existing pipelines and governance, without new infrastructure.

## Limits and misconceptions
- Feature status (preview or GA), region availability and pricing differ and change quickly; verify before committing.
- Natural-language features are only as accurate as the semantic layer and metadata behind them.
- Lock-in: AI logic built with one platform's functions does not port directly to another.

## Remember this
Fabric, Databricks and Snowflake all offer AI functions, natural-language analytics, vector search and agents inside their governance; check current names and status.

## Related
fabric-m06-copilot-ai-features, snowflake-m07-cortex, databricks-m06-agent-tooling, databricks-m05-genie
