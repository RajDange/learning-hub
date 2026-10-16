# Unity Catalog: metastore, catalogs and schemas
id: databricks-m02-unity-catalog-overview
track: databricks
verified: 2026-10

## What we're learning
**Unity Catalog (UC)** is Databricks' governance layer. Its hierarchy:

1. **Metastore**: the top container, one per region, attached to workspaces.
2. **Catalog**: the first level of the namespace, often per environment (dev, prod) or business domain.
3. **Schema**: a group of objects inside a catalog.
4. **Objects**: tables, views, materialized views, **volumes** (files), functions, registered models, feature tables and secrets.

Names are three-level: `catalog.schema.table`. Other securables govern access to the outside world: storage credentials, external locations, service credentials, connections (for federation), and sharing objects (shares, recipients, providers).

**Managed tables** (the default and recommended) are stored in UC-managed storage and get automatic maintenance; **external tables** point at paths you manage. Tables can be Delta or Iceberg.

## Benefit
One place for permissions, lineage, auditing, discovery and sharing across all workspaces in a region, for tables, files, models and AI assets alike.

## Limits and misconceptions
- UC replaces the legacy per-workspace Hive metastore; existing tables need migration (or Hive metastore federation as an interim step).
- Dropping a managed table deletes its data after a short recovery window (UNDROP).
- Path-based access to managed storage bypasses governance; never give users direct bucket access.

## Remember this
Unity Catalog governs everything through metastore, catalog, schema and object, addressed as catalog.schema.table.

## Related
pyspark-m05-catalog-tables, tools-m06-unity-catalog, databricks-m02-privileges, databricks-m08-governance-patterns


# Privileges and ownership
id: databricks-m02-privileges
track: databricks
verified: 2026-10

## What we're learning
Access in Unity Catalog is granted with SQL `GRANT` on securables to users, groups and service principals:

- Reading a table needs **USE CATALOG** on its catalog, **USE SCHEMA** on its schema and **SELECT** on the table. Writing needs **MODIFY**.
- Grants on a catalog or schema **inherit** to everything inside, now and in future.
- Every object has an **owner** who can grant on it. **MANAGE** lets non-owners manage permissions; **BROWSE** lets people see metadata without reading data.

Finer-grained controls:
- **Row filters** and **column masks**: SQL functions attached to a table that filter rows or mask values per user or group.
- **Attribute-based access control (ABAC)** (GA in 2026): **governed tags** on data (for example `pii=email`) plus policies at catalog, schema or table level that apply row filters, column masks or grants wherever the tag appears.

## Benefit
Group-based grants with inheritance, plus tag-based policies, scale to thousands of tables without per-table rules, and work the same from SQL, Python and BI.

## Limits and misconceptions
- `ALL PRIVILEGES` does not include MANAGE or some newer privileges.
- Row filters and masks cannot be used on views directly and do not travel through data sharing; some compute types need recent runtimes to enforce them.
- Grant to groups, not individuals; individual grants become unmanageable.

## Remember this
Reading needs USE CATALOG, USE SCHEMA and SELECT; grants inherit downward, and ABAC policies on governed tags scale row and column protection.

## Related
pyspark-m11-masking-security-auditing, snowflake-m06-rbac, fabric-m08-onelake-security, databricks-m08-governance-patterns


# Lineage in Unity Catalog
id: databricks-m02-lineage
track: databricks
verified: 2026-10

## What we're learning
Unity Catalog captures **lineage automatically** for queries run on UC-enabled compute: **table-level and column-level**, across all workspaces attached to the metastore, for notebooks, jobs, pipelines, dashboards and models. It appears in Catalog Explorer as a graph and in the `system.access.table_lineage` and `system.access.column_lineage` system tables (kept for a year). **External lineage** lets you add sources and targets outside Databricks.

## Benefit
Impact analysis ("who uses this column?"), root-cause analysis and compliance questions are answered from the platform without extra tooling or code instrumentation.

## Limits and misconceptions
- Lineage is captured only for operations UC observes; RDD-level code, some path-based reads and global temporary views are not tracked.
- Renaming objects breaks the lineage history of the old name.
- Lineage outside Databricks (source systems, Power BI reports) needs external lineage or a cross-platform catalog.

## Remember this
Unity Catalog records table and column lineage automatically for governed queries, visible in Catalog Explorer and system tables.

## Related
tools-m06-lineage, pyspark-m11-data-lineage, fabric-m08-lineage-impact, databricks-m02-system-tables


# Volumes
id: databricks-m02-volumes
track: databricks
verified: 2026-10

## What we're learning
A **volume** is a Unity Catalog object that governs **non-tabular files**: CSV drops, JSON, images, PDFs, model artefacts, libraries. Files are addressed with paths like `/Volumes/catalog/schema/volume/folder/file.csv` and protected with `READ VOLUME` and `WRITE VOLUME` privileges.

- **Managed volumes** store files in UC-managed storage; dropping the volume deletes the files after a retention period.
- **External volumes** point at an existing cloud storage path; dropping the volume leaves the files.

## Benefit
Volumes replace ungoverned DBFS paths and mounts, so landing zones, unstructured data for AI, and libraries are under the same permissions, audit and lineage as tables.

## Limits and misconceptions
- Files in a volume are not tables; you still read and write them with Spark, Auto Loader or pipelines to create tables.
- Legacy DBFS mounts and paths should be migrated; they bypass UC governance.

## Remember this
Volumes bring governed paths and permissions to files that are not tables.

## Related
databricks-m02-external-locations, databricks-m03-auto-loader, ai-m09-unstructured-pipelines


# Storage credentials and external locations
id: databricks-m02-external-locations
track: databricks
verified: 2026-10

## What we're learning
Unity Catalog controls how Databricks reaches cloud storage with two objects:

- A **storage credential** wraps a cloud identity (an Azure managed identity or service principal, an AWS IAM role, a GCP service account) that can access storage.
- An **external location** combines a storage path with a credential. Privileges on it (`READ FILES`, `WRITE FILES`, `CREATE EXTERNAL TABLE`, `CREATE MANAGED STORAGE`) decide who can use that path.

**Managed storage** locations can be set at metastore, catalog or schema level, so, for example, each catalog's managed tables live in its own storage account. External tables and external volumes must sit inside external locations.

## Benefit
Users never handle storage keys; access to storage paths is granted and audited in UC like access to tables, and data for different domains can be separated physically.

## Limits and misconceptions
- Giving users or other tools direct access to managed storage paths bypasses UC; restrict storage firewall and identity access to Databricks.
- Overlapping external locations cause confusing permission behaviour; keep paths distinct.

## Remember this
Storage credentials hold the cloud identity, external locations bind it to paths, and UC privileges decide who may use them.

## Related
tools-m03-object-storage, databricks-m02-volumes, databricks-m02-unity-catalog-overview, tools-m09-secrets-identity


# System tables
id: databricks-m02-system-tables
track: databricks
verified: 2026-10

## What we're learning
**System tables** are read-only tables in the `system` catalog that expose operational data about your account as data you can query:

- `system.access.audit`: who did what (logins, queries, permission changes).
- `system.access.table_lineage` and `column_lineage`: lineage events.
- `system.billing.usage` and `system.billing.list_prices`: DBU consumption by workspace, SKU, job, warehouse and tags, and list prices.
- `system.compute.*`: clusters, node usage, SQL warehouses.
- `system.lakeflow.*`: jobs, job runs and pipelines.
- `system.query.history`: SQL query history.
- Others for predictive optimization, model serving, data quality monitoring and AI gateway usage.

Most are retained free for a year. Access needs `USE CATALOG`, `USE SCHEMA` and `SELECT` like any table.

## Benefit
Cost dashboards, chargeback, security monitoring, job reliability reports and governance audits become SQL queries and dashboards instead of log exports.

## Limits and misconceptions
- Billing data can lag by several hours.
- Some system tables are in preview; schemas can change.
- Access to audit and billing tables is sensitive; grant it only to admins and FinOps groups.

## Remember this
System tables expose audit, lineage, billing, compute and job history as queryable tables.

## Related
databricks-m07-dbu-cost-model, databricks-m07-monitoring, fabric-m08-auditing-monitoring


# Delta Sharing (OpenSharing)
id: databricks-m02-delta-sharing
track: databricks
verified: 2026-10

## What we're learning
**Delta Sharing** is an open protocol, created by Databricks, for sharing live data without copying it. In 2026 Databricks renamed the feature **OpenSharing**; much documentation and the open protocol still use the Delta Sharing name. A provider creates a **share** (tables, views, volumes, models, notebooks) and grants it to a **recipient**:

- **Databricks-to-Databricks**: between Unity Catalog metastores, without tokens; supports the widest range of assets.
- **Databricks-to-open**: to any client that speaks the protocol (Spark, pandas, Power BI, Tableau and others) using a bearer token or OIDC federation.

Shares are read-only. The protocol also underpins Databricks Marketplace and Clean Rooms.

## Benefit
Partners, subsidiaries or other platforms read the current data directly from your storage, under your governance and audit, instead of receiving nightly extracts.

## Limits and misconceptions
- Recipients read through the protocol, so data egress costs may apply across clouds or regions.
- Row filters and column masks do not travel through shares; share views or filtered tables instead.
- Open recipients with tokens need token rotation and careful handling.

## Remember this
Delta Sharing (now OpenSharing) shares live, read-only data across organisations and platforms without copying it.

## Related
snowflake-m05-secure-data-sharing, databricks-m02-privileges, tools-m03-format-interoperability
