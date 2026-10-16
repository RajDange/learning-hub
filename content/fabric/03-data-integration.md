# Data Factory pipelines
id: fabric-m03-pipelines
track: fabric
verified: 2026-10

## What we're learning
A Fabric **pipeline** orchestrates work: it runs activities in order, with branching, loops, parameters and error paths. Activities include **Copy data**, running a notebook, Spark job definition, Dataflow Gen2 or stored procedure, refreshing a semantic model, calling other pipelines (**Invoke pipeline**), web calls, and notifications to Outlook or Teams. The expression language is the same as Azure Data Factory's.

Pipelines run on demand, on **schedules** (several per pipeline, each with start and end dates), or from **event triggers** such as a file arriving in OneLake or Azure Blob storage. Event triggers are built on Activator.

Compared with Azure Data Factory, Fabric pipelines drop **datasets** (settings live in the activity), use **connections** instead of linked services, and use the **on-premises data gateway** instead of a self-hosted integration runtime. Microsoft says about 90 percent of ADF activities are available.

## Benefit
Pipelines are the control plane for batch data movement in Fabric: one place to sequence ingestion, transformation and refresh, with retries and monitoring in the monitoring hub.

## Limits and misconceptions
- A pipeline orchestrates; heavy transformation should happen in notebooks, the Warehouse or dataflows that the pipeline calls.
- Missing compared with ADF (October 2026): SSIS integration runtime, managed virtual network and managed private endpoints. Tumbling-window triggers are being replaced by interval schedules (preview) without full backfill support yet.
- Copy activity throughput and cost depend on capacity, gateway and source limits.
- For simple bulk or incremental copies without orchestration logic, a Copy job is simpler.

## Remember this
Fabric pipelines are ADF's orchestration model inside Fabric, minus datasets and SSIS, plus native Fabric activities.

## Related
tools-m05-adf-fabric-pipelines, fabric-m03-copy-job, tools-m01-azure-data-factory, tools-m05-scheduling-vs-orchestration


# Dataflows Gen2
id: fabric-m03-dataflows-gen2
track: fabric
verified: 2026-10

## What we're learning
**Dataflow Gen2** is low-code data preparation with **Power Query**, the same engine used in Excel and Power BI. You connect to hundreds of sources, shape the data with a visual editor (filter, merge, pivot, type changes) and write the result to an **output destination**: a lakehouse, warehouse, KQL database, Fabric SQL database, Azure SQL, ADLS, SharePoint, Snowflake and others.

Performance features include **fast copy** (bulk movement for simple steps), **staging** (pushing heavy work to a warehouse engine) and partitioned compute. Since April 2026 new dataflows are always created with CI/CD support (Git and deployment pipelines).

## Benefit
Business analysts and Power BI developers can build ingestion and cleaning steps without writing Spark or SQL, using skills they already have.

## Limits and misconceptions
- Power Query is not a distributed engine like Spark. Large volumes and complex joins can be slow and **expensive in capacity units**; Microsoft publishes per-second CU rates and benchmarks to compare.
- Query folding (pushing steps back to the source) is what makes dataflows fast; steps that break folding pull data into the mashup engine.
- Debugging and testing are weaker than in code.
- Mapping data flows from ADF are not the same thing; Fabric offers a separate upgrade path (preview) for them.

## Remember this
Dataflow Gen2 is Power Query in Fabric: great for low-code shaping at moderate volume, costly for heavy lifting.

## Related
fabric-m03-pipelines, tools-m08-power-bi, fabric-m01-licensing-capacity


# Copy job
id: fabric-m03-copy-job
track: fabric
verified: 2026-10

## What we're learning
A **Copy job** is a Fabric item that moves data from a source to a destination without building a pipeline. You pick tables, a mode and a schedule:

- **Full copy** every run, or **incremental copy**: a first full load, then only new or changed rows, tracked either by a **watermark column** (a datetime, integer or rowversion) or by the source's **CDC** feed where enabled (CDC replication was still labelled preview on the connector page in October 2026).
- **Write methods**: append, merge on a key (with CDC this also applies deletes), overwrite, and SCD type 2 (preview).

The job stores its own state, so it resumes from the last successful run, and it can auto-create destination tables.

## Benefit
Most ingestion is "copy these tables every hour, only what changed". Copy job does that with no orchestration code, which is less to build and less to break than a metadata-driven pipeline.

## Limits and misconceptions
- Microsoft's data movement guidance: **Copy job** for bronze or raw ingestion, **mirroring** for continuously replicating already-clean data, **pipeline copy activity** when you need orchestration or parameterised metadata-driven loads, **Eventstreams** for streaming.
- Watermark-based incremental loads do not see hard deletes in the source; only CDC does.
- Event-based triggering requires running the Copy job from a pipeline.

## Remember this
Copy job is managed bulk and incremental copy with built-in state, the simplest way to land source tables in Fabric.

## Related
fabric-m03-pipelines, pyspark-m13-incremental-loads, fabric-m02-mirroring, tools-m01-ingestion-styles


# On-premises and VNet data gateways
id: fabric-m03-gateways
track: fabric
verified: 2026-10

## What we're learning
Fabric is a cloud service, so it needs a bridge to reach data behind a firewall:

- The **on-premises data gateway** is Windows software you install on a machine inside your network. It makes outbound connections to Azure, so no inbound firewall ports are needed. It can be clustered (up to 10 nodes) for availability. In Fabric it serves Dataflow Gen2, pipelines, Copy job and mirroring, as well as Power BI.
- The **virtual network (VNet) data gateway** is a Microsoft-managed gateway injected into one of your Azure virtual networks, for sources reachable from Azure through private endpoints or peering. Nothing to install or patch, but it costs capacity units while running. It serves Dataflow Gen2, pipelines, Copy job, mirroring, Power BI semantic models and paginated reports.

## Benefit
Gateways let a migration move compute to Fabric while legacy databases (Oracle, SQL Server, file shares) stay on-premises during the transition.

## Limits and misconceptions
- The gateway machine becomes production infrastructure: size it, monitor it, patch it and keep it near the data. A busy gateway is a common bottleneck for large copies.
- Direct Lake semantic models cannot use any gateway.
- Spark notebooks do not use gateways; Spark reaches private sources through managed private endpoints or by landing data with pipelines first.
- When tenant-level Private Link or "block public internet access" is enabled, the on-premises gateway is not supported; the VNet gateway is the route.

## Remember this
Use the on-premises gateway for data inside your own network and the VNet gateway for private Azure sources; Spark and Direct Lake do not go through gateways.

## Related
fabric-m10-migrating-from-legacy, fabric-m03-copy-job, tools-m09-secrets-identity
