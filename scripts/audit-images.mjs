import { createHash } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const isDistAudit = process.argv.includes('--dist')
const sourceFiles = await walk(path.join(root, 'src'), /\.(ts|tsx)$/i)
const sourceText = (await Promise.all(sourceFiles.map(file => fs.readFile(file, 'utf8')))).join('\n')
const credits = await fs.readFile(path.join(root, 'src/data/imageCredits.ts'), 'utf8')
const localRefs = [...sourceText.matchAll(/['"]((?:images|icons)\/[A-Za-z0-9_./-]+\.(?:webp|png|jpe?g|svg))['"]/gi)].map(match => match[1])
const uniqueRefs = [...new Set(localRefs)]
const missingLocal = []
for (const ref of uniqueRefs) {
  if (!await exists(path.join(root, 'public', ref))) missingLocal.push(ref)
}
const creditIds = new Set([...credits.matchAll(/(?:id|commonsCredit)[:(]'([^']+)'/g)].map(match => match[1]))
const imageCreditIds = [...sourceText.matchAll(/creditId\s*:\s*'([^']+)'/g)].map(match => match[1])
const uncredited = imageCreditIds.filter(id => !creditIds.has(id))
const imageFiles = await walk(path.join(root, 'public', 'images'), /\.(webp|png|jpe?g)$/i)
const large = []
const dimensionWarnings = []
const dimensions = []
const hashes = new Map()
const duplicateHashes = []
for (const file of imageFiles) {
  const stat = await fs.stat(file)
  if (stat.size > 500 * 1024) large.push(path.relative(root, file) + ' (' + Math.round(stat.size / 1024) + ' KB)')
  const buffer = await fs.readFile(file)
  const hash = createHash('sha256').update(buffer).digest('hex')
  const size = readImageDimensions(buffer)
  if (size) {
    const longEdge = Math.max(size.width, size.height)
    dimensions.push({ file: path.relative(root, file), width: size.width, height: size.height })
    if (longEdge > 1600) dimensionWarnings.push(path.relative(root, file) + ' (' + size.width + '×' + size.height + ')')
  }
  const old = hashes.get(hash)
  if (old) duplicateHashes.push(path.relative(root, old) + ' = ' + path.relative(root, file))
  hashes.set(hash, file)
}

console.log('✓ ' + uniqueRefs.length + ' local image references')
console.log('✓ ' + missingLocal.length + ' missing local files')
console.log('✓ ' + uncredited.length + ' uncredited gallery images')
console.log('✓ ' + duplicateHashes.length + ' duplicate local hashes')
if (dimensions.length) {
  const maxLongEdge = Math.max(...dimensions.map(item => Math.max(item.width, item.height)))
  const minLongEdge = Math.min(...dimensions.map(item => Math.max(item.width, item.height)))
  console.log('✓ dimensions read: ' + dimensions.length + ' files; long edge ' + minLongEdge + '—' + maxLongEdge + ' px')
}
if (large.length) console.log('⚠ image > 500 KB: ' + large.join(', '))
if (dimensionWarnings.length) console.log('⚠ image long edge > 1600 px: ' + dimensionWarnings.join(', '))
const unconfirmedLicenses = (credits.slice(credits.indexOf('export const imageCredits')).match(/许可见文件页|Commons 文件页许可（以文件页为准）/g) || []).length
console.log('✓ ' + unconfirmedLicenses + ' credits still marked for license-page review')
if (missingLocal.length || uncredited.length || duplicateHashes.length) process.exitCode = 1

if (isDistAudit) {
  const distFiles = await walk(path.join(root, 'dist'), /\.(js|css|html|webmanifest|json|svg)$/i)
  const distText = (await Promise.all(distFiles.map(file => fs.readFile(file, 'utf8')))).join('\n')
  const remoteImageUrls = [
    'commons.wikimedia.org/wiki/Special:Redirect',
    'upload.wikimedia.org',
  ].filter(token => distText.includes(token))
  console.log('✓ dist image URL audit: ' + (remoteImageUrls.length ? 'failed' : 'passed'))
  if (remoteImageUrls.length) {
    console.log('✗ forbidden remote image tokens: ' + remoteImageUrls.join(', '))
    process.exitCode = 1
  } else {
    console.log('  attribution links may remain as original file pages; runtime images are local')
  }
}

async function exists(file) {
  try { await fs.access(file); return true } catch { return false }
}

async function walk(dir, matcher) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...await walk(full, matcher))
    else if (matcher.test(entry.name)) files.push(full)
  }
  return files
}

function readImageDimensions(buffer) {
  if (buffer.length >= 30 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = buffer.toString('ascii', 12, 16)
    if (chunk === 'VP8X') return { width: 1 + buffer[24] + (buffer[25] << 8) + (buffer[26] << 16), height: 1 + buffer[27] + (buffer[28] << 8) + (buffer[29] << 16) }
    if (chunk === 'VP8 ' && buffer.length >= 30 && buffer[23] === 0x9d && buffer[24] === 0x01 && buffer[25] === 0x2a) {
      return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff }
    }
    if (chunk === 'VP8L' && buffer.length >= 25 && buffer[20] === 0x2f) {
      const bits = buffer[21] | (buffer[22] << 8) | (buffer[23] << 16) | (buffer[24] << 24)
      return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >>> 14) & 0x3fff) }
    }
  }
  if (buffer.length >= 24 && buffer.toString('ascii', 1, 4) === 'PNG') return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }
  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) { offset++; continue }
      const marker = buffer[offset + 1]
      const length = buffer.readUInt16BE(offset + 2)
      if (marker >= 0xc0 && marker <= 0xc3) return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) }
      if (length < 2) break
      offset += 2 + length
    }
  }
  return null
}
