import {createHash} from 'node:crypto'
import {promises as fs} from 'node:fs'
import path from 'node:path'

const root=process.cwd()
const discover=await fs.readFile(path.join(root,'src/data/discover.ts'),'utf8')
const credits=await fs.readFile(path.join(root,'src/data/imageCredits.ts'),'utf8')
const imageRefs=[...discover.matchAll(/creditId:'([^']+)'/g)].map(match=>match[1])
const sourceRefs=[...discover.matchAll(/commonsImage\\('([^']+)'\\)/g)].map(match=>match[1])
const creditIds=new Set([...credits.matchAll(/(?:id|commonsCredit)[:(]'([^']+)'/g)].map(match=>match[1]))
const localRefs=[...discover.matchAll(/src:'([^']+\.(?:webp|png|jpe?g))'/g)].map(match=>match[1])
const missingLocal=[]
for(const ref of localRefs){if(!await exists(path.join(root,'public',ref)))missingLocal.push(ref)}
const emptyPlaces=[...discover.matchAll(/\{id:'([^']+)'[^\n]*images:\[\]/g)].map(match=>match[1])
const uncredited=imageRefs.filter(id=>!creditIds.has(id))
const duplicateSources=sourceRefs.filter((file,index)=>sourceRefs.indexOf(file)!==index)
const placeLines=discover.split('\n').filter(line=>line.trim().startsWith('{id:'))
const coverOwners=new Map()
const reusedCovers=[]
for(const line of placeLines){
  const place=line.match(/\{id:'([^']+)'/)
  const cover=line.match(/creditId:'([^']+)'/)
  if(!place||!cover)continue
  const owner=coverOwners.get(cover[1])
  if(owner&&owner!==place[1])reusedCovers.push(cover[1]+' ('+owner+' / '+place[1]+')')
  coverOwners.set(cover[1],place[1])
}
const imageFiles=await walk(path.join(root,'public','images'))
const large=[]
const hashes=new Map()
const duplicateHashes=[]
for(const file of imageFiles){
  const stat=await fs.stat(file)
  if(stat.size>500*1024)large.push(path.relative(root,file)+' ('+Math.round(stat.size/1024)+' KB)')
  const hash=createHash('sha256').update(await fs.readFile(file)).digest('hex')
  const old=hashes.get(hash)
  if(old)duplicateHashes.push(path.relative(root,old)+' = '+path.relative(root,file))
  hashes.set(hash,file)
}
const problems=missingLocal.length+emptyPlaces.length+uncredited.length+reusedCovers.length+duplicateHashes.length+duplicateSources.length
console.log('✓ '+imageRefs.length+' gallery images with explicit source refs')
console.log('✓ '+duplicateSources.length+' duplicate remote source refs')
console.log('✓ '+missingLocal.length+' missing local files')
console.log('✓ '+uncredited.length+' uncredited images')
console.log('✓ '+duplicateHashes.length+' duplicate local hashes')
console.log('✓ '+reusedCovers.length+' reused covers across places')
if(emptyPlaces.length)console.log('⚠ empty images: '+emptyPlaces.join(', '))
if(large.length)console.log('⚠ image > 500 KB: '+large.join(', '))
if(problems)process.exitCode=1

async function exists(file){try{await fs.access(file);return true}catch{return false}}
async function walk(dir){const entries=await fs.readdir(dir,{withFileTypes:true});const files=[];for(const entry of entries){const full=path.join(dir,entry.name);if(entry.isDirectory())files.push(...await walk(full));else if(/\.(webp|png|jpe?g)$/i.test(entry.name))files.push(full)}return files}
