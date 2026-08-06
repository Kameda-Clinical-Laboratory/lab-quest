import fs from 'fs'
const files = [
  'src/pages/StageOverview.tsx',
  'src/pages/ChapterLearn.tsx',
  'src/pages/CaseWalkthrough.tsx',
  'src/pages/ProcedureSim.tsx',
  'src/pages/FinalCbt.tsx',
]
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8').replaceAll('className="panel"', 'className="learn-panel"')
  fs.writeFileSync(f, s)
  console.log('updated', f)
}
