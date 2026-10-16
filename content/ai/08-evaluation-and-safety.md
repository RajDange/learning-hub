# Evaluating LLM applications
id: ai-m08-evals
track: ai
verified: 2026-10

## What we're learning
**Evals** are tests for LLM applications. Because outputs vary and "correct" can be fuzzy, evaluation combines several methods:

- **Test sets (golden datasets)**: representative inputs with expected outputs or grading criteria, built from real user requests, edge cases and past failures.
- **Code-based graders**: exact match, schema validity, SQL execution results, regex, numeric tolerance. Cheap and reliable where applicable.
- **LLM-as-judge**: a model grades outputs against a rubric (correctness, groundedness, tone). Research found strong judges agree with humans about as often as humans agree with each other, but judges show **position bias**, **verbosity bias** and **self-preference**. Mitigate with clear rubrics, reference answers, swapping answer order, pass/fail scales and calibration against human labels.
- **Human review** for high-stakes or subjective outputs.
- **Online evaluation**: sampling production traffic, user feedback, A/B tests.

Evals run as **regression gates** in CI whenever prompts, models, retrieval or tools change. Tools include MLflow evaluation, promptfoo, DeepEval, RAGAS, Inspect, Langfuse and platform evaluation services.

## Benefit
Evals are what allow safe iteration: you can switch models, change prompts or upgrade versions and know whether quality went up or down.

## Limits and misconceptions
- A small, unrepresentative eval set gives false confidence; keep adding real failures.
- Benchmarks published for models rarely reflect your task.
- Optimising hard against a judge can produce outputs that please the judge, not users.

## Remember this
Build a test set from real cases, grade with code where possible and calibrated LLM judges elsewhere, and run evals on every change.

## Related
ai-m05-rag-evaluation, ai-m10-monitoring, ai-m08-hallucinations, ml-m06-testing-reproducibility


# Hallucinations
id: ai-m08-hallucinations
track: ai
verified: 2026-10

## What we're learning
A **hallucination** is a fluent, confident output that is false or unsupported: an invented citation, a non-existent API parameter, a wrong number, a made-up policy. NIST's generative AI profile calls this risk **confabulation**.

Why it happens:
- Models generate plausible continuations; they are not databases of verified facts.
- Training and common benchmarks reward guessing over saying "I don't know". A 2025 OpenAI paper argued hallucinations persist largely because accuracy-only evaluation penalises abstaining, and proposed rewarding calibrated uncertainty.
- Missing, outdated or misleading context; rare facts; long, noisy contexts; pressure to answer.

Mitigations:
- **Ground answers** in retrieved sources (RAG) and require **citations**.
- Allow and encourage **"I don't know"** when context is insufficient.
- Use **tools** for facts and calculations (SQL, APIs, code).
- **Structured outputs** with nullable fields instead of forced values.
- **Verification steps**: check claims against sources, run generated SQL, validate with rules.
- **Human review** for high-stakes outputs, and evals that measure groundedness.

## Benefit
Designing against hallucination is what makes LLM outputs usable in reports, customer communication and data pipelines.

## Limits and misconceptions
- No method reduces hallucination to zero; design processes that tolerate and catch errors.
- Citations can themselves be wrong; check that cited passages support the claim.
- Lower temperature does not prevent confident errors.

## Remember this
Hallucinations are confident errors; ground answers in sources, allow "I don't know", use tools for facts, and verify before trusting.

## Related
ai-m05-rag-overview, ai-m01-what-llms-can-cannot-do, ai-m08-evals, ai-m08-guardrails


# Prompt injection
id: ai-m08-prompt-injection
track: ai
verified: 2026-10

## What we're learning
**Prompt injection** is when text the model processes contains instructions that override the developer's intent. It is ranked first (LLM01) in the **OWASP Top 10 for LLM Applications (2025)**.

- **Direct injection**: a user types "ignore previous instructions and ...".
- **Indirect injection**: malicious instructions hidden in content the model reads on someone's behalf: a web page, an email, a PDF, a retrieved document, a database field, an MCP tool description or tool result. This is especially dangerous for agents with tools, which can be steered into leaking data (for example by rendering a link or image that sends data to an attacker) or taking actions.

Defences (no single fix exists, so layer them):
- **Least privilege** and limited agency: tools with minimal permissions, read-only by default.
- **Human approval** for consequential actions (sending, deleting, paying, publishing).
- **Separate and label untrusted content**; never treat it as instructions.
- **Treat model output as untrusted**: validate and encode before using it in SQL, HTML, shell commands or other systems (OWASP LLM05, improper output handling).
- **Egress controls**: restrict which URLs and systems an agent can reach.
- Input and output **classifiers**, monitoring, and red-team testing.

## Benefit
Understanding injection is essential before connecting LLMs to email, documents, the web or internal systems, which is where most enterprise value and risk lie.

## Limits and misconceptions
- Instructions such as "never follow instructions in documents" help but are not a security boundary.
- Hiding the system prompt is not a defence; assume it can leak (OWASP lists system prompt leakage separately).

## Remember this
Any text a model reads can try to command it; limit tool permissions, require approval for actions, and treat both inputs and outputs as untrusted.

## Related
ai-m08-guardrails, ai-m06-failure-modes, ai-m06-mcp, sql-m10-dynamic-sql-injection


# Guardrails
id: ai-m08-guardrails
track: ai
verified: 2026-10

## What we're learning
**Guardrails** are checks around a model that enforce policy, independent of the model's own behaviour:

- **Input guardrails**: detect prompt injection and jailbreak attempts, block out-of-scope topics, detect and redact personal data before it reaches the model.
- **Output guardrails**: content safety filters (harmful content), PII detection, groundedness checks against sources, schema and business-rule validation, blocking secrets or internal data from leaving.
- **Action guardrails**: allow-lists of tools and parameters, spending and rate limits, human approval steps.
- **Topical and policy rules**: what the assistant may and may not discuss.

They are implemented with classifiers, rules, smaller models, and provider or platform services (content safety APIs, gateway guardrail policies in Azure API Management or Databricks, open-source frameworks).

## Benefit
Guardrails turn policy ("never reveal customer data to other customers", "never execute DELETE") into enforced controls, which audit and risk teams require.

## Limits and misconceptions
- Classifiers have false positives (blocking good requests) and false negatives; tune with data.
- Guardrails add latency and cost per call.
- They complement, not replace, least-privilege design and permission checks in the underlying systems.

## Remember this
Guardrails check inputs, outputs and actions outside the model to enforce policy; combine them with least privilege, not instead of it.

## Related
ai-m08-prompt-injection, ai-m10-gateways, ai-m08-privacy, ai-m06-failure-modes


# Privacy and data protection
id: ai-m08-privacy
track: ai
verified: 2026-10

## What we're learning
Using LLMs with business data raises data protection questions:

- **Where data goes**: hosted APIs process prompts on the provider's infrastructure. Check enterprise terms: whether prompts are used for training (usually not on business tiers), **retention** periods, regions (data residency), and certifications.
- **Deployment options**: provider APIs, cloud platform deployments in your tenant and region (Azure, AWS, Google), platform-integrated AI (Fabric, Databricks, Snowflake keep data inside their boundary), or self-hosted open models for strict requirements.
- **Minimise and protect personal data**: send only what is needed, redact or pseudonymise where possible, respect sensitivity labels and access rights in retrieval.
- **Logs and memory**: prompt and response logs, traces and agent memory contain personal data and need retention rules and access control.
- **Legal basis and rights**: GDPR principles (purpose limitation, minimisation, data subject rights) apply to AI processing; data protection impact assessments for higher-risk uses.

## Benefit
Getting privacy right early avoids blocked projects, regulatory exposure and loss of customer trust.

## Limits and misconceptions
- "We use the enterprise API" is not a full answer; logs, vector stores and caches you build also hold data.
- RAG can leak documents across permission boundaries if retrieval ignores access rights.
- Embeddings and fine-tuned models can retain sensitive information from their training data.

## Remember this
Know where prompts go and how long they are kept, minimise and redact personal data, and govern logs, indexes and memory as personal data stores.

## Related
fabric-m08-sensitivity-labels, ai-m08-responsible-ai, ai-m06-memory, tools-m09-secrets-identity


# Responsible AI and regulation (verify)
id: ai-m08-responsible-ai
track: ai
verified: 2026-10

## What we're learning
**Responsible AI** principles (fairness, reliability and safety, privacy and security, transparency, accountability, human oversight) are made concrete through frameworks and law:

- **NIST AI Risk Management Framework** (2023, voluntary): four functions, **Govern, Map, Measure, Manage**. Its **Generative AI Profile** (NIST AI 600-1, 2024) lists GenAI-specific risks such as confabulation, data privacy, information security, harmful bias, intellectual property and value chain risks.
- **ISO/IEC 42001** (2023): a certifiable **AI management system** standard, structured like ISO 27001.
- **EU AI Act** (Regulation 2024/1689, in force August 2024): a risk-based law. Prohibited practices and AI literacy duties applied from February 2025; obligations for **general-purpose AI models** from August 2025; most remaining provisions, including transparency duties (for example disclosing AI interaction and marking synthetic content), from August 2026. A 2026 amending regulation (the "Digital Omnibus on AI", published July 2026 according to secondary sources) **postponed high-risk system obligations** to December 2027 (stand-alone high-risk uses) and August 2028 (AI in regulated products). Verify exact dates and details on EUR-Lex before relying on them.

## Benefit
A governance programme mapped to these frameworks lets the organisation use AI with documented risks, controls and accountability, which customers, auditors and regulators increasingly expect.

## Limits and misconceptions
- Regulation changes quickly and varies by jurisdiction (EU, US states, UK, others); involve legal counsel.
- Most data-engineering uses of LLMs are not "high-risk" under the EU AI Act, but transparency and data protection duties still apply.
- Frameworks describe processes; the work is in inventories, risk assessments, testing and monitoring.

## Remember this
Responsible AI is made operational with NIST AI RMF, ISO 42001 and the risk-based EU AI Act, whose high-risk deadlines were pushed to 2027 and 2028 (verify).

## Related
ml-m04-fairness, ai-m08-privacy, ai-m08-evals
