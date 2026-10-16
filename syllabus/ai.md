# Track: ai — AI and Generative AI

> Changes fastest. Never name specific model versions. Mark uncertain platform feature names with "(verify)".

## ai-m01 — Landscape
- ai-m01-ai-ml-dl-genai | AI vs ML vs deep learning vs generative AI | How the terms nest and what each adds | code: no | related: ml-m02-supervised-unsupervised
- ai-m01-what-llms-can-cannot-do | What LLMs can and cannot do | Strengths, failure patterns, and tasks where classic software or ML is better | code: no | related: ai-m08-hallucinations

## ai-m02 — Deep learning in practice
- ai-m02-cnns | Convolutional neural networks | Learning from images and grids with convolutions | code: no | related: ml-m05-neural-network-basics
- ai-m02-sequence-models | Sequence models before transformers | RNNs and LSTMs and the problems transformers solved | code: no | related: ai-m03-attention-transformers
- ai-m02-transfer-learning | Transfer learning | Reusing pretrained models and fine-tuning them for a new task | code: no | related: ai-m07-fine-tuning

## ai-m03 — Transformers and LLMs
- ai-m03-tokenization | Tokenisation | Text to tokens, subword vocabularies, why tokens drive cost and limits | code: no | related: ai-m04-cost-latency
- ai-m03-embeddings | Embeddings | Representing meaning as vectors and measuring similarity | code: no | related: ai-m05-vector-search
- ai-m03-attention-transformers | Attention and the transformer | Self-attention, encoder and decoder architectures, why it scales | code: no | related: ai-m02-sequence-models
- ai-m03-pretraining-alignment | Pretraining, fine-tuning and alignment | How a base model becomes an assistant: instruction tuning and preference training at concept level | code: no | related: ai-m07-fine-tuning
- ai-m03-context-windows | Context windows | What fits in a prompt, long-context trade-offs, and context management | code: no | related: ai-m05-rag-overview
- ai-m03-inference-parameters | Inference parameters | Temperature, top-p, max tokens, stop sequences, and reasoning modes | code: no | related: ai-m04-prompting

## ai-m04 — Using LLMs
- ai-m04-prompting | Prompting | Clear instructions, examples, roles, and structure in prompts | code: yes | related: ai-m03-inference-parameters
- ai-m04-structured-outputs | Structured outputs | Getting JSON that matches a schema, and validating it | code: yes | related: ai-m09-llm-extraction
- ai-m04-tool-calling | Tool and function calling | How a model asks your code to run a function and uses the result | code: yes | related: ai-m06-tool-using-agents
- ai-m04-cost-latency | Cost and latency | Tokens, model size choices, batching, caching and streaming | code: no | related: ai-m10-cost-control

## ai-m05 — Retrieval-augmented generation
- ai-m05-rag-overview | RAG: retrieval-augmented generation | Grounding answers in your own documents; when RAG beats fine-tuning | code: no | related: ai-m11-rag-internal-docs
- ai-m05-chunking | Chunking and document preparation | Splitting documents, metadata, parsing PDFs and tables | code: no | related: ai-m09-unstructured-pipelines
- ai-m05-vector-search | Vector search and indexes | Approximate nearest neighbour search, index types, filtering | code: no | related: tools-m10-vector-databases, ai-m03-embeddings
- ai-m05-hybrid-search | Hybrid search | Combining keyword (BM25) and vector search | code: no | related: ai-m05-vector-search
- ai-m05-reranking | Reranking | Second-stage models that reorder retrieved results | code: no | related: ai-m05-hybrid-search
- ai-m05-rag-evaluation | Evaluating RAG | Retrieval metrics, answer faithfulness and relevance, test sets | code: no | related: ai-m08-evals

## ai-m06 — Agents
- ai-m06-tool-using-agents | Tool-using agents | The agent loop: model, tools, observations, stopping | code: no | related: ai-m04-tool-calling
- ai-m06-planning | Planning and reasoning patterns | Plan-then-act, reflection, decomposition and their costs | code: no | related: ai-m06-tool-using-agents
- ai-m06-memory | Agent memory | Short-term context, long-term stores and summarisation | code: no | related: ai-m03-context-windows
- ai-m06-mcp | Model Context Protocol | A standard way to connect models to tools and data sources | code: no | related: ai-m04-tool-calling
- ai-m06-multi-agent | Multi-agent patterns | Orchestrator and worker, handoffs, and when one agent is better | code: no | related: ai-m06-failure-modes
- ai-m06-failure-modes | Agent failure modes | Loops, wrong tools, compounding errors, cost blowups and how to contain them | code: no | related: ai-m08-guardrails

## ai-m07 — Adaptation
- ai-m07-fine-tuning | Fine-tuning | Supervised fine-tuning, data needs, what it changes and what it does not | code: no | related: ai-m03-pretraining-alignment
- ai-m07-lora-peft | LoRA and parameter-efficient fine-tuning | Training small adapters instead of all weights | code: no | related: ai-m07-fine-tuning
- ai-m07-distillation | Distillation | Training a small model to imitate a larger one | code: no | related: ai-m04-cost-latency
- ai-m07-when-not-to-fine-tune | When not to fine-tune | Prompting, RAG and tools first; signs that fine-tuning is justified | code: no | related: ai-m05-rag-overview

## ai-m08 — Evaluation and safety
- ai-m08-evals | Evaluating LLM applications | Test sets, graders, LLM-as-judge and regression testing | code: no | related: ai-m05-rag-evaluation
- ai-m08-hallucinations | Hallucinations | Why models produce confident errors and how to reduce them | code: no | related: ai-m05-rag-overview
- ai-m08-prompt-injection | Prompt injection | Untrusted content steering a model, and defences | code: no | related: ai-m08-guardrails
- ai-m08-guardrails | Guardrails | Input and output checks, policy filters, human approval | code: no | related: ai-m08-prompt-injection
- ai-m08-privacy | Privacy and data protection | Sending data to models, retention, PII handling, private deployment | code: no | related: fabric-m08-sensitivity-labels
- ai-m08-responsible-ai | Responsible AI and regulation (verify) | Principles, risk management, and an overview of regulation such as the EU AI Act | code: no | related: ml-m04-fairness

## ai-m09 — AI in data engineering
- ai-m09-text-to-sql | Text-to-SQL | Generating SQL from questions, why schema context and semantics matter | code: no | related: ai-m11-text-to-sql-assistant, databricks-m05-genie
- ai-m09-llm-extraction | LLM-based extraction | Turning documents and free text into structured records | code: yes | related: ai-m04-structured-outputs
- ai-m09-metadata-enrichment | Metadata enrichment | Generating descriptions, tags and classifications for catalogs | code: no | related: tools-m06-catalogs-explained
- ai-m09-dq-triage | Data quality triage with LLMs | Summarising failures, suggesting causes, routing issues | code: no | related: ai-m11-dq-triage-agent
- ai-m09-unstructured-pipelines | Unstructured data pipelines | Ingesting documents, images and audio for search and analytics | code: no | related: ai-m05-chunking
- ai-m09-platform-ai-features | AI features in Fabric, Databricks and Snowflake (verify) | AI functions in SQL, assistants and agents built into the platforms | code: no | related: fabric-m06-copilot-ai-features, snowflake-m07-cortex, databricks-m06-agent-tooling

## ai-m10 — LLMOps
- ai-m10-deployment | Deploying LLM applications | Hosted APIs versus self-hosted models, regions and quotas | code: no | related: tools-m10-model-serving
- ai-m10-monitoring | Monitoring LLM applications | Tracing, quality signals, user feedback, drift in usage | code: no | related: ai-m08-evals
- ai-m10-caching | Caching | Prompt caching, response caching and semantic caching | code: no | related: ai-m04-cost-latency
- ai-m10-gateways | LLM gateways | Routing, rate limits, fallbacks, keys and logging in one place | code: no | related: ai-m10-cost-control
- ai-m10-cost-control | Cost control | Budgets, model routing, token limits and usage reporting | code: no | related: ai-m04-cost-latency

## ai-m11 — Reference architectures
- ai-m11-rag-internal-docs | Reference: RAG over internal documentation | The components and decisions for a document Q&A assistant | code: no | related: ai-m05-rag-overview
- ai-m11-text-to-sql-assistant | Reference: a text-to-SQL assistant | Semantic layer, schema retrieval, query validation and permissions | code: no | related: ai-m09-text-to-sql, tools-m08-semantic-layers
- ai-m11-dq-triage-agent | Reference: an agent that triages data quality issues | Inputs, tools, guardrails and human handoff for DQ incidents | code: no | related: ai-m09-dq-triage, tools-m07-data-observability
