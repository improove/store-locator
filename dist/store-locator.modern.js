import { Loader } from '@googlemaps/js-api-loader';

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var defaultTemplate$1 = (({
  feature,
  apiKey,
  formatLogoPath
}) => {
  const position = feature.getGeometry().get();
  const storeName = feature.getProperty('store');
  const address = feature.getProperty('storeFullAddress');
  return `<div class="map_infowindow_content">
    <div class="map_info">
      ${storeName ? `<h2>${storeName}</h2>` : ''}
      ${address ? `<p>${address}</p>` : ''}
    </div>
    ${formatLogoPath ? `<img class="map_logo" src="${formatLogoPath(feature)}" alt="" />` : ''}
    ${position && position.lat() && position.lng() && apiKey ? `<img
          class="map_streetview"
          src="https://maps.googleapis.com/maps/api/streetview?size=350x120&location=${position.lat()},${position.lng()}&key=${apiKey}"
          alt=""
        />` : ''}
  </div>`;
});

const addInfoWindowListenerToMap = (map, {
  template: _template = defaultTemplate$1,
  infoWindowOptions
}, apiKey, formatLogoPath) => {
  const defaultOptions = {
    pixelOffset: new google.maps.Size(0, -30)
  };
  const infoWindow = new google.maps.InfoWindow(_extends({}, defaultOptions, infoWindowOptions));

  const showInfoWindow = feature => {
    infoWindow.setContent(_template({
      feature,
      apiKey,
      formatLogoPath
    }));
    infoWindow.setPosition(feature.getGeometry().get());
    infoWindow.open(map);
  };

  map.data.addListener('click', ({
    feature
  }) => {
    showInfoWindow(feature);
  });
  map.addListener('click', () => {
    infoWindow.close();
  });
  return {
    infoWindow,
    showInfoWindow
  };
};

var defaultTemplate = `<div class="map_search-box-card">
  <label for="map_search-box">
    Find nearest store
  </label>
  <div class="map_search-box-input-container">
    <input id="map_search-box" type="text" placeholder="Enter an address" />
  </div>
</div>`;

const defaultAutocompleteOptions = {
  types: ['address'],
  componentRestrictions: {
    country: 'us'
  },
  fields: ['address_components', 'geometry', 'name']
};
const addSearchBoxToMap = (map, onUpdate, {
  autocompleteOptions,
  originMarkerOptions,
  controlPosition,
  template: _template = defaultTemplate,
  searchZoom: _searchZoom = 9
}) => {
  const container = document.createElement('div');
  container.innerHTML = _template;
  const input = container.querySelector('input');
  map.controls[controlPosition != null ? controlPosition : google.maps.ControlPosition.TOP_RIGHT].push(container);
  const autocomplete = new google.maps.places.Autocomplete(input, _extends({}, defaultAutocompleteOptions, autocompleteOptions));
  const originMarker = new google.maps.Marker(_extends({
    map,
    visible: false,
    position: map.getCenter(),
    icon: 'https://maps.google.com/mapfiles/ms/icons/blue.png'
  }, originMarkerOptions)); // Add a marker on search

  autocomplete.addListener('place_changed', async () => {
    const place = autocomplete.getPlace();

    if (!place.geometry || !place.geometry.location) {
      originMarker.setVisible(false);
      global.window.alert(`No address available for input: ${place.name}`);
      return;
    }

    const originLocation = place.geometry.location;
    map.setCenter(originLocation);
    map.setZoom(_searchZoom);
    originMarker.setPosition(originLocation);
    originMarker.setVisible(true);
    await onUpdate();
  });
  return {
    autocomplete,
    originMarker
  };
};

const closeButtonId = 'map_close-store-list-button';
const listId = 'map_store-list';
const messageId = 'map_store-list-message';
const storeTemplate = ({
  store,
  formatLogoPath
}) => {
  const storeName = store.feature.getProperty('store');
  const address = store.feature.getProperty('storeFullAddress');
  const location = store.feature.getGeometry().get();
  return `
    <li>
      <button
        data-lat="${location.lat()}"
        data-lng="${location.lng()}"
        title="${storeName != null ? storeName : ''}"
      >
        ${storeName ? `<p class="map_banner">${storeName}</p>` : ''}
        ${formatLogoPath ? `<img class="map_logo" alt="" src="${formatLogoPath(store.feature)}" />` : ''}
        <p class="map_distance">${store.distanceText}</p>
        ${address ? `<p class="map_address">${address}</p>` : ''}
      </button>
    </li>
  `;
};
const panelTemplate = `
  <h2 id="store-list-header">Nearby Locations</h2>
  <button type="button" id="${closeButtonId}" class="close-button">
    <img alt="Close Store List" src="https://www.google.com/intl/en_us/mapfiles/close.gif" />
  </button>
  <ul id="${listId}"></ul>
  <div id="${messageId}"></div>`;

const storeListPanelId = 'map_store-list-panel';

const getDistanceMatrix = (service, parameters) => new Promise((resolve, reject) => {
  service.getDistanceMatrix(parameters, (response, status) => {
    if (status != google.maps.DistanceMatrixStatus.OK) {
      reject(`DistanceMatrixService Response Status: ${status}`);
    } else if (!response) {
      reject('DistanceMatrixService returned no response');
    } else {
      resolve(response.rows[0].elements.map(e => ({
        text: e.distance.text,
        value: e.distance.value
      })));
    }
  });
});

const getStoresClosestToCenterOfMap = async (map, {
  filterFn: _filterFn = (_, i) => i < 10,
  travelMode: _travelMode = google.maps.TravelMode.DRIVING,
  unitSystem // defaults to 'imperial' in ternary below

}, maxDestinationsPerDistanceMatrixRequest) => {
  const stores = [];
  const center = map.getCenter();

  if (!center) {
    return [];
  } // Get locations and create array for stores


  map.data.forEach(store => {
    const location = store.getGeometry().get();
    stores.push({
      store,
      location,
      distance: google.maps.geometry.spherical.computeDistanceBetween(center, location)
    });
  }); // sort by straight-line distance to the center

  const closestStores = stores.sort((s1, s2) => s1.distance - s2.distance).slice(0, maxDestinationsPerDistanceMatrixRequest); // find driving distances from center of map

  const service = new google.maps.DistanceMatrixService();
  const distancesList = await getDistanceMatrix(service, {
    origins: [center],
    destinations: closestStores.map(({
      location
    }) => location),
    travelMode: _travelMode,
    unitSystem: unitSystem === 'metric' ? google.maps.UnitSystem.METRIC : google.maps.UnitSystem.IMPERIAL
  }); // apply distance info to our stores list

  const storesWithDrivingDistances = closestStores.map((store, i) => _extends({}, store, {
    // they are returned in teh same order as we pass them in as destinations
    distanceText: distancesList[i].text,
    distanceValue: distancesList[i].value
  })); // Sort and format for display

  return storesWithDrivingDistances.sort((s1, s2) => s1.distanceValue - s2.distanceValue).map(s => ({
    feature: s.store,
    distanceText: s.distanceText
  })).filter((result, index) => _filterFn(result, index, map));
};

const findFeatureByLatLng = (map, lat, lng) => {
  var _featuresWithLatLng$f;

  const featuresWithLatLng = [];
  map.data.forEach(feature => {
    const location = feature.getGeometry().get();
    featuresWithLatLng.push({
      lat: location.lat(),
      lng: location.lng(),
      feature
    });
  });
  return (_featuresWithLatLng$f = featuresWithLatLng.find(f => f.lat === lat && f.lng === lng)) == null ? void 0 : _featuresWithLatLng$f.feature;
};

const showLocation = (map, showInfoWindow, lat, lng) => {
  map.setCenter({
    lat,
    lng
  });
  map.setZoom(13);
  const matchingFeature = findFeatureByLatLng(map, lat, lng);

  if (matchingFeature) {
    showInfoWindow(matchingFeature);
  }
};

const resultOnClickListeners = Array();

const showStoreList = (map, showInfoWindow, options, maxDestinationsPerDistanceMatrixRequest, formatLogoPath) => async () => {
  const panel = document.getElementById(storeListPanelId);
  const list = document.getElementById(listId);
  const message = document.getElementById(messageId);
  let sortedStores;

  try {
    sortedStores = await getStoresClosestToCenterOfMap(map, options, maxDestinationsPerDistanceMatrixRequest);
  } catch (e) {
    console.error(e);
    list.innerHTML = '';
    message.innerHTML = 'There was an error determining the closest stores.';
    panel.classList.add('open');
    return;
  }

  if (sortedStores.length) {
    var _options$storeTemplat;

    const template = (_options$storeTemplat = options.storeTemplate) != null ? _options$storeTemplat : storeTemplate;
    list.innerHTML = sortedStores.map(store => template({
      store,
      formatLogoPath
    })).join('');
    message.innerHTML = '';
    list.querySelectorAll('button').forEach(button => {
      button.onclick = () => {
        showLocation(map, showInfoWindow, +(button.getAttribute('data-lat') || 0), +(button.getAttribute('data-lng') || 0));
        resultOnClickListeners.forEach(listener => listener(button));
      };
    });
  } else {
    list.innerHTML = '';
    message.innerHTML = 'There are no locations that match the given criteria.';
  }

  panel.classList.add('open');
};

const addStoreListToMapContainer = (container, map, showInfoWindow, options, formatLogoPath,
/* As restricted by the google maps api - only exposed here for tests */
maxDestinationsPerDistanceMatrixRequest = 25) => {
  var _options$panelTemplat;

  const panel = document.createElement('section');
  panel.id = storeListPanelId;
  panel.classList.add('map_store-list-panel');
  panel.setAttribute('aria-labelledby', 'store-list-header');
  panel.innerHTML = (_options$panelTemplat = options.panelTemplate) != null ? _options$panelTemplat : panelTemplate;
  container.appendChild(panel);

  const hideStoreList = () => panel.classList.remove('open');

  const closeButton = document.getElementById(closeButtonId);

  if (closeButton) {
    closeButton.addEventListener('click', hideStoreList);
  }

  return {
    showStoreList: showStoreList(map, showInfoWindow, options, maxDestinationsPerDistanceMatrixRequest, formatLogoPath),
    hideStoreList,
    closeButton,
    addListener: (type, listener) => {
      if (type != 'item_click') {
        throw new Error('only `item_click` type available');
      }

      resultOnClickListeners.push(listener);
    }
  };
};

const defaultCenter = {
  lat: 39.8283,
  lng: -98.5795
};
const defaultZoom = 4;
const defaultMapOptions = {
  center: defaultCenter,
  zoom: defaultZoom
};

const validateOptionsJs = options => {
  if (!options) {
    throw new Error('You must define the required options.');
  }

  if (!options.container) {
    throw new Error('You must define a `container` element to put the map in.');
  }

  if (!options.geoJson) {
    throw new Error('You must define the `geoJson` as a URL or GeoJSON object.');
  }
};

const createStoreLocatorMap = async options => {
  validateOptionsJs(options);
  const {
    container,
    loaderOptions,
    geoJson,
    mapOptions,
    formatLogoPath,
    infoWindowOptions,
    searchBoxOptions,
    storeListOptions
  } = options;

  if (!window.google || !window.google.maps || !window.google.maps.version) {
    if (!loaderOptions || !loaderOptions.apiKey) {
      throw new Error('You must define the `loaderOptions` and its `apiKey`.');
    }

    const loader = new Loader(_extends({}, loaderOptions, {
      libraries: ['places', 'geometry']
    }));
    await loader.load();
  } else if (!window.google.maps.geometry || !window.google.maps.places) {
    throw new Error('If you are loading the Google Maps JS yourself, you need to load the `places` and `geometry` libraries with it.');
  }

  const map = new google.maps.Map(container, _extends({}, defaultMapOptions, mapOptions));
  window["storeLocatorMap"] = map;

  if (typeof geoJson === 'string') {
    map.data.loadGeoJson(geoJson);
  } else {
    map.data.addGeoJson(geoJson);
  }

  const {
    infoWindow,
    showInfoWindow
  } = addInfoWindowListenerToMap(map, infoWindowOptions != null ? infoWindowOptions : {}, loaderOptions == null ? void 0 : loaderOptions.apiKey, formatLogoPath);
  const storeList = addStoreListToMapContainer(container, map, showInfoWindow, storeListOptions != null ? storeListOptions : {}, formatLogoPath);
  const searchBox = addSearchBoxToMap(map, storeList.showStoreList, searchBoxOptions != null ? searchBoxOptions : {});
  return _extends({
    map,
    infoWindow
  }, searchBox, {
    storeList
  });
};

export { createStoreLocatorMap, defaultCenter, defaultZoom };
