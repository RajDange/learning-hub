# Git integration
id: fabric-m09-git-integration
track: fabric
verified: 2026-10

## What we're learning
**Git integration** connects a Fabric workspace to a branch in a Git repository: **Azure DevOps**, **GitHub** or **GitHub Enterprise** (cloud versions only). Supported items are serialised as text files (notebook code, pipeline JSON, warehouse SQL project files, semantic model definitions and many more). You **commit** workspace changes to the branch and **update** the workspace from the branch. Only the workspace admin can connect a workspace.

Most core items are supported (lakehouse, notebook, Spark job definition, environment, pipeline, Copy job, Dataflow Gen2, warehouse, SQL database, Eventhouse, eventstream, Activator and others); Power BI items and a few others were still in preview in October 2026. Unsupported items are ignored, not deleted.

Microsoft recommends that each developer works in an **isolated workspace**: either a workspace branched from the main one ("branch out") or local tools such as VS Code and Power BI Desktop. Changes go back through pull requests.

## Benefit
Version history, code review, rollback and parallel development for Fabric content, the same way application code is managed.

## Limits and misconceptions
- Git stores **definitions, not data**. A lakehouse in Git is its metadata; its tables are not committed.
- One workspace maps to one branch and folder at a time.
- Connections, credentials and some settings are not in Git and must be set per environment.
- Merge conflicts in generated JSON can be painful; keep items small and changes focused.

## Remember this
Git integration versions Fabric item definitions per workspace branch; data and secrets stay out of Git.

## Related
fabric-m09-deployment-pipelines, tools-m09-cicd, python-m08-git, fabric-m09-apis-automation


# Deployment pipelines
id: fabric-m09-deployment-pipelines
track: fabric
verified: 2026-10

## What we're learning
A **deployment pipeline** promotes content between workspaces that represent stages, such as Development, Test and Production. A pipeline has between 2 and 10 stages (3 by default), each assigned to one workspace. You compare stages and deploy selected items forward (or backward) to the adjacent stage.

What moves is **metadata**. Data, permissions, role assignments, refresh schedules, credentials and endorsement are not copied. Items are matched between stages by **pairing**, not by name.

To make content work in each stage, you use:
- **Deployment rules**: per-stage values for data sources, parameters and a notebook's default lakehouse.
- **Autobinding**: references between items (a report to its semantic model) are re-pointed to the paired items in the target stage. Direct Lake models do not autobind; use rules.

## Benefit
A controlled path to production with a visual comparison of what changed, suitable for teams that prefer a UI over writing release scripts. It works well combined with Git: Git for the development stage, pipelines to promote.

## Limits and misconceptions
- Number and names of stages are fixed once created.
- Deploying requires pipeline admin rights plus Contributor on both workspaces.
- From 1 December 2026, deploying into workspaces that contain items under Purview protection policies requires access to all items (a newly announced restriction).
- Pipelines are not a test framework: validation of data and reports must be added separately.

## Remember this
Deployment pipelines promote item definitions between stage workspaces, with rules and autobinding to point each stage at its own data.

## Related
fabric-m09-git-integration, fabric-m07-reports, fabric-m09-apis-automation, databricks-m07-cicd


# REST APIs and automation
id: fabric-m09-apis-automation
track: fabric
verified: 2026-10

## What we're learning
Everything you do in the Fabric portal can increasingly be automated:

- **Fabric REST APIs** cover workspaces, items and item definitions, Git operations, deployment pipelines, job scheduling, the catalog and admin tasks (domains, tenant settings, scanning). Each API page says whether **service principals** and **managed identities** are supported.
- **Fabric CLI** (`fab`, installed with pip as `ms-fabric-cli`) is GA: a command line to browse and manage Fabric like a file system and to deploy.
- **fabric-cicd** is an open-source Python library from Microsoft for deploying items from a Git folder to a workspace, with parameter replacement per environment.
- **Terraform provider for Microsoft Fabric** (GA since 2025) manages capacities, workspaces, role assignments and many items as infrastructure as code.

Microsoft documents several CI/CD patterns: Git branch per stage, a single main branch deployed with APIs or fabric-cicd, or deployment pipelines.

## Benefit
Automation makes environments repeatable: a new domain's workspaces, roles, Git connections and items can be created from code in minutes, and every change is reviewed.

## Limits and misconceptions
- Service principal access is controlled by two tenant settings; without them, API calls by automation fail.
- Not every item type supports every API or identity; check before designing a pipeline.
- Whether Microsoft formally supports fabric-cicd as a product was not stated in the sources checked (October 2026).

## Remember this
REST APIs, the Fabric CLI, fabric-cicd and Terraform let you create and deploy Fabric content from code with service principals.

## Related
fabric-m09-git-integration, databricks-m07-asset-bundles, tools-m09-terraform, tools-m09-secrets-identity
