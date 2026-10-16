# Docker and containers
id: tools-m09-docker
track: tools
verified: 2026-10

## What we're learning
A **container** packages an application with its dependencies (Python version, libraries, system packages, configuration) so it runs the same everywhere. A **Dockerfile** describes how to build an **image**; an image is stored in a **registry** (Docker Hub, Azure Container Registry, Amazon ECR, GitHub Container Registry); a **container** is a running instance of an image. Containers share the host's operating system kernel, so they are much lighter than virtual machines.

In data work containers run orchestrators (Airflow), custom ingestion jobs, APIs and model servers, dbt runs in CI, Spark on Kubernetes, and reproducible development environments.

## Benefit
"It works on my machine" stops being a problem: the image that passed tests is the exact artefact that runs in production.

## Limits and misconceptions
- Containers are not a security boundary as strong as virtual machines; images need patching and vulnerability scanning.
- Images bloated with unnecessary tools are slow to pull and harder to secure; use slim base images and multi-stage builds.
- Managed data platforms (Fabric, Snowflake, much of Databricks) hide containers; you mostly meet them in custom services and CI.
- Docker Desktop requires a paid subscription for larger companies; alternatives exist.

## Remember this
A container image packages code with its dependencies so the tested artefact is exactly what runs.

## Related
python-m08-docker-basics, tools-m09-kubernetes, tools-m10-model-serving


# Kubernetes
id: tools-m09-kubernetes
track: tools
verified: 2026-10

## What we're learning
**Kubernetes** orchestrates containers across a cluster of machines. You declare the desired state (run 3 replicas of this image with these resources), and Kubernetes schedules **pods**, restarts failed ones, scales them, and connects them with **services**. Configuration and secrets are injected as objects; **operators** extend Kubernetes to manage complex software (databases, Kafka, Spark applications). Managed versions: Azure Kubernetes Service, Amazon EKS, Google GKE. About three minor releases ship per year (1.37 in late 2026).

For data, Kubernetes runs Spark (natively as a cluster manager, or through the Apache Spark Kubernetes Operator or the Kubeflow Spark Operator), Airflow with the Kubernetes executor, Kafka through operators such as Strimzi, Trino, and model serving (KServe).

## Benefit
One platform to run many data services with consistent deployment, scaling and isolation, portable across clouds and on-premises.

## Limits and misconceptions
- Kubernetes is complex: networking, storage, security, upgrades and cost control are a discipline in themselves. Without a platform team, managed SaaS services are usually cheaper overall.
- Stateful workloads (databases, Kafka, shuffle-heavy Spark) need extra care with persistent storage.
- Each minor version is supported for about 14 months, so clusters must be upgraded regularly.

## Remember this
Kubernetes runs and scales containers declaratively across a cluster; powerful for data services, but it needs a team to operate.

## Related
pyspark-m10-cluster-managers, tools-m09-docker, tools-m10-model-serving


# Terraform and infrastructure as code
id: tools-m09-terraform
track: tools
verified: 2026-10

## What we're learning
**Infrastructure as code (IaC)** describes cloud resources (storage accounts, networks, Databricks workspaces, Fabric capacities, Snowflake warehouses, permissions) in files kept in Git, and tools create or update the real resources to match.

**Terraform** (HashiCorp, owned by IBM since 2025) is the most widely used IaC tool across clouds. You write HCL files; `terraform plan` shows the changes needed; `terraform apply` makes them. Terraform keeps a **state** file recording what it manages, which must be stored securely and shared (remote state with locking). **Providers** exist for Azure, AWS, GCP, Databricks, Snowflake, Microsoft Fabric and hundreds more.

In 2023 Terraform moved to the Business Source License; **OpenTofu** is an open-source fork under the Linux Foundation. **Bicep** is Azure's own declarative language (Azure only, no state file).

## Benefit
Environments become reproducible and reviewable: a new workspace with its storage, networking and permissions is a pull request, and drift between dev and prod is visible.

## Limits and misconceptions
- State is sensitive and fragile; corrupt or lost state causes painful recovery, and it may contain secrets.
- Not everything belongs in Terraform: data, notebooks and jobs are usually better managed by platform tools (Databricks bundles, Fabric Git, dbt).
- Manual changes in the portal cause drift; agree that IaC-managed resources are changed only through code.

## Remember this
Terraform declares infrastructure in code, plans changes against stored state and applies them; keep state safe and avoid manual drift.

## Related
databricks-m07-terraform, fabric-m09-apis-automation, tools-m09-cicd


# CI/CD for data platforms
id: tools-m09-cicd
track: tools
verified: 2026-10

## What we're learning
**CI/CD** automates checking and deploying changes. The two common tools in data teams:

- **GitHub Actions**: YAML workflows in `.github/workflows`, triggered by pushes, pull requests or schedules, with environments that can require approvals.
- **Azure DevOps Pipelines**: YAML multi-stage pipelines with service connections, variable groups (often linked to Key Vault) and approvals.

Typical data pipeline stages:
1. **On pull request**: lint SQL and Python, run unit tests (pytest with local Spark), compile dbt and run its tests against a dev schema, validate data contracts and bundle or item definitions.
2. **On merge**: deploy to a test environment with the platform's tooling (Databricks Asset Bundles, Fabric deployment APIs or fabric-cicd, dbt jobs, Terraform), then run integration tests.
3. **With approval**: promote the same artefact to production.

## Benefit
Every change is tested and deployed the same way, with an audit trail, which removes manual copying between environments and the errors it causes.

## Limits and misconceptions
- CI proves code, not data: schema migrations, backfills and data quality need their own steps.
- Long-lived secrets in CI are a major risk; use workload identity federation (OIDC) instead.
- Data platforms each have their own deployment model; a CI/CD design must respect them rather than copy application patterns blindly.

## Remember this
CI tests every change and CD promotes the same artefact through environments with approvals, using each platform's deployment tooling.

## Related
pyspark-m12-cicd, fabric-m09-git-integration, databricks-m07-cicd, tools-m09-secrets-identity


# Secrets and identity
id: tools-m09-secrets-identity
track: tools
verified: 2026-10

## What we're learning
Pipelines need to authenticate to databases, storage and APIs. Good practice, from best to worst:

1. **No stored secret at all**: **managed identities** (Azure) or **IAM roles** (AWS) and service accounts (GCP) let compute authenticate as itself. **Workload identity federation** lets external systems such as GitHub Actions exchange a short-lived OIDC token for cloud access, with no long-lived key.
2. **Secrets in a vault**: **Azure Key Vault**, **AWS Secrets Manager** (with rotation), Google Secret Manager, HashiCorp Vault, or platform secret scopes (Databricks secrets, Fabric connections). Code reads secrets at runtime; they never appear in Git or notebooks.
3. Never: passwords in code, config files, notebook cells or pipeline variables in plain text.

**Service principals** (Entra ID applications) are the non-human identities that run production jobs and deployments. Grant them least privilege, one per purpose.

## Benefit
Secret leaks are among the most common causes of data breaches. Identity-based access removes most secrets entirely and makes access auditable and revocable.

## Limits and misconceptions
- Some sources (older databases, SaaS APIs) only accept passwords or keys; vault them and rotate them.
- A shared "pipeline admin" service principal with broad rights turns one leak into a full compromise.
- Masking secrets in logs is not enough if code prints them; review code paths.

## Remember this
Prefer managed identities and federation over stored secrets; keep unavoidable secrets in a vault and grant least privilege.

## Related
tools-m09-cicd, fabric-m09-apis-automation, pyspark-m06-jdbc
