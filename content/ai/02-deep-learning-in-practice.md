# Convolutional neural networks
id: ai-m02-cnns
track: ai
verified: 2026-10

## What we're learning
A **convolutional neural network (CNN)** processes grid-like data (images, spectrograms) with **convolution** layers: small filters slide across the input and detect local patterns, using the **same weights** at every position. Stacked layers detect increasingly complex features (edges, textures, parts, objects); **pooling** layers reduce resolution. Weight sharing gives far fewer parameters than fully connected layers and makes detection work wherever the pattern appears.

Landmarks: LeNet (1998, digits), AlexNet (2012, the ImageNet breakthrough on GPUs), and ResNet (2015, **residual connections** that made networks of 100+ layers trainable).

## Benefit
CNNs power document image processing (OCR, layout), quality inspection in manufacturing, medical imaging and visual search; many of these are available as pretrained models.

## Limits and misconceptions
- Vision transformers now rival or beat CNNs on many large-scale tasks, but CNNs remain efficient and common, especially on edge devices.
- Training from scratch needs large labelled datasets; most practical work fine-tunes pretrained models.
- Models can latch onto spurious cues (backgrounds, watermarks); test on varied data.

## Remember this
CNNs slide shared filters over images to detect local patterns hierarchically, and pretrained CNNs are reused for most practical vision tasks.

## Related
ml-m05-neural-network-basics, ai-m02-transfer-learning


# Sequence models before transformers
id: ai-m02-sequence-models
track: ai
verified: 2026-10

## What we're learning
Text, speech and time series are **sequences**. Before transformers, the standard models were:

- **Recurrent neural networks (RNNs)**: process one element at a time, carrying a **hidden state** forward. Training through many steps suffers from **vanishing or exploding gradients**, so they forget long-range context.
- **LSTMs** (1997) and **GRUs** (2014): add **gates** that control what to remember, forget and output, keeping information over longer spans. They dominated speech recognition, translation and text tasks in the 2010s.
- **Encoder-decoder (sequence-to-sequence)** models with **attention** (2014-2015) let the decoder look back at all encoder states, improving translation.

Their main limitation was **sequential processing**: each step depends on the previous one, so training cannot be parallelised across the sequence. The transformer (2017) removed recurrence entirely.

## Benefit
Knowing what transformers replaced explains why attention and parallel training were such a leap, and RNN-style models still appear in some time-series and streaming applications.

## Limits and misconceptions
- LSTMs are not obsolete everywhere; they can be efficient for small sequential problems.
- Newer architectures (state-space models and hybrids) revisit recurrence for long sequences.

## Remember this
RNNs and LSTMs read sequences step by step, which limited long-range memory and parallel training; transformers solved both with attention.

## Related
ai-m03-attention-transformers, ml-m05-backpropagation


# Transfer learning
id: ai-m02-transfer-learning
track: ai
verified: 2026-10

## What we're learning
**Transfer learning** reuses a model trained on a large, general dataset for a new, often smaller task. Instead of learning from scratch, you start from a **pretrained** model that already knows general features (edges and shapes in images, grammar and meaning in text) and then:

- **Feature extraction**: freeze the pretrained model and train only a small new output layer, or use its outputs (embeddings) as features for a classical model.
- **Fine-tuning**: continue training some or all of the pretrained weights on the new task with a small learning rate.

Examples: an ImageNet-pretrained CNN fine-tuned to detect product defects; a pretrained language model (BERT-style, from 2018) fine-tuned to classify support tickets; today's foundation models adapted by prompting, retrieval or parameter-efficient fine-tuning.

## Benefit
Good results with hundreds or thousands of labelled examples instead of millions, at a fraction of the compute.

## Limits and misconceptions
- Works best when the new domain resembles the pretraining data; very different domains need more adaptation.
- Pretrained models carry the biases and licences of their training data; check licence terms.
- Fine-tuning can cause "catastrophic forgetting" of general abilities.

## Remember this
Start from a pretrained model and adapt it, by extracting features or fine-tuning, to get strong results with little labelled data.

## Related
ai-m07-fine-tuning, ai-m03-pretraining-alignment, ai-m03-embeddings
