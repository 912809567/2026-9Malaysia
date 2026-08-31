import type {ItineraryItem} from '../data/itinerary'
export type NextEvent=ItineraryItem & {date:string}
export function getNextEvent(items:NextEvent[],now=new Date()){return items.filter(item=>new Date(item.dateTime).getTime()>now.getTime()).sort((a,b)=>new Date(a.dateTime).getTime()-new Date(b.dateTime).getTime())[0]}
