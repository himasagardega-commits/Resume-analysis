import os
import re
import json

# 1. Update app.js for statelessness
with open("app.js", "r", encoding="utf-8", errors="ignore") as f:
    app_js = f.read()

# Update upload logic
app_js = app_js.replace(
    "state.uploadPromise=uploadToBackend(state.file).then(data=>{state.resumeId=data.resume_id; return data;}).catch(()=>null);",
    "state.uploadPromise=uploadToBackend(state.file).then(data=>{state.resumeId=data.resume_id; state.extractedText=data.text; return data;}).catch(()=>null);"
)

# Update analyze logic
app_js = app_js.replace(
    "body:JSON.stringify({resume_id:state.resumeId,job_role:state.mode==='role'?state.job:null,job_description:state.mode==='description'?$('#job-description').value:null})",
    "body:JSON.stringify({text:state.extractedText,job_role:state.mode==='role'?state.job:null,job_description:state.mode==='description'?$('#job-description').value:null})"
)

# Update analyze-edited-text logic
app_js = app_js.replace(
    "body: JSON.stringify({ resume_id: state.resumeId, text: newText })",
    "body: JSON.stringify({ text: newText, job_role:state.mode==='role'?state.job:null, job_description:state.mode==='description'?$('#job-description').value:null, original_text: state.extractedText })"
)

# Update analyze-corrected logic
app_js = app_js.replace(
    "body.append('resume',file); body.append('resume_id',state.resumeId);",
    "body.append('resume',file); body.append('original_text',state.extractedText||''); body.append('job_role',state.mode==='role'?state.job:''); body.append('job_description',state.mode==='description'?$('#job-description').value:'');"
)

with open("app.js", "w", encoding="utf-8") as f:
    f.write(app_js)


# 2. Update backend.py to be stateless
with open("backend.py", "r", encoding="utf-8") as f:
    backend_py = f.read()

# Remove RESUMES dict
backend_py = re.sub(r"RESUMES:\s*dict\[str,\s*dict\[str,\s*Any\]\]\s*=\s*\{\}", "", backend_py)

# Rewrite endpoints
new_endpoints = """
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
"""

# Replace all endpoints
backend_py = re.sub(r"@app\.post\(\"/upload\"\).*?(?=@app\.get\(\"/\"\))", new_endpoints, backend_py, flags=re.DOTALL)

with open("backend.py", "w", encoding="utf-8") as f:
    f.write(backend_py)


# 3. Create vercel.json
vercel_json = {
  "rewrites": [
    { "source": "/upload", "destination": "/api/index" },
    { "source": "/analyze", "destination": "/api/index" },
    { "source": "/analyze-edited-text", "destination": "/api/index" },
    { "source": "/analyze-corrected", "destination": "/api/index" }
  ]
}

with open("vercel.json", "w") as f:
    json.dump(vercel_json, f, indent=2)


# 4. Move backend.py to api/index.py
os.makedirs("api", exist_ok=True)
os.rename("backend.py", "api/index.py")

print("Migration complete!")
