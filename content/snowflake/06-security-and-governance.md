# Role-based access control
id: snowflake-m06-rbac
track: snowflake
verified: 2026-10

## What we're learning
Snowflake combines **role-based access control** (privileges are granted to **roles**, and roles to users) with **discretionary access control** (every object has an **owner role** that can grant on it). Roles can be granted to other roles, forming a **hierarchy**; a role inherits all privileges of roles granted to it.

System roles:
- **ORGADMIN**: organisation-level management of accounts.
- **ACCOUNTADMIN**: top role in an account; use sparingly.
- **SECURITYADMIN**: manages grants and can manage users and roles.
- **USERADMIN**: creates users and roles.
- **SYSADMIN**: creates warehouses and databases; custom roles should roll up to it.
- **PUBLIC**: granted to everyone.

Useful features: **database roles** (roles scoped to a database, good for sharing and data products), **future grants** (privileges automatically granted on objects created later in a schema), **managed access schemas** (only the schema owner can grant, not each object owner), and **secondary roles** (a session can use privileges from several roles).

## Benefit
A designed role hierarchy (access roles per database or schema, functional roles per team) scales permissions across thousands of objects and keeps audits understandable.

## Limits and misconceptions
- Object owners can grant freely unless you use managed access schemas; ownership sprawl is a common governance problem.
- Overuse of ACCOUNTADMIN is a security risk; require MFA and restrict it.
- RBAC controls object access; row and column restrictions need row access and masking policies.

## Remember this
Snowflake grants privileges to roles in a hierarchy, with owners able to grant; use functional and access roles, future grants and managed access schemas.

## Related
databricks-m02-privileges, fabric-m08-workspace-roles, snowflake-m06-masking-policies


# Dynamic data masking
id: snowflake-m06-masking-policies
track: snowflake
verified: 2026-10

## What we're learning
A **masking policy** (Enterprise Edition) is a schema-level object containing a SQL expression that decides, at query time, what a user sees in a column. For example, return the real email to the `HR` role and `'*****'` to everyone else. The policy is attached to columns; the data itself is not changed. Variants:

- **Conditional masking**: the result depends on other columns (for example unmask only rows where `consent = true`).
- **Tag-based masking**: attach a policy to a **tag**; every column carrying that tag is masked automatically, including new columns later tagged.
- Related **aggregation** and **projection policies** restrict whether data can be aggregated below a minimum group size or selected at all.

## Benefit
One policy protects a type of data everywhere it appears, for every tool and query, which is far more reliable than creating masked views per audience.

## Limits and misconceptions
- Masking is evaluated at query time; complex policy expressions add query cost.
- Policies follow the column into shares and clones; plan what consumers should see.
- Masking does not stop inference from aggregates or joins; combine with row access policies and aggregation policies for sensitive data.

## Remember this
Masking policies decide per role at query time what a column shows, and tag-based masking applies them automatically wherever a tag appears.

## Related
fabric-m08-sql-granular-security, databricks-m02-privileges, snowflake-m06-tags-classification, pyspark-m11-masking-security-auditing


# Row access policies
id: snowflake-m06-row-access-policies
track: snowflake
verified: 2026-10

## What we're learning
A **row access policy** (Enterprise Edition) is an object with a boolean SQL expression evaluated for each row, using the current role or user. Rows where it returns false are invisible to the query. Policies are attached to tables or views. A common design uses a **mapping table** (`role, region`) so the policy checks whether the current role may see the row's region, making access changes a matter of updating the mapping table.

## Benefit
Multi-tenant or regional data (each country team sees only its customers) lives in one table with one policy, instead of many filtered copies or views.

## Limits and misconceptions
- Poorly written policies (subqueries on large mapping tables) slow every query; keep mapping tables small and the logic simple.
- A table can have only one row access policy; combine logic in it.
- Owners and admins are not automatically exempt unless the policy says so; test with real roles.

## Remember this
Row access policies filter rows per role at query time, often via a small mapping table, so one table serves many audiences.

## Related
fabric-m08-sql-granular-security, snowflake-m06-masking-policies, databricks-m02-privileges


# Object tags and data classification
id: snowflake-m06-tags-classification
track: snowflake
verified: 2026-10

## What we're learning
**Object tags** are key-value labels (for example `pii = 'email'`, `cost_center = 'finance'`) attached to accounts, warehouses, databases, schemas, tables and columns. Tags inherit down the hierarchy and can be queried in account usage views, which makes them the backbone of governance reporting and cost allocation. Masking policies can be attached to tags.

**Sensitive data classification** analyses column contents and suggests or applies **system tags** for semantic categories (email, name, national ID, phone, medical terms and others) and privacy categories (identifier, quasi-identifier, sensitive). It can run automatically on schemas, and was extended in 2026 with additional classifiers and an AI-assisted mode (preview).

## Benefit
Classification finds personal data you did not know you had, tags record it, and tag-based policies protect it, which together form an automated privacy control loop.

## Limits and misconceptions
- Automatic classification produces false positives and misses; review results for important tables.
- Tags only help if consistent; publish a tag taxonomy.
- Snowflake tags and Microsoft Purview sensitivity labels are different systems; aligning them across platforms needs integration.

## Remember this
Tags label objects and columns, classification suggests sensitive-data tags automatically, and tag-based policies protect what is tagged.

## Related
fabric-m08-sensitivity-labels, snowflake-m06-masking-policies, snowflake-m06-horizon


# Network policies and private connectivity
id: snowflake-m06-network-policies
track: snowflake
verified: 2026-10

## What we're learning
Snowflake is reachable over the internet by default. Controls:

- **Network rules** describe network identifiers (IP ranges, private endpoint IDs, hosts).
- **Network policies** combine allowed and blocked rules and are applied to the account, to specific users (for example service users from a fixed IP range), or to integrations.
- **Private connectivity** (Business Critical Edition): AWS PrivateLink, Azure Private Link and Google Private Service Connect route traffic over the cloud provider's private network instead of the internet; public access can then be blocked.
- **Outbound** access from Snowflake (UDFs calling APIs) is controlled by external access integrations with egress network rules.

Authentication hardening completes the picture: Snowflake has been phasing out single-factor passwords, requiring **MFA** for human users and **key pairs, OAuth, programmatic access tokens or workload identity federation** for service users (rollout through 2026).

## Benefit
Network restrictions and strong authentication sharply reduce the risk of credential-stuffing attacks, which caused well-publicised Snowflake customer breaches in 2024.

## Limits and misconceptions
- Private connectivity requires Business Critical, which affects the cost of every credit.
- IP allow lists break when users or tools move networks; plan for service and BI tool IP ranges.
- Network policies do not replace MFA; credentials stolen from an allowed network still work without it.

## Remember this
Restrict Snowflake with network rules and policies, use private connectivity on Business Critical, and use MFA or key-based service authentication.

## Related
snowflake-m06-rbac, tools-m09-secrets-identity, snowflake-m01-editions


# Snowflake Horizon
id: snowflake-m06-horizon
track: snowflake
verified: 2026-10

## What we're learning
**Snowflake Horizon Catalog** is the name Snowflake uses for its built-in governance and discovery capabilities, grouped in one place:

- **Compliance and security**: access control, masking and row access policies, tags and classification, access history (which user read which columns), **Trust Center** (security posture checks, threat detections).
- **Privacy**: aggregation, projection and differential privacy features, clean rooms.
- **Discovery**: a catalog of internal objects and listings, lineage between objects, data quality monitoring with data metric functions.
- **Interoperability**: an **Iceberg REST catalog endpoint** (built on Apache Polaris) so external engines can discover and read Snowflake-managed Iceberg tables, with Snowflake policies enforced.

For new customers, Snowflake now points to Horizon Catalog rather than **Snowflake Open Catalog** (the managed Polaris service) for Iceberg catalog needs. New Horizon features, including a catalog explorer, were in preview in late 2026.

## Benefit
Governance features are part of the platform, not a separate product to integrate, and they now extend to Iceberg data used by other engines.

## Limits and misconceptions
- Horizon is a brand for a collection of features with different editions and statuses, not a single switch.
- Cross-platform governance (Snowflake plus Databricks plus Fabric) still needs an enterprise catalog or careful federation.

## Remember this
Horizon is Snowflake's built-in governance, discovery and Iceberg catalog layer, spanning policies, lineage, quality and security posture.

## Related
tools-m06-catalogs-explained, snowflake-m06-tags-classification, snowflake-m08-iceberg-interoperability
