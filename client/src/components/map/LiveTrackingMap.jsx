// LiveTrackingMap.jsx - Interactive Leaflet Map for Livestock Logistics
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function LiveTrackingMap({
  origin,       // { lat, lng, name }
  destination,  // { lat, lng, name }
  courierPos,   // { lat, lng, driverName, vehiclePlate }
  checkpoints = [], // array of { lat, lng, status_label, is_rest_stop, recorded_at }
  height = '420px'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);

  // Cleanup map instance on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.stop();
          mapInstanceRef.current.remove();
        } catch (e) {
          // ignore cleanup errors
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const safeCoord = (val, fallback = 0) => {
      if (val === null || val === undefined) return fallback;
      const num = typeof val === 'number' ? val : parseFloat(val);
      return isNaN(num) ? fallback : num;
    };

    // Center point fallback
    const defaultCenter = courierPos?.lat
      ? [safeCoord(courierPos.lat), safeCoord(courierPos.lng)]
      : [safeCoord(origin?.lat, -6.2088), safeCoord(origin?.lng, 106.8456)];

    // Initialize Map if not already created
    if (!mapInstanceRef.current) {
      if (mapContainerRef.current._leaflet_id) {
        delete mapContainerRef.current._leaflet_id;
      }

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 11,
        zoomControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const group = markersGroupRef.current;
    group.clearLayers();

    const bounds = [];

    // Custom Icon Generators
    const farmIcon = L.divIcon({
      className: 'custom-farm-marker',
      html: `
        <div style="background-color: #059669; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white; font-size: 16px;">
          🏡
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    const destIcon = L.divIcon({
      className: 'custom-dest-marker',
      html: `
        <div style="background-color: #dc2626; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white; font-size: 16px;">
          📍
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    const truckIcon = L.divIcon({
      className: 'custom-truck-marker',
      html: `
        <div style="position: relative;">
          <div style="position: absolute; -webkit-animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; width: 44px; height: 44px; border-radius: 50%; background-color: rgba(16, 185, 129, 0.4); top: -4px; left: -4px;"></div>
          <div style="background-color: #0284c7; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 14px rgba(0,0,0,0.35); border: 2px solid white; font-size: 18px; position: relative;">
            🚚
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    const restStopIcon = L.divIcon({
      className: 'custom-rest-marker',
      html: `
        <div style="background-color: #d97706; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.25); border: 2px solid white; font-size: 13px;">
          🌿
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    // 1. Add Origin Marker
    if (origin && origin.lat && origin.lng) {
      const oLat = safeCoord(origin.lat);
      const oLng = safeCoord(origin.lng);
      L.marker([oLat, oLng], { icon: farmIcon })
        .bindPopup(`<b>Kandang Asal:</b><br/>${origin.name || 'Peternakan'}`)
        .addTo(group);
      bounds.push([oLat, oLng]);
    }

    // 2. Add Destination Marker
    if (destination && destination.lat && destination.lng) {
      const dLat = safeCoord(destination.lat);
      const dLng = safeCoord(destination.lng);
      L.marker([dLat, dLng], { icon: destIcon })
        .bindPopup(`<b>Alamat Pembeli:</b><br/>${destination.name || 'Lokasi Tujuan'}`)
        .addTo(group);
      bounds.push([dLat, dLng]);
    }

    // 3. Add Courier Truck Position
    if (courierPos && courierPos.lat && courierPos.lng) {
      const cLat = safeCoord(courierPos.lat);
      const cLng = safeCoord(courierPos.lng);
      L.marker([cLat, cLng], { icon: truckIcon })
        .bindPopup(`<b>Armada Khusus Ternak:</b><br/>Driver: ${courierPos.driverName || 'Kurir'}<br/>Nopol: ${courierPos.vehiclePlate || '-'}`)
        .addTo(group);
      bounds.push([cLat, cLng]);
    }

    // 4. Add Checkpoint Markers
    if (Array.isArray(checkpoints)) {
      checkpoints.forEach((cp) => {
        if (cp.latitude && cp.longitude) {
          const cpLat = safeCoord(cp.latitude);
          const cpLng = safeCoord(cp.longitude);
          L.marker([cpLat, cpLng], { icon: cp.is_rest_stop ? restStopIcon : farmIcon })
            .bindPopup(`<b>${cp.status_label}</b><br/>${cp.notes || ''}`)
            .addTo(group);
        }
      });
    }

    // 5. Draw Route Line
    const linePoints = [];
    if (origin?.lat && origin?.lng) linePoints.push([safeCoord(origin.lat), safeCoord(origin.lng)]);
    if (checkpoints && checkpoints.length > 0) {
      checkpoints.forEach(cp => {
        if (cp.latitude && cp.longitude) linePoints.push([safeCoord(cp.latitude), safeCoord(cp.longitude)]);
      });
    }
    if (courierPos?.lat && courierPos?.lng) linePoints.push([safeCoord(courierPos.lat), safeCoord(courierPos.lng)]);
    if (destination?.lat && destination?.lng) linePoints.push([safeCoord(destination.lat), safeCoord(destination.lng)]);

    if (linePoints.length >= 2) {
      L.polyline(linePoints, {
        color: '#059669',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.8
      }).addTo(group);
    }

    // Fit Map to View all points
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], animate: false });
    }

    return () => {
      // Clean up layers on re-render
    };
  }, [origin, destination, courierPos, checkpoints]);

  return (
    <div className="relative rounded-3xl overflow-hidden border border-theme-border shadow-sm">
      <div ref={mapContainerRef} style={{ height: height, width: '100%' }} />

      {/* Floating Map Legend */}
      <div className="absolute bottom-3 left-3 bg-theme-card/90 backdrop-blur-md border border-theme-border px-3 py-2 rounded-2xl shadow-md z-[450] text-[11px] font-semibold flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
          <span>Kandang</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" />
          <span>Truk Armada</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          <span>Rest Stop</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
          <span>Tujuan</span>
        </div>
      </div>
    </div>
  );
}
