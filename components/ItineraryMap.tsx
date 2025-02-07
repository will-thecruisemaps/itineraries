// components/ItineraryMap.tsx
'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Port {
  port_name: string;
  port_latitude: number;
  port_longitude: number;
}

interface ItineraryMapProps {
  itinerary: {
    itinerary_ports: Port[];
  };
}

export default function ItineraryMap({ itinerary }: ItineraryMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;
    
    // Clear existing layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Filter out cruising days and get coordinates
    const ports = itinerary.itinerary_ports.filter(port => port.port_name !== 'Cruising');
    const coordinates = ports.map(port => [port.port_latitude, port.port_longitude] as [number, number]);

    // Add markers and labels for each port
    ports.forEach((port, index) => {
      // Add circle marker
      L.circleMarker([port.port_latitude, port.port_longitude], {
        radius: 5,
        color: 'red',
        fillColor: 'red',
        fillOpacity: 1
      }).addTo(map);

      // Add permanent label
      L.marker([port.port_latitude, port.port_longitude], {
        icon: L.divIcon({
          className: 'port-label',
          html: `<div style="background: white; padding: 2px 6px; border: 1px solid #666; border-radius: 3px;">
                  ${index + 1}. ${port.port_name}
                </div>`,
          iconSize: [200, 20],
          iconAnchor: [-10, 10]
        })
      }).addTo(map);
    });

    // Add polyline connecting the ports
    if (coordinates.length > 1) {
      L.polyline(coordinates, {
        color: 'blue',
        weight: 2,
        opacity: 0.8
      }).addTo(map);

      // Add arrows showing direction
      coordinates.slice(0, -1).forEach((coord, i) => {
        const nextCoord = coordinates[i + 1];
        const midPoint = [
          (coord[0] + nextCoord[0]) / 2,
          (coord[1] + nextCoord[1]) / 2
        ];
        
        L.marker(midPoint as [number, number], {
          icon: L.divIcon({
            className: 'arrow',
            html: '→',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })
        }).addTo(map);
      });

      // Fit bounds to show all markers
      map.fitBounds(coordinates);
    }

    return () => {
      // Cleanup not needed as we're reusing the map instance
    };
  }, [itinerary]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
}