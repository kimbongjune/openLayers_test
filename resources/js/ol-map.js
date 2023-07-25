//openlayers 지도의 view 객체
const mapView = new ol.View({
    center: [14128579.82, 4512570.74],
    maxZoom: MAX_ZOOM_LEVEL,
    zoom: DEFAULT_ZOOM_LEVEL,
    minZoom: MIN_ZOOM_LEVEL,
    constrainResolution: true,
    rotation: 0,
    // center: [-8910887.277395891, 5382318.072437216],
    // maxZoom: 19,
    // zoom: 15
});

//openlayers 지도 객체
const map = new ol.Map({
    target: document.getElementById("map"),
    pixelRatio: 1,
    view: mapView,
    interactions: ol.interaction.defaults.defaults({
        shiftDragZoom: false,
    }),
});