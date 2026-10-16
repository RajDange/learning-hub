# Framing an ML problem
id: ml-m02-problem-framing
track: ml

## What we're learning
Most ML projects fail at framing, not modelling. Framing turns a business question into a prediction task:

1. **Decision**: what action will change based on the prediction? (Call this customer, flag this transaction, order this stock.)
2. **Target**: what exactly is predicted, measured how, at what time? ("Customer cancels within 90 days after the prediction date.")
3. **Prediction time and features**: what is known at the moment of prediction? Only that may be used.
4. **Unit**: one prediction per customer per month, per transaction, per store-day.
5. **Success metric**: a model metric linked to business value (cost of errors, uplift), and a baseline to beat (current rule, simple heuristic).
6. **Constraints**: latency, explainability, fairness, regulation, data availability.

**When not to use ML**: when a clear rule works, when there is no reliable labelled data, when errors are unacceptable and cannot be reviewed, or when nobody will act on predictions.

## Benefit
A well-framed problem prevents months of building an accurate model that answers the wrong question or uses data unavailable at prediction time.

## Limits and misconceptions
- Proxy targets (clicks for satisfaction) can be optimised in ways that hurt the real goal.
- Predicting is not the same as deciding; an intervention may need causal reasoning (who will respond to an offer), not just prediction (who will churn).

## Remember this
Frame the decision, the exact target, what is known at prediction time, the metric and the baseline before choosing any model.

## Related
ml-m02-supervised-unsupervised, ml-m02-data-leakage, ai-m01-what-llms-can-cannot-do


# Supervised, unsupervised and other learning types
id: ml-m02-supervised-unsupervised
track: ml

## What we're learning
- **Supervised learning**: learn from examples with known answers (**labels**). **Classification** predicts categories (fraud or not, churn or not); **regression** predicts numbers (demand, price, duration).
- **Unsupervised learning**: find structure without labels: **clustering** (customer segments), **dimensionality reduction** (PCA), **anomaly detection**.
- **Semi-supervised**: a few labels plus many unlabelled examples.
- **Self-supervised**: create labels from the data itself (predict the next word, a masked word or a missing image patch); this is how large language models and embedding models are pretrained.
- **Reinforcement learning**: an agent learns actions from rewards (used in robotics, games, and in aligning language models with preferences).

## Benefit
Knowing the type tells you what data you need (labels or not), which algorithms apply and how to evaluate.

## Limits and misconceptions
- Labels are often the bottleneck: expensive, delayed (did the loan default?) or noisy.
- Unsupervised results (clusters) have no ground truth; their value is judged by usefulness, not accuracy.
- Generative AI builds on self-supervised pretraining but is often used in supervised-like ways (classification with prompts).

## Remember this
Supervised learns from labelled answers, unsupervised finds structure without labels, and self-supervised creates its own labels at scale.

## Related
ai-m01-ai-ml-dl-genai, ml-m03-clustering, ml-m02-problem-framing


# Bias, variance, overfitting and underfitting
id: ml-m02-bias-variance
track: ml

## What we're learning
A model's error on new data comes from two competing sources:

- **Bias**: error from a model too simple to capture the pattern (a straight line through curved data). Leads to **underfitting**: poor on training and on new data.
- **Variance**: error from a model too sensitive to the particular training sample (a very deep tree memorising noise). Leads to **overfitting**: excellent on training data, poor on new data.

Increasing model complexity lowers bias but raises variance. The goal is the sweet spot that minimises error on unseen data.

How to tell:
- Training and validation errors both high: underfitting. Use a richer model or better features.
- Training error low, validation error much higher: overfitting. Use more data, simpler models, **regularisation**, early stopping, or ensembles.

## Benefit
This one trade-off explains most model tuning decisions, from tree depth to regularisation strength to dropout.

## Limits and misconceptions
- Very large neural networks can generalise well despite fitting training data perfectly ("double descent"); the classic trade-off is a guide, not a law, for those models.
- More data reduces variance but not bias.

## Remember this
Underfitting is too simple (high bias), overfitting is memorising noise (high variance); compare training and validation error to tell which.

## Related
ml-m03-regularization, ml-m02-train-val-test, ml-m05-training-loops


# Train, validation and test sets
id: ml-m02-train-val-test
track: ml

## What we're learning
To estimate how a model will perform on new data, split the data:

- **Training set**: fit the model.
- **Validation set**: choose between models, features and hyperparameters.
- **Test set**: a final, untouched estimate of performance, used once at the end.

Typical splits are 60/20/20 or 80/10/10, or cross-validation on the training part instead of a fixed validation set. Split rules that matter:

- **Time-based splits** for anything that will predict the future: train on the past, validate and test on later periods. Random splits leak future information.
- **Group-based splits** when examples are related (several rows per customer or patient): keep each group in one split.
- **Stratified splits** to keep class proportions for rare classes.

## Benefit
Honest splits are the only protection against fooling yourself with an over-optimistic accuracy that collapses in production.

## Limits and misconceptions
- Looking at test results repeatedly and adjusting turns the test set into a validation set; its estimate becomes optimistic.
- Preprocessing (scaling, imputing, target encoding) must be fitted on training data only.
- Production data may differ from all historical splits (drift); monitoring is still needed.

## Remember this
Train on one part, tune on another, test once on a third, and split by time or group when the data demands it.

## Related
ml-m02-cross-validation, ml-m02-data-leakage, ml-m06-drift-monitoring


# Cross-validation
id: ml-m02-cross-validation
track: ml

## What we're learning
**k-fold cross-validation** splits the training data into k parts (folds, often 5). The model trains on k-1 folds and is evaluated on the remaining one, rotating so each fold is used once for evaluation. The k scores are averaged, and their spread shows stability.

Variants:
- **Stratified k-fold**: keeps class proportions in each fold (classification with imbalance).
- **Group k-fold**: keeps all rows of a group (customer, store) in the same fold.
- **Time-series split**: expanding or rolling windows where each validation fold is later than its training data.

Cross-validation is usually combined with **hyperparameter search**, and a separate test set is kept for the final estimate.

## Benefit
More reliable performance estimates than a single split, especially with limited data, and a sense of variance across data subsets.

## Code snippet
```python
from sklearn.model_selection import StratifiedKFold, TimeSeriesSplit, cross_val_score

scores = cross_val_score(model, X, y, cv=StratifiedKFold(5, shuffle=True, random_state=0),
                         scoring="roc_auc")
print(scores.mean(), scores.std())

ts_scores = cross_val_score(model, X_time_sorted, y_time_sorted, cv=TimeSeriesSplit(5))
```

## Limits and misconceptions
- k-fold multiplies training cost by k; for large datasets or deep learning a single validation split is common.
- Plain k-fold on time series or grouped data leaks information and overstates performance.
- Preprocessing must happen inside each fold (use pipelines).

## Remember this
Cross-validation rotates evaluation across folds for a stable estimate; use stratified, group or time-series folds when the data requires.

## Related
ml-m02-train-val-test, ml-m04-sklearn-pipelines, ml-m04-hyperparameter-tuning


# Classification metrics
id: ml-m02-classification-metrics
track: ml

## What we're learning
For a binary classifier, the **confusion matrix** counts true positives (TP), false positives (FP), true negatives (TN) and false negatives (FN). Metrics built from it:

- **Accuracy** = (TP + TN) / all. Misleading with imbalance: 99.9 percent accuracy by predicting "no fraud" always.
- **Precision** = TP / (TP + FP): of the flagged cases, how many were right? Matters when false alarms are costly.
- **Recall** (sensitivity) = TP / (TP + FN): of the real cases, how many did we catch? Matters when misses are costly.
- **F1**: harmonic mean of precision and recall.
- **ROC AUC**: how well the model ranks positives above negatives across all thresholds (0.5 is random, 1.0 perfect).
- **PR AUC** (average precision): area under the precision-recall curve; more informative than ROC AUC for rare positives.
- **Log loss** and **Brier score** evaluate predicted probabilities.

Most classifiers output a score; the **threshold** that turns scores into decisions should be chosen from business costs, not left at 0.5.

## Benefit
Choosing the metric that matches the cost of errors is what makes a model useful rather than merely accurate.

## Limits and misconceptions
- A single number hides trade-offs; look at the precision-recall curve and the confusion matrix at the chosen threshold.
- Metrics computed on a test set with a different class balance than production will mislead.

## Remember this
Use precision when false alarms are costly, recall when misses are costly, PR AUC for rare classes, and pick the threshold from business costs.

## Related
ml-m04-imbalanced-data, ml-m04-calibration, ml-m02-regression-metrics


# Regression metrics
id: ml-m02-regression-metrics
track: ml

## What we're learning
For numeric predictions:

- **MAE** (mean absolute error): average absolute error, in the target's units. Robust to outliers, easy to explain ("off by 12 units on average").
- **RMSE** (root mean squared error): penalises large errors more than MAE; sensitive to outliers.
- **MAPE** (mean absolute percentage error): error as a percentage of actuals; intuitive but undefined or explosive when actuals are near zero, and asymmetric.
- **WAPE / weighted MAPE**: total absolute error divided by total actuals; common in demand forecasting.
- **R squared**: share of variance explained relative to predicting the mean; can be negative on new data, and does not tell you the size of errors.

Always compare to a **baseline**: the mean, last value, or same period last year.

## Benefit
The right metric aligns the model with how errors cost money: over-forecasting and under-forecasting stock, for example, rarely cost the same.

## Limits and misconceptions
- Optimising RMSE favours predicting the mean; optimising MAE favours the median. Choose deliberately.
- Aggregate metrics hide segment failures; break them down by product, region or size.
- For asymmetric costs, use quantile loss or custom business metrics.

## Remember this
MAE is the typical error, RMSE punishes big misses, MAPE fails near zero, and every metric needs a naive baseline.

## Related
ml-m03-linear-regression, ml-m03-forecasting, ml-m02-classification-metrics


# Data leakage
id: ml-m02-data-leakage
track: ml

## What we're learning
**Data leakage** happens when information that would not be available at prediction time gets into training, so the model looks excellent in testing and fails in production.

Common forms:
- **Target leakage**: a feature that is a consequence of the target, such as "account closed date" when predicting churn, or "chargeback flag" when predicting fraud.
- **Temporal leakage**: features computed with data from after the prediction moment (a customer's total yearly spend used to predict a mid-year event), or random splits on time-ordered data.
- **Train-test contamination**: preprocessing fitted on all data (scaling, imputation, target encoding, feature selection) before splitting; duplicate or near-duplicate rows across splits; the same customer in train and test.

## Benefit
Leakage is the most common reason for "too good to be true" results; catching it saves failed deployments and lost trust.

## Limits and misconceptions
- Suspiciously high accuracy, or one feature dominating importance, are warning signs to investigate.
- Point-in-time correct feature tables (feature stores, as-of joins) are the structural defence.
- Pipelines that fit preprocessing inside cross-validation prevent contamination.

## Remember this
Use only information available at prediction time, split before preprocessing, and treat suspiciously good results as a leakage alarm.

## Related
ml-m04-sklearn-pipelines, ml-m06-feature-stores, ml-m02-train-val-test, ml-m02-problem-framing
