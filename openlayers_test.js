 
//맵의 view 객체 정의
var view = new ol.View({
	center : [ 14128579.82, 4512570.74 ],
	maxZoom : 19,
	zoom : 19,
	constrainResolution: true,
	rotation: Math.PI / 6
	// center: [-8910887.277395891, 5382318.072437216],
	// maxZoom: 19,
	// zoom: 15
})

//일반적인 openlayers 맵 객체
var map = new ol.Map({
	target : document.getElementById('map'),
	view :view
});


//국토정보 플랫폼 API를 사용하기 위한 맵 객체
// var map1 = new ngii_wmts.map("map", {
// 		// center : [960551.04896058,1919735.5150606],
// 		// maxZoom : 19,
// 		// zoom : 19
// });
// var map = map1._getMap();
// map.setView(
// 	new ol.View({
// 		center : [ 14128579.82, 4512570.74 ],
// 		maxZoom : 19,
// 		minZoom : 6,
// 		zoom : 19,
// 		constrainResolution: true,
// 		rotation: Math.PI / 6,
//         // center: [-8910887.277395891, 5382318.072437216],
//         // maxZoom: 19,
//         // zoom: 15
// 		// center: [-8910887.277395891, 5382318.072437216],
// 		// maxZoom: 19,
// 		// zoom: 15
// 	})
// )

//화면에 노출할 기본 지도 타일
var tile = new ol.layer.Tile({
	source : new ol.source.OSM({
		url : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
		serverType : 'geoserver',
		crossOrigin: 'anonymous',
	})
});

//맵의 객체를 컨트롤하기 위한 빈 벡터 레이어
var vectorLayer = new ol.layer.Vector({ source: new ol.source.Vector() });

//지도의 좌표를 이용해 URL 파라미터를 이동하여 뒤로가기 및 앞으로가기 기능을 활성화 한다.
map.addInteraction(new ol.interaction.Link());

//맵에 기본 맵 레이어 추가
map.addLayer(tile)

map.addLayer(vectorLayer)


//맵에 축적 추가
const scaleControl = new ol.control.ScaleLine({
	units: 'metric',	//미터법
	bar: true,			//scalebars
	steps: 4,			//scalebars 개수
	text: true,		//scale 비율 텍스트 표시 플래그
	minWidth: 200,		//최소 너비
  });
map.addControl(scaleControl);

//맵에 줌 슬라이더 추가
map.addControl(new ol.control.ZoomSlider());

//대각선 좌표를 기준으로 지도를 바운드 시키는 함수
map.addControl(new ol.control.ZoomToExtent({
	extent: [
	14103925.705518028, 4533240.7238401985, 14229588.180018857, 4473925.589890901,
	],
  }));

//지도 클릭 이벤트
map.on('click', function(evt){
    console.log(evt.coordinate);
	var coordinate = chageCoordinate(evt.coordinate, 'EPSG:3857', 'EPSG:4326')
	//var select = select = new ol.interaction.Select();
	console.log("4326 좌표", coordinate.flatCoordinates);
	console.log("각도",map.getView().getRotation(),"radian")
});

//방위계 아이콘을 변경한다.
var span = document.createElement("span");
span.innerHTML ='<img src="./resources/img/rotate-removebg.png">';
map.addControl(new ol.control.Rotate({ autoHide: false, label: span }))

//좌표계를 변환한다.
function chageCoordinate(targetCoordinate, beforCoordinateSystem, afterCoordinateSystem){
	var newCoordinate = new ol.geom.Point(ol.proj.transform(targetCoordinate, beforCoordinateSystem, afterCoordinateSystem))
	return newCoordinate
}

//지도에 방향 표시
map.getView().setRotation(0);

//지도의 방향을 얻어온다.
//console.log(map.getView().getRotation())

//지도 줌의 변화가 발생했을 때 동작하는 이벤트
const zoomInfo = document.getElementById('zoom-info');
var currZoom = map.getView().getZoom();
map.on('moveend', function(e) {
  var newZoom = map.getView().getZoom();
  if (currZoom != newZoom) {
    console.log('zoom end, new zoom: ' + newZoom);
    currZoom = newZoom;
	zoomInfo.innerHTML = `줌 레벨 : ${newZoom}`
  }
});

//지도에 선 그리고 길이 측정하는 로직
var source = new ol.source.Vector();
var sourceLayer = new ol.layer.Vector({
	source: source
});

map.addLayer(sourceLayer);

var polygonSource = new ol.source.Vector();

var polygonLayer = new ol.layer.Vector({
    source: polygonSource,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'blue',
            width: 3
        }),
        fill: new ol.style.Fill({
            color: 'rgba(0, 0, 255, 0.1)'
        })
    })
});

map.addLayer(polygonLayer);

var sircleSource = new ol.source.Vector();

var sircleLayer = new ol.layer.Vector({
    source: sircleSource,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'green',
            width: 3
        }),
        fill: new ol.style.Fill({
            color: 'rgba(107,208,137, 0.3)'
        })
    })
});

map.addLayer(sircleLayer);

const info = document.getElementById('info');
map.on('moveend', function () {
  const view = map.getView();
  const center = view.getCenter();
  info.innerHTML = formatCoordinate(center);
});

function formatCoordinate(coordinate) {
  return `
    <table>
      <tbody>
        <tr><th>lon</th><td>${coordinate[0].toFixed(2)}</td></tr>
        <tr><th>lat</th><td>${coordinate[1].toFixed(2)}</td></tr>
      </tbody>
    </table>`;
}


var drawPolygon; 
var areaTooltipElement;
var areaTooltip;

var sketch; // 현재 그려지고 있는 feature
// var helpTooltipElement; // 도움말 툴팁 요소
//var helpTooltip; // 도움말 툴팁
var measureTooltipElement; // 측정값을 표시하는 툴팁 요소
var measureTooltip; // 측정값 툴팁

// 측정을 위한 interaction을 생성합니다.
var draw; // Create draw interaction outside scope for removal later

var circle;
var sircleTooltipElement;
var circleTooltip;

function addLineInteraction() {
	draw = new ol.interaction.Draw({
		source: source,
		type: 'LineString',
		style: new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: 'rgba(255,0,94)',
				width: 3
			}),
		}),
	});

	map.addInteraction(draw);

	var listener;
	var overlayDisplayed = false;

	draw.on('drawstart', function (evt) {
		sketch = evt.feature;

		listener = sketch.getGeometry().on('change', function(evt) {
			var geom = evt.target;
			//var output = formatLength((geom));
			measureTooltipElement.innerHTML = drawingAreaTooltipText("line", this);
			measureTooltip.setPosition(geom.getLastCoordinate());

			if (geom.getCoordinates().length > 2 && !overlayDisplayed) {
				measureTooltipElement.className = 'tooltip tooltip-static';
				measureTooltip.setOffset([0, -7]);
				overlayDisplayed = true;
			}
		});

		measureTooltipElement = document.createElement('div');
		measureTooltipElement.className = 'tooltip tooltip-measure';
		measureTooltip = new ol.Overlay({
			element: measureTooltipElement,
			offset: [0, -15],
			positioning: 'bottom-center',
		});
		map.addOverlay(measureTooltip);
	});

	draw.on('drawend', function (evt) {
		sketch = null;
		ol.Observable.unByKey(listener);
		getRouteSummury(126.9166035574894,37.60234079487296,128.6359639090519,37.02346466801575)
		if (!overlayDisplayed) {
			map.removeOverlay(measureTooltip);
		}

		var feature = evt.feature;  // 그리기가 완료된 feature를 가져옵니다.
		feature.setStyle(new ol.style.Style({  // feature의 스타일을 설정합니다.
			stroke: new ol.style.Stroke({
				color: 'rgba(255,0,94)',
				width: 3
			}),
		}));
		var geom = evt.target;
		var coordinateLength = geom.Wv[0].length
		if(coordinateLength < 2){
			setTimeout(function() {
				polygonSource.removeFeature(evt.feature);
				map.removeOverlay(measureTooltip);
			}, 0);
		}

		var overlayToRemove = measureTooltip;
		measureTooltipElement.innerHTML = createAreaTooltipText("line", evt.feature.getGeometry())
		var deleteButton = measureTooltipElement.querySelector('.delete-btn');
		deleteButton.addEventListener('click', function() {
			// 해당 feature 제거
			source.removeFeature(evt.feature);
			// 해당 tooltip 제거
			map.removeOverlay(overlayToRemove);
		});

		measureTooltipElement = null;
		overlayDisplayed = false;
		map.removeInteraction(draw);
		addLineInteraction();
	});
}

function createAreaTooltipText(targetInfo, geom) {
	let tooltipCase = "";
	let tooltipElementClass = "";
	let tooltipInfo = "";
	switch(targetInfo){
		case "line" : tooltipCase = "총 길이 : "
			tooltipElementClass = "tooltip-info-text-line"
			tooltipInfo = formatLength((geom));
			break;
		case "circle" : tooltipCase = "총 면적 : "
			tooltipElementClass = "tooltip-info-text-circle"
			tooltipInfo = formatCircleArea((geom));
			break;
		case "polygon" : tooltipCase = "총 면적 : "
			tooltipElementClass = "tooltip-info-text-polygon"
			tooltipInfo = formatArea((geom));
			break;
	}
	let tooltipInfoText = tooltipInfo[0];
	let tooltipInfoUnit = tooltipInfo[1];
    let text = `<div class="tooltip-content">`;
	text += `<div class="tootip-case">${tooltipCase}<span class="${tooltipElementClass}">${tooltipInfoText}</span>${tooltipInfoUnit}</div>`
	if(tooltipInfo[2] != null){
		text += `<div class="tootip-case">반경 : <span class="${tooltipElementClass}">${tooltipInfo[2]}</span>${tooltipInfo[3]}</div>`
	}
	text += `<button class="delete-btn">지우기</button></div>`;
	return text;
}

function drawingAreaTooltipText(targetInfo, geom) {
	let tooltipCase = "";
	let tooltipElementClass = "";
	let tooltipInfo = "";
	switch(targetInfo){
		case "line" : tooltipCase = "총 길이 : "
			tooltipElementClass = "tooltip-info-text-line"
			tooltipInfo = formatLength((geom));
			break;
		case "circle" : tooltipCase = "총 면적 : "
			tooltipElementClass = "tooltip-info-text-circle"
			tooltipInfo = formatCircleArea((geom));
			break;
		case "polygon" : tooltipCase = "총 면적 : "
			tooltipElementClass = "tooltip-info-text-polygon"
			tooltipInfo = formatArea((geom));
			break;
	}
	let tooltipInfoText = tooltipInfo[0];
	let tooltipInfoUnit = tooltipInfo[1];
    let text = `<div class="tooltip-content">`;
	text += `<div class="tootip-case">${tooltipCase}<span class="${tooltipElementClass}">${tooltipInfoText}</span>${tooltipInfoUnit}</div>`
	if(tooltipInfo[2] != null){
		text += `<div class="tootip-case">반경 : <span class="${tooltipElementClass}">${tooltipInfo[2]}</span>${tooltipInfo[3]}</div>`
	}
	text += '<div class="tooltip_box"><span class="tooltip_text">마우스 오른쪽 버튼 또는 \'esc\'키를 눌러 마침</span></div>'
	return text;
}

function createAreaTooltip() {
    areaTooltipElement = document.createElement('div');
    areaTooltipElement.className = 'tooltip tooltip-measure';
    areaTooltip = new ol.Overlay({
        element: areaTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center'
    });
    map.addOverlay(areaTooltip);
}

function createCircleAreaTooltip() {
    sircleTooltipElement = document.createElement('div');
    sircleTooltipElement.className = 'tooltip tooltip-measure';
    circleTooltip = new ol.Overlay({
        element: sircleTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center'
    });
    map.addOverlay(circleTooltip);
}

function addPolygonInteraction() {
    drawPolygon = new ol.interaction.Draw({
        source: polygonSource,
        type: 'Polygon'
    });

    map.addInteraction(drawPolygon);

    drawPolygon.on('drawstart', function (evt) {
        sketch = evt.feature;

        // 이벤트 핸들러 추가
        sketch.getGeometry().on('change', function(evt) {
            var geom = evt.target;
            //var output = formatArea((geom));
            areaTooltipElement.innerHTML = drawingAreaTooltipText("polygon", this);
            areaTooltip.setPosition(geom.getInteriorPoint().getCoordinates());
        });

		createAreaTooltip();
    });

    drawPolygon.on('drawend', function (evt) {
		var geom = evt.target;
		var coordinateLength = geom.Wv[0].length
		console.log(polygonSource);
		console.log(evt.feature);
		if(coordinateLength < 3){
			setTimeout(function() {
				polygonSource.removeFeature(evt.feature);
				map.removeOverlay(areaTooltip);
			}, 0);
		}

		var overlayToRemove = areaTooltip;
		areaTooltipElement.innerHTML = createAreaTooltipText("polygon", evt.feature.getGeometry())

		var deleteButton = areaTooltipElement.querySelector('.delete-btn');
		deleteButton.addEventListener('click', function() {
			// 해당 feature 제거
			polygonSource.removeFeature(evt.feature);
			// 해당 tooltip 제거
			map.removeOverlay(overlayToRemove);
		});

		map.removeInteraction(drawPolygon);
		sketch = null;
        areaTooltipElement = null;
		addPolygonInteraction()
    });
}

function addCircleInteraction() {
    circle = new ol.interaction.Draw({
        source: sircleSource,
        type: 'Circle'
    });

    map.addInteraction(circle);

    circle.on('drawstart', function (evt) {
        sketch = evt.feature;
		//console.log(sketch.getGeometry())
        // 이벤트 핸들러 추가
        sketch.getGeometry().on('change', function(evt) {
            var geom = evt.target;
			console.log(this)
            //var output = formatCircleArea((geom));
            sircleTooltipElement.innerHTML = drawingAreaTooltipText("circle", this);
            circleTooltip.setPosition(geom.getLastCoordinate());
        });
		createCircleAreaTooltip();
    });

    circle.on('drawend', function (evt) {
		var geom = evt.target;
		console.log(geom)
		var coordinateLength = geom.Wv[0].length
		//console.log(sketch.getGeometry())
		if(coordinateLength < 2){
			setTimeout(function() {
				console.log("S")
				sircleSource.removeFeature(evt.feature);
				map.removeOverlay(circleTooltip);
			}, 0);
		}

		var overlayToRemove = circleTooltip;
		sircleTooltipElement.innerHTML = createAreaTooltipText("circle", evt.feature.getGeometry())

		var deleteButton = sircleTooltipElement.querySelector('.delete-btn');
		deleteButton.addEventListener('click', function() {
			// 해당 feature 제거
			sircleSource.removeFeature(evt.feature);
			// 해당 tooltip 제거
			map.removeOverlay(overlayToRemove);
		});

		map.removeInteraction(circle);
		sketch = null;
        sircleTooltipElement = null;
		addCircleInteraction()
    });
}

document.getElementById('areaCheckbox').addEventListener('change', function() {
    if (this.checked) {
        addPolygonInteraction();
    } else {
        if (drawPolygon) {
            map.removeInteraction(drawPolygon);
        }
		drawPolygon = null
		sketch = null;
    }
});

document.getElementById('areaCircleCheckbox').addEventListener('change', function() {
    if (this.checked) {
        addCircleInteraction();
    } else {
        if (circle) {
            map.removeInteraction(circle);
        }
		circle = null
		sketch = null;
    }
});


// 거리를 계산하는 함수입니다.
function formatLength(line) {
	var length = ol.sphere.getLength(line);
	var output;
	var outputUnit;
	if (length > 100) {
		output = (Math.round((length / 1000) * 100) / 100);
		outputUnit = 'km'
	} else {
		output = (Math.round(length * 100) / 100);
		outputUnit = 'm'
	}
	return [output, outputUnit];
}

//165320022
// 면적을 계산하는 함수입니다.
function formatArea(polygon) {
    var area = ol.sphere.getArea(polygon);
    var output;
	var outputUnit;
    if (area > 10000) { // 1km^2 이상인 경우 km^2 단위로 표시
        output = (Math.round((area / 1000000) * 100) / 100);
		outputUnit = ' km<sup>2</sup>';
    } else { // 그 외에는 m^2 단위로 표시
        output = (Math.round(area * 100) / 100);
		outputUnit = ' m<sup>2</sup>';
    }
    return [output, outputUnit];
}

function formatCircleArea(polygon) {
	var radiusInMeters = new ol.geom.Polygon.fromCircle(polygon, 100);
    var area = ol.sphere.getArea(radiusInMeters)
	var distance = Math.sqrt(area / Math.PI)
    var output;
	var outputUnit;
	var distanceUnit;
    if (area > 10000) { // 1km^2 이상인 경우 km^2 단위로 표시
        output = (Math.round((area / 1000000) * 100) / 100);
		outputUnit = ' km<sup>2</sup>';
    } else { // 그 외에는 m^2 단위로 표시
        output = (Math.round(area * 100) / 100);
		outputUnit = ' m<sup>2</sup>';
    }
	if(distance > 1000){
		distance = (Math.round((distance / 1000) * 100) / 100);
		distanceUnit = 'km';
	}else{
		distance = (Math.round(distance * 100) / 100);
		distanceUnit = 'm';
	}
    return [output, outputUnit, distance, distanceUnit];
}

document.getElementById('measureCheckbox').addEventListener('change', function() {
	if (this.checked) {
		addLineInteraction();
	} else {
	  if (draw) {
		map.removeInteraction(draw);
	  }
	  draw = null
	  sketch = null;
	}
  });

//ESC 키 입력 이벤트
window.addEventListener('keydown', function(event) {
	if (event.key === "Escape") {
		if(draw){
			draw.finishDrawing();
			map.removeInteraction(draw);
			addLineInteraction();
		}
		if(drawPolygon){
			drawPolygon.finishDrawing();
			map.removeInteraction(drawPolygon);
			addPolygonInteraction();
		}

		if(circle){
			circle.finishDrawing();
			map.removeInteraction(circle);
			addCircleInteraction();
		}
	}
});

//마우스 오른쪽 클릭 이벤트
// window.oncontextmenu = (e) => {
// 	e.preventDefault()
// 	if(draw){
// 		draw.finishDrawing();
// 		map.removeInteraction(draw);
// 		addLineInteraction();
// 	}
// 	if(drawPolygon){
// 		drawPolygon.finishDrawing();
// 		map.removeInteraction(drawPolygon);
// 		addPolygonInteraction();
// 	}

// 	if(circle){
// 		circle.finishDrawing();
// 		map.removeInteraction(circle);
// 		addCircleInteraction();
// 	}
// }

//이미지로 저장
document.getElementById('export-png').addEventListener('click', function () {
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
  });


  $('#color-picker').spectrum({
	flat: false,
	preferredFormat: "hex",   //hex hex3 hsl rgb name
	togglePaletteOnly: true,   //줄이기버튼
	showInput: true,
	showInitial: true,
	showButtons: true,
	showAlpha: true,
	change:function(color){
		console.log("change")
		console.log(color.toRgbString())
	},
	show:function(color){
		console.log("show")
	},
	move:function(color){
		console.log("move")
	}
  });

//   $("#color-picker").on('move.spectrum', function(e, tinycolor) {
// 	const hex = tinycolor.toHex();
// 	const rgba = tinycolor.toRgb();
// 	console.log(hex);
// 	console.log(rgba);
//    });

function getRouteSummury(startX, startY, endX, endY){
	$.ajax(`https://router.project-osrm.org/route/v1/driving/${startX},${startY};${endX},${endY}?overview=false`)
	.done(function(data) {
		console.log(data);
	})
}


var pinIcon = 'https://cdn.jsdelivr.net/gh/jonataswalker/ol-contextmenu@604befc46d737d814505b5d90fc171932f747043/examples/img/pin_drop.png';
var centerIcon = 'https://cdn.jsdelivr.net/gh/jonataswalker/ol-contextmenu@604befc46d737d814505b5d90fc171932f747043/examples/img/center.png';
var listIcon = 'https://cdn.jsdelivr.net/gh/jonataswalker/ol-contextmenu@604befc46d737d814505b5d90fc171932f747043/examples/img/view_list.png';
var namespace = "ol-ctx-menu";
var icon_class = "-icon";
var zoom_in_class = "-zoom-in";
var zoom_out_class = "-zoom-out";

var contextmenuItems = [
  {
    text: '지도 중앙 변경',
    classname: 'bold',
    icon: centerIcon,
    callback: center
  },
  {
    text: '기타 작업',
    icon: listIcon,
    items: [
      {
        text: '지도 중앙 변경',
        icon: centerIcon,
        callback: center
      },
      {
        text: '마커 추가',
        icon: pinIcon,
        callback: marker
      }
    ]
  },
  {
    text: '마커 추가',
    icon: pinIcon,
    callback: marker
  },
  '-' ,
  {
	text: '줌 인',
	classname: [
	  namespace + zoom_in_class, 
	  namespace + icon_class
	].join(' '),
	callback: zoomIn
  },
  {
	text: '줌 아웃',
	classname: [
	  namespace + zoom_out_class,
	  namespace + icon_class
	].join(' '),
	callback: zoomOut
  }
];

function zoomIn(obj, map){
	map.getView().animate({
		zoom: map.getView().getZoom() + 1,
		center : obj.coordinate,
		duration: 500
	})
}

function zoomOut(obj, map){
	map.getView().animate({
		zoom: map.getView().getZoom() - 1,
		center : obj.coordinate,
		duration: 500
	})
}

var contextmenu = new ContextMenu({
  width: 180,
  defaultItems: false,
  items: contextmenuItems
});

map.addControl(contextmenu);

var removeMarkerItem = {
  text: '마커 삭제',
  classname: 'marker',
  callback: removeMarker
};

contextmenu.on('open', function (evt) {
  var feature =	map.forEachFeatureAtPixel(evt.pixel, ft => ft);
  
  if (feature && feature.get('type') === 'removable') {
    contextmenu.clear();
    removeMarkerItem.data = { marker: feature };
    contextmenu.push(removeMarkerItem);
  } else {
    contextmenu.clear();
    contextmenu.extend(contextmenuItems);
    //contextmenu.extend(contextmenu.getDefaultItems());
  }
});

map.on('pointermove', function (e) {
  if (e.dragging) return;

  var pixel = map.getEventPixel(e.originalEvent);
  var hit = map.hasFeatureAtPixel(pixel);

  map.getTargetElement().style.cursor = hit ? 'pointer' : '';
});

// from https://github.com/DmitryBaranovskiy/raphael
function elastic(t) {
  return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
}

function center(obj) {
  view.animate({
    duration: 700,
    center: obj.coordinate
  });
}

function removeMarker(obj) {
  vectorLayer.getSource().removeFeature(obj.data.marker);
}

function marker(obj) {
  var coord4326 = ol.proj.transform(obj.coordinate, 'EPSG:3857', 'EPSG:4326'),
      template = '좌표 : ({x}, {y})',
      iconStyle = new ol.style.Style({
        image: new ol.style.Icon({ scale: .6, src: pinIcon }),
        text: new ol.style.Text({
          offsetY: 25,
          text: ol.coordinate.format(coord4326, template, 12),
          font: '15px Open Sans,sans-serif',
          fill: new ol.style.Fill({ color: '#111' }),
          stroke: new ol.style.Stroke({ color: '#eee', width: 2 })
        })
      }),
      feature = new ol.Feature({
        type: 'removable',
        geometry: new ol.geom.Point(obj.coordinate)
      });

  feature.setStyle(iconStyle);
  vectorLayer.getSource().addFeature(feature);
}

document.getElementById('refresh').addEventListener('click', function () {
	$("#refresh").load(window.location.href + " #refresh");
})