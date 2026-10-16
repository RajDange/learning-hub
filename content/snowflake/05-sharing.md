# Secure data sharing
id: snowflake-m05-secure-data-sharing
track: snowflake
verified: 2026-10

## What we're learning
**Secure data sharing** lets a provider account give other Snowflake accounts read access to live tables, secure views and other objects **without copying data**. The provider creates a **share** and grants objects to it; consumers create a read-only database from the share and query it with their own warehouses (so the consumer pays for compute). Changes by the provider are visible immediately.

- **Direct shares** work between accounts in the **same region**.
- **Listings** (private or public on the Marketplace) package shares with descriptions and terms; **cross-cloud auto-fulfillment** replicates data automatically to consumers in other regions or clouds.
- **Reader accounts** let a provider share with organisations that do not have Snowflake; the provider pays their compute.

## Benefit
Subsidiaries, partners and customers get current data with no extract files, no pipelines, and full provider control to revoke access at any time.

## Compared with
| | Snowflake sharing | Delta Sharing / OpenSharing |
|---|---|---|
| Consumers | Snowflake accounts (and reader accounts) | Databricks and any protocol client |
| Copying | None in-region; auto-fulfillment replicates cross-region | None; reads from provider storage |
| Compute paid by | Consumer (provider for reader accounts) | Consumer |

## Limits and misconceptions
- Cross-region sharing involves replication cost and some delay.
- Share secure views rather than raw tables when consumers should see only some rows or columns.
- Shared data is read-only for consumers.

## Remember this
Snowflake shares live data between accounts without copies; consumers query it with their own compute.

## Related
databricks-m02-delta-sharing, snowflake-m05-marketplace, snowflake-m06-row-access-policies


# Snowflake Marketplace
id: snowflake-m05-marketplace
track: snowflake
verified: 2026-10

## What we're learning
The **Snowflake Marketplace** is a catalogue of **listings** from data providers (market data, weather, demographics, reference data, enrichment services) and of **Snowflake Native Apps**, applications that run inside the consumer's account on their data. Listings can be free, paid or by request, and are delivered as shares (with cross-cloud auto-fulfillment). **Organizational listings** offer the same experience privately inside a company, and newer options support sharing semantic views and listing restrictions.

## Benefit
Third-party data arrives as queryable tables in minutes, always up to date, instead of through file downloads and custom loaders.

## Limits and misconceptions
- Licence terms and data quality are the provider's; review both.
- Paid listings and app usage add cost beyond your own compute.
- Native Apps run in your account with permissions you grant; review what they can access.

## Remember this
The Marketplace delivers third-party data and native apps as live shares and in-account applications.

## Related
snowflake-m05-secure-data-sharing, snowflake-m05-clean-rooms


# Data clean rooms
id: snowflake-m05-clean-rooms
track: snowflake
verified: 2026-10

## What we're learning
A **data clean room** lets two or more organisations analyse their combined data **without either seeing the other's raw records**. Typical example: an advertiser and a publisher measure overlap and campaign results on shared customers, matched on hashed identifiers, with only aggregated results returned.

**Snowflake Data Clean Rooms** is a managed product built on secure data sharing, Native Apps and governance policies (for example aggregation policies that enforce minimum group sizes and projection policies that prevent columns being output). Providers define which analyses (templates) are allowed. A newer collaboration architecture for symmetric multi-party clean rooms appeared in 2026 (its status was reported differently across sources; verify).

## Benefit
Privacy-preserving collaboration with partners becomes possible without legal and technical risk of exchanging raw personal data.

## Limits and misconceptions
- A clean room reduces but does not remove re-identification risk; careful analysis templates and thresholds are essential.
- All parties typically need Snowflake accounts (with some exceptions); cross-cloud setups need replication.
- It is a legal and governance project as much as a technical one.

## Remember this
A clean room allows joint analysis on combined data while each party's raw records stay hidden, enforced by templates and policies.

## Related
snowflake-m05-secure-data-sharing, ai-m08-privacy, snowflake-m06-masking-policies
