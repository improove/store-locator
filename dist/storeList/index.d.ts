/// <reference types="google.maps" />
import { ContentTemplateArgs } from './contentTemplate';
export declare type StoreListOptions = {
    filterFn?: (item: DistanceResult, index: number, map: google.maps.Map) => boolean;
    travelMode?: google.maps.TravelMode;
    unitSystem?: 'imperial' | 'metric';
    panelTemplate?: string;
    storeTemplate?: (args: ContentTemplateArgs) => string;
};
export declare type StoreList = {
    showStoreList: () => Promise<void>;
    hideStoreList: () => void;
    closeButton: HTMLButtonElement;
    addListener: (type: 'item_click', listener: (button: HTMLButtonElement) => void) => void;
};
export declare type DistanceResult = {
    feature: google.maps.Data.Feature;
    distanceText: string;
};
export declare const addStoreListToMapContainer: (container: HTMLElement, map: google.maps.Map, showInfoWindow: (feature: google.maps.Data.Feature) => void, options: StoreListOptions, formatLogoPath?: ((feature: google.maps.Data.Feature) => string) | undefined, maxDestinationsPerDistanceMatrixRequest?: number) => StoreList;
