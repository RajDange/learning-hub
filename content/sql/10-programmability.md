# Stored procedures and packages
id: sql-m10-stored-procedures
track: sql

## What we're learning
A **stored procedure** is named code stored and executed in the database, with parameters, variables, control flow, transactions and error handling.

- **T-SQL procedures** (`CREATE PROCEDURE`) can return result sets, output parameters and a return code; they run under the caller's or a specified security context.
- **Oracle PL/SQL** organises code into **packages**: a **specification** (public procedures, functions, types, constants) and a **body** (implementation and private parts). Packages hold state per session, can be recompiled independently, and are the standard unit of legacy Oracle business logic.
- **Snowflake** supports procedures in SQL (Snowflake Scripting), JavaScript, Python, Java and Scala; **Fabric Warehouse** supports T-SQL procedures; Databricks supports SQL procedures in recent versions (verify).

## Benefit
Procedures keep data-heavy logic close to the data, give a stable interface to applications, and allow permission to run a procedure without direct table access.

## Limits and misconceptions
- Legacy ETL often lives in thousands of lines of procedures with cursors, temp tables and dynamic SQL. During migration, decide per procedure: translate (if set-based), redesign (as dbt models, Spark jobs or pipelines), or retire.
- Business logic hidden in procedures is hard to test, version and reuse outside the database; put it in Git with tests (tSQLt for SQL Server, utPLSQL for Oracle).
- Cloud warehouses execute procedural code less efficiently than set-based SQL.

## Remember this
Procedures and PL/SQL packages keep logic in the database behind a stable interface; in migrations, translate set-based ones and redesign procedural ones.

## Related
sql-m05-replacing-cursors, sql-m10-error-handling, sql-m12-dialect-translation, tools-m04-dbt


# User-defined functions
id: sql-m10-functions
track: sql

## What we're learning
User-defined functions (UDFs) return a value or a table and can be used inside queries:

- **Scalar functions** return one value per call. In SQL Server they were historically executed row by row and blocked parallelism, a notorious performance problem; **scalar UDF inlining** (SQL Server 2019+) rewrites many of them into the query automatically.
- **Inline table-valued functions** (T-SQL, a single `RETURN SELECT`) behave like parameterised views and are fully optimised.
- **Multi-statement table-valued functions** fill a table variable and were estimated poorly (fixed row guesses), often causing bad plans.
- **Oracle** PL/SQL functions called from SQL cause **context switches** between the SQL and PL/SQL engines; `PRAGMA UDF`, `WITH FUNCTION` and the function result cache reduce the cost. Pipelined table functions stream rows.
- Snowflake supports SQL, JavaScript, Python, Java and Scala UDFs and UDTFs; Spark has SQL UDFs and Python UDFs.

## Benefit
Functions encapsulate reusable logic (tax calculation, code mapping) so it is defined once.

## Code snippet
```sql
-- T-SQL inline table-valued function: optimised like a view
CREATE FUNCTION dbo.OrdersSince (@since DATE)
RETURNS TABLE AS RETURN
  SELECT order_id, customer_id, amount FROM dbo.Orders WHERE order_date >= @since;

SELECT c.name, o.amount
FROM dbo.Customers c CROSS APPLY dbo.OrdersSince('2025-01-01') o
WHERE o.customer_id = c.customer_id;
```

## Limits and misconceptions
- A scalar function in `WHERE` on a large table can turn a fast query into a slow one; check whether it is inlined.
- Functions with side effects are not allowed in SQL Server functions; in Oracle they need autonomous transactions and are a bad idea.
- In Spark and Snowflake, Python UDFs are much slower than built-in SQL expressions.

## Remember this
Prefer inline table-valued or inlinable functions; scalar and multi-statement functions can quietly destroy performance.

## Related
pyspark-m04-udfs, sql-m02-apply-lateral, sql-m09-execution-plans


# Triggers
id: sql-m10-triggers
track: sql

## What we're learning
A **trigger** is code that runs automatically when data changes (DML triggers on INSERT, UPDATE, DELETE) or on schema events (DDL triggers).

- **SQL Server** triggers fire **once per statement**, with the changed rows in the `inserted` and `deleted` pseudo-tables; `AFTER` and `INSTEAD OF` types.
- **Oracle** triggers can be **row-level** (`FOR EACH ROW`, with `:NEW` and `:OLD`) or statement-level, `BEFORE` or `AFTER`, plus compound triggers.

Common legacy uses: audit history tables, maintaining derived columns, enforcing complex rules, and replicating changes to other tables.

## Benefit
Triggers guarantee that an action happens whatever application changes the data, which is why older systems used them for auditing and integrity.

## Limits and misconceptions
- **Hidden costs**: every write pays for the trigger; bulk loads slow down dramatically; logic is invisible to developers reading application code.
- SQL Server triggers written assuming one row per statement break on multi-row updates, a classic bug.
- Cascading and recursive triggers make behaviour hard to predict.
- Modern alternatives: temporal tables or CDC for history, computed columns, constraints, application or pipeline logic. Fabric Warehouse and most cloud warehouses do not support triggers, so migrations must replace them.

## Remember this
Triggers run automatically on data changes but hide cost and logic; prefer temporal tables, CDC and constraints, and plan replacements when migrating.

## Related
sql-m06-temporal-tables, tools-m01-debezium, fabric-m02-warehouse


# Dynamic SQL and SQL injection
id: sql-m10-dynamic-sql-injection
track: sql

## What we're learning
**Dynamic SQL** builds statement text at runtime and executes it: `sp_executesql` or `EXEC` in T-SQL, `EXECUTE IMMEDIATE` and `DBMS_SQL` in Oracle, `EXECUTE IMMEDIATE` in Snowflake. It is needed for variable table names, dynamic pivots and generic utilities.

The danger is **SQL injection**: if user input is concatenated into the statement, a value like `x'; DROP TABLE orders; --` becomes code. The rules:

- Pass **values** as **parameters or bind variables** (`sp_executesql` with parameters, `USING` in Oracle), never by concatenation.
- **Identifiers** (table or column names) cannot be bound; validate them against a whitelist or system catalog and quote them with `QUOTENAME` (T-SQL) or `DBMS_ASSERT` (Oracle).
- Run dynamic code with least privilege.

## Benefit
Parameterised dynamic SQL is both safe and faster (plans are reused, and Oracle avoids hard parses).

## Code snippet
```sql
-- T-SQL: safe value parameter and validated identifier
DECLARE @table SYSNAME = N'Orders', @since DATE = '2025-01-01', @sql NVARCHAR(MAX);
IF OBJECT_ID(N'dbo.' + @table) IS NULL THROW 50001, 'Unknown table', 1;
SET @sql = N'SELECT COUNT(*) FROM dbo.' + QUOTENAME(@table) + N' WHERE order_date >= @since';
EXEC sp_executesql @sql, N'@since DATE', @since = @since;

-- Oracle
EXECUTE IMMEDIATE 'DELETE FROM staging_orders WHERE load_id = :id' USING v_load_id;
```

## Limits and misconceptions
- Escaping quotes by hand is not a defence; parameters are.
- `EXEC(@sql)` without parameters in T-SQL is the risky form.
- Injection also applies to Python code building SQL strings (including Spark SQL f-strings); use parameter APIs.

## Remember this
Bind values as parameters, whitelist and quote identifiers, and never concatenate user input into SQL.

## Related
python-m06-sqlalchemy, pyspark-m05-sql-on-dataframes, sql-m10-stored-procedures, ai-m08-prompt-injection


# Error handling
id: sql-m10-error-handling
track: sql

## What we're learning
Robust database code catches errors, rolls back incomplete work, and reports clearly.

- **T-SQL**: `BEGIN TRY ... END TRY BEGIN CATCH ... END CATCH`. Inside CATCH, use `ERROR_NUMBER()`, `ERROR_MESSAGE()`, `ERROR_LINE()`, check `XACT_STATE()` (-1 means the transaction must be rolled back), then `ROLLBACK` and `THROW` to re-raise. `SET XACT_ABORT ON` makes most runtime errors roll back the whole transaction automatically, recommended in procedures with transactions.
- **Oracle PL/SQL**: `EXCEPTION WHEN NO_DATA_FOUND THEN ... WHEN OTHERS THEN ...`, `SQLCODE`, `SQLERRM`, `RAISE_APPLICATION_ERROR(-20001, 'message')` for custom errors, and `DBMS_UTILITY.FORMAT_ERROR_BACKTRACE` for line numbers. Oracle rolls back the failed statement automatically, not the transaction.
- **Snowflake Scripting**: `EXCEPTION WHEN ... THEN` blocks with `SQLCODE`, `SQLERRM`.

## Benefit
Correct error handling prevents half-loaded data, keeps failures visible to orchestrators, and makes troubleshooting fast.

## Code snippet
```sql
CREATE OR ALTER PROCEDURE dbo.LoadOrders AS
BEGIN
  SET XACT_ABORT ON;
  BEGIN TRY
    BEGIN TRAN;
      DELETE FROM dbo.Orders WHERE load_date = CAST(GETDATE() AS DATE);
      INSERT INTO dbo.Orders SELECT * FROM stg.Orders;
    COMMIT;
  END TRY
  BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK;
    INSERT INTO dbo.ErrorLog (proc_name, msg) VALUES (N'LoadOrders', ERROR_MESSAGE());
    THROW;   -- re-raise so the caller and scheduler see the failure
  END CATCH
END;
```

## Limits and misconceptions
- `WHEN OTHERS THEN NULL` in PL/SQL, or a CATCH block that does not re-raise, swallows errors: the job reports success while data is wrong.
- Some errors (compile errors, some severity levels) are not catchable in T-SQL.
- Logging inside a transaction that is rolled back loses the log row; log after rollback (or use autonomous transactions in Oracle).

## Remember this
Catch, roll back, log, then re-raise; never swallow errors, and use XACT_ABORT ON in T-SQL transactions.

## Related
sql-m08-isolation-levels, pyspark-m12-idempotency-retries, sql-m10-stored-procedures
