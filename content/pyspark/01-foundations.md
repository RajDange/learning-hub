# Lazy evaluation (sample)
id: pyspark-m01-lazy-evaluation
track: pyspark

## What we're learning
Spark does not run a transformation when you write it. It records the step in a plan and runs the whole plan only when an action asks for a result.

## Benefit
Because Spark sees the whole plan before running it, it can drop unused columns, push filters down to the source and combine steps.

## Code snippet
```python
df = spark.read.parquet("/data/orders")      # nothing read yet
big = df.filter(df.amount > 1000)            # still nothing
big.count()                                  # action: now Spark runs the plan
```

## Remember this
Transformations build a plan; only actions run it.

## Related
pyspark-m01-lazy-evaluation
