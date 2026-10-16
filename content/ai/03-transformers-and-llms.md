# Tokenisation
id: ai-m03-tokenization
track: ai
verified: 2026-10

## What we're learning
Language models do not see characters or words; they see **tokens**: pieces of text from a fixed **vocabulary**, typically tens of thousands to a few hundred thousand entries. Most tokenisers use **subword** schemes such as **byte-pair encoding (BPE)**, which merges frequent character sequences into single tokens. Common words become one token; rare words, names and codes split into several; byte-level BPE can represent any input.

A rough rule for English: one token is about four characters or three quarters of a word. Other languages, code, numbers and unusual formatting often need more tokens per word.

## Benefit
Tokens are the unit of **cost** (pricing per input and output token), **limits** (context windows and output limits are in tokens) and **latency** (output is generated token by token). Estimating tokens is the first step in sizing an LLM workload.

## Limits and misconceptions
- Tokenisation explains odd weaknesses: miscounting letters, trouble with long numbers or reversing strings, because the model sees chunks, not characters.
- Different model families use different tokenisers; token counts are not comparable across providers.
- JSON, tables and verbose formatting consume many tokens; compact formats save money.

## Remember this
LLMs read and write subword tokens; tokens set cost, context limits and latency, and explain some character-level quirks.

## Related
ai-m04-cost-latency, ai-m03-context-windows, ai-m03-embeddings


# Embeddings
id: ai-m03-embeddings
track: ai
verified: 2026-10

## What we're learning
An **embedding** is a vector of numbers (commonly a few hundred to a few thousand dimensions) that represents the **meaning** of a piece of content: a word, sentence, document, image or product. Embedding models are trained so that similar content gets nearby vectors. **Similarity** is measured with **cosine similarity** or dot product.

Uses:
- **Semantic search and RAG**: embed documents and queries, retrieve the nearest documents.
- **Clustering and deduplication** of text.
- **Classification** with a small model on top of embeddings.
- **Recommendations** and matching (products to queries, CVs to jobs).

Embeddings come from dedicated embedding models (API-based or open models), not usually from chat models directly. Some models support **truncating** vectors to fewer dimensions with modest quality loss, saving storage.

## Benefit
Embeddings turn unstructured content into something you can index, compare and join, which is the foundation of most enterprise GenAI applications.

## Limits and misconceptions
- Similar is not the same as relevant: an embedding may match topic but miss exact identifiers or negation. Combine with keyword search.
- Vectors from different models are not comparable; changing the model means re-embedding everything.
- Embeddings can leak information about the source text; protect them like the data.

## Remember this
Embeddings map content to vectors where nearness means similar meaning; they power semantic search, RAG, clustering and matching.

## Related
ai-m05-vector-search, tools-m10-vector-databases, ml-m01-linear-algebra, ml-m03-knn


# Attention and the transformer
id: ai-m03-attention-transformers
track: ai
verified: 2026-10

## What we're learning
The **transformer** (introduced in "Attention Is All You Need", 2017) is the architecture behind modern language models. Its core is **self-attention**: for each token, the model computes how much to "attend" to every other token in the context and builds a new representation as a weighted mix of them. Many attention **heads** in parallel capture different relationships (syntax, references, topics). **Positional information** is added because attention itself ignores order.

A transformer stacks layers of attention and feed-forward networks with residual connections and normalisation. Variants:
- **Encoder-only** (BERT-style): read the whole input; good for classification and embeddings.
- **Decoder-only** (most chat LLMs): generate text one token at a time, attending only to earlier tokens.
- **Encoder-decoder**: translation and summarisation models.

## Benefit
Attention connects any two tokens directly, capturing long-range context, and the whole sequence is processed in parallel during training, which allowed scaling to enormous datasets and models.

## Limits and misconceptions
- Standard attention cost grows **quadratically** with sequence length, which is why long contexts are expensive; many efficiency techniques exist.
- Generation is still sequential: each output token needs a forward pass, so long outputs are slow.
- Attention weights are not a reliable explanation of why the model produced an answer.

## Remember this
Transformers use self-attention to relate every token to every other in parallel; decoder-only transformers generate text token by token.

## Related
ai-m02-sequence-models, ai-m03-context-windows, ai-m03-pretraining-alignment


# Pretraining, fine-tuning and alignment
id: ai-m03-pretraining-alignment
track: ai
verified: 2026-10

## What we're learning
An assistant-style LLM is built in stages:

1. **Pretraining**: a large transformer learns to predict the next token over a huge corpus of text and code (self-supervised). The result is a **base model**: knowledgeable but not good at following instructions.
2. **Supervised fine-tuning (instruction tuning)**: training on curated examples of instructions and good responses teaches the model to follow requests and use a conversational format.
3. **Preference training (alignment)**: the model is tuned toward responses people prefer and away from harmful ones. Methods include **RLHF** (a reward model learned from human preference comparisons, then reinforcement learning), **DPO** (optimising directly on preference pairs without a separate reward model), AI-feedback variants, and **reinforcement learning with verifiable rewards** to improve step-by-step reasoning on tasks such as maths and code.
4. Safety training, evaluation and red-teaming throughout.

## Benefit
Knowing the stages explains model behaviour: knowledge comes mostly from pretraining (with a cutoff date), helpfulness and tone from fine-tuning, and refusals and caution from alignment.

## Limits and misconceptions
- Alignment shapes behaviour but does not guarantee correctness or safety; models can still hallucinate or be manipulated.
- Fine-tuning a model yourself adapts style and format far more easily than it adds reliable new knowledge.
- Training details of commercial models are largely undisclosed.

## Remember this
Pretraining gives knowledge, instruction tuning gives helpfulness, and preference training gives aligned behaviour; none of them guarantees truth.

## Related
ai-m07-fine-tuning, ai-m08-hallucinations, ai-m02-transfer-learning


# Context windows
id: ai-m03-context-windows
track: ai
verified: 2026-10

## What we're learning
The **context window** is the maximum number of tokens a model can consider at once: the system prompt, conversation history, retrieved documents, tool definitions and results, **plus** the output it generates. In 2026 most frontier models offer windows from roughly a hundred thousand to around a million tokens, some more; smaller and local models often much less. Output limits are much smaller than input limits.

A bigger window does not mean equally good use of it. Research has shown that models use information at the **start and end** of long contexts better than in the middle ("lost in the middle"), and that performance degrades as input grows, even well below the limit, especially with similar-looking distractors ("context rot").

**Context engineering** is the practice of giving the model the minimum high-value context for each step: concise instructions, only relevant retrieved passages, summarised history, trimmed tool outputs, and sub-tasks with clean contexts.

## Benefit
Managing context well improves answer quality while cutting cost and latency, which both grow with input tokens.

## Limits and misconceptions
- For small, stable knowledge bases (on the order of a couple of hundred thousand tokens), putting everything in the prompt with prompt caching can be simpler than RAG.
- For large or changing corpora, retrieval remains necessary.
- Needle-in-a-haystack demos overstate real long-context reasoning.

## Remember this
The context window bounds what a model can see, but quality drops as context grows, so supply the smallest relevant context.

## Related
ai-m05-rag-overview, ai-m06-memory, ai-m10-caching, ai-m03-tokenization


# Inference parameters
id: ai-m03-inference-parameters
track: ai
verified: 2026-10

## What we're learning
Settings that control how a model generates output:

- **Temperature**: scales randomness. Near 0 gives focused, mostly repeatable output (good for extraction and classification); higher values give more varied output (brainstorming). Even at 0, outputs are not guaranteed identical across runs.
- **Top-p** (nucleus sampling): sample only from the smallest set of tokens whose probabilities add up to p. Usually tune temperature or top-p, not both. **Top-k** limits sampling to the k most likely tokens.
- **Max tokens**: hard cap on output length; hitting it truncates the answer (and breaks JSON).
- **Stop sequences**: strings that end generation.
- **Reasoning ("thinking") settings**: many current models can reason internally before answering, controlled by an effort level or a token budget. Reasoning tokens are billed as output and add latency. Some reasoning models restrict or ignore sampling parameters such as temperature.

## Benefit
The right settings make extraction pipelines consistent, creative tasks varied, and costs predictable.

## Limits and misconceptions
- Parameters cannot fix a poor prompt or missing context.
- Defaults and supported parameters differ by provider and model; check documentation.
- Higher reasoning effort helps complex tasks but wastes money on simple ones.

## Remember this
Use low temperature for consistent extraction, cap output tokens, and use reasoning effort only where the task needs it.

## Related
ai-m04-prompting, ai-m04-cost-latency, ai-m04-structured-outputs
