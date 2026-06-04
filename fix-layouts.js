const fs = require('fs')
const path = require('path')

const layouts = [
  'super-admin/layout.tsx',
  'social/layout.tsx',
  'manager/layout.tsx',
  'field/layout.tsx',
  'caller/layout.tsx',
  'admin/layout.tsx'
]

for (const layout of layouts) {
  const p = path.join(__dirname, 'src/app', layout)
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf-8')
    content = content.replace(/\{\{\s*children\s*\}\}:\s*\{\{\s*children:\s*React\.ReactNode\s*\}\}\)\s*\{\{/g, '{ children }: { children: React.ReactNode }) {')
    
    // Check if the closing brace for the function needs fixing
    if (content.includes('}}')) {
        // We only want to replace the LAST occurrence of `}}` that closes the component, but it's easier to just replace all trailing `}}` at the very end of the file.
        content = content.replace(/\}\}\s*$/, '}\n')
    }

    fs.writeFileSync(p, content)
    console.log('Fixed', layout)
  }
}
