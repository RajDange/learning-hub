# Encoding and scaling features
id: ml-m04-encoding-scaling
track: ml

## What we're learning
Models need numbers. **Encoding** turns categories into numbers:
- **One-hot encoding**: one 0/1 column per category. Safe default for low-cardinality features (plan, region); explodes with many categories.
- **Ordinal encoding**: integers for ordered categories (small, medium, large); also used directly by tree models.
- **Target encoding**: replace each category with the average target for it, computed **out of fold** to avoid leakage; useful for high-cardinality features (postcode, product ID).
- **Hashing** and **embeddings** for very high cardinality.

**Scaling** puts numeric features on comparable ranges:
- **Standardisation**: subtract mean, divide by standard deviation.
- **Min-max normalisation**: rescale to 0 to 1.
- **Robust scaling** (median and IQR) when outliers exist; log transforms for skewed values.

Which models care: linear models, k-NN, SVMs, neural networks and PCA need scaling; tree-based models do not.

## Benefit
Correct encoding and scaling let models use all features fairly and converge faster.

## Limits and misconceptions
- Fit encoders and scalers on training data only, inside a pipeline.
- Unseen categories in production must be handled (`handle_unknown="ignore"`).
- Target encoding without proper out-of-fold handling is a classic leakage source.

## Remember this
One-hot for few categories, target encoding (out of fold) for many, and scale numeric features for distance-based and linear models.

## Related
ml-m04-sklearn-pipelines, ml-m02-data-leakage, ml-m03-knn


# Missing data
id: ml-m04-missing-data
track: ml

## What we're learning
Why values are missing matters:
- **Missing completely at random**: unrelated to anything; dropping or simple imputation is fine.
- **Missing at random**: related to other observed features; model-based imputation helps.
- **Missing not at random**: related to the missing value itself (high earners not reporting income); missingness itself carries information.

Strategies:
- Drop rows or columns (only when little is missing and the cause is benign).
- **Simple imputation**: median for numbers, most frequent or "Unknown" for categories.
- **Missing indicators**: add a 0/1 column "was missing" so the model can learn from missingness.
- **Model-based imputation**: k-NN or iterative imputation.
- Some models (gradient boosting implementations such as LightGBM and XGBoost) handle missing values natively.

## Benefit
Handling missing values deliberately avoids both dropping most of the data and silently biasing the model.

## Limits and misconceptions
- Imputation statistics must be computed on training data only.
- Filling with zero when zero is a real value (balance = 0) confuses the model.
- Missingness often signals upstream data problems; investigate before imputing.

## Remember this
Ask why data is missing, impute with training statistics, and add missing indicators because missingness often carries signal.

## Related
python-m06-eda-workflow, ml-m04-sklearn-pipelines, pyspark-m02-nulls


# Imbalanced data
id: ml-m04-imbalanced-data
track: ml

## What we're learning
In fraud, default, failure and churn problems, the positive class can be 1 percent or far less. Accuracy becomes meaningless, and models may ignore the rare class. Tools:

- **Right metrics**: precision, recall, PR AUC, cost-based metrics; not accuracy.
- **Class weights**: make errors on the rare class cost more in training (`class_weight="balanced"`, `scale_pos_weight`).
- **Resampling**: undersample the majority class, oversample the minority, or synthetic methods such as SMOTE. Apply only to training data.
- **Threshold tuning**: choose the decision threshold on validation data to meet a target precision or recall, or to minimise expected cost. Often the single most effective step.
- **Stratified splits** so every fold contains positives.

## Benefit
These steps turn a model that never flags anything into one that catches the cases the business cares about at an acceptable false-alarm rate.

## Limits and misconceptions
- Resampling distorts predicted probabilities; recalibrate if probabilities matter.
- SMOTE often gives little benefit with modern boosted trees compared with class weights and threshold tuning.
- Evaluate on data with the real-world class balance.

## Remember this
For rare classes, use precision-recall metrics, class weights and a tuned threshold; resample only training data and recalibrate.

## Related
ml-m02-classification-metrics, ml-m04-calibration, ml-m03-anomaly-detection


# Feature engineering and selection
id: ml-m04-feature-selection
track: ml

## What we're learning
**Feature engineering** creates inputs that make the pattern easy to learn, usually from domain knowledge:
- Aggregates over time windows: purchases in the last 30 days, average ticket size, days since last login.
- Ratios and differences: spend this month versus average, utilisation = balance / limit.
- Date parts: day of week, month, holiday flags, time since an event.
- Text and embeddings: counts, TF-IDF, or embeddings from language models.

**Feature selection** removes useless or harmful features:
- Filter methods: drop constant, near-duplicate or highly correlated features.
- Model-based: L1 regularisation, permutation importance, SHAP.
- Wrapper methods: recursive feature elimination (expensive).

## Benefit
Good features usually improve models more than switching algorithms, and fewer features mean simpler, faster and more robust models.

## Limits and misconceptions
- Every engineered feature must be computable at prediction time with available data (no leakage).
- Selecting features on the full dataset before cross-validation leaks information; do it inside the folds.
- Importance from one model is not the truth about the world.

## Remember this
Domain-driven features beat algorithm tweaks; select features inside cross-validation and only from information available at prediction time.

## Related
ml-m04-interpretability-shap, ml-m06-feature-stores, ml-m02-data-leakage


# scikit-learn pipelines
id: ml-m04-sklearn-pipelines
track: ml

## What we're learning
A scikit-learn **Pipeline** chains preprocessing steps and a model into one estimator. A **ColumnTransformer** applies different steps to different columns (impute and scale numbers, one-hot encode categories). Calling `fit` fits every step on the training data only; `predict` applies the same fitted steps to new data.

Pipelines plug into cross-validation and hyperparameter search, so preprocessing is refit inside every fold, and the whole pipeline is saved and deployed as one object (for example as an MLflow model).

## Benefit
Pipelines prevent leakage, remove training-serving skew (the same transformations in both), and make models reproducible and deployable as a unit.

## Code snippet
```python
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline, make_pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression

num = make_pipeline(SimpleImputer(strategy="median"), StandardScaler())
cat = make_pipeline(SimpleImputer(strategy="most_frequent"), OneHotEncoder(handle_unknown="ignore"))
pre = ColumnTransformer([("num", num, ["age", "balance"]), ("cat", cat, ["plan", "region"])])

model = Pipeline([("pre", pre), ("clf", LogisticRegression(max_iter=1000))])
model.fit(X_train, y_train)
```

## Limits and misconceptions
- Custom transformations need to be written as transformers (or `FunctionTransformer`) to live inside the pipeline.
- Feature engineering done earlier in SQL or Spark must be identical in training and serving; feature stores address this.

## Remember this
Put all preprocessing and the model in one pipeline so it is fitted on training data only and deployed as one object.

## Related
ml-m02-data-leakage, python-m09-scikit-learn, ml-m02-cross-validation, ml-m06-model-registry


# Hyperparameter tuning
id: ml-m04-hyperparameter-tuning
track: ml

## What we're learning
**Hyperparameters** are settings chosen before training (tree depth, learning rate, regularisation strength, number of trees). Tuning searches for good values using validation scores:

- **Grid search**: try every combination; exhaustive and expensive.
- **Random search**: sample combinations; usually finds good settings faster than grid search.
- **Bayesian optimisation** (for example **Optuna**, Hyperopt): uses past trials to choose promising next ones, with pruning of poor trials.
- **AutoML** (FLAML, platform AutoML in Fabric, Databricks and others): searches over models and hyperparameters automatically.

Always tune with cross-validation or a validation set, and keep the test set for the final estimate.

## Benefit
Sensible tuning often gives a solid improvement over defaults, especially for gradient boosting and neural networks.

## Code snippet
```python
import optuna, lightgbm as lgb
from sklearn.model_selection import cross_val_score

def objective(trial):
    params = {"learning_rate": trial.suggest_float("lr", 0.01, 0.2, log=True),
              "num_leaves": trial.suggest_int("num_leaves", 15, 255),
              "min_child_samples": trial.suggest_int("min_child_samples", 10, 200)}
    return cross_val_score(lgb.LGBMClassifier(n_estimators=500, **params),
                           X, y, cv=5, scoring="roc_auc").mean()

study = optuna.create_study(direction="maximize")
study.optimize(objective, n_trials=50)
```

## Limits and misconceptions
- Tuning gains are usually smaller than gains from better features or data.
- Excessive tuning overfits the validation data.
- Log experiments so results are reproducible and comparable.

## Remember this
Tune with random or Bayesian search under cross-validation; expect modest gains, and log every trial.

## Related
ml-m02-cross-validation, fabric-m06-automl, ml-m06-experiment-tracking, ml-m03-gradient-boosting


# Interpretability and SHAP
id: ml-m04-interpretability-shap
track: ml

## What we're learning
**Interpretability** explains what a model does:

- **Global** explanations: which features matter overall. **Permutation importance** measures how much a metric drops when a feature's values are shuffled.
- **Local** explanations: why this prediction for this customer. **SHAP** values (based on Shapley values from game theory) split a prediction into contributions from each feature, relative to a baseline, so contributions add up to the prediction. TreeSHAP computes them efficiently for tree models.
- **Partial dependence** and **ICE plots** show how predictions change as one feature varies.
- Inherently interpretable models: linear models, small trees, generalised additive models.

## Benefit
Explanations build trust with users, support regulated decisions (credit, insurance), help debug models (finding leakage or spurious features) and inform feature work.

## Limits and misconceptions
- Explanations describe the **model**, not causal effects in the world.
- Correlated features share or swap credit unpredictably.
- SHAP on large data and complex models can be expensive; sample.
- A plausible explanation does not prove the model is right.

## Remember this
Use permutation importance for global views and SHAP for per-prediction contributions; they explain the model, not causation.

## Related
ml-m04-fairness, ml-m04-feature-selection, ml-m03-gradient-boosting


# Probability calibration
id: ml-m04-calibration
track: ml

## What we're learning
A model is **calibrated** when its predicted probabilities match observed frequencies: of all cases scored 0.2, about 20 percent are positive. Many models rank well (good AUC) but are miscalibrated: boosted trees and SVMs often are, and resampling or class weights distort probabilities.

Checking: a **reliability diagram** (calibration curve) plots predicted versus observed rates by bin; the **Brier score** and log loss measure calibration and accuracy together.

Fixing: fit a calibration map on held-out data, with **Platt scaling** (a logistic curve) or **isotonic regression** (a flexible monotonic curve, needs more data). In scikit-learn, `CalibratedClassifierCV`.

## Benefit
Calibrated probabilities are essential when scores feed decisions with costs (expected loss, pricing, triage capacity) or are shown to users as risk percentages.

## Limits and misconceptions
- Calibration does not change ranking (AUC stays the same).
- Calibrate on data not used for training, and recheck after drift.
- If only a ranking or a fixed top-N is needed, calibration matters less.

## Remember this
Calibrated models say 20 percent and mean it; check with reliability curves and fix with Platt or isotonic calibration on held-out data.

## Related
ml-m03-logistic-regression, ml-m02-classification-metrics, ml-m04-imbalanced-data


# Fairness
id: ml-m04-fairness
track: ml

## What we're learning
Models can treat groups differently because of biased historical data (past decisions encoded in labels), unrepresentative samples, or **proxies** for protected attributes (postcode standing in for ethnicity). **Fairness** work measures and limits such differences:

Common definitions (they conflict; you cannot satisfy all at once):
- **Demographic parity**: similar positive rates across groups.
- **Equal opportunity**: similar true positive rates.
- **Equalised odds**: similar true and false positive rates.
- **Calibration within groups**: scores mean the same probability for each group.

Practices: analyse performance per group, check proxies, document data and models (model cards), involve domain and legal experts, mitigate with reweighting, constraints or post-processing (libraries such as Fairlearn), and monitor after deployment.

## Benefit
Fair models protect people, meet legal duties (anti-discrimination law, the EU AI Act for high-risk uses) and protect trust in the organisation.

## Limits and misconceptions
- Removing the protected attribute does not remove bias; proxies remain.
- Choosing a fairness definition is a policy decision, not a technical one.
- Fairness metrics need group data, which may itself be sensitive to collect.

## Remember this
Measure model outcomes per group, choose a fairness definition deliberately with stakeholders, and remember proxies carry bias even without protected attributes.

## Related
ai-m08-responsible-ai, ml-m04-interpretability-shap, ml-m06-drift-monitoring
