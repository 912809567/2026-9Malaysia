import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ExternalLink, MapPin } from 'lucide-react'
import { places } from '../data/places'

export function MapView() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [city, setCity] = useState<'吉隆坡' | '亚庇'>('吉隆坡')
  const mapInstance = useRef<L.Map | null>(null)
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return
    mapInstance.current = L.map(mapRef.current, { zoomControl: false }).setView([3.15, 101.7], 12)
    L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(mapInstance.current)
    window.setTimeout(() => mapInstance.current?.invalidateSize(), 0)
  }, [])
  useEffect(() => {
    const map = mapInstance.current
    if (!map) return
    const target = city === '吉隆坡' ? [3.15, 101.7] as [number, number] : [5.975, 116.075] as [number, number]
    map.setView(target, city === '吉隆坡' ? 12 : 13, { animate: false })
    map.eachLayer((layer) => { if (layer instanceof L.Marker) map.removeLayer(layer) })
    places.filter((place) => place.city === city).forEach((place) => {
      const marker = L.marker([place.lat, place.lng], { icon: L.divIcon({ className: 'trip-marker', html: '<span></span>', iconSize: [14, 14], iconAnchor: [7, 7] }) }).addTo(map)
      marker.bindPopup(`<strong>${place.name}</strong><br/>${place.use}<br/><a href="https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}" target="_blank" rel="noreferrer">Google Maps 导航 ↗</a>`)
    })
  }, [city])
  return <div className="map-shell">
    <div className="map-tabs" role="tablist">{(['吉隆坡', '亚庇'] as const).map((item) => <button key={item} className={city === item ? 'active' : ''} onClick={() => setCity(item)} role="tab" aria-selected={city === item}><MapPin size={15} />{item}</button>)}</div>
    <div className="map" ref={mapRef} />
    <div className="map-note"><span>点击标记查看当天用途</span><a href="https://www.openstreetmap.org" target="_blank" rel="noreferrer">OpenStreetMap <ExternalLink size={13} /></a></div>
  </div>
}
