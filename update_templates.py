import re

with open("app.js", "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

replacement = r"""
const layouts = [
  (cMain, cBg, font) => `<div style="font-family: ${font}; color: #333; line-height: 1.5; background: #fff; padding: 20mm; min-height:100%; box-sizing:border-box;">
    <h1 style="margin: 0 0 10px 0; font-size: 32px; color: ${cMain};">Alex Candidate</h1>
    <p style="margin: 0 0 20px 0; color: #666;">hello@example.com | (555) 123-4567</p>
    <div style="border-bottom: 2px solid ${cMain}; margin-bottom: 15px;"><h2 style="font-size: 18px; text-transform: uppercase; margin: 0 0 5px 0; color: ${cMain};">Professional Summary</h2></div>
    <p style="margin-bottom: 20px;">A highly motivated professional with experience in building scalable web applications and working with cross-functional teams.</p>
    <div style="border-bottom: 2px solid ${cMain}; margin-bottom: 15px;"><h2 style="font-size: 18px; text-transform: uppercase; margin: 0 0 5px 0; color: ${cMain};">Experience</h2></div>
    <div style="margin-bottom: 15px;"><strong style="font-size: 16px;">Software Engineer</strong> <span style="float: right; color: #666;">2021 - Present</span><div style="color: #555; margin-bottom: 5px;">Tech Company Inc.</div><ul style="margin: 0; padding-left: 20px;"><li>Developed and maintained web applications using React and Node.js.</li><li>Improved application performance by 30% through code optimization.</li></ul></div>
    <div style="border-bottom: 2px solid ${cMain}; margin-bottom: 15px;"><h2 style="font-size: 18px; text-transform: uppercase; margin: 0 0 5px 0; color: ${cMain};">Education</h2></div>
    <div><strong style="font-size: 16px;">Bachelor of Science in Computer Science</strong> <span style="float: right; color: #666;">2017 - 2021</span><div style="color: #555;">University of Technology</div></div>
  </div>`,
  (cMain, cBg, font) => `<div style="font-family: ${font}; display: flex; min-height: 100%; color: #333; padding: 0;">
    <div style="width: 30%; background-color: ${cMain}; color: ${cBg}; padding: 20mm 10mm;"><h1 style="margin: 0 0 10px 0; font-size: 28px; line-height: 1.2;">Alex<br>Candidate</h1><p style="font-size: 14px; opacity: 0.8; margin-bottom: 30px;">Software Engineer</p><h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 5px;">Contact</h3><p style="font-size: 12px; margin-bottom: 20px;">hello@example.com<br>(555) 123-4567</p><h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 5px;">Skills</h3><ul style="font-size: 12px; padding-left: 15px;"><li>UI/UX Design</li><li>React / Vue</li><li>Node.js</li></ul></div>
    <div style="width: 70%; padding: 20mm; background-color: #fff;"><h2 style="font-size: 20px; color: ${cMain}; border-bottom: 2px solid #f0f0f0; padding-bottom: 5px; margin-top: 0;">Profile</h2><p style="font-size: 14px; line-height: 1.6; margin-bottom: 25px;">Creative software engineer with a passion for designing beautiful user interfaces and building robust backend services.</p><h2 style="font-size: 20px; color: ${cMain}; border-bottom: 2px solid #f0f0f0; padding-bottom: 5px;">Experience</h2><div style="margin-bottom: 20px;"><h4 style="margin: 0; font-size: 16px;">Frontend Developer</h4><p style="margin: 0 0 10px 0; font-size: 12px; color: #888;">Design Agency • 2021 - Present</p><p style="font-size: 14px; line-height: 1.5; margin: 0;">Led the frontend development of 10+ client websites, improving overall user retention by 25%.</p></div><h2 style="font-size: 20px; color: ${cMain}; border-bottom: 2px solid #f0f0f0; padding-bottom: 5px;">Education</h2><div><h4 style="margin: 0; font-size: 16px;">BA Graphic Design</h4><p style="margin: 0; font-size: 12px; color: #888;">State University • 2017 - 2021</p></div></div>
  </div>`,
  (cMain, cBg, font) => `<div style="font-family: ${font}; color: #333; line-height: 1.5; padding:0; min-height:100%; box-sizing:border-box;">
    <div style="background-color: ${cMain}; color: ${cBg}; padding: 15mm 20mm; text-align: center;"><h1 style="margin: 0; font-size: 36px;">Alex Candidate</h1><p style="margin: 5px 0 0 0;">hello@example.com | (555) 123-4567 | City, State</p></div>
    <div style="padding: 15mm 20mm;"><h2 style="font-size: 18px; color: ${cMain}; text-transform: uppercase; border-bottom:1px solid #ddd; padding-bottom:5px;">Summary</h2><p style="margin-bottom:20px;">Experienced software engineer specializing in backend development, data analysis, and scalable systems.</p><h2 style="font-size: 18px; color: ${cMain}; text-transform: uppercase; border-bottom:1px solid #ddd; padding-bottom:5px;">Experience</h2><div style="margin-bottom: 15px;"><div><strong>Tech Company Inc.</strong> <span style="float: right;">City, State</span></div><div><em>Software Engineer</em> <span style="float: right;">2021 - Present</span></div><ul style="margin: 5px 0 0 0; padding-left: 20px;"><li>Designed API architecture for primary product suite.</li><li>Collaborated with product teams to launch 3 major features.</li></ul></div><h2 style="font-size: 18px; color: ${cMain}; text-transform: uppercase; border-bottom:1px solid #ddd; padding-bottom:5px;">Skills</h2><p style="margin-bottom: 15px;"><strong>Languages:</strong> Python, JavaScript, SQL<br><strong>Tools:</strong> Git, Docker, AWS, React</p></div>
  </div>`,
  (cMain, cBg, font) => `<div style="font-family: ${font}; color: #333; line-height: 1.5; padding: 20mm; min-height:100%; box-sizing:border-box; background: #fff;">
    <div style="display:flex; justify-content:space-between; border-bottom: 3px solid ${cMain}; padding-bottom: 15px; margin-bottom: 20px;">
        <div><h1 style="margin:0; color:${cMain}; font-size:36px;">Alex Candidate</h1><div style="color:#666; font-size:16px; margin-top:5px;">Software Engineer</div></div>
        <div style="text-align:right; font-size:14px; color:#555;">hello@example.com<br>(555) 123-4567<br>linkedin.com/in/alex</div>
    </div>
    <h2 style="color: ${cMain}; font-size: 16px; letter-spacing:1px;">SUMMARY</h2><p style="margin-bottom:20px;">A highly motivated professional with experience in building scalable web applications and working with cross-functional teams.</p>
    <h2 style="color: ${cMain}; font-size: 16px; letter-spacing:1px;">EXPERIENCE</h2>
    <div style="margin-bottom: 15px;"><strong style="font-size: 16px;">Software Engineer</strong> <span style="float: right; color: #666;">2021 - Present</span><div style="color: #555; margin-bottom: 5px;">Tech Company Inc.</div><ul style="margin: 0; padding-left: 20px;"><li>Developed and maintained web applications using React and Node.js.</li><li>Improved application performance by 30% through code optimization.</li></ul></div>
  </div>`,
  (cMain, cBg, font) => `<div style="font-family: ${font}; color: #333; line-height: 1.6; padding: 20mm; min-height:100%; box-sizing:border-box; background: ${cBg};">
    <div style="text-align: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid ${cMain};">
        <h1 style="margin:0; color:${cMain}; text-transform:uppercase; letter-spacing:3px; font-size:32px;">Alex Candidate</h1>
        <p style="margin:5px 0 0 0; color:#555;">hello@example.com &bull; (555) 123-4567 &bull; linkedin.com/in/alex</p>
    </div>
    <h2 style="text-align:center; color:${cMain}; text-transform:uppercase; font-size:16px; letter-spacing:2px; margin-top:20px;">Professional Experience</h2>
    <div style="margin-bottom: 20px; text-align:center;">
        <strong style="font-size: 16px;">Software Engineer</strong> &mdash; <em>Tech Company Inc.</em><br><span style="color: #666; font-size:14px;">2021 - Present</span>
        <p style="margin-top:10px; text-align:justify;">Developed and maintained web applications using React and Node.js. Improved application performance by 30% through code optimization and database query improvements.</p>
    </div>
    <h2 style="text-align:center; color:${cMain}; text-transform:uppercase; font-size:16px; letter-spacing:2px; margin-top:20px;">Education</h2>
    <div style="text-align:center;">
        <strong style="font-size: 16px;">Bachelor of Science in Computer Science</strong><br>
        <em>University of Technology</em> &mdash; <span style="color: #666; font-size:14px;">2017 - 2021</span>
    </div>
  </div>`
];

const colors = [
    { name: "Classic", main: "#000000", bg: "#ffffff" },
    { name: "Navy", main: "#1e3a8a", bg: "#eff6ff" },
    { name: "Forest", main: "#14532d", bg: "#f0fdf4" },
    { name: "Burgundy", main: "#7f1d1d", bg: "#fef2f2" },
    { name: "Slate", main: "#334155", bg: "#f8fafc" },
    { name: "Teal", main: "#0f766e", bg: "#f0fdfa" }
];

const fonts = [
    { name: "Sans", family: "'Inter', 'Helvetica Neue', Helvetica, sans-serif" },
    { name: "Serif", family: "Georgia, 'Times New Roman', serif" },
    { name: "Mono", family: "'Courier New', Courier, monospace" },
    { name: "Elegant", family: "'Playfair Display', 'Times New Roman', serif" }
];

const generatedTemplates = {};
let tIndex = 1;
const gridHtml = [];

layouts.forEach((layoutFn, lIdx) => {
    colors.forEach((color) => {
        fonts.forEach((font) => {
            const id = `template_${tIndex}`;
            const title = `Layout ${lIdx + 1} &middot; ${color.name} &middot; ${font.name}`;
            generatedTemplates[id] = layoutFn(color.main, color.bg, font.family);
            
            // Create a mini-preview style
            const previewStyle = `background: ${color.bg}; border-top: 15px solid ${color.main};`;
            
            gridHtml.push(`<div class="template-card" data-template="${id}">
                <h3 style="font-size:13px; margin:0 0 10px 0; font-family:var(--font-sans); color:#333;">${title}</h3>
                <div class="template-preview" style="${previewStyle} height: 160px;"></div>
            </div>`);
            tIndex++;
        });
    });
});

const gridEl = document.querySelector('#templates-grid');
if(gridEl) gridEl.innerHTML = gridHtml.join('');

document.querySelectorAll('.template-card').forEach(card => card.addEventListener("click", () => {
    const templateType = card.dataset.template;
    if (generatedTemplates[templateType]) {
        const activeTpl = document.querySelector("#active-resume-template");
        activeTpl.innerHTML = generatedTemplates[templateType];
        activeTpl.style.padding = "0"; // Handle padding via the inner template wrapper to ensure background colors reach edges
        showView("template-editor");
    }
}));

document.querySelector("#back-to-templates")?.addEventListener("click", () => showView("templates"));
"""

match = re.search(r'const templatesHTML\s*=\s*\{.*', content, re.DOTALL)
if match:
    new_content = content[:match.start()] + replacement
    with open("app.js", "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Successfully replaced templates logic.")
else:
    print("Could not find templatesHTML to replace!")

