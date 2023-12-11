/// <reference types="google.maps" />
import { ContentTemplateArgs } from './contentTemplate';
export declare type InfoWindowOptions = {
    infoWindowOptions?: google.maps.InfoWindowOptions;
    template?: (args: ContentTemplateArgs) => string;
};
export declare type MapInfoWindow = {
    infoWindow: google.maps.InfoWindow;
    showInfoWindow: (feature: google.maps.Data.Feature) => void;
};
export declare const addInfoWindowListenerToMap: (map: google.maps.Map, { template, infoWindowOptions }: InfoWindowOptions, apiKey?: string | undefined, formatLogoPath?: ((feature: google.maps.Data.Feature) => string) | undefined) => MapInfoWindow;
