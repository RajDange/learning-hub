# Configuration and logging
id: python-m08-config-logging
track: python

## What we're learning
**Configuration**: separate what changes per environment (paths, table names, URLs, batch sizes) from code.
- **Environment variables** for deployment settings and secret references (`os.environ`, `.env` files in development with `python-dotenv`).
- **Config files** (YAML, TOML, JSON) for structured settings per environment, loaded and validated at startup, for example with **pydantic-settings**.
- Command-line arguments (`argparse`, `typer`) for run parameters such as dates.
- Secrets from a vault, never in files committed to Git.

**Logging** with the standard `logging` module:
- Create a module logger (`logging.getLogger(__name__)`), configure handlers and format once at the entry point.
- Use levels (`DEBUG`, `INFO`, `WARNING`, `ERROR`) consistently, and include context (run date, table, row counts).
- Structured (JSON) logs are easier to search in log platforms.

## Benefit
The same code runs in dev, test and prod with only configuration changing, and logs answer "what happened in last night's run?" without rerunning it.

## Code snippet
```python
import logging
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    env: str = "dev"
    source_url: str
    target_table: str
    batch_size: int = 10_000          # read from environment variables like TARGET_TABLE

log = logging.getLogger(__name__)

def main():
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
    s = Settings()
    log.info("starting load env=%s target=%s", s.env, s.target_table)
```

## Limits and misconceptions
- `print` is not logging: no levels, no timestamps, hard to route.
- Logging secrets or personal data creates a breach in the log store.
- Excessive DEBUG logging in production costs money and hides signal.

## Remember this
Keep environment settings out of code and validated at startup, and log with levels and context through the logging module.

## Related
pyspark-m12-logging-monitoring-debugging, tools-m09-secrets-identity, python-m01-classes-dataclasses


# Testing with pytest
id: python-m08-pytest
track: python

## What we're learning
**pytest** is the standard Python test framework. Tests are plain functions named `test_*` using plain `assert`. Key features:

- **Fixtures** provide reusable setup (a Spark session, a temporary database, sample DataFrames) injected by argument name, with scopes (function, module, session).
- **Parametrisation** runs one test over many inputs (`@pytest.mark.parametrize`).
- **tmp_path** for temporary files, **monkeypatch** and `unittest.mock` to replace external calls.
- Plugins: `pytest-cov` for coverage, `pytest-xdist` for parallel runs.

What to test in data code: transformation functions (input DataFrame to expected output), edge cases (nulls, duplicates, empty input, time zones), parsing of source formats, and contracts with external APIs (mocked). Tools such as `pandas.testing.assert_frame_equal`, `pyspark.testing.assertDataFrameEqual` and Pandera schemas help.

## Benefit
Tests make refactoring and upgrades (a new pandas or Spark version) safe, and catch logic errors in seconds in CI.

## Code snippet
```python
import pandas as pd
import pytest
from pipeline.transform import normalise_country

@pytest.mark.parametrize("raw, expected", [(" de", "DE"), ("Deu", "DE"), (None, None)])
def test_normalise_country(raw, expected):
    assert normalise_country(raw) == expected

def test_dedupe_keeps_latest():
    df = pd.DataFrame({"id": [1, 1], "ts": ["2025-01-01", "2025-02-01"], "v": ["a", "b"]})
    out = dedupe_latest(df)
    pd.testing.assert_frame_equal(out.reset_index(drop=True),
                                  pd.DataFrame({"id": [1], "ts": ["2025-02-01"], "v": ["b"]}))
```

## Limits and misconceptions
- Tests that need production databases are slow and fragile; isolate logic from I/O.
- 100 percent coverage is not the goal; test the logic that would hurt if wrong.
- Data quality checks on real data are a separate, complementary practice.

## Remember this
Write plain-assert pytest tests for transformation functions and edge cases, with fixtures for setup and mocks for external systems.

## Related
pyspark-m12-testing-pytest, ml-m06-testing-reproducibility, python-m02-project-layout


# Git for data work
id: python-m08-git
track: python

## What we're learning
**Git** tracks changes to files as **commits**, on **branches**, in a **repository** that is shared through a remote (GitHub, Azure DevOps, GitLab). The everyday workflow:

1. Create a branch for a change (`git switch -c feature/orders-cdc`).
2. Commit small, meaningful changes with clear messages.
3. Push and open a **pull request**; colleagues review; CI runs tests.
4. Merge to the main branch; deployment follows.

Data-specific practices:
- Commit code, SQL, configuration templates, pipeline definitions, notebooks (with outputs cleared, or as `.py` files).
- **Never commit** secrets, credentials, data extracts, large files or personal data; use `.gitignore` and secret scanning.
- Platforms integrate with Git: Fabric Git integration, Databricks Git folders, dbt projects, Snowflake Git repositories.

## Benefit
History, review and rollback for everything that defines the data platform, plus the foundation for CI/CD.

## Code snippet
```bash
git switch -c feature/orders-incremental
```
```bash
git add src/pipeline/orders.py tests/test_orders.py
```
```bash
git commit -m "Load orders incrementally using ModifiedAt watermark"
```

## Limits and misconceptions
- Notebook JSON diffs are noisy; tools such as `nbstripout` or Jupytext help.
- A secret committed once stays in history; rotate it immediately and clean history if needed.
- Large binary data belongs in storage, not Git (Git LFS exists but is rarely right for datasets).

## Remember this
Branch, commit small, review through pull requests, and never commit secrets or data.

## Related
fabric-m09-git-integration, tools-m09-cicd, databricks-m03-notebooks


# Docker basics for Python
id: python-m08-docker-basics
track: python

## What we're learning
A **Dockerfile** describes how to build an image for a Python application:

1. Start from a slim Python base image with a pinned version.
2. Copy the dependency files and install them (a separate layer, so it is cached when only code changes).
3. Copy the source code.
4. Run as a non-root user and set the command.

The resulting image runs identically on a laptop, in CI and in production (Kubernetes, Azure Container Apps, AWS ECS, Airflow tasks, scheduled jobs).

## Benefit
Python dependency problems ("wrong version of pyarrow on the server") disappear because the environment ships with the code.

## Code snippet
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN pip install --no-cache-dir uv && uv sync --frozen --no-dev
COPY src/ ./src/
RUN useradd --create-home appuser
USER appuser
CMD ["uv", "run", "python", "-m", "pipeline.jobs.load_orders"]
```

## Limits and misconceptions
- Images must be rebuilt and redeployed to get security patches.
- Do not bake secrets into images; inject them at runtime.
- Managed platforms (Fabric, Databricks, Snowflake) mostly do not need your Docker images; containers matter for custom services and orchestrated jobs.

## Remember this
A layered Dockerfile installs pinned dependencies, copies code and runs as non-root, so the tested environment is what runs.

## Related
tools-m09-docker, python-m02-uv-poetry-lockfiles, tools-m09-kubernetes


# Notebooks vs scripts
id: python-m08-notebooks-vs-scripts
track: python

## What we're learning
**Notebooks** (Jupyter, VS Code, Databricks, Fabric, Snowflake) mix code, output, charts and text in cells. **Scripts and modules** are plain `.py` files run top to bottom and imported by other code.

Notebooks are excellent for exploration, EDA, prototyping, teaching and documenting an analysis. They are weak for production: hidden state from cells run out of order, hard diffs and code review, difficult unit testing, and copy-pasted logic between notebooks.

A pragmatic split used by many teams:
- Explore and prototype in notebooks.
- Move reusable logic into **modules** in a package, with tests.
- Keep production notebooks **thin**: parameters, a few calls into the package, and output checks. Or replace them with scripts and job definitions.

## Benefit
The split keeps the speed of notebooks for discovery without inheriting their weaknesses in production.

## Limits and misconceptions
- "Never use notebooks in production" is too strict: managed platforms schedule notebooks well, and thin, reviewed notebooks are fine.
- Restart and run all before trusting notebook results.
- Tools such as Jupytext (pair notebooks with `.py` files) improve versioning.

## Remember this
Explore in notebooks, move logic into tested modules, and keep any production notebook thin.

## Related
databricks-m03-notebooks, fabric-m04-notebooks, pyspark-m12-packaging-config, python-m08-git
