import React, { useState, useEffect, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { Complaint, LocationCoordinates } from '../../types.ts';
import {
  MapPin,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

interface InteractiveMapProps {
  pins?: Complaint[];
  selectedPinId?: string | null;
  onSelectPin?: (complaint: Complaint) => void;
  // Pin placement mode for 'Confirm Pin on Map'
  isPickerMode?: boolean;
  selectedLocation?: LocationCoordinates;
  onLocationChange?: (loc: LocationCoordinates) => void;
  heightClass?: string;
  showLegend?: boolean;
}

// Inner Google Maps Controller to handle camera pans and clicks
const MapController: React.FC<{
  isPickerMode: boolean;
  selectedLocation?: LocationCoordinates;
  onLocationChange?: (loc: LocationCoordinates) => void;
  onMapClick?: (lat: number, lng: number) => void;
}> = ({ isPickerMode, selectedLocation, onLocationChange, onMapClick }) => {
  const map = useMap();

  useEffect(() => {
    if (map && selectedLocation) {
      map.panTo({ lat: selectedLocation.lat, lng: selectedLocation.lng });
    }
  }, [map, selectedLocation?.lat, selectedLocation?.lng]);

  return null;
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  pins = [],
  selectedPinId,
  onSelectPin,
  isPickerMode = false,
  selectedLocation,
  onLocationChange,
  heightClass = 'h-[440px]',
  showLegend = true,
}) => {
  const apiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    'AIzaSyC-_Uuicq8IKsu08WRxoMIyw9_UmIBHmzw';

  const defaultPosition = selectedLocation || {
    lat: 13.0405,
    lng: 77.6256,
    address: 'Nagawara Main Road, Ward-22 Nagawara',
    landmark: 'Near Nagawara Signal & Junction',
    ward: 'Ward-22 Nagawara',
  };

  const [activeInfoWindowPin, setActiveInfoWindowPin] = useState<Complaint | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');

  // Reverse geocode / address resolution helper in Ward-22 Nagawara
  const updatePickedLocation = useCallback(
    (lat: number, lng: number) => {
      if (!onLocationChange) return;

      const streets = [
        'Nagawara Main Road',
        'Thanisandra Main Road',
        'Outer Ring Road (Near Manyata Gate)',
        'Govindapura Road',
        'Arabic College Main Road',
        'Nagawara Lake Circle Road',
      ];
      const streetIndex = Math.abs(Math.floor((lat + lng) * 100)) % streets.length;
      const street = streets[streetIndex];

      onLocationChange({
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4)),
        address: `${Math.floor(10 + Math.random() * 90)}, ${street}, Ward-22 Nagawara`,
        landmark: 'Ward-22 Nagawara Junction Sector',
        ward: 'Ward-22 Nagawara',
      });
    },
    [onLocationChange]
  );

  const handleMapClick = (e: any) => {
    if (!isPickerMode) return;
    if (e.detail?.latLng) {
      const lat = e.detail.latLng.lat;
      const lng = e.detail.latLng.lng;
      updatePickedLocation(lat, lng);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return { background: '#f97316', border: '#ea580c', glyph: '#ffffff' };
      case 'verified':
        return { background: '#2563eb', border: '#1d4ed8', glyph: '#ffffff' };
      case 'in_progress':
        return { background: '#7c3aed', border: '#6d28d9', glyph: '#ffffff' };
      case 'resolved':
        return { background: '#10b981', border: '#059669', glyph: '#ffffff' };
      default:
        return { background: '#64748b', border: '#475569', glyph: '#ffffff' };
    }
  };

  return (
    <div
      className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100`}
    >
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={{ lat: defaultPosition.lat, lng: defaultPosition.lng }}
          defaultZoom={isPickerMode ? 14 : 13}
          mapId="DEMO_MAP_ID"
          mapTypeId={mapType}
          onClick={handleMapClick}
          disableDefaultUI={false}
          clickableIcons={false}
          className="w-full h-full"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        >
          <MapController
            isPickerMode={isPickerMode}
            selectedLocation={selectedLocation}
            onLocationChange={onLocationChange}
          />

          {/* SINGLE PIN PICKER MODE (Report a Problem) */}
          {isPickerMode && (
            <AdvancedMarker
              position={{ lat: defaultPosition.lat, lng: defaultPosition.lng }}
              draggable={true}
              onDragEnd={(e: any) => {
                if (e.latLng) {
                  updatePickedLocation(e.latLng.lat(), e.latLng.lng());
                }
              }}
              title="Issue Location Pin"
            >
              <Pin
                background="#2563eb"
                borderColor="#1e40af"
                glyphColor="#ffffff"
                scale={1.2}
              />
            </AdvancedMarker>
          )}

          {/* ADMIN MULTI-PIN MODE (All reported complaints) */}
          {!isPickerMode &&
            pins.map((pin) => {
              const colors = getStatusColor(pin.status);
              const isSelected = selectedPinId === pin.id;

              return (
                <AdvancedMarker
                  key={pin.id}
                  position={{ lat: pin.location.lat, lng: pin.location.lng }}
                  onClick={() => {
                    setActiveInfoWindowPin(pin);
                    if (onSelectPin) onSelectPin(pin);
                  }}
                  title={`${pin.id}: ${pin.title}`}
                >
                  <Pin
                    background={colors.background}
                    borderColor={colors.border}
                    glyphColor={colors.glyph}
                    scale={isSelected ? 1.3 : 1.05}
                  />
                </AdvancedMarker>
              );
            })}

          {/* Info Window on Selected Pin in Admin Mode */}
          {!isPickerMode && activeInfoWindowPin && (
            <InfoWindow
              position={{
                lat: activeInfoWindowPin.location.lat,
                lng: activeInfoWindowPin.location.lng,
              }}
              onCloseClick={() => setActiveInfoWindowPin(null)}
            >
              <div className="p-1 max-w-xs text-slate-900">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-blue-600">
                    {activeInfoWindowPin.id}
                  </span>
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    {activeInfoWindowPin.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-xs font-bold line-clamp-1">{activeInfoWindowPin.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  {activeInfoWindowPin.location.address}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 capitalize">
                    {activeInfoWindowPin.priority} priority
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectPin) onSelectPin(activeInfoWindowPin);
                      setActiveInfoWindowPin(null);
                    }}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Select Issue →
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {/* Map Layer Switcher */}
      <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-md flex items-center gap-1 text-[11px]">
        <button
          type="button"
          onClick={() => setMapType('roadmap')}
          className={`px-2 py-1 rounded-lg font-medium transition-colors ${
            mapType === 'roadmap' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Street
        </button>
        <button
          type="button"
          onClick={() => setMapType('satellite')}
          className={`px-2 py-1 rounded-lg font-medium transition-colors ${
            mapType === 'satellite' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Satellite
        </button>
      </div>

      {/* Picker Mode Instruction Bar (User-friendly) */}
      {isPickerMode && (
        <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto z-10 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl px-3.5 py-2 shadow-xl text-xs text-white flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <MapPin className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-white">Tap on Google Map to adjust your pin location</div>
            <div className="text-slate-300 font-mono text-[11px]">
              {defaultPosition.address} ({defaultPosition.ward})
            </div>
          </div>
        </div>
      )}

      {/* Legend in Admin Mode */}
      {showLegend && !isPickerMode && (
        <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl px-3 py-1.5 text-[10px] text-slate-600 flex items-center gap-2.5 shadow-sm hidden sm:flex">
          <span className="font-semibold text-slate-800">Status:</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500" /> Submitted
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-600" /> Verified
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-600" /> In Progress
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600" /> Resolved
          </span>
        </div>
      )}
    </div>
  );
};
