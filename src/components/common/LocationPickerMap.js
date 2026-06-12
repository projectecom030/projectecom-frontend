import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { loadGoogleMapsScript } from "../../utils/googleMaps";

const DEFAULT_CENTER = { lat: 13.0827, lng: 80.2707 };

const toNumberOrNull = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const LocationPickerMap = ({
  latitude,
  longitude,
  onChange,
  onAddressChange,
  title = "Select Property Location",
}) => {
  const containerRef = useRef(null);
  const googleMapRef = useRef(null);
  const googleMarkerRef = useRef(null);
  const googleGeocoderRef = useRef(null);
  const leafletMapRef = useRef(null);
  const leafletMarkerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const onAddressChangeRef = useRef(onAddressChange);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [locating, setLocating] = useState(false);
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";
  const hasGoogleKey = Boolean(apiKey);
  const [mapMode, setMapMode] = useState(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onAddressChangeRef.current = onAddressChange;
  }, [onAddressChange]);

  const reverseGeocodeGoogle = (lat, lng) => {
    if (!googleGeocoderRef.current) return;
    googleGeocoderRef.current.geocode(
      { location: { lat, lng } },
      (results, status) => {
        if (status === "OK" && results?.[0]?.formatted_address) {
          onAddressChangeRef.current?.(results[0].formatted_address);
        }
      }
    );
  };

  const reverseGeocodeOSM = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data?.display_name) {
        onAddressChangeRef.current?.(data.display_name);
      }
    } catch (error) {
      console.error("OSM reverse geocode failed:", error);
    }
  };

  const updateSelection = (lat, lng, options = {}) => {
    const { panToLocation = true, updateAddress = true } = options;
    const nextPosition = { lat, lng };

    if (mapMode === "google") {
      if (!googleMapRef.current || !googleMarkerRef.current) return;
      googleMarkerRef.current.setPosition(nextPosition);
      if (panToLocation) {
        googleMapRef.current.setCenter(nextPosition);
      }
      onChangeRef.current?.({ latitude: lat, longitude: lng });
      if (updateAddress) {
        reverseGeocodeGoogle(lat, lng);
      }
      return;
    }

    if (mapMode === "leaflet") {
      if (!leafletMapRef.current || !leafletMarkerRef.current) return;
      leafletMarkerRef.current.setLatLng(nextPosition);
      if (panToLocation) {
        leafletMapRef.current.setView(nextPosition, leafletMapRef.current.getZoom());
      }
      onChangeRef.current?.({ latitude: lat, longitude: lng });
      if (updateAddress) {
        reverseGeocodeOSM(lat, lng);
      }
    }
  };

  useEffect(() => {
    let mounted = true;
    const initLeaflet = () => {
      if (!containerRef.current || leafletMapRef.current) return;

      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const lat = toNumberOrNull(latitude);
      const lng = toNumberOrNull(longitude);
      const center = lat !== null && lng !== null ? { lat, lng } : DEFAULT_CENTER;

      leafletMapRef.current = L.map(containerRef.current, {
        center,
        zoom: lat !== null && lng !== null ? 15 : 11,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(leafletMapRef.current);

      leafletMarkerRef.current = L.marker(center, { draggable: true }).addTo(
        leafletMapRef.current
      );

      leafletMapRef.current.on("click", (event) => {
        updateSelection(event.latlng.lat, event.latlng.lng);
      });

      leafletMarkerRef.current.on("dragend", (event) => {
        const nextPosition = event.target.getLatLng();
        updateSelection(nextPosition.lat, nextPosition.lng, { panToLocation: false });
      });

      setNotice("Google Maps key missing or blocked. Using OpenStreetMap.");
      setMapMode("leaflet");
      setReady(true);
    };

    if (hasGoogleKey) {
      loadGoogleMapsScript(apiKey)
        .then((google) => {
          if (!mounted || !containerRef.current) return;
          const lat = toNumberOrNull(latitude);
          const lng = toNumberOrNull(longitude);
          const center = lat !== null && lng !== null ? { lat, lng } : DEFAULT_CENTER;

          googleMapRef.current = new google.maps.Map(containerRef.current, {
            center,
            zoom: lat !== null && lng !== null ? 15 : 11,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });

          googleMarkerRef.current = new google.maps.Marker({
            position: center,
            map: googleMapRef.current,
            draggable: true,
          });
          googleGeocoderRef.current = new google.maps.Geocoder();

          googleMapRef.current.addListener("click", (event) => {
            const nextLat = event.latLng.lat();
            const nextLng = event.latLng.lng();
            updateSelection(nextLat, nextLng);
          });

          googleMarkerRef.current.addListener("dragend", (event) => {
            const nextLat = event.latLng.lat();
            const nextLng = event.latLng.lng();
            updateSelection(nextLat, nextLng, { panToLocation: false });
          });

          setMapMode("google");
          setReady(true);
        })
        .catch((error) => {
          console.error("Map load failed:", error);
          setLoadError("Unable to load Google Map. Falling back to OpenStreetMap.");
          initLeaflet();
        });
    } else {
      initLeaflet();
    }

    return () => {
      mounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.off();
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [apiKey, hasGoogleKey]);

  useEffect(() => {
    const lat = toNumberOrNull(latitude);
    const lng = toNumberOrNull(longitude);
    if (!ready || lat === null || lng === null) return;
    const nextPosition = { lat, lng };

    if (mapMode === "google" && googleMapRef.current && googleMarkerRef.current) {
      googleMarkerRef.current.setPosition(nextPosition);
      googleMapRef.current.setCenter(nextPosition);
    }

    if (mapMode === "leaflet" && leafletMapRef.current && leafletMarkerRef.current) {
      leafletMarkerRef.current.setLatLng(nextPosition);
      leafletMapRef.current.setView(nextPosition, leafletMapRef.current.getZoom());
    }
  }, [ready, latitude, longitude, mapMode]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setActionError("Geolocation is not supported in this browser.");
      return;
    }
    if (!ready) {
      setActionError("Map is not ready yet. Please wait a moment.");
      return;
    }

    setActionError("");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        updateSelection(lat, lng);
        if (mapMode === "google" && googleMapRef.current) {
          googleMapRef.current.setZoom(16);
        }
        if (mapMode === "leaflet" && leafletMapRef.current) {
          leafletMapRef.current.setZoom(16);
        }
        setLocating(false);
      },
      () => {
        setActionError("Unable to fetch your current location.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const selectedLat = toNumberOrNull(latitude);
  const selectedLng = toNumberOrNull(longitude);

  if (loadError && !ready) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {loadError}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={locating}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {locating ? "Finding Location..." : "Use Current Location"}
      </button>
      <div ref={containerRef} className="h-80 w-full rounded-xl border border-gray-300" />
      <p className="text-sm text-gray-600">
        {selectedLat !== null && selectedLng !== null
          ? `Selected: ${selectedLat.toFixed(6)}, ${selectedLng.toFixed(6)}`
          : "Click on the map or use current location"}
      </p>
      {notice ? <p className="text-xs text-amber-700">{notice}</p> : null}
      {actionError ? <p className="text-xs text-red-600">{actionError}</p> : null}
    </div>
  );
};

export default LocationPickerMap;
