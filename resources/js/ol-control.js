/**
 *  @author 김봉준
 *  @date   2023-07-25
 *  지도 서비스의 컨트롤을 관리하는 파일
 */

//지도에 축적 컨트롤을 추가하는 함수
function createScaleControl() {
    const control = new ol.control.ScaleLine({
        units: "metric", // 미터법
        bar: true, // scalebars
        steps: 4, // scalebars 개수
        text: true, // scale 비율 텍스트 표시 플래그
        minWidth: 200, // 최소 너비
    });
    return control;
}
//베이스 지도에 축적 컨트롤 추가
map.addControl(createScaleControl());
//서브 지도에 축적 컨트롤 추가
map2.addControl(createScaleControl());

//지도에 줌 슬라이더 컨트롤을 추가하는 함수
function createZoomControl() {
    const control = new ol.control.ZoomSlider();
    return control;
}
//베이스 지도에 줌 슬라이더 컨트롤 추가
map.addControl(createZoomControl());
//서브 지도에 줌 슬라이더 컨트롤 추가
map2.addControl(createZoomControl());

//지도에 풀 스크린 컨트롤을 추가하는 함수
function createFullScreenControl() {
    const control = new ol.control.FullScreen({
        className: "ol-fullscreen-control",
    });
    return control;
}
//베이스 지도에 풀 스크린 컨트롤 추가
map.addControl(createFullScreenControl());
//서브 지도에 풀 스크린 컨트롤 추가
map2.addControl(createFullScreenControl());

//베이스 지도의 오버뷰 맵에 표시할 지도 객체
const map1OverviewMap = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `http://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/Base/{z}/{y}/{x}.png`,
        serverType: "geoserver",
        crossOrigin: "anonymous",
    }),
    preload: Infinity,
    type: "map",
});

//서브 지도의 오버뷰 맵에 표시할 지도 객체
const map2OverviewMap = new ol.layer.Tile({
    source: new ol.source.OSM(),
    preload: Infinity,
    type: "map",
});

//지도에 오버뷰맵 컨트롤을 추가하기 위한 함수
function createOverviewMapControl(layer, localStorageId) {
    const control = new ol.control.OverviewMap({
        className: "ol-overviewmap ol-custom-overviewmap",
        view: new ol.View({
            projection: "EPSG:3857",
            center: mapView.getCenter(),
            maxZoom: MAX_ZOOM_LEVEL,
            zoom: mapView.getZoom(),
            minZoom: MIN_ZOOM_LEVEL,
            constrainResolution: true,
        }),
        layers: [layer],
        rotateWithView: true,
        collapsed:
            localStorage.getItem(`overviewMapCollapse${localStorageId}`) === "true"
                ? true
                : false,
    });

    //오버뷰 맵이 클릭되었을 때 발생하는 이벤트. 로컬스토리지에 오버뷰맵의 콜랩스 상태를 저장한다.
    control.getOverviewMap().on("change:size", function () {
        const isCollapsed = control.getCollapsed();
        localStorage.setItem(`overviewMapCollapse${localStorageId}`, isCollapsed);
    });

    return control;
}
//베이스 지도에 오버뷰맵 컨트롤 추가
map.addControl(createOverviewMapControl(map1OverviewMap, 1));
//서브 지도에 오버뷰맵 컨트롤 추가
map2.addControl(createOverviewMapControl(map2OverviewMap, 2));


//지도의 센터 타겟 컨트롤을 추가하는 함수
function createCenterTargetControl() {
    const control = new ol.control.Target({
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
    });

    return control;
}
//베이스 지도에 CenterTarget 컨트롤 추가
map.addControl(createCenterTargetControl());
//서브 지도에 CenterTarget 컨트롤 추가
map2.addControl(createCenterTargetControl());

//지도에 ZoomToExtent 컨트롤을 추가하는 함수
function createZoomToExtentControl() {
    return new ol.control.ZoomToExtent({
        extent: [
            14103925.705518028, 4533240.7238401985, 14229588.180018857,
            4473925.589890901,
        ],
    });
}
//베이스 지도에 ZoomToExtent 컨트롤 추가
map.addControl(createZoomToExtentControl());
//서브 지도에 ZoomToExtent 컨트롤 추가
map2.addControl(createZoomToExtentControl()); 

//방위계 아이콘을 변경하고 컨트롤 객체에 추가한다.
// var span = document.createElement("span");
// span.innerHTML = '<img src="./resources/img/rotate-removebg.png">';
// map.addControl(new ol.control.Rotate({ autoHide: false, label: span }));

//지도에 방위계 컨트롤을 추가하는 함수
function createRotateControl() {
    const control = new ol.control.Rotate({
        autoHide: false
    });
    return control;
}
//베이스 지도에 Rotate 컨트롤 추가
map.addControl(createRotateControl());
//서브 지도에 Rotate 컨트롤 추가
map2.addControl(createRotateControl());

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