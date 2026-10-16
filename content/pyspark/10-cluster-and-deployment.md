# Cluster managers: YARN, Kubernetes, standalone
id: pyspark-m10-cluster-managers
track: pyspark

## What we're learning
Spark does not manage machines itself. A **cluster manager** gives it containers or processes for the driver and executors:

- **Hadoop YARN**: the classic choice on Hadoop clusters (on-premises, Cloudera, Amazon EMR on EC2, Dataproc). Spark asks YARN for containers with given CPU and memory.
- **Kubernetes**: Spark creates the driver and executors as pods from a container image. Used by cloud-native and on-premises platforms, often through the Kubeflow Spark Operator, and by EMR on EKS.
- **Standalone**: Spark's own simple master and workers. Fine for small fixed clusters and learning; little resource sharing or isolation.
- **Local mode**: everything in one process, for development and tests.
- **Managed platforms** (Databricks, Fabric, Synapse, EMR Serverless, Dataproc Serverless) hide the cluster manager behind their own control plane.

Apache Mesos support was deprecated and removed in Spark 4.0.

## Benefit
The cluster manager decides isolation, sharing between teams, autoscaling behaviour and how failures are handled. Knowing which one you run on explains many configuration options and error messages.

## Limits and misconceptions
- The Spark application model (driver, executors, tasks) is the same on every manager; the differences are resource requests, packaging and operations.
- On Kubernetes, executor pods losing shuffle data when they are removed is a known issue; use shuffle tracking or decommissioning features.
- Running your own YARN or Kubernetes Spark platform means owning upgrades, security and monitoring, which is the main reason organisations buy managed platforms.

## Remember this
YARN, Kubernetes or standalone supply the machines; the Spark model on top is the same, and managed platforms hide this layer.

## Related
tools-m09-kubernetes, pyspark-m01-spark-architecture, pyspark-m10-managed-platforms, pyspark-m10-spark-submit


# spark-submit and deploy modes
id: pyspark-m10-spark-submit
track: pyspark

## What we're learning
`spark-submit` launches a Spark application on a cluster. You pass the master, resources, dependencies, configuration and the main file with its arguments.

**Deploy modes**:
- **Client mode**: the driver runs where you typed the command (your laptop, an edge node, a notebook server). Output appears locally; if that machine disconnects, the job dies.
- **Cluster mode**: the driver runs inside the cluster. Suitable for production jobs started by schedulers.

Python dependencies are shipped with `--py-files` (zip or wheel files), with a packed virtual environment (`--archives` with venv-pack or conda-pack), or baked into a container image on Kubernetes. Java dependencies use `--jars` or `--packages` (Maven coordinates).

## Benefit
A packaged job submitted with explicit resources and dependencies is reproducible, which is what production needs and notebooks lack.

## Code snippet
```bash
spark-submit \
  --master yarn --deploy-mode cluster \
  --num-executors 10 --executor-cores 4 --executor-memory 8g \
  --conf spark.sql.shuffle.partitions=400 \
  --py-files dist/pipeline-1.4.0-py3-none-any.whl \
  --packages org.apache.spark:spark-avro_2.13:4.0.1 \
  jobs/load_orders.py --run-date 2025-10-15
```

## Limits and misconceptions
- Mismatched Python versions or library versions between driver and executors cause confusing errors; ship the environment.
- Settings can come from `spark-defaults.conf`, `spark-submit` flags and code; code wins over flags for most settings, and some settings only work at start-up.
- Managed platforms replace `spark-submit` with job definitions (Databricks jobs, Fabric Spark job definitions, EMR steps) but take the same ingredients.

## Remember this
spark-submit packages code, dependencies and resources into a job; use cluster mode for production.

## Related
pyspark-m12-packaging-config, fabric-m04-spark-job-definitions, pyspark-m10-resources-sizing


# Executor sizing and resources
id: pyspark-m10-resources-sizing
track: pyspark

## What we're learning
The main resource settings:
- `spark.executor.cores`: task slots per executor.
- `spark.executor.memory`: JVM heap per executor.
- `spark.executor.memoryOverhead`: off-heap memory per executor (JVM, native code, Python workers).
- `spark.executor.instances`, or dynamic allocation limits.
- `spark.driver.memory` and `spark.driver.cores`.

Common rules of thumb on self-managed clusters:
- About **4 to 5 cores per executor**: enough parallelism per JVM without long GC pauses or storage throughput contention.
- Leave a core and some memory per node for the operating system and daemons.
- Memory per core of roughly 4 to 8 GB for typical ETL; more for heavy joins and wide rows.
- Increase overhead for PySpark jobs with UDFs, pandas UDFs or Arrow.

## Benefit
Sensible sizing uses the hardware you pay for and avoids out-of-memory errors without wasting resources on huge executors.

## Limits and misconceptions
- More memory rarely fixes skew or a bad plan. Look at the Spark UI first.
- Total parallelism is executors times cores; it should be in proportion to the partition count.
- On managed platforms you pick node types and sizes instead of these settings, but the same ideas decide which node type to choose.
- A large driver is needed only if you collect data, broadcast large tables or build very large plans.

## Remember this
Size executors moderately (around 4 to 5 cores, enough memory and overhead per core) and fix plans before adding memory.

## Related
pyspark-m07-spill-memory-gc, pyspark-m07-partitions, pyspark-m10-dynamic-allocation


# Dynamic allocation and autoscaling
id: pyspark-m10-dynamic-allocation
track: pyspark

## What we're learning
With **dynamic allocation** (`spark.dynamicAllocation.enabled=true`), Spark requests more executors when tasks are waiting and releases idle ones after a timeout, between `minExecutors` and `maxExecutors`. Because released executors hold shuffle files, it needs either an **external shuffle service** (YARN, standalone) or **shuffle tracking** (`spark.dynamicAllocation.shuffleTracking.enabled`, common on Kubernetes).

Managed platforms add **cluster autoscaling**: the platform adds or removes whole worker nodes (Databricks autoscaling, Fabric custom pools with autoscale, Dataproc). Serverless offerings take this further, with no cluster to size at all.

## Benefit
One cluster or pool can serve both a tiny job and a large backfill, paying only for what each uses, and shared clusters return idle capacity to other users.

## Limits and misconceptions
- Scaling up takes time (requesting nodes, starting executors); short jobs may finish before new executors help.
- Executors with cached data are kept longer (`cachedExecutorIdleTimeout`), which can block scale-down.
- Streaming jobs with steady load gain little and can thrash; fixed sizing or streaming-specific autoscaling is often better.
- Autoscaling hides inefficiency: a badly written job scales up and costs more instead of failing.

## Remember this
Dynamic allocation adds and removes executors with demand; it needs shuffle files to survive executor removal.

## Related
pyspark-m10-managed-platforms, fabric-m04-spark-pools, databricks-m01-compute-types, pyspark-m07-stages-tasks-scheduler


# Managed Spark platforms compared
id: pyspark-m10-managed-platforms
track: pyspark

## What we're learning
Most organisations run Spark on a managed service rather than their own clusters:

- **Databricks** (AWS, Azure, GCP): Spark plus Photon, Delta Lake, Unity Catalog, notebooks, jobs and serverless compute. The most Spark-centric platform.
- **Microsoft Fabric**: Spark in a SaaS platform with starter pools, environments and a native execution engine, writing to OneLake.
- **Azure Synapse Analytics**: Spark pools in the earlier Azure analytics service; Microsoft directs new investment to Fabric.
- **Amazon EMR**: Spark (and Hadoop ecosystem tools) on EC2, on EKS, or as EMR Serverless; AWS Glue offers serverless Spark for ETL.
- **Google Cloud Dataproc**: managed Spark and Hadoop clusters, plus Serverless for Apache Spark.

## Benefit
Comparing them by operating model, not just features, helps choose where Spark code should run and what migration between them would involve.

## Compared with
| | Databricks | Fabric | EMR / Glue | Dataproc |
|---|---|---|---|---|
| Model | PaaS + serverless | SaaS | PaaS + serverless | PaaS + serverless |
| Clouds | AWS, Azure, GCP | Azure | AWS | GCP |
| Table format focus | Delta (Iceberg supported) | Delta (Iceberg virtualised) | Iceberg, Hudi, Delta | Iceberg, Delta |
| Catalog | Unity Catalog | OneLake catalog | Glue Data Catalog | Dataplex / BigLake metastore |
| Pricing | DBUs + cloud VMs | Capacity units | EC2 or per-use | VM or per-use |

## Limits and misconceptions
- PySpark DataFrame code is portable; platform utilities (dbutils, notebookutils), catalogs, security and orchestration are not.
- Runtime versions differ: check Spark and Delta versions before moving code.
- "Serverless" variants trade control (custom images, networking, Spark settings) for convenience.

## Remember this
Spark code moves easily between managed platforms; catalogs, utilities, security and cost models do not.

## Related
databricks-m01-compute-types, fabric-m04-spark-pools, fabric-m10-fabric-vs-databricks-vs-snowflake, tools-m11-cloud-map-process-orchestrate
