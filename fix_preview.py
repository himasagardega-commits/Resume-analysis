import re

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_block = r"""            // Create a mini-preview style
            const previewStyle = `background: \${color.bg}; border-top: 15px solid \${color.main};`;
            
            gridHtml.push(`<div class="template-card" data-template="\${id}">
                <h3 style="font-size:13px; margin:0 0 10px 0; font-family:var(--font-sans); color:#333;">\${title}</h3>
                <div class="template-preview" style="\${previewStyle} height: 160px;"></div>
            </div>`);"""

new_block = r"""            const rawHtml = layoutFn(color.main, color.bg, font.family);
            generatedTemplates[id] = rawHtml;
            
            gridHtml.push(`<div class="template-card" data-template="${id}" style="cursor:pointer; overflow:hidden;">
                <h3 style="font-size:13px; margin:0 0 10px 0; font-family:var(--font-sans); color:#333;">${title}</h3>
                <div class="template-preview" style="height: 280px; overflow: hidden; position: relative; border: 1px solid #ddd; border-radius: 6px; background: ${color.bg}; box-shadow: inset 0 0 10px rgba(0,0,0,0.02);">
                    <div style="width: 210mm; min-height: 297mm; transform: scale(0.35); transform-origin: top left; pointer-events: none; position: absolute; top:0; left:0;">
                        ${rawHtml}
                    </div>
                </div>
            </div>`);"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open('app.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Replaced successfully (exact string match).")
else:
    # Try regex if exact match fails due to line endings
    print("Exact match failed, trying regex.")
    
    # regex match for the block
    pattern = re.compile(r'// Create a mini-preview style.*?</div>`\);', re.DOTALL)
    if pattern.search(content):
        content = pattern.sub(new_block.replace('$', '$$'), content) # escape $ for re.sub
        with open('app.js', 'w', encoding='utf-8') as f:
            f.write(content)
        print("Replaced successfully via regex.")
    else:
        print("Regex match also failed.")
