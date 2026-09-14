// LeafletMapPicker.jsx - Interactive Map Pinpoint with Draggable Marker & Search Geocoding
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Search, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon URLs for bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

export default function LeafletMapPicker({
  latitude = -6.2088,
  longitude = 106.8456,
  onCoordinateChange,
  height = '280px'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [currentLat, setCurrentLat] = useState(latitude || -6.2088);
  const [currentLng, setCurrentLng] = useState(longitude || 106.8456);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = Number(latitude) || -6.2088;
      const initialLng = Number(longitude) || 106.8456;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Custom pulsing livestock pin icon
      const customPinIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `
          <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(5, 150, 105, 0.3); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 28px; height: 28px; border-radius: 50%; background: #059669; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">
              📍
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker([initialLat, initialLng], {
        draggable: true,
        icon: customPinIcon
      }).addTo(map);

      // Marker drag event
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setCurrentLat(pos.lat);
        setCurrentLng(pos.lng);
        if (onCoordinateChange) {
          onCoordinateChange(pos.lat, pos.lng);
        }
      });

      // Map click event: move marker to clicked spot
      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        setCurrentLat(e.latlng.lat);
        setCurrentLng(e.latlng.lng);
        if (onCoordinateChange) {
          onCoordinateChange(e.latlng.lat, e.latlng.lng);
        }
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center when props change externally
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && latitude && longitude) {
      const lat = Number(latitude);
      const lng = Number(longitude);
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.setView([lat, lng], mapInstanceRef.current.getZoom());
      setCurrentLat(lat);
      setCurrentLng(lng);
    }
  }, [latitude, longitude]);

  // Geocoding search with OpenStreetMap Nominatim
  const handleSearchLocation = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError('');
    try {
      const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Indonesia')}&limit=1`;
      const res = await fetch(endpoint, {
        headers: { 'Accept-Language': 'id' }
      });
      const data = await res.json();

      if (data && data.length > 0) {
        const foundLat = parseFloat(data[0].lat);
        const foundLng = parseFloat(data[0].lon);

        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([foundLat, foundLng]);
          mapInstanceRef.current.setView([foundLat, foundLng], 15);
        }

        setCurrentLat(foundLat);
        setCurrentLng(foundLng);
        if (onCoordinateChange) {
          onCoordinateChange(foundLat, foundLng, data[0].display_name);
        }
      } else {
        setSearchError('Wilayah tidak ditemukan. Coba ketik nama kecamatan atau kota.');
      }
    } catch (err) {
      setSearchError('Gagal mencari wilayah di peta.');
    } finally {
      setIsSearching(false);
    }
  };

  // Device GPS Location
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolokasi tidak didukung oleh browser Anda.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          mapInstanceRef.current.setView([lat, lng], 16);
        }
        setCurrentLat(lat);
        setCurrentLng(lng);
        if (onCoordinateChange) {
          onCoordinateChange(lat, lng);
        }
      },
      () => {
        alert('Gagal membaca sinyal GPS. Pastikan izin lokasi diaktifkan.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="space-y-2 rounded-2xl overflow-hidden border border-theme-border bg-theme-bg/40 p-2.5">
      {/* Map Search & Auto-Center Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Cari kelurahan, kecamatan, atau kota..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchLocation(e)}
            className="w-full bg-theme-card border border-theme-border rounded-xl pl-9 pr-8 py-2 text-xs text-theme-text placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
          />
          <Search className="w-3.5 h-3.5 text-theme-muted absolute left-3 top-2.5" />
          {isSearching && (
            <div className="w-3.5 h-3.5 border-2 border-theme-primary border-t-transparent rounded-full animate-spin absolute right-3 top-2.5" />
          )}
        </div>

        <button
          type="button"
          onClick={handleSearchLocation}
          disabled={isSearching || !searchQuery.trim()}
          className="px-3 py-2 rounded-xl bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-50 text-white text-xs font-bold transition-all flex-shrink-0"
        >
          Cari
        </button>

        <button
          type="button"
          onClick={handleLocateMe}
          title="Fokuskan ke Posisi GPS Saya"
          className="p-2 rounded-xl bg-theme-card border border-theme-border hover:bg-theme-border/50 text-theme-text transition-colors flex-shrink-0"
        >
          <Navigation className="w-4 h-4 text-theme-primary" />
        </button>
      </div>

      {searchError && (
        <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-[11px] flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{searchError}</span>
        </div>
      )}

      {/* Leaflet Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{ height }}
        className="w-full rounded-xl overflow-hidden shadow-inner border border-theme-border/60 z-0 relative"
      />

      {/* Coordinate & Instruction Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-theme-muted pt-1 px-1">
        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
          <MapPin className="w-3.5 h-3.5" />
          <span>Tikor Terpilih: {Number(currentLat).toFixed(5)}, {Number(currentLng).toFixed(5)}</span>
        </div>
        <p className="text-[10px] text-theme-muted">
          *Geser pin merah atau klik di peta untuk mengunci titik jemput/antar.
        </p>
      </div>
    </div>
  );
}
