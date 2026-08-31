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
const hashes = new Map()
const duplicateHashes = []
for (const file of imageFiles) {
  const stat = await fs.stat(file)
  if (stat.size > 500 * 1024) large.push(path.relative(root, file) + ' (' + Math.round(stat.size / 1024) + ' KB)')
  const hash = createHash('sha256').update(await fs.readFile(file)).digest('hex')
  const old = hashes.get(hash)
  if (old) duplicateHashes.push(path.relative(root, old) + ' = ' + path.relative(root, file))
  hashes.set(hash, file)
}

console.log('✓ ' + uniqueRefs.length + ' local image references')
console.log('✓ ' + missingLocal.length + ' missing local files')
console.log('✓ ' + uncredited.length + ' uncredited gallery images')
console.log('✓ ' + duplicateHashes.length + ' duplicate local hashes')
if (large.length) console.log('⚠ image > 500 KB: ' + large.join(', '))
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
