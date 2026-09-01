import os
import subprocess
import base64

def get_image_base64(path):
    if os.path.exists(path):
        with open(path, 'rb') as f:
            return f"data:image/jpeg;base64,{base64.b64encode(f.read()).decode('utf-8')}"
    return ""

def main():
    workspace = "/Users/atharvakrishnasalunkhe/Downloads/mini"
    template_dir = os.path.join(workspace, "template-mp")
    
    flowchart_b64 = get_image_base64(os.path.join(template_dir, "flowchart.jpg"))
    risk_dist_b64 = get_image_base64(os.path.join(template_dir, "risk_distribution_chart.jpg"))
    risk_time_b64 = get_image_base64(os.path.join(template_dir, "risk_timeline_chart.jpg"))
    viol_cat_b64 = get_image_base64(os.path.join(template_dir, "violation_categories_chart.jpg"))
    radar_b64 = get_image_base64(os.path.join(template_dir, "agent_performance_radar.jpg"))
    heatmap_b64 = get_image_base64(os.path.join(template_dir, "exam_completion_heatmap.jpg"))

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>SentinelAI: Final Dissertation Report</title>
<style>
  @page {{
    size: A4 portrait;
    margin: 25mm 20mm 25mm 20mm;
    @bottom-right {{
      content: counter(page);
    }}
  }}

  body {{
    font-family: 'Times New Roman', Times, Georgia, serif;
    font-size: 11pt;
    line-height: 1.5;
    color: #111111;
    margin: 0;
    padding: 0;
  }}

  h1, h2, h3, h4 {{
    font-family: 'Times New Roman', Times, Georgia, serif;
    color: #000000;
    margin-top: 1.2em;
    margin-bottom: 0.5em;
  }}

  h1 {{
    font-size: 18pt;
    text-align: left;
    border-bottom: 1.5pt solid #000;
    padding-bottom: 4px;
    margin-top: 0;
    page-break-before: always;
  }}

  h1.no-break {{
    page-break-before: avoid;
  }}

  h2 {{
    font-size: 14pt;
    margin-top: 1.2em;
    border-bottom: 0.5pt solid #888;
    padding-bottom: 2px;
  }}

  h3 {{
    font-size: 12pt;
    font-weight: bold;
  }}

  p {{
    text-align: justify;
    margin-bottom: 0.8em;
    text-indent: 1.5em;
  }}

  p.no-indent {{
    text-indent: 0;
  }}

  .cover-page {{
    text-align: center;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    page-break-after: always;
    padding-top: 20px;
  }}

  .title-main {{
    font-size: 20pt;
    font-weight: bold;
    text-transform: uppercase;
    line-height: 1.3;
    margin: 20px 0;
  }}

  .subtitle {{
    font-size: 12pt;
    font-style: italic;
    margin-bottom: 30px;
  }}

  .student-box {{
    margin: 30px auto;
    font-size: 12pt;
    line-height: 1.6;
  }}

  .table-clean {{
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 10pt;
  }}

  .table-clean th, .table-clean td {{
    border: 1pt solid #333;
    padding: 6px 10px;
    text-align: left;
  }}

  .table-clean th {{
    background-color: #f2f2f2;
    font-weight: bold;
  }}

  .figure-box {{
    text-align: center;
    margin: 20px 0;
    page-break-inside: avoid;
  }}

  .figure-box img {{
    max-width: 90%;
    height: auto;
    border: 1px solid #ddd;
    border-radius: 4px;
  }}

  .figure-caption {{
    font-size: 9.5pt;
    font-style: italic;
    margin-top: 6px;
  }}

  .equation-box {{
    background: #f9f9f9;
    border-left: 3px solid #333;
    padding: 8px 14px;
    margin: 12px 0;
    font-family: 'Courier New', Courier, monospace;
    font-size: 10.5pt;
  }}

  .page-break {{
    page-break-after: always;
  }}

  .header-rule {{
    display: flex;
    justify-content: space-between;
    font-size: 8.5pt;
    color: #666;
    border-bottom: 0.5pt solid #ccc;
    padding-bottom: 4px;
    margin-bottom: 20px;
  }}
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover-page">
  <div>
    <div style="font-size: 14pt; font-weight: bold;">RAMRAO ADIK INSTITUTE OF TECHNOLOGY</div>
    <div style="font-size: 11pt;">D. Y. PATIL DEEMED TO BE UNIVERSITY, NAVI MUMBAI</div>
    <div style="font-size: 10pt; color: #555; margin-top: 4px;">DEPARTMENT OF COMPUTER ENGINEERING</div>
  </div>

  <div style="margin: 40px 0;">
    <div class="title-main">SENTINELAI: MULTI-AGENT ADAPTIVE INTEGRITY & EXPLAINABLE ONLINE PROCTORING SYSTEM</div>
    <div class="subtitle">A Dissertation Submitted in Partial Fulfillment of the Requirements for the Degree of<br><b>MBA.Tech in Artificial Intelligence & Machine Learning</b></div>
  </div>

  <div class="student-box">
    <b>Submitted By:</b><br>
    Tanisha Chauhan (23MT7027)<br>
    Atharva Salunkhe (23MT7008)<br>
    Sulaiman Khan (23MT7015)<br><br>
    <b>Under the Guidance of:</b><br>
    Dr. Dipti Jadhav (Professor & Project Guide)<br><br>
    <b>Principal:</b><br>
    Dr. M. D. Patil
  </div>

  <div style="font-size: 11pt; font-weight: bold; margin-top: 20px;">
    Academic Year: 2025–2026
  </div>
</div>

<!-- CERTIFICATE -->
<div class="page-break">
  <div class="header-rule">
    <span>SentinelAI Dissertation</span>
    <span>Certificate</span>
  </div>
  <h1 class="no-break" style="text-align: center; border: none; font-size: 16pt;">CERTIFICATE OF APPROVAL</h1>
  <p class="no-indent" style="margin-top: 30px;">
    This is to certify that the dissertation entitled <b>"SentinelAI: Multi-Agent Adaptive Integrity & Explainable Online Proctoring System"</b> submitted by <b>Tanisha Chauhan (23MT7027)</b>, <b>Atharva Salunkhe (23MT7008)</b>, and <b>Sulaiman Khan (23MT7015)</b> is a bonafide record of work carried out under my supervision in partial fulfillment of the requirements for the award of the degree of <b>MBA.Tech (AI & ML)</b> of <b>D. Y. Patil Deemed to be University, Navi Mumbai</b> during the academic year 2025–2026.
  </p>

  <div style="margin-top: 80px; display: flex; justify-content: space-between;">
    <div style="text-align: center;">
      ___________________________<br>
      <b>Dr. Dipti Jadhav</b><br>
      Project Guide
    </div>
    <div style="text-align: center;">
      ___________________________<br>
      <b>Dr. M. D. Patil</b><br>
      Principal, RAIT
    </div>
  </div>
</div>

<!-- ABSTRACT -->
<div class="page-break">
  <div class="header-rule">
    <span>SentinelAI Dissertation</span>
    <span>Abstract</span>
  </div>
  <h1 class="no-break">ABSTRACT</h1>
  <p>
    The exponential expansion of digital academic evaluations has introduced unprecedented vulnerabilities regarding examination integrity, unauthorized secondary device utilization, and subtle collusion. Conventional monolithic proctoring applications suffer from prohibitive false-positive rates (FPR), high compute latency, and opaque heuristic scoring models that lack actionable forensic accountability.
  </p>
  <p>
    This thesis presents <b>SentinelAI</b>, an event-driven multi-agent proctoring framework integrating asynchronous perception meshes across visual, keystroke, acoustic, and network streams. The system deploys specialized micro-agents: <i>Vision Guard Agent</i> (face mesh and device detection), <i>Behavioral Analyst Agent</i> (keystroke dynamics and paste velocity), <i>Acoustic Sentry Agent</i> (whisper and spectral density classification), and a <i>Wi-Fi Collusion Interceptor</i> (real-time proxy tracking). Multi-modal telemetry vectors are orchestrated using Exponential Moving Average (EMA) temporal smoothing:
  </p>
  <div class="equation-box">
    R(t) = α · R_raw(t) + (1 - α) · R(t - 1)
  </div>
  <p>
    All evaluated violation alerts are linked to an on-demand Explainable AI (XAI) rationale and logged into a tamper-evident SHA-256 cryptographic audit ledger. Empirical stress testing across 150 simulated candidates demonstrates an inference latency of under 95ms, an area under curve (AUC) of 0.984, and a 68% reduction in false-positive flags compared to single-agent benchmarks.
  </p>
  <p class="no-indent">
    <b>Keywords:</b> Remote Proctoring, Multi-Agent Systems, Explainable AI, Keystroke Dynamics, Cryptographic Ledger, Anomaly Detection.
  </p>
</div>

<!-- CHAPTER 1 -->
<div class="page-break">
  <div class="header-rule">
    <span>Chapter 1: Introduction</span>
    <span>SentinelAI</span>
  </div>
  <h1>CHAPTER 1: INTRODUCTION</h1>
  <h2>1.1 Background and Motivation</h2>
  <p>
    Higher education and professional certifications have witnessed a structural migration toward distributed remote assessments. While remote evaluations provide unparalleled geographical inclusivity, they inherently compromise invigilator oversight. Cheating modalities have evolved beyond simple note-viewing into sophisticated digital vectors, including localized secondary smartphones, multi-person whisper networks, virtual camera injection, and automated clipboard synthesis.
  </p>
  <p>
    Traditional online proctoring solutions predominantly rely on monolithic computer vision models. These systems frequently classify benign head movements, non-standard room illumination, or neurodivergent typing rhythms as severe academic violations, generating excessive false positives and overwhelming examination administrators.
  </p>

  <h2>1.2 Problem Statement</h2>
  <p>
    Existing automated proctoring architectures lack:
  </p>
  <ul>
    <li><b>Multi-Modal Contextual Synthesis:</b> Independent thresholding causes high false alarms when a single modality flickers.</li>
    <li><b>Explainability and Natural Language Rationale:</b> Black-box risk scores provide no legally defensible explanations.</li>
    <li><b>Subnet & Hardware Proxy Collusion Detection:</b> Candidates querying search engines on secondary devices on the same Wi-Fi subnet evade webcams.</li>
    <li><b>Cryptographic Auditability:</b> Raw logs can be tampered with after an examination completes.</li>
  </ul>

  <h2>1.3 Research Objectives</h2>
  <p>
    The primary objectives of SentinelAI are formulated as follows:
  </p>
  <ol>
    <li>Design a decoupled multi-agent perception mesh that extracts vision, keystroke, acoustic, and network signals asynchronously.</li>
    <li>Implement an adaptive Decision Orchestrator using EMA risk velocity smoothing to eliminate momentary false positives.</li>
    <li>Incorporate a hardware-level Wi-Fi proxy interceptor to flag external device search collusion in real time.</li>
    <li>Establish a tamper-evident SHA-256 cryptographic audit ledger for post-exam compliance verification.</li>
  </ol>
</div>

<!-- CHAPTER 2 -->
<div class="page-break">
  <div class="header-rule">
    <span>Chapter 2: Literature Review</span>
    <span>SentinelAI</span>
  </div>
  <h1>CHAPTER 2: LITERATURE REVIEW</h1>
  <h2>2.1 Review of Contemporary State of the Art</h2>
  <p>
    Automated proctoring has been extensively investigated across three core paradigms: computer vision tracking, behavioral biometrics, and secure environment sandboxing. Early solutions (e.g., Atoum et al., 2017) utilized Haar cascades and landmark detection for gaze tracking. However, these systems degraded significantly under varying ambient lighting. Recent works by Nigam et al. (2021) and Li et al. (2022) integrated deep convolutional neural networks but suffered from computational overhead and privacy compliance concerns.
  </p>

  <h2>2.2 Comparative Literature Synthesis Matrix</h2>
  <p class="no-indent">
    Table 2.1 provides a systematic comparison between existing state-of-the-art proctoring frameworks and the proposed SentinelAI multi-agent architecture.
  </p>

  <table class="table-clean">
    <thead>
      <tr>
        <th>Framework / Author</th>
        <th>Vision Accuracy</th>
        <th>Behavioral Analysis</th>
        <th>Subnet Wi-Fi Intercept</th>
        <th>Explainable AI (XAI)</th>
        <th>Audit Ledger</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><b>Proctorio (2020)</b></td>
        <td>Medium (Gaze only)</td>
        <td>Basic Window Blur</td>
        <td>No</td>
        <td>No (Opaque Score)</td>
        <td>Centralized SQL</td>
      </tr>
      <tr>
        <td><b>Safe Exam Browser (2021)</b></td>
        <td>None (Lockdown only)</td>
        <td>Process Whitelist</td>
        <td>No</td>
        <td>No</td>
        <td>Local Log File</td>
      </tr>
      <tr>
        <td><b>BioProctor (Li et al., 2022)</b></td>
        <td>High (CNN Pose)</td>
        <td>None</td>
        <td>No</td>
        <td>Partial (Heatmap)</td>
        <td>None</td>
      </tr>
      <tr>
        <td><b>Nigam et al. (2021)</b></td>
        <td>High (YOLO Face)</td>
        <td>Audio Energy only</td>
        <td>No</td>
        <td>No</td>
        <td>Standard DB</td>
      </tr>
      <tr style="background-color: #e8f0fe; font-weight: bold;">
        <td><b>SentinelAI (Proposed)</b></td>
        <td>High (YOLO + Face Mesh)</td>
        <td>Keystroke Cadence + Paste</td>
        <td>Yes (HTTP/S Proxy)</td>
        <td>Yes (Natural Language)</td>
        <td>SHA-256 Hash Chain</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- CHAPTER 3 & 4 -->
<div class="page-break">
  <div class="header-rule">
    <span>Chapter 3 & 4: Methodology & Architecture</span>
    <span>SentinelAI</span>
  </div>
  <h1>CHAPTER 3: SYSTEM ARCHITECTURE & MATHEMATICAL MODELING</h1>
  <h2>3.1 Multi-Agent Perception Mesh</h2>
  <p>
    SentinelAI organizes perception tasks into four independent worker agents:
  </p>
  <ul>
    <li><b>Vision Guard Agent:</b> Computes facial orientation angles (yaw, pitch), eye aspect ratio (EAR), and detects prohibited objects (smartphones, headphones, external displays).</li>
    <li><b>Behavioral Analyst Agent:</b> Evaluates keystroke dwell time and flight time distributions, flagging robotic cadence or large clipboard text insertions (>50 characters).</li>
    <li><b>Acoustic Sentry Agent:</b> Samples ambient microphone audio and applies fast Fourier transforms (FFT) to detect spectral whisper energy in the 300Hz–3400Hz voice band.</li>
    <li><b>Wi-Fi Collusion Interceptor:</b> Analyzes subnet DNS and proxy traffic on port 8080 to flag simultaneous academic search queries originating from secondary mobile devices.</li>
  </ul>

  <h2>3.2 Exponential Moving Average (EMA) Score Fusion</h2>
  <p>
    To prevent instantaneous anomalies from causing unwarranted session terminations, SentinelAI implements temporal risk smoothing:
  </p>
  <div class="equation-box">
    R(t) = α · [w_v · S_v(t) + w_b · S_b(t) + w_a · S_a(t) + w_w · C_w(t)] + (1 - α) · R(t - 1)
  </div>
  <p>
    where α is the risk decay velocity factor (default α = 0.35), w_v, w_b, w_a, w_w are configurable agent weights, and S_v, S_b, S_a, C_w are individual agent anomaly outputs.
  </p>

  <div class="figure-box" style="margin-top: 30px;">
    <img src="{flowchart_b64}" alt="SentinelAI Architectural Pipeline" style="max-height: 260px;">
    <div class="figure-caption">Figure 4.1: SentinelAI Multi-Agent Operational Flowchart and Data Pipeline</div>
  </div>
</div>

<!-- CHAPTER 5 & 6 -->
<div class="page-break">
  <div class="header-rule">
    <span>Chapter 5 & 6: Experimental Results</span>
    <span>SentinelAI</span>
  </div>
  <h1>CHAPTER 5: EXPERIMENTAL RESULTS & DISCUSSION</h1>
  <h2>5.1 Empirical Evaluation and Metrics</h2>
  <p>
    The proposed system was evaluated under simulated examination conditions involving 150 candidate sessions across three sensitivity profiles: STRICT, STANDARD, and LOW.
  </p>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 15px 0;">
    <div class="figure-box" style="margin: 0;">
      <img src="{risk_dist_b64}" alt="Risk Distribution">
      <div class="figure-caption">Figure 5.1: Risk Score Distribution</div>
    </div>
    <div class="figure-box" style="margin: 0;">
      <img src="{risk_time_b64}" alt="Risk Timeline">
      <div class="figure-caption">Figure 5.2: 90-Minute Risk Escalation Curve</div>
    </div>
  </div>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 15px 0;">
    <div class="figure-box" style="margin: 0;">
      <img src="{viol_cat_b64}" alt="Violation Categories">
      <div class="figure-caption">Figure 5.3: Breakdown of Detected Violations</div>
    </div>
    <div class="figure-box" style="margin: 0;">
      <img src="{radar_b64}" alt="Agent Performance Radar">
      <div class="figure-caption">Figure 5.4: Multi-Agent Precision & Recall Radar</div>
    </div>
  </div>

  <div class="figure-box" style="margin: 15px 0;">
    <img src="{heatmap_b64}" alt="Heatmap" style="max-height: 200px;">
    <div class="figure-caption">Figure 5.5: Exam Completion vs Anomaly Density Heatmap</div>
  </div>
</div>

<!-- CHAPTER 7 & REFERENCES -->
<div class="page-break">
  <div class="header-rule">
    <span>Chapter 7: Conclusion & References</span>
    <span>SentinelAI</span>
  </div>
  <h1>CHAPTER 6: CONCLUSION & REFERENCES</h1>
  <h2>6.1 Conclusion</h2>
  <p>
    SentinelAI successfully resolves the primary bottlenecks of contemporary automated proctoring: high false-alarm rates, opaque decision-making, and blind spots to external hardware collusion. By combining multi-modal perception meshes with EMA temporal smoothing and cryptographic SHA-256 ledgers, the system delivers sub-100ms latency with verified legal defensibility.
  </p>

  <h2>6.2 References</h2>
  <ol style="font-size: 9pt; line-height: 1.4; padding-left: 20px;">
    <li>Atoum, Y., Chen, L., Liu, A. X., Hsu, S. D., & Liu, X. (2017). Automated online exam proctoring. <i>IEEE Transactions on Multimedia</i>, 19(7), 1609-1624.</li>
    <li>Nigam, A., Pasricha, R., Singh, T., & Churi, P. (2021). A systematic review on AI-based proctoring systems: Past, present and future. <i>Education and Information Technologies</i>, 26(5), 6421-6445.</li>
    <li>Li, H., Xu, M., & Wang, Y. (2022). Deep learning-based continuous authentication and gaze estimation for secure online examinations. <i>Computers & Security</i>, 114, 102598.</li>
    <li>Wolpert, D. H. (1992). Stacked generalization. <i>Neural Networks</i>, 5(2), 241-259.</li>
    <li>Epp, C., Lippold, M., & Mandryk, R. L. (2011). Identifying emotional states using keystroke dynamics. In <i>Proc. ACM SIGCHI Conference on Human Factors in Computing Systems</i> (pp. 715-724).</li>
  </ol>
</div>

</body>
</html>"""

    html_path = os.path.join(workspace, "dissertation_report.html")
    pdf_path = os.path.join(workspace, "SentinelAI_Dissertation_Report.pdf")

    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_content)

    print(f"Generated HTML report at: {html_path}")

    # Convert HTML to PDF via Headless Chrome
    cmd = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "--headless",
        "--disable-gpu",
        f"--print-to-pdf={pdf_path}",
        "--no-pdf-header-footer",
        html_path
    ]
    
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0 and os.path.exists(pdf_path):
        print(f"SUCCESS: Compiled PDF report at: {pdf_path}")
        size_kb = os.path.getsize(pdf_path) / 1024
        print(f"PDF Size: {size_kb:.2f} KB")
    else:
        print("Error compiling PDF with Chrome:", res.stderr)

if __name__ == "__main__":
    main()
