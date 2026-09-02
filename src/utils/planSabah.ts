export type Weather='good'|'okay'|'bad'
export type SabahActivity='mengalum'|'tarp'|'mangrove'|'city'|'rest'
export type SabahDate='2026-09-10'|'2026-09-11'|'2026-09-12'
export type SabahPlan=Record<SabahDate,SabahActivity>
export type SabahWeather=Record<SabahDate,Weather>
export const sabahDates:SabahDate[]=['2026-09-10','2026-09-11','2026-09-12']
export const defaultSabahWeather:SabahWeather={'2026-09-10':'good','2026-09-11':'okay','2026-09-12':'good'}
export const defaultSabahPlan:SabahPlan={'2026-09-10':'mengalum','2026-09-11':'rest','2026-09-12':'tarp'}
export function planSabah(weather:SabahWeather):SabahPlan{
 const plan:SabahPlan={'2026-09-10':'city','2026-09-11':'rest','2026-09-12':'rest'}
 const firstGood=sabahDates.find(day=>weather[day]==='good')
 if(firstGood) plan[firstGood]='mengalum'
 const candidates=sabahDates.filter(day=>day!==firstGood && weather[day]!=='bad').sort((a,b)=>({good:2,okay:1,bad:0}[weather[b]]-({good:2,okay:1,bad:0}[weather[a]])))
 if(candidates[0]) plan[candidates[0]]='tarp'
 return plan
}
export function activityLabel(activity:SabahActivity){return {mengalum:'环滩岛',tarp:'TARP近海双岛 · 沙比岛＋马努干岛',mangrove:'Klias红树林＋萤火虫',city:'亚庇市区',rest:'休息 / 机动'}[activity]}
export function shortDate(date:SabahDate){return `9/${Number(date.slice(8,10))}`}
