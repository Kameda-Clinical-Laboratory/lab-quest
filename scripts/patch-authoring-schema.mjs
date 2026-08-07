import fs from 'node:fs'

function u(s) {
  return s.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
}

const section = u(`

---

## 12. \\u5b9f\\u88c5\\u30b9\\u30ad\\u30fc\\u30de\\u5bfe\\u5fdc\\u8868\\uff08\\u7de8\\u96c6\\u62c5\\u5f53\\u5411\\u3051\\uff09

\\u539f\\u7a3f\\u3092\\u30a2\\u30d7\\u30ea\\u306b\\u843d\\u3068\\u3059\\u3068\\u304d\\u306e\\u30d5\\u30a3\\u30fc\\u30eb\\u30c9\\u540d\\u3002\\u6b63\\u672c\\u30b3\\u30fc\\u30c9: \`src/mocks/learning.ts\` / \\u4f8b: \`src/mocks/bioBasicsUnits.ts\`\\u3002

### LearningUnit

| \\u30d5\\u30a3\\u30fc\\u30eb\\u30c9 | \\u5fc5\\u9808 | \\u610f\\u5473 |
|------------|------|------|
| id | yes | \\u30e6\\u30cb\\u30c3\\u30c8ID\\uff08\\u4f8b: bio-basics-u1\\uff09 |
| title | yes | \\u30e6\\u30cb\\u30c3\\u30c8\\u540d |
| requestLine | yes | \\u4f9d\\u983c\\u7968\\u306b\\u5e38\\u6642\\u8868\\u793a\\u3059\\u308b\\u4e00\\u6587 |
| beats | yes | Beat \\u306e\\u914d\\u5217\\uff08\\u4f1a\\u8a71\\u2192\\u8b1b\\u7fa9\\u2192\\u8abf\\u67fb\\u2192\\u89e3\\u6c7a\\u2192\\u767a\\u5c55\\u306e\\u9806\\uff09 |

### ClueDef\\uff08\\u56f3\\u9451\\uff09

| \\u30d5\\u30a3\\u30fc\\u30eb\\u30c9 | \\u5fc5\\u9808 | \\u610f\\u5473 |
|------------|------|------|
| id | yes | \\u624b\\u304c\\u304b\\u308aID\\uff08investigate.clueId / resolve.requiredClueIds \\u3068\\u4e00\\u81f4\\uff09 |
| name | yes | \\u8868\\u793a\\u540d |
| summary | yes | 1\\u6587\\u306e\\u5b9a\\u7fa9 |

### Beat.type

| type | \\u5f79\\u5272 | \\u4e3b\\u306a\\u30d5\\u30a3\\u30fc\\u30eb\\u30c9 |
|------|------|----------------|
| dialogue | \\u75c7\\u4f8b\\u30aa\\u30fc\\u30d7\\u30f3 | lines[{ speaker, text }], xp? |
| lecture | \\u77ed\\u3044\\u8b1b\\u7fa9 | body, bridge?, xp? |
| investigate | \\u8abf\\u67fb\\uff08\\u624b\\u304c\\u304b\\u308a\\u96c6\\u3081\\uff09 | mode: textbook\\\\|doc\\\\|observe, purpose, howTo, inputPrompt, acceptedAnswers[], clueId, required, manners?, demoHint?, xp? |
| resolve | \\u75c7\\u4f8b\\u89e3\\u6c7a | requiredClueIds[], steps\\uff08\\u5206\\u5c90 CaseStep\\uff09, xp? |
| drill | \\u767a\\u5c55\\uff08MVP\\u306f mcq\\uff09 | questions[{ id, format:'mcq', prompt, choices, correctIndex, explanation }], xp? |

### \\u30b2\\u30fc\\u30c8\\u30fb\\u6551\\u6e08\\uff08\\u5b9f\\u88c5\\u6e08\\u307f\\uff09

- resolve \\u306f requiredClueIds \\u304c\\u3059\\u3079\\u3066\\u6240\\u6301\\u624b\\u304c\\u304b\\u308a\\u306b\\u542b\\u307e\\u308c\\u308b\\u307e\\u3067\\u30ed\\u30c3\\u30af
- investigate.required=false \\u306f\\u30b9\\u30ad\\u30c3\\u30d7\\u53ef\\uff08\\u30dc\\u30fc\\u30ca\\u30b9\\u653e\\u68c4\\uff09
- \\u30ad\\u30fc\\u30ef\\u30fc\\u30c9\\u4e0d\\u4e00\\u81f4: 3\\u56de\\u3067 demoHint\\u30015\\u56de\\u3067\\u6b63\\u7b54\\u958b\\u793a\\uff0b\\u624b\\u304c\\u304b\\u308a\\u4ed8\\u4e0e
- \\u89e3\\u6c7a\\u30fb\\u767a\\u5c55\\u306e\\u4e0d\\u6b63\\u89e3\\u306f\\u6e1b\\u70b9\\u306a\\u3057\\u30fb\\u518d\\u9078\\u629e\\u53ef

### \\u65e7\\u30b7\\u30ea\\u30fc\\u30ba\\u4e92\\u63db

- Stage.units \\u304c\\u3042\\u308b \\u2192 \\u65b0UI
- \\u7121\\u3044 \\u2192 \\u5f93\\u6765\\u306e chapters + case + procedure

---

## \\u6539\\u5b9a\\u5c65\\u6b74

- 2026-08-07: \\u521d\\u7248\\u3002\\u76ee\\u76db\\u308a2\\u3001\\u73fe\\u5b9f\\u4e16\\u754c\\u8abf\\u67fb\\u3001\\u4f1a\\u8a71\\u2192\\u8b1b\\u7fa9\\u2192\\u8abf\\u67fb\\u2192\\u75c7\\u4f8b\\u89e3\\u6c7a\\u2192\\u767a\\u5c55\\u554f\\u984c\\u3092\\u6b63\\u672c\\u5316\\u3002
- 2026-08-07: \\u5b9f\\u88c5\\u30b9\\u30ad\\u30fc\\u30de\\u5bfe\\u5fdc\\u8868\\u30fb\\u30b2\\u30fc\\u30c8\\uff0f\\u6551\\u6e08\\u30eb\\u30fc\\u30eb\\u3092\\u8ffd\\u8a18\\u3002
`)

for (const f of ['docs/series-authoring-guide.md']) {
  let s = fs.readFileSync(f, 'utf8')
  s = s.replace(/\n---\n\n## [\u6539\u5b9a\u5c65\u6b74][\s\S]*$/u, '')
  // fallback: strip from revision heading if unicode in pattern fails
  const rev = s.indexOf('\n---\n\n## ')
  // simpler: find last ## 改定履歴 via code points
  const marker = '\n---\n\n## ' + String.fromCharCode(0x6539, 0x5b9a, 0x5c65, 0x6b74)
  const idx = s.lastIndexOf(marker)
  if (idx >= 0) s = s.slice(0, idx)
  s = s.trimEnd() + section
  fs.writeFileSync(f, s, 'utf8')
  fs.writeFileSync('docs/series-authoring-guide.md', s, 'utf8')
  // JP filename
  const jp = 'docs/' + String.fromCharCode(
    0x30b7,0x30ea,0x30fc,0x30ba,0x4f5c,0x6210,0x30de,0x30cb,0x30e5,0x30a2,0x30eb
  ) + '.md'
  fs.writeFileSync(jp, s, 'utf8')
  console.log('updated', f, jp, 'hasJP', /[\u3040-\u30ff]/.test(s))
}
