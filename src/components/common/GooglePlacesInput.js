import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { loadGoogleMapsScript } from "../../utils/googleMaps";

const extractCity = (addressComponents = []) => {
  const typesPriority = [
    "locality",
    "sublocality_level_1",
    "administrative_area_level_2",
    "administrative_area_level_1",
  ];

  for (const type of typesPriority) {
    const match = addressComponents.find((item) => item.types?.includes(type));
    if (match?.long_name) return match.long_name;
  }
  return "";
};

const extractByType = (addressComponents = [], type) => {
  const match = addressComponents.find((item) => item.types?.includes(type));
  return match?.long_name || "";
};

const GooglePlacesInput = ({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Search location or landmark",
  inputClassName = "",
}) => {
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const placesServiceRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";

  const [ready, setReady] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [open, setOpen] = useState(false);

  const canUseGooglePlaces = useMemo(() => Boolean(apiKey), [apiKey]);

  useEffect(() => {
    let mounted = true;
    if (!canUseGooglePlaces) return undefined;

    loadGoogleMapsScript(apiKey)
      .then((google) => {
        if (!mounted) return;
        autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
        placesServiceRef.current = new google.maps.places.PlacesService(
          document.createElement("div")
        );
        setReady(true);
      })
      .catch((error) => {
        console.error("Google Maps load failed:", error);
        setReady(false);
      });

    return () => {
      mounted = false;
    };
  }, [apiKey, canUseGooglePlaces]);

  useEffect(() => {
    const onDocClick = (event) => {
      if (
        inputRef.current?.contains(event.target) ||
        dropdownRef.current?.contains(event.target)
      ) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const fetchPredictions = (text) => {
    if (!ready || !autocompleteServiceRef.current || text.trim().length < 2) {
      setPredictions([]);
      return;
    }

    autocompleteServiceRef.current.getPlacePredictions(
      {
        input: text,
        componentRestrictions: { country: "in" },
        types: ["geocode"],
      },
      (results = [], status) => {
        if (
          status !== window.google.maps.places.PlacesServiceStatus.OK ||
          !Array.isArray(results)
        ) {
          setPredictions([]);
          return;
        }
        setPredictions(results.slice(0, 6));
        setOpen(true);
      }
    );
  };

  const handleSelect = (prediction) => {
    onChange(prediction.description);
    setOpen(false);
    setPredictions([]);

    if (!placesServiceRef.current) return;
    placesServiceRef.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: [
          "name",
          "formatted_address",
          "geometry.location",
          "address_components",
        ],
      },
      (place, status) => {
        if (status !== window.google.maps.places.PlacesServiceStatus.OK || !place) return;
        onPlaceSelect?.({
          name: place.name || prediction.structured_formatting?.main_text || "",
          address: place.formatted_address || prediction.description || "",
          city: extractCity(place.address_components),
          state: extractByType(place.address_components, "administrative_area_level_1"),
          pincode: extractByType(place.address_components, "postal_code"),
          locality:
            extractByType(place.address_components, "sublocality_level_1") ||
            extractByType(place.address_components, "neighborhood"),
          addressLine1:
            String(place.formatted_address || prediction.description || "")
              .split(",")
              .map((part) => part.trim())
              .filter(Boolean)[0] || "",
          lat: place.geometry?.location?.lat?.() || null,
          lng: place.geometry?.location?.lng?.() || null,
          placeId: prediction.place_id,
        });
      }
    );
  };

  const handleChange = (event) => {
    const text = event.target.value;
    onChange(text);
    if (!canUseGooglePlaces) return;
    fetchPredictions(text);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        placeholder={
          canUseGooglePlaces
            ? placeholder
            : "Search by city, locality, landmark, or property"
        }
        value={value}
        onChange={handleChange}
        onFocus={() => {
          if (predictions.length > 0) setOpen(true);
        }}
        className={inputClassName}
      />

      {canUseGooglePlaces && open && predictions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-xl"
        >
          {predictions.map((prediction) => (
            <button
              type="button"
              key={prediction.place_id}
              onClick={() => handleSelect(prediction)}
              className="flex w-full items-start gap-2 px-3 py-2.5 text-left hover:bg-blue-50"
            >
              <MapPin className="mt-0.5 h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-700">{prediction.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GooglePlacesInput;
