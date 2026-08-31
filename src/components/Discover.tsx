import {useMemo,useState} from 'react'
import {Bookmark,ExternalLink,Heart,Image as ImageIcon} from 'lucide-react'
import {discoverPlaces,type DiscoverCategory,type DiscoverPlace} from '../data/discover'
import {imageCredits} from '../data/imageCredits'
import {ResponsiveImage} from './ResponsiveImage'
import type {SabahDate,SabahPlan} from '../utils/planSabah'

type Props={plan:SabahPlan;mangrove:boolean;mangroveDay:SabahDate;onOpenDay:(day:string)=>void;onOpenGallery:(place:DiscoverPlace,index?:number)=>void}
const categories:DiscoverCategory[]=['吉隆坡','亚庇城市','海岛与活动']

function activityDay(activity:DiscoverPlace['activity'],plan:SabahPlan,mangrove:boolean,mangroveDay:SabahDate){
  if(!activity)return undefined
  const entry=activity==='mangrove'&&mangrove?mangroveDay:Object.entries(plan).find(([,value])=>value===activity)?.[0]
  return entry?'9/'+Number(entry.slice(8,10)):undefined
}
function placeUrl(place:DiscoverPlace){return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(place.placeName||place.english)}

function Picture({place,onClick}:{place:DiscoverPlace;onClick:(index:number)=>void}){
  const image=place.images[place.coverImageIndex??0]
  return <button className="discover-picture" onClick={()=>onClick(place.coverImageIndex??0)} aria-label={'查看'+place.title+'相册'}>
    {image?<ResponsiveImage className="discover-cover-image" src={image.src} alt={image.alt}/>:<div className="discover-placeholder"><ImageIcon size={24}/><span>{place.title}</span></div>}
    {place.images.length>1&&<span className="picture-count">▧ {place.images.length}</span>}
    <span className="picture-open">查看相册</span>
  </button>
}

function PlaceCard({place,favorite,onFavorite,onOpenDay,onImage,plan,mangrove,mangroveDay}:{place:DiscoverPlace;favorite:boolean;onFavorite:()=>void;onOpenDay:(day:string)=>void;onImage:(index:number)=>void;plan:SabahPlan;mangrove:boolean;mangroveDay:SabahDate}){
  const day=place.activity?activityDay(place.activity,plan,mangrove,mangroveDay):place.day
  return <article className="card discover-card">
    <div className="discover-card-top">
      <Picture place={place} onClick={onImage}/>
      {place.images.length>1&&<div className="discover-mini-thumbs" aria-label="相册预览">{place.images.slice(0,3).map((image,index)=><button key={image.creditId} onClick={()=>onImage(index)} aria-label={'查看'+place.title+'第'+(index+1)+'张'}><ResponsiveImage src={image.src} alt="" loading="lazy"/></button>)}</div>}
      <button className={'bookmark '+(favorite?'saved':'')} onClick={onFavorite} aria-label={favorite?'取消收藏':'收藏'}>{favorite?<Heart size={16} fill="currentColor"/>:<Bookmark size={16}/>}</button>
    </div>
    <div className="discover-copy">
      <div className="micro">{place.english}</div><h3>{place.title}</h3>
      <p className="discover-position">{place.positioning}</p>
      <div className="tag-list">{place.tags.map(tag=><span className="tag" key={tag}>{tag}</span>)}</div>
      <p className="discover-intro">{place.intro}</p>
      {place.details&&<details className="discover-details"><summary>展开小档案</summary>{place.details.map(detail=><span key={detail}>· {detail}</span>)}</details>}
      <div className="discover-actions">{day&&<button className="ghost-btn small" onClick={()=>onOpenDay(day)}>查看 {day} ↗</button>}<a className="ghost-btn small" href={placeUrl(place)} target="_blank" rel="noreferrer">导航 <ExternalLink size={12}/></a></div>
    </div>
  </article>
}

export function Discover({plan,mangrove,mangroveDay,onOpenDay,onOpenGallery}:Props){
  const [category,setCategory]=useState<DiscoverCategory>('吉隆坡')
  const [view,setView]=useState<'cards'|'gallery'>('cards')
  const [onlySaved,setOnlySaved]=useState(false)
  const [saved,setSaved]=useState<string[]>(()=>{try{return JSON.parse(localStorage.getItem('trip-favorites')||'[]')}catch{return []}})
  const filtered=useMemo(()=>discoverPlaces.filter(place=>onlySaved?saved.includes(place.id):place.category===category),[category,onlySaved,saved])
  const toggle=(id:string)=>setSaved(prev=>{const next=prev.includes(id)?prev.filter(item=>item!==id):[...prev,id];localStorage.setItem('trip-favorites',JSON.stringify(next));return next})
  const allCredits=useMemo(()=>discoverPlaces.map(place=>({place,credits:place.images.map(image=>imageCredits.find(credit=>credit.id===image.creditId)).filter(Boolean)})),[])
  return <section className="section" id="discover">
    <div className="section-head"><div><div className="section-kicker">12 · discover</div><h2>景点与活动图鉴</h2></div><div className="section-note">不想读完整攻略时，先看“这个地方到底是什么”。图片、定位和动态行程入口都收在这里。</div></div>
    <div className="discover-toolbar"><div className="discover-tabs" role="tablist">{categories.map(item=><button key={item} className={category===item&&!onlySaved?'active':''} onClick={()=>{setCategory(item);setOnlySaved(false)}} role="tab">{item}</button>)}<button className={onlySaved?'active':''} onClick={()=>setOnlySaved(true)}><Heart size={14}/>我的收藏 {saved.length}</button></div><div className="view-toggle"><button className={view==='cards'?'active':''} onClick={()=>setView('cards')}>卡片</button><button className={view==='gallery'?'active':''} onClick={()=>setView('gallery')}>Gallery</button></div></div>
    {filtered.length===0?<div className="card empty-state">还没有收藏。点景点卡右上角的书签，把想去、想吃、想拍照的内容留下来。</div>:<div className={view==='cards'?'discover-grid':'gallery-grid'}>{filtered.map(place=><PlaceCard key={place.id} place={place} favorite={saved.includes(place.id)} onFavorite={()=>toggle(place.id)} onOpenDay={onOpenDay} onImage={index=>onOpenGallery(place,index)} plan={plan} mangrove={mangrove} mangroveDay={mangroveDay}/>)}</div>}
    <details className="credits"><summary>图片来源（按景点分组）</summary>{allCredits.map(({place,credits})=><div className="credit-group" key={place.id}><strong>{place.title}</strong>{credits.map(credit=>credit&&<a href={credit.original} target="_blank" rel="noreferrer" key={credit.id}>{credit.file} · {credit.author} · {credit.license}</a>)}</div>)}</details>
  </section>
}
