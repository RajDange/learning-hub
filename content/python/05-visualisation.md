# matplotlib and seaborn
id: python-m05-matplotlib-seaborn
track: python

## What we're learning
- **matplotlib** is Python's foundational plotting library. A **Figure** contains one or more **Axes** (plots); you draw lines, bars, scatters and histograms on axes and control every detail (labels, ticks, colours, layout). The explicit object style (`fig, ax = plt.subplots()`) is clearer than the implicit `plt.plot` state machine.
- **seaborn** sits on top of matplotlib and specialises in **statistical plots** from DataFrames: distributions (`histplot`, `kdeplot`, `boxplot`), relationships (`scatterplot`, `regplot`), categorical comparisons, and faceting by columns, with sensible defaults. Its newer `seaborn.objects` interface offers a composable grammar.

pandas' `.plot()` also uses matplotlib.

## Benefit
Static, publication-quality charts for analysis, reports and notebooks, with seaborn making exploratory statistical views quick.

## Code snippet
```python
import matplotlib.pyplot as plt
import seaborn as sns

fig, axes = plt.subplots(1, 2, figsize=(10, 4))
sns.histplot(data=orders, x="amount", hue="region", bins=40, ax=axes[0])
sns.boxplot(data=orders, x="region", y="amount", ax=axes[1])
axes[0].set_title("Order amount distribution")
fig.tight_layout()
fig.savefig("orders.png", dpi=150)
```

## Limits and misconceptions
- Static images are not interactive; for exploration with hover and zoom, use Plotly.
- Plotting millions of points is slow and unreadable; aggregate or sample first.
- Default colours are not always accessible; choose colour-blind-safe palettes.

## Remember this
matplotlib draws anything with full control; seaborn makes statistical plots from DataFrames quickly on top of it.

## Related
python-m05-plotly, python-m05-choosing-a-library, python-m06-eda-workflow


# Plotly
id: python-m05-plotly
track: python

## What we're learning
**Plotly** produces **interactive** charts (hover, zoom, pan, toggle series) rendered in the browser with JavaScript. **Plotly Express** creates common charts from a DataFrame in one call (`px.line`, `px.scatter`, `px.bar`, `px.histogram`, maps); the lower-level `graph_objects` API customises everything. Charts can be saved as standalone HTML.

**Dash** builds full web dashboards and apps in Python on top of Plotly; Streamlit is a popular simpler alternative for data apps.

## Benefit
Interactive exploration in notebooks and lightweight internal apps without writing JavaScript.

## Code snippet
```python
import plotly.express as px

fig = px.line(daily, x="date", y="revenue", color="region",
              title="Daily revenue by region")
fig.write_html("revenue.html")
```

## Limits and misconceptions
- Very large datasets make interactive charts heavy in the browser; aggregate first.
- A Dash or Streamlit app is software to host, secure and maintain; for governed, widely shared reporting a BI tool is usually better.

## Remember this
Plotly makes interactive browser charts from DataFrames, and Dash or Streamlit turn them into data apps.

## Related
python-m05-choosing-a-library, python-m05-matplotlib-seaborn, tools-m08-power-bi


# Choosing a visualisation library
id: python-m05-choosing-a-library
track: python

## What we're learning
Pick the tool by **audience** and **lifetime** of the chart:

| Need | Good choice |
|---|---|
| Quick look during analysis | pandas `.plot()`, seaborn |
| Static chart for a document or paper | matplotlib, seaborn |
| Interactive exploration in a notebook | Plotly |
| Small internal data app | Streamlit, Dash |
| Governed reporting for many business users | Power BI, Tableau, platform dashboards |
| Live operational monitoring | Real-time dashboards, Grafana-style tools |

Other libraries: Altair (declarative grammar of graphics), Bokeh (interactive), and plotting built into Polars and PySpark (Spark 4 added DataFrame plotting).

## Benefit
Choosing by audience avoids two common failures: business users depending on a notebook chart nobody maintains, and analysts fighting a BI tool for a one-off exploration.

## Limits and misconceptions
- A chart in a notebook is not a product; if others rely on it, move it to a maintained tool with ownership.
- Whatever the library, the rules of good charts (clear titles, honest axes, few colours, the right chart type) matter more.

## Remember this
Use Python libraries for analysis and small apps, and BI tools for governed reporting used by many people.

## Related
tools-m08-power-bi, python-m05-plotly, python-m08-notebooks-vs-scripts
