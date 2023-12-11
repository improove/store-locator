/// <reference types="google.maps" />
import { DistanceResult } from '.';
export declare const closeButtonId = "map_close-store-list-button";
export declare const listId = "map_store-list";
export declare const messageId = "map_store-list-message";
export declare type ContentTemplateArgs = {
    store: DistanceResult;
    formatLogoPath?: (feature: google.maps.Data.Feature) => string;
};
export declare const storeTemplate: ({ store, formatLogoPath }: ContentTemplateArgs) => string;
export declare const panelTemplate: string;
