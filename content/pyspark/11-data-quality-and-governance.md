# Validation, profiling and expectations
id: pyspark-m11-validation-expectations
track: pyspark

## What we're learning
Data quality work in Spark has three layers:

- **Profiling**: understanding data before writing rules. `df.describe()` and `df.summary()` give counts, means and percentiles; null counts per column, distinct counts, min and max dates and value frequencies reveal problems.
- **Rule checks (expectations)**: explicit assertions such as "order_id is unique", "amount >= 0", "status in a known list", "row count within 10 percent of yesterday". Rules can **fail** the job, **drop** bad rows, or **quarantine** them to a side table.
- **Table constraints**: Delta supports `NOT NULL` and `CHECK` constraints that reject violating writes.

Frameworks package this: **Great Expectations**, **Soda**, **Deequ/PyDeequ** (Spark-native), Databricks pipeline expectations, and newer Spark-native libraries such as DQX (verify).

## Benefit
Catching bad data at the layer boundary (bronze to silver) is far cheaper than explaining wrong numbers in a board report.

## Code snippet
```python
checks = {
    "null_ids": orders.filter(F.col("order_id").isNull()).count(),
    "dup_ids": orders.groupBy("order_id").count().filter("count > 1").count(),
    "neg_amounts": orders.filter("amount < 0").count(),
}
bad = {k: v for k, v in checks.items() if v > 0}
if bad:
    raise ValueError(f"Quality checks failed: {bad}")

spark.sql("ALTER TABLE silver.orders ADD CONSTRAINT positive_amount CHECK (amount >= 0)")
```

## Limits and misconceptions
- Each check is a Spark action; dozens of separate counts mean dozens of scans. Compute many metrics in one aggregation.
- Quarantining without anyone reviewing the quarantine table just hides problems.
- Thresholds (row counts, distributions) need history to be meaningful; store check results over time.

## Remember this
Profile first, then encode rules that fail, drop or quarantine, and compute them in as few passes as possible.

## Related
tools-m07-great-expectations, tools-m07-deequ, databricks-m03-declarative-pipelines, tools-m07-data-contracts


# Reconciliation between source and target
id: pyspark-m11-reconciliation
track: pyspark

## What we're learning
**Reconciliation** proves that a target holds the same data as its source, which is essential during migrations and for regulated pipelines. Levels of evidence, from cheap to thorough:

1. **Row counts** per table and per partition (date, company).
2. **Aggregates**: sums of amounts, min and max dates, distinct key counts per partition.
3. **Hash totals**: a hash of each row's business columns, then a combined checksum per partition. If checksums differ, drill down.
4. **Row-level diff**: a full outer join on the key, or `exceptAll` in both directions, to list missing, extra and changed rows.

## Benefit
Numbers that match at several levels give users confidence to switch from the old system, and the drill-down approach finds exactly which rows differ.

## Code snippet
```python
cols = ["customer_id", "amount", "status", "order_date"]
def fingerprint(df):
    return df.withColumn("h", F.xxhash64(*[F.coalesce(F.col(c).cast("string"), F.lit("<null>")) for c in cols]))

src_fp = fingerprint(source).groupBy("order_date").agg(F.count("*").alias("n"), F.sum("h").alias("chk"))
tgt_fp = fingerprint(target).groupBy("order_date").agg(F.count("*").alias("n"), F.sum("h").alias("chk"))
mismatch = src_fp.join(tgt_fp, "order_date", "full_outer").filter(
    ~(src_fp.n.eqNullSafe(tgt_fp.n)) | ~(src_fp.chk.eqNullSafe(tgt_fp.chk)))
```

## Limits and misconceptions
- Normalise before hashing: trailing spaces, decimal scale, time zones and null versus empty string make identical data hash differently across systems.
- A sum of hashes can collide in theory; it is evidence, not proof. Row-level diffs are the proof for small partitions.
- Reconcile against a consistent snapshot of the source, or moving data will cause false alarms.

## Remember this
Reconcile in layers: counts, aggregates, partition checksums, then row diffs where checksums disagree, after normalising values.

## Related
sql-m12-reconciliation, pyspark-m13-backfill-cutover, pyspark-m03-union, fabric-m10-migrating-from-legacy


# Data lineage (not RDD lineage)
id: pyspark-m11-data-lineage
track: pyspark

## What we're learning
**Data lineage** records which datasets, jobs and columns produce which other datasets: "gold.revenue is built by job X from silver.orders and silver.fx_rates". It differs from **RDD lineage**, which is Spark's internal recipe for recomputing partitions inside one application.

How lineage is captured for Spark:
- **Catalog-native**: Databricks Unity Catalog records table and column lineage automatically for queries it governs; Fabric shows item-level lineage.
- **OpenLineage**: an open standard. The OpenLineage Spark listener emits lineage events (inputs, outputs, schema, column lineage) to a backend such as Marquez, DataHub, or vendor tools.
- **Parsing or manual registration** in catalogs such as Purview, Collibra or DataHub.

## Benefit
Lineage answers "what breaks if I change this?", "where did this number come from?" and "which reports use personal data?". It is central to impact analysis, debugging and regulatory reporting.

## Limits and misconceptions
- Automatic lineage covers what the tool can see. Data passed through Python objects, external APIs or `collect()` and back is often invisible.
- Table-level lineage is common; reliable column-level lineage is harder and tool-specific.
- Lineage from several tools rarely joins up end to end without a common standard such as OpenLineage.

## Remember this
Data lineage maps datasets and jobs across pipelines; RDD lineage only rebuilds partitions inside one Spark app.

## Related
tools-m06-lineage, pyspark-m01-dag-and-lineage, databricks-m02-lineage, fabric-m08-lineage-impact


# Masking, access control and auditing
id: pyspark-m11-masking-security-auditing
track: pyspark

## What we're learning
Open-source Spark has little built-in data security: whoever can read the files can read the data. Security for Spark data comes from the **platform and catalog**:

- **Access control**: catalog privileges on catalogs, schemas, tables and views (Unity Catalog, Fabric OneLake security, AWS Lake Formation, Apache Ranger on Hadoop).
- **Row filters and column masks**: defined once in the catalog and applied whenever governed compute reads the table, for example masking an email column for all but the HR group.
- **Pseudonymisation in pipelines**: hashing or tokenising identifiers during ingestion when downstream users should never see raw values.
- **Auditing**: platform audit logs record who queried or changed what (Unity Catalog system tables, Fabric audit log, cloud storage logs).

## Benefit
Governed access lets you open the lakehouse to many users while protecting personal and confidential data, and audit trails let you prove it.

## Limits and misconceptions
- Path-based access (reading storage directly with a key) bypasses catalog security. Lock down storage so only governed compute can reach it.
- A view that hides columns is only a control if users cannot query the base table.
- Hashing is not anonymisation: hashed emails can be reversed by hashing a list of known emails. Use salted hashes or tokenisation.
- Masking in one engine (SQL) does not protect another (Spark) unless the policy lives in a shared catalog.

## Remember this
Spark's data security lives in the catalog and platform: privileges, row filters, column masks and audit logs, with storage locked to governed compute.

## Related
databricks-m02-privileges, fabric-m08-onelake-security, snowflake-m06-masking-policies, ai-m08-privacy
