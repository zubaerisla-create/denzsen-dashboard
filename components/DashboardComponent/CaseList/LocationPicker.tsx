'use client';

import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import { Search, MapPin, Loader2 } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 6.5244,
  lng: 3.3792
};

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
}

const libraries: ("places")[] = ["places"];

export default function LocationPicker({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries
  });

  const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );
  const [address, setAddress] = useState('');
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const reverseGeocode = useCallback((lat: number, lng: number) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        const addr = results[0].formatted_address;
        setAddress(addr);
        onLocationSelect(lat, lng, addr);
      }
    });
  }, [onLocationSelect]);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPosition({ lat, lng });
      reverseGeocode(lat, lng);
    }
  }, [reverseGeocode]);

  const onAutocompleteLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const addr = place.formatted_address || "";
        
        setMarkerPosition({ lat, lng });
        setAddress(addr);
        onLocationSelect(lat, lng, addr);
        
        if (mapRef.current) {
          mapRef.current.panTo({ lat, lng });
          mapRef.current.setZoom(17);
        }
      }
    }
  };

  if (loadError) {
    return <div className="h-64 w-full bg-red-50 flex items-center justify-center text-red-500">Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div className="h-64 w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-400">
      <Loader2 className="w-6 h-6 animate-spin mr-2" />
      Loading Google Maps...
    </div>;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Autocomplete
          onLoad={onAutocompleteLoad}
          onPlaceChanged={onPlaceChanged}
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search for a location..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
        </Autocomplete>
      </div>

      <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-300 relative z-10">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={markerPosition || center}
          zoom={markerPosition ? 17 : 10}
          onLoad={onMapLoad}
          onClick={onMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false
          }}
        >
          {markerPosition && <Marker position={markerPosition} />}
        </GoogleMap>
      </div>
      
      {markerPosition && (
        <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2">
          <MapPin className="w-5 h-5 text-[#507493] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-[#507493] uppercase tracking-wider">Selected Location</p>
            <p className="text-sm text-gray-700 font-medium mb-1">{address}</p>
            <p className="text-xs text-gray-500">Lat: {markerPosition.lat.toFixed(6)}, Lng: {markerPosition.lng.toFixed(6)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
