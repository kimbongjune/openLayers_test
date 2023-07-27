/**
 *  @author 김봉준
 *  @date   2023-07-25
 *  지도 서비스의 컨트롤을 관리하는 파일
 */

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

//printDialog가 보여질 떄 발생하는 이벤트. 새로운 지도가 표출되기 때문에 기존에 존재하는 이벤트를 전부 제거하고, 새로운 지도에서의 행위가 기존 지도에 영향을 미쳐 기존 지도의 줌, 센터, 회전각 등을 저장함
printControl.on("show", function () {
    extentInteraction.setActive(false);
    map.removeInteraction(dragBox);

    const storageObject = {
        zoomLevel: map.getView().getZoom(),
        centerCoordinate: map.getView().getCenter(),
        rotate: map.getView().getRotation(),
    };
    const objString = JSON.stringify(storageObject);

    window.localStorage.setItem("beforeState", objString);
});

//printDialog가 사라질 떄 발생하는 이벤트. 제거했던 이벤트를 다시 생성하고, 기존 지도의 값을 불러와  줌, 센터, 회전각을 재설정함
printControl.on("hide", function () {
    extentInteraction.setActive(true);
    map.addInteraction(dragBox);
    contextmenu.enable();
    const value = JSON.parse(window.localStorage.getItem("beforeState"));
    map.getView().setCenter(value.centerCoordinate);
    map.getView().setZoom(value.zoomLevel);
    map.getView().setRotation(value.rotate);
    window.localStorage.removeItem("beforeState");
});

//printDialog의 이미지저장, PDF저장 이벤트
printControl.on(["print", "error"], function (e) {
    // Print success
    if (e.image) {
        if (e.pdf) {
            // Export pdf using the print info
            const pdf = new jspdf.jsPDF({
                orientation: e.print.orientation,
                unit: e.print.unit,
                format: e.print.size,
            });
            pdf.addImage(
                e.image,
                "JPEG",
                e.print.position[0],
                e.print.position[0],
                e.print.imageWidth,
                e.print.imageHeight
            );
            pdf.save(e.print.legend ? "legend.pdf" : "map.pdf");
        } else {
            // Save image as file
            e.canvas.toBlob(
                function (blob) {
                    const name =
                        (e.print.legend ? "legend." : "map.") +
                        e.imageType.replace("image/", "");
                    saveAs(blob, name);
                },
                e.imageType,
                e.quality
            );
        }
    } else {
        console.warn("No canvas to export");
    }
});