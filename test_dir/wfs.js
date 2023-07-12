/* ServerSide Value */
var formatWFS = new ol.format.WFS();

var xs = new XMLSerializer();

//맵생성 시 추가
var gmlJson = {'F_FAC_BUILDING_11_202208':{}};
var mapJson = {};
var target_map='F_FAC_BUILDING_11_202208';

/* GML 데이터 */
//맵생성시 추가
gmlJson['F_FAC_BUILDING_11_202208']['insert'] = new ol.format.GML({
	featureNS : 'cite',
	featureType : 'F_FAC_BUILDING_11_202208',
	srsName: 'EPSG:3857'
});

gmlJson['F_FAC_BUILDING_11_202208']['upddel'] = new ol.format.GML({
	featureNS : 'http://192.168.10.99:8180/geoserver/cite/wfs',
	featureType : 'F_FAC_BUILDING_11_202208',
	srsName: 'EPSG:3857',
});

function transactWFS(mode, f) {
	var node;
	switch (mode) {
	case 'insert':
		node = formatWFS.writeTransaction([ f ], null, null, gmlJson[target_map]['insert']);
		break;
	case 'update':
		node = formatWFS.writeTransaction(null, [ f ], null, gmlJson[target_map]['upddel']);
		break;
	case 'delete':
		node = formatWFS.writeTransaction(null, null, [ f ], gmlJson[target_map]['upddel']);
		break;
	}
	var payload = xs.serializeToString(node);
	// switch (mode) {
	// case 'update':
	// 	payload=payload.replace("feature:"+target_map,"cite:"+target_map);
	// 	break;
	// }
	console.log(payload)
	$.ajax('http://192.168.10.99:8180/geoserver/cite/wfs', {
		type : 'POST',
		dataType : 'xml',
		processData : false,
		contentType : 'text/xml',
		data : payload
	}).done(function(data1,data2,data3) {
		console.log(data1);
		console.log(data2);
		//mapJson[target_map].clear();
	}).always(function(){
		switch (mode) {
		case 'insert':
			var propNodes = node.getElementsByTagName("Property");
			console.log(propNameNode)
			for (var i = 0; i < propNodes.length; i++) {
				var propNode = propNodes[i];
				var propNameNode = propNode.firstElementChild;
				var propNameNodeValue = propNameNode.firstChild;
				if (propNameNodeValue.nodeValue === "geometry") {
					propNode.parentNode.removeChild(propNode);
					break;
				}
			}
			break;
		}
	});
};

/* 맵데이터 */ 
// var F_FAC_BUILDING_11_202208 = new ol.source.Vector({
// 		format: new ol.format.GeoJSON(),
// 			loader: function (extent) {
// 				$.ajax('http://192.168.10.99:8180/geoserver/cite/wfs', {
// 					type: 'GET',
// 					data: {
// 						service: 'WFS',
// 						version: '1.1.0',
// 						request: 'GetFeature',
// 						typename: 'cite:F_FAC_BUILDING_11_202208',
// 						srsname: 'EPSG:4326',
//                         outputFormat: 'application/json',
//                         bbox: extent.join(',') + ',EPSG:4326'
// 					}
// 				}).done(function (response) {
// 					F_FAC_BUILDING_11_202208.addFeatures(formatWFS.readFeatures(response));
//                     console.log(response)
// 				});
// 			},
// 			strategy: ol.loadingstrategy.bbox,
// 			projection: 'EPSG:4326'
// 		});

var F_FAC_BUILDING_11_202208 = new ol.source.Vector({
		format: new ol.format.GeoJSON(),
		url: function (extent) {
			var strUrl = 'http://192.168.10.99:8180/geoserver/cite/wfs?' +
				'service=WFS&' +
				'version=1.1.0&' +
				'request=GetFeature&' +
				'typename=cite:F_FAC_BUILDING_11_202208&' +
				'srsname=EPSG:3857&' +
				'outputFormat=application/json&' +
				'bbox=' + extent.join(',') + ',EPSG:3857&'+
				'maxFeatures=20';
			console.log(strUrl)
			//console.log(ol.proj.transform([14191563.931306984,4557248.183032685], 'EPSG:3857', 'EPSG:4326'));
			return strUrl;
		},
		strategy: ol.loadingstrategy.bbox,
	});

mapJson['F_FAC_BUILDING_11_202208'] = new ol.layer.Vector({
	source : F_FAC_BUILDING_11_202208,
	style : new ol.style.Style({
		fill : new ol.style.Fill({
			color : 'rgba(255, 0, 0, 0.2)',
		}),
		stroke : new ol.style.Stroke({
			color : '#ff0000',
			width : 2,
		}),
		image : new ol.style.Circle({
			radius : 7,
			fill : new ol.style.Fill({
				color : '#ff0000',
			}),
		}),
	}),
});

var style_simple = new ol.style.Style({
		fill : new ol.style.Fill({
			color : 'rgba(255, 0, 0, 0.2)',
		}),
		stroke : new ol.style.Stroke({
			color : '#ff0000',
			width : 2,
		}),
		image : new ol.style.Circle({
			radius : 7,
			fill : new ol.style.Fill({
				color : '#ff0000',
			}),
		}),
  });

  var layer = 'cite:F_FAC_BUILDING_11_202208';
  var projection_epsg_no = '900913';
  var vectorTiles = new ol.layer.VectorTile({
	style:style_simple,
	source: new ol.source.VectorTile({
        tilePixelRatio: 1, // oversampling when > 1
        tileGrid: ol.tilegrid.createXYZ({maxZoom: 19}),
        format: new ol.format.MVT(),
        url: 'http://192.168.10.99:8180/geoserver/gwc/service/tms/1.0.0/' + layer +
		'@EPSG%3A'+projection_epsg_no+'@pbf/{z}/{x}/{-y}.pbf'
      })
});
  
//일반적인 openlayers 맵 객체
// var map = new ol.Map({
// 	layers : [ 
// 		new ol.layer.Tile({
// 			source : new ol.source.OSM({
// 				url : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
//                 serverType : 'geoserver',
// 	            crossOrigin: 'anonymous',
// 			})
// 		}), 
// 		mapJson['F_FAC_BUILDING_11_202208']
// 	],
// 	target : document.getElementById('map'),
// 	view : new ol.View({
// 		center : [ 14128579.82, 4512570.74 ],
// 		maxZoom : 19,
// 		zoom : 19,
// 		constrainResolution: true,
// 		rotation: Math.PI / 6,
//         // center: [-8910887.277395891, 5382318.072437216],
//         // maxZoom: 19,
//         // zoom: 15
// 	})
// });


//국토정보 플랫폼 API를 사용하기 위한 맵 객체
var map1 = new ngii_wmts.map("map", {
		// center : [960551.04896058,1919735.5150606],
		// maxZoom : 19,
		// zoom : 19
});

var map = map1._getMap();
map1._addDefaultMapModeBox()
map.setView(
	new ol.View({
		center : [ 14128579.82, 4512570.74 ],
		maxZoom : 19,
		minZoom : 6,
		zoom : 19,
		constrainResolution: true,
		rotation: Math.PI / 6,
        // center: [-8910887.277395891, 5382318.072437216],
        // maxZoom: 19,
        // zoom: 15
		// center: [-8910887.277395891, 5382318.072437216],
		// maxZoom: 19,
		// zoom: 15
	})
)

const buttonEl = document.getElementById("map-mode-change-button");
buttonEl.onclick = function (event) {
	map1._setMapMode(2)
	map.removeLayer(vectorTiles)
};


//맵에 타일캐시(pbf) 추가
map.addLayer(vectorTiles)

//맵에 벡터타일 추가
//map.addLayer(mapJson['F_FAC_BUILDING_11_202208'])

//맵에 축적 추가
map.addControl(new ol.control.ScaleLine());

//맵에 줌 슬라이더 추가
map.addControl(new ol.control.ZoomSlider())

//지도 클릭 이벤트
map.on('click', function(evt){
    console.log(evt.coordinate);
	var coordinate = chageCoordinate(evt.coordinate, 'EPSG:3857', 'EPSG:4326')
	//var select = select = new ol.interaction.Select();
	console.log("4326 좌표", coordinate.flatCoordinates);
	console.log("각도",map.getView().getRotation(),"radian")
});

var span = document.createElement("span");
span.innerHTML ='<img src="./resources/img/rotate-removebg.png">';
//방위계 아이콘을 변경한다.
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
var currZoom = map.getView().getZoom();
map.on('moveend', function(e) {
  var newZoom = map.getView().getZoom();
  if (currZoom != newZoom) {
    console.log('zoom end, new zoom: ' + newZoom);
    currZoom = newZoom;
  }
});

//지도에 선 그리고 길이 측정하는 로직
var source = new ol.source.Vector();
var sourceLayer = new ol.layer.Vector({
	source: source
});

map.addLayer(sourceLayer);

var sketch; // 현재 그려지고 있는 feature
var helpTooltipElement; // 도움말 툴팁 요소
var helpTooltip; // 도움말 툴팁
var measureTooltipElement; // 측정값을 표시하는 툴팁 요소
var measureTooltip; // 측정값 툴팁

// 측정을 위한 interaction을 생성합니다.
var draw; // Create draw interaction outside scope for removal later

function addInteraction() {
	draw = new ol.interaction.Draw({
		source: source,
		type: 'LineString',
		style: new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: 'rgba(255, 0, 0, 0.5)',
				lineDash: [10, 10],
				width: 2,
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
			var output = formatLength((geom));
			measureTooltipElement.innerHTML = output;
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

	draw.on('drawend', function () {
		sketch = null;
		ol.Observable.unByKey(listener);

		if (!overlayDisplayed) {
			map.removeOverlay(measureTooltip);
		}

		measureTooltipElement = null;
		overlayDisplayed = false;
		map.removeInteraction(draw);
		addInteraction();
	});
}

addInteraction();

window.addEventListener('keydown', function(event) {
	if (event.key === "Escape") {
		draw.finishDrawing();
		map.removeInteraction(draw);
		addInteraction();
	}
});

// 거리를 계산하는 함수입니다.
function formatLength(line) {
	var length = ol.sphere.getLength(line);
	var output;
	if (length > 100) {
		output = (Math.round((length / 1000) * 100) / 100) + ' km';
	} else {
		output = (Math.round(length * 100) / 100) + ' m';
	}
	return output;
}

// 테스트를 위해 주석하였음
/* Delete */
// var ExampleDelete = {	
// 	init : function() {
// 		this.select = new ol.interaction.Select();
// 		map.addInteraction(this.select);

// 		this.setEvents();
// 		this.setActive(false);
		
// 		this.selectItem = null;
// 	},
// 	setEvents : function() {
// 		var selectedFeatures = this.select.getFeatures();
// 		selectedFeatures.on('add', function(event){
// 			this.selectItem = event.element;
// 			console.log(event)
// 		}, this);
// 		selectedFeatures.on('remove', function(event){
// 			this.selectItem = null;
// 			console.log(event)
// 		}, this);
// 	},
// 	setActive : function(active) {
// 		this.select.setActive(active);
// 	},
// };
// ExampleDelete.init();

// function deleteItem(){
// 	console.log("delete works")
// 	console.log("delete works", ExampleDelete)
// 	console.log("delete works", rdo_delete.checked)
// 	if( rdo_delete.checked == true ){
// 		if( ExampleDelete.selectItem != null ){
// 			if (confirm("정말 삭제하시겠습니까?")) {
// 				transactWFS('delete', ExampleDelete.selectItem);
// 				mapJson[target_map].getSource().removeFeature(ExampleDelete.selectItem);
// 				ExampleDelete.select.getFeatures().clear();
// 			}
// 		}	
// 	}
// }
// /* ModiFy */
// var ExampleModify = {
// 	init : function() {
// 		this.select = new ol.interaction.Select();
// 		map.addInteraction(this.select);

// 		this.modify = new ol.interaction.Modify({
// 			features : this.select.getFeatures(),
// 		});
// 		map.addInteraction(this.modify);

// 		this.setEvents();
// 		this.setActive(false);
// 	},
// 	setEvents : function() {
// 		var selectedFeatures = this.select.getFeatures();

// 		this.select.on('change:active', function() {
// 			selectedFeatures.forEach(function(each) {
// 				selectedFeatures.remove(each);
// 			});
// 		});
		
// 		this.dirty = {};
		
// 		this.select.getFeatures().on('add', function (e) {
// 			e.element.on('change', function (e) {
// 				ExampleModify.dirty[e.target.getId()] = true;
// 			});
// 		});
		
// 		this.select.getFeatures().on('remove', function (e) {
// 			var f = e.element;
// 			if (ExampleModify.dirty[f.getId()]) {
// 				delete ExampleModify.dirty[f.getId()];
// 				var featureProperties = f.getProperties();
// 				delete featureProperties.boundedBy;
// 				var clone = new ol.Feature(featureProperties);
// 				clone.setId(f.getId());
// 				clone.setGeometryName('geom');
// 				transactWFS('update', clone);
// 			}
// 		});
// 	},
// 	setActive : function(active) {
// 		this.select.setActive(active);
// 		this.modify.setActive(active);
// 	},
// };
// ExampleModify.init();

// /* Draw */
// var optionsForm = document.getElementById('options-form');
// var drawObj = null;
// var ExampleDraw = {
// 	init : function() {
// 		this.setDrawType();
// 		map.addInteraction(this.Point);
// 		map.addInteraction(this.LineString);
// 		map.addInteraction(this.Polygon);
// 		map.addInteraction(this.Circle);

// 		this.Point.on('drawend',function(e){
// 			transactWFS('insert', e.feature);
// 		})
// 		this.LineString.on('drawend',function(e){
// 			transactWFS('insert', e.feature);
// 		})
// 		this.Polygon.on('drawend',function(e){
// 			var f = e.feature;
// 			f.set('emd_cd', '11111111');
// 			f.set('emd_nm', '테스트');
// 			f.set('emd_eng_nm', 'test');
// 			f.setGeometryName('geom');
// 			drawObj = f;
// 			transactWFS('insert', e.feature);
// 		})
// 		this.Circle.on('drawend',function(e){
// 			transactWFS('insert', e.feature);
// 		})
		
// 		this.Point.setActive(false);
// 		this.LineString.setActive(false);
// 		this.Polygon.setActive(false);
// 		this.Circle.setActive(false);
// 		// The snap interaction must be added after the Modify and Draw interactions
// 		// in order for its map browser event handlers to be fired first. Its handlers
// 		// are responsible of doing the snapping.
// 		map.addInteraction(this.snap);
// 	},
// 	setDrawType:function(){
// 		var source = mapJson[target_map].getSource(); 
// 		this.Point = new ol.interaction.Draw({
// 			source : source,
// 			type : 'Point',
// 			geometryName : 'geom',
// 		});
// 		this.LineString = new ol.interaction.Draw({
// 			source : source,
// 			type : 'MultiLineString',
// 			geometryName : 'geom',
// 		});
// 		this.Polygon = new ol.interaction.Draw({
// 			source : source,
// 			type : 'MultiPolygon',
// 			geometryName : 'geom',
// 		});
// 		this.Circle = new ol.interaction.Draw({
// 			source : source,
// 			type : 'Circle',
// 			geometryName : 'geom',
// 		});
// 		this.snap = new ol.interaction.Snap({
// 			source: source,
// 		});
// 	},
// 	getActive : function() {
// 		return this.activeType ? this[this.activeType].getActive() : false;
// 	},
// 	setActive : function(active) {
// 		var type = optionsForm.elements['draw-type'].value;
// 		if (active) {
// 			this.activeType && this[this.activeType].setActive(false);
// 			this[type].setActive(true);
// 			this.activeType = type;
// 		} else {
// 			this.activeType && this[this.activeType].setActive(false);
// 			this.activeType = null;
// 		}
// 	},
// 	removeInteraction: function(){
// 		map.removeInteraction(this.Point);
// 		map.removeInteraction(this.LineString);
// 		map.removeInteraction(this.Polygon);
// 		map.removeInteraction(this.Circle);
// 		map.removeInteraction(this.snap);
// 	}
// };
// ExampleDraw.init();

// /**
//  * Let user change the geometry type.
//  * @param {Event} e Change event.
//  */

// optionsForm.onchange = function (e) {
// 	var type = e.target.getAttribute('name');
// 	var value = e.target.value;
// 	if (type == 'draw-type') {
// 		ExampleDraw.getActive() && ExampleDraw.setActive(true);
// 	}else if(type == 'map-type'){
// 		if(rdo_draw.checked){
// 			rdo_draw.checked = false;
// 		}else if(rdo_modify.checked){
// 			ExampleModify.setActive(false);
// 			ExampleModify.setActive(true);
// 		}else if(rdo_delete.checked){
// 			ExampleDelete.setActive(false);
// 			ExampleDelete.setActive(true);
// 		}
// 		map.removeLayer(mapJson[target_map]);
// 		map.addLayer(mapJson[value]);
// 		ExampleDraw.removeInteraction();
		
// 		target_map = value;
// 		ExampleDraw.init();
// 	} else if (type == 'interaction') {
// 		if (value == 'modify') {
// 			ExampleDraw.setActive(false);
// 			ExampleModify.setActive(true);
// 			ExampleDelete.setActive(false);
// 		} else if (value == 'draw') {
// 			ExampleDraw.setActive(true);
// 			ExampleModify.setActive(false);
// 			ExampleDelete.setActive(false);
// 		} else if (value == 'delete') {
// 			ExampleDraw.setActive(false);
// 			ExampleModify.setActive(false);
// 			ExampleDelete.setActive(true);
// 		}
// 	}
// };