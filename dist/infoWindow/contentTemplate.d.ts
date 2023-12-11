/// <reference types="google.maps" />
export declare type ContentTemplateArgs = {
    feature: google.maps.Data.Feature;
    apiKey?: string;
    formatLogoPath?: (feature: google.maps.Data.Feature) => string;
};
declare const _default: ({ feature, apiKey, formatLogoPath }: ContentTemplateArgs) => string;
export default _default;
