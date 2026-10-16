# Neurons, layers and activations
id: ml-m05-neural-network-basics
track: ml

## What we're learning
A **neural network** is built from layers of simple units. Each unit (neuron) computes a weighted sum of its inputs plus a bias, then applies a non-linear **activation function**. A **layer** does this for many units at once (a matrix multiplication), and stacking layers lets the network represent complex, non-linear functions.

- **Input layer**: the features. **Hidden layers**: intermediate representations. **Output layer**: one number (regression), class probabilities (softmax), or other structures.
- **Activations**: ReLU (max(0, x), the common default), sigmoid and tanh (older, saturate), GELU (used in transformers), softmax (turns scores into probabilities).
- **Depth** lets networks learn hierarchical features: in images, edges, then shapes, then objects.

Specialised architectures (convolutional networks, transformers) are covered in the AI track.

## Benefit
Neural networks learn their own features from raw data (pixels, text, audio), which classical models cannot do well; this bridge lesson is the foundation for deep learning and LLMs.

## Limits and misconceptions
- Without non-linear activations, any stack of layers collapses into one linear model.
- For tabular data, neural networks rarely beat gradient-boosted trees and need more tuning.
- "Neurons" are loosely inspired by biology; they are simple mathematical functions.

## Remember this
A neural network stacks layers of weighted sums with non-linear activations, letting it learn complex features from raw data.

## Related
ai-m02-cnns, ml-m05-backpropagation, ml-m01-linear-algebra


# Backpropagation
id: ml-m05-backpropagation
track: ml

## What we're learning
**Backpropagation** is how neural networks compute the gradient of the loss with respect to every weight:

1. **Forward pass**: compute outputs layer by layer and the loss.
2. **Backward pass**: apply the **chain rule** from the loss back through each layer, computing how much each weight contributed to the error. Intermediate values from the forward pass are reused, so all gradients cost roughly one extra pass.
3. An **optimiser** (SGD, Adam) updates weights using these gradients.

Frameworks like PyTorch do this automatically (**autograd**): they record operations during the forward pass and compute gradients with `loss.backward()`.

Known problems: **vanishing gradients** (gradients shrink through many layers, so early layers learn slowly, notably with sigmoid activations or long recurrent chains) and **exploding gradients** (gradients grow huge). Remedies include ReLU-type activations, careful initialisation, normalisation layers, residual connections and gradient clipping.

## Benefit
Understanding backpropagation explains why deep networks train at all, and what vanishing gradients, residual connections and normalisation layers are for.

## Limits and misconceptions
- Backpropagation computes gradients; the optimiser decides the update.
- It needs memory to store activations from the forward pass, which is why training uses far more memory than inference.

## Remember this
Backpropagation applies the chain rule backwards through the network to get every weight's gradient in about one extra pass.

## Related
ml-m01-calculus-gradients, ml-m05-training-loops, ai-m02-sequence-models


# Training loops and regularisation
id: ml-m05-training-loops
track: ml

## What we're learning
Training a neural network runs a **loop**:
- Data is split into **mini-batches** (for example 32 to 1,024 examples).
- For each batch: forward pass, loss, backward pass, optimiser step.
- One pass over all training data is an **epoch**; training runs for many epochs while **validation loss** is monitored.

Key choices: **optimiser** (Adam or AdamW is the common default), **learning rate** and **schedules** (warm-up, decay), batch size.

Regularisation to prevent overfitting:
- **Early stopping**: stop when validation loss stops improving.
- **Dropout**: randomly zero some activations during training.
- **Weight decay** (L2 penalty).
- **Data augmentation**: create varied training examples (image flips, crops; text perturbations).
- **Batch or layer normalisation** stabilise training.

## Benefit
Most training problems (loss not decreasing, overfitting, instability) are diagnosed from training and validation curves and fixed with these knobs.

## Code snippet
```python
for epoch in range(max_epochs):
    model.train()
    for xb, yb in train_loader:
        optimizer.zero_grad()
        loss = loss_fn(model(xb), yb)
        loss.backward()
        optimizer.step()
    val_loss = evaluate(model, val_loader)
    if early_stopper.should_stop(val_loss):
        break
```

## Limits and misconceptions
- The learning rate is usually the most important hyperparameter.
- Training curves can be noisy; compare smoothed trends.
- Reproducibility needs fixed seeds and deterministic settings, and GPUs can still introduce small differences.

## Remember this
Train in mini-batches over epochs, watch validation loss, and use early stopping, dropout, weight decay and augmentation against overfitting.

## Related
ml-m02-bias-variance, ml-m05-pytorch-concepts, ml-m01-optimization


# PyTorch concepts
id: ml-m05-pytorch-concepts
track: ml

## What we're learning
The PyTorch building blocks used in every training script:

- **Tensors** (`torch.tensor`): arrays with a dtype and **device** (`cpu`, `cuda`); move models and data with `.to(device)`.
- **`nn.Module`**: a model class defining layers in `__init__` and computation in `forward`.
- **Loss functions** (`nn.CrossEntropyLoss`, `nn.MSELoss`) and **optimisers** (`torch.optim.AdamW`).
- **`Dataset` and `DataLoader`**: wrap data, batch it, shuffle it, and load in parallel.
- **Autograd**: `loss.backward()` fills `.grad` on parameters; `optimizer.step()` updates them; `model.eval()` and `torch.no_grad()` for inference.
- **Saving**: `torch.save(model.state_dict())`, or packaging via MLflow, ONNX export or TorchScript-style compilation for serving.

## Benefit
These few concepts make any PyTorch code (including Hugging Face fine-tuning scripts) readable.

## Code snippet
```python
import torch
from torch import nn

class ChurnNet(nn.Module):
    def __init__(self, n_features):
        super().__init__()
        self.net = nn.Sequential(nn.Linear(n_features, 64), nn.ReLU(), nn.Dropout(0.2),
                                 nn.Linear(64, 1))
    def forward(self, x):
        return self.net(x)

model = ChurnNet(20)
loss_fn = nn.BCEWithLogitsLoss()
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
```

## Limits and misconceptions
- Forgetting `model.eval()` at inference keeps dropout active and gives noisy predictions.
- Moving data between CPU and GPU in every step is a common bottleneck.
- Most applied teams fine-tune existing models rather than write architectures from scratch.

## Remember this
PyTorch is tensors on devices, modules with forward methods, data loaders, and autograd plus an optimiser in a loop.

## Related
python-m09-pytorch, ml-m05-training-loops, ai-m07-fine-tuning
