import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# Create the data
data = [
    {"Quarter": "Q1 2025", "Total_Supply": 2100000000, "Burned_Tokens": 0, "Tournament_Burns": 0, "Platform_Burns": 0, "Cumulative_Burned": 0},
    {"Quarter": "Q2 2025", "Total_Supply": 2085000000, "Burned_Tokens": 15000000, "Tournament_Burns": 12000000, "Platform_Burns": 3000000, "Cumulative_Burned": 15000000},
    {"Quarter": "Q3 2025", "Total_Supply": 2067000000, "Burned_Tokens": 18000000, "Tournament_Burns": 14500000, "Platform_Burns": 3500000, "Cumulative_Burned": 33000000},
    {"Quarter": "Q4 2025", "Total_Supply": 2046000000, "Burned_Tokens": 21000000, "Tournament_Burns": 17000000, "Platform_Burns": 4000000, "Cumulative_Burned": 54000000},
    {"Quarter": "Q1 2026", "Total_Supply": 2022000000, "Burned_Tokens": 24000000, "Tournament_Burns": 19500000, "Platform_Burns": 4500000, "Cumulative_Burned": 78000000},
    {"Quarter": "Q2 2026", "Total_Supply": 1995000000, "Burned_Tokens": 27000000, "Tournament_Burns": 22000000, "Platform_Burns": 5000000, "Cumulative_Burned": 105000000},
    {"Quarter": "Q3 2026", "Total_Supply": 1965000000, "Burned_Tokens": 30000000, "Tournament_Burns": 24500000, "Platform_Burns": 5500000, "Cumulative_Burned": 135000000},
    {"Quarter": "Q4 2026", "Total_Supply": 1932000000, "Burned_Tokens": 33000000, "Tournament_Burns": 27000000, "Platform_Burns": 6000000, "Cumulative_Burned": 168000000},
    {"Quarter": "Q1 2027", "Total_Supply": 1896000000, "Burned_Tokens": 36000000, "Tournament_Burns": 29500000, "Platform_Burns": 6500000, "Cumulative_Burned": 204000000},
    {"Quarter": "Q2 2027", "Total_Supply": 1857000000, "Burned_Tokens": 39000000, "Tournament_Burns": 32000000, "Platform_Burns": 7000000, "Cumulative_Burned": 243000000},
    {"Quarter": "Q3 2027", "Total_Supply": 1815000000, "Burned_Tokens": 42000000, "Tournament_Burns": 34500000, "Platform_Burns": 7500000, "Cumulative_Burned": 285000000},
    {"Quarter": "Q4 2027", "Total_Supply": 1770000000, "Burned_Tokens": 45000000, "Tournament_Burns": 37000000, "Platform_Burns": 8000000, "Cumulative_Burned": 330000000},
    {"Quarter": "Q1 2028", "Total_Supply": 1722000000, "Burned_Tokens": 48000000, "Tournament_Burns": 39500000, "Platform_Burns": 8500000, "Cumulative_Burned": 378000000},
    {"Quarter": "Q2 2028", "Total_Supply": 1671000000, "Burned_Tokens": 51000000, "Tournament_Burns": 42000000, "Platform_Burns": 9000000, "Cumulative_Burned": 429000000},
    {"Quarter": "Q3 2028", "Total_Supply": 1617000000, "Burned_Tokens": 54000000, "Tournament_Burns": 44500000, "Platform_Burns": 9500000, "Cumulative_Burned": 483000000},
    {"Quarter": "Q4 2028", "Total_Supply": 1560000000, "Burned_Tokens": 57000000, "Tournament_Burns": 47000000, "Platform_Burns": 10000000, "Cumulative_Burned": 540000000},
    {"Quarter": "Q1 2029", "Total_Supply": 1500000000, "Burned_Tokens": 60000000, "Tournament_Burns": 49500000, "Platform_Burns": 10500000, "Cumulative_Burned": 600000000},
    {"Quarter": "Q2 2029", "Total_Supply": 1437000000, "Burned_Tokens": 63000000, "Tournament_Burns": 52000000, "Platform_Burns": 11000000, "Cumulative_Burned": 663000000},
    {"Quarter": "Q3 2029", "Total_Supply": 1371000000, "Burned_Tokens": 66000000, "Tournament_Burns": 54500000, "Platform_Burns": 11500000, "Cumulative_Burned": 729000000},
    {"Quarter": "Q4 2029", "Total_Supply": 1350000000, "Burned_Tokens": 21000000, "Tournament_Burns": 17000000, "Platform_Burns": 4000000, "Cumulative_Burned": 750000000}
]

df = pd.DataFrame(data)

# Convert to billions for readability
df['Total_Supply_B'] = df['Total_Supply'] / 1e9
df['Cumulative_Burned_B'] = df['Cumulative_Burned'] / 1e9
df['Tournament_Burns_B'] = df['Tournament_Burns'] / 1e6  # in millions
df['Platform_Burns_B'] = df['Platform_Burns'] / 1e6  # in millions

fig = go.Figure()

# Add total supply line
fig.add_trace(go.Scatter(
    x=df['Quarter'],
    y=df['Total_Supply_B'],
    mode='lines+markers',
    name='Total Supply',
    line=dict(color='#1FB8CD', width=3),
    marker=dict(size=8),
    hovertemplate='%{y:.2f}B tokens<extra></extra>'
))

# Add cumulative burned area
fig.add_trace(go.Scatter(
    x=df['Quarter'],
    y=df['Cumulative_Burned_B'],
    mode='lines+markers',
    name='Cumulative Burned',
    line=dict(color='#DB4545', width=3),
    marker=dict(size=8),
    fill='tonexty',
    fillcolor='rgba(219, 69, 69, 0.2)',
    hovertemplate='%{y:.2f}B tokens<extra></extra>'
))

# Add tournament burns as bars
fig.add_trace(go.Bar(
    x=df['Quarter'],
    y=df['Tournament_Burns_B'],
    name='Tournament Burns',
    marker_color='#2E8B57',
    opacity=0.7,
    yaxis='y2',
    hovertemplate='%{y:.0f}M tokens<extra></extra>'
))

# Add platform burns as bars
fig.add_trace(go.Bar(
    x=df['Quarter'],
    y=df['Platform_Burns_B'],
    name='Platform Burns',
    marker_color='#5D878F',
    opacity=0.7,
    yaxis='y2',
    hovertemplate='%{y:.0f}M tokens<extra></extra>'
))

fig.update_layout(
    title='Token Burn Mechanism: 5-Year Supply Reduction',
    xaxis_title='Quarter',
    yaxis=dict(
        title='Supply (Billions)',
        side='left'
    ),
    yaxis2=dict(
        title='Quarterly Burns (Millions)',
        side='right',
        overlaying='y',
        showgrid=False
    ),
    legend=dict(orientation='h', yanchor='bottom', y=1.05, xanchor='center', x=0.5),
    hovermode='x unified'
)

fig.update_xaxes(tickangle=45)
fig.update_traces(cliponaxis=False)

# Save as PNG and SVG
fig.write_image("token_burn_chart.png")
fig.write_image("token_burn_chart.svg", format="svg")