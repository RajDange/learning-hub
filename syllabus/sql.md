# Track: sql — SQL

> T-SQL and Oracle are the primary dialects, with Spark SQL and Snowflake callouts where they differ. No puzzle section.

## sql-m01 — Correctness
- sql-m01-null-logic | NULL and three-valued logic | UNKNOWN, NOT IN with NULLs, NULL in aggregates and joins, Oracle's empty string | code: yes | related: pyspark-m02-nulls
- sql-m01-logical-processing-order | Logical query processing order | FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY and why aliases fail in WHERE | code: yes | related: sql-m01-join-semantics
- sql-m01-join-semantics | Join semantics | Inner and outer joins, filters in ON versus WHERE, row multiplication | code: yes | related: pyspark-m03-joins
- sql-m01-set-operations | Set operations | UNION, UNION ALL, INTERSECT, EXCEPT and MINUS, and duplicate handling | code: yes | related: pyspark-m03-union

## sql-m02 — Joins deep dive
- sql-m02-semi-anti-joins | Semi joins and anti joins | EXISTS, NOT EXISTS, IN, and the NOT IN trap | code: yes | related: sql-m01-null-logic
- sql-m02-apply-lateral | APPLY and LATERAL | CROSS APPLY, OUTER APPLY, LATERAL joins and correlated row-producing subqueries | code: yes | related: sql-m05-top-n-per-group
- sql-m02-non-equi-self-joins | Non-equi joins and self joins | Range joins, overlapping intervals, comparing rows within one table | code: yes | related: sql-m03-lag-lead-running-totals

## sql-m03 — Window functions
- sql-m03-window-frames | Window frames: ROWS vs RANGE | PARTITION BY, ORDER BY and frame clauses, the default frame trap | code: yes | related: pyspark-m03-window-functions
- sql-m03-ranking | Ranking functions | ROW_NUMBER, RANK, DENSE_RANK, NTILE and tie handling | code: yes | related: sql-m05-top-n-per-group
- sql-m03-lag-lead-running-totals | LAG, LEAD and running totals | Comparing to previous rows, cumulative sums and moving averages | code: yes | related: sql-m03-window-frames
- sql-m03-gaps-and-islands | Gaps and islands | Finding consecutive runs and missing ranges | code: yes | related: sql-m03-ranking
- sql-m03-sessionization | Sessionization | Grouping events into sessions by inactivity gaps | code: yes | related: sql-m03-gaps-and-islands, sql-m11-funnels

## sql-m04 — CTEs and recursion
- sql-m04-ctes | Common table expressions | Readable stepwise queries, scope, and performance myths | code: yes | related: pyspark-m05-sql-on-dataframes
- sql-m04-recursive-hierarchies | Recursive CTEs and hierarchies | Org charts and parent-child trees; Oracle CONNECT BY | code: yes | related: sql-m04-ctes
- sql-m04-bom-graph-traversal | Bill of materials and graph traversal | Quantities through levels, cycles, paths in graphs | code: yes | related: sql-m04-recursive-hierarchies

## sql-m05 — Set-based patterns
- sql-m05-deduplication | Deduplication | Finding and removing duplicates while keeping the right row | code: yes | related: pyspark-m03-deduplication
- sql-m05-top-n-per-group | Top N per group | ROW_NUMBER, APPLY, QUALIFY in Snowflake and Databricks | code: yes | related: sql-m03-ranking
- sql-m05-pivot-unpivot | Pivot and unpivot | PIVOT and UNPIVOT operators versus conditional aggregation | code: yes | related: pyspark-m03-pivot-unpivot
- sql-m05-replacing-cursors | Replacing cursors with set-based SQL | Why row-by-row loops are slow and how to rewrite them | code: yes | related: sql-m10-stored-procedures

## sql-m06 — Time and temporal data
- sql-m06-calendar-tables | Calendar and date dimension tables | Why a date table helps, fiscal calendars, business days | code: yes | related: sql-m06-time-series
- sql-m06-time-series | Time series queries | Bucketing by time, filling gaps, period-over-period comparisons | code: yes | related: sql-m03-lag-lead-running-totals
- sql-m06-scd | Slowly changing dimensions in SQL | Type 1, type 2 and type 3 designs and loading them | code: yes | related: pyspark-m08-scd-patterns, sql-m08-merge-upsert
- sql-m06-temporal-tables | System-versioned temporal tables and flashback | SQL Server temporal tables, Oracle Flashback, querying as of a time | code: yes | related: snowflake-m04-time-travel-fail-safe

## sql-m07 — Semi-structured data
- sql-m07-json | JSON in SQL | Parsing, querying and producing JSON in T-SQL, Oracle, Spark SQL and Snowflake | code: yes | related: snowflake-m04-variant, pyspark-m04-complex-types
- sql-m07-xml | XML in SQL | XML types, XQuery and shredding XML into rows | code: yes | related: pyspark-m06-xml-and-excel

## sql-m08 — Modification and transactions
- sql-m08-merge-upsert | MERGE and upserts | MERGE syntax across dialects, its pitfalls, and alternatives | code: yes | related: pyspark-m08-delta-merge
- sql-m08-bulk-operations | Bulk operations | Bulk inserts, minimal logging, batching large deletes and updates | code: yes | related: sql-m08-locking-deadlocks
- sql-m08-isolation-levels | Transactions and isolation levels | ACID, read phenomena, snapshot and read committed in SQL Server and Oracle | code: yes | related: sql-m08-locking-deadlocks
- sql-m08-locking-deadlocks | Locking, blocking and deadlocks | Lock types, escalation, deadlock causes and how to avoid them | code: yes | related: sql-m08-isolation-levels

## sql-m09 — Performance
- sql-m09-execution-plans | Execution plans | Reading estimated and actual plans in SQL Server and Oracle | code: yes | related: pyspark-m07-explain-plans, snowflake-m03-query-profile
- sql-m09-indexes | Index types | Clustered, nonclustered, covering, filtered and columnstore indexes; Oracle B-tree and bitmap | code: yes | related: sql-m09-sargability
- sql-m09-statistics | Statistics and cardinality estimation | How the optimiser guesses row counts and what goes wrong | code: yes | related: sql-m09-execution-plans
- sql-m09-sargability | Sargability | Writing predicates that can use indexes | code: yes | related: sql-m09-indexes
- sql-m09-parameter-sniffing | Parameter sniffing | Plan reuse with skewed parameters in SQL Server, and Oracle's bind peeking | code: yes | related: sql-m09-statistics
- sql-m09-partitioning | Table partitioning | Partitioning in SQL Server and Oracle, partition elimination, sliding windows | code: yes | related: pyspark-m06-partitioning-bucketing
- sql-m09-hints | Query hints | When hints are justified and the risk they carry | code: yes | related: pyspark-m05-hints

## sql-m10 — Programmability
- sql-m10-stored-procedures | Stored procedures and packages | T-SQL procedures, Oracle PL/SQL packages, and when logic belongs in the database | code: yes | related: sql-m10-error-handling
- sql-m10-functions | User-defined functions | Scalar and table-valued functions, inlining and performance | code: yes | related: pyspark-m04-udfs
- sql-m10-triggers | Triggers | DML triggers, their hidden costs, and alternatives | code: yes | related: sql-m06-temporal-tables
- sql-m10-dynamic-sql-injection | Dynamic SQL and SQL injection | Building SQL safely with parameters, sp_executesql, bind variables | code: yes | related: sql-m10-stored-procedures
- sql-m10-error-handling | Error handling | TRY...CATCH, THROW, PL/SQL exceptions and transaction rollback | code: yes | related: sql-m08-isolation-levels

## sql-m11 — Analytical patterns
- sql-m11-cohorts-retention | Cohorts and retention | Grouping users by start period and tracking return rates | code: yes | related: sql-m06-calendar-tables
- sql-m11-funnels | Funnels | Measuring step-by-step conversion through events | code: yes | related: sql-m03-sessionization
- sql-m11-percentiles | Percentiles and medians | PERCENTILE_CONT, PERCENTILE_DISC, approximate percentiles | code: yes | related: ml-m01-distributions
- sql-m11-ab-analysis | A/B test analysis in SQL | Computing conversion by variant and the statistics you still need | code: yes | related: ml-m01-hypothesis-testing

## sql-m12 — Migration SQL
- sql-m12-reconciliation | Reconciliation queries | Counts, sums, checksums and row-level diffs between source and target | code: yes | related: pyspark-m11-reconciliation
- sql-m12-dialect-translation | Translating between Oracle, T-SQL, Spark SQL and Snowflake | Common syntax and behaviour differences and how to map them | code: yes | related: pyspark-m13-jdbc-oracle-sqlserver
- sql-m12-data-type-mapping | Data type mapping across platforms | NUMBER, DATE, VARCHAR2, DATETIME2 and their equivalents, precision traps | code: yes | related: sql-m12-dialect-translation, pyspark-m02-schema-and-types
