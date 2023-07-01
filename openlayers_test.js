//맵의 view 객체 정의
var view = new ol.View({
    center: [14128579.82, 4512570.74],
    maxZoom: 19,
    zoom: 19,
    constrainResolution: true,
    rotation: Math.PI / 6,
    // center: [-8910887.277395891, 5382318.072437216],
    // maxZoom: 19,
    // zoom: 15
});

//일반적인 openlayers 맵 객체
var map = new ol.Map({
    target: document.getElementById("map"),
    view: view,
    interactions : ol.interaction.defaults({
        shiftDragZoom: false
      })
});

//국토정보 플랫폼 API를 사용하기 위한 맵 객체
// var map1 = new ngii_wmts.map("map", {
// 		// center : [960551.04896058,1919735.5150606],
// 		// maxZoom : 19,
// 		// zoom : 19
// });
// var map = map1._getMap();
// map.setView(view)

var currentBaseLayer;

const VWORLD_API_KEY = "A5C5E9FF-F9FC-3012-9D01-41A62F369AA7";

//vworld 기본 타일
const baseLayer = new ol.layer.Tile({
    source: new ol.source.OSM({
        url: `http://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/Base/{z}/{y}/{x}.png`,
        serverType: "geoserver",
        crossOrigin: "anonymous",
    }),
});

currentBaseLayer = baseLayer;

//vworld 문자지도 타일
const textLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `http://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/Hybrid/{z}/{y}/{x}.png`
    })
  });

//vworld 위성지도 타일
const satelliteLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `http://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/Satellite/{z}/{y}/{x}.jpeg`
    })
  });

  //vworld 회색 지도 타일
const greyLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `http://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/gray/{z}/{y}/{x}.png`
    })
  });

  //vworld 야간지도 타일
const midnightLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `http://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/midnight/{z}/{y}/{x}.png`
    })
  });

//맵에 기본 맵 레이어 추가
map.addLayer(baseLayer);

//맵의 객체를 컨트롤하기 위한 빈 벡터 레이어
var vectorLayer = new ol.layer.Vector({ source: new ol.source.Vector() });

const info = document.getElementById("info");
const addressInfo = document.getElementById("address");

var customCondition = function(mapBrowserEvent) {
    if($(areaCheckbox).is(":checked") || $(measureCheckbox).is(":checked") || $(areaCircleCheckbox).is(":checked")){
        return false
    }
    return ol.events.condition.shiftKeyOnly(mapBrowserEvent) &&
        mapBrowserEvent.originalEvent.button !== 2;
};

var extentInteraction = new ol.interaction.Extent({
    condition: customCondition,
    boxStyle :new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: "blue",
            width: 1,
        }),
        fill: new ol.style.Fill({
            color: "rgba(0, 0, 255, 0)",
        }),
        image : new ol.style.Circle({
			radius : 7,
			fill : new ol.style.Fill({
				color : '#FFFFFF',
			}),
		}),
    }),
    pointerStyle : new ol.style.Style({
        image : new ol.style.Circle({
			radius : 0,
			fill : new ol.style.Fill({
				color : '#FFFFFF',
			}),
		}),
    })
});

extentInteraction.on('extentchanged', function (event) {
    var extent = extentInteraction.getExtent();
    if ($(areaCheckbox).is(":checked") || $(measureCheckbox).is(":checked") || $(areaCircleCheckbox).is(":checked")){
        console.log($(areaCheckbox).is(":checked"))
        console.log($(measureCheckbox).is(":checked"))
        console.log($(areaCheckbox).is(":checked"))
        return;
    }
    //console.log(extentInteraction)
    if (extent) {
        var bottomLeft = ol.extent.getBottomLeft(extent);
        var bottomRight = ol.extent.getBottomRight(extent);
        var topLeft = ol.extent.getTopLeft(extent);
        var topRight = ol.extent.getTopRight(extent);
        // console.log(bottomLeft)
        // console.log(bottomRight)
        // console.log(topLeft)
        // console.log(topRight)
        var bottomLeftLonLat = ol.proj.transform(bottomLeft, 'EPSG:3857', 'EPSG:4326');
        var bottomRightLonLat = ol.proj.transform(bottomRight, 'EPSG:3857', 'EPSG:4326');
        var topLeftLonLat = ol.proj.transform(topLeft, 'EPSG:3857', 'EPSG:4326');

        var widthDistance = ol.sphere.getDistance(bottomLeftLonLat, bottomRightLonLat);
        var heigthDistance = ol.sphere.getDistance(topLeftLonLat, bottomLeftLonLat);

        var area = widthDistance * heigthDistance;
        // console.log('가로 길이: ' + widthDistance + ' meters');
        // console.log('세로 길이: ' + heigthDistance + ' meters');
        // console.log('면적: ' + area + ' square meters');
        window.selectedExtent = extent;
        //console.log("Width: " + width + ", Height: " + height + ", Area: " + area);
        
        createExtentInteractionTooltip()
        extentInteractionTooltipElement.innerHTML = extentInteractionTooltipText(
            widthDistance,
            heigthDistance,
            area
        );

        extentInteractionTooltip.setPosition(bottomRight);
        extentInteractionTooltipElement.parentElement.style.pointerEvents = "none";
    }
});

function saveExtentAsImage() {
    var extent = extentInteraction.getExtent();
    if (extent) {
        var mapCanvas = document.querySelector('.ol-viewport canvas');
        
        // 1. Convert extent to pixel coordinates
        var bottomLeft = map.getPixelFromCoordinate(ol.extent.getBottomLeft(extent));
        var topRight = map.getPixelFromCoordinate(ol.extent.getTopRight(extent));

        // 2. Clip the part of the map canvas within the extent
        var width = topRight[0] - bottomLeft[0];
        var height = bottomLeft[1] - topRight[1];
        var clippedCanvas = document.createElement('canvas');
        clippedCanvas.width = width;
        clippedCanvas.height = height;
        var clippedContext = clippedCanvas.getContext('2d');
        clippedContext.drawImage(mapCanvas, bottomLeft[0], topRight[1], width, height, 0, 0, width, height);

        // 3. Convert the clipped canvas to an image
        var image = new Image();
        image.src = clippedCanvas.toDataURL('image/png');
        image.onload = function() {
            // Create a link for downloading the image
            var link = document.createElement('a');
            link.href = image.src;
            link.download = 'map.png';
            link.style.display = 'none';
            link.click();
        };
    }
}

function saveExtentAsPdf() {
    var extent = extentInteraction.getExtent();
    if (extent) {
        var mapCanvas = document.querySelector('.ol-viewport canvas');
        
        // 1. Convert extent to pixel coordinates
        var bottomLeft = map.getPixelFromCoordinate(ol.extent.getBottomLeft(extent));
        var topRight = map.getPixelFromCoordinate(ol.extent.getTopRight(extent));

        // 2. Clip the part of the map canvas within the extent
        var width = topRight[0] - bottomLeft[0];
        var height = bottomLeft[1] - topRight[1];
        var clippedCanvas = document.createElement('canvas');
        clippedCanvas.width = width;
        clippedCanvas.height = height;
        var clippedContext = clippedCanvas.getContext('2d');
        clippedContext.drawImage(mapCanvas, bottomLeft[0], topRight[1], width, height, 0, 0, width, height);

        const format = document.getElementById('format').value;

        const dims = {
            a0: [1189, 841],
            a1: [841, 594],
            a2: [594, 420],
            a3: [420, 297],
            a4: [297, 210],
            a5: [210, 148],
          };

        const dim = dims[format];
        // 3. Convert the clipped canvas to an image
        var pdf = new jspdf.jsPDF('landscape', undefined, format);
        var imgData = clippedCanvas.toDataURL('image/png');
        pdf.addImage(imgData, 'JPEG', 0, 0, dim[0], dim[1]);

        // Save the PDF
        pdf.save('map.pdf');
    }
}

map.addInteraction(extentInteraction);

//지도의 좌표를 이용해 URL 파라미터를 이동하여 뒤로가기 및 앞으로가기 기능을 활성화 한다.
map.addInteraction(new ol.interaction.Link());

map.addLayer(vectorLayer);

const zoomInfo = document.getElementById('zoom-info')

//맵에 축적 추가
const scaleControl = new ol.control.ScaleLine({
    units: "metric", //미터법
    bar: true, //scalebars
    steps: 4, //scalebars 개수
    text: true, //scale 비율 텍스트 표시 플래그
    minWidth: 200, //최소 너비
});
map.addControl(scaleControl);

//맵에 줌 슬라이더 추가
map.addControl(new ol.control.ZoomSlider());

//대각선 좌표를 기준으로 지도를 바운드 시키는 함수
map.addControl(
    new ol.control.ZoomToExtent({
        extent: [
            14103925.705518028, 4533240.7238401985, 14229588.180018857,
            4473925.589890901,
        ],
    })
);

//지도 객체가 로드가 완료되었을때 동작하는 이벤트
map.on('loadend', function () {
    const center = view.getCenter();
    info.innerHTML = formatCoordinate(center, null);
    var zoomLevel = map.getView().getZoom();
    zoomInfo.innerHTML = `level: ${zoomLevel}`;
});

//지도 클릭 이벤트
map.on("click", function (evt) {
    if (!ol.events.condition.shiftKeyOnly(evt)) {
        extentInteraction.setExtent(undefined);
        map.removeOverlay(extentInteractionTooltip)
    }
    var coordinate = ol.proj.transform(evt.coordinate, "EPSG:3857", "EPSG:4326");
    console.log("4326 좌표", coordinate);
    console.log("각도", map.getView().getRotation(), "radian");
});

//방위계 아이콘을 변경하고 컨트롤 객체에 추가한다.
var span = document.createElement("span");
span.innerHTML = '<img src="./resources/img/rotate-removebg.png">';
map.addControl(new ol.control.Rotate({ autoHide: false, label: span }));

//지도에 방향 표시
map.getView().setRotation(0);

//지도의 방향을 얻어온다.
//console.log(map.getView().getRotation())

//지도에 선 그리고 길이 측정하는 로직
var source = new ol.source.Vector();
var sourceLayer = new ol.layer.Vector({
    source: source,
});

map.addLayer(sourceLayer);

var polygonSource = new ol.source.Vector();

var polygonLayer = new ol.layer.Vector({
    source: polygonSource,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: "blue",
            width: 3,
        }),
        fill: new ol.style.Fill({
            color: "rgba(0, 0, 255, 0.1)",
        }),
    }),
});

map.addLayer(polygonLayer);

var cricleSource = new ol.source.Vector();

var circleLayer = new ol.layer.Vector({
    source: cricleSource,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: "green",
            width: 3,
        }),
        fill: new ol.style.Fill({
            color: "rgba(107,208,137, 0.3)",
        }),
    }),
});

map.addLayer(circleLayer);

//지도의 이동이 종료되었을 때 발생하는 이벤트 지도 중앙좌표와 줌 레벨을 표시한다.
var currZoom = map.getView().getZoom();
map.on("moveend", function (evt) {
    const center = view.getCenter();
    var coordinate = ol.proj.transform(center , "EPSG:3857", "EPSG:4326");
    reverseGeoCodingToRegion(coordinate[0], coordinate[1])
    var newZoom = map.getView().getZoom();
    if (currZoom != newZoom) {
        console.log("zoom end, new zoom: " + newZoom);
        currZoom = newZoom;
        zoomInfo.innerHTML = `level: ${newZoom}`;
    }
});

function formatCoordinate(coordinate, mouseCoordinate) {
    return `
    <table>
      <tbody>
        <tr><th></th><td>지도 중앙 좌표</td></tr>
        <tr><th>lon</th><td>${coordinate[0].toFixed(2)}</td></tr>
        <tr><th>lat</th><td>${coordinate[1].toFixed(2)}</td></tr>
      </tbody>
    </table>`;
}

var drawPolygon;
var areaTooltipElement;
var areaTooltip;

var extentInteractionTooltipElement;
var extentInteractionTooltip;

var sketch; // 현재 그려지고 있는 feature
// var helpTooltipElement; // 도움말 툴팁 요소
//var helpTooltip; // 도움말 툴팁
var measureTooltipElement; // 측정값을 표시하는 툴팁 요소
var measureTooltip; // 측정값 툴팁

// 측정을 위한 interaction을 생성합니다.
var draw; // Create draw interaction outside scope for removal later

var circle;
var circleTooltipElement;
var circleTooltip;

function addLineInteraction() {
    draw = new ol.interaction.Draw({
        source: source,
        type: "LineString",
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: "rgba(255,0,94)",
                width: 3,
            }),
        }),
        stopClick: true,
        freehandCondition : ol.events.condition.never,
        condition: (e) =>
            ol.events.condition.noModifierKeys(e) &&
            ol.events.condition.primaryAction(e),
    });

    map.addInteraction(draw);

    var overlayDisplayed = false;

    draw.on("drawstart", function (evt) {
        sketch = evt.feature;

        sketch.getGeometry().on("change", function (evt) {
            var geom = evt.target;
            //var output = formatLength((geom));
            measureTooltipElement.innerHTML = drawingAreaTooltipText(
                "line",
                this
            );
            measureTooltip.setPosition(geom.getLastCoordinate());
            measureTooltipElement.parentElement.style.pointerEvents = "none";
            if (geom.getCoordinates().length > 2 && !overlayDisplayed) {
                measureTooltipElement.className = "tooltip tooltip-static";
                overlayDisplayed = true;
            }
        });

        measureTooltipElement = document.createElement("div");
        measureTooltipElement.className = "tooltip tooltip-measure";
        measureTooltipElement.style.zIndex = 1;
        measureTooltip = new ol.Overlay({
            element: measureTooltipElement,
            offset: [-15, 0],
            positioning: "top-left",
        });
        map.addOverlay(measureTooltip);
    });

    draw.on("drawend", function (evt) {
        //ol.Observable.unByKey(listener);
        if (!overlayDisplayed) {
            map.removeOverlay(measureTooltip);
        }

        var feature = evt.feature; // 그리기가 완료된 feature를 가져옵니다.
        feature.setStyle(
            new ol.style.Style({
                // feature의 스타일을 설정합니다.
                stroke: new ol.style.Stroke({
                    color: "rgba(255,0,94)",
                    width: 3,
                }),
            })
        );
        var coordinateLength = sketch.getGeometry().getCoordinates().length;
        if (coordinateLength < 2) {
            setTimeout(function () {
                source.removeFeature(evt.feature);
                map.removeOverlay(measureTooltip);
            }, 0);
        }else{
            var overlayToRemove = measureTooltip;
            measureTooltipElement.innerHTML = createAreaTooltipText(
                "line",
                evt.feature.getGeometry()
            );
            var deleteButton = measureTooltipElement.querySelector(".delete-btn");
    
            console.log(sketch.getGeometry().getCoordinates())
            //getRouteSummury(sketch.getGeometry().getCoordinates(), deleteButton)
    
            deleteButton.addEventListener("click", function () {
                // 해당 feature 제거
                source.removeFeature(evt.feature);
                // 해당 tooltip 제거
                map.removeOverlay(overlayToRemove);
            });
            sketch = null;
            measureTooltipElement = null;
            overlayDisplayed = false;
            map.removeInteraction(draw);
            addLineInteraction();
        }
    });
}

function extentInteractionTooltipText(width, heght, measure) {
    let tooltipCase = "";
    let tooltipElementClass = "";
    let tooltipInfoWidth = "";
    let tooltipInfoHeight = "";
    let tooltipInfoMeasure = "";

    tooltipCase = "총 길이 : ";
    tooltipElementClass = "tooltip-info-text-line";
    tooltipInfoWidth = convertingLength(width);
    //console.log(tooltipInfoWidth)
    tooltipInfoHeight = convertingLength(heght);
    tooltipInfoMeasure = convertingMeasure(measure);

    let tooltipInfoWidthText = tooltipInfoWidth[0];
    let tooltipInfoWidthUnit = tooltipInfoWidth[1];

    let tooltipInfoHeightText = tooltipInfoHeight[0];
    let tooltipInfoHeightUnit = tooltipInfoHeight[1];

    let tooltipInfoMeasureText = tooltipInfoMeasure[0];
    let tooltipInfoMeasureUnit = tooltipInfoMeasure[1];
    let text = `<div class="tooltip-content">`;
    text += `<div class="tootip-case">가로 길이 : <span class="${tooltipElementClass}">${tooltipInfoWidthText}</span>${tooltipInfoWidthUnit}</div>`;
    text += `<div class="tootip-case">세로 길이 : <span class="${tooltipElementClass}">${tooltipInfoHeightText}</span>${tooltipInfoHeightUnit}</div>`;
    text += `<div class="tootip-case">면적 : <span class="${tooltipElementClass}">${tooltipInfoMeasureText}</span>${tooltipInfoMeasureUnit}</div>`;
    return text;
}

function createAreaTooltipText(targetInfo, geom) {
    let tooltipCase = "";
    let tooltipElementClass = "";
    let tooltipInfo = "";
    switch (targetInfo) {
        case "line":
            tooltipCase = "총 길이 : ";
            tooltipElementClass = "tooltip-info-text-line";
            tooltipInfo = formatLength(geom);
            break;
        case "circle":
            tooltipCase = "총 면적 : ";
            tooltipElementClass = "tooltip-info-text-circle";
            tooltipInfo = formatCircleArea(geom);
            break;
        case "polygon":
            tooltipCase = "총 면적 : ";
            tooltipElementClass = "tooltip-info-text-polygon";
            tooltipInfo = formatArea(geom);
            break;
    }
    let tooltipInfoText = tooltipInfo[0];
    let tooltipInfoUnit = tooltipInfo[1];
    let text = `<div class="tooltip-content">`;
    text += `<div class="tootip-case">${tooltipCase}<span class="${tooltipElementClass}">${tooltipInfoText}</span>${tooltipInfoUnit}</div>`;
    if (tooltipInfo[2] != null) {
        text += `<div class="tootip-case">반경 : <span class="${tooltipElementClass}">${tooltipInfo[2]}</span>${tooltipInfo[3]}</div>`;
    }
    text += `<button class="delete-btn">지우기</button></div>`;
    return text;
}

function drawingAreaTooltipText(targetInfo, geom) {
    let tooltipCase = "";
    let tooltipElementClass = "";
    let tooltipInfo = "";
    switch (targetInfo) {
        case "line":
            tooltipCase = "총 길이 : ";
            tooltipElementClass = "tooltip-info-text-line";
            tooltipInfo = formatLength(geom);
            break;
        case "circle":
            tooltipCase = "총 면적 : ";
            tooltipElementClass = "tooltip-info-text-circle";
            tooltipInfo = formatCircleArea(geom);
            break;
        case "polygon":
            tooltipCase = "총 면적 : ";
            tooltipElementClass = "tooltip-info-text-polygon";
            tooltipInfo = formatArea(geom);
            break;
    }
    let tooltipInfoText = tooltipInfo[0];
    let tooltipInfoUnit = tooltipInfo[1];
    let text = `<div class="tooltip-content">`;
    text += `<div class="tootip-case">${tooltipCase}<span class="${tooltipElementClass}">${tooltipInfoText}</span>${tooltipInfoUnit}</div>`;
    if (tooltipInfo[2] != null) {
        text += `<div class="tootip-case">반경 : <span class="${tooltipElementClass}">${tooltipInfo[2]}</span>${tooltipInfo[3]}</div>`;
    }
    text +=
        '<div class="tooltip_box"><span class="tooltip_text">마우스 오른쪽 버튼 또는 \'esc\'키를 눌러 마침</span></div>';
    return text;
}

function createAreaTooltip() {
    areaTooltipElement = document.createElement("div");
    areaTooltipElement.className = "tooltip tooltip-measure";
    areaTooltipElement.style.zIndex = 1;
    areaTooltip = new ol.Overlay({
        element: areaTooltipElement,
        offset: [-15, 0],
        positioning: "top-left",
    });
    map.addOverlay(areaTooltip);
}

function createExtentInteractionTooltip() {
    removeExtentInteractionTooltip();
    extentInteractionTooltipElement = document.createElement("div");
    extentInteractionTooltipElement.className = "tooltip tooltip-measure";
    extentInteractionTooltipElement.style.zIndex = 1;
    extentInteractionTooltip = new ol.Overlay({
        element: extentInteractionTooltipElement,
        offset: [-15, 0],
        positioning: "top-left",
    });
    map.addOverlay(extentInteractionTooltip);
}

function removeExtentInteractionTooltip() {
    if (extentInteractionTooltip) {
        map.removeOverlay(extentInteractionTooltip);
        extentInteractionTooltipElement = null;
        extentInteractionTooltip = null;
    }
}

function createCircleAreaTooltip() {
    circleTooltipElement = document.createElement("div");
    circleTooltipElement.className = "tooltip tooltip-measure";
    circleTooltipElement.style.zIndex = 1;
    circleTooltip = new ol.Overlay({
        element: circleTooltipElement,
        offset: [-15, 0],
        positioning: "top-left",
    });
    map.addOverlay(circleTooltip);
}

function addPolygonInteraction() {
    drawPolygon = new ol.interaction.Draw({
        source: polygonSource,
        type: "Polygon",
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: "blue",
                width: 3,
            }),
            fill: new ol.style.Fill({
                color: "rgba(0, 0, 255, 0.1)",
            }),
        }),
        stopClick: true,
        freehandCondition : ol.events.condition.never,
        condition: (e) =>
            ol.events.condition.noModifierKeys(e) &&
            ol.events.condition.primaryAction(e),
    });

    map.addInteraction(drawPolygon);

    var listenerKey;

    drawPolygon.on("drawstart", function (evt) {
        sketch = evt.feature;

        var lastMouseCoordinate;

        listenerKey = map.on("pointermove", function (evt) {
            lastMouseCoordinate = evt.coordinate;
        });

        // 이벤트 핸들러 추가
        sketch.getGeometry().on("change", function (evt) {
            var geom = evt.target;
            //var output = formatArea((geom));
            areaTooltipElement.innerHTML = drawingAreaTooltipText(
                "polygon",
                this
            );
            areaTooltip.setPosition(lastMouseCoordinate);
            areaTooltipElement.parentElement.style.pointerEvents = "none";
        });

        createAreaTooltip();
    });

    drawPolygon.on("drawend", function (evt) {
        var coordinateLength = sketch.getGeometry().getCoordinates()[0].length;
        if (coordinateLength < 4) {
            setTimeout(function () {
                console.log("@@@");
                polygonSource.removeFeature(evt.feature);
                map.removeOverlay(areaTooltip);
                return;
            }, 0);
        }

        var feature = evt.feature;
        var geometry = feature.getGeometry();
        var coordinates = geometry.getCoordinates()[0];
        var lastCoordinate = coordinates[coordinates.length - 2];

        var overlayToRemove = areaTooltip;
        areaTooltipElement.innerHTML = createAreaTooltipText(
            "polygon",
            evt.feature.getGeometry()
        );

        var deleteButton = areaTooltipElement.querySelector(".delete-btn");
        deleteButton.addEventListener("click", function () {
            // 해당 feature 제거
            polygonSource.removeFeature(evt.feature);
            // 해당 tooltip 제거
            map.removeOverlay(overlayToRemove);
        });

        areaTooltip.setPosition(lastCoordinate);

        map.removeInteraction(drawPolygon);
        sketch = null;
        areaTooltipElement = null;
        addPolygonInteraction();

        ol.Observable.unByKey(listenerKey);
        listenerKey = null;
    });
}

function addCircleInteraction() {
    circle = new ol.interaction.Draw({
        source: cricleSource,
        type: "Circle",
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: "green",
                width: 3,
            }),
            fill: new ol.style.Fill({
                color: "rgba(107,208,137, 0.3)",
            }),
        }),
        stopClick: true,
        freehandCondition : ol.events.condition.never,
        condition: (e) =>
            ol.events.condition.noModifierKeys(e) &&
            ol.events.condition.primaryAction(e),
    });

    map.addInteraction(circle);

    var listenerKey;

    circle.on("drawstart", function (evt) {
        var lastMouseCoordinate;

        listenerKey = map.on("pointermove", function (evt) {
            lastMouseCoordinate = evt.coordinate;
        });

        sketch = evt.feature;
        //console.log(sketch.getGeometry())
        // 이벤트 핸들러 추가
        sketch.getGeometry().on("change", function (evt) {
            //var output = formatCircleArea((geom));
            circleTooltipElement.innerHTML = drawingAreaTooltipText(
                "circle",
                this
            );
            circleTooltip.setPosition(lastMouseCoordinate);
            circleTooltipElement.parentElement.style.pointerEvents = "none";
        });
        createCircleAreaTooltip();
    });

    circle.on("drawend", function (evt) {
        var geom = evt.target;
        console.log(geom);
        var coordinateLength = geom.Wv[0].length;
        //console.log(sketch.getGeometry())
        if (coordinateLength < 2) {
            setTimeout(function () {
                console.log("S");
                cricleSource.removeFeature(evt.feature);
                map.removeOverlay(circleTooltip);
            }, 0);
        }

        var overlayToRemove = circleTooltip;
        circleTooltipElement.innerHTML = createAreaTooltipText(
            "circle",
            evt.feature.getGeometry()
        );

        var deleteButton = circleTooltipElement.querySelector(".delete-btn");
        deleteButton.addEventListener("click", function () {
            // 해당 feature 제거
            cricleSource.removeFeature(evt.feature);
            // 해당 tooltip 제거
            map.removeOverlay(overlayToRemove);
        });

        map.removeInteraction(circle);
        sketch = null;
        circleTooltipElement = null;
        addCircleInteraction();

        ol.Observable.unByKey(listenerKey);
        listenerKey = null;
    });
}

document.getElementById("areaCheckbox").addEventListener("change", function () {
    if (this.checked) {
        uncheckedCheckBox(this);
        addPolygonInteraction();
    } else {
        if (drawPolygon) {
            map.removeInteraction(drawPolygon);
        }
        drawPolygon = null;
        sketch = null;
    }
});

document
    .getElementById("areaCircleCheckbox")
    .addEventListener("change", function () {
        if (this.checked) {
            uncheckedCheckBox(this);
            addCircleInteraction();
        } else {
            if (circle) {
                map.removeInteraction(circle);
            }
            circle = null;
            sketch = null;
        }
    });

// 거리를 계산하는 함수입니다.
function formatLength(line) {
    var length = ol.sphere.getLength(line);
    var output;
    var outputUnit;
    if (length > 100) {
        output = Math.round((length / 1000) * 100) / 100;
        outputUnit = "km";
    } else {
        output = Math.round(length * 100) / 100;
        outputUnit = "m";
    }
    return [output, outputUnit];
}

function convertingLength(line) {
    var output;
    var outputUnit;
    if (line > 1000) {
        output = Math.round((line / 1000) * 100) / 100;
        outputUnit = "km";
    } else {
        output = Math.round(line * 100) / 100;
        outputUnit = "m";
    }
    return [output, outputUnit];
}

function convertingMeasure(area) {
    var output;
    var outputUnit;
    if (area > 10000) {
        // 1km^2 이상인 경우 km^2 단위로 표시
        output = Math.round((area / 1000000) * 100) / 100;
        outputUnit = " km<sup>2</sup>";
    } else {
        // 그 외에는 m^2 단위로 표시
        output = Math.round(area * 100) / 100;
        outputUnit = " m<sup>2</sup>";
    }
    return [output, outputUnit];
}

//165320022
// 면적을 계산하는 함수입니다.
function formatArea(polygon) {
    var area = ol.sphere.getArea(polygon);
    var output;
    var outputUnit;
    if (area > 10000) {
        // 1km^2 이상인 경우 km^2 단위로 표시
        output = Math.round((area / 1000000) * 100) / 100;
        outputUnit = " km<sup>2</sup>";
    } else {
        // 그 외에는 m^2 단위로 표시
        output = Math.round(area * 100) / 100;
        outputUnit = " m<sup>2</sup>";
    }
    return [output, outputUnit];
}

function formatCircleArea(polygon) {
    var radiusInMeters = new ol.geom.Polygon.fromCircle(polygon, 100);
    var area = ol.sphere.getArea(radiusInMeters);
    var distance = Math.sqrt(area / Math.PI);
    var output;
    var outputUnit;
    var distanceUnit;
    if (area > 10000) {
        // 1km^2 이상인 경우 km^2 단위로 표시
        output = Math.round((area / 1000000) * 100) / 100;
        outputUnit = " km<sup>2</sup>";
    } else {
        // 그 외에는 m^2 단위로 표시
        output = Math.round(area * 100) / 100;
        outputUnit = " m<sup>2</sup>";
    }
    if (distance > 1000) {
        distance = Math.round((distance / 1000) * 100) / 100;
        distanceUnit = "km";
    } else {
        distance = Math.round(distance * 100) / 100;
        distanceUnit = "m";
    }
    return [output, outputUnit, distance, distanceUnit];
}

//면적/길이측정 체크박스 끼리 간섭이 발생하지 않도록 트리거된 체크박스를 제외한 나머지 체크박스를 해제한다.
function uncheckedCheckBox(selectCheckBox) {
    //체크박스에 부여된 클래스 이름으로 체크박스를 순회한다.
    document.querySelectorAll(".measure").forEach(function (e) {
        //이벤트가 트리거된 체크박스가 아닐경우 동작한다
        if (e !== selectCheckBox) {
            e.checked = false;
            //체크박스의 onChange 이벤트를 강제로 트리거시킨다.
            var event = new Event("change");
            e.dispatchEvent(event);
        }
    });
}

document.getElementById("measureCheckbox").addEventListener("change", function () {
    console.log($(".measure"));
    if (this.checked) {
        uncheckedCheckBox(this);
        addLineInteraction();
    } else {
        if (draw) {
            map.removeInteraction(draw);
        }
        draw = null;
        sketch = null;
    }
});

//ESC 키 입력 이벤트
window.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        if (draw) {
            console.log(draw);
            draw.finishDrawing();
            if (measureTooltipElement) {
                measureTooltipElement.parentNode.removeChild(
                    measureTooltipElement
                );
            }
            map.removeInteraction(draw);
            addLineInteraction();
            return;
        }
        if (drawPolygon) {
            drawPolygon.finishDrawing();
            if (areaTooltipElement) {
                areaTooltipElement.parentNode.removeChild(areaTooltipElement);
            }
            map.removeInteraction(drawPolygon);
            addPolygonInteraction();
            return;
        }

        if (circle) {
            circle.abortDrawing();
            if (circleTooltipElement) {
                circleTooltipElement.parentNode.removeChild(
                    circleTooltipElement
                );
            }
            map.removeInteraction(circle);
            addCircleInteraction();
            return;
        }
    }
});

//이미지 저장 함수
document.getElementById("export-png").addEventListener("click", function () {
    //툴팁까지 포함해서 이미지를 다운로드함
    // map.once("rendercomplete", function () {
    //     html2canvas(document.querySelector("#map"), {
    //         onclone: function(document) {
    //             // let controls = document.querySelectorAll('.ol-control');
    //             // controls.forEach(function(control) {
    //             //     control.style.display = 'none';
    //             // });
    //         }
    //     }).then(canvas => {
    //         const link = document.createElement('a');
    //         link.download = 'map.png';
    //         link.href = canvas.toDataURL();
    //         link.click();
    //     });
    // })
    // map.renderSync();

    map.once('rendercomplete', function () {
        const mapCanvas = document.createElement('canvas');
        const size = map.getSize();
        mapCanvas.width = size[0];
        mapCanvas.height = size[1];
        const mapContext = mapCanvas.getContext('2d');
        Array.prototype.forEach.call(
          map.getViewport().querySelectorAll('.ol-layer canvas, canvas.ol-layer'),
          function (canvas) {
            if (canvas.width > 0) {
              const opacity =
                canvas.parentNode.style.opacity || canvas.style.opacity;
              mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
              let matrix;
              const transform = canvas.style.transform;
              if (transform) {
                // Get the transform parameters from the style's transform matrix
                matrix = transform
                  .match(/^matrix\(([^\(]*)\)$/)[1]
                  .split(',')
                  .map(Number);
              } else {
                matrix = [
                  parseFloat(canvas.style.width) / canvas.width,
                  0,
                  0,
                  parseFloat(canvas.style.height) / canvas.height,
                  0,
                  0,
                ];
              }
              // Apply the transform to the export map context
              CanvasRenderingContext2D.prototype.setTransform.apply(
                mapContext,
                matrix
              );
              const backgroundColor = canvas.parentNode.style.backgroundColor;
              if (backgroundColor) {
                mapContext.fillStyle = backgroundColor;
                mapContext.fillRect(0, 0, canvas.width, canvas.height);
              }
              mapContext.drawImage(canvas, 0, 0);
            }
          }
        );
        mapContext.globalAlpha = 1;
        mapContext.setTransform(1, 0, 0, 1, 0, 0);
        const link = document.getElementById('image-download');
        link.href = mapCanvas.toDataURL();
        link.click();
      });
      map.renderSync();
})

//인쇄 함수
document.getElementById("export-pdf").addEventListener("click", function (e) {
    const dims = {
        a0: [1189, 841],
        a1: [841, 594],
        a2: [594, 420],
        a3: [420, 297],
        a4: [297, 210],
        a5: [210, 148],
      };

    e.target.disabled = true;
    document.body.style.cursor = 'progress';
  
      const format = document.getElementById('format').value;
      const resolution = document.getElementById('resolution').value;
      const dim = dims[format];
      const width = Math.round((dim[0] * resolution) / 25.4);
      const height = Math.round((dim[1] * resolution) / 25.4);
      const size = map.getSize();
      const viewResolution = map.getView().getResolution();

      //툴팁까지 포함해서 pdf로 내보냄
        // html2canvas(document.querySelector("#map"), {
        //     onclone: function(document) {
        //         let controls = document.querySelectorAll('.ol-control');
        //         controls.forEach(function(control) {
        //             control.style.display = 'none';
        //         });
        //     }
        // }).then(canvas => {
        //     // 캔버스를 이미지 데이터 URL로 변환
        //     const imgData = canvas.toDataURL('image/png');
            
        //     // 이미지 데이터 URL을 PDF에 추가
        //     const pdf = new jspdf.jsPDF('landscape', undefined, format);
        //     pdf.addImage(
        //         imgData,
        //         'JPEG',
        //         0,
        //         0,
        //         dim[0],
        //         dim[1]
        //     );
        //     pdf.save("map.pdf");
        //     map.setSize(size);
        //     map.getView().setResolution(viewResolution);
        //     e.target.disabled = false;
        //     document.body.style.cursor = 'auto';
        // });
        // const printSize = [width, height];
        // map.setSize(printSize);
        // const scaling = Math.min(width / size[0], height / size[1]);
        // map.getView().setResolution(viewResolution / scaling);

        map.once('rendercomplete', function () {
            const mapCanvas = document.createElement('canvas');
            mapCanvas.width = width;
            mapCanvas.height = height;
            const mapContext = mapCanvas.getContext('2d');
            Array.prototype.forEach.call(
              document.querySelectorAll('.ol-layer canvas'),
              function (canvas) {
                if (canvas.width > 0) {
                  const opacity = canvas.parentNode.style.opacity;
                  mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
                  const transform = canvas.style.transform;
                  // Get the transform parameters from the style's transform matrix
                  const matrix = transform
                    .match(/^matrix\(([^\(]*)\)$/)[1]
                    .split(',')
                    .map(Number);
                  // Apply the transform to the export map context
                  CanvasRenderingContext2D.prototype.setTransform.apply(
                    mapContext,
                    matrix
                  );
                  mapContext.drawImage(canvas, 0, 0);
                }
              }
            );
            mapContext.globalAlpha = 1;
            mapContext.setTransform(1, 0, 0, 1, 0, 0);
            const pdf = new jspdf.jsPDF('landscape', undefined, format);
            pdf.addImage(
              mapCanvas.toDataURL('image/jpeg'),
              'JPEG',
              0,
              0,
              dim[0],
              dim[1]
            );
            pdf.save('map.pdf');
            // Reset original map size
            map.setSize(size);
            map.getView().setResolution(viewResolution);
            e.target.disabled = false;
            document.body.style.cursor = 'auto';
          });
      
          // Set print size
          const printSize = [width, height];
          map.setSize(printSize);
          const scaling = Math.min(width / size[0], height / size[1]);
          map.getView().setResolution(viewResolution / scaling);
}, false);

//spectrum 라이브러리 호출 함수
$("#color-picker").spectrum({
    flat: false,
    preferredFormat: "hex", //hex hex3 hsl rgb name
    togglePaletteOnly: true, //줄이기버튼
    showInput: true,
    showInitial: true,
    showButtons: true,
    showAlpha: true,
    change: function (color) {
        console.log("change");
        console.log(color.toRgbString());
    },
    show: function (color) {
        console.log("show");
    },
    move: function (color) {
        console.log("move");
    },
});

//   $("#color-picker").on('move.spectrum', function(e, tinycolor) {
// 	const hex = tinycolor.toHex();
// 	const rgba = tinycolor.toRgb();
// 	console.log(hex);
// 	console.log(rgba);
//    });

function getRouteSummury(routeCoordinates, infoElement) {
    //let osrmUrl = `https://router.project-osrm.org/route/v1/driving/`;
    let osrmUrl = `http://192.168.10.99:6001/route/v1/driving/`;
    routeCoordinates.forEach((routeCoordinate, index) =>{
        //console.log(routeCoordinate)
        var coord4326 = ol.proj.transform(routeCoordinate, "EPSG:3857", "EPSG:4326")
        // console.log(coord4326)
        // console.log(index, routeCoordinates.length)
        if(index == routeCoordinates.length - 1){
            osrmUrl += `${coord4326[0]},${coord4326[1]}`
        }else{
            osrmUrl += `${coord4326[0]},${coord4326[1]};`
        }
    })
    osrmUrl += `?overview=full&geometries=geojson&steps=true`
    console.log(osrmUrl)
    $.ajax(
        osrmUrl
    ).done(function (data) {
        let instructions = data.routes[0].legs[0].steps
            .map(step => `${step.maneuver.type == "depart" ? "시작점" : step.maneuver.type == "arrive" ? "도착점" : ""}${step.maneuver.modifier} ${step.name} ${step.distance}m`) // instruction 추출
            .join('<br>');
        let instructionsElement = document.getElementById('route-info');
        instructionsElement.innerHTML = instructions;
        let coordinates = data.routes[0].geometry.coordinates.map(c => ol.proj.transform(c, 'EPSG:4326', 'EPSG:3857'));

        let totalDistance = (data.routes[0].distance / 1000).toFixed(1); // km 단위
        let totalDuration = (data.routes[0].duration / 60).toFixed(0); // 분 단위

        
        let newDiv = `<div class="tooltip-case">자동차 : <span class="tooltip-info-text-line">${totalDuration}</span>분</div>
        <div class="tooltip-case">경로 길이 : <span class="tooltip-info-text-line">${totalDistance}</span>km</div>
        <button id="show-route-btn" class="show-route-btn">경로보기</button>`;
        $(infoElement).before(newDiv)
        let route = new ol.geom.LineString(coordinates);
        $('#show-route-btn').click(() => {
            let routeFeature = new ol.Feature({
                geometry: route,
                name: 'Route'
            });
                
              let routeSource = new ol.source.Vector({
                features: [routeFeature]
            });
                
            let routeLayer = new ol.layer.Vector({
                source: routeSource,
                style: [
                    new ol.style.Style({
                      stroke: new ol.style.Stroke({
                        color: '#0000ff', // 바깥선 색상 (파랑)
                        width: 6 // 바깥선 두께
                      })
                    }),
                    new ol.style.Style({
                      stroke: new ol.style.Stroke({
                        color: '#6F79BC', // 안쪽 색상 (연한 파랑)
                        width: 4 // 안쪽 선 두께
                      })
                    })
                  ]
              });
                
              map.addLayer(routeLayer);
        });
    });
}

//ol-context 마커 아이콘
var pinIcon = "https://cdn.jsdelivr.net/gh/jonataswalker/ol-contextmenu@604befc46d737d814505b5d90fc171932f747043/examples/img/pin_drop.png";
//ol-context 지도 중앙위치 아이콘
var centerIcon = "https://cdn.jsdelivr.net/gh/jonataswalker/ol-contextmenu@604befc46d737d814505b5d90fc171932f747043/examples/img/center.png";
//ol-context 목록 아이콘
var listIcon = "https://cdn.jsdelivr.net/gh/jonataswalker/ol-contextmenu@604befc46d737d814505b5d90fc171932f747043/examples/img/view_list.png";

var pdfIcon = "./resources/img/pdf.png"

var imageIcon = "./resources/img/image.png"

var deleteIcon = "./resources/img/delete.png"

var refreshIcon = "./resources/img/refresh.png"

var startMarkerIcon = "./resources/img/red_marker.png"
var endMarkerIcon = "./resources/img/green_marker.png"

var bookMarkerIcon = "./resources/img/book_mark.png"

var namespace = "ol-ctx-menu";
var icon_class = "-icon";
var zoom_in_class = "-zoom-in";
var zoom_out_class = "-zoom-out";

//ol-context 메뉴 아이템 구성 리스트
var contextmenuItems = [
    {
        text: '출발',
        classname: 'start-item',
        icon: startMarkerIcon,
        callback: startMarker, // 적절한 콜백 함수
    },
    {
        text: '도착',
        classname: 'end-item',
        icon: endMarkerIcon,
        callback: endMarker, // 적절한 콜백 함수
    },
    {
        text: "지도 중앙 이동",
        classname: "bold",
        icon: centerIcon,
        callback: center,
    },
    {
        text: "북마크",
        classname: "bold",
        icon: bookMarkerIcon,
        callback: addBookMark,
    },
    {
        text: "좌표",
        classname: "ol-coordinate",
        callback: center,
    },
    {
        text: "기타 작업",
        icon: listIcon,
        items: [
            {
                text: "지도 중앙 이동",
                icon: centerIcon,
                callback: center,
            },
            {
                text: "마커 추가",
                icon: pinIcon,
                callback: marker,
            },
        ],
    },
    {
        text: "마커 추가",
        icon: pinIcon,
        callback: marker,
    },
    {
        text: "새로 고침",
        icon: refreshIcon,
        callback: refresh,
    },
    "-",
    {
        text: "줌 인",
        classname: [namespace + zoom_in_class, namespace + icon_class].join(
            " "
        ),
        callback: zoomIn,
    },
    {
        text: "줌 아웃",
        classname: [namespace + zoom_out_class, namespace + icon_class].join(
            " "
        ),
        callback: zoomOut,
    },
];

//ol-context callback 함수 줌 레벨을 한단계 확대한다.
function zoomIn(obj, map) {
    map.getView().animate({
        zoom: map.getView().getZoom() + 1,
        center: obj.coordinate,
        duration: 500,
    });
}

//ol-context callback 함수 줌 레벨을 한단계 축소한다
function zoomOut(obj, map) {
    map.getView().animate({
        zoom: map.getView().getZoom() - 1,
        center: obj.coordinate,
        duration: 500,
    });
}

//ol-context callback 함수 화면을 새로고침 한다.
function refresh(obj) {
    window.location.reload(); 
}

//ol-context 이벤트 메뉴가 오픈될 때 트리거된다.
var contextmenu = new ContextMenu({
  width: 300,
  defaultItems: false,
  items: contextmenuItems
});

map.addControl(contextmenu);

//ol-context 메뉴가 열리기 전에 발생하는 이벤트 면적/길이 측정을 진행하는 동안에는 메뉴를 열지 않는다.
contextmenu.on('beforeopen', function (evt) {
    if ($(areaCheckbox).is(":checked") ||$(measureCheckbox).is(":checked") ||$(areaCircleCheckbox).is(":checked")){
        contextmenu.disable();
        if (draw) {
            console.log(draw);
            draw.finishDrawing();
            if (measureTooltipElement) {
                measureTooltipElement.parentNode.removeChild(measureTooltipElement);
            }
            map.removeInteraction(draw);
            addLineInteraction();
            return;
        }
        if (drawPolygon) {
            drawPolygon.finishDrawing();
            if (areaTooltipElement) {
                areaTooltipElement.parentNode.removeChild(areaTooltipElement);
            }
            map.removeInteraction(drawPolygon);
            addPolygonInteraction();
            return;
        }
    
        if (circle) {
            circle.abortDrawing();
            if (circleTooltipElement) {
                circleTooltipElement.parentNode.removeChild(circleTooltipElement);
            }
            map.removeInteraction(circle);
            addCircleInteraction();
            return;
        }
    }else{
        return contextmenu.enable();
    }
});

//ol-context 메뉴가 열릴 때 발생하는 이벤트
contextmenu.on('open', function (evt) {
    var isInsideExtent = false;
    if(extentInteraction.getExtent()){
        isInsideExtent = ol.extent.containsCoordinate(extentInteraction.getExtent(), evt.coordinate);
    }
    var feature =	map.forEachFeatureAtPixel(evt.pixel, ft => ft);

    if (feature && feature.get('type') === 'removable') {
        contextmenu.clear();
        removeMarkerItem.data = { marker: feature };
        contextmenu.push(removeMarkerItem);
    } else if(isInsideExtent) {
        contextmenu.clear();
        captureItem[2].data = { extent: extentInteraction.getExtent() };
        contextmenu.extend(captureItem);
    } else {
        let coord4326 = ol.proj.transform(evt.coordinate, "EPSG:3857", "EPSG:4326");
        let address = reverseGeoCoding(coord4326[0], coord4326[1])
        contextmenu.clear();
        contextmenuItems[3].data = { address : address}
        contextmenu.extend(contextmenuItems);
        document.querySelector('.ol-coordinate').innerText = `${coord4326[0]},\n${coord4326[1]}\n${address}`;
        //contextmenu.extend(contextmenu.getDefaultItems());
    }
});

//ol-context의 엘리먼트, 마커 위에서 동작했을 때 트리거된다.
var removeMarkerItem = {
    text: "마커 삭제",
    classname: "marker",
    icon : deleteIcon,
    callback: removeMarker,
};

//ol-context의 엘리먼트, extentInteraction 위에서 동작했을 때 트리거된다.
var captureItem = [
    {
        text: "이미지 저장",
        classname: "center",
        icon: imageIcon,
        callback: imageCapture,
    },
    {
        text: "pdf 저장",
        icon : pdfIcon,
        classname: "marker",
        callback: exportPdf,
    },
    {
        text: "줌",
        classname: [namespace + zoom_in_class, namespace + icon_class].join(
            " "
        ),
        callback: zoomExntent,
    },
    {
        text: "영역 삭제",
        icon : deleteIcon,
        callback: removeExtent,
    }
]


//지도 위에서 마우스가 이동할 때 발생하는 이벤트 길이와 면적 측정시 마우스 커서를 변경하고, 지도 위에 특정 레이어가 존재한다면 커서를 변경한다.
map.on("pointermove", function (e) {
    const center = view.getCenter();
    info.innerHTML = formatCoordinate(center, e.coordinate);
    if (e.dragging) return;

    var pixel = map.getEventPixel(e.originalEvent);
    var hit = map.hasFeatureAtPixel(pixel);

    if (
        $(areaCheckbox).is(":checked") ||
        $(measureCheckbox).is(":checked") ||
        $(areaCircleCheckbox).is(":checked")
    ) {
        map.getTargetElement().style.cursor = changeMouseCursor();
    } else {
        map.getTargetElement().style.cursor = hit ? "pointer" : "";
    }
});

// from https://github.com/DmitryBaranovskiy/raphael
// function elastic(t) {
//     return (
//         Math.pow(2, -10 * t) * Math.sin(((t - 0.075) * (2 * Math.PI)) / 0.3) + 1
//     );
// }

//ol-context callback 함수 맵의 중앙 위치를 이동한다.
function center(obj) {
    view.animate({
        duration: 700,
        center: obj.coordinate,
    });
}

//ol-context callback 함수 해당 위치를 북마크로 등록한다.
function addBookMark(obj){
    var modal = new bootstrap.Modal(document.getElementById('bookmark-modal'), {
        keyboard: true,
        x : obj.coordinate[0],
        y : obj.coordinate[1],
        address : obj.data.address
    })
    document.getElementById("form-control-address").innerText = obj.data.address
    modal.toggle()
    console.log(obj)
}

//특정 영역의 이미지 캡쳐를 위한 함수
function imageCapture() {
    saveExtentAsImage()
}

//특정 영역만큼으로 줌을 당기는 함수
function zoomExntent(obj) {
    //view.setConstrainResolution(false)
    console.log(obj.data.extent)
    map.getView().fit(obj.data.extent, map.getSize()); 
    //view.setConstrainResolution(true)
}

//특정 영역의 PDF 저장을 위한 함수
function exportPdf(obj) {
    saveExtentAsPdf()
}

//extent 영역을 삭제한다.
function removeExtent(obj){
    if(extentInteraction){
        extentInteraction.setExtent(undefined);
        map.removeOverlay(extentInteractionTooltip)   
    }
}

//ol-context callback 함수 특정 마커를 삭제한다.
function removeMarker(obj) {
    vectorLayer.getSource().removeFeature(obj.data.marker);
}

//ol-context callback 함수 지도위에 마커를 그린다.
function marker(obj) {
    var template = "좌표 : ({x}, {y})",
        iconStyle = new ol.style.Style({
            image: new ol.style.Icon({ scale: 0.6, src: pinIcon }),
            text: new ol.style.Text({
                offsetY: 25,
                text: ol.coordinate.format(obj.coordinate, template, 12),
                font: "15px Open Sans,sans-serif",
                fill: new ol.style.Fill({ color: "#111" }),
                stroke: new ol.style.Stroke({ color: "#eee", width: 2 }),
            }),
        }),
        feature = new ol.Feature({
            type: "removable",
            geometry: new ol.geom.Point(obj.coordinate),
        });

    feature.setStyle(iconStyle);
    vectorLayer.getSource().addFeature(feature);
}

function startMarker(obj) {
    let coord4326 = ol.proj.transform(obj.coordinate, "EPSG:3857", "EPSG:4326");
    let address = reverseGeoCoding(coord4326[0], coord4326[1])
    var source = vectorLayer.getSource();
    var features = source.getFeatures();
    for (var i = 0; i < features.length; i++) {
        var feature = features[i];
        if(feature && feature.get('attribute') == "start"){
            source.removeFeature(feature);
        }
    }
    var iconStyle = new ol.style.Style({
            image: new ol.style.Icon({ scale: 0.6, src: startMarkerIcon }),
            text: new ol.style.Text({
                offsetY: 25,
                text: address,
                font: "15px Open Sans,sans-serif",
                fill: new ol.style.Fill({ color: "#111" }),
                stroke: new ol.style.Stroke({ color: "#eee", width: 2 }),
            }),
        }),
        feature = new ol.Feature({
            type: "removable",
            geometry: new ol.geom.Point(obj.coordinate),
            attribute : "start"
        });

    feature.setStyle(iconStyle);
    vectorLayer.getSource().addFeature(feature);

    var endFeature = features.find(feature => feature.get('attribute') === 'end');
    if (endFeature) {
        var endCoordinates = endFeature.getGeometry().getCoordinates();
        console.log(endCoordinates);
        console.log("시작 마커를 찍었고 끝지점의 마커도 존재한다")
    }
}

function endMarker(obj) {
    let coord4326 = ol.proj.transform(obj.coordinate, "EPSG:3857", "EPSG:4326");
    let address = reverseGeoCoding(coord4326[0], coord4326[1])
    var source = vectorLayer.getSource();
    var features = source.getFeatures();
    for (var i = 0; i < features.length; i++) {
        var feature = features[i];
        if(feature && feature.get('attribute') == "end"){
            source.removeFeature(feature);
        }
    }
    
    var iconStyle = new ol.style.Style({
            image: new ol.style.Icon({ scale: 0.6, src: endMarkerIcon }),
            text: new ol.style.Text({
                offsetY: 25,
                text: address,
                font: "15px Open Sans,sans-serif",
                fill: new ol.style.Fill({ color: "#111" }),
                stroke: new ol.style.Stroke({ color: "#eee", width: 2 }),
            }),
        }),
        feature = new ol.Feature({
            type: "removable",
            geometry: new ol.geom.Point(obj.coordinate),
            attribute : "end"
        });

    feature.setStyle(iconStyle);
    vectorLayer.getSource().addFeature(feature);
    var startFeature = features.find(feature => feature.get('attribute') === 'start');
    if (startFeature) {
        var startCoordinates = startFeature.getGeometry().getCoordinates();
        console.log(startCoordinates);
        console.log("끝 마커를 찍었고 시작 지점의 마커도 존재한다")
    }
}

function addMarker(coordinate) {

    var source = vectorLayer.getSource();
    var features = source.getFeatures();
    for (var i = 0; i < features.length; i++) {
        var feature = features[i];
        if (ol.coordinate.equals(feature.getGeometry().getCoordinates(), coordinate)) {
            // If a marker already exists at the coordinate, remove it
            if(feature.get('attribute') == "position"){
                source.removeFeature(feature);
            }
        }
    }
    var coord4326 = ol.proj.transform(coordinate, "EPSG:3857", "EPSG:4326"),
        template = "현재 위치",
        iconStyle = new ol.style.Style({
            image: new ol.style.Icon({ scale: 0.6, src: pinIcon }),
            text: new ol.style.Text({
                offsetY: 25,
                text: ol.coordinate.format(coord4326, template, 12),
                font: "15px Open Sans,sans-serif",
                fill: new ol.style.Fill({ color: "#111" }),
                stroke: new ol.style.Stroke({ color: "#eee", width: 2 }),
            }),
        }),
        feature = new ol.Feature({
            type: "removable",
            geometry: new ol.geom.Point(coordinate),
            attribute : "position"
        });

    feature.setStyle(iconStyle);
    vectorLayer.getSource().addFeature(feature);
}

//새로고침 버튼 클릭 이벤트 클릭시 지도 영역만 새로고침한다.
document.getElementById("refresh").addEventListener("click", function () {
    $("#refresh").load(window.location.href + " #refresh");
});

//툴팁 클릭 이벤트 클릭시 해당 툴팁이 툴팁 오버레이중 최 상단으로 올라온다. 
$(document).on("click", ".tooltip-content", function (event) {
    event.stopPropagation(); // 자식 엘리먼트의 클릭 이벤트 전파(stopPropagation)

    let overlays = map.getOverlays().getArray();
    let highestZIndex = 0;

    overlays.forEach((overlay) => {
        let overlayElement = overlay.getElement();

        if (overlayElement) {
            let overlayZIndex = Number(
                window.getComputedStyle(overlayElement).zIndex
            );
            if (!isNaN(overlayZIndex) && overlayZIndex > highestZIndex) {
                highestZIndex = overlayZIndex;
            }
        }
    });

    // 선택된 오버레이의 ZIndex를 가장 높게 설정합니다.
    let selectedOverlayElement = $(this).parent()[0];
    $(selectedOverlayElement.parentElement).css("z-index", highestZIndex + 1);
    selectedOverlayElement.style.zIndex = highestZIndex + 1;
});

//마우스 커서를 변경하는 함수
function changeMouseCursor() {
    if ($(areaCheckbox).is(":checked")) {
        return "url(./resources/img/control-toolbox-distance_icon-cursor-area.png), auto";
    }
    if ($(measureCheckbox).is(":checked")) {
        return "url(./resources/img/control-toolbox-distance_icon-cursor-distance.png), auto";
    }
    if ($(areaCircleCheckbox).is(":checked")) {
        return "url(./resources/img/control-toolbox-distance_icon-cursor-radius.png), auto";
    }
}

//지도 위의 면적 및 길이측적 벡터 레이어와 툴팁 오버레이를 전부 삭제한다.
document.getElementById("remove-measure").addEventListener("click", function () {

    map.getOverlays().getArray().slice(0).forEach(function(overlay) {
        map.removeOverlay(overlay) ;
    });
    if (extentInteraction) {
        extentInteraction.setExtent(undefined);
    }
    source.clear()
    polygonSource.clear()
    cricleSource.clear()
})

//현재 내 위치에 마커를 찍고 지도 센터를 옮기는 이벤트
document.getElementById("current-position").addEventListener("click", function () {
    if ("geolocation" in navigator) {
        /* geolocation is available */
        navigator.geolocation.getCurrentPosition(position =>{
            const { latitude, longitude } = position.coords;
            const coordinate = ol.proj.transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857');
            console.log(coordinate)
            map.getView().setCenter(coordinate);
            if(map.getView().getZoom() < 14){
                map.getView().setZoom(14)
            }
            addMarker(coordinate)
        });
      } else {
        /* geolocation IS NOT available */
      }
})

//카카오 API를 이용해 주소를 검색하는 API
function searchAddress(address){
    const REST_API_KEY = "a75f661f8fd50587142251f0476ef2da"
    $.ajax({
        type: "GET",
        url: "https://dapi.kakao.com/v2/local/search/address.json",
        data: {query : address},
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization",`KakaoAK ${REST_API_KEY}`);
        },
        success: function (res) {
            console.log(res);
            // const corrdinate = ol.proj.transform([res.documents[0].address.x, res.documents[0].address.y], 'EPSG:4326', 'EPSG:3857');
            // map.getView().setCenter(corrdinate);
        },
        error: function(xhr, status, error){ 
			//alert(error); 
		}
    });
}

//카카오 API를 이용해 좌표를 상세 주소로 변환하는 API
function reverseGeoCoding(coordinateX, coordinateY){
    const REST_API_KEY = "a75f661f8fd50587142251f0476ef2da"
    let result = "";
    $.ajax({
        type: "GET",
        url: "https://dapi.kakao.com/v2/local/geo/coord2address.json",
        async: false,
        data: {
            x : coordinateX,
            y : coordinateY,
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization",`KakaoAK ${REST_API_KEY}`);
        },
        success: function (res) {
            console.log(res);
            if(res.documents.length < 1){
                result = "주소를 찾을 수 없습니다."
            }else{
                result = res.documents[0].road_address != null ? res.documents[0].road_address.address_name : res.documents[0].address.address_name;
            }
        },
        error: function(xhr, status, error){ 
            console.log(error, status)
			result = "주소를 찾을 수 없습니다."
		}
    });
    return result;
}

//카카오 API를 이용해 좌표를 행정구역으로 변환하는 API
function reverseGeoCodingToRegion(coordinateX, coordinateY){
    const REST_API_KEY = "a75f661f8fd50587142251f0476ef2da"
    $.ajax({
        type: "GET",
        url: "https://dapi.kakao.com/v2/local/geo/coord2regioncode.json",
        data: {
            x : coordinateX,
            y : coordinateY,
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization",`KakaoAK ${REST_API_KEY}`);
        },
        success: function (res) {
            console.log(res);
            addressInfo.innerHTML = `${res.documents[0].address_name}`
        },
        error: function(xhr, status, error){ 
			addressInfo.innerHTML = "주소를 찾을 수 없습니다."
		}
    });
}

function sample4_execDaumPostcode() {
    new daum.Postcode({
        oncomplete: function(data) {
            // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분.

            // 도로명 주소의 노출 규칙에 따라 주소를 표시한다.
            // 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
            var roadAddr = data.roadAddress; // 도로명 주소 변수
            var extraRoadAddr = ''; // 참고 항목 변수

            // 법정동명이 있을 경우 추가한다. (법정리는 제외)
            // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
            if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
                extraRoadAddr += data.bname;
            }
            // 건물명이 있고, 공동주택일 경우 추가한다.
            if(data.buildingName !== '' && data.apartment === 'Y'){
               extraRoadAddr += (extraRoadAddr !== '' ? ', ' + data.buildingName : data.buildingName);
            }
            // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
            if(extraRoadAddr !== ''){
                extraRoadAddr = ' (' + extraRoadAddr + ')';
            }

            // 우편번호와 주소 정보를 해당 필드에 넣는다.
            document.getElementById('sample4_postcode').value = data.zonecode;
            document.getElementById("sample4_roadAddress").value = roadAddr;
            document.getElementById("sample4_jibunAddress").value = data.jibunAddress;
            searchAddress(roadAddr)
        }
    }).open();
}

// document.getElementById("search-address").addEventListener("click", function () {
//     let searchValue = document.getElementById("search-address-text").value;
//     if(searchValue === ""){
//         return alert("검색어를 입력해주세요")
//     }
//     searchAddress(searchValue)
// })


document.getElementById("olcontrolBookmarkMinimizeDiv").addEventListener("click", function () {
    $("#olControlBookmarkContent").toggle()
    $("#olcontrolBookmarkMinimizeDiv").css("display", "none")
    $("#olcontrolBookmarkMaximizeDiv").css("display", "block")
})

document.getElementById("olcontrolBookmarkMaximizeDiv").addEventListener("click", function () {
    $("#olControlBookmarkContent").toggle()
    $("#olcontrolBookmarkMaximizeDiv").css("display", "none")
    $("#olcontrolBookmarkMinimizeDiv").css("display", "block")
})

document.getElementById("btn-add-bookmark").addEventListener("click", function (e) {
    const myModalEl = document.getElementById("bookmark-modal")
    const modal = bootstrap.Modal.getInstance(myModalEl)
    const storagedName = document.getElementById("recipient-name").value;
    
    if(storagedName.length < 1){
        return alert("북마크 이름은 필수입니다")
    }
    const existsValueFlat = window.localStorage.getItem(storagedName)
    if(existsValueFlat){
        return alert("북마크 이름은 중복될 수 없습니다.")
    }
    const storageObject = {
        name : storagedName,
        address : modal._config.address,
        x : modal._config.x,
        y : modal._config.y,
        zoom : map.getView().getZoom()
    }
    const objString = JSON.stringify(storageObject);
    
    window.localStorage.setItem(storagedName, objString)
    const container = $("#bookmark-container")
    let text = `<span class="olControlBookmarkRemove"></span>
        <span class="olControlBookmarkLink">${storagedName}</span><br>`
    container.append(text)
    modal.hide();
})

$(document).on('show.bs.modal', '.modal', function () {
    $(document).on('contextmenu', function (e) {
        e.preventDefault();
    });
}).on('hidden.bs.modal', '.modal', function () {
    document.getElementById("recipient-name").value = ""
    $(document).off('contextmenu');
});

$(document).ready(function(){
    //window.localStorage.clear();
    const container = $("#bookmark-container")
    for(let i = 0; i < window.localStorage.length; i++){

        const key = window.localStorage.key(i);
        const value = JSON.parse(window.localStorage.getItem(key));

        let text = `<span class="olControlBookmarkRemove"></span>
        <span class="olControlBookmarkLink">${value.name}</span><br>`
        
        console.log(value)
        //console.log(key + " : " + value + "<br />");
        container.append(text)
    }
});

$('#bookmark-container').on('click', '.olControlBookmarkLink', function() {
    var index = $('.olControlBookmarkLink').index(this);
    var storageKey = $('.olControlBookmarkLink').eq(index).text();
    console.log('Clicked link at index: ', index);
    console.log(storageKey);

    const value = JSON.parse(window.localStorage.getItem(storageKey));

    console.log(value)

    map.getView().setCenter([value.x, value.y]);

    map.getView().setZoom(value.zoom)
});

$('#bookmark-container').on('click', '.olControlBookmarkRemove', function() {

    if (!confirm("북마크를 삭제하시겠습니까?")) {
        // 취소(아니오) 버튼 클릭 시 이벤트
    } else {
        var index = $('.olControlBookmarkRemove').index(this);
        var storageKey = $('.olControlBookmarkLink').eq(index).text();
    
        $('.olControlBookmarkLink').eq(index).remove();
        $('.olControlBookmarkRemove').eq(index).remove();
        $('#bookmark-container br').eq(index).remove();
    
        window.localStorage.removeItem(storageKey);
    }
});

document.querySelectorAll('input[name="map-layer"]').forEach((elem) => {
    elem.addEventListener("change", function(event) {
    var layerType = event.target.value; // 선택된 레이어 타입
  
    var newBaseLayer;
    switch (layerType) {
      case 'basic':
        newBaseLayer = baseLayer
        break;
      case 'text':
        newBaseLayer = textLayer
        break;
    case 'satellite':
        newBaseLayer = satelliteLayer
        break;
    case 'gray':
        newBaseLayer = greyLayer
        break;
    case 'night':
        newBaseLayer = midnightLayer
        break;
    }

    if (currentBaseLayer) {
        map.removeLayer(currentBaseLayer);
        map.getLayers().getArray().map(layer => {
            layer.setZIndex(1)
        });
    }
    map.addLayer(newBaseLayer);
    currentBaseLayer = newBaseLayer;
    });
  });

// map.removeLayer(baseLayer)
// map.getLayers().getArray().map(layer => {
//     console.log(layer)
//     layer.setZIndex(1)
// });
// map.addLayer(satelliteLayer)
// map.renderSync()