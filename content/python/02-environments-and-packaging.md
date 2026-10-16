# Virtual environments and pip
id: python-m02-virtual-environments
track: python

## What we're learning
A **virtual environment** is an isolated folder with its own Python interpreter link and installed packages, so each project has its own dependency versions. Create it with `python -m venv .venv`, activate it, and install packages with `pip install`.

Why it matters: installing everything into the **global** Python mixes versions across projects, breaks system tools and makes "works on my machine" problems inevitable. Conda environments solve the same problem and also manage non-Python libraries (useful for some scientific and GPU stacks).

## Benefit
Isolation makes projects reproducible and lets different projects use different library versions side by side.

## Code snippet
```bash
python -m venv .venv
```
```bash
source .venv/bin/activate        # Windows: .venv\Scripts\activate
```
```bash
pip install pandas pyarrow
```

## Limits and misconceptions
- A venv is not portable between machines or operating systems; recreate it from a requirements or lock file.
- `pip freeze > requirements.txt` captures everything installed, including indirect dependencies, without distinguishing what you asked for; modern tools separate the two.
- Platforms (Databricks, Fabric) manage environments differently (cluster libraries, environments); local isolation still matters for development and tests.

## Remember this
One virtual environment per project keeps dependencies isolated and reproducible; never install project packages globally.

## Related
python-m02-uv-poetry-lockfiles, python-m02-project-layout, fabric-m04-spark-pools


# uv, Poetry and lock files
id: python-m02-uv-poetry-lockfiles
track: python

## What we're learning
Modern Python projects declare dependencies in **`pyproject.toml`** and pin exact resolved versions in a **lock file**:

- **Direct dependencies** (what you asked for, with version ranges) live in `pyproject.toml`.
- The **lock file** records every package, including transitive ones, at exact versions and hashes, so every install is identical.

Tools:
- **uv** (from Astral, written in Rust): very fast installer and project manager; creates environments, resolves and locks (`uv.lock`), runs commands (`uv run`), manages Python versions. Widely adopted by 2025-2026.
- **Poetry**: an established project and dependency manager with `poetry.lock`.
- **pip-tools**: compiles `requirements.in` to a pinned `requirements.txt`.
- Plain `requirements.txt` without pins: simple but not reproducible.

## Benefit
Lock files make builds reproducible across laptops, CI and production, and fast resolvers like uv make environment setup take seconds.

## Code snippet
```bash
uv init pipeline && cd pipeline
```
```bash
uv add pandas pyarrow "sqlalchemy>=2"
```
```bash
uv run pytest
```

## Limits and misconceptions
- Commit the lock file for applications and pipelines; libraries meant for others usually publish ranges, not locks.
- Lock files are platform-aware; check they resolve for the target platform (Linux in production, even if you develop on Windows).
- Platform runtimes preinstall many libraries; pin only what you need and check conflicts with the runtime's versions.

## Remember this
Declare dependencies in pyproject.toml and pin everything in a lock file; uv makes this fast.

## Related
python-m02-virtual-environments, python-m02-project-layout, ml-m06-testing-reproducibility


# Project layout and packaging
id: python-m02-project-layout
track: python

## What we're learning
A maintainable data project follows a standard layout:

```
pipeline/
  pyproject.toml          project metadata, dependencies, tool settings
  uv.lock                 pinned versions
  src/pipeline/           importable package code
    __init__.py
    extract.py  transform.py  load.py  config.py
  tests/                  pytest tests
  notebooks/              exploration only
  README.md
```

The **src layout** prevents accidentally importing code from the working directory instead of the installed package. Building the project produces a **wheel** (`.whl`), a standard installable package that can be deployed to Spark clusters, Fabric environments, Databricks bundles or containers.

## Benefit
Packaged code can be imported by notebooks, jobs and tests alike, versioned, and deployed as one artefact, instead of copying cells between notebooks.

## Limits and misconceptions
- A package needs a version number and a changelog to be useful in deployments.
- Keep configuration out of the package code (environment variables, config files), so one build runs in every environment.
- Over-engineering a tiny script into a package is unnecessary; packaging pays off once code is shared or deployed.

## Remember this
Use a src layout with pyproject.toml, tests beside it, and build a wheel that every environment installs.

## Related
pyspark-m12-packaging-config, python-m02-uv-poetry-lockfiles, python-m08-pytest
