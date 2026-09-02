import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const manifestPath = path.join(root, 'scripts', 'alternative-image-manifest.json')

// Keep the search terms narrow and verify every result's title. Commons'
// full-text search can otherwise return a different nearby landmark.
const targets = [
  ['kl-tower', 'kuala-lumpur/kl-tower', 'Kuala Lumpur Tower Menara Kuala Lumpur', /Kuala Lumpur Tower|Menara Kuala Lumpur|Menara KL/i],
  ['saloma-link', 'kuala-lumpur/saloma-link', 'Saloma Link Bridge', /Saloma Link|Saloma Bridge/i],
  ['national-mosque', 'kuala-lumpur/national-mosque', 'National Mosque Malaysia', /National.?Mosque|Masjid.?Negara/i],
  ['thean-hou-temple', 'kuala-lumpur/thean-hou', 'Thean Hou Temple Kuala Lumpur', /Thean Hou/i],
  ['national-museum', 'kuala-lumpur/national-museum', 'National Museum Kuala Lumpur', /National Museum|Muzium Negara/i],
  ['islamic-arts-museum', 'kuala-lumpur/islamic-arts-museum', 'Islamic Arts Museum Malaysia', /Islamic.?Arts.?Museum/i],
  ['bank-negara-museum', 'kuala-lumpur/bank-negara-museum', 'Bank Negara Malaysia Museum', /Bank Negara.*Museum|Museum.*Bank Negara/i],
  ['kl-forest-eco-park', 'kuala-lumpur/forest-eco-park', 'KL Forest Eco Park', /KL Forest Eco.?Park|Forest Eco.?Park/i],
  ['perdana-botanical-gardens', 'kuala-lumpur/perdana-gardens', 'Perdana Botanical Gardens Kuala Lumpur', /Perdana Botanical Gardens/i],
  ['kl-bird-park', 'kuala-lumpur/kl-bird-park', 'Kuala Lumpur Bird Park', /Kuala Lumpur Bird Park|Bird Park/i],
  ['trx', 'kuala-lumpur/trx', 'The Exchange TRX Kuala Lumpur', /The Exchange TRX|TRX/i],
  ['aquaria-klcc', 'kuala-lumpur/aquaria-klcc', 'Aquaria KLCC', /Aquaria KLCC/i],
  ['petrosains', 'kuala-lumpur/petrosains', 'Petrosains Kuala Lumpur', /Petrosains/i],
  ['jalan-alor', 'kuala-lumpur/jalan-alor', 'Jalan Alor Kuala Lumpur', /Jalan Alor/i],
  ['little-india-brickfields', 'kuala-lumpur/little-india', 'Little India Brickfields Kuala Lumpur', /Little India.*Brickfields|Brickfields/i],
  ['batu-caves', 'kuala-lumpur/batu-caves', 'Batu Caves Kuala Lumpur', /Batu.?Caves/i],
  ['sabah-museum', 'kota-kinabalu/sabah-museum', 'Sabah State Museum Kota Kinabalu', /Sabah State Museum|Sabah Museum/i],
  ['kk-city-mosque', 'kota-kinabalu/city-mosque', 'Kota Kinabalu City Mosque', /Kota Kinabalu City Mosque|City Mosque/i],
  ['sabah-state-mosque', 'kota-kinabalu/state-mosque', 'Sabah State Mosque Kota Kinabalu', /Sabah.?State.?Mosque|SabahStateMosque/i],
  ['sabah-art-gallery', 'kota-kinabalu/sabah-art-gallery', 'Sabah Art Gallery Kota Kinabalu', /Sabah Art Gallery/i],
  ['kk-wetlands', 'kota-kinabalu/kk-wetlands', 'Kota Kinabalu Wetlands', /Kota Kinabalu Wetlands|KK Wetlands|Bird Watch Tower at KK/i],
  ['ums-aquarium', 'kota-kinabalu/ums-aquarium', 'Aquarium Marine Museum UMS', /Aquarium.*UMS|UMS.*Aquarium|Marine Museum.*UMS/i],
  ['mari-mari', 'kota-kinabalu/mari-mari', 'Mari Mari Cultural Village', /Mari Mari Cultural Village/i],
  ['menara-tun-mustapha', 'kota-kinabalu/menara-tun-mustapha', 'Menara Tun Mustapha Sabah', /Menara.?Tun.?Mustapha|Sabah.?Foundation.?Building/i],
  ['double-six', 'kota-kinabalu/double-six', 'Double Six Monument Kota Kinabalu', /Double Six Monument|TuguPeringatan.*DoubleSix/i],
  ['handicraft-market', 'kota-kinabalu/handicraft-market', 'Kota Kinabalu Handicraft Market', /Handicraft Market.*Kota Kinabalu|Kota Kinabalu.*Handicraft|Handicraft Market/i],
  ['filipino-market', 'kota-kinabalu/filipino-market', 'Filipino Market Kota Kinabalu', /Filipino Market.*Kota Kinabalu|Kota Kinabalu.*Filipino Market/i],
  ['north-borneo-sunset-cruise', 'kota-kinabalu/sunset-cruise', 'North Borneo Cruises Kota Kinabalu', /North Borneo Cruises|North Borneo Sunset Cruise/i],
  ['sepanggar-island', 'kota-kinabalu/sepanggar-island', 'Sepanggar Island Sabah', /Sepanggar Island/i],
  ['kinabalu-park-kundasang', 'kota-kinabalu/kinabalu-park', 'Kinabalu Park Mount Kinabalu Kundasang', /Kinabalu Park|Mount Kinabalu/i],
  ['desa-dairy-farm', 'kota-kinabalu/desa-dairy-farm', 'Desa Dairy Farm Kundasang', /Desa Dairy Farm|Desa Cattle Dairy Farm/i],
  ['poring-hot-spring', 'kota-kinabalu/poring-hot-spring', 'Poring Hot Spring Sabah', /Poring.?Hot.?Spring/i],
]

const probeOnly = process.argv.includes('--probe')
const onlyArgument = process.argv.find(argument => argument.startsWith('--only='))
const onlyIds = onlyArgument ? onlyArgument.slice('--only='.length).split(',').filter(Boolean) : []
const targetsToProcess = onlyIds.length ? targets.filter(([id]) => onlyIds.includes(id)) : targets
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
const clean = value => String(value ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
const cleanWiki = value => clean(value).replace(/\[\[([^\]|]+\|)?([^\]]+)\]\]/g, '$2').replace(/\{\{[^}]+\}\}/g, '').trim()
const usableLicense = value => /Creative Commons|CC BY|Public domain|GFDL|Free Art/i.test(value)
const forbiddenTitle = value => /^(Category|Template):|logo|map|flag|icon|diagram|poster|collage|butterfly.?park|textile|mini.?bus|certificate|book.?of.?records|circa|KITLV/i.test(value)

async function fetchJson(url) {
  let lastError
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25_000)
    try {
      const response = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'malaysia-trip-2026-image-audit/1.0 (local build)' } })
      if (response.ok) return await response.json()
      lastError = new Error(`${response.status} ${response.statusText}`)
    } catch (error) {
      lastError = error
    } finally {
      clearTimeout(timeout)
    }
    await sleep(2_000 * (attempt + 1))
  }
  throw lastError ?? new Error('request failed')
}

function imageUrlAt1280(url) {
  return String(url).replace(/\/60px-/g, '/1280px-').replace(/-60px-/g, '-1280px-')
}

function authorFromSource(source) {
  const match = String(source ?? '').match(/\|author\s*=\s*([^\n]+)/i)
  return cleanWiki(match?.[1] || 'Wikimedia Commons 文件页署名')
}

async function search(query, titlePattern) {
  const url = 'https://api.wikimedia.org/core/v1/commons/search/page?q=' + encodeURIComponent(query) + '&limit=30'
  const json = await fetchJson(url)
  const selected = []
  const seen = new Set()
  for (const page of json.pages ?? []) {
    const title = clean(page.title)
    if (!page.key || seen.has(page.key) || !titlePattern.test(title) || forbiddenTitle(title) || !page.thumbnail?.url) continue
    try {
      const detail = await fetchJson('https://api.wikimedia.org/core/v1/commons/page/' + encodeURIComponent(page.key))
      const license = clean(detail.license?.title)
      if (!usableLicense(license)) continue
      selected.push({
        title,
        imageUrl: imageUrlAt1280(page.thumbnail.url),
        sourceUrl: 'https://commons.wikimedia.org/wiki/' + page.key.replace(/ /g, '_'),
        author: authorFromSource(detail.source),
        license,
        licenseUrl: detail.license?.url || undefined,
        width: page.thumbnail.width,
        height: page.thumbnail.height,
      })
      seen.add(page.key)
      if (selected.length === 2) break
    } catch (error) {
      console.warn(`! metadata ${title}: ${error instanceof Error ? error.message : String(error)}`)
    }
    await sleep(250)
  }
  return selected
}

async function download(url) {
  let lastError
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30_000)
    try {
      const response = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'malaysia-trip-2026-image-audit/1.0' } })
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
      return Buffer.from(await response.arrayBuffer())
    } catch (error) {
      lastError = error
    } finally {
      clearTimeout(timeout)
    }
    await sleep(2_000 * (attempt + 1))
  }
  throw lastError ?? new Error('download failed')
}

let manifest = []
if (onlyIds.length) {
  try {
    manifest = JSON.parse(await readFile(manifestPath, 'utf8')).filter(item => !onlyIds.includes(item.id))
  } catch {
    manifest = []
  }
}
for (const [id, folder, query, titlePattern] of targetsToProcess) {
  await sleep(400)
  try {
    const selected = await search(query, titlePattern)
    if (probeOnly) {
      console.log(`${id}: ${selected.map(item => item.title).join(' | ') || 'NO_MATCH'}`)
      continue
    }
    if (!selected.length) {
      console.warn(`! ${id}: no licensed, title-matched Commons image found`)
      continue
    }
    const dir = path.join(root, 'public', 'images', 'alternatives', folder)
    await rm(dir, { recursive: true, force: true })
    await mkdir(dir, { recursive: true })
    for (let i = 0; i < selected.length; i += 1) {
      const item = selected[i]
      try {
        const buffer = await download(item.imageUrl)
        const file = `images/alternatives/${folder}/${id}-${String(i + 1).padStart(2, '0')}.jpg`
        await writeFile(path.join(root, 'public', file), buffer)
        manifest.push({ id, index: i + 1, file, ...item, bytes: buffer.length })
      } catch (error) {
        console.warn(`! ${id} image ${i + 1}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    console.log(`✓ ${id}: ${selected.map(item => item.title).join(' | ')}`)
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
  } catch (error) {
    console.warn(`! ${id}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

if (!probeOnly) {
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
  console.log(`Downloaded ${manifest.length} licensed, title-matched Wikimedia Commons images.`)
}
