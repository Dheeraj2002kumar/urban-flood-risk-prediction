"""Convert concept-note.md to an executive, publication-grade concept-note.pdf using headless Chrome.
Applies executive corporate/academic styling using the project color palette:
  - Deep Navy: #112E81
  - Royal Purple: #4647AE
  - Cerulean Blue: #4382DF
  - Sea Mist: #AACCD6
"""

import os
import re
import subprocess
import markdown

def convert_md_to_html(md_path="concept-note.md", html_path="concept-note.html"):
    with open(md_path, "r", encoding="utf-8") as f:
        md_text = f.read()

    # Pre-process math equations for clean typography
    md_text = md_text.replace(
        r"$$I_{ratio} = \frac{\text{rain\_1h\_mm}}{\max(\text{rain\_24h\_mm}, 1.0)}$$",
        '<div class="formula-box"><strong>Rainfall Intensity Ratio:</strong> <em>I<sub>ratio</sub></em> = rain_1h_mm / max(rain_24h_mm, 1.0)</div>'
    )
    md_text = md_text.replace(
        r"$$S_{antecedent} = 0.6 \times \text{rain\_24h\_mm} + 0.4 \times (\text{rain\_72h\_mm} - \text{rain\_24h\_mm})$$",
        '<div class="formula-box"><strong>Antecedent Soil Saturation:</strong> <em>S<sub>antecedent</sub></em> = 0.6 × rain_24h_mm + 0.4 × (rain_72h_mm - rain_24h_mm)</div>'
    )
    md_text = md_text.replace(
        r"$$TWP = \frac{1.0}{\max(\text{elevation\_m}, 0.5) \times (\text{slope\_deg} + 0.5)}$$",
        '<div class="formula-box"><strong>Topographic Wetness Proxy:</strong> <em>TWP</em> = 1.0 / [max(elevation_m, 0.5) × (slope_deg + 0.5)]</div>'
    )
    md_text = md_text.replace(
        r"$$WPF = \frac{1000.0}{\text{dist\_water\_m} + 10.0}$$",
        '<div class="formula-box"><strong>Waterbody Proximity Factor:</strong> <em>WPF</em> = 1000.0 / (dist_water_m + 10.0)</div>'
    )
    md_text = md_text.replace(
        r"$$D_{deficit} = \frac{\text{impervious\_pct}}{100.0} \times (1.0 - \text{drainage\_index})$$",
        '<div class="formula-box"><strong>Drainage Deficit:</strong> <em>D<sub>deficit</sub></em> = (impervious_pct / 100.0) × (1.0 - drainage_index)</div>'
    )

    # Replace mermaid block with clean HTML flow diagram
    mermaid_pattern = re.compile(r"```mermaid.*?```", re.DOTALL)
    mermaid_replacement = """
    <div class="flowchart-container">
      <div class="flow-step">
        <span class="flow-title">1. Multi-Source Ingestion</span>
        <span class="flow-desc">Rainfall (IMD AWS), Copernicus DEM (30m), OSM Waterways & Drainage Indices</span>
      </div>
      <div class="flow-arrow">➔</div>
      <div class="flow-step">
        <span class="flow-title">2. Domain Feature Engineering</span>
        <span class="flow-desc">Soil Saturation, Topographic Wetness, Runoff & Drainage Deficit Proxies</span>
      </div>
      <div class="flow-arrow">➔</div>
      <div class="flow-step">
        <span class="flow-title">3. Calibrated ML Inference</span>
        <span class="flow-desc">Zero-Leakage Random Forest & XGBoost with &lt;50ms Latency</span>
      </div>
      <div class="flow-arrow">➔</div>
      <div class="flow-step">
        <span class="flow-title">4. Municipal Action & Impact</span>
        <span class="flow-desc">Ward Pump Positioning, Subway Closure Alerts, Resilience (SDG 11.5 &amp; 13.1)</span>
      </div>
    </div>
    """
    md_text = mermaid_pattern.sub(mermaid_replacement, md_text)

    # Convert Markdown to HTML
    body_html = markdown.markdown(
        md_text,
        extensions=["tables", "fenced_code", "nl2br", "attr_list"]
    )

    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Urban Flood Risk Prediction System — Project Concept Note</title>
  <style>
    @page {{
      size: A4;
      margin: 18mm 16mm 18mm 16mm;
      @bottom-center {{
        content: "Urban Flood Risk Prediction System — Project Concept Note";
        font-size: 8pt;
        color: #7f9bac;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }}
      @bottom-right {{
        content: "Page " counter(page);
        font-size: 8pt;
        color: #112e81;
        font-weight: 600;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }}
    }}

    * {{
      box-sizing: border-box;
    }}

    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.55;
      color: #1e293b;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }}

    /* Top Executive Cover Banner */
    .header-banner {{
      background: linear-gradient(135deg, #112e81 0%, #4647ae 55%, #4382df 100%);
      color: #ffffff;
      padding: 24px 28px;
      border-radius: 8px;
      margin-bottom: 22px;
      box-shadow: 0 4px 12px rgba(17, 46, 129, 0.15);
    }}

    .header-banner h1 {{
      margin: 0 0 6px 0;
      font-size: 20pt;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #ffffff;
    }}

    .header-banner .subtitle {{
      font-size: 11.5pt;
      color: #aaccd6;
      font-weight: 500;
      margin: 0 0 10px 0;
    }}

    .header-banner .meta-tags {{
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }}

    .meta-tag {{
      background: rgba(255, 255, 255, 0.18);
      border: 1px solid rgba(170, 204, 214, 0.35);
      border-radius: 4px;
      padding: 3px 8px;
      font-size: 8pt;
      font-weight: 600;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }}

    h1, h2, h3, h4 {{
      color: #112e81;
      font-weight: 700;
      letter-spacing: -0.01em;
      page-break-after: avoid;
    }}

    h2 {{
      font-size: 13.5pt;
      margin-top: 24px;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 2px solid #4382df;
      color: #112e81;
    }}

    h3 {{
      font-size: 11pt;
      margin-top: 14px;
      margin-bottom: 6px;
      color: #4647ae;
    }}

    p {{
      margin-top: 0;
      margin-bottom: 10px;
      text-align: justify;
    }}

    ul, ol {{
      margin-top: 0;
      margin-bottom: 12px;
      padding-left: 20px;
    }}

    li {{
      margin-bottom: 4px;
    }}

    /* Tables */
    table {{
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      margin-bottom: 16px;
      font-size: 8.5pt;
      page-break-inside: avoid;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
    }}

    th {{
      background: #112e81;
      color: #ffffff;
      font-weight: 600;
      text-align: left;
      padding: 7px 10px;
      border: 1px solid #112e81;
    }}

    td {{
      padding: 6px 10px;
      border: 1px solid #e2e8f0;
      color: #334155;
    }}

    tr:nth-child(even) {{
      background-color: #f8fafc;
    }}

    tr:hover {{
      background-color: #f1f5f9;
    }}

    strong {{
      color: #0f172a;
    }}

    /* Formulas */
    .formula-box {{
      background: #f0f7ff;
      border-left: 4px solid #4382df;
      border-radius: 0 4px 4px 0;
      padding: 8px 12px;
      margin: 8px 0 12px 0;
      font-size: 8.8pt;
      color: #1e3a8a;
    }}

    /* Flowchart */
    .flowchart-container {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 12px 8px;
      margin: 14px 0;
      page-break-inside: avoid;
    }}

    .flow-step {{
      flex: 1;
      background: #ffffff;
      border: 1px solid #4382df;
      border-radius: 6px;
      padding: 8px 6px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }}

    .flow-title {{
      display: block;
      font-size: 8pt;
      font-weight: 700;
      color: #112e81;
      margin-bottom: 3px;
    }}

    .flow-desc {{
      display: block;
      font-size: 7pt;
      color: #64748b;
      line-height: 1.3;
    }}

    .flow-arrow {{
      font-size: 12pt;
      font-weight: bold;
      color: #4647ae;
      flex-shrink: 0;
    }}

    hr {{
      border: none;
      height: 1px;
      background: #e2e8f0;
      margin: 18px 0;
    }}

    code {{
      background: #f1f5f9;
      color: #4647ae;
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 8.5pt;
      font-family: ui-monospace, Menlo, Monaco, monospace;
    }}

    blockquote {{
      margin: 10px 0;
      padding: 8px 14px;
      background: #f8fafc;
      border-left: 4px solid #4647ae;
      color: #475569;
      font-style: italic;
    }}
  </style>
</head>
<body>

  <div class="header-banner">
    <h1>URBAN FLOOD RISK PREDICTION SYSTEM</h1>
    <div class="subtitle">Physics-Grounded Machine Learning &amp; Geospatial Analytics Platform for Climate-Resilient Cities</div>
    <div class="meta-tags">
      <span class="meta-tag">SDG 11: Sustainable Cities</span>
      <span class="meta-tag">SDG 13: Climate Action</span>
      <span class="meta-tag">Pilot: Greater Mumbai</span>
      <span class="meta-tag">FastAPI &amp; Leaflet GIS</span>
      <span class="meta-tag">Random Forest (91.0% Recall)</span>
    </div>
  </div>

  {body_html}

</body>
</html>
"""

    with open(html_path, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"Generated HTML: {html_path}")
    return html_path

def convert_html_to_pdf(html_path="concept-note.html", pdf_path="concept-note.pdf"):
    abs_html = os.path.abspath(html_path)
    abs_pdf = os.path.abspath(pdf_path)
    chrome_bin = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

    cmd = [
        chrome_bin,
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={abs_pdf}",
        f"file://{abs_html}"
    ]

    print(f"Running Chrome print-to-pdf: {' '.join(cmd)}")
    subprocess.run(cmd, check=True)
    print(f"Generated PDF: {abs_pdf}")

    # Copy to docs/
    docs_pdf = os.path.join("docs", "concept-note.pdf")
    import shutil
    shutil.copyfile(pdf_path, docs_pdf)
    print(f"Copied to: {docs_pdf}")

if __name__ == "__main__":
    convert_md_to_html("concept-note.md", "concept-note.html")
    convert_html_to_pdf("concept-note.html", "concept-note.pdf")
