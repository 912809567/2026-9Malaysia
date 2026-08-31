import {trip} from '../data/trip'
export function currentTripDate(){const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kuala_Lumpur',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());if(today<trip.start)return trip.start;if(today>trip.end)return trip.end;return today}
export function currentShortDay(){const date=currentTripDate();return `${Number(date.slice(5,7))}/${Number(date.slice(8,10))}`}
