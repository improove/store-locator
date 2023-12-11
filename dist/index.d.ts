/// <reference types="google.maps" />
import { LoaderOptions } from '@googlemaps/js-api-loader';
import { InfoWindowOptions } from './infoWindow';
import { SearchBoxOptions } from './searchBox';
import { StoreList, StoreListOptions } from './storeList';
import './styles.css';
export declare type StoreLocatorOptions = {
    /** DOM element that the map will be inserted into */
    container: HTMLElement;
    /** From https://www.npmjs.com/package/@googlemaps/js-api-loader
     * We are defaulting the use of `libraries: ['places', 'geometry']`.
     * You should also at least include an `apiKey`.
     * Optional only if you are pre-loading the google maps library.
     */
    loaderOptions?: LoaderOptions;
    /** The URL provided from your GeoJSON destination connector OR Custom GeoJSON that has already been loaded into the browser */
    geoJson: string | object;
    /** By default we are centering on the entire US */
    mapOptions?: google.maps.MapOptions;
    /** Optional - if you don't include this then logos won't be shown */
    formatLogoPath?: (feature: google.maps.Data.Feature) => string;
    infoWindowOptions?: InfoWindowOptions;
    searchBoxOptions?: SearchBoxOptions;
    storeListOptions?: StoreListOptions;
};
export declare type StoreLocatorMap = {
    map: google.maps.Map;
    infoWindow: google.maps.InfoWindow;
    autocomplete: google.maps.places.Autocomplete;
    originMarker: google.maps.Marker;
    storeList: StoreList;
};
export declare const defaultCenter: {
    lat: number;
    lng: number;
};
export declare const defaultZoom = 4;
export declare const createStoreLocatorMap: (options: StoreLocatorOptions) => Promise<StoreLocatorMap>;
