import plotly.express as px
import pandas as pd

# Data for the tokenomics distribution with specified colors
data = [
    {"category": "ICO Sale", "percentage": 40, "tokens": "840M", "amount": 840000000, "color": "#4CAF50"},
    {"category": "Team & Advisor", "percentage": 15, "tokens": "315M", "amount": 315000000, "color": "#FF9800"},
    {"category": "Marketing & Prt", "percentage": 10, "tokens": "210M", "amount": 210000000, "color": "#2196F3"},
    {"category": "Dev & Ops", "percentage": 15, "tokens": "315M", "amount": 315000000, "color": "#9C27B0"},
    {"category": "Game Rewards", "percentage": 15, "tokens": "315M", "amount": 315000000, "color": "#F44336"},
    {"category": "Reserve Fund", "percentage": 5, "tokens": "105M", "amount": 105000000, "color": "#607D8B"}
]

df = pd.DataFrame(data)

# Use the specified colors from the data
colors = df['color'].tolist()

fig = px.pie(df, 
             values='percentage', 
             names='category',
             title='GTK Token Distribution (2.1B Total)',
             color_discrete_sequence=colors)

# Update traces to show percentage and token amount in labels
# Use textposition to improve label placement for smaller slices
fig.update_traces(
    textinfo='label+percent',
    texttemplate='%{label}<br>%{percent}<br>%{customdata}',
    customdata=df['tokens'],
    textposition='inside',
    pull=[0.05 if x < 10 else 0 for x in df['percentage']]  # Pull smaller slices slightly out
)

# Apply uniform text styling for pie chart labels
fig.update_layout(uniformtext_minsize=12, uniformtext_mode='hide')

# Save as both PNG and SVG
fig.write_image("tokenomics_chart.png")
fig.write_image("tokenomics_chart.svg", format="svg")

fig.show()