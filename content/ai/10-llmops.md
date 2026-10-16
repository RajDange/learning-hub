# Deploying LLM applications
id: ai-m10-deployment
track: ai
verified: 2026-10

## What we're learning
Ways to run the model behind an LLM application:

- **Hosted provider APIs**: call a model provider's API directly. Fastest to start, newest models, pay per token; check enterprise terms for data use and retention.
- **Cloud platform deployments**: the same or similar models deployed through your cloud (Microsoft Foundry, Amazon Bedrock, Google's agent platform), in your chosen region, under your cloud identity, networking and billing.
- **Data platform AI**: models invoked inside Fabric, Databricks or Snowflake, close to governed data.
- **Self-hosted open models**: run open-weight models with serving engines such as vLLM on your GPUs or Kubernetes, for strict data control, customisation or cost at very high volume.

Deployment concerns: **quotas and rate limits** (tokens per minute), **regional availability**, **failover** to another region or model, **versioning** (pin model versions, test before upgrading), and **secrets and identity** for API access.

## Benefit
Choosing deployment by data sensitivity, latency, volume and team skills avoids both compliance problems and needless infrastructure.

## Compared with
| | Provider API | Cloud platform | Self-hosted open model |
|---|---|---|---|
| Setup effort | Minimal | Low | High (GPUs, serving, scaling) |
| Data control | Contract-based | Your tenant and region | Full |
| Model choice | That provider | Several providers | Open-weight models |
| Cost model | Per token | Per token or provisioned | Infrastructure |

## Limits and misconceptions
- Model versions are retired on provider schedules; plan upgrades with evals.
- Self-hosting is rarely cheaper unless volume is high and steady and the team can operate GPUs.
- Rate limits are a production risk; request capacity or provisioned throughput early.

## Remember this
Deploy through provider APIs, your cloud platform, your data platform or self-hosted models, choosing by data control, volume and operations capacity.

## Related
tools-m10-model-serving, ai-m10-gateways, ai-m08-privacy


# Monitoring LLM applications
id: ai-m10-monitoring
track: ai
verified: 2026-10

## What we're learning
LLM applications need monitoring beyond uptime:

- **Tracing**: record each request as a trace of spans: prompt, retrieval results, tool calls, model calls, outputs, latency and token counts. **OpenTelemetry** has generative AI semantic conventions (still marked experimental in 2026) for model and agent spans; tools include MLflow Tracing, Langfuse, LangSmith, Arize Phoenix and vendor observability platforms.
- **Operational metrics**: latency (time to first token and total), error rates, rate-limit hits, tokens and cost per request, per user and per feature.
- **Quality signals**: user feedback (thumbs, edits), automated evaluations on sampled traffic (groundedness, relevance), guardrail trigger rates, refusal rates.
- **Usage drift**: new kinds of questions the system was not designed or evaluated for.
- **Safety and security**: injection attempts, sensitive data in prompts or outputs.

## Benefit
Monitoring shows when a model update, prompt change or new document set degrades quality, and where cost goes, before users or finance notice.

## Limits and misconceptions
- Logging full prompts and responses creates a sensitive data store; mask, restrict access and set retention.
- Offline evals and production monitoring complement each other; neither is enough alone.
- Token counts and costs differ by provider tokeniser; measure from provider usage data.

## Remember this
Trace every step, track latency, tokens and cost, sample outputs for automated quality checks, and govern the logs as sensitive data.

## Related
ai-m08-evals, ai-m10-cost-control, ml-m06-drift-monitoring, tools-m10-mlflow


# Caching
id: ai-m10-caching
track: ai
verified: 2026-10

## What we're learning
Three kinds of caching reduce LLM cost and latency:

- **Prompt (prefix) caching** at the provider: the model reuses computation for an **identical prompt prefix** (system prompt, tool definitions, long reference documents). Cached input tokens are heavily discounted (commonly around 90 percent) and responses start faster. Caches expire after minutes (some providers offer longer retention for a fee) and break if anything in the prefix changes, so put static content first and dynamic content last.
- **Exact response caching** in your application: identical request, identical answer, returned from a key-value store.
- **Semantic caching**: return a stored answer for a **similar** question, matched by embedding similarity, often at a gateway.

## Benefit
Applications with large fixed instructions or documents (RAG over a stable policy set, agents with many tools) can cut input cost and latency dramatically with prompt caching alone.

## Limits and misconceptions
- Semantic caching risks **wrong answers** for questions that look similar but differ (another customer, another date), stale answers, and **data leakage** across users if cache keys ignore identity. Use it only for generic, non-personalised questions, with strict thresholds.
- Prompt caching does not reduce output token cost.
- Cache behaviour, minimum sizes, durations and prices differ by provider and change; check current documentation.

## Remember this
Order prompts static-first to benefit from provider prompt caching; use semantic caching only for generic questions, scoped per user.

## Related
ai-m04-cost-latency, ai-m10-gateways, snowflake-m03-caching-layers


# LLM gateways
id: ai-m10-gateways
track: ai
verified: 2026-10

## What we're learning
An **LLM gateway** sits between applications and model providers, giving one controlled entry point:

- **Unified API** across providers and models (often OpenAI-compatible), so applications can switch models by configuration.
- **Authentication and key management**: applications use gateway credentials; provider keys stay central.
- **Quotas and rate limits** per application, team or user (tokens per minute, budgets).
- **Routing, load balancing and fallbacks** across models and regions.
- **Logging, tracing and cost attribution** for every call.
- **Guardrails**: content safety, PII redaction, prompt injection detection.
- **Caching** (including semantic caching).
- Increasingly, governance of **MCP servers and agents** as well.

Examples: open-source **LiteLLM**, **Azure API Management** AI gateway policies, **Databricks Unity Gateway** (formerly AI Gateway), cloud and SaaS gateways (Cloudflare, Kong, Portkey and others).

## Benefit
Central control of spending, security, compliance and model choice across many AI applications, without each team rebuilding the same plumbing.

## Limits and misconceptions
- A gateway adds a component to operate and a small latency overhead.
- It is a single point of failure unless deployed redundantly.
- Logging everything centrally concentrates sensitive data; govern it.

## Remember this
An LLM gateway centralises access, quotas, routing, logging, guardrails and caching for all model calls.

## Related
ai-m10-cost-control, ai-m08-guardrails, ai-m10-caching, databricks-m06-model-serving


# Cost control
id: ai-m10-cost-control
track: ai
verified: 2026-10

## What we're learning
LLM costs grow with usage in ways that are easy to miss: long contexts, agents looping, reasoning tokens, embedding re-runs, and popular features scaling. Controls:

- **Measure**: tokens and cost per request, feature, team and user, from gateway or provider usage data, with tags.
- **Budgets and alerts** at provider, cloud or platform level (Snowflake AI budgets, Databricks budgets and usage policies, Azure cost management, gateway quotas).
- **Limits in code**: maximum tokens, maximum agent steps, timeouts, per-user quotas.
- **Model routing**: send easy requests to small models and only hard ones to large models; use distilled or fine-tuned small models for high-volume tasks.
- **Caching** (prompt and response) and **batch APIs** for offline work.
- **Context discipline**: fewer, better retrieved passages; summarised history; compact output formats.
- **Unit economics**: cost per resolved ticket or processed document, compared with the value created.

## Benefit
Cost control keeps successful pilots affordable at production scale and prevents surprise bills from runaway agents.

## Limits and misconceptions
- Cheapest is not best: a cheaper model with more errors may cost more in rework.
- Reasoning modes and agents can multiply tokens per task by large factors; measure before enabling widely.

## Remember this
Measure cost per feature and outcome, enforce budgets and limits, route to the smallest adequate model, and cache and batch.

## Related
ai-m04-cost-latency, ai-m10-gateways, snowflake-m08-resource-monitors-cost, databricks-m07-dbu-cost-model
