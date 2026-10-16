# SciPy and statsmodels
id: python-m09-scipy-statsmodels
track: python

## What we're learning
Two libraries for classical statistics in Python:

- **SciPy** (`scipy.stats`): probability distributions (normal, binomial, Poisson, and many more) with densities, quantiles and random sampling; hypothesis tests (t-tests, chi-square, Mann-Whitney, Kolmogorov-Smirnov); correlation; plus optimisation, interpolation, linear algebra and signal processing in other submodules.
- **statsmodels**: statistical **models with inference**: linear and generalised linear regression with coefficient standard errors, p-values and confidence intervals, a formula interface (`"revenue ~ price + C(region)"`), time-series models (ARIMA, exponential smoothing, seasonal decomposition), and diagnostics.

## Benefit
When the question is "is this difference real?" or "how much does price affect demand, with what uncertainty?", these libraries give answers with confidence intervals, which prediction-focused ML libraries do not.

## Code snippet
```python
from scipy import stats
import statsmodels.formula.api as smf

t, p = stats.ttest_ind(group_a, group_b, equal_var=False)       # Welch's t-test

model = smf.ols("revenue ~ price + C(region)", data=df).fit()
print(model.summary())                                            # coefficients, CIs, p-values
```

## Limits and misconceptions
- A small p-value says the data are unlikely under the null hypothesis, not that the effect is large or important.
- Regression coefficients describe association; causal claims need design (experiments) or careful causal methods.
- These tools assume data fits in memory; for huge data, aggregate first or use Spark MLlib.

## Remember this
SciPy provides distributions and statistical tests; statsmodels fits models with standard errors and confidence intervals.

## Related
ml-m01-hypothesis-testing, sql-m11-ab-analysis, ml-m03-forecasting, ml-m01-confidence-intervals


# scikit-learn overview
id: python-m09-scikit-learn
track: python

## What we're learning
**scikit-learn** is the standard library for classical machine learning on tabular data. Its consistent **estimator API**:

- `fit(X, y)` learns from data; `predict(X)` or `predict_proba(X)` produces outputs; `transform(X)` for preprocessing steps.
- **Transformers**: scaling, one-hot encoding, imputation, feature selection.
- **Models**: linear and logistic regression, trees, random forests, gradient boosting (`HistGradientBoosting*`), SVMs, k-NN, clustering, PCA, anomaly detection.
- **Pipelines** and `ColumnTransformer` chain preprocessing and model so the same steps apply in training and prediction.
- **Model selection**: train/test split, cross-validation, grid and randomised search, metrics.

XGBoost, LightGBM and CatBoost follow the same API and are common for boosted trees.

## Benefit
One consistent interface across dozens of algorithms makes it easy to try baselines, compare models fairly and avoid data leakage with pipelines.

## Code snippet
```python
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.model_selection import cross_val_score

pre = ColumnTransformer([("num", StandardScaler(), ["tenure", "monthly_spend"]),
                         ("cat", OneHotEncoder(handle_unknown="ignore"), ["plan", "region"])])
clf = Pipeline([("pre", pre), ("model", HistGradientBoostingClassifier())])
print(cross_val_score(clf, X, y, cv=5, scoring="roc_auc").mean())
```

## Limits and misconceptions
- Single-machine and in-memory; for very large data use Spark MLlib, distributed training or sampling.
- Not for deep learning on images, text or audio; use PyTorch.
- Good defaults do not replace problem framing, validation design and leakage checks.

## Remember this
scikit-learn gives every classical model the same fit and predict API, and pipelines keep preprocessing consistent and leak-free.

## Related
ml-m04-sklearn-pipelines, ml-m02-cross-validation, ml-m03-gradient-boosting


# PyTorch overview
id: python-m09-pytorch
track: python

## What we're learning
**PyTorch** is the dominant open-source framework for **deep learning** (Linux Foundation, originally from Meta). Core pieces:

- **Tensors**: multi-dimensional arrays like NumPy arrays, which can live on GPUs.
- **Autograd**: records operations on tensors and computes gradients automatically for training.
- **Modules** (`torch.nn`): layers and models defined as Python classes.
- **Optimisers** (`torch.optim`) and **data loaders** for batching.
- An ecosystem on top: Hugging Face Transformers for language and vision models, PyTorch Lightning for training structure, TorchVision and TorchAudio, and serving tools.

Compared with scikit-learn, PyTorch is lower-level and flexible: you write the model and training loop (or use a framework that writes it), which suits unstructured data and large neural networks.

## Benefit
Almost all modern AI (transformers, LLM fine-tuning, embeddings, vision models) is built and adapted in PyTorch, so knowing its concepts makes the AI track concrete.

## Limits and misconceptions
- For tabular business data, gradient-boosted trees in scikit-learn-style libraries usually beat neural networks with far less effort.
- Training large models needs GPUs and careful engineering; most teams fine-tune or use pretrained models rather than training from scratch.
- TensorFlow and JAX are alternatives; PyTorch leads in research and most open models.

## Remember this
PyTorch provides GPU tensors, automatic gradients and neural network modules; use it for deep learning, and tree models for most tabular data.

## Related
ml-m05-pytorch-concepts, ai-m02-transfer-learning, python-m03-numpy-arrays
