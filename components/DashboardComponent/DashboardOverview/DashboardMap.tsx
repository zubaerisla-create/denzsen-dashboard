'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { useGetDispatchesQuery } from '@/redux/services/api';
import { Loader2, MapPin, AlertCircle } from 'lucide-react';
import { Dispatch } from '@/redux/services/api/types/dispatch.types';
import Link from 'next/link';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '12px'
};

const defaultCenter = {
  lat: 6.5244,
  lng: 3.3792
};

const libraries: ("places")[] = ["places"];

export default function DashboardMap() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries
  });

  const { data: dispatches, isLoading, isError } = useGetDispatchesQuery();
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(null);

  const mapRef = useRef<google.maps.Map | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const markers = useMemo(() => {
    if (!dispatches) return [];
    return dispatches.filter(d => d.lat && d.long);
  }, [dispatches]);

  // Center map on markers if they exist
  const center = useMemo(() => {
    if (markers.length === 0) return defaultCenter;
    if (markers.length === 1) return { lat: markers[0].lat, lng: markers[0].long };
    
    // Simple average center
    const lat = markers.reduce((acc, curr) => acc + curr.lat, 0) / markers.length;
    const lng = markers.reduce((acc, curr) => acc + curr.long, 0) / markers.length;
    return { lat, lng };
  }, [markers]);

  if (loadError) {
    return (
      <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex items-center justify-center gap-3">
        <AlertCircle className="w-6 h-6 text-red-500" />
        <p className="text-red-700 font-medium">Failed to load Google Maps</p>
      </div>
    );
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 h-[400px] flex flex-col items-center justify-center gap-4 border border-gray-100">
        <Loader2 className="w-10 h-10 animate-spin text-[#507493]" />
        <p className="text-gray-500 font-medium">Initializing CPIN Map Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-500" />
            Live Intelligence Map
          </h3>
          <p className="text-xs text-gray-500 mt-1">Real-time dispatch locations and case proximity</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-medium text-gray-600">Live Updates</span>
        </div>
      </div>

      <div className="relative h-[400px]">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={markers.length > 0 ? 12 : 10}
          onLoad={onMapLoad}
          options={{
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true,
            styles: [
                {
                    "featureType": "administrative",
                    "elementType": "labels.text.fill",
                    "stylers": [{ "color": "#444444" }]
                },
                {
                    "featureType": "landscape",
                    "elementType": "all",
                    "stylers": [{ "color": "#f2f2f2" }]
                },
                {
                    "featureType": "poi",
                    "elementType": "all",
                    "stylers": [{ "visibility": "off" }]
                },
                {
                    "featureType": "road",
                    "elementType": "all",
                    "stylers": [{ "saturation": -100 }, { "lightness": 45 }]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "all",
                    "stylers": [{ "visibility": "simplified" }]
                },
                {
                    "featureType": "road.arterial",
                    "elementType": "labels.icon",
                    "stylers": [{ "visibility": "off" }]
                },
                {
                    "featureType": "transit",
                    "elementType": "all",
                    "stylers": [{ "visibility": "off" }]
                },
                {
                    "featureType": "water",
                    "elementType": "all",
                    "stylers": [{ "color": "#507493" }, { "visibility": "on" }]
                }
            ]
          }}
        >
          {markers.map((dispatch) => (
            <Marker
              key={dispatch.id}
              position={{ lat: dispatch.lat, lng: dispatch.long }}
              onClick={() => setSelectedDispatch(dispatch)}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: dispatch.status === 'Active' ? '#ef4444' : '#f59e0b',
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#ffffff',
                scale: 10,
              }}
            />
          ))}

          {selectedDispatch && (
            <InfoWindow
              position={{ lat: selectedDispatch.lat, lng: selectedDispatch.long }}
              onCloseClick={() => setSelectedDispatch(null)}
            >
              <div className="p-2 min-w-[200px]">
                <h4 className="font-bold text-gray-900 text-sm">Case {selectedDispatch.case_number}</h4>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{selectedDispatch.address}</p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    selectedDispatch.status === 'Active' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedDispatch.status}
                  </span>
                  <Link 
                    href={`/dashboard/case-list/${selectedDispatch.case_number}`}
                    className="text-[10px] text-blue-600 hover:underline font-bold"
                  >
                    VIEW DETAILS
                  </Link>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
      
      {markers.length === 0 && !isLoading && (
        <div className="absolute inset-x-0 bottom-10 flex justify-center">
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200 text-xs font-medium text-gray-600">
            No active dispatches found on map
          </div>
        </div>
      )}
    </div>
  );
}
