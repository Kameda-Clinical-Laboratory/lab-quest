/**
 * Key chroma green from brand title raw art, then composite onto a thick solid bar.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const src =
  process.argv[2] ||
  path.join(
    process.env.USERPROFILE || '',
    '.cursor/projects/c-Users-src-rinchi-practicum/assets/quest-brand-title-raw.png',
  )
const out = path.join(root, 'public/art/quest-brand-title.png')
const BG = { r: 13, g: 42, b: 39 }

function isChroma(r, g, b) {
  return (
    (g > 140 && g > r + 35 && g > b + 35 && r < 170 && b < 170) ||
    (g > 190 && r < 130 && b < 140)
  )
}

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info

for (let i = 0; i < data.length; i += channels) {
  if (isChroma(data[i], data[i + 1], data[i + 2])) {
    data[i] = data[i + 1] = data[i + 2] = data[i + 3] = 0
  }
}

let minX = width
let minY = height
let maxX = 0
let maxY = 0
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (data[(y * width + x) * channels + 3] > 10) {
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }
}

const padX = 28
const padY = 40
const left = Math.max(0, minX - padX)
const top = Math.max(0, minY - padY)
const cropW = Math.min(width, maxX + padX + 1) - left
const cropH = Math.min(height, maxY + padY + 1) - top

const art = await sharp(data, { raw: { width, height, channels } })
  .extract({ left, top, width: cropW, height: cropH })
  .png()
  .toBuffer()

const rx = Math.round(Math.min(cropW, cropH) * 0.1)
const svg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${cropW}" height="${cropH}">
  <rect x="0" y="0" width="${cropW}" height="${cropH}" rx="${rx}" ry="${rx}" fill="rgb(${BG.r},${BG.g},${BG.b})"/>
  <rect x="3" y="3" width="${cropW - 6}" height="${cropH - 6}" rx="${Math.max(0, rx - 2)}" ry="${Math.max(0, rx - 2)}" fill="none" stroke="rgba(196,156,72,0.5)" stroke-width="3"/>
</svg>`,
)

await sharp(svg)
  .composite([{ input: art, blend: 'over' }])
  .png()
  .toFile(out)

const final = await sharp(out).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const d = final.data
const w = final.info.width
const h = final.info.height
const c = final.info.channels
for (let i = 0; i < d.length; i += c) {
  if (isChroma(d[i], d[i + 1], d[i + 2])) {
    d[i] = BG.r
    d[i + 1] = BG.g
    d[i + 2] = BG.b
    d[i + 3] = 255
  }
}
const patched = await sharp(d, { raw: { width: w, height: h, channels: c } }).png().toBuffer()

const mask = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <rect x="0" y="0" width="${w}" height="${h}" rx="${rx}" ry="${rx}" fill="#fff"/>
</svg>`,
)

await sharp(patched)
  .composite([{ input: await sharp(mask).png().toBuffer(), blend: 'dest-in' }])
  .png()
  .toFile(out)

const meta = await sharp(out).metadata()
console.log('wrote', out, meta.width, 'x', meta.height)
if (!fs.existsSync(src)) console.warn('source missing?', src)
