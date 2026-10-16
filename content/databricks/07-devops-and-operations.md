# Databricks Asset Bundles
id: databricks-m07-asset-bundles
track: databricks
verified: 2026-10

## What we're learning
**Bundles** (introduced as Databricks Asset Bundles; renamed **Declarative Automation Bundles** in March 2026, with the `bundle` command and "DAB" abbreviation unchanged) define a Databricks project as code. A `databricks.yml` file declares resources (jobs, pipelines, dashboards, model serving endpoints, experiments, models and more), the code files they use, and **targets** (dev, test, prod) with per-target settings such as workspace, catalog names and run-as identity.

The Databricks CLI deploys them: `databricks bundle validate`, `deploy`, `run` and `destroy`. Development mode prefixes resources per user so developers do not collide; production mode enforces stricter settings.

## Benefit
A whole project (code plus the jobs and pipelines that run it) moves between environments through CI/CD, reviewed in Git, instead of being clicked together in each workspace.

## Limits and misconceptions
- Bundles manage project resources, not workspace infrastructure (workspaces, metastores, networking); use Terraform for that.
- Resources edited manually in the UI drift from the bundle definition and are overwritten on the next deploy.
- Secrets do not belong in bundle files; reference secret scopes or UC secrets.

## Remember this
Bundles declare a project's jobs, pipelines and other resources in YAML with per-environment targets, deployed by the CLI.

## Related
databricks-m07-cicd, databricks-m07-terraform, fabric-m09-apis-automation, tools-m09-cicd


# Terraform for Databricks
id: databricks-m07-terraform
track: databricks
verified: 2026-10

## What we're learning
The **Databricks Terraform provider** manages the platform layer as code: workspaces (together with cloud provider resources such as networks and storage), Unity Catalog metastores, catalogs, schemas, storage credentials, external locations, grants, groups and service principals, compute policies, SQL warehouses and more.

A common split: **Terraform for infrastructure and governance** (things that rarely change and need central control), **bundles for project resources** (jobs, pipelines, dashboards that change with code).

## Benefit
Workspaces and permissions are reproducible and reviewable; a new environment or domain is a pull request, and access changes are audited in Git history.

## Limits and misconceptions
- Managing the same object in both Terraform and bundles, or in Terraform and the UI, causes conflicts. Decide ownership per resource type.
- Terraform state contains sensitive information; store it securely with locking.
- Grants managed authoritatively by Terraform can remove grants made by hand.

## Remember this
Use the Databricks Terraform provider for workspaces, Unity Catalog objects and permissions; leave project jobs and pipelines to bundles.

## Related
tools-m09-terraform, databricks-m07-asset-bundles, databricks-m02-privileges


# CI/CD on Databricks
id: databricks-m07-cicd
track: databricks
verified: 2026-10

## What we're learning
Databricks' recommended CI/CD flow:

1. Developers work in Git folders or local IDEs on feature branches, deploying bundles to a **dev** target in their own namespace.
2. A pull request triggers CI: unit tests (pytest with local Spark or Databricks Connect), linting, `bundle validate`, and optionally integration tests in a test workspace.
3. Merging deploys the bundle to **test** and then **prod** targets, run as **service principals**, with approvals before production.
4. Authentication from CI uses **workload identity federation** (OAuth token federation) instead of stored tokens.

Environments are usually separate workspaces and catalogs (dev, test, prod) bound so that dev compute cannot write production data.

## Benefit
Repeatable, auditable releases of pipelines and jobs, with production changes made only by automation.

## Limits and misconceptions
- Tests with local Spark do not cover Unity Catalog permissions or platform behaviour; keep an integration stage.
- Data changes (schema migrations, backfills) need explicit, reviewed steps.
- Manual edits in production workspaces break the model; restrict who can edit jobs there.

## Remember this
Develop in your own bundle target, test in CI, and let service principals deploy bundles to test and prod with approvals.

## Related
pyspark-m12-cicd, databricks-m07-asset-bundles, tools-m09-cicd, tools-m09-secrets-identity


# Compute policies
id: databricks-m07-cluster-policies
track: databricks
verified: 2026-10

## What we're learning
**Compute policies** (formerly cluster policies) are rules that limit what classic compute users can create: allowed node types, maximum workers, required auto-termination, fixed runtime versions, mandatory tags for cost allocation, access mode, and whether Photon is used. Admins assign policies to groups; users then create clusters only within their policy. **Policy families** provide templates, and limits can cap how many clusters each user may run. Serverless compute is governed separately through usage policies and budgets.

## Benefit
Policies are the main guardrail against runaway classic compute costs and insecure configurations, while still letting teams self-serve.

## Limits and misconceptions
- Policies do not cover serverless; use serverless usage policies, budgets and tags there.
- Users with unrestricted cluster creation bypass policies; remove that entitlement for most users.
- Policy changes apply to existing clusters on restart (job clusters immediately).

## Remember this
Compute policies constrain classic cluster settings per group to control cost, tagging and security.

## Related
databricks-m07-dbu-cost-model, databricks-m01-compute-types


# Monitoring and observability
id: databricks-m07-monitoring
track: databricks
verified: 2026-10

## What we're learning
Databricks monitoring spans several tools:

- **Jobs and pipelines UI**: run history, task durations, failures, repair runs, pipeline event logs with data quality metrics.
- **Query history and query profiles** for SQL warehouses.
- **System tables**: jobs, runs, compute usage, billing and audit as queryable data for dashboards and alerts.
- **Data quality monitoring** (formerly Lakehouse Monitoring): data profiling of tables over time (statistics, drift) and anomaly detection on freshness and completeness, with results in tables and dashboards.
- **SQL alerts** and job notifications to email, Slack, Teams or webhooks.

## Benefit
Engineering health (did jobs run, how long, how much did they cost) and data health (is the data fresh and plausible) can be monitored on the platform, using the same SQL and dashboards as everything else.

## Limits and misconceptions
- Monitoring costs compute (data quality monitoring runs on serverless).
- System table data can lag by hours; not suitable for second-level alerting.
- Cross-platform observability (sources outside Databricks, downstream BI) needs external tools.

## Remember this
Monitor Databricks with job and pipeline UIs, system tables for usage and cost, and data quality monitoring for table health.

## Related
databricks-m02-system-tables, tools-m07-data-observability, pyspark-m12-logging-monitoring-debugging


# DBUs and the cost model
id: databricks-m07-dbu-cost-model
track: databricks
verified: 2026-10

## What we're learning
Databricks charges in **Databricks Units (DBUs)**, a unit of processing capacity per hour, billed per second. The DBU **rate depends on the product (SKU)**: jobs compute is cheaper than all-purpose compute, SQL warehouses and serverless have their own rates, and Photon on classic compute uses a different rate.

Two billing shapes:
- **Classic compute**: you pay Databricks for DBUs **and** your cloud provider separately for the virtual machines, disks and network.
- **Serverless**: the DBU rate **includes** the compute infrastructure (some networking and storage may still be billed separately).

Storage is paid to the cloud provider (or Databricks for default storage). Usage and list prices are queryable in `system.billing.usage` and `system.billing.list_prices`. **Budgets** (alerts and, from 2026, usage blocking) and **serverless usage policies** (formerly budget policies) tag and control spend. Exact rates vary by cloud, region, tier and contract; use the pricing calculator.

## Benefit
Understanding SKUs explains the cheapest ways to run each workload (jobs compute instead of interactive clusters, serverless for spiky work, auto-stop on warehouses).

## Limits and misconceptions
- Comparing DBU prices with Fabric capacity units or Snowflake credits is misleading without measuring the same workload.
- On classic compute, forgetting the cloud VM bill understates cost by a large margin.
- Tags on compute are essential for chargeback; enforce them with policies.

## Remember this
DBU rates depend on the compute product; classic adds a separate cloud bill while serverless includes infrastructure, and system tables show where spend goes.

## Related
fabric-m01-licensing-capacity, snowflake-m01-credits, databricks-m07-cluster-policies, databricks-m02-system-tables
