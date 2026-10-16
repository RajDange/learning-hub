# Linear algebra for ML
id: ml-m01-linear-algebra
track: ml

## What we're learning
Machine learning treats data as numbers arranged in **vectors** and **matrices**:

- A **vector** is an ordered list of numbers: one customer's features (age, tenure, spend) or one word's embedding.
- A **matrix** is a table of numbers: the dataset X with one row per example and one column per feature (shape n by d).
- The **dot product** of two vectors multiplies matching entries and sums them. A linear model's prediction is a dot product of features with weights: `y = w · x + b`. Cosine similarity of embeddings is a normalised dot product.
- **Matrix multiplication** applies many dot products at once: predictions for all rows are `X w`; a neural network layer is a matrix multiplication followed by a non-linear function.
- **Norms** measure vector length (L2 is the usual distance; L1 sums absolute values), used in distances and regularisation.
- **Eigenvectors** and the **singular value decomposition** find the main directions of variation, which is what PCA uses.

## Benefit
This vocabulary makes model descriptions readable: "embeddings", "weights", "dimensionality", "cosine similarity" and "matrix factorisation" all rest on these few ideas.

## Limits and misconceptions
- You do not need to compute these by hand; NumPy and libraries do. The value is in understanding shapes and what operations mean.
- High-dimensional spaces behave unintuitively (distances become similar, the "curse of dimensionality"), which affects k-NN and clustering.

## Remember this
Data is a matrix of rows and features, models multiply features by weights (dot products), and similarity is measured with distances and dot products.

## Related
python-m03-numpy-arrays, ml-m03-pca, ai-m03-embeddings, ml-m03-linear-regression


# Calculus essentials: derivatives and gradients
id: ml-m01-calculus-gradients
track: ml

## What we're learning
Training a model means adjusting parameters to reduce a **loss** (an error measure). Calculus tells us which direction reduces it:

- A **derivative** is the slope of a function at a point: how much the output changes for a tiny change in the input.
- A **partial derivative** is the slope with respect to one parameter while holding the others fixed.
- The **gradient** collects all partial derivatives into a vector. It points in the direction of steepest **increase** of the loss, so moving **against** the gradient reduces it.
- The **chain rule** computes the derivative of composed functions (f(g(x))) by multiplying derivatives of each step. Backpropagation in neural networks is the chain rule applied layer by layer.

## Benefit
"Gradient descent", "learning rate", "vanishing gradients" and "backpropagation" are the language of model training; they all follow from these three ideas.

## Limits and misconceptions
- Libraries compute gradients automatically (autograd); you rarely derive them by hand.
- Gradients only describe local slope; they do not guarantee finding the global best point.
- Non-differentiable steps (rounding, sorting, tree splits) need other training methods; that is why tree models are trained differently from neural networks.

## Remember this
The gradient is the vector of slopes of the loss; stepping against it reduces error, and the chain rule computes it through layers.

## Related
ml-m01-optimization, ml-m05-backpropagation


# Probability
id: ml-m01-probability
track: ml

## What we're learning
Probability quantifies uncertainty, and many ML outputs are probabilities.

- **P(A)** is between 0 and 1. **Joint** probability P(A and B); **conditional** probability P(A | B) = P(A and B) / P(B): the probability of A given that B happened.
- **Independence**: P(A | B) = P(A); knowing B tells you nothing about A.
- **Bayes' rule**: P(A | B) = P(B | A) P(A) / P(B). It updates a prior belief P(A) with evidence B.
- **Base rates** matter: a fraud test that is 99 percent accurate still produces mostly false alarms if fraud occurs in 0.1 percent of transactions.
- **Expected value** is the probability-weighted average outcome, used to compare decisions (expected cost of a false negative versus a false positive).

## Benefit
Probability thinking prevents classic mistakes in interpreting model scores, alerts and test results, and underpins classifiers such as naive Bayes and logistic regression.

## Code snippet
```python
# Base-rate example: test with 99% sensitivity and 99% specificity, fraud rate 0.1%
p_fraud = 0.001
p_pos_given_fraud = 0.99
p_pos_given_ok = 0.01
p_pos = p_pos_given_fraud * p_fraud + p_pos_given_ok * (1 - p_fraud)
print(p_pos_given_fraud * p_fraud / p_pos)   # P(fraud | positive) is only about 0.09
```

## Limits and misconceptions
- P(A | B) is not P(B | A) (the "prosecutor's fallacy").
- Model scores are not automatically calibrated probabilities; see calibration.
- Correlation between events does not imply one causes the other.

## Remember this
Conditional probability and Bayes' rule update beliefs with evidence, and base rates decide how meaningful a positive result is.

## Related
ml-m03-naive-bayes, ml-m04-calibration, ml-m02-classification-metrics


# Distributions
id: ml-m01-distributions
track: ml

## What we're learning
A **distribution** describes how values of a variable are spread. Summaries: **mean** (average), **median** (middle value), **variance** and **standard deviation** (spread), **percentiles**, **skewness** (asymmetry).

Common distributions:
- **Normal (Gaussian)**: symmetric bell curve; many measurement errors and averages of many effects. About 68 percent within 1 standard deviation, 95 percent within 2.
- **Binomial**: number of successes in n yes/no trials (conversions out of visits).
- **Poisson**: counts of events in an interval (calls per hour, failures per day).
- **Exponential**: waiting times between events.
- **Long-tailed** (log-normal, power law): incomes, order values, file sizes, page views; a few huge values dominate.

The **central limit theorem**: averages of many independent samples tend toward a normal distribution even when the data is not normal, which is why confidence intervals for means work.

## Benefit
Recognising the shape of data guides the right summary (median for skewed data), the right model and the right test.

## Limits and misconceptions
- Most business data is not normal; means of long-tailed data are unstable and dominated by outliers.
- Log-transforming skewed variables often makes them easier to model.
- A histogram is the quickest way to see a distribution; look before modelling.

## Remember this
Know the shape: normal for symmetric noise, binomial and Poisson for counts, long tails for money and usage, and use medians for skewed data.

## Related
sql-m11-percentiles, ml-m01-confidence-intervals, python-m06-eda-workflow


# Hypothesis testing
id: ml-m01-hypothesis-testing
track: ml

## What we're learning
A **hypothesis test** asks whether an observed difference could plausibly be due to chance.

1. State a **null hypothesis** H0 (no difference between A and B) and an **alternative**.
2. Choose a **significance level** alpha (often 0.05) before looking.
3. Compute a test statistic and its **p-value**: the probability of seeing a difference at least this large **if H0 were true**.
4. If p < alpha, reject H0.

Errors: a **type I error** (false positive) rejects a true H0, with probability alpha; a **type II error** (false negative) misses a real effect. **Power** = 1 minus the type II error rate, and depends on effect size, sample size and noise; sample sizes should be planned from it.

Common tests: t-test (means), chi-square (proportions, categories), Mann-Whitney (non-normal data), and permutation tests.

## Benefit
Tests protect A/B decisions, data quality alerts and model comparisons from reacting to noise.

## Limits and misconceptions
- A p-value is **not** the probability that H0 is true, nor the probability the result is a fluke.
- Statistically significant does not mean practically important; report effect sizes and intervals.
- Running many tests (many metrics, many segments, checking daily) inflates false positives; correct for multiple comparisons or pre-register the main metric.
- "Not significant" does not prove "no effect"; the test may lack power.

## Remember this
A p-value is the chance of data this extreme if nothing were going on; plan power, fix alpha in advance, and report effect sizes.

## Related
sql-m11-ab-analysis, ml-m01-confidence-intervals, python-m09-scipy-statsmodels


# Confidence intervals
id: ml-m01-confidence-intervals
track: ml

## What we're learning
A **confidence interval (CI)** gives a range of plausible values for an unknown quantity (a conversion rate, a mean, a model's accuracy) from a sample. For a mean with a reasonably large sample, a 95 percent CI is approximately mean plus or minus 1.96 times the **standard error** (standard deviation divided by the square root of n).

The correct interpretation: if we repeated the sampling many times and built an interval each time, about 95 percent of those intervals would contain the true value. **Bootstrap** intervals estimate uncertainty by resampling the data many times, useful when formulas do not apply (medians, complex metrics).

## Benefit
Intervals show both the estimate and its uncertainty: "conversion uplift 2 percent, CI 0.5 to 3.5 percent" is far more useful than "significant".

## Code snippet
```python
import numpy as np
rng = np.random.default_rng(0)
boot = [np.median(rng.choice(order_values, size=len(order_values))) for _ in range(5000)]
low, high = np.percentile(boot, [2.5, 97.5])     # 95% bootstrap CI for the median
```

## Limits and misconceptions
- A 95 percent CI does not mean a 95 percent probability that the true value lies in this particular interval (that is a Bayesian credible interval).
- Intervals shrink with the square root of n: four times the data halves the width.
- Intervals assume representative, independent samples; biased data gives confidently wrong intervals.

## Remember this
A confidence interval shows the plausible range of an estimate; width shrinks with the square root of sample size.

## Related
ml-m01-hypothesis-testing, ml-m01-distributions, ml-m02-cross-validation


# Optimisation and gradient descent
id: ml-m01-optimization
track: ml

## What we're learning
Training a model is **optimisation**: find parameters that minimise a **loss function** measuring error on training data, such as **mean squared error** for regression or **log loss (cross-entropy)** for classification.

**Gradient descent** repeats: compute the gradient of the loss with respect to parameters, then move parameters a small step against it. The step size is the **learning rate**:
- Too large: the loss jumps around or diverges.
- Too small: training is very slow.

Variants:
- **Stochastic** and **mini-batch** gradient descent estimate the gradient from small batches of data, which is faster and adds helpful noise.
- **Momentum** and adaptive optimisers such as **Adam** adjust steps per parameter and are the default in deep learning.

Simple models like linear regression can also be solved exactly (closed form), and convex problems (linear and logistic regression) have one global minimum; neural networks have many local minima and saddle points, but in practice still train well.

## Benefit
Understanding optimisation explains training curves, learning-rate tuning, why scaling features helps convergence, and why some training runs fail.

## Limits and misconceptions
- Minimising training loss is not the goal; generalising to new data is. Too much optimisation overfits.
- The loss you optimise should match the business objective as closely as possible.

## Remember this
Training minimises a loss by stepping against the gradient, with the learning rate setting the step size.

## Related
ml-m01-calculus-gradients, ml-m05-training-loops, ml-m02-bias-variance
