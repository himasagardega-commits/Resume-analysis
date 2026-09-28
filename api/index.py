from __future__ import annotations

import re
import uuid
from io import BytesIO
from typing import Any

from flask import Flask, jsonify, request, send_from_directory
from PyPDF2 import PdfReader

app = Flask(__name__, static_folder=".", static_url_path="")




@app.after_request
def allow_frontend_requests(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

ROLE_REQUIREMENTS = {
    "Full Stack Engineer": ["python", "sql", "javascript", "react", "html", "css", "node.js", "git", "rest api"],
    "Frontend Developer": ["javascript", "react", "html", "css", "git", "typescript", "responsive design"],
    "Backend Developer": ["python", "sql", "api", "node.js", "git", "database", "authentication"],
    "Data Scientist": ["python", "sql", "pandas", "numpy", "machine learning", "scikit-learn", "statistics", "power bi", "tableau", "advanced excel"],
    "Data Engineer": ["python", "sql", "etl", "data warehouse", "big data", "apache spark", "hadoop", "aws", "data pipelines", "kafka"],
    "Machine Learning Engineer": ["python", "machine learning", "scikit-learn", "tensorflow", "sql", "git", "deployment"],
    "Software Engineer": ["python", "javascript", "data structures", "algorithms", "git", "testing", "api"],
}
DEFAULT_REQUIREMENTS = ["communication", "project management", "analysis", "teamwork", "excel"]


def extract_text(file_bytes: bytes) -> str:
    reader = PdfReader(BytesIO(file_bytes))
    return "\n".join(page.extract_text() or "" for page in reader.pages).strip()


def contains_signal(text: str, signal: str) -> bool:
    normalized = re.sub(r"[^a-z0-9+#.]+", " ", text.lower())
    normalized_signal = re.sub(r"[^a-z0-9+#.]+", " ", signal.lower()).strip()
    return normalized_signal in normalized


def section_score(text: str, headings: list[str]) -> int:
    found = sum(1 for heading in headings if contains_signal(text, heading))
    return round(found / len(headings) * 100)


def analyze_text(text: str, role: str | None, description: str | None) -> dict[str, Any]:
    requirements = [item.lower() for item in ROLE_REQUIREMENTS.get(role or "", DEFAULT_REQUIREMENTS)]
    if description:
        description_terms = re.findall(r"[a-z][a-z+#.\-]{2,}", description.lower())
        requirements = list(dict.fromkeys(requirements + [term for term in description_terms if term not in {"with", "that", "this", "from", "your", "have", "will"}]))[:18]

    matched = [signal for signal in requirements if contains_signal(text, signal)]
    missing = [signal for signal in requirements if signal not in matched]
    skill_match = round(len(matched) / max(len(requirements), 1) * 100)
    keyword_match = skill_match
    structure = section_score(text, ["summary", "skills", "experience", "education", "projects"])
    education = 100 if contains_signal(text, "education") else 0
    experience = 100 if contains_signal(text, "experience") or contains_signal(text, "work history") else 40 if contains_signal(text, "projects") else 0
    contact = 100 if re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", text) else 40 if re.search(r"\+?\d[\d ()-]{7,}", text) else 0
    score = round(skill_match * 0.40 + keyword_match * 0.20 + structure * 0.15 + education * 0.10 + experience * 0.10 + contact * 0.05)

    weaknesses = []
    if not contains_signal(text, "summary"):
        weaknesses.append({"title": "Professional summary is missing", "explanation": "A targeted opening helps recruiters understand your fit quickly."})
    if missing:
        weaknesses.append({"title": "Important role keywords are missing", "explanation": f"The selected role expects signals such as {', '.join(missing[:3])}."})
    if not contains_signal(text, "projects"):
        weaknesses.append({"title": "Projects are not clearly presented", "explanation": "Projects give technical skills evidence and context."})
    if not contains_signal(text, "experience"):
        weaknesses.append({"title": "Work experience is not clearly labeled", "explanation": "A clear experience section makes relevant history easier to scan."})
    if not contains_signal(text, "education"):
        weaknesses.append({"title": "Education section is missing", "explanation": "Education is one of the weighted ATS signals."})

    sections = []
    for label, heading in [("Contact information", "contact"), ("Professional summary", "summary"), ("Education", "education"), ("Skills", "skills"), ("Projects", "projects"), ("Work experience", "experience"), ("Certifications", "certifications"), ("Achievements", "achievements")]:
        status = "Good" if contains_signal(text, heading) else "Missing"
        sections.append({"name": label, "status": status, "status_class": "good" if status == "Good" else "missing"})

    suggestions = []
    if missing:
        suggestions.append({
            "field": "Technical skills",
            "problem": "Role-specific skills are not visible",
            "why": "ATS matching looks for the tools named in the target role.",
            "suggestion": f"Add only the skills you genuinely know from this list: {', '.join(missing[:6])}.",
        })
    if not contains_signal(text, "projects"):
        suggestions.append({
            "field": "Projects",
            "problem": "No projects section was detected",
            "why": "Projects provide evidence that you have applied your technical skills.",
            "suggestion": "Add a project title, technologies used, your contribution, and a measurable result.",
        })
    if not contains_signal(text, "summary"):
        suggestions.append({
            "field": "Professional summary",
            "problem": "A targeted summary is missing",
            "why": "The first few lines help recruiters connect your profile to the selected role.",
            "suggestion": f"Add 2-3 lines naming your target role and strongest verified experience with {', '.join(matched[:3]) or 'relevant tools'}.",
        })
    if not contains_signal(text, "experience") and not contains_signal(text, "work history"):
        suggestions.append({
            "field": "Work experience",
            "problem": "Work experience is not clearly labeled",
            "why": "Clear job titles, dates, responsibilities, and results improve ATS readability.",
            "suggestion": "Add each real role with dates, responsibilities, technologies, and measurable outcomes.",
        })

    return {
        "score": score,
        "job_match": skill_match,
        "keyword_match": keyword_match,
        "structure": structure,
        "requirements": requirements,
        "matched": matched,
        "missing": missing,
        "weaknesses": weaknesses,
        "sections": sections,
        "suggestions": suggestions,
        "role": role or "Pasted job description",
        "text": text,
    }



@app.post("/upload")
def upload_resume():
    file = request.files.get("resume")
    if not file or not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Please upload a PDF resume."}), 400
    file_bytes = file.read()
    try:
        text = extract_text(file_bytes)
    except Exception as error:
        return jsonify({"error": f"Could not read this PDF: {error}"}), 400
    resume_id = uuid.uuid4().hex
    return jsonify({"resume_id": resume_id, "filename": file.filename, "text": text, "text_length": len(text)})

@app.post("/analyze")
def analyze_resume():
    payload = request.get_json(silent=True) or {}
    text = payload.get("text")
    if not text:
        return jsonify({"error": "Missing resume text."}), 400
    result = analyze_text(text, payload.get("job_role"), payload.get("job_description"))
    return jsonify(result)

@app.post("/analyze-corrected")
def analyze_corrected():
    file = request.files.get("resume")
    original_text = request.form.get("original_text", "")
    job_role = request.form.get("job_role")
    job_description = request.form.get("job_description")
    
    if not file:
        return jsonify({"error": "No file uploaded."}), 400
    corrected_bytes = file.read()
    try:
        corrected_text = extract_text(corrected_bytes)
    except Exception as error:
        return jsonify({"error": f"Could not read this PDF: {error}"}), 400
        
    result = analyze_text(corrected_text, job_role, job_description)
    original_analysis = analyze_text(original_text, job_role, job_description) if original_text else None
    
    return jsonify({"before": original_analysis, "after": result, "same_file": corrected_text == original_text})

@app.post("/analyze-edited-text")
def analyze_edited_text():
    payload = request.get_json(silent=True) or {}
    corrected_text = payload.get("text")
    original_text = payload.get("original_text", "")
    job_role = payload.get("job_role")
    job_description = payload.get("job_description")
    
    if not corrected_text:
        return jsonify({"error": "Missing edited text."}), 400
        
    result = analyze_text(corrected_text, job_role, job_description)
    original_analysis = analyze_text(original_text, job_role, job_description) if original_text else None
    
    return jsonify({"before": original_analysis, "after": result, "same_file": corrected_text == original_text})
@app.get("/")
def index():
    return send_from_directory(".", "index.html")


if __name__ == "__main__":
    app.run(debug=True, port=5000)
