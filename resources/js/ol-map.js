/**
 *  @author 김봉준
 *  @date   2023-07-25
 *  지도 서비스의 지도 객체를 관리하는 파일
 */

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


//현재 위치(geoLocation)를 얻어와 해당 좌표에 마커를 찍는 함수
function locationMarker(coordinate) {
    const source = objectControllVectorLayer.getSource();
    const features = source.getFeatures();
    for (let i = 0; i < features.length; i++) {
        let feature = features[i];
        if (
            ol.coordinate.equals(
                feature.getGeometry().getCoordinates(),
                coordinate
            )
        ) {
            // If a marker already exists at the coordinate, remove it
            if (feature.get("attribute") == "position") {
                source.removeFeature(feature);
            }
        }
    }
    const template = "현재 위치";
    const iconStyle = new ol.style.Style({
        image: new ol.style.Icon({
            scale: 0.6,
            src: pinIcon,
            opacity: 1,
        }),
        text: new ol.style.Text({
            offsetY: 25,
            text: template,
            font: "15px Open Sans,sans-serif",
            fill: new ol.style.Fill({ color: "#111" }),
            stroke: new ol.style.Stroke({ color: "#eee", width: 2 }),
        }),
    });
    const feature = new ol.Feature({
        type: "removable",
        geometry: new ol.geom.Point(coordinate),
        attribute: "position",
    });

    feature.setStyle(iconStyle);
    objectControllVectorLayer.getSource().addFeature(feature);
}

//지도 위에 마커를 찍는 함수. 커스텀 속성을 이용해 마커 객체를 컨트롤 한다.
function addMarker(coordinate, template = "", attribute = "", searchType = "") {
    const templates = template != "" ? template : "현재 위치";
    const iconStyle = new ol.style.Style({
        image: new ol.style.Icon({
            scale: 0.6,
            src: pinIcon,
            opacity: 1,
        }),
        text: new ol.style.Text({
            offsetY: 25,
            text: templates,
            font: "15px Open Sans,sans-serif",
            fill: new ol.style.Fill({ color: "#111" }),
            stroke: new ol.style.Stroke({ color: "#eee", width: 2 }),
        }),
    });
    const feature = new ol.Feature({
        type: searchType != "" ? searchType : "removable",
        geometry: new ol.geom.Point(coordinate),
        attribute: attribute != "" ? attribute : "position",
    });

    feature.setStyle(iconStyle);
    objectControllVectorLayer.getSource().addFeature(feature);
}