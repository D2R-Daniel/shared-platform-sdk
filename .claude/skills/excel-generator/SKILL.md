# Excel Generator Skill

## Purpose
Generate Excel reports from SDK data using openpyxl (Python) or similar libraries.

## When to Use
- When generating reports from API data
- When exporting data to Excel format
- When creating data analysis templates

## Python Implementation (openpyxl)

### Basic Usage
```python
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils.dataframe import dataframe_to_rows
import pandas as pd

def create_report(data: list[dict], filename: str) -> str:
    wb = Workbook()
    ws = wb.active
    ws.title = "Report"

    # Header style
    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="4472C4", fill_type="solid")

    # Write headers
    headers = list(data[0].keys()) if data else []
    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center")

    # Write data
    for row_idx, row_data in enumerate(data, 2):
        for col_idx, header in enumerate(headers, 1):
            ws.cell(row=row_idx, column=col_idx, value=row_data.get(header))

    # Auto-fit columns
    for col in ws.columns:
        max_length = max(len(str(cell.value or "")) for cell in col)
        ws.column_dimensions[col[0].column_letter].width = max_length + 2

    wb.save(filename)
    return filename
```

### With Pandas
```python
def dataframe_to_excel(df: pd.DataFrame, filename: str, sheet_name: str = "Data") -> str:
    with pd.ExcelWriter(filename, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name=sheet_name, index=False)

        # Get workbook and worksheet
        workbook = writer.book
        worksheet = writer.sheets[sheet_name]

        # Style header row
        header_fill = PatternFill(start_color="4472C4", fill_type="solid")
        header_font = Font(bold=True, color="FFFFFF")

        for cell in worksheet[1]:
            cell.fill = header_fill
            cell.font = header_font

    return filename
```

## Report Types

### User List Report
```python
def generate_user_report(users: list[User]) -> str:
    data = [
        {
            "ID": u.id,
            "Name": u.name,
            "Email": u.email,
            "Status": "Active" if u.is_active else "Inactive",
            "Created": u.created_at.strftime("%Y-%m-%d")
        }
        for u in users
    ]
    return create_report(data, "users_report.xlsx")
```

### API Key Usage Report
```python
def generate_api_key_usage_report(keys: list[APIKey]) -> str:
    wb = Workbook()
    ws = wb.active
    ws.title = "API Key Usage"

    # Summary section
    ws["A1"] = "API Key Usage Report"
    ws["A1"].font = Font(bold=True, size=16)

    ws["A3"] = "Generated:"
    ws["B3"] = datetime.now().strftime("%Y-%m-%d %H:%M")

    # Data table
    headers = ["Key Name", "Prefix", "Requests", "Last Used", "Status"]
    for col, header in enumerate(headers, 1):
        ws.cell(row=5, column=col, value=header)

    for row, key in enumerate(keys, 6):
        ws.cell(row=row, column=1, value=key.name)
        ws.cell(row=row, column=2, value=key.key_prefix)
        ws.cell(row=row, column=3, value=key.request_count)
        ws.cell(row=row, column=4, value=key.last_used_at)
        ws.cell(row=row, column=5, value="Active" if key.is_active else "Revoked")

    wb.save("api_key_usage.xlsx")
    return "api_key_usage.xlsx"
```

## Styling Guide

### Colors
```python
# Standard colors
HEADER_BLUE = "4472C4"
SUCCESS_GREEN = "70AD47"
WARNING_YELLOW = "FFC000"
ERROR_RED = "C00000"
LIGHT_GRAY = "F2F2F2"
```

### Common Styles
```python
# Header style
header_style = {
    "font": Font(bold=True, color="FFFFFF"),
    "fill": PatternFill(start_color=HEADER_BLUE, fill_type="solid"),
    "alignment": Alignment(horizontal="center", vertical="center"),
    "border": Border(
        bottom=Side(style="thin", color="000000")
    )
}

# Alternating row style
alt_row_fill = PatternFill(start_color=LIGHT_GRAY, fill_type="solid")
```

## Multi-Sheet Reports

```python
def create_multi_sheet_report(
    users: list[User],
    teams: list[Team],
    api_keys: list[APIKey]
) -> str:
    wb = Workbook()

    # Users sheet
    ws_users = wb.active
    ws_users.title = "Users"
    write_data_to_sheet(ws_users, users_to_rows(users))

    # Teams sheet
    ws_teams = wb.create_sheet("Teams")
    write_data_to_sheet(ws_teams, teams_to_rows(teams))

    # API Keys sheet
    ws_keys = wb.create_sheet("API Keys")
    write_data_to_sheet(ws_keys, api_keys_to_rows(api_keys))

    filename = f"report_{datetime.now().strftime('%Y%m%d')}.xlsx"
    wb.save(filename)
    return filename
```

## Charts

```python
from openpyxl.chart import BarChart, Reference

def add_chart(ws, data_range: str, title: str):
    chart = BarChart()
    chart.title = title
    chart.type = "col"

    data = Reference(ws, range_string=data_range)
    chart.add_data(data, titles_from_data=True)

    ws.add_chart(chart, "E2")
```

## Dependencies

```toml
# pyproject.toml
[tool.poetry.dependencies]
openpyxl = "^3.1.0"
pandas = "^2.0.0"  # Optional, for DataFrame support
```
