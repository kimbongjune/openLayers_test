//지도에 축적 컨트롤 추가
const scaleControl = new ol.control.ScaleLine({
    units: "metric", //미터법
    bar: true, //scalebars
    steps: 4, //scalebars 개수
    text: true, //scale 비율 텍스트 표시 플래그
    minWidth: 200, //최소 너비
});
map.addControl(scaleControl);

//지도에 줌 슬라이더 컨트롤 추가
const zoomControl = new ol.control.ZoomSlider()
map.addControl(zoomControl);


//지도에 풀 스크린 컨트롤 추가
const fullScreenControl = new ol.control.FullScreen({
    className: "ol-fullscreen-control",
})
map.addControl(fullScreenControl);

//지도에 오버뷰맵 컨트롤 추가
const overviewMapControl = new ol.control.OverviewMap({
    className: "ol-overviewmap ol-custom-overviewmap",
    view: new ol.View({
        projection: "EPSG:3857",
        center: mapView.getCenter(),
        maxZoom: MAX_ZOOM_LEVEL,
        zoom: mapView.getZoom(),
        minZoom: MIN_ZOOM_LEVEL,
        constrainResolution: true,
    }),
    // see in overviewmap-custom.html to see the custom CSS used
    layers: [
        new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: `http://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/Base/{z}/{y}/{x}.png`,
                serverType: "geoserver",
                crossOrigin: "anonymous",
            }),
            preload: Infinity,
            type: "map",
        }),
    ],
    rotateWithView: true,
    collapsed:
        localStorage.getItem("overviewMapCollapsed") === "true" ? true : false,
});
map.addControl(overviewMapControl);

//지도의 센터 타겟 컨트롤 추가
const centerTargetControl = new ol.control.Target({
    style: [
        new ol.style.Style({
            image: new ol.style.RegularShape({
                points: 4,
                radius: 11,
                radius1: 0,
                radius2: 0,
                snapToPixel: true,
                stroke: new ol.style.Stroke({ color: "#fff", width: 3 }),
            }),
        }),
        new ol.style.Style({
            image: new ol.style.RegularShape({
                points: 4,
                radius: 11,
                radius1: 0,
                radius2: 0,
                snapToPixel: true,
                stroke: new ol.style.Stroke({ color: "black", width: 2 }),
            }),
        }),
    ],
    composite: "",
})
map.addControl(centerTargetControl);

//지도에 ZoomToExtent 컨트롤러 추가
const zoomToExtentControl = new ol.control.ZoomToExtent({
    extent: [
        14103925.705518028, 4533240.7238401985, 14229588.180018857,
        4473925.589890901,
    ],
})
map.addControl(zoomToExtentControl);

//지도에 방위계 컨트롤 추가
const rotateControl = new ol.control.Rotate({ 
    autoHide: false 
})
map.addControl(rotateControl);

//지도에 ol-ext의 printDialog 컨트롤 추가
const printControl = new ol.control.PrintDialog({
    lang: "ko",
    scales: false,
    className: "ol-print",
});
printControl.setSize("A4");
map.addControl(printControl);