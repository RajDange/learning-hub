# Linear regression
id: ml-m03-linear-regression
track: ml

## What we're learning
**Linear regression** predicts a number as a weighted sum of features plus an intercept: `y = b0 + b1*x1 + b2*x2 + ...`. Fitting chooses weights that minimise the squared differences between predictions and actuals (ordinary least squares). Each **coefficient** says how much the prediction changes per unit change in that feature, holding the others constant.

Assumptions for trustworthy coefficients and intervals: a roughly linear relationship, independent errors, constant error variance, and features that are not too strongly correlated with each other (**multicollinearity** makes coefficients unstable).

## Benefit
Fast, transparent and a strong baseline. Coefficients are directly explainable to business users, and with statsmodels you get confidence intervals for them.

## Code snippet
```python
from sklearn.linear_model import LinearRegression
model = LinearRegression().fit(X_train, y_train)
print(dict(zip(X_train.columns, model.coef_.round(2))), model.intercept_)
```

## Limits and misconceptions
- Non-linear relationships need transformed features (logs, splines, interactions) or another model.
- Outliers pull the line strongly; consider robust regression or transforming the target.
- Coefficients show association, not causation.
- Feature scaling does not change predictions but makes coefficients comparable.

## Remember this
Linear regression fits a weighted sum of features by least squares; it is the transparent baseline every regression model should beat.

## Related
ml-m02-regression-metrics, ml-m03-regularization, python-m09-scipy-statsmodels


# Logistic regression
id: ml-m03-logistic-regression
track: ml

## What we're learning
**Logistic regression** is the linear model for **classification**. It computes a weighted sum of features and passes it through the **sigmoid** function, which squeezes any number into a probability between 0 and 1. It is trained by minimising **log loss**. Coefficients act on the **log-odds**: a coefficient of 0.7 multiplies the odds by e^0.7, about 2.

To make a decision, compare the probability with a **threshold**, chosen from the costs of false positives and false negatives. Multi-class problems use softmax (multinomial) or one-versus-rest.

## Benefit
A fast, well-calibrated (usually) and explainable classifier, widely accepted in regulated areas such as credit scoring, and a strong baseline for any classification task.

## Limits and misconceptions
- Linear decision boundary: interactions and non-linear effects need engineered features.
- Despite the name, it is a classification method.
- With many correlated or sparse features, use regularisation.

## Remember this
Logistic regression turns a linear score into a probability with the sigmoid; coefficients change the log-odds, and the threshold is a business choice.

## Related
ml-m04-calibration, ml-m02-classification-metrics, ml-m03-regularization


# Regularisation: ridge, lasso, elastic net
id: ml-m03-regularization
track: ml

## What we're learning
**Regularisation** adds a penalty for large coefficients to the loss, discouraging overly complex models:

- **Ridge (L2)**: penalises the sum of squared coefficients; shrinks all coefficients towards zero, handles correlated features well.
- **Lasso (L1)**: penalises the sum of absolute coefficients; drives some coefficients exactly to zero, performing **feature selection**.
- **Elastic net**: a mix of both.

The penalty strength (alpha, or C = 1/strength in scikit-learn's logistic regression) is a hyperparameter tuned with cross-validation. The same idea appears elsewhere: tree depth limits, dropout and weight decay in neural networks.

## Benefit
Regularisation reduces overfitting, stabilises coefficients when features are correlated, and with lasso produces simpler models.

## Limits and misconceptions
- Features must be **scaled** before regularisation, or the penalty treats them unfairly.
- Lasso picks one of several correlated features somewhat arbitrarily.
- Too much regularisation underfits.

## Remember this
Regularisation penalises large weights: ridge shrinks them, lasso zeroes some out, and the strength is tuned by cross-validation.

## Related
ml-m02-bias-variance, ml-m04-encoding-scaling, ml-m04-feature-selection


# k-nearest neighbours
id: ml-m03-knn
track: ml

## What we're learning
**k-nearest neighbours (k-NN)** predicts by looking up the k most similar training examples (by a distance such as Euclidean or cosine) and taking a majority vote (classification) or average (regression). There is no real training step: the "model" is the stored data.

Choices: k (small k is noisy, large k is smooth), the distance metric, and weighting closer neighbours more.

## Benefit
Simple, intuitive ("customers like this one did X"), naturally handles many classes, and is the conceptual basis of similarity search, recommendations and vector retrieval in RAG.

## Limits and misconceptions
- **Feature scaling is essential**: otherwise features with large ranges (income) dominate distances.
- Prediction is slow on large datasets (searching all points), unless approximate nearest-neighbour indexes are used.
- In high dimensions, distances become less meaningful (curse of dimensionality).

## Remember this
k-NN predicts from the k most similar examples; scale features and use approximate indexes at scale.

## Related
ml-m04-encoding-scaling, tools-m10-vector-databases, ml-m03-recommenders


# Naive Bayes
id: ml-m03-naive-bayes
track: ml

## What we're learning
**Naive Bayes** classifiers apply Bayes' rule to compute the probability of each class given the features, with the "naive" assumption that features are **independent** given the class. Despite that unrealistic assumption, they work well for many problems, especially **text** (spam filtering, document categorisation) using word counts (multinomial naive Bayes) or word presence (Bernoulli).

## Benefit
Extremely fast to train and predict, works with little data and many features, and is a solid baseline for text classification.

## Limits and misconceptions
- Probabilities are often poorly calibrated (too extreme) because of the independence assumption.
- Correlated features are double-counted.
- For most text tasks today, embeddings with a simple classifier, or a language model, perform better, but naive Bayes remains a cheap baseline.

## Remember this
Naive Bayes applies Bayes' rule assuming independent features; fast and strong for simple text classification, poorly calibrated.

## Related
ml-m01-probability, ai-m03-embeddings


# Decision trees
id: ml-m03-decision-trees
track: ml

## What we're learning
A **decision tree** splits data with a sequence of yes/no questions on features ("tenure < 6 months?", "plan = basic?"), choosing at each step the split that best separates the target (by Gini impurity or entropy for classification, variance for regression). Leaves give the prediction. Trees handle numeric and categorical features, non-linear relationships and interactions without scaling.

Controls against overfitting: maximum depth, minimum samples per leaf, pruning.

## Benefit
Trees are easy to visualise and explain as rules, and they are the building block of random forests and gradient boosting, the strongest methods for tabular data.

## Limits and misconceptions
- A single deep tree overfits badly and is unstable: small data changes produce a different tree.
- Axis-aligned splits approximate smooth or diagonal relationships with staircases.
- Single trees are rarely the best predictor; use ensembles for accuracy and single shallow trees for explanation.

## Remember this
A decision tree is a learned set of if-then splits; easy to explain, prone to overfitting, and the basis of forests and boosting.

## Related
ml-m03-random-forests, ml-m03-gradient-boosting, ml-m02-bias-variance


# Random forests
id: ml-m03-random-forests
track: ml

## What we're learning
A **random forest** trains many decision trees, each on a random **bootstrap sample** of rows (bagging) and considering a random subset of features at each split, then averages their predictions (or takes a majority vote). The randomness makes trees different from one another, and averaging many different, overfit trees cancels much of their variance.

Useful by-products: **out-of-bag** error estimates (each tree is tested on rows it did not see) and feature importance scores.

## Benefit
Robust, accurate out of the box, little tuning, handles mixed feature types and is hard to badly overfit: a dependable baseline for tabular data.

## Limits and misconceptions
- Usually slightly less accurate than well-tuned gradient boosting.
- Large forests are big in memory and slower to predict.
- Default impurity-based feature importances are biased toward high-cardinality features; prefer permutation importance or SHAP.

## Remember this
A random forest averages many trees trained on random rows and features, cutting variance for robust, low-tuning performance.

## Related
ml-m03-decision-trees, ml-m03-gradient-boosting, ml-m04-interpretability-shap


# Gradient boosting
id: ml-m03-gradient-boosting
track: ml

## What we're learning
**Gradient boosting** builds trees **sequentially**: each new, small tree is trained to correct the errors (the gradient of the loss) of the ensemble so far, and its contribution is scaled by a **learning rate**. Hundreds or thousands of shallow trees add up to a very accurate model.

Leading implementations:
- **XGBoost**: regularised boosting, very widely used.
- **LightGBM**: histogram-based, leaf-wise growth, very fast on large data.
- **CatBoost**: strong native handling of categorical features.
- scikit-learn's **HistGradientBoosting** estimators.

Key hyperparameters: number of trees, learning rate, tree depth or leaves, subsampling, regularisation; use **early stopping** on a validation set.

## Benefit
On tabular business data (churn, fraud, credit, demand), gradient-boosted trees are usually the most accurate approach, often beating deep learning with far less effort.

## Code snippet
```python
import lightgbm as lgb
model = lgb.LGBMClassifier(n_estimators=2000, learning_rate=0.03, num_leaves=31,
                           subsample=0.8, colsample_bytree=0.8)
model.fit(X_train, y_train, eval_set=[(X_val, y_val)],
          callbacks=[lgb.early_stopping(100)])
```

## Limits and misconceptions
- More tuning-sensitive than random forests; can overfit with high learning rates and no early stopping.
- Less interpretable than linear models; use SHAP for explanations.
- Extrapolates poorly beyond the range of training data (trees predict constants outside it).

## Remember this
Gradient boosting adds small trees that fix previous errors; XGBoost, LightGBM and CatBoost are the go-to models for tabular data.

## Related
ml-m04-hyperparameter-tuning, ml-m04-interpretability-shap, ml-m03-random-forests


# Support vector machines
id: ml-m03-svm
track: ml

## What we're learning
A **support vector machine (SVM)** finds the boundary between classes with the widest possible **margin**, defined by the closest training points (the **support vectors**). With the **kernel trick** (RBF, polynomial kernels), SVMs fit non-linear boundaries by implicitly mapping data into higher-dimensional spaces. The C parameter trades margin width against training errors.

## Benefit
Strong performance on small and medium datasets with many features, such as text classification with sparse features, and a clear geometric intuition.

## Limits and misconceptions
- Kernel SVMs scale poorly to large datasets (training cost grows quickly with rows).
- Require feature scaling and careful tuning of C and kernel parameters.
- Do not output probabilities natively (calibration is added on top).
- For most tabular business problems today, gradient boosting is preferred.

## Remember this
SVMs find the widest-margin boundary, with kernels for non-linear cases; good for smaller, high-dimensional data, rarely first choice today.

## Related
ml-m03-logistic-regression, ml-m04-encoding-scaling, ml-m04-calibration


# Clustering
id: ml-m03-clustering
track: ml

## What we're learning
**Clustering** groups similar items without labels:

- **k-means**: choose k, assign points to the nearest of k centroids, move centroids to the mean, repeat. Fast; finds round, similar-sized clusters; needs scaled numeric features.
- **Hierarchical clustering**: builds a tree of merges (dendrogram); cut it at a chosen level. Good for small data and exploring structure.
- **DBSCAN** and **HDBSCAN**: density-based; find clusters of arbitrary shape and label sparse points as noise; no need to choose k.
- **Gaussian mixture models**: soft, probabilistic clusters.

Judging clusters: the **elbow** method and **silhouette** score help choose k, but the real test is whether clusters are **stable** and **useful** (interpretable segments that lead to different actions).

## Benefit
Customer segmentation, grouping products or documents, and finding structure for exploration or as features for other models.

## Limits and misconceptions
- There is no ground truth; any algorithm returns clusters even on random data.
- Results depend heavily on feature choice and scaling.
- Segments must be profiled and named with the business to be useful.

## Remember this
Clustering finds groups without labels; k-means for round clusters, density methods for odd shapes and noise, and usefulness is the real test.

## Related
ml-m02-supervised-unsupervised, ml-m03-pca, ml-m04-encoding-scaling


# PCA and dimensionality reduction
id: ml-m03-pca
track: ml

## What we're learning
**Principal component analysis (PCA)** finds new axes (**principal components**) that are combinations of the original features, ordered by how much of the data's **variance** each explains. Keeping the first few components compresses many correlated features into fewer, uncorrelated ones while losing little information. The **explained variance ratio** shows how much each component keeps.

For **visualisation** of high-dimensional data (such as embeddings) in 2D, non-linear methods like **t-SNE** and **UMAP** preserve local neighbourhoods better than PCA.

## Benefit
Compressing features speeds up models, reduces noise and multicollinearity, and makes high-dimensional data viewable.

## Limits and misconceptions
- Components are combinations of features and hard to interpret.
- PCA is linear and sensitive to scaling; standardise first.
- t-SNE and UMAP plots distort global distances and cluster sizes; use them for exploration, not as evidence.

## Remember this
PCA compresses correlated features into a few components that keep most variance; t-SNE and UMAP are for visualising, not measuring.

## Related
ml-m01-linear-algebra, ml-m03-clustering, ai-m03-embeddings


# Anomaly detection
id: ml-m03-anomaly-detection
track: ml

## What we're learning
**Anomaly detection** finds unusual records: fraud, equipment faults, data quality problems, security events. Approaches, from simple to complex:

- **Statistical rules**: z-scores, interquartile range fences, control charts, seasonal baselines for time series.
- **Isolation Forest**: isolates points with random splits; anomalies need fewer splits.
- **Local Outlier Factor** and other density or distance-based methods.
- **Autoencoders**: neural networks that reconstruct normal data well and anomalies poorly.
- **Supervised models** when labelled anomalies exist (then it becomes imbalanced classification).

## Benefit
Catches rare problems without needing many labelled examples, and is the basis of data observability tools that flag unusual volumes or distributions.

## Limits and misconceptions
- "Unusual" is not "bad": promotions, holidays and new products look anomalous. Feedback from reviewers is essential to tune thresholds.
- Many anomalies in pipelines are data quality issues (duplicates, unit changes, missing loads); check data before blaming the world.
- Evaluation is hard without labels; start with simple, explainable rules.

## Remember this
Start anomaly detection with simple statistical baselines, add Isolation Forest or similar for multivariate cases, and route alerts to people who can judge them.

## Related
tools-m07-data-observability, ml-m04-imbalanced-data, ai-m11-dq-triage-agent


# Time series forecasting
id: ml-m03-forecasting
track: ml

## What we're learning
**Forecasting** predicts future values of a series (demand, load, revenue). Components to understand first: **trend**, **seasonality** (daily, weekly, yearly), **holidays and events**, and noise.

Approaches:
- **Baselines**: last value (naive), same period last year (seasonal naive), moving average. Always compute these.
- **Statistical models**: exponential smoothing (ETS), ARIMA and SARIMA, which model the series' own patterns (statsmodels, statsforecast).
- **ML models**: gradient boosting on engineered features (lags, rolling means, calendar features, prices, promotions), which handles many related series and external drivers well.
- **Deep learning and pretrained "foundation" forecasting models** for large collections of series.

Evaluate with **backtesting**: repeatedly train on the past and forecast the next period (rolling origin), never random splits.

## Benefit
Good forecasts drive inventory, staffing and capacity planning; knowing the baselines prevents complex models that are worse than "same as last week".

## Limits and misconceptions
- Forecasts should come with uncertainty (prediction intervals), not single numbers.
- Structural breaks (pandemic, new product, policy change) break any model trained on the past.
- Lag features must only use data available at forecast time.

## Remember this
Beat the seasonal naive baseline, use statistical models for single series and boosted trees with lag features for many, and backtest over time.

## Related
python-m04-time-series, ml-m02-regression-metrics, ml-m02-data-leakage, sql-m06-time-series


# Recommender basics
id: ml-m03-recommenders
track: ml

## What we're learning
**Recommender systems** suggest items (products, content, next actions) to users:

- **Content-based**: recommend items similar to those a user liked, using item attributes or embeddings.
- **Collaborative filtering**: use patterns across users. **User-based** or **item-based** neighbourhoods ("customers who bought this also bought"), and **matrix factorisation**, which learns latent factors for users and items from the interaction matrix (ALS in Spark MLlib).
- **Implicit feedback**: most data is clicks, views and purchases rather than ratings; absence of interaction is not dislike.
- **Hybrid and two-stage systems**: candidate generation (often embedding similarity) followed by a ranking model.

Evaluation: offline metrics such as precision at k, recall at k and NDCG, then online A/B tests.

## Benefit
Recommendations drive cross-sell, engagement and personalisation, and the same similarity ideas power semantic search.

## Limits and misconceptions
- **Cold start**: new users and items have no interactions; content features or popularity fill the gap.
- Popular items dominate; diversity and fairness need deliberate handling.
- Offline metrics often disagree with online results; test live.

## Remember this
Recommenders combine content similarity and collaborative patterns from implicit feedback, handle cold start, and are validated online.

## Related
ml-m03-knn, ai-m03-embeddings, tools-m10-vector-databases
