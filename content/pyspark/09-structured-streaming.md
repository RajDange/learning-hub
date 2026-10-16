# The Structured Streaming model
id: pyspark-m09-streaming-model
track: pyspark

## What we're learning
**Structured Streaming** treats a stream as an **unbounded table** that keeps growing. You write the same DataFrame operations as in batch (`select`, `filter`, `groupBy`, `join`), and Spark runs them **incrementally**: each **micro-batch** picks up the new rows since the last one, updates results and writes them to a sink.

A streaming query has four parts:
1. A **source**: `spark.readStream` from Kafka, Event Hubs, Kinesis, files, Delta tables or a rate source.
2. **Transformations**.
3. A **sink**: `writeStream` to Delta, files, Kafka, `foreachBatch` or the console.
4. **Query settings**: trigger, output mode and a **checkpoint location**.

## Benefit
One API and one engine for batch and streaming. Logic tested in batch can run continuously, and a team that knows Spark DataFrames can build streaming pipelines without a separate framework.

## Code snippet
```python
events = (spark.readStream.format("kafka")
          .option("kafka.bootstrap.servers", "broker:9092")
          .option("subscribe", "orders").load())

parsed = events.select(F.from_json(F.col("value").cast("string"), schema).alias("o")).select("o.*")

query = (parsed.writeStream.format("delta")
         .option("checkpointLocation", "/chk/orders_bronze")
         .trigger(processingTime="1 minute")
         .toTable("bronze.orders"))
```

## Limits and misconceptions
- Micro-batch latency is typically from under a second to minutes, not single milliseconds. For very low latency, see continuous processing and Flink.
- Not every batch operation works on streams: for example, sorting a stream (except after aggregation in complete mode) and some join types are not supported.
- A streaming query is a long-running application: it needs monitoring, restarts and capacity like any service.

## Remember this
Structured Streaming runs ordinary DataFrame logic incrementally over an ever-growing table, one micro-batch at a time.

## Related
tools-m02-flink-vs-spark-streaming, pyspark-m09-triggers-output-modes, pyspark-m09-checkpointing, tools-m01-ingestion-styles


# Triggers and output modes
id: pyspark-m09-triggers-output-modes
track: pyspark

## What we're learning
**Triggers** decide when micro-batches run:
- Default (no trigger): start the next batch as soon as the previous one finishes.
- `processingTime="1 minute"`: run on a fixed interval.
- `availableNow=True`: process everything available now, in as many batches as needed, then **stop**. This is the modern way to run streaming code as a scheduled incremental batch job; it replaces the older `once=True`.
- `continuous="1 second"`: **continuous processing**, an experimental low-latency mode (about a millisecond) with at-least-once guarantees, supporting only map-like operations and a few sources and sinks. Rarely used in production.

**Output modes** decide what is written each batch:
- **Append**: only new final rows. Required for most file and Delta sinks; aggregations need a watermark to know when a row is final.
- **Update**: only rows that changed since the last batch.
- **Complete**: the whole result table every time; only for aggregations with small results.

## Benefit
`availableNow` lets one pipeline run continuously in production or hourly to save cost, with the same code and the same exactly-once bookkeeping.

## Code snippet
```python
(df.writeStream.format("delta")
   .option("checkpointLocation", "/chk/silver_orders")
   .trigger(availableNow=True)     # incremental batch: process backlog, then stop
   .toTable("silver.orders"))
```

## Limits and misconceptions
- Shorter trigger intervals mean more, smaller files and more overhead; tune intervals to freshness needs.
- Update mode is not supported by the plain file sink; use `foreachBatch` with MERGE for upsert semantics into Delta.
- Changing output mode or trigger type in a running query may require a new checkpoint.

## Remember this
Triggers set when batches run (availableNow for incremental batch jobs), and output modes set what each batch writes.

## Related
pyspark-m09-streaming-model, pyspark-m09-sinks-foreachbatch, pyspark-m09-event-time-watermarks


# Event time, watermarks and windows
id: pyspark-m09-event-time-watermarks
track: pyspark

## What we're learning
**Event time** is when something happened (a timestamp in the event); **processing time** is when Spark sees it. Events arrive late and out of order, so aggregations should be on event time.

**Windows** group events by event-time intervals:
- **Tumbling**: fixed, non-overlapping (`window("ts", "5 minutes")`).
- **Sliding**: fixed length, overlapping (`window("ts", "10 minutes", "5 minutes")`).
- **Session**: closed after a gap of inactivity (`session_window("ts", "30 minutes")`).

A **watermark** (`withWatermark("ts", "10 minutes")`) tells Spark how late data may arrive. Spark tracks the maximum event time seen; anything older than that minus the delay is considered too late. The watermark lets Spark finalise windows (needed for append mode) and **drop old state**.

## Benefit
Correct results for late data and bounded memory: without a watermark, a windowed aggregation keeps state for every window forever.

## Code snippet
```python
counts = (clicks
          .withWatermark("event_ts", "10 minutes")
          .groupBy(F.window("event_ts", "5 minutes"), "page")
          .count())
```

## Limits and misconceptions
- Events later than the watermark are dropped silently from stateful operations. Measure how late data really arrives before choosing the delay.
- A larger delay means more state and later final results; a smaller delay means more dropped events.
- The watermark is global per query (by default the minimum across inputs), so one slow partition or source holds everyone back.

## Remember this
Aggregate on event time, and set a watermark so Spark can finalise windows and forget old state.

## Related
pyspark-m09-stateful-operations, pyspark-m09-stream-joins, sql-m03-sessionization


# Stateful operations and state stores
id: pyspark-m09-stateful-operations
track: pyspark

## What we're learning
Some streaming operations must remember data across micro-batches. That memory is **state**:
- Streaming aggregations (running counts, windowed sums).
- `dropDuplicates` on a stream (remembers keys seen).
- Stream-stream joins (buffer rows waiting for a match).
- **Arbitrary stateful processing** with your own logic per key: older APIs `mapGroupsWithState` / `flatMapGroupsWithState` (Scala) and `applyInPandasWithState` (Python), and the newer `transformWithState` / `transformWithStateInPandas` API in Spark 4.0 with timers, multiple state variables and TTL.

State lives in a **state store** on executors, backed up to the checkpoint. The default store keeps state in JVM memory; the **RocksDB** state store keeps it on local disk and scales to much more state. Spark 4.0 also adds a state data source to inspect state for debugging.

## Benefit
State is what lets a stream compute running totals, detect sessions, deduplicate events or raise an alert when a device goes silent.

## Limits and misconceptions
- Unbounded state is the main way streaming jobs die. Every stateful operation needs a way to forget: a watermark, a TTL or a timer.
- Changing stateful logic (keys, schema of state) usually means the old checkpoint cannot be reused.
- Very large state makes each micro-batch's checkpoint slower. RocksDB with changelog checkpointing helps (verify settings for your runtime).

## Remember this
Stateful streaming remembers data per key across batches; always bound it with watermarks or TTLs, and use RocksDB for large state.

## Related
pyspark-m09-checkpointing, pyspark-m09-event-time-watermarks, pyspark-m03-deduplication, tools-m02-flink-vs-spark-streaming


# Checkpointing and recovery
id: pyspark-m09-checkpointing
track: pyspark

## What we're learning
Every streaming query writes to a **checkpoint location**, a folder that records:
- **Offsets**: which source data each micro-batch planned to read (written before processing).
- **Commits**: which batches completed (written after the sink succeeds).
- **State** snapshots for stateful operators.
- Query metadata.

On restart, Spark reads the checkpoint, finds the last committed batch, and resumes from the right offsets. If the last batch was planned but not committed, it is re-run with the same offsets, which is how replay and exactly-once sinks work together.

## Benefit
Checkpoints make streaming queries restartable after failures, upgrades and redeployments without losing or duplicating data (given a suitable source and sink).

## Code snippet
```python
(stream.writeStream
       .option("checkpointLocation", "abfss://chk@acct.dfs.core.windows.net/silver/orders")
       .toTable("silver.orders"))
```

## Limits and misconceptions
- **One checkpoint per query.** Never share it between two queries, and never delete it casually: a new checkpoint means starting over (from the earliest or latest source offset, depending on options).
- Changes that are not compatible with an existing checkpoint include changing the number or type of stateful operators, changing the source (for example a different topic set, depending on source), and changing the output sink type. Additive changes like adding a filter or a projection are usually fine.
- Put checkpoints on reliable storage (cloud storage, not local disk).
- Retention of the source (Kafka retention, Delta VACUUM) must cover the longest possible downtime, or offsets in the checkpoint will point at deleted data.

## Remember this
The checkpoint is the stream's memory of offsets, commits and state; one per query, on durable storage, and change queries with care.

## Related
pyspark-m09-exactly-once, pyspark-m09-stateful-operations, pyspark-m12-idempotency-retries


# Stream-static and stream-stream joins
id: pyspark-m09-stream-joins
track: pyspark

## What we're learning
Two kinds of joins on streams:

- **Stream-static**: each micro-batch of the stream is joined with a static DataFrame or table (for example enriching orders with a product dimension). Stateless and simple. If the static side is a Delta table, each batch reads its latest version.
- **Stream-stream**: two streams joined, for example ad impressions with ad clicks. Spark buffers rows from both sides in state until matches arrive. Inner joins are supported; outer and semi joins need **watermarks on both sides plus an event-time range condition**, so Spark knows when a row can never match and can emit or drop it.

## Benefit
Enrichment and correlation (orders with payments, sensor readings with maintenance events) can happen in the stream rather than after landing everything.

## Code snippet
```python
impressions = impressions.withWatermark("imp_ts", "2 hours")
clicks = clicks.withWatermark("click_ts", "3 hours")

joined = impressions.join(
    clicks,
    F.expr("""click_ad_id = imp_ad_id AND
              click_ts BETWEEN imp_ts AND imp_ts + interval 1 hour"""),
    "leftOuter")
```

## Limits and misconceptions
- Without watermarks and time bounds, stream-stream join state grows forever.
- Left outer join results for unmatched rows appear only after the watermark passes, so they are delayed.
- In stream-static joins, a static side that changes (a slowly changing dimension) gives results that depend on processing time, not event time.

## Remember this
Stream-static joins enrich each batch statelessly; stream-stream joins buffer state and need watermarks and time bounds.

## Related
pyspark-m03-joins, pyspark-m09-event-time-watermarks, pyspark-m09-stateful-operations


# Sinks and foreachBatch
id: pyspark-m09-sinks-foreachbatch
track: pyspark

## What we're learning
Built-in sinks: **Delta** and file formats (exactly-once with checkpoints), **Kafka** (at-least-once), **console** and **memory** (testing), and **foreach** (per row).

`foreachBatch(func)` is the escape hatch: Spark calls `func(batch_df, batch_id)` for each micro-batch, and inside it you can use **any batch API**. Common uses:
- **MERGE** (upsert) into a Delta table, which no built-in sink does.
- Writing one batch to several destinations.
- Writing to JDBC databases or other systems without a streaming sink.

## Benefit
`foreachBatch` lets streaming pipelines reuse all batch logic, notably MERGE for CDC streams, so you do not need special streaming versions of everything.

## Code snippet
```python
def upsert(batch_df, batch_id):
    latest = dedupe_latest(batch_df)                       # one row per key in this batch
    (DeltaTable.forName(spark, "silver.customers").alias("t")
        .merge(latest.alias("s"), "t.customer_id = s.customer_id")
        .whenMatchedUpdateAll().whenNotMatchedInsertAll().execute())

(cdc_stream.writeStream
    .foreachBatch(upsert)
    .option("checkpointLocation", "/chk/customers")
    .start())
```

## Limits and misconceptions
- `foreachBatch` is **at-least-once** by itself: a failed batch is retried with the same `batch_id`. Make the function idempotent (MERGE is naturally idempotent; for appends use Delta's `txnAppId` and `txnVersion` options or check `batch_id`).
- If you write to several sinks, cache the batch first or it is recomputed for each write.
- Deduplicate within each batch before MERGE, or duplicate keys will fail the merge.

## Remember this
foreachBatch hands each micro-batch to batch code, mostly for MERGE; make it idempotent because batches can be retried.

## Related
pyspark-m08-delta-merge, pyspark-m09-exactly-once, pyspark-m12-idempotency-retries


# Kafka, Event Hubs and Kinesis sources
id: pyspark-m09-kafka-eventhubs-kinesis
track: pyspark

## What we're learning
Spark reads message brokers as streams of records with `key`, `value` (binary), `topic`, `partition`, `offset` and `timestamp` columns. You parse `value` yourself (JSON, Avro, Protobuf).

- **Kafka**: the built-in `kafka` source. Options include `subscribe` or `subscribePattern`, `startingOffsets` (`earliest`, `latest` or JSON per partition), `maxOffsetsPerTrigger`, and security settings. Spark tracks offsets in its checkpoint, not in Kafka consumer groups.
- **Azure Event Hubs**: the simplest route is its **Kafka-compatible endpoint** with the same `kafka` source and SASL settings. A dedicated Event Hubs connector also exists.
- **Amazon Kinesis**: needs a connector (Databricks and AWS provide one; open-source options vary), with shard-based reading.

## Benefit
Brokers decouple producers from Spark: data is buffered and replayable, so a Spark job can restart, reprocess from an earlier offset, or catch up after downtime.

## Code snippet
```python
raw = (spark.readStream.format("kafka")
       .option("kafka.bootstrap.servers", "myhub.servicebus.windows.net:9093")   # Event Hubs Kafka endpoint
       .option("subscribe", "telemetry")
       .option("kafka.security.protocol", "SASL_SSL")
       .option("kafka.sasl.mechanism", "PLAIN")
       .option("kafka.sasl.jaas.config", jaas_config_from_secret)
       .option("startingOffsets", "earliest")
       .option("maxOffsetsPerTrigger", 500_000)
       .load())
```

## Limits and misconceptions
- Parallelism follows topic partitions by default; a topic with 4 partitions gives 4 reading tasks unless you set `minPartitions`.
- Broker retention must exceed your worst outage, or restarts fail with missing offsets (or skip data if you allow it).
- Schema evolution of the payload is your responsibility; a schema registry helps.

## Remember this
Spark reads brokers as offset-tracked binary records, keeps offsets in its checkpoint, and parallelises by topic partition.

## Related
tools-m02-kafka, tools-m02-event-hubs, tools-m02-kinesis, tools-m02-schema-registry


# Exactly-once and backpressure
id: pyspark-m09-exactly-once
track: pyspark

## What we're learning
**Exactly-once** in Structured Streaming means each input record affects the final sink output exactly once, even across failures. It needs three things together:
1. A **replayable source** (Kafka, Event Hubs, files, Delta) so a batch can be re-read with the same offsets.
2. **Checkpointed offsets and state**, so Spark knows which batch to redo.
3. An **idempotent or transactional sink**: Delta and the file sink commit each batch atomically and ignore a repeated batch ID.

Sinks like Kafka, JDBC or `foreachBatch` are at-least-once unless you make writes idempotent yourself.

**Backpressure**: Structured Streaming does not slow producers; instead you limit how much each micro-batch takes, so a backlog does not create a giant batch: `maxOffsetsPerTrigger` (Kafka), `maxFilesPerTrigger` and `maxBytesPerTrigger` (files, Delta).

## Benefit
Understanding the chain tells you where duplicates can come from, and rate limits keep catch-up after an outage stable instead of crashing on one huge batch.

## Limits and misconceptions
- "Exactly-once" ends at the sink. If a downstream system reads the sink and calls an API, that step needs its own idempotency.
- Event sources with at-least-once delivery (for example a no-code eventstream or a producer that retries) can contain duplicates before Spark ever sees them; deduplicate on a business key.
- Rate limits are per micro-batch, so with a long trigger interval they also cap throughput.

## Remember this
Exactly-once needs a replayable source, a checkpoint and an idempotent sink; rate limits per batch are Spark's backpressure.

## Related
pyspark-m09-checkpointing, pyspark-m12-idempotency-retries, pyspark-m09-sinks-foreachbatch, fabric-m05-eventstreams


# Auto Loader and incremental file ingestion
id: pyspark-m09-auto-loader
track: pyspark

## What we're learning
Many sources deliver **files** into cloud storage: daily extracts, exports, logs. The question is how to load only new files reliably.

- **Plain Structured Streaming file source** (`readStream.format("json").load(path)`): lists the directory each batch and remembers processed files in the checkpoint. Works everywhere, but listing large directories gets slow and schema changes need manual handling.
- **Auto Loader** (Databricks, `format("cloudFiles")`): an optimised file source that tracks discovered files in a scalable store, can use **file notification** (cloud event queues) instead of listing, and handles **schema inference and evolution** (new columns are detected, unexpected data goes to a rescued-data column). It is Databricks-specific, not part of open-source Spark.
- On other platforms, equivalents include event-triggered pipelines (Fabric pipelines with storage events, Copy job) and Snowflake's Snowpipe.

## Benefit
Incremental file ingestion with exactly-once tracking replaces fragile "move processed files to an archive folder" scripts.

## Code snippet
```python
# Databricks Auto Loader
bronze = (spark.readStream.format("cloudFiles")
          .option("cloudFiles.format", "json")
          .option("cloudFiles.schemaLocation", "/chk/erp_schema")
          .load("abfss://landing@acct.dfs.core.windows.net/erp/orders/"))

(bronze.writeStream.option("checkpointLocation", "/chk/erp_orders")
       .trigger(availableNow=True).toTable("bronze.erp_orders"))
```

## Limits and misconceptions
- Files modified after being processed are not re-read by default; sources should write new files, not overwrite old ones.
- File notification mode needs extra cloud permissions to create queues and subscriptions.
- Schema evolution in Auto Loader can stop the stream when a new column appears (by design, in the default mode), so the query restarts with the new schema.

## Remember this
Load landing-zone files incrementally with a checkpointed file stream; on Databricks, Auto Loader adds scalable discovery and schema evolution.

## Related
databricks-m03-auto-loader, snowflake-m02-snowpipe, pyspark-m13-ingestion-patterns, pyspark-m09-triggers-output-modes
