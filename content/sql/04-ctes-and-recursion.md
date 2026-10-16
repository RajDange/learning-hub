# Common table expressions
id: sql-m04-ctes
track: sql

## What we're learning
A **common table expression (CTE)** names a subquery at the start of a statement with `WITH name AS (...)`, so later parts of the query can refer to it by name. Several CTEs can be chained, each building on the previous ones, which turns a deeply nested query into readable steps. CTEs work in T-SQL, Oracle (where they are also called subquery factoring), Spark SQL and Snowflake.

## Benefit
Readable, reviewable queries: each step has a name that says what it means (`active_customers`, `monthly_revenue`), and a complex report becomes a pipeline of small, checkable pieces.

## Code snippet
```sql
WITH active_customers AS (
    SELECT customer_id FROM customers WHERE status = 'ACTIVE'
), monthly_revenue AS (
    SELECT o.customer_id, DATE_TRUNC('month', o.order_date) AS month, SUM(o.amount) AS revenue
    FROM orders o JOIN active_customers a ON a.customer_id = o.customer_id
    GROUP BY o.customer_id, DATE_TRUNC('month', o.order_date)
)
SELECT month, SUM(revenue) AS revenue, COUNT(*) AS customers
FROM monthly_revenue
GROUP BY month;
-- T-SQL: DATETRUNC(month, d) in SQL Server 2022+, else DATEFROMPARTS(YEAR(d), MONTH(d), 1); Oracle: TRUNC(d, 'MM')
```

## Limits and misconceptions
- **Performance myth**: a CTE is usually **not** materialised. SQL Server, Spark and Snowflake inline it into the plan like a view, so a CTE referenced three times may be computed three times. Oracle may materialise it (and has a `MATERIALIZE` hint). If reuse is expensive, use a temporary table.
- A CTE's scope is one statement; it is gone afterwards.
- In T-SQL, the statement before `WITH` must end with a semicolon.

## Remember this
CTEs name query steps for readability; they are usually inlined, not cached, so reuse can mean recomputation.

## Related
pyspark-m05-sql-on-dataframes, sql-m04-recursive-hierarchies, sql-m01-logical-processing-order


# Recursive CTEs and hierarchies
id: sql-m04-recursive-hierarchies
track: sql

## What we're learning
A **recursive CTE** refers to itself. It has an **anchor** member (the starting rows) and a **recursive** member that joins back to the CTE to find the next level, combined with `UNION ALL`. The engine repeats the recursive member until it returns no rows.

It is the standard way to walk **parent-child hierarchies**: organisation charts, account hierarchies, product categories, folder trees. Oracle also has the older `CONNECT BY PRIOR` syntax with `LEVEL`, `SYS_CONNECT_BY_PATH` and `CONNECT_BY_ISLEAF`, common in legacy code. Recursive CTEs are supported in T-SQL, Oracle 11gR2+, Snowflake (and Snowflake also supports `CONNECT BY`) and recent Spark SQL versions (4.1 and later; verify on your runtime).

## Benefit
Rolling costs up an org chart, finding all sub-accounts of a parent, or building a path string for each node becomes a single query.

## Code snippet
```sql
-- T-SQL (Oracle and Snowflake: same, without the OPTION clause; Oracle needs column aliases list)
WITH org (employee_id, manager_id, name, lvl, path) AS (
    SELECT employee_id, manager_id, name, 1, CAST(name AS VARCHAR(4000))
    FROM employees WHERE manager_id IS NULL               -- anchor: the CEO
    UNION ALL
    SELECT e.employee_id, e.manager_id, e.name, o.lvl + 1,
           CAST(o.path + ' > ' + e.name AS VARCHAR(4000))  -- Oracle/Snowflake: o.path || ' > ' || e.name
    FROM employees e JOIN org o ON e.manager_id = o.employee_id
)
SELECT * FROM org
OPTION (MAXRECURSION 100);

-- Oracle legacy equivalent
SELECT employee_id, name, LEVEL, SYS_CONNECT_BY_PATH(name, ' > ') AS path
FROM employees START WITH manager_id IS NULL CONNECT BY PRIOR employee_id = manager_id;
```

## Limits and misconceptions
- Cycles in data (A manages B manages A) cause infinite recursion. SQL Server stops at `MAXRECURSION` (default 100); Oracle has `CYCLE` clauses and `NOCYCLE`.
- Recursive queries over large graphs can be slow; for deep, frequently queried hierarchies consider storing a path or closure table.
- Data types in anchor and recursive parts must match exactly in SQL Server (hence the CAST).

## Remember this
A recursive CTE starts from anchor rows and repeatedly joins to itself to walk hierarchies; guard against cycles.

## Related
sql-m04-ctes, sql-m04-bom-graph-traversal, sql-m12-dialect-translation


# Bill of materials and graph traversal
id: sql-m04-bom-graph-traversal
track: sql

## What we're learning
A **bill of materials (BOM)** lists the components of a product, each of which may have its own components, with quantities at each level. Exploding a BOM means computing, for a finished product, the total quantity of every part at every level, by **multiplying quantities down the tree** in a recursive CTE.

The same pattern handles **graphs** more generally: routes between locations, dependencies between jobs or tables, ownership chains between companies. In graphs a node can be reached by several paths and cycles are possible, so queries carry a **path** and stop when a node repeats.

## Benefit
Cost roll-ups, material requirements planning, dependency impact ("what depends on this table?") and ownership calculations become set-based SQL instead of procedural loops.

## Code snippet
```sql
WITH bom (parent, component, qty, total_qty, lvl) AS (
    SELECT parent_part, component_part, quantity, CAST(quantity AS DECIMAL(18,4)), 1
    FROM bom_lines WHERE parent_part = 'BIKE-01'
    UNION ALL
    SELECT b.parent_part, b.component_part, b.quantity,
           CAST(r.total_qty * b.quantity AS DECIMAL(18,4)), r.lvl + 1
    FROM bom_lines b JOIN bom r ON b.parent_part = r.component
)
SELECT component, SUM(total_qty) AS qty_per_bike
FROM bom GROUP BY component;
```

## Limits and misconceptions
- A part used in several sub-assemblies appears on several paths; summing at the end gives the total requirement.
- Cycle detection needs the path (a string or array of visited nodes) checked in the recursive step.
- For heavy graph analytics (shortest paths across millions of edges), dedicated graph engines or libraries are better tools; some platforms now include graph features (for example Fabric Graph).

## Remember this
Exploding a BOM multiplies quantities down a recursive CTE; for general graphs carry the path to avoid cycles.

## Related
sql-m04-recursive-hierarchies, sql-m05-replacing-cursors
