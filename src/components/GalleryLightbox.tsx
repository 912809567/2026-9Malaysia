import {useEffect,useRef,useState} from 'react'
import {ChevronLeft,ChevronRight,X} from 'lucide-react'
import type {TouchEvent} from 'react'
import type {DiscoverPlace} from '../data/discover'
import {imageCredits} from '../data/imageCredits'
import {ResponsiveImage,resolveImageSrc} from './ResponsiveImage'

type Props={place:DiscoverPlace;initialIndex?:number;onClose:()=>void;onOpenDay?: (day:string)=>void;day?:string}

export function GalleryLightbox({place,initialIndex=0,onClose,onOpenDay,day}:Props){
  const [index,setIndex]=useState(Math.min(Math.max(initialIndex,0),Math.max(place.images.length-1,0)))
  const touchStart=useRef<{x:number;y:number}|null>(null)
  const image=place.images[index]
  const credit=imageCredits.find(item=>item.id===image.creditId)
  useEffect(()=>setIndex(Math.min(Math.max(initialIndex,0),Math.max(place.images.length-1,0))),[place.id,initialIndex,place.images.length])
  useEffect(()=>{
    const previous=document.body.style.overflow
    document.body.style.overflow='hidden'
    const handleKey=(event:KeyboardEvent)=>{
      if(event.key==='Escape')onClose()
      if(event.key==='ArrowLeft')setIndex(current=>(current-1+place.images.length)%place.images.length)
      if(event.key==='ArrowRight')setIndex(current=>(current+1)%place.images.length)
    }
    window.addEventListener('keydown',handleKey)
    return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',handleKey)}
  },[onClose,place.images.length])
  useEffect(()=>{
    const adjacent=[place.images[(index-1+place.images.length)%place.images.length],place.images[(index+1)%place.images.length]]
    adjacent.forEach(item=>{if(item?.src){const preload=new Image();preload.src=resolveImageSrc(item.src)}})
  },[index,place.images])
  const move=(delta:number)=>setIndex(current=>(current+delta+place.images.length)%place.images.length)
  const handleTouchStart=(event:TouchEvent)=>{const touch=event.changedTouches[0];touchStart.current=touch?{x:touch.clientX,y:touch.clientY}:null}
  const handleTouchEnd=(event:TouchEvent)=>{
    if(touchStart.current===null)return
    const touch=event.changedTouches[0]
    if(!touch){touchStart.current=null;return}
    const deltaX=touch.clientX-touchStart.current.x
    const deltaY=touch.clientY-touchStart.current.y
    if(Math.abs(deltaX)>45&&Math.abs(deltaX)>Math.abs(deltaY)*1.2)move(deltaX<0?1:-1)
    touchStart.current=null
  }
  return <div className="lightbox" role="dialog" aria-modal="true" aria-label={place.title} onClick={onClose}>
    <button className="lightbox-close" onClick={onClose} aria-label="关闭相册"><X/></button>
    <div className="lightbox-content" onClick={event=>event.stopPropagation()} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="gallery-stage">
        <ResponsiveImage className="gallery-image" src={image.src} alt={image.alt} loading="eager"/>
        {image.isReference&&<span className="reference-badge">{image.referenceLabel??'体验示意'}</span>}
        {place.images.length>1&&<><button className="gallery-control gallery-prev" onClick={()=>move(-1)} aria-label="上一张"><ChevronLeft/></button><button className="gallery-control gallery-next" onClick={()=>move(1)} aria-label="下一张"><ChevronRight/></button></>}
        <span className="gallery-count">{index+1} / {place.images.length}</span>
      </div>
      <div className="gallery-thumbs" aria-label="相册缩略图">{place.images.map((item,itemIndex)=><button className={itemIndex===index?'active':''} key={item.creditId} onClick={()=>setIndex(itemIndex)} aria-label={'查看第'+(itemIndex+1)+'张'}><img src={resolveImageSrc(item.src)} alt="" loading="lazy"/></button>)}</div>
      <div className="lightbox-meta"><div className="micro">{place.english}</div><h3>{place.title}</h3>{image.caption&&<p className="gallery-caption">{image.caption}</p>}{credit&&<div className="gallery-credit">Photo · {credit.author} · {credit.license} · <a href={credit.original} target="_blank" rel="noreferrer">来源页 ↗</a></div>}{day&&onOpenDay&&<button className="ghost-btn small" onClick={()=>{onClose();onOpenDay(day)}}>查看 {day} 行程 ↗</button>}</div>
    </div>
  </div>
}
