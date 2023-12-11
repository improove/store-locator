/// <reference types="google.maps" />
export declare type SearchBoxOptions = {
    /** https://developers.google.com/maps/documentation/javascript/places-autocomplete */
    autocompleteOptions?: google.maps.places.AutocompleteOptions;
    originMarkerOptions?: google.maps.MarkerOptions;
    controlPosition?: google.maps.ControlPosition;
    template?: string;
    searchZoom?: number;
};
declare type SearchBox = {
    autocomplete: google.maps.places.Autocomplete;
    originMarker: google.maps.Marker;
};
export declare const addSearchBoxToMap: (map: google.maps.Map, onUpdate: () => Promise<void>, { autocompleteOptions, originMarkerOptions, controlPosition, template, searchZoom, }: SearchBoxOptions) => SearchBox;
export {};
