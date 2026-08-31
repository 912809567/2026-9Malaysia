import {useState} from 'react'
import type {ImgHTMLAttributes} from 'react'
import {Image as ImageIcon} from 'lucide-react'
import {assetUrl} from '../utils/assetUrl'

export function resolveImageSrc(src:string){
  return /^https?:\/\//.test(src) ? src : assetUrl(src)
}

type Props = Pick<ImgHTMLAttributes<HTMLImageElement>, 'className'|'loading'|'decoding'> & {src:string;alt:string}

export function ResponsiveImage({src,alt,className,loading='lazy',decoding='async'}:Props){
  const [failed,setFailed]=useState(false)
  if(failed)return <div className={[className,'image-fallback'].filter(Boolean).join(' ')} role="img" aria-label={alt||'图片暂不可用'}><ImageIcon size={18}/><span>{alt||'图片暂不可用'}</span></div>
  return <img className={className} src={resolveImageSrc(src)} alt={alt} loading={loading} decoding={decoding} onError={()=>{console.warn('[gallery] image unavailable:',src);setFailed(true)}}/>
}
