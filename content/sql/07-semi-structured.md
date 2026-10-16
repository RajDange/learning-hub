# JSON in SQL
id: sql-m07-json
track: sql

## What we're learning
Every major engine can query JSON, with different syntax:

| Task | T-SQL | Oracle | Snowflake | Spark SQL |
|---|---|---|---|---|
| Storage type | `NVARCHAR(MAX)`, native `json` type (2025, verify) | `JSON` type (21c+) or text with `IS JSON` | `VARIANT` | `STRING`, `VARIANT` (4.0+) |
| Read a scalar | `JSON_VALUE(doc, '$.customer.id')` | `JSON_VALUE(doc, '$.customer.id')` or dot notation | `doc:customer.id::string` | `get_json_object` or `doc:customer.id` (VARIANT) |
| Explode arrays | `OPENJSON(doc, '$.items') WITH (...)` | `JSON_TABLE(doc, '$.items[*]' COLUMNS ...)` | `LATERAL FLATTEN(doc:items)` | `explode(from_json(...))` |
| Build JSON | `FOR JSON PATH`, `JSON_OBJECT` (2022) | `JSON_OBJECT`, `JSON_ARRAYAGG` | `OBJECT_CONSTRUCT`, `ARRAY_AGG` | `to_json(struct(...))` |
| Validate | `ISJSON` | `IS JSON` | `TRY_PARSE_JSON` | `from_json` returns null |

## Benefit
API payloads, event data and configuration blobs can be landed as-is and shaped into relational tables with SQL, without external parsing code.

## Code snippet
```sql
-- T-SQL: one row per order line from a JSON document
SELECT o.order_id, l.sku, l.qty
FROM raw_orders o
CROSS APPLY OPENJSON(o.doc, '$.lines')
     WITH (sku NVARCHAR(50) '$.sku', qty INT '$.qty') l;

-- Oracle
SELECT o.order_id, jt.sku, jt.qty
FROM raw_orders o,
     JSON_TABLE(o.doc, '$.lines[*]' COLUMNS (sku VARCHAR2(50) PATH '$.sku',
                                              qty NUMBER PATH '$.qty')) jt;
```

## Limits and misconceptions
- JSON stored as text is reparsed on every query; extract hot fields into columns (computed columns with indexes in SQL Server, virtual columns in Oracle) or curated tables.
- Path syntax and lax versus strict modes differ; missing paths often return NULL silently.
- Large documents strain row-size limits in OLTP databases; analytics platforms handle them better.

## Remember this
All engines parse JSON with path functions and explode arrays into rows (OPENJSON, JSON_TABLE, FLATTEN, explode); extract hot fields into columns.

## Related
snowflake-m04-variant, pyspark-m04-complex-types, sql-m02-apply-lateral


# XML in SQL
id: sql-m07-xml
track: sql

## What we're learning
Legacy integrations (SOAP services, banking and insurance messages, older ERP exports) still produce XML. Databases support it natively:

- **SQL Server**: the `xml` data type with XQuery methods: `.value()` for scalars, `.nodes()` to shred repeating elements into rows (with `CROSS APPLY`), `.exist()` and `.query()`; XML indexes; `FOR XML` to produce XML; `OPENXML` in older code.
- **Oracle**: `XMLTYPE`, `XMLTABLE` to shred with XPath into rows and columns, `XMLQUERY`, and `XMLELEMENT`/`XMLAGG` to build XML.
- **Snowflake**: `PARSE_XML` into VARIANT, `XMLGET` and FLATTEN.
- **Spark**: a native XML data source in Spark 4.0 (spark-xml before), and `from_xml`.

Namespaces must be declared in queries (`WITH XMLNAMESPACES` in T-SQL, `XMLNAMESPACES` clause in Oracle's `XMLTABLE`), a common source of empty results.

## Benefit
Shredding XML into relational tables with SQL avoids fragile custom parsers and keeps the logic inside the database or platform.

## Code snippet
```sql
-- SQL Server: shred order lines
SELECT x.doc.value('(/Order/@id)[1]', 'varchar(20)') AS order_id,
       l.n.value('(Sku/text())[1]', 'varchar(50)') AS sku,
       l.n.value('(Qty/text())[1]', 'int') AS qty
FROM raw_xml x
CROSS APPLY x.doc.nodes('/Order/Lines/Line') AS l(n);

-- Oracle
SELECT t.order_id, l.sku, l.qty
FROM raw_xml t,
     XMLTABLE('/Order/Lines/Line' PASSING t.doc
              COLUMNS sku VARCHAR2(50) PATH 'Sku', qty NUMBER PATH 'Qty') l;
```

## Limits and misconceptions
- XML parsing is CPU-heavy; shred once on load, not in every report query.
- Forgetting namespaces returns no rows without an error.
- Very large XML documents are better parsed in Spark or streaming parsers than inside OLTP databases.

## Remember this
Shred XML into rows with nodes() and value() in SQL Server or XMLTABLE in Oracle, declare namespaces, and do it once at load.

## Related
pyspark-m06-xml-and-excel, sql-m07-json
