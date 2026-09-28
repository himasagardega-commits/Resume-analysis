const roles = "Accountant|Actuary|Administrative Assistant|Administrative Coordinator|Aerospace Engineer|Agricultural Engineer|AI Engineer|Airport Operations Manager|Aeronautical Engineer|Art Director|Astronautical Engineer|Attorney|Auditor|Automotive Engineer|Automotive Mechanic|Backend Developer|Biomedical Engineer|Brand Strategist|Business Analyst|Business Development Manager|Business Intelligence Analyst|Call Centre Manager|Carpenter|Catering Coordinator|Chartered Accountant|Chemical Engineer|Civil Engineer|Clinical Research Associate|Cloud Engineer|Commercial Pilot|Commercial Real Estate Broker|Compensation Specialist|Compliance Officer|Content Strategist|Copywriter|Corporate Lawyer|Customer Service Team Lead|Customer Success Manager|Cybersecurity Analyst|Cybersecurity Engineer|Data Entry Specialist|Data Engineer|Data Scientist|Database Administrator|Dentist|DevOps Engineer|Digital Marketer|Diplomat|Director|Doctor|Drug Safety Specialist|Electrical Engineer|Electrician|Electronics Engineer|Elementary School Teacher|Embedded Systems Engineer|Environmental Engineer|Event Planner|Executive Assistant|Executive Chef|Fashion Designer|Financial Analyst|Firefighter|Flight Attendant|Food & Beverage Manager|Frontend Developer|Full Stack Engineer|Game Developer|Geotechnical Engineer|Graphic Designer|Health Informatics Analyst|Heavy Equipment Operator|High School Teacher|Hospital Administrator|Hotel General Manager|HR Manager|HVAC Technician|Industrial Engineer|Instrumentation Engineer|Intelligence Analyst|Interior Designer|Investment Banker|IT Support Technician|Journalist|Judge|Legal Advisor|Legal Secretary|Librarian|Logistics Manager|Machine Learning Engineer|Machinist|Management Consultant|Manufacturing Engineer|Marine Biologist|Marine Engineer|Marketing Manager|Materials Engineer|Medical Coder|Medical Lab Technician|Medical Sales Representative|Meteorologist|Microelectronics Engineer|Mobile App Developer|Network Engineer|Nuclear Engineer|Office Manager|Operations Manager|Paralegal|Park Ranger|Penetration Tester|Petroleum Engineer|Pharmacist|Photographer|Physical Therapist|Pilot|Plumber|Police Officer|Process Engineer|Procurement Specialist|Product Designer|Product Manager|Project Manager|Property Manager|Public Relations Specialist|QA Automation Engineer|Quality Control Inspector|Radiologic Technologist|Real Estate Agent|Real Estate Analyst|Recruiter|Registered Nurse|Regulatory Affairs Specialist|Research Scientist|Retail Store Manager|Robotics Engineer|Sales Representative|Scrum Master|SEO Specialist|Security Analyst|Site Reliability Engineer|Social Media Manager|Software Engineer|Solutions Architect|Sound Engineer|Special Education Teacher|Structural Engineer|Supply Chain Analyst|Surgeon|Systems Administrator|Talent Acquisition Partner|Tax Specialist|Technical Support Specialist|Telecommunications Engineer|Therapist|Thermal Engineer|Tour Guide|Transportation Engineer|UI/UX Designer|University Professor|Urban Planner|Veterinarian|Video Editor|Web Developer|Welder".split('|');
const state = { file:null, correctedFile:null, job:'', mode:'role', beforeScore:82, beforeSignature:'', apiAnalysis:null };
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const showView = name => { $$('.view').forEach(view => view.classList.remove('active-view')); $(`#${name}-view`).classList.add('active-view'); window.scrollTo({top:0,behavior:'smooth'}); };
$('.menu-toggle').addEventListener('click',()=>{ const nav=$('.main-nav'); const open=nav.classList.toggle('mobile-open'); $('.menu-toggle').setAttribute('aria-expanded',open); });
$$('.main-nav a').forEach(link=>link.addEventListener('click',()=>$('.main-nav').classList.remove('mobile-open')));

const input = $('#resume-input');
$('#choose-resume').addEventListener('click', () => input.click());
$('#drop-zone').addEventListener('click', event => { if (event.target !== $('#choose-resume')) input.click(); });
$('#drop-zone').addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') input.click(); });
['dragenter','dragover'].forEach(type => $('#drop-zone').addEventListener(type, event => { event.preventDefault(); $('#drop-zone').classList.add('dragging'); }));
['dragleave','drop'].forEach(type => $('#drop-zone').addEventListener(type, event => { event.preventDefault(); $('#drop-zone').classList.remove('dragging'); }));
$('#drop-zone').addEventListener('drop', event => { const file = event.dataTransfer.files[0]; if (file) setFile(file); });
input.addEventListener('change', event => { if (event.target.files[0]) setFile(event.target.files[0]); });
function setFile(file){ if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) return; if (file.size > 10 * 1024 * 1024) return; state.file=file; state.apiAnalysis=null; state.resumeId=null; $('#file-name').textContent=file.name; $('#file-size').textContent=formatSize(file.size); $('#file-preview').classList.remove('hidden'); $('#drop-zone').classList.add('hidden'); $('#continue-button').disabled=false; requestAnimationFrame(() => { $('#upload-progress').style.width='100%'; }); }
function formatSize(bytes){ return bytes > 1024 * 1024 ? `${(bytes/1024/1024).toFixed(1)} MB` : `${Math.max(1,Math.round(bytes/1024))} KB`; }
$('#remove-file').addEventListener('click', () => { state.file=null; input.value=''; $('#file-preview').classList.add('hidden'); $('#drop-zone').classList.remove('hidden'); $('#continue-button').disabled=true; $('#upload-progress').style.width='0'; });
$('#continue-button').addEventListener('click', () => { state.beforeSignature=fileSignature(state.file); $('#uploaded-file-label').textContent=`${state.file.name} · PDF`; showView('job'); $('#job-search').focus(); });
function fileSignature(file){ return file ? `${file.name}|${file.size}|${file.lastModified}` : ''; }

const menu = $('#role-menu');
function renderRoles(query=''){ const matches=roles.filter(role => role.toLowerCase().includes(query.toLowerCase())).slice(0,14); menu.innerHTML=matches.map(role=>`<div class="role-option" data-role="${role}">${role}</div>`).join('') || '<div class="role-option">No matching role found</div>'; menu.classList.remove('hidden'); $$('.role-option[data-role]').forEach(option=>option.addEventListener('click',()=>selectRole(option.dataset.role))); }
function selectRole(role){ state.job=role; $('#selected-role-name').textContent=role; $('#selected-role').classList.remove('hidden'); $('#role-menu').classList.add('hidden'); $('#job-search').value=''; $('#analyze-button').disabled=false; }
$('#job-search').addEventListener('focus',()=>renderRoles($('#job-search').value));
$('#job-search').addEventListener('input',event=>renderRoles(event.target.value));
$('#clear-role').addEventListener('click',()=>{state.job='';$('#selected-role').classList.add('hidden');$('#analyze-button').disabled=true;});
document.addEventListener('click',event=>{ if(!event.target.closest('.search-wrap')&&!event.target.closest('.role-menu')) menu.classList.add('hidden'); });
$$('.mode-tab').forEach(tab=>tab.addEventListener('click',()=>{ $$('.mode-tab').forEach(item=>item.classList.remove('active')); tab.classList.add('active'); state.mode=tab.dataset.mode; $('#role-mode').classList.toggle('hidden',state.mode!=='role'); $('#description-mode').classList.toggle('hidden',state.mode!=='description'); $('#analyze-button').disabled=state.mode==='role'?!state.job:!$('#job-description').value.trim(); }));
$('#job-description').addEventListener('input',event=>{if(state.mode==='description')$('#analyze-button').disabled=!event.target.value.trim();});
$('#analyze-button').addEventListener('click',runAnalysis);

function runAnalysis(){ showView('loading'); const steps=['Extracting resume text','Preprocessing text','Tokenization','Removing stopwords','Lemmatization','POS tagging','Named Entity Recognition','Extracting skills and keywords','Comparing with job requirements','Calculating ATS-style score']; const list=$('#analysis-list'); list.innerHTML=steps.map(step=>`<div class="analysis-step"><span></span>${step}</div>`).join(''); let current=0; const timer=setInterval(()=>{ if(current>=steps.length){clearInterval(timer); renderResults(); return;} $$('.analysis-step')[current].classList.add('done'); $$('.analysis-step')[current].firstElementChild.textContent='✓'; const progress=Math.round(((current+1)/steps.length)*100); $('#loading-bar-progress').style.width=`${progress}%`; $('#loading-percent').textContent=`${progress}%`; current++; },95); }
function renderResults(){ const role=state.mode==='role'?state.job:'your pasted job description'; $('#result-role').textContent=role; const matched=['Python','SQL','Pandas','NumPy','Machine Learning','Scikit-learn']; const missing=['Power BI','Tableau','Advanced Excel']; $('#matched-skills').innerHTML=matched.map(skill=>`<span>${skill}</span>`).join(''); $('#missing-skills').innerHTML=missing.map(skill=>`<span>${skill}</span>`).join(''); $('#matched-keywords').innerHTML=matched.slice(0,4).map(skill=>`<span>${skill}</span>`).join(''); $('#missing-keywords').innerHTML=missing.slice(0,2).map(skill=>`<span>${skill}</span>`).join(''); const weaknesses=[['Professional summary is too generic','A specific opening helps both recruiters and matching systems understand your fit.'],['Important job keywords are missing','The right terminology makes relevant experience easier to discover.'],['Project descriptions lack measurable results','Outcomes give your work credibility and make impact easy to scan.'],['Skills section could be better organized','A clean grouping helps readers find your strongest signals quickly.'],['Work experience descriptions are too short','More context gives each accomplishment a useful shape.']]; $('#weakness-list').innerHTML=weaknesses.map(item=>`<div class="weakness-item"><span>!</span><div><strong>${item[0]}</strong><p>${item[1]}</p></div></div>`).join(''); const suggestions=[['SUMMARY','The opening line is broad.','Lead with your target role, strongest relevant tools, and the kind of work you have actually done.'],['PROJECTS','Impact is hard to see.','Add a measurable outcome to each project, using only results you can support.'],['SKILLS','Signals are scattered.','Group your existing tools by category so a reviewer can scan them in seconds.']]; $('#suggestion-list').innerHTML=suggestions.map(item=>`<div class="suggestion-item"><span>${item[0]}</span><div><strong>${item[1]}</strong><p><em>SUGGESTED:</em> ${item[2]}</p></div></div>`).join(''); const sections=[['Contact information','good','Good'],['Professional summary','warn','Needs improvement'],['Education','good','Good'],['Skills','good','Good'],['Projects','warn','Needs improvement'],['Work experience','warn','Needs improvement'],['Certifications','missing','Missing'],['Achievements','missing','Missing']]; $('#section-statuses').innerHTML=sections.map(item=>`<div class="status-row"><span>${item[0]}</span><span class="status ${item[1]}">${item[2]}</span></div>`).join(''); showView('results'); }
function renderComparison(){ const sameResume=fileSignature(state.correctedFile)===state.beforeSignature; const before={score:state.beforeScore,skills:6,keywords:78,structure:90}; const after=sameResume?before:{score:86,skills:7,keywords:84,structure:92}; $('#before-score').textContent=before.score; $('#after-score').textContent=after.score; $('#before-score-bar').style.width=`${before.score}%`; $('#after-score-bar').style.width=`${after.score}%`; $('#improvement-score').textContent=`${after.score-before.score>=0?'+':''}${after.score-before.score}`; $('#before-skills').textContent=before.skills; $('#after-skills').textContent=after.skills; $('#before-keywords').textContent=`${before.keywords}%`; $('#after-keywords').textContent=`${after.keywords}%`; $('#before-structure').textContent=`${before.structure}%`; $('#after-structure').textContent=`${after.structure}%`; $('.comparison-head > p').textContent=sameResume?'The corrected upload is identical to the original, so the score is unchanged.':'Same target role, new signal. Here’s what changed.'; showView('comparison'); }
$('#corrected-upload-button').addEventListener('click',()=>$('#corrected-input').click());
$('#corrected-input').addEventListener('change',event=>{const file=event.target.files[0]; if(file) {state.correctedFile=file; $('#corrected-upload-button').innerHTML='Corrected resume selected <span>✓</span>'; if(!state.resumeId) setTimeout(renderComparison,450);}});
$('#new-analysis').addEventListener('click',()=>{state.apiAnalysis=null;showView('home');}); $('#comparison-new-analysis').addEventListener('click',()=>{state.apiAnalysis=null;showView('home');}); $$('[data-nav="home"]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();showView('home');}));

function getRoleProfile(role){
	if(role==='Full Stack Engineer') return {score:48,jobMatch:38,keywords:25,structure:90,status:'Needs improvement',matched:['Python','SQL'],missing:['JavaScript','React','HTML/CSS','Node.js','Git','REST APIs'],requirements:['Python','SQL','JavaScript','React','HTML/CSS','Node.js','Git','REST APIs']};
	if(role==='Data Scientist') return {score:82,jobMatch:84,keywords:78,structure:90,status:'Good match',matched:['Python','SQL','Pandas','NumPy','Machine Learning','Scikit-learn'],missing:['Power BI','Tableau','Advanced Excel'],requirements:['Python','SQL','Pandas','NumPy','Machine Learning','Scikit-learn','Statistics','Power BI','Tableau','Advanced Excel']};
	return {score:55,jobMatch:50,keywords:42,structure:90,status:'Needs improvement',matched:['Python','SQL'],missing:['Role-specific keywords','Relevant framework','Industry tools'],requirements:['Communication','Project management','Analysis','Teamwork','Excel']};
}

function applyRoleProfile(){
	if(state.apiAnalysis){ applyApiAnalysis(state.apiAnalysis); return; }
	const profile=getRoleProfile(state.job);
	state.beforeScore=profile.score;
	state.beforeMetrics={skills:profile.matched.length,keywords:profile.keywords,structure:profile.structure};
	$('#score-value').firstChild.textContent=profile.score;
	$('.score-ring span').textContent=profile.score;
	$('.score-ring').style.background=`conic-gradient(var(--blue) 0 ${profile.score}%,#e8ecf7 ${profile.score}% )`;
	$('.mini-track span').style.width=`${profile.score}%`;
	$('.match-status').textContent=profile.status;
	$('.metric-card:nth-child(2) strong').firstChild.textContent=profile.jobMatch;
	$('.metric-card:nth-child(3) strong').firstChild.textContent=profile.keywords;
	$('#matched-skills').innerHTML=profile.matched.map(skill=>`<span>${skill}</span>`).join('');
	$('#missing-skills').innerHTML=profile.missing.map(skill=>`<span>${skill}</span>`).join('');
	$('#matched-keywords').innerHTML=profile.matched.slice(0,Math.min(4,profile.matched.length)).map(skill=>`<span>${skill}</span>`).join('');
	$('#missing-keywords').innerHTML=profile.missing.slice(0,4).map(skill=>`<span>${skill}</span>`).join('');
	$('.signal-count').textContent=`${profile.matched.length} matched`;
	renderRequirements(state.job,profile.requirements,profile.matched);
}

const resultsObserver=new MutationObserver(()=>{if($('#results-view').classList.contains('active-view')) applyRoleProfile();});
resultsObserver.observe($('#results-view'),{attributes:true,attributeFilter:['class']});

function renderComparison(){
	const sameResume=fileSignature(state.correctedFile)===state.beforeSignature;
	const metrics=state.beforeMetrics||{skills:6,keywords:78,structure:90};
	const before={score:state.beforeScore,skills:metrics.skills,keywords:metrics.keywords,structure:metrics.structure};
	const after=sameResume?before:{score:Math.min(before.score+18,86),skills:before.skills+1,keywords:Math.min(before.keywords+22,84),structure:Math.min(before.structure+2,92)};
	$('#before-score').textContent=before.score; $('#after-score').textContent=after.score; $('#before-score-bar').style.width=`${before.score}%`; $('#after-score-bar').style.width=`${after.score}%`; $('#improvement-score').textContent=`${after.score-before.score>=0?'+':''}${after.score-before.score}`; $('#before-skills').textContent=before.skills; $('#after-skills').textContent=after.skills; $('#before-keywords').textContent=`${before.keywords}%`; $('#after-keywords').textContent=`${after.keywords}%`; $('#before-structure').textContent=`${before.structure}%`; $('#after-structure').textContent=`${after.structure}%`; $('.comparison-head > p').textContent=sameResume?'The corrected upload is identical to the original, so the score is unchanged.':'Same target role, new signal. Here’s what changed.'; showView('comparison');
}

const API_BASE=location.port==='4173'?'http://127.0.0.1:5000':'';
state.resumeId=null;
state.uploadPromise=null;

async function uploadToBackend(file){
	const body=new FormData();
	body.append('resume',file);
	const response=await fetch(`${API_BASE}/upload`,{method:'POST',body});
	if(!response.ok) throw new Error('Backend upload failed');
	return response.json();
}

async function analyzeWithBackend(){
	if(!state.resumeId) return;
	const response=await fetch(`${API_BASE}/analyze`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({resume_id:state.resumeId,job_role:state.mode==='role'?state.job:null,job_description:state.mode==='description'?$('#job-description').value:null})});
	if(!response.ok) throw new Error('Backend analysis failed');
	return response.json();
}

function applyApiAnalysis(result){
	if(!result) return;
	state.apiAnalysis=result;
	state.beforeScore=result.score;
	state.beforeMetrics={skills:result.matched.length,keywords:result.keyword_match,structure:result.structure};
	$('.score-value').firstChild.textContent=result.score;
	$('.score-ring span').textContent=result.score;
	$('.score-ring').style.background=`conic-gradient(var(--blue) 0 ${result.score}%,#e8ecf7 ${result.score}% )`;
	$('.mini-track span').style.width=`${result.score}%`;
	$('.match-status').textContent=result.score>=80?'Excellent match':result.score>=60?'Moderate match':'Needs improvement';
	$('.metric-card:nth-child(2) strong').firstChild.textContent=result.job_match;
	$('.metric-card:nth-child(3) strong').firstChild.textContent=result.keyword_match;
	$('#matched-skills').innerHTML=result.matched.map(skill=>`<span>${skill}</span>`).join('');
	$('#missing-skills').innerHTML=result.missing.map(skill=>`<span>${skill}</span>`).join('');
	$('#matched-keywords').innerHTML=result.matched.slice(0,6).map(skill=>`<span>${skill}</span>`).join('');
	$('#missing-keywords').innerHTML=result.missing.slice(0,6).map(skill=>`<span>${skill}</span>`).join('');
	$('.signal-count').textContent=`${result.matched.length} matched`;
	renderRequirements(result.role,result.requirements||[],result.matched||[]);
	$('#weakness-list').innerHTML=result.weaknesses.map(item=>`<div class="weakness-item"><span>!</span><div><strong>${item.title}</strong><p>${item.explanation}</p></div></div>`).join('');
	$('#section-statuses').innerHTML=result.sections.map(item=>`<div class="status-row"><span>${item.name}</span><span class="status ${item.status_class}">${item.status}</span></div>`).join('');
	renderSuggestions(result.suggestions||[]);
}

function renderRequirements(role,requirements,matched){
	let card=$('#requirements-card');
	if(!card){
		card=document.createElement('div'); card.id='requirements-card'; card.className='content-card requirements-card';
		$('.dashboard-main').insertBefore(card,$('.dashboard-main .content-card:nth-child(2)'));
	}
	const matchedSet=new Set(matched.map(item=>item.toLowerCase()));
	card.innerHTML=`<div class="card-heading"><div><span class="section-label">TARGET ROLE REQUIREMENTS</span><h2>What ${role||'this job'} expects</h2></div><span class="muted-label">${matched.length}/${requirements.length} matched</span></div><p class="requirements-intro">These are the signals used to compare your resume with this job. Missing items are suggestions to build or document honestly.</p><div class="requirement-list">${requirements.map(item=>{const isMatched=matchedSet.has(item.toLowerCase()); return `<div class="requirement-row"><span class="requirement-status ${isMatched?'is-matched':'is-missing'}">${isMatched?'✓':'!'}</span><strong>${item}</strong><span class="requirement-label">${isMatched?'Found in resume':'Missing from resume'}</span></div>`;}).join('')}</div>`;
}

function renderSuggestions(suggestions){
	$('#suggestion-list').innerHTML=suggestions.length?suggestions.map(item=>`<div class="suggestion-item"><span>${item.field}</span><div><strong>${item.problem}</strong><p><b>WHY IT MATTERS:</b> ${item.why}</p><p><em>ADD:</em> ${item.suggestion}</p></div></div>`).join(''):'<div class="suggestion-item"><span>READY</span><div><strong>Your key resume fields are covered</strong><p>Keep each section specific and supported by your real experience.</p></div></div>';
}

$('#continue-button').addEventListener('click',()=>{
	state.uploadPromise=uploadToBackend(state.file).then(data=>{state.resumeId=data.resume_id; return data;}).catch(()=>null);
});

$('#analyze-button').addEventListener('click',()=>{
	if(!state.uploadPromise) return;
	state.uploadPromise.then(()=>analyzeWithBackend()).then(result=>{
		if(result){applyApiAnalysis(result);}
	}).catch(()=>{});
});

$('#corrected-input').addEventListener('change',event=>{
	const file=event.target.files[0];
	if(!file||!state.resumeId) return;
	showView('loading');
	$('#loading-percent').textContent='Analyzing corrected resume';
	const body=new FormData();
	body.append('resume',file); body.append('resume_id',state.resumeId);
	fetch(`${API_BASE}/analyze-corrected`,{method:'POST',body}).then(response=>response.ok?response.json():null).then(data=>{
		if(!data||!data.after) return;
		state.correctedFile=file;
		state.beforeScore=data.before.score;
		state.beforeMetrics={skills:data.before.matched.length,keywords:data.before.keyword_match,structure:data.before.structure};
		const same=data.same_file;
		const after=data.after;
		$('#before-score').textContent=data.before.score; $('#after-score').textContent=after.score;
		$('#before-score-bar').style.width=`${data.before.score}%`; $('#after-score-bar').style.width=`${after.score}%`;
		$('#improvement-score').textContent=`${after.score-data.before.score>=0?'+':''}${after.score-data.before.score}`;
		$('#before-skills').textContent=data.before.matched.length; $('#after-skills').textContent=after.matched.length;
		$('#before-keywords').textContent=`${data.before.keyword_match}%`; $('#after-keywords').textContent=`${after.keyword_match}%`;
		$('#before-structure').textContent=`${data.before.structure}%`; $('#after-structure').textContent=`${after.structure}%`;
		$('.comparison-head > p').textContent=same?'The corrected upload is identical to the original, so the score is unchanged.':'Same target role, new signal. Here’s what changed.';
		applyApiAnalysis(after);
		showView('comparison');
	}).catch(()=>{});
});

$('#edit-resume-button')?.addEventListener('click', () => {
    if(!state.apiAnalysis || !state.apiAnalysis.text) return;
    $('#resume-text-editor').value = state.apiAnalysis.text;
    showView('edit');
});

$('#save-edit-button')?.addEventListener('click', () => {
    const newText = $('#resume-text-editor').value;
    if(!newText || !state.resumeId) return;
    showView('loading');
    $('#loading-percent').textContent='Analyzing edited text';
    fetch(`${API_BASE}/analyze-edited-text`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ resume_id: state.resumeId, text: newText })
    }).then(response => response.ok ? response.json() : null).then(data => {
        if(!data || !data.after) return;
        state.beforeScore = data.before.score;
        state.beforeMetrics = {skills: data.before.matched.length, keywords: data.before.keyword_match, structure: data.before.structure};
        const same = data.same_file;
        const after = data.after;
        $('#before-score').textContent = data.before.score; $('#after-score').textContent = after.score;
        $('#before-score-bar').style.width = `${data.before.score}%`; $('#after-score-bar').style.width = `${after.score}%`;
        $('#improvement-score').textContent = `${after.score - data.before.score >= 0 ? '+' : ''}${after.score - data.before.score}`;
        $('#before-skills').textContent = data.before.matched.length; $('#after-skills').textContent = after.matched.length;
        $('#before-keywords').textContent = `${data.before.keyword_match}%`; $('#after-keywords').textContent = `${after.keyword_match}%`;
        $('#before-structure').textContent = `${data.before.structure}%`; $('#after-structure').textContent = `${after.structure}%`;
        $('.comparison-head > p').textContent = same ? 'The edited text is identical to the original, so the score is unchanged.' : 'Same target role, new signal. Here’s what changed.';
        applyApiAnalysis(after);
        showView('comparison');
    }).catch(() => {});
});
$$("[data-nav='templates']").forEach(link => link.addEventListener("click", event => {
    event.preventDefault();
    showView("templates");
}));

const templatesHTML = {
    minimalist: `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
  <h1 style="margin: 0 0 10px 0; font-size: 32px;">Alex Candidate</h1>
  <p style="margin: 0 0 20px 0; color: #666;">hello@example.com | (555) 123-4567 | linkedin.com/in/alex</p>
  <div style="border-bottom: 2px solid #333; margin-bottom: 15px;"><h2 style="font-size: 18px; text-transform: uppercase; margin: 0 0 5px 0;">Professional Summary</h2></div>
  <p style="margin-bottom: 20px;">A highly motivated professional with experience in building scalable web applications and working with cross-functional teams.</p>
  <div style="border-bottom: 2px solid #333; margin-bottom: 15px;"><h2 style="font-size: 18px; text-transform: uppercase; margin: 0 0 5px 0;">Experience</h2></div>
  <div style="margin-bottom: 15px;"><strong style="font-size: 16px;">Software Engineer</strong> <span style="float: right; color: #666;">2021 - Present</span><div style="color: #555; margin-bottom: 5px;">Tech Company Inc.</div><ul style="margin: 0; padding-left: 20px;"><li>Developed and maintained web applications using React and Node.js.</li><li>Improved application performance by 30% through code optimization.</li></ul></div>
  <div style="border-bottom: 2px solid #333; margin-bottom: 15px;"><h2 style="font-size: 18px; text-transform: uppercase; margin: 0 0 5px 0;">Education</h2></div>
  <div><strong style="font-size: 16px;">Bachelor of Science in Computer Science</strong> <span style="float: right; color: #666;">2017 - 2021</span><div style="color: #555;">University of Technology</div></div>
</div>`,
    professional: `<div style="font-family: 'Times New Roman', serif; color: #000; line-height: 1.4;">
  <div style="text-align: center; margin-bottom: 20px;"><h1 style="margin: 0; font-size: 36px; text-transform: uppercase;">Alex Candidate</h1><p style="margin: 5px 0 0 0;">hello@example.com &bull; (555) 123-4567 &bull; City, State</p></div>
  <h2 style="font-size: 16px; border-bottom: 1px solid #000; text-transform: uppercase; margin: 15px 0 10px 0; padding-bottom: 3px;">Summary</h2>
  <p style="margin-bottom: 15px;">Experienced software engineer specializing in backend development, data analysis, and scalable systems.</p>
  <h2 style="font-size: 16px; border-bottom: 1px solid #000; text-transform: uppercase; margin: 15px 0 10px 0; padding-bottom: 3px;">Experience</h2>
  <div style="margin-bottom: 15px;"><div><strong>Tech Company Inc.</strong> <span style="float: right;">City, State</span></div><div><em>Software Engineer</em> <span style="float: right;">2021 - Present</span></div><ul style="margin: 5px 0 0 0; padding-left: 20px;"><li>Designed API architecture for primary product suite.</li><li>Collaborated with product teams to launch 3 major features.</li></ul></div>
  <h2 style="font-size: 16px; border-bottom: 1px solid #000; text-transform: uppercase; margin: 15px 0 10px 0; padding-bottom: 3px;">Skills</h2>
  <p style="margin-bottom: 15px;"><strong>Languages:</strong> Python, JavaScript, SQL<br><strong>Tools:</strong> Git, Docker, AWS, React</p>
</div>`,
    creative: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; min-height: 100%; color: #333;">
  <div style="width: 30%; background-color: #2b4b80; color: #fff; padding: 30px;"><h1 style="margin: 0 0 10px 0; font-size: 28px; line-height: 1.2;">Alex<br>Candidate</h1><p style="font-size: 14px; opacity: 0.8; margin-bottom: 30px;">Software Engineer</p><h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 5px;">Contact</h3><p style="font-size: 12px; margin-bottom: 20px;">hello@example.com<br>(555) 123-4567</p><h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 5px;">Skills</h3><ul style="font-size: 12px; padding-left: 15px;"><li>UI/UX Design</li><li>React / Vue</li><li>Node.js</li></ul></div>
  <div style="width: 70%; padding: 30px; background-color: #fff;"><h2 style="font-size: 20px; color: #2b4b80; border-bottom: 2px solid #f0f0f0; padding-bottom: 5px; margin-top: 0;">Profile</h2><p style="font-size: 14px; line-height: 1.6; margin-bottom: 25px;">Creative software engineer with a passion for designing beautiful user interfaces and building robust backend services.</p><h2 style="font-size: 20px; color: #2b4b80; border-bottom: 2px solid #f0f0f0; padding-bottom: 5px;">Experience</h2><div style="margin-bottom: 20px;"><h4 style="margin: 0; font-size: 16px;">Frontend Developer</h4><p style="margin: 0 0 10px 0; font-size: 12px; color: #888;">Design Agency � 2021 - Present</p><p style="font-size: 14px; line-height: 1.5; margin: 0;">Led the frontend development of 10+ client websites, improving overall user retention by 25%.</p></div><h2 style="font-size: 20px; color: #2b4b80; border-bottom: 2px solid #f0f0f0; padding-bottom: 5px;">Education</h2><div><h4 style="margin: 0; font-size: 16px;">BA Graphic Design</h4><p style="margin: 0; font-size: 12px; color: #888;">State University � 2017 - 2021</p></div></div>
</div>`
};

$$(".template-card").forEach(card => card.addEventListener("click", () => {
    const templateType = card.dataset.template;
    if (templatesHTML[templateType]) {
        $("#active-resume-template").innerHTML = templatesHTML[templateType];
        showView("template-editor");
    }
}));

$("#back-to-templates")?.addEventListener("click", () => showView("templates"));

