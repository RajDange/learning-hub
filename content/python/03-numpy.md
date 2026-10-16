# NumPy arrays and broadcasting
id: python-m03-numpy-arrays
track: python

## What we're learning
**NumPy** is the foundation of numerical Python. Its `ndarray` is a block of memory holding values of **one dtype** (`float64`, `int32`, `bool`, ...) with a **shape** (`(rows, cols)` and more dimensions). Operations run in compiled C on the whole array at once.

**Broadcasting** lets arrays of different shapes combine: dimensions are compared from the right, and a dimension of size 1 is stretched to match. For example, subtracting a per-column mean (shape `(3,)`) from a matrix (shape `(1000, 3)`) works without loops or copies.

pandas, scikit-learn, PyTorch (via conversion), SciPy and many others use NumPy arrays or compatible structures underneath.

## Benefit
Understanding arrays, dtypes and broadcasting explains how vectorised libraries think and why they are fast, and it is the language of ML math (vectors and matrices).

## Code snippet
```python
import numpy as np

X = np.random.default_rng(42).normal(size=(1000, 3))   # 1000 rows, 3 features
X_std = (X - X.mean(axis=0)) / X.std(axis=0)            # broadcasting per column
mask = X_std[:, 0] > 2                                   # boolean array
print(X.shape, X.dtype, mask.sum())
```

## Limits and misconceptions
- Arrays are homogeneous; mixed types become `object` arrays, which lose the speed.
- Slicing returns **views** that share memory; modifying a view changes the original. Use `.copy()` when needed.
- Broadcasting mistakes (shape `(n,)` versus `(n, 1)`) silently produce wrong-shaped results; check shapes.
- NumPy is single-machine and in-memory.

## Remember this
NumPy arrays are typed blocks of memory processed in C, and broadcasting combines shapes without loops.

## Related
ml-m01-linear-algebra, python-m03-vectorization, python-m04-pandas-core


# Vectorisation
id: python-m03-vectorization
track: python

## What we're learning
**Vectorisation** means expressing a computation as operations on whole arrays or columns instead of a Python loop over elements. A Python loop executes interpreter bytecode per element; a vectorised operation runs one call into optimised C (often with SIMD CPU instructions) for all elements. The difference is often 10 to 100 times or more.

Typical rewrites:
- Loops with `if` to `np.where`, `np.select` or pandas `.where`, `.mask`.
- Row-wise `df.apply(func, axis=1)` to column arithmetic and built-in string and date accessors (`.str`, `.dt`).
- Cumulative logic to `cumsum`, `diff`, `shift`, rolling windows.

## Benefit
Vectorised code is faster and usually shorter, and the same habit transfers directly to Spark and Polars expressions.

## Code snippet
```python
import numpy as np
import pandas as pd

# Slow: df["band"] = df.apply(lambda r: "large" if r.amount > 1000 else "small", axis=1)
df["band"] = np.where(df["amount"] > 1000, "large", "small")

conditions = [df["amount"] >= 1000, df["amount"] >= 100]
df["band3"] = np.select(conditions, ["large", "medium"], default="small")
```

## Limits and misconceptions
- Some logic is inherently sequential (each value depends on the previous result non-linearly); then use Numba, Cython or a different approach.
- Vectorising can increase memory use by creating intermediate arrays.
- Profile before optimising; a loop over 100 rows is fine.

## Remember this
Replace Python loops with whole-array operations; the speed comes from running in compiled code once instead of the interpreter per element.

## Related
python-m07-profiling, pyspark-m04-builtin-functions, python-m03-numpy-arrays
