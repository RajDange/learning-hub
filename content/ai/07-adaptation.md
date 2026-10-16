# Fine-tuning
id: ai-m07-fine-tuning
track: ai
verified: 2026-10

## What we're learning
**Fine-tuning** continues training a pretrained model on your own examples so its behaviour changes. **Supervised fine-tuning (SFT)** uses input-output pairs (a ticket and its correct category, a document and its ideal summary). Providers offer fine-tuning APIs for some hosted models; open models can be fine-tuned with libraries such as Hugging Face Transformers and PEFT. Preference-based methods (such as DPO) fine-tune on pairs of better and worse responses.

What fine-tuning changes well:
- **Format and style**: consistent output structure, tone, domain phrasing.
- **Narrow tasks**: classification or extraction in a specific domain, with fewer instructions per call.
- **Cost and latency**: a small fine-tuned model can replace a large general one for a specific task.

What it does poorly:
- Adding **knowledge** that changes often or must be cited; use RAG.

Requirements: a clean dataset (often hundreds to thousands of high-quality examples), a held-out evaluation set, and a plan to repeat the process when base models change.

## Benefit
For high-volume, well-defined tasks, fine-tuning can raise quality and cut per-call cost significantly.

## Limits and misconceptions
- Poor or inconsistent training examples teach poor behaviour.
- Fine-tuning can degrade general abilities or safety behaviour; evaluate broadly.
- Each new base model version may require re-fine-tuning and re-evaluation.

## Remember this
Fine-tune to change behaviour, format or cost on a narrow task with good examples; use retrieval, not fine-tuning, to add knowledge.

## Related
ai-m07-when-not-to-fine-tune, ai-m07-lora-peft, ai-m03-pretraining-alignment, ai-m02-transfer-learning


# LoRA and parameter-efficient fine-tuning
id: ai-m07-lora-peft
track: ai
verified: 2026-10

## What we're learning
Full fine-tuning updates every weight of a large model, which needs a lot of GPU memory and produces a full-size copy per task. **Parameter-efficient fine-tuning (PEFT)** trains only a small number of new parameters:

- **LoRA (Low-Rank Adaptation, 2021)**: freeze the original weights and learn small low-rank matrices added to selected layers. The original paper reported orders of magnitude fewer trainable parameters with comparable quality and no extra inference latency once merged.
- **QLoRA (2023)**: LoRA on top of a base model quantised to 4 bits, making it possible to fine-tune very large models on a single high-memory GPU.
- Other methods: adapters, prefix and prompt tuning.

The trained **adapter** is small (megabytes), so one base model can serve many tasks by swapping adapters.

## Benefit
PEFT makes fine-tuning affordable and fast, and adapters are cheap to store, version and deploy.

## Limits and misconceptions
- Quality can trail full fine-tuning on some tasks; evaluate.
- Hyperparameters (rank, which layers, learning rate) matter.
- Hosted model APIs may use such methods internally without exposing them.

## Remember this
LoRA and QLoRA fine-tune large models by training small add-on matrices, making adaptation cheap and adapters swappable.

## Related
ai-m07-fine-tuning, ai-m07-distillation


# Distillation
id: ai-m07-distillation
track: ai
verified: 2026-10

## What we're learning
**Distillation** trains a smaller **student** model to imitate a larger **teacher**. Classic distillation (Hinton and colleagues, 2015) trains on the teacher's soft probability outputs. Today it often means generating many high-quality examples with a large model and fine-tuning a small model on them for one task.

Typical use: a large model labels or answers thousands of examples during development; a small, cheap, fast model is fine-tuned on that data and serves production traffic, with the large model handling only hard cases.

## Benefit
Large cost and latency reductions for high-volume tasks, and the possibility of running models privately or on edge devices.

## Limits and misconceptions
- The student is usually only as good as the teacher on that task, and worse outside it.
- Errors in teacher outputs are learned; filter and review the generated data.
- **Provider terms** often restrict using their model outputs to train competing models; check licences.

## Remember this
Distillation trains a small model on a large model's outputs for one task, cutting cost and latency within the teacher's quality and licence limits.

## Related
ai-m04-cost-latency, ai-m07-fine-tuning


# When not to fine-tune
id: ai-m07-when-not-to-fine-tune
track: ai
verified: 2026-10

## What we're learning
Providers and practitioners recommend trying simpler options first, in this order:

1. **Better prompting**: clear instructions, examples, structure.
2. **Structured outputs and tools** to enforce formats and fetch facts.
3. **Retrieval (RAG)** to add knowledge, especially changing or citable knowledge.
4. A **better or different base model**.
5. Only then **fine-tuning**.

Signs that fine-tuning **is** justified:
- Prompting has plateaued on a well-defined task, measured on an evaluation set.
- Very high volume makes a smaller fine-tuned model much cheaper.
- A consistent style, format or domain behaviour is hard to describe in a prompt but easy to show with examples.
- You have hundreds or more high-quality examples and the ability to maintain them.

## Benefit
Avoiding unnecessary fine-tuning saves data work, training cost, and the ongoing burden of retraining on every model upgrade.

## Limits and misconceptions
- "Our data is special, so we must fine-tune" is often wrong; RAG usually serves domain knowledge better.
- Without an evaluation set you cannot tell whether fine-tuning helped.

## Remember this
Prompt, constrain, retrieve and switch models before fine-tuning; fine-tune only with an evaluation set showing it helps.

## Related
ai-m05-rag-overview, ai-m04-prompting, ai-m08-evals, ai-m07-fine-tuning
