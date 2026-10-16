# Cohorts and retention
id: sql-m11-cohorts-retention
track: sql

## What we're learning
A **cohort** is a group of users (or customers, accounts) who started in the same period, for example everyone whose first purchase was in March 2025. **Retention** measures what share of each cohort is still active N periods later. The result is usually a triangle: cohorts as rows, months since start as columns.

SQL steps:
1. Find each user's **cohort period** (first activity) with `MIN(activity_date)`.
2. For each activity, compute the **period number** since the cohort start.
3. Count distinct active users per cohort and period, and divide by the cohort size.

## Benefit
Cohort retention separates growth from churn: total active users can rise while every new cohort retains worse, which only cohorts reveal.

## Code snippet
```sql
WITH first_seen AS (
  SELECT user_id, DATE_TRUNC('month', MIN(order_date)) AS cohort_month
  FROM orders GROUP BY user_id
), activity AS (
  SELECT DISTINCT o.user_id, f.cohort_month,
         DATEDIFF(month, f.cohort_month, DATE_TRUNC('month', o.order_date)) AS month_no
  FROM orders o JOIN first_seen f ON f.user_id = o.user_id
)
SELECT cohort_month, month_no,
       COUNT(*) AS active_users,
       COUNT(*) * 1.0 / FIRST_VALUE(COUNT(*)) OVER (PARTITION BY cohort_month ORDER BY month_no)
         AS retention
FROM activity
GROUP BY cohort_month, month_no
ORDER BY cohort_month, month_no;
-- Snowflake syntax; T-SQL: DATETRUNC(month, ...) and DATEDIFF(month, ...); Oracle: TRUNC(d,'MM'), MONTHS_BETWEEN
```

## Limits and misconceptions
- Define "active" precisely (purchase, login, any event); results change a lot.
- Recent cohorts have fewer observed periods; do not compare them on missing columns.
- Users returning after a gap count as retained in that period unless you define retention as consecutive.

## Remember this
Group users by start period, count who is active in each following period, and divide by cohort size.

## Related
sql-m06-calendar-tables, sql-m11-funnels, sql-m03-window-frames


# Funnels
id: sql-m11-funnels
track: sql

## What we're learning
A **funnel** measures how many users pass through ordered steps, for example: viewed product, added to cart, started checkout, paid. Conversion rate per step = users reaching the step / users reaching the previous step.

Approaches:
- **Simple funnel**: count distinct users who did each event at all (ignores order).
- **Ordered funnel**: for each user, take the first time of each step and require each step's time to be after the previous one (and often within a time window or session).
- Engines with special support: Snowflake's `MATCH_RECOGNIZE` and Oracle's `MATCH_RECOGNIZE` express ordered event patterns directly.

## Benefit
Funnels locate where users drop out, which focuses product, marketing and process improvements.

## Code snippet
```sql
WITH steps AS (
  SELECT user_id,
         MIN(CASE WHEN event = 'view'     THEN event_ts END) AS t_view,
         MIN(CASE WHEN event = 'cart'     THEN event_ts END) AS t_cart,
         MIN(CASE WHEN event = 'checkout' THEN event_ts END) AS t_checkout,
         MIN(CASE WHEN event = 'paid'     THEN event_ts END) AS t_paid
  FROM events
  WHERE event_ts >= '2025-10-01' AND event_ts < '2025-11-01'
  GROUP BY user_id
)
SELECT COUNT(t_view) AS viewed,
       COUNT(CASE WHEN t_cart > t_view THEN 1 END) AS carted,
       COUNT(CASE WHEN t_checkout > t_cart AND t_cart > t_view THEN 1 END) AS checked_out,
       COUNT(CASE WHEN t_paid > t_checkout AND t_checkout > t_cart AND t_cart > t_view THEN 1 END) AS paid
FROM steps;
```

## Limits and misconceptions
- Using first occurrences simplifies the logic but misses users who repeat steps in a later session; session-based funnels are more precise.
- Bots and test users distort funnels; filter them.
- A funnel shows where users drop, not why.

## Remember this
Take each user's first time at each step, require increasing times, and compare step counts.

## Related
sql-m03-sessionization, sql-m11-cohorts-retention, sql-m11-ab-analysis


# Percentiles and medians
id: sql-m11-percentiles
track: sql

## What we're learning
Averages hide skew: a few large orders inflate the mean. **Percentiles** (median = 50th, p95, p99) describe distributions better.

- `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY x)`: continuous, interpolates between values. Available as an aggregate in Oracle and Snowflake; in SQL Server only as a **window function** (`OVER (PARTITION BY ...)`).
- `PERCENTILE_DISC(0.5)`: returns an actual value from the data.
- `MEDIAN(x)`: Oracle and Snowflake shortcut; Fabric Warehouse adds `APPROX_MEDIAN` and others.
- **Approximate** percentiles for big data: `APPROX_PERCENTILE` (Snowflake, Spark, SQL Server 2022 `APPROX_PERCENTILE_CONT`), `percentile_approx` in Spark. Much cheaper, small error.

## Benefit
p95 latency, median order value and income distributions are the honest summaries for skewed data, and approximate versions make them affordable at scale.

## Code snippet
```sql
-- Oracle / Snowflake: median and p95 order value per region
SELECT region,
       PERCENTILE_CONT(0.5)  WITHIN GROUP (ORDER BY amount) AS median_amount,
       PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY amount) AS p95_amount
FROM orders GROUP BY region;

-- SQL Server: window form, then distinct
SELECT DISTINCT region,
       PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount) OVER (PARTITION BY region) AS median_amount
FROM orders;
```

## Limits and misconceptions
- Percentiles cannot be added or averaged across groups; the median of medians is not the overall median. Store raw data or sketches for re-aggregation.
- Exact percentiles need sorting each group; on large data use approximate functions.

## Remember this
Use medians and percentiles for skewed data, approximate versions at scale, and never average them across groups.

## Related
ml-m01-distributions, sql-m11-ab-analysis, pyspark-m03-groupby-aggregation


# A/B test analysis in SQL
id: sql-m11-ab-analysis
track: sql

## What we're learning
In an **A/B test**, users are randomly assigned to a control (A) and a variant (B), and a metric (conversion, revenue per user) is compared. SQL does the data part:

1. Join **assignments** to **outcomes** within the test window, counting each user once in the group they were assigned (intention to treat).
2. Compute per group: users, conversions, conversion rate, mean and variance of continuous metrics.
3. Compute the difference and a **standard error**, then a z-statistic or confidence interval. For conversion rates, the standard error of the difference is `SQRT(p1(1-p1)/n1 + p2(1-p2)/n2)`.

The statistical decision (significance, power, multiple testing) needs proper statistics, often in Python with SciPy or statsmodels.

## Benefit
Most of the effort and most of the errors in experiments are in data preparation; doing it correctly in SQL makes results trustworthy and reproducible.

## Code snippet
```sql
WITH per_user AS (
  SELECT a.user_id, a.variant,
         MAX(CASE WHEN o.order_id IS NOT NULL THEN 1 ELSE 0 END) AS converted
  FROM assignments a
  LEFT JOIN orders o ON o.user_id = a.user_id
                    AND o.order_ts BETWEEN a.assigned_ts AND a.assigned_ts + INTERVAL '14 days'
  WHERE a.experiment = 'checkout_v2'
  GROUP BY a.user_id, a.variant
)
SELECT variant, COUNT(*) AS users, AVG(converted * 1.0) AS conv_rate
FROM per_user GROUP BY variant;
```

## Limits and misconceptions
- Check **sample ratio mismatch** first: if a 50/50 test shows 52/48 users, assignment or logging is broken.
- Peeking at results daily and stopping when significant inflates false positives.
- Revenue metrics are skewed; consider capping outliers or using medians and bootstrap methods.
- Statistical significance is not business significance.

## Remember this
SQL prepares A/B data (one row per assigned user, outcome in window, sample ratio check); the inference needs proper statistics.

## Related
ml-m01-hypothesis-testing, ml-m01-confidence-intervals, python-m09-scipy-statsmodels, sql-m11-funnels
