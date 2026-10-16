# Track: ml — Machine Learning

> Concept-first. Stage labels are a roadmap only; nothing is locked. Neural networks are a bridge; deep learning and transformers live in the ai track.

## ml-m01 — Stage 0: Math and statistics
- ml-m01-linear-algebra | Linear algebra for ML | Vectors, matrices, dot products and why data is a matrix | code: no | related: python-m03-numpy-arrays
- ml-m01-calculus-gradients | Calculus essentials: derivatives and gradients | Slopes, partial derivatives, the gradient and the chain rule | code: no | related: ml-m01-optimization, ml-m05-backpropagation
- ml-m01-probability | Probability | Events, conditional probability, independence and Bayes' rule | code: no | related: ml-m03-naive-bayes
- ml-m01-distributions | Distributions | Normal, binomial, Poisson and long-tailed data; mean, variance and percentiles | code: no | related: sql-m11-percentiles
- ml-m01-hypothesis-testing | Hypothesis testing | Null hypotheses, p-values, errors of type I and II, and common misreadings | code: no | related: sql-m11-ab-analysis
- ml-m01-confidence-intervals | Confidence intervals | Estimating uncertainty and what an interval does and does not mean | code: no | related: ml-m01-hypothesis-testing
- ml-m01-optimization | Optimisation and gradient descent | Loss functions, gradient descent, learning rates and local minima | code: no | related: ml-m01-calculus-gradients

## ml-m02 — Stage 1: Fundamentals
- ml-m02-problem-framing | Framing an ML problem | Turning a business question into a prediction target, and when not to use ML | code: no | related: ml-m02-supervised-unsupervised
- ml-m02-supervised-unsupervised | Supervised, unsupervised and other learning types | Labels or no labels, classification versus regression, self-supervised learning | code: no | related: ai-m01-ai-ml-dl-genai
- ml-m02-bias-variance | Bias, variance, overfitting and underfitting | The trade-off and how to recognise each problem | code: no | related: ml-m03-regularization
- ml-m02-train-val-test | Train, validation and test sets | Why three splits, time-based splits, and test set hygiene | code: no | related: ml-m02-data-leakage
- ml-m02-cross-validation | Cross-validation | k-fold, stratified and time-series cross-validation | code: yes | related: ml-m02-train-val-test
- ml-m02-classification-metrics | Classification metrics | Accuracy, precision, recall, F1, ROC AUC, PR AUC and the confusion matrix | code: no | related: ml-m04-imbalanced-data
- ml-m02-regression-metrics | Regression metrics | MAE, RMSE, MAPE and R squared, and which to report | code: no | related: ml-m03-linear-regression
- ml-m02-data-leakage | Data leakage | Target leakage, train-test contamination and how pipelines prevent it | code: no | related: ml-m04-sklearn-pipelines

## ml-m03 — Stage 2: Classical algorithms
- ml-m03-linear-regression | Linear regression | Fitting a line, coefficients, assumptions and interpretation | code: yes | related: ml-m02-regression-metrics
- ml-m03-logistic-regression | Logistic regression | Probabilities for classification, the decision threshold | code: yes | related: ml-m04-calibration
- ml-m03-regularization | Regularisation: ridge, lasso, elastic net | Penalising complexity to reduce overfitting | code: no | related: ml-m02-bias-variance
- ml-m03-knn | k-nearest neighbours | Prediction by similarity, distance and scaling | code: no | related: ml-m04-encoding-scaling
- ml-m03-naive-bayes | Naive Bayes | Probabilistic classification with an independence assumption | code: no | related: ml-m01-probability
- ml-m03-decision-trees | Decision trees | Splitting rules, depth, and why single trees overfit | code: no | related: ml-m03-random-forests
- ml-m03-random-forests | Random forests | Bagging many trees and feature randomness | code: no | related: ml-m03-gradient-boosting
- ml-m03-gradient-boosting | Gradient boosting | Boosted trees: XGBoost, LightGBM, CatBoost, and why they win on tabular data | code: yes | related: ml-m04-hyperparameter-tuning
- ml-m03-svm | Support vector machines | Margins, kernels and where SVMs still fit | code: no | related: ml-m03-logistic-regression
- ml-m03-clustering | Clustering | k-means, hierarchical clustering and DBSCAN, and judging clusters | code: no | related: ml-m02-supervised-unsupervised
- ml-m03-pca | PCA and dimensionality reduction | Principal components, explained variance, t-SNE and UMAP for visualisation | code: no | related: ml-m01-linear-algebra
- ml-m03-anomaly-detection | Anomaly detection | Statistical rules, isolation forest and when anomalies are really data quality issues | code: no | related: tools-m07-data-observability
- ml-m03-forecasting | Time series forecasting | Trend and seasonality, baselines, ARIMA-style models, ML forecasting and backtesting | code: no | related: python-m04-time-series
- ml-m03-recommenders | Recommender basics | Collaborative filtering, content-based methods and implicit feedback | code: no | related: ml-m03-knn

## ml-m04 — Stage 3: Features and pipelines
- ml-m04-encoding-scaling | Encoding and scaling features | One-hot, ordinal and target encoding; standardisation and normalisation | code: yes | related: ml-m04-sklearn-pipelines
- ml-m04-missing-data | Missing data | Why values are missing, imputation strategies and missing indicators | code: yes | related: python-m06-eda-workflow
- ml-m04-imbalanced-data | Imbalanced data | Class weights, resampling, threshold tuning and the right metrics | code: yes | related: ml-m02-classification-metrics
- ml-m04-feature-selection | Feature engineering and selection | Creating useful features and removing useless ones | code: no | related: ml-m04-interpretability-shap
- ml-m04-sklearn-pipelines | scikit-learn pipelines | Pipeline and ColumnTransformer to keep preprocessing honest | code: yes | related: ml-m02-data-leakage, python-m09-scikit-learn
- ml-m04-hyperparameter-tuning | Hyperparameter tuning | Grid, random and Bayesian search; Optuna; AutoML | code: yes | related: ml-m02-cross-validation
- ml-m04-interpretability-shap | Interpretability and SHAP | Global and local explanations, permutation importance, SHAP values and their limits | code: no | related: ml-m04-fairness
- ml-m04-calibration | Probability calibration | When predicted probabilities need to be trustworthy, Platt scaling and isotonic | code: no | related: ml-m03-logistic-regression
- ml-m04-fairness | Fairness | Bias in data and models, fairness metrics and their trade-offs | code: no | related: ai-m08-responsible-ai

## ml-m05 — Stage 4: Neural network basics
- ml-m05-neural-network-basics | Neurons, layers and activations | What a neural network computes and why depth helps | code: no | related: ai-m02-cnns
- ml-m05-backpropagation | Backpropagation | How gradients flow backwards through a network | code: no | related: ml-m01-calculus-gradients
- ml-m05-training-loops | Training loops and regularisation | Epochs, batches, optimisers, dropout, early stopping | code: yes | related: ml-m02-bias-variance
- ml-m05-pytorch-concepts | PyTorch concepts | Tensors, modules, autograd and the training loop in PyTorch | code: yes | related: python-m09-pytorch

## ml-m06 — Stage 5: MLOps
- ml-m06-experiment-tracking | Experiment tracking | Logging parameters, metrics and artefacts so runs are comparable | code: yes | related: tools-m10-mlflow
- ml-m06-model-registry | Model registry | Versioning models, aliases or stages, approval and lineage | code: no | related: databricks-m06-mlflow-on-databricks
- ml-m06-batch-vs-online-serving | Batch vs online serving | Scoring in pipelines versus real-time endpoints, and streaming in between | code: no | related: tools-m10-model-serving
- ml-m06-drift-monitoring | Drift and model monitoring | Data drift, concept drift, performance monitoring with delayed labels | code: no | related: tools-m07-data-observability
- ml-m06-retraining | Retraining strategies | Scheduled versus triggered retraining and safe rollout | code: no | related: ml-m06-drift-monitoring
- ml-m06-feature-stores | Feature stores | Offline and online features, point-in-time correctness, reuse | code: no | related: tools-m10-feature-stores
- ml-m06-testing-reproducibility | Testing and reproducibility in ML | Seeds, data versioning, environment pinning, tests for ML code | code: no | related: python-m08-pytest
- ml-m06-ml-on-platforms | ML on Spark, Fabric, Databricks and Snowflake | Spark MLlib, distributed training options and each platform's ML features | code: no | related: fabric-m06-experiments-models, databricks-m06-mlflow-on-databricks, snowflake-m07-snowpark-ml
