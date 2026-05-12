import {
  GoogleMap,
  LoadScript,
  Autocomplete,
  Marker,
} from "@react-google-maps/api";

const libraries = ["places"];

const [autocomplete, setAutocomplete] = useState(null);

const onPlaceChanged = () => {
  if (autocomplete !== null) {
    const place = autocomplete.getPlace();

    setNewAddress((p) => ({
      ...p,
      address: place.formatted_address,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    }));
  }
};