# Types, references and mutability
id: python-m01-types-mutability
track: python

## What we're learning
In Python, variables are **names** that refer to **objects**. Assignment never copies; it binds another name to the same object. Objects are either:

- **Immutable**: `int`, `float`, `str`, `tuple`, `frozenset`, `bytes`. "Changing" them creates a new object.
- **Mutable**: `list`, `dict`, `set`, most class instances, NumPy arrays, pandas DataFrames. Changes are visible through every name that refers to them.

Consequences that bite data engineers:
- Passing a list or DataFrame into a function and modifying it changes the caller's object.
- **Mutable default arguments** (`def f(x, cache=[])`) are created once and shared across calls.
- `copy.copy` makes a shallow copy (nested objects shared); `copy.deepcopy` copies everything.
- pandas distinguishes **views** and **copies** of DataFrames, which is the source of `SettingWithCopyWarning` (and of the copy-on-write behaviour that pandas 3 makes the default).

## Benefit
Understanding references explains "my config changed by itself" and "the DataFrame was modified somewhere else" bugs, which are common in pipeline code.

## Code snippet
```python
def add_audit(cols, extra=None):          # not extra=[]
    extra = [] if extra is None else extra
    return cols + extra + ["load_ts"]      # returns a new list, caller's list untouched

a = {"region": "EU"}
b = a            # same object
b["region"] = "US"
print(a)         # {'region': 'US'}
```

## Limits and misconceptions
- `is` checks identity (same object); `==` checks equality. Use `is` only for `None`.
- Small integers and some strings are cached by CPython, so `is` may appear to work on them by accident.

## Remember this
Python names point to objects; mutating a shared mutable object changes it for everyone, so copy deliberately and avoid mutable defaults.

## Related
python-m04-pandas-core, python-m01-functions-decorators


# Comprehensions, iterators and generators
id: python-m01-comprehensions-generators
track: python

## What we're learning
- **Comprehensions** build lists, dicts and sets concisely: `[f(x) for x in rows if cond(x)]`, `{k: v for k, v in pairs}`.
- An **iterator** produces values one at a time (`next()`), and a `for` loop works with any iterable.
- A **generator** is a function that uses `yield`, or a generator expression `(f(x) for x in rows)`. It produces values **lazily**, on demand, keeping only one item in memory at a time.
- `itertools` provides building blocks: `islice`, `chain`, `groupby`, `batched` (Python 3.12+).

## Benefit
Generators let you process files, API pages or database cursors that are larger than memory as streams, and they compose into pipelines just like Spark's lazy transformations.

## Code snippet
```python
import csv
from itertools import batched   # Python 3.12+

def read_rows(path):
    with open(path, newline="", encoding="utf-8") as f:
        yield from csv.DictReader(f)          # one row at a time

valid = (r for r in read_rows("orders.csv") if r["amount"])   # still lazy
for batch in batched(valid, 10_000):                           # load in chunks
    insert_batch(batch)
```

## Limits and misconceptions
- A generator can be consumed only once; iterating again yields nothing.
- Comprehensions build the whole result in memory; switch to generator expressions for large inputs.
- Deeply nested comprehensions hurt readability; use a loop or helper function instead.

## Remember this
Comprehensions build collections concisely; generators stream values lazily so large data never has to fit in memory.

## Related
pyspark-m01-lazy-evaluation, python-m06-files-formats, python-m06-rest-apis


# Functions, closures and decorators
id: python-m01-functions-decorators
track: python

## What we're learning
Functions in Python are objects: they can be passed as arguments, returned from other functions and stored in variables.

- `*args` and `**kwargs` accept any extra positional and keyword arguments; keyword-only arguments (after `*`) make calls explicit.
- A **closure** is an inner function that remembers variables from the enclosing function.
- A **decorator** is a function that takes a function and returns a wrapped version, applied with `@name`. Frameworks use decorators heavily: Airflow and Prefect `@task`, Dagster `@asset`, pytest `@pytest.fixture`, PySpark `@pandas_udf`, FastAPI routes, and `functools.lru_cache` for memoisation.

## Benefit
Reading framework code becomes easy once decorators are clear, and small decorators (retry, timing, logging) remove repetition from pipeline code.

## Code snippet
```python
import functools, time, logging

def retry(times=3, delay=2.0):
    def wrap(func):
        @functools.wraps(func)                 # keep name and docstring
        def inner(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except ConnectionError:
                    logging.warning("attempt %d failed", attempt)
                    if attempt == times:
                        raise
                    time.sleep(delay * attempt)
        return inner
    return wrap

@retry(times=5)
def fetch_page(url): ...
```

## Limits and misconceptions
- Decorators run at import time; heavy work inside them slows startup.
- Without `functools.wraps`, wrapped functions lose their names, which confuses logs and frameworks.
- Lambdas are fine for short expressions; give anything longer a name.

## Remember this
Functions are objects; decorators wrap them to add behaviour, and most data frameworks are built on that idea.

## Related
python-m01-classes-dataclasses, pyspark-m04-pandas-udfs-arrow, tools-m05-prefect


# Classes and dataclasses
id: python-m01-classes-dataclasses
track: python

## What we're learning
A **class** bundles data (attributes) with behaviour (methods). In data work you need classes mainly for:

- **Records and configuration**: use `@dataclass` to generate `__init__`, `__repr__` and equality from type-annotated fields; `frozen=True` makes them immutable.
- **Validated models**: **Pydantic** models parse and validate input (API payloads, config files, LLM structured outputs) against types, raising clear errors.
- **Interfaces**: a base class or `typing.Protocol` describing what a reader or writer must provide, so implementations can be swapped in tests.

## Benefit
Typed records replace loose dictionaries (`row["amout"]` typos), give editor autocompletion, and make validation explicit at system boundaries.

## Code snippet
```python
from dataclasses import dataclass
from pydantic import BaseModel, Field

@dataclass(frozen=True)
class TableConfig:
    source: str
    target: str
    key: str
    incremental: bool = True

class Order(BaseModel):                      # validates and converts types
    order_id: str
    amount: float = Field(ge=0)
    currency: str = "EUR"

Order.model_validate({"order_id": "A1", "amount": "12.5"})   # amount becomes 12.5
```

## Limits and misconceptions
- Not everything needs a class. Plain functions over DataFrames are often clearer for transformations.
- Validating millions of rows one object at a time is slow; validate in bulk with DataFrame checks, and use models at boundaries (configs, API inputs).

## Remember this
Use dataclasses for typed records and config, Pydantic to validate external input, and keep transformation logic in functions.

## Related
python-m01-typing, ai-m04-structured-outputs, python-m08-config-logging


# Exceptions and context managers
id: python-m01-errors-context-managers
track: python

## What we're learning
- **Exceptions**: `try` / `except SpecificError` / `else` / `finally`. Catch specific exceptions, add context, and re-raise (`raise ... from err`) rather than hiding failures. Define custom exception classes for domain errors (`SchemaMismatchError`).
- **Context managers** (`with` blocks) acquire and release resources reliably, even when errors occur: files, database connections and transactions, locks, temporary directories, Spark sessions in tests. Write your own with `contextlib.contextmanager`.

## Benefit
Pipelines that fail loudly with clear messages, and always close connections and roll back half-done work, are far easier to operate.

## Code snippet
```python
from contextlib import contextmanager

class LoadError(Exception):
    pass

@contextmanager
def transaction(conn):
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise                                # never swallow

try:
    with transaction(get_connection()) as conn:
        conn.execute("DELETE FROM stg.orders WHERE load_date = ?", (run_date,))
        conn.executemany("INSERT INTO stg.orders VALUES (?, ?, ?)", rows)
except Exception as err:
    raise LoadError(f"orders load failed for {run_date}") from err
```

## Limits and misconceptions
- `except Exception: pass` hides bugs and data loss; it is almost never right in pipelines.
- Catching too broadly also catches `KeyboardInterrupt`-like control flow if you use bare `except:`.
- Retries belong around transient errors (network), not around logic errors.

## Remember this
Catch specific errors, add context and re-raise; use with blocks so connections, files and transactions are always cleaned up.

## Related
sql-m10-error-handling, pyspark-m12-idempotency-retries, python-m01-functions-decorators


# Type hints
id: python-m01-typing
track: python

## What we're learning
**Type hints** annotate the expected types of variables, parameters and return values: `def load(path: str, limit: int | None = None) -> pd.DataFrame:`. Python does not enforce them at runtime; **static type checkers** (mypy, pyright, the type checking in editors) read them to catch mistakes before running code.

Useful constructs: `list[str]`, `dict[str, int]`, `X | None`, `Literal["append", "overwrite"]`, `TypedDict` for dict shapes, `Protocol` for duck-typed interfaces, generics.

Some libraries **do** use hints at runtime: Pydantic validates against them, FastAPI builds APIs from them, dataclasses use them to define fields, and pandas UDFs use them to choose the UDF type.

## Benefit
Hints document intent, enable autocompletion, and catch whole classes of bugs (passing None, wrong argument order) in CI instead of production.

## Limits and misconceptions
- Hints do not validate data at runtime unless a library does it.
- DataFrame column types are not captured by `pd.DataFrame` hints; schema checks (Pandera, Spark schemas) cover that.
- Adopt gradually: start with public functions and new code.

## Remember this
Type hints document and statically check code; libraries like Pydantic and FastAPI also use them at runtime.

## Related
python-m01-classes-dataclasses, python-m08-pytest, pyspark-m04-pandas-udfs-arrow
