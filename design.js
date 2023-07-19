proj4.defs("EPSG:5178","+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=500000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs");
proj4.defs("EPSG:5179","+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs ");
proj4.defs("EPSG:5181","+proj=utm +zone=52 +ellps=GRS80 +units=m +no_defs");
ol.proj.proj4.register(proj4);

//맵의 view 객체 정의
const MAX_ZOOM_LEVEL = 20;
const MIN_ZOOM_LEVEL = 6;
const DEFAULT_ZOOM_LEVEL = 15;

//건물 레이어 API 요청 아이디
const BUILDING_LAYER_ID = "lt_c_spbd"
//시도 경계 레이어 API 요청 아이디
const SIDO_LAYER_ID = "lt_c_adsido"
//시/군/구 경계 레이어 API 요청 아이디
const SIGUNGU_LAYER_ID = "lt_c_adsigg"
//읍/면/동 경계 레이어 API 요청 아이디
const MYEONDONG_LAYER_ID = "lt_c_ademd"
//리 경계 레이어 API 요청 아이디
const RI_LAYER_ID = "lt_c_adri"
//도로 레이어 API 요청 아이디
const ROAD_LAYER_ID = "lt_l_moctlink"
//연속지적도 API 요청 아이디
const CADASTRAL_MAP_LAYER_ID = "lp_pa_cbnd_bubun"
//산불위험 예측지도 API 요청 아이디
const MOUNTAIN_FIRE_MAP_LAYER_ID = "lt_c_kfdrssigugrade"
//소방서관할구역 API 요청 아이디
const FIRESTATION_JURISDICTION = "lt_c_usfsffb"
//재해위험지구 API 요청 아이디
const DISASTER_DANGER_LAYER_ID = "lt_c_up201"

var view = new ol.View({
    center: [14128579.82, 4512570.74],
    maxZoom: MAX_ZOOM_LEVEL,
    zoom: DEFAULT_ZOOM_LEVEL,
    minZoom : MIN_ZOOM_LEVEL,
    constrainResolution: true,
    rotation: Math.PI / 6,
    // center: [-8910887.277395891, 5382318.072437216],
    // maxZoom: 19,
    // zoom: 15
});

//일반적인 openlayers 맵 객체
var map = new ol.Map({
    target: document.getElementById("map"),
    pixelRatio: 1,
    view: view,
    interactions : ol.interaction.defaults.defaults({
        shiftDragZoom: false
      })
});

//선택된 지도 레이어를 담을 변수
var currentBaseLayer;

let VWORLD_API_KEY;
if(window.location.href.includes("192")){
    VWORLD_API_KEY = "055CF644-B04A-3772-BF8A-B31B9CDD6364";
}else{
    VWORLD_API_KEY = "A5C5E9FF-F9FC-3012-9D01-41A62F369AA7";
}

let swipeLayer;

//vworld 기본 타일
const baseLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `http://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/Base/{z}/{y}/{x}.png`,
        serverType: "geoserver",
        crossOrigin: "anonymous",
    }),
    preload: Infinity,
    type : "map"
});

currentBaseLayer = baseLayer;

//vworld 문자열 타일
const textLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `http://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/Hybrid/{z}/{y}/{x}.png`,
        crossOrigin: "anonymous",
    }),
    preload: Infinity,
    type : "map"
});

//vworld 위성지도 타일
const satelliteLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `http://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/Satellite/{z}/{y}/{x}.jpeg`,
        crossOrigin: "anonymous",
    }),
    preload: Infinity,
    type : "map"
  });

  //vworld 회색 지도 타일
const greyLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `http://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/gray/{z}/{y}/{x}.png`,
        crossOrigin: "anonymous",
    }),
    preload: Infinity,
    type : "map"
  });

  //vworld 야간지도 타일
const midnightLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `http://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/midnight/{z}/{y}/{x}.png`,
        crossOrigin: "anonymous",
    }),
    preload: Infinity,
    type : "map"
  });

baseLayer.setZIndex(0)
satelliteLayer.setZIndex(0)
textLayer.setZIndex(0)
midnightLayer.setZIndex(0)
greyLayer.setZIndex(0)

//맵에 기본 맵 레이어 추가
map.addLayer(baseLayer);

//맵의 객체를 컨트롤하기 위한 빈 벡터 레이어
var vectorLayer = new ol.layer.Vector({
     source: new ol.source.Vector() 
});
vectorLayer.setZIndex(5)

//경로탐색 결과에 마우스를 호버 하였을 때 포인트를 찍기위한 벡터 레이어
let pointStyle = new ol.style.Style({
    image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({
            color: '#D5DCEF',
            width : 2
        }),
        stroke: new ol.style.Stroke({
            color: 'blue',
            width: 2
        })
    })
});

let routeVectorSource = new ol.source.Vector({});
let routeVectorLayer = new ol.layer.Vector({
    source: routeVectorSource,
    style: pointStyle
});
routeVectorLayer.setZIndex(10)

map.addLayer(routeVectorLayer);

const info = document.getElementById("coordinate");
const addressInfo = document.getElementById("address");
const swipe = document.getElementById('swipe');
const line = document.getElementById('line');

let dragAndDropInteraction;
var koreaExtent = ol.proj.transformExtent([123.75, 33.55, 131.88, 39.44], 'EPSG:4326', 'EPSG:3857');

function setInteraction() {
  if (dragAndDropInteraction) {
    map.removeInteraction(dragAndDropInteraction);
  }
  dragAndDropInteraction = new ol.interaction.DragAndDrop({
    formatConstructors: [
        ol.format.GPX,
        ol.format.GeoJSON,
        ol.format.IGC,
        // use constructed format to set options
        new ol.format.KML({extractStyles: false}),
        ol.format.TopoJSON,
    ],
  });

  dragAndDropInteraction.on('addfeatures', function (event) {
    const vectorSource = new ol.source.Vector ({
      features: event.features,
    });

    let layerExtent = vectorSource.getExtent();
    //console.log(event.features)

    // for(var i = 0 ; i < event.features.length; i ++){
    //     event.features[i].set("attribute", "import")
    //     event.features[i].getKeys().forEach(key =>{
    //         console.log(key,":", event.features[i].get(key))
    //     })
    // }
    // Check if the layer is within Korea
    if (!ol.extent.intersects(layerExtent, koreaExtent)) {
        alert("한국이 아닌 지형의 파일은 레이어를 추가할 수 없습니다.")
        return 
    }

    map.addLayer(
      new ol.layer.Vector({
        source: vectorSource,
      })
    );
    map.getView().fit(vectorSource.getExtent());
  });
  map.addInteraction(dragAndDropInteraction);
}
setInteraction();

// a DragBox interaction used to select features by drawing boxes
const dragBox = new ol.interaction.DragBox({
  condition: ol.events.condition.platformModifierKeyOnly,
});

map.addInteraction(dragBox);

dragBox.on('boxend', function (evt) {
    const boxExtent = dragBox.getGeometry().getExtent();
    //console.log("박스 그리기 끝", boxExtent)
    // var url = 'https://api.vworld.kr/req/data?';
    // url += 'service=data';
    // url += '&request=GetFeature';
    // url += '&data=LP_PA_CBND_BUBUN';
    // url += `&key=${VWORLD_API_KEY}`; // Replace with your actual API key
    // url += '&format=json';
    // url += "&crs=EPSG:3857";
    // url += "&size=1000";
    // url += `&geomFilter=BOX(${boxExtent[0]},${boxExtent[1]},${boxExtent[2]},${boxExtent[3]})`;
    // url +=  "&domain=http://127.0.0.1:3000/openlayers_test.html"


    // $.ajax({
    //     url: url,
    //     type: 'GET',
    //     dataType: "jsonp",
    //     async : false,
    //     jsonpCallback: 'callback',
    //     success: function(data) {
    //         console.log(data)
    //         if(data.response.status != "OK"){
    //             return;
    //         }
    //         var geoInfoObject = data.response.result.featureCollection.features[0];
    //         var geojsonObject = geoInfoObject.geometry;
             
    //         var vectorSource = new ol.source.Vector({
    //             features: (new ol.format.GeoJSON()).readFeatures(geojsonObject)
    //         });
    //         vectorSource.set("ctp_kor_nm",data.response.result.featureCollection.features[0].properties.ctp_kor_nm); 
    //         vectorSource.set("ctp_eng_nm",data.response.result.featureCollection.features[0].properties.ctp_eng_nm); 
    //         //layer.getSource().getKeys()로 확인

    //         var vectorStyle = new ol.style.Style({
    //             fill: new ol.style.Fill({
    //                 color: 'rgba(135,206,250, 0.5)', // Skyblue color fill with opacity
    //             }),
    //             stroke: new ol.style.Stroke({
    //                 color: 'orange', // Orange stroke color
    //                 width: 2
    //             }),
    //         });
             
    //         var vector_layer = new ol.layer.Vector({
    //           source: vectorSource,
    //           style: vectorStyle
    //         })
    //         vector_layer.set("ctp_kor_nm_layer",data.response.result.featureCollection.features[0].properties.ctp_kor_nm+"_layer");
    //         //layer.getKeys() 로 확인
             
    //         map.addLayer(vector_layer);
    //         clickCurrentLayer = vector_layer

    //         var overlayElement = document.createElement('div');
    //         overlayElement.className = "ol-popup";
    //         overlayElement.innerHTML += `<a href="#" id="popup-closer" class="ol-popup-closer"></a>`
    //         overlayElement.innerHTML += `<div id="popup-content">
    //                                         <div class="ol-popup-title">정보</div>
    //                                             <code class="code">${evt.coordinate}<br>주소<br>
    //                                                 <div class="leftBottom__etcBtn">
    //                                                     <ul>
    //                                                         <li class="select customSelect">
    //                                                             <p onclick="searchLocalAddress(this)">${geoInfoObject.properties.addr}</p>
    //                                                         </li>
    //                                                     </ul>
    //                                                 </div>
    //                                             </code>
    //                                             <br>
    //                                             <div style="float: left;">공시지가 : ${geoInfoObject.properties.jiga != "" ? geoInfoObject.properties.jiga.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : "--"}&#8361;, 지목 : ${geoInfoObject.properties.jibun.slice(-1)}</div>
    //                                         </div>`
    //         var overlay = new ol.Overlay({
    //             element: overlayElement,
    //             position: evt.coordinate
    //         });
    //         // Add the overlay to the map
    //         map.addOverlay(overlay);
    //         clickCurrentOverlay = overlay;

    //         var deleteButton = overlayElement.querySelector(".ol-popup-closer");
    //         deleteButton.addEventListener("click", function () {
    //             map.removeLayer(vector_layer);
    //             map.removeOverlay(clickCurrentOverlay);
    //         });
    //     },
    //     beforesend: function(){
             
    //     },
    //     error: function(xhr, stat, err) {}
    //   });
})

dragBox.on('boxstart', function () {
    //console.log("박스 그리기 시작")
});

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
        // console.log($(areaCheckbox).is(":checked"))
        // console.log($(measureCheckbox).is(":checked"))
        // console.log($(areaCheckbox).is(":checked"))
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
        // var transformedExtent  = ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
        // console.log(transformedExtent)
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

//맵에 풀 스크린 컨트롤러 추가
map.addControl(new ol.control.FullScreen({
    className: 'ol-fullscreen-control',
}));

//맵에 오버뷰맵 추가
var overviewMapControl = new ol.control.OverviewMap({
    className: 'ol-overviewmap ol-custom-overviewmap',
    view: new ol.View({
        projection:"EPSG:3857",
        center: view.getCenter(),
        maxZoom: MAX_ZOOM_LEVEL,
        zoom: view.getZoom(),
        minZoom : MIN_ZOOM_LEVEL,
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
        type : "map"
      }),
    ],
    rotateWithView : true,
    collapsed: localStorage.getItem("overviewMapCollapsed") === "true" ? true : false,
  })
map.addControl(overviewMapControl);

//지도의 센터 타겟 추가
map.addControl(new ol.control.Target({
    style : [	
        new ol.style.Style({ image: new ol.style.RegularShape ({ points: 4, radius: 11, radius1: 0, radius2: 0, snapToPixel:true, stroke: new ol.style.Stroke({ color: "#fff", width:3 }) }) }),
        new ol.style.Style({ image: new ol.style.RegularShape ({ points: 4, radius: 11, radius1: 0, radius2: 0, snapToPixel:true, stroke: new ol.style.Stroke({ color: "black", width:2 }) }) })
      ],
    composite : ""
}))

//대각선 좌표를 기준으로 지도를 바운드 시키는 함수
map.addControl(
    new ol.control.ZoomToExtent({
        extent: [
            14103925.705518028, 4533240.7238401985, 14229588.180018857,
            4473925.589890901,
        ],
    })
);

map.on('loadstart', function () {
    map.getTargetElement().classList.add('spinner');
});
//지도 객체가 로드가 완료되었을때 동작하는 이벤트
map.on('loadend', function () {
    const center = view.getCenter();
    var selectedValue = $(".coordinate-system-selector").val();
    info.innerHTML = formatCoordinate(center, "EPSG:3857", selectedValue);
    var zoomLevel = map.getView().getZoom();
    zoomInfo.innerHTML = `level: ${zoomLevel}`;
    map.getTargetElement().classList.remove('spinner');
});

var styleCache = {};

function getStyle (feature, resolution) {    
    var size = feature.get('features').length;
    var style = styleCache[size];
    if (!style)
    {    
        var color = size>25 ? '192,0,0' : size>8 ? '255,128,0' : '0,128,0';
        var radius = Math.max(8, Math.min(size*0.75, 20));
        var dash = 2*Math.PI*radius/6;
        var dash = [ 0, dash, dash, dash, dash, dash, dash ];
        style = styleCache[size] = new ol.style.Style({    
            image: new ol.style.Circle({    
                radius: radius,
                stroke: new ol.style.Stroke({
                    color: 'rgba('+color+',0.5)', 
                    width: 15,
                    lineDash: dash,
                    lineCap: 'butt'
                }),
                fill: new ol.style.Fill({
                    color:'rgba('+color+',1)'
                })
            }),
            text: new ol.style.Text({
                text: size.toString(),
                fill: new ol.style.Fill({
                    color: '#fff'
                }),
                font: '10px Arial',
            })
        });
    }
    return [style];
}

var img = new ol.style.Circle({    
    radius: 5,
    stroke: new ol.style.Stroke({
        color: 'blue', 
        width: 3
    }),
    fill: new ol.style.Fill({
        color: 'rgba(0,255,255,0.3)'
    })
});
// 자식 포인트와 부모 피쳐 사이에 그릴 선에 대한 스타일
var linkStyle = new ol.style.Style({
    image: img,
    stroke: new ol.style.Stroke({
        color: 'rgba(0, 0, 255, 1)', 
        width: 1 
    }) 
});

var selectCluster = new ol.interaction.SelectCluster({    
    // 부모를 클릭하여 자식이 표시될때 부모와 자식간의 거리(px 단위)
    pointRadius:7,
    animate: true,
    // 부모와 자식 사이에 그려질 선에 대한 스타일
    featureStyle: function() {
        return [ linkStyle ];
    },
    // 부모가 선택된 상태에서 다시 부모와 자식이 선택될때 선택된 요소의 스타일
    style: function(f, res) {
        var cluster = f.get('features');
        if(!cluster){
            return;
        }
        if (cluster.length>1) {     // 부모 스타일
            return getStyle(f,res);
        } else { // 자식 스타일
            return [
                new ol.style.Style({    
                    image: new ol.style.Circle({    
                        stroke: new ol.style.Stroke({ color: 'rgba(0,0,192,0.5)', width:2 }),
                        fill: new ol.style.Fill({ color: 'rgba(0,0,192,0.3)' }),
                        radius: 5
                    })
                })
            ];
        }
    }
});
var clickCurrentLayer;
var clickCurrentOverlay

selectCluster.getFeatures().on(['add'], function (e)
{
    var originalFeatures = e.element.get('features');
    if(!originalFeatures){
        e.stopPropagation()
        return;
    }
    //console.log("@", originalFeatures)
    var overlayElement = document.createElement('div');
    overlayElement.className = "ol-popup";

    let contentHTML = `<a href="#" id="popup-closer" class="ol-popup-closer"></a>
        <div id="popup-content">
            <div class="ol-popup-title">CCTV 정보</div>
            <code class="code break-line">`;

    if(originalFeatures.length > 1){
        contentHTML += `선택 개수 : ${originalFeatures.length}<br>`;
        for(var i = 0; i < originalFeatures.length; i++){
            contentHTML += `<span class="cctv-name" data-coordinate-attribute="${originalFeatures[i].getGeometry().getCoordinates()}">${originalFeatures[i].get('cctvname')}</span> : <a href="#" onclick="stremVideo('${originalFeatures[i].get('cctvurl').toString()}', '${originalFeatures[i].get('cctvname').toString()}');">CCTV 보기</a><br>`;
            if(i == 4 && originalFeatures.length > 5){
                contentHTML += `외 ${originalFeatures.length - i - 1} 곳`
                break;
            }
        }
    } else {
        contentHTML += `CCTV 이름 : ${originalFeatures[0].get('cctvname')}<br>
            영상 : <a href="#" onclick="stremVideo('${originalFeatures[0].get('cctvurl').toString()}', '${originalFeatures[0].get('cctvname').toString()}');">CCTV 보기</a>`;
    }
    contentHTML += `</code></div>`;

    overlayElement.innerHTML = contentHTML;
    var overlay = new ol.Overlay({
        element: overlayElement,
        position: e.element.getGeometry().getCoordinates()
    });
    // Add the overlay to the map
    map.addOverlay(overlay);
    clickCurrentOverlay = overlay;

    var deleteButton = overlayElement.querySelector(".ol-popup-closer");
    deleteButton.addEventListener("click", function () {
        if(selectCluster){
            selectCluster.clear()
        }
        map.removeOverlay(clickCurrentOverlay);
    });
});

map.addInteraction(selectCluster);


//지도 클릭 이벤트
map.on("click", function (evt) {
    let cctvFound = false;
    if(draw || drawPolygon || circle){
        return;
    }
    if(printControl.isOpen()){
        return;
    }
    if (clickCurrentLayer) {
        map.removeLayer(clickCurrentLayer);
    }

    if (clickCurrentOverlay) {
        map.removeOverlay(clickCurrentOverlay);
    }

    if (!ol.events.condition.shiftKeyOnly(evt)) {
        extentInteraction.setExtent(undefined);
        map.removeOverlay(extentInteractionTooltip)
    }

    map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
        // 'cctvFeature'를 CCTV 피처를 구별하는 데 사용하는 속성이라고 가정합니다.
        if (feature.get('features')) {
            // It's a cluster, so check the original features within.
            var originalFeatures = feature.get('features');
            for (var i = 0; i < originalFeatures.length; i++) {
                if (originalFeatures[i].get('cctvFeature')) {
                    cctvFound == false ? cctvFound = true : cctvFound = true
                    //console.log(originalFeatures[i]);
                }
            }
        }
    });

    if (cctvFound) {
        evt.stopPropagation();
        return;
    }

    var url = 'https://api.vworld.kr/req/data?';
    url += 'service=data';
    url += '&request=GetFeature';
    url += '&data=LP_PA_CBND_BUBUN';
    url += `&key=${VWORLD_API_KEY}`; // Replace with your actual API key
    url += '&format=json';
    url += "&crs=EPSG:3857";
    url += '&geomFilter=POINT(' + evt.coordinate[0] + ' ' + evt.coordinate[1] + ')';
    url +=  "&domain=http://127.0.0.1:3000/openlayers_test.html"

    $.ajax({
        url: url,
        type: 'GET',
        dataType: "jsonp",
        async : false,
        jsonpCallback: 'callback',
        success: function(data) {
            console.log(data)
            if(data.response.status != "OK"){
                return;
            }
            var geoInfoObject = data.response.result.featureCollection.features[0];
            var geojsonObject = geoInfoObject.geometry;
             
            var vectorSource = new ol.source.Vector({
                features: (new ol.format.GeoJSON()).readFeatures(geojsonObject)
            });
            vectorSource.set("ctp_kor_nm",data.response.result.featureCollection.features[0].properties.ctp_kor_nm); 
            vectorSource.set("ctp_eng_nm",data.response.result.featureCollection.features[0].properties.ctp_eng_nm); 
            //layer.getSource().getKeys()로 확인

            var vectorStyle = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(135,206,250, 0.5)', // Skyblue color fill with opacity
                }),
                stroke: new ol.style.Stroke({
                    color: 'orange', // Orange stroke color
                    width: 2
                }),
            });
             
            var vector_layer = new ol.layer.Vector({
              source: vectorSource,
              style: vectorStyle
            })
            vector_layer.set("ctp_kor_nm_layer",data.response.result.featureCollection.features[0].properties.ctp_kor_nm+"_layer");
            //layer.getKeys() 로 확인
             
            map.addLayer(vector_layer);
            clickCurrentLayer = vector_layer

            var selectedValue = $(".coordinate-system-selector").val();
            var coord = ol.proj.transform(evt.coordinate, "EPSG:3857", selectedValue)
            
            console.log(coord)

            var overlayElement = document.createElement('div');
            overlayElement.className = "ol-popup";
            overlayElement.innerHTML += `<a href="#" id="popup-closer" class="ol-popup-closer"></a>`
            overlayElement.innerHTML += `<div id="popup-content">
                                            <div class="ol-popup-title">연속 지적도 정보</div>
                                                <code class="code">
                                                    <div class="popup-coordinate">${coord}</div><span>주소</span><br>
                                                    <div class="leftBottom__etcBtn">
                                                        <ul>
                                                            <li class="select customSelect">
                                                                <p onclick="searchLocalAddress(this)">${geoInfoObject.properties.addr}</p>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </code>
                                                <br>
                                                <div style="float: left;">공시지가 : ${geoInfoObject.properties.jiga != "" ? geoInfoObject.properties.jiga.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : "--"}&#8361;, 지목 : ${geoInfoObject.properties.jibun.slice(-1)}</div>
                                            </div>`
            var overlay = new ol.Overlay({
                element: overlayElement,
                position: evt.coordinate
            });
            // Add the overlay to the map
            map.addOverlay(overlay);
            clickCurrentOverlay = overlay;

            var deleteButton = overlayElement.querySelector(".ol-popup-closer");
            deleteButton.addEventListener("click", function () {
                map.removeLayer(vector_layer);
                map.removeOverlay(clickCurrentOverlay);
            });
        },
        beforesend: function(){
             
        },
        error: function(xhr, stat, err) {}
      });
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

sourceLayer.setZIndex(5)
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

polygonLayer.setZIndex(5)
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

circleLayer.setZIndex(5)
map.addLayer(circleLayer);

//건물 레이어 변수
var buildingLayer;
//시도 경계 레이어 변수
var sidoLayer;
//시/군/구 경계 레이어 변수
var sigunguLayer;
//읍/면/동 경계 레이어 변수
var myeondongLayer;
//리 경계 레이어 변수
var riLayer;
//리 경계 레이어 변수
var riLayer;
//도로 레이어 변수
var roadLayer;
//연속 지적도 레이어 변수
var cadastralMapLayer;
//산불위험 예측지도 레이어 변수
var mountaionFireMapLayer;
//소방서 관할구역 레이어 변수
var firestationJurisdictionLayer
//재해 위험지구 레이어 변수
var disasterDangerLayer;
//재해 위험지구 레이어 변수
var graticuleLayer;
//api 파싱하기위한 geoJson
var geojsonFormat = new ol.format.GeoJSON();
//레이더 레이어 변수
var webGlVectorLayer;

//지도의 이동이 종료되었을 때 발생하는 이벤트 지도 중앙좌표와 줌 레벨을 표시한다.
var currZoom = map.getView().getZoom();
map.on("moveend", function (evt) {
    var view = map.getView();
    const center = view.getCenter();
    var coordinate = ol.proj.transform(center , "EPSG:3857", "EPSG:4326");
    reverseGeoCodingToRegion(coordinate[0], coordinate[1])
    var newZoom = map.getView().getZoom();
    if (currZoom != newZoom) {
        //console.log("zoom end, new zoom: " + newZoom);
        currZoom = newZoom;
        zoomInfo.innerHTML = `level: ${newZoom}`;
    }
});

function formatCoordinate(coordinate, beforCoordinateSystem, targetCoordinateSystem) {
    let changedCoordinate = ol.proj.transform(coordinate, beforCoordinateSystem, targetCoordinateSystem)
    return `${changedCoordinate[0].toFixed(5)}, ${changedCoordinate[1].toFixed(5)}`;
}

var drawPolygon;
var areaTooltipElement;
var areaTooltip;

var routeTooltipElement;
var routeTooltip;

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
    
            //console.log(sketch.getGeometry().getCoordinates())
            //searchRouteSummury(sketch.getGeometry().getCoordinates())
    
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

function createRouteTooltip() {
    routeTooltipElement = document.createElement("div");
    routeTooltipElement.className = "tooltip tooltip-static";
    routeTooltipElement.style.zIndex = 1;
    routeTooltip = new ol.Overlay({
        element: routeTooltipElement,
        offset: [-15, 0],
        positioning: "top-left",
    });
    routeTooltip.set("type", "route")
    map.addOverlay(routeTooltip);
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
        //console.log(geom);
        var coordinateLength = geom.sketchCoords_.length;
        //console.log(sketch.getGeometry())
        if (coordinateLength < 2) {
            setTimeout(function () {
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
    //console.log($(".measure"));
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
            //console.log(draw);
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

        if($("#popup-content").length){
            map.removeLayer(clickCurrentLayer);
            map.removeOverlay(clickCurrentOverlay);
        }

        if(contextmenu.isOpen()){
            contextmenu.closeMenu()
        }
    }
});

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
        //console.log("change");
        //console.log(color.toRgbString());
    },
    show: function (color) {
        //console.log("show");
    },
    move: function (color) {
        //console.log("move");
    },
});

function searchRouteSummury(startFeature, endFeature, routeFlag) {

    //let osrmUrl = `https://router.project-osrm.org/route/v1/driving/`;
    let osrmCarUrl = `http://192.168.10.99:6001/route/v1/driving/`;
    let osrmFootUrl = `http://192.168.10.99:6002/route/v1/driving/`;
    let osrBikemUrl = `http://192.168.10.99:6003/route/v1/driving/`;
    var startCoordinate = ol.proj.transform(startFeature.getGeometry().getCoordinates(), "EPSG:3857", "EPSG:4326")
    var endCoordinate = ol.proj.transform(endFeature.getGeometry().getCoordinates(), "EPSG:3857", "EPSG:4326")
    // console.log(coord4326)
    // console.log(index, routeCoordinates.length)
    osrmCarUrl += `${startCoordinate};${endCoordinate}`
    osrmFootUrl += `${startCoordinate};${endCoordinate}`
    osrBikemUrl += `${startCoordinate};${endCoordinate}`

    osrmCarUrl += `?overview=full&geometries=geojson&steps=true`
    osrmFootUrl += `?overview=full&geometries=geojson&steps=true`
    osrBikemUrl += `?overview=full&geometries=geojson&steps=true`

    let requestUrl = "";
    let routeKind = "";
    if(routeFlag == 1){
        requestUrl = osrmCarUrl
        routeKind = "차량"
    }else if(routeFlag == 2){
        requestUrl = osrmFootUrl
        routeKind = "도보"
    }else{
        requestUrl = osrBikemUrl
        routeKind = "자전거"
    }

    // let carRouteAjax = $.ajax({ url: osrmCarUrl, dataType: 'json', method: 'GET' });
    // let footRouteAjax = $.ajax({ url: osrmFootUrl, dataType: 'json', method: 'GET' });
    // let bikeRouteAjax = $.ajax({ url: osrBikemUrl, dataType: 'json', method: 'GET' });

    // $.when(carRouteAjax, footRouteAjax, bikeRouteUrl).done(function(response1, response2, response3){
    //     console.log(response1, resAjaxse2, response3)
    //     // 모든 AJAX 호출이 완료된 후에 여기가 실행됩니다.
    //     // response1, response2, response3은 각각의 AJAX 응답입니다.
    // }).fail(function(error){
    //     console.log(error)
    //     // 하나라도 AJAX 호출에 실패하면 여기가 실행됩니다.
    //     // error에는 실패한 AJAX 호출의 에러 정보가 들어있습니다.
    // });
    $.ajax(
        requestUrl
    ).done(function (data) {
        //console.log(data)
        let instructions = data.routes[0].legs[0].steps
            .map(step => `<a data-coordinate="${ol.proj.transform(step.maneuver.location, "EPSG:4326", "EPSG:3857")}" href="#">${step.maneuver.type == "depart" ? "시작점" : step.maneuver.type == "arrive" ? "도착점" : ""}${step.maneuver.modifier} ${step.name} ${step.distance}m</a>`) // instruction 추출
            .join('<br>');
        let instructionsElement = document.getElementById('sidenav');
        instructionsElement.innerHTML = ""
        instructionsElement.innerHTML = `<h4>${startFeature.get("address")} -><br> ${endFeature.get("address")}</h4>`
        instructionsElement.innerHTML += `<h5>${convertMetersToKilometersAndMeters(data.routes[0].distance)}, ${convertSecondsToHoursAndMinutes(data.routes[0].duration)}</h5>`;
        instructionsElement.innerHTML += instructions;
        let coordinates = data.routes[0].geometry.coordinates.map(c => ol.proj.transform(c, 'EPSG:4326', 'EPSG:3857'));

        createRouteTooltip()
        
        let text = `<div class="tooltip-content">
        <div class="tooltip-case">${routeKind} : <span class="tooltip-info-text-line">${convertMetersToKilometersAndMeters(data.routes[0].distance)}</span></div>
        <div class="tooltip-case">예상 소요시간 : <span class="tooltip-info-text-line">${convertSecondsToHoursAndMinutes(data.routes[0].duration)}</span></div>
        <button id="show-route-btn" class="delete-btn">지우기</button></div>
        </div>`;
        routeTooltipElement.innerHTML = text
        routeTooltip.setPosition(endFeature.getGeometry().getCoordinates());
        routeTooltipElement.parentElement.style.pointerEvents = "none";
        var deleteButton = routeTooltipElement.querySelector(".delete-btn");

        var lineStyle = [
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: '#E9E9E8', // 외곽선 색상 (회색)
                    width: 6 // 외곽선 두께
                })
            }),
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: '#969A96', // 내부선 색상 (검은색)
                    width: 4, // 내부선 두께
                    lineDash: [6, 10] // 검은색 점선
                })
            })
        ];
        
        // OSRM에서 반환한 실제 시작지점
        const osrmStart = ol.proj.transform(data.routes[0].legs[0].steps[0].geometry.coordinates[0], "EPSG:4326", "EPSG:3857");
        // OSRM에서 반환한 실제 종료지점
        const osrmEnd = ol.proj.transform(data.routes[0].legs[0].steps[data.routes[0].legs[0].steps.length-1].geometry.coordinates[0], "EPSG:4326", "EPSG:3857");
    
        // 사용자가 선택한 시작지점과 OSRM이 계산한 시작지점 사이에 선을 그림
        var startLineString = new ol.geom.LineString([osrmStart, startFeature.getGeometry().getCoordinates()]);
        var startLineFeature = new ol.Feature({
            geometry: startLineString,
            name: 'Start Line'
        });
        startLineFeature.setStyle(lineStyle)

        //console.log(osrmStart, startFeature.getGeometry().getCoordinates())
        
        // 사용자가 선택한 종료지점과 OSRM이 계산한 종료지점 사이에 선을 그림
        var endLineString = new ol.geom.LineString([osrmEnd, endFeature.getGeometry().getCoordinates()]);
        var endLineFeature = new ol.Feature({
            geometry: endLineString,
            name: 'End Line'
        });
        endLineFeature.setStyle(lineStyle)

        let route = new ol.geom.LineString(coordinates);

        let routeFeature = new ol.Feature({
            geometry: route,
            name: 'Route'
        });
            
            let routeSource = new ol.source.Vector({
            features: [routeFeature]
        });

        routeSource.addFeature(startLineFeature);
        routeSource.addFeature(endLineFeature);
            
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
                ],
                type: 'routeLayer'
            });
                
            map.addLayer(routeLayer);
            var overlayToRemove = routeTooltip;
            deleteButton.addEventListener("click", function () {
                map.removeLayer(routeLayer);
                map.removeOverlay(overlayToRemove);
                var source = vectorLayer.getSource();
                var features = source.getFeatures();
                for (var i = 0; i < features.length; i++) {
                    var feature = features[i];
                    if(feature && feature.get('attribute') == "start"){
                        source.removeFeature(feature);
                    }
                    if(feature && feature.get('attribute') == "end"){
                        source.removeFeature(feature);
                    }
                }
                instructionsElement.innerHTML = ""
            })

            let routeExtent = route.getExtent();

            map.getView().fit(routeExtent, {
                size: map.getSize(),
                padding: [200, 200, 200, 200],  // 상, 우, 하, 좌 방향으로의 패딩
            });

            var element = document.getElementById("offcanvasScrolling");
            if (!element.classList.contains("show")) {
                document.getElementById("route-result-toggle-button").click()
            } else {
                
            }
    }).always(function(){
        routeTooltipElement = null;
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
    if(map.getView().getZoom() >= MAX_ZOOM_LEVEL){
        return alert("줌 인 불가능")
    }
    map.getView().animate({
        zoom: map.getView().getZoom() + 1,
        center: obj.coordinate,
        duration: 500,
    });
}

//ol-context callback 함수 줌 레벨을 한단계 축소한다
function zoomOut(obj, map) {
    if(map.getView().getZoom() <= MIN_ZOOM_LEVEL){
        return alert("줌 아웃 불가능")
    }
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
    if(printControl.isOpen()){
        $(document).on('contextmenu', function (e) {
            e.preventDefault();
        });
        contextmenu.disable();
        return;
    }
    if ($(areaCheckbox).is(":checked") ||$(measureCheckbox).is(":checked") ||$(areaCircleCheckbox).is(":checked")){
        contextmenu.disable();
        if (draw) {
            //console.log(draw);
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
        var selectedValue = $(".coordinate-system-selector").val();
        let coord4326 = ol.proj.transform(evt.coordinate, "EPSG:3857", "EPSG:4326");
        let coordinate = ol.proj.transform(evt.coordinate, "EPSG:3857", selectedValue);
        //console.log(coordinate);
        let address = reverseGeoCoding(coord4326[0], coord4326[1])
        contextmenu.clear();
        contextmenuItems[3].data = { address : address}
        contextmenu.extend(contextmenuItems);
        document.querySelector('.ol-coordinate').innerText = `${coordinate[0]},\n${coordinate[1]}\n${address}`;
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
    var selectedValue = $(".coordinate-system-selector").val();
    info.innerHTML = formatCoordinate(center, "EPSG:3857", selectedValue);
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
    //console.log(obj)
}

//특정 영역의 이미지 캡쳐를 위한 함수
function imageCapture() {
    saveExtentAsImage()
}

//특정 영역만큼으로 줌을 당기는 함수
function zoomExntent(obj) {
    //view.setConstrainResolution(false)
    //console.log(obj.data.extent)
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
    if(obj.data.marker.get('attribute') == "start" || obj.data.marker.get('attribute') == "end"){
        map.getOverlays().getArray().slice(0).forEach(function(overlay) {
            if (overlay.get('type') === 'route') {
                map.removeOverlay(overlay) ;
            }
        });
        map.getLayers().getArray().slice().forEach(function(layer) {
            if (layer.get('type') === 'routeLayer') {
                map.removeLayer(layer);
            }
        });
    }
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
    map.getOverlays().getArray().slice(0).forEach(function(overlay) {
        if (overlay.get('type') === 'route') {
            map.removeOverlay(overlay) ;
        }
    });
    map.getLayers().getArray().slice().forEach(function(layer) {
        if (layer.get('type') === 'routeLayer') {
            map.removeLayer(layer);
        }
    });
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
            attribute : "start",
            address : address
        });

    feature.setStyle(iconStyle);
    vectorLayer.getSource().addFeature(feature);

    var endFeature = features.find(feature => feature.get('attribute') === 'end');
    if (endFeature) {
        var endCoordinates = endFeature.getGeometry().getCoordinates();
        // console.log("시작지점 지점 좌표",obj.coordinate)
        // console.log("끝 지점 좌표",endCoordinates);
        // console.log(obj.coordinate.concat(endCoordinates))

        var selectElement = document.querySelector('.form-select-sm');
        var selectedOption = selectElement.value;
        searchRouteSummury(feature, endFeature, selectedOption)
        
        // console.log('Current selected option:', selectedOption);
        // console.log("시작 마커를 찍었고 끝지점의 마커도 존재한다")
    }
}

function endMarker(obj) {
    map.getOverlays().getArray().slice(0).forEach(function(overlay) {
        //console.log("@")
        if (overlay.get('type') === 'route') {
            map.removeOverlay(overlay) ;
        }
    });
    map.getLayers().getArray().slice().forEach(function(layer) {
        if (layer.get('type') === 'routeLayer') {
            map.removeLayer(layer);
        }
    });
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
            attribute : "end",
            address : address
        });

    feature.setStyle(iconStyle);
    vectorLayer.getSource().addFeature(feature);
    var startFeature = features.find(feature => feature.get('attribute') === 'start');
    if (startFeature) {

        var selectElement = document.querySelector('.form-select-sm');
        var selectedOption = selectElement.value;

        searchRouteSummury(startFeature, feature, selectedOption)

        // console.log('Current selected option:', selectedOption);
        // console.log("끝 마커를 찍었고 시작 지점의 마커도 존재한다")
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
// document.getElementById("refresh").addEventListener("click", function () {
//     $("#refresh").load(window.location.href + " #refresh");
// });

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
    map.getLayers().getArray().slice().forEach(function(layer) {
        if (layer.get('type') === 'routeLayer') {
            map.removeLayer(layer);
        }
    });
    vectorLayer.getSource().getFeatures().forEach(function(feature) {
        if (feature.get('attribute') == "start" || feature.get('attribute') == "end") {
            vectorLayer.getSource().removeFeature(feature);
        }
    });
    let instructionsElement = document.getElementById('sidenav');
    instructionsElement.innerHTML = ""
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
            //console.log(coordinate)
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
// function searchAddress(address){
//     const REST_API_KEY = "a75f661f8fd50587142251f0476ef2da"
//     $.ajax({
//         type: "GET",
//         url: "https://dapi.kakao.com/v2/local/search/address.json",
//         data: {query : address},
//         beforeSend: function (xhr) {
//             xhr.setRequestHeader("Authorization",`KakaoAK ${REST_API_KEY}`);
//         },
//         success: function (res) {
//             //console.log(res);
//             //console.log(ol.proj.transform([res.documents[0].x, res.documents[0].y], "EPSG:4326", "EPSG:3857"));
//             const corrdinate = ol.proj.transform([res.documents[0].address.x, res.documents[0].address.y], 'EPSG:4326', 'EPSG:3857');
//             map.getView().setCenter(corrdinate);
//         },
//         error: function(xhr, status, error){ 
// 			//alert(error); 
// 		}
//     });
// }

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
            //console.log(res);
            if(res.documents.length < 1){
                result = "주소를 찾을 수 없습니다."
            }else{
                result = res.documents[0].road_address != null ? res.documents[0].road_address.address_name : res.documents[0].address.address_name;
            }
        },
        error: function(xhr, status, error){ 
            //console.log(error, status)
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
            //console.log(res);
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
            $('#sample4_roadAddress').trigger('change');
            document.getElementById("sample4_jibunAddress").value = data.jibunAddress;
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
    let storagedName = document.getElementById("recipient-name").value;
    if(storagedName.length < 1){
        storagedName = document.getElementById("form-control-address").innerHTML
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
    
    window.localStorage.setItem(`bookmark-${storagedName}`, objString)
    const container = $("#bookmark-container")
    let text = `<span class="olControlBookmarkRemove" title="삭제"></span>
        <span class="olControlBookmarkLink" title="${storagedName}">${storagedName}</span><br>`
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
        if(!key.includes("bookmark")){
            continue
        }
        const value = JSON.parse(window.localStorage.getItem(key));

        let text = `<span class="olControlBookmarkRemove" title="삭제"></span>
        <span class="olControlBookmarkLink" title="${value.name}">${value.name}</span><br>`
        
        //console.log(value)
        //console.log(key + " : " + value + "<br />");
        container.append(text)
    }

    addControlTitle()

});

$('#bookmark-container').on('click', '.olControlBookmarkLink', function() {
    var index = $('.olControlBookmarkLink').index(this);
    var storageKey = $('.olControlBookmarkLink').eq(index).text();
    // console.log('Clicked link at index: ', index);
    // console.log(storageKey);

    const value = JSON.parse(window.localStorage.getItem(`bookmark-${storageKey}`));

    //console.log(value)

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
    
        window.localStorage.removeItem(`bookmark-${storageKey}`);
    }
});


$('ul.dropdown-menu a.dropdown-item').click(function(e) {
    e.preventDefault(); // This will prevent the default action of the a tag
    const clickedId = this.id;
    // Add active class to clicked a tag and remove from others
    $('ul.dropdown-menu a.dropdown-item').removeClass('active');
    $(this).addClass('active');

    map.getLayers().getArray().slice().forEach(function(layer) {
        if (layer.get('type') === 'map') {
            map.removeLayer(layer);
        }else if(layer.get('type') === 'submap'){
            layer.setZIndex(1)
        }else{
            layer.setZIndex(2)
        }
    });

    switch(clickedId) {
        case "baseMap":
            map.addLayer(baseLayer);
            break;
        case "compositeMap":
            map.addLayer(satelliteLayer)
            map.addLayer(textLayer);
            break;
        case "aerialMap":
            map.addLayer(satelliteLayer)
            break;
        case "bwMap":
            map.addLayer(greyLayer)
            break;
        case "nightMap":
            map.addLayer(midnightLayer)
            break;
        default:
            //console.log("Invalid map type");
    }
    map.renderSync()
});
document.querySelectorAll('input[name="map-layer"]').forEach((elem) => {
    elem.addEventListener("change", function(event) {
    var layerType = event.target.value; // 선택된 레이어 타입

    map.getLayers().getArray().slice().forEach(function(layer) {
        if (layer.get('type') === 'map') {
            map.removeLayer(layer);
        }else if(layer.get('type') === 'submap'){
            layer.setZIndex(1)
        }else{
            layer.setZIndex(2)
        }
    });
    
    switch (layerType) {
      case 'basic':
        map.addLayer(baseLayer);
        break;
      case 'hybrid':
        map.addLayer(satelliteLayer)
        map.addLayer(textLayer);
        break;
    case 'satellite':
        map.addLayer(satelliteLayer)
        break;
    case 'gray':
        map.addLayer(greyLayer)
        break;
    case 'night':
        map.addLayer(midnightLayer)
        break;
    }
    
    map.renderSync()
    });
  });

  $('#sample4_roadAddress').on('change', function() {
    // 이벤트 핸들러 코드를 여기에 작성
    if($(this).val() != ""){
        searchAddress($(this).val())
    }
    //console.log('Value changed to:', $(this).val());
});

// document.getElementById("nav-button").addEventListener("click", function (e) {
//     document.getElementById("sidenav").style.width = "250px";
//     let clickedElementClass = e.target.className; // e.target refers to the clicked element
//     //console.log(clickedElementClass == "sidenav-menu open");
//     if(clickedElementClass == "sidenav-menu open"){
//         e.target.className = "sidenav-menu close"
//         e.target.textContent = "X"
//         document.getElementById("sidenav").style.width = "250px";
//     }else if(clickedElementClass == "sidenav-menu close"){
//         e.target.className = "sidenav-menu open"
//         document.getElementById("sidenav").style.width = "0";
//         e.target.textContent = ">"
//     }
// })

document.querySelector('#sidenav').addEventListener('mouseover', function (event) {
    if(event.target.tagName === 'A') {
        var customValue = event.target.getAttribute('data-coordinate');

        const coordinates = customValue.split(',').map(Number);
        var x = parseFloat(coordinates[0]);
        var y = parseFloat(coordinates[1]);

        var pointFeature = new ol.Feature(new ol.geom.Point([x, y]));
    
        // 기존의 포인트를 지우고 새로운 포인트를 추가합니다.
        routeVectorSource.clear();
        routeVectorSource.addFeature(pointFeature);
    }
});

document.querySelector('#sidenav').addEventListener('mouseout', function (event) {
    if(event.target.tagName === 'A') {
        routeVectorSource.clear();
    }
});

document.querySelector('#sidenav').addEventListener('click', function (event) {
    if(event.target.tagName === 'A') {
        var customValue = event.target.getAttribute('data-coordinate');

        const coords = customValue.split(',').map(Number);
        map.getView().animate({
            zoom: map.getView().getZoom(),
            center: coords,
            duration: 500,
        });
    }
})

//초를 시간 + 분으로 만들어주는 함수
function convertSecondsToHoursAndMinutes(totalSeconds) {
    var hours = Math.floor(totalSeconds / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours === 0) {
        if (minutes < 1) {
            return "1분 미만";
        }
        return minutes + "분";
    } else {
        return hours + "시간 " + minutes + "분";
    }
}

//미터를 키로미터 + 미터로 만들어주는 함수
function convertMetersToKilometersAndMeters(totalMeters) {
    var kilometers = totalMeters / 1000;
    var meters = totalMeters % 1000;
    if (kilometers < 1) {
        return meters + "m";
    } else {
        return kilometers.toFixed(1) + "km";
    }
}

//경로탐색 셀렉트박스의 값이 변경될 때 발생하는 이벤트
document.querySelector('.form-select-sm').addEventListener('change', function(e) {
    var selectedOption = e.target.value;
    //console.log('Selected option:', selectedOption);

    var source = vectorLayer.getSource();
    var features = source.getFeatures();
    var startFeature = features.find(feature => feature.get('attribute') === 'start');
    var endFeature = features.find(feature => feature.get('attribute') === 'end');
    //console.log(startFeature, endFeature)
    if(startFeature && endFeature){
        map.getOverlays().getArray().slice(0).forEach(function(overlay) {
            if (overlay.get('type') === 'route') {
                map.removeOverlay(overlay) ;
            }
        });
        map.getLayers().getArray().slice().forEach(function(layer) {
            if (layer.get('type') === 'routeLayer') {
                map.removeLayer(layer);
            }
        });
        searchRouteSummury(startFeature, endFeature, selectedOption)
    }

    // 여기에서 원하는 작업을 수행하세요
});

var clusterLayer

// Handle checkbox change event
function cctvLayerChange(e) {
    if (e) {
        addCctvLayer(e)
    }else{
        removeCctvLayer()
    }
}

function addCctvLayer(e){
    var view = map.getView();

    // Get the size of the current map container
    var size = map.getSize();

    // Calculate the extent of the current view
    var extent = view.calculateExtent(size);
    
    //대한민국 전역을 Extent로 잡기 위해 좌표를 고정하였음
    const extent4326 = ol.proj.transformExtent([12135411.855562285, 3470787.4316931707, 15481519.205774158, 5197652.774711872], 'EPSG:3857', 'EPSG:4326')


        // var url = 'https://api.vworld.kr/req/data?'; // Replace with actual CCTV API URL
        // url += 'service=data';
        // url += '&version=2.0';
        // url += '&request=GetFeature';
        // url += `&key=${VWORLD_API_KEY}`; // Replace with your actual API key
        // url += '&format=json';
        // url += '&size=1000'; // Modify this as needed
        // url += '&page=1';
        // url += '&data=LT_P_UTISCCTV';
        // url += "&crs=EPSG:3857";
        // url += `&geomFilter=BOX(${extent[0]},${extent[1]},${extent[2]},${extent[3]})`;
        // url +=  "&domain=http://127.0.0.1:3000/openlayers_test.html"
        var url = `https://openapi.its.go.kr:9443/cctvInfo?`;
        url += `type=all`;
        url += `&cctvType=1`;
        url += `&minX=${extent4326[0]}`;
        url += `&maxX=${extent4326[2]}`;
        url += `&minY=${extent4326[1]}`;
        url += `&maxY=${extent4326[3]}`;
        url += `&getType=json`;
        url += `&apiKey=12a08608b49a43f0a4f4a6fb1d838d8b`
        // Add geomFilter if you want to limit CCTV data to a certain area

        $.ajax({
            url: url,
            type: 'GET',
            // dataType: "jsonp",
            // async : false,
            success: function(data) {
                //e.target.disabled = false;
                //console.log(data.response.datacount)
                if(data.response.datacount <= 0){
                    return;
                }
                var cctvSource = new ol.source.Vector({});

                for (var i = 0; i < data.response.data.length; i++) {
                    var feature = data.response.data[i];

                    var cctvFeature = new ol.Feature({
                        geometry: new ol.geom.Point(ol.proj.transform([feature.coordx, feature.coordy], 'EPSG:4326', 'EPSG:3857')),
                        cctvname : feature.cctvname,
                        cctvformat : feature.cctvformat,
                        cctvurl : feature.cctvurl,
                        cctvFeature : true
                    });

                    cctvSource.addFeature(cctvFeature);
                }

                var clusterSource = new ol.source.Cluster({
                    distance: 30,
                    source: cctvSource,
                });

                clusterLayer = new ol.layer.AnimatedCluster({    
                    name: 'Cluster',
                    source: clusterSource,
                    animationDuration: 400,
                    style: getStyle
                });

                clusterLayer.setZIndex(5)
                map.addLayer(clusterLayer);
            },
            error: function(xhr, stat, err) {
                //console.log('Error fetching CCTV data:', err);
                alert("CCTV api 호출에 실패하였습니다.")
                //e.target.checked = false;
                //e.target.disabled = false;
            }
        });
}

function removeCctvLayer(){
    if (clusterLayer) {
        map.removeLayer(clusterLayer);
        clusterLayer = null;
    }
}

function stremVideo(videoSrc, videoName){
    var modal = document.getElementById('videoModal');

    var modalTitle = document.getElementById('videoModalLabel');
    modalTitle.innerText = `${videoName} CCTV 영상`

    // 비디오 플레이어 요소 선택
    var videoPlayer = document.getElementById('video');

    // 비디오 소스 업데이트
    videoPlayer.src = videoSrc;

    // 모달 열기
    $(modal).modal('show');

    var player = videojs('video');
    
    // Update the source
    player.src({
        src: videoSrc,
        type: 'application/x-mpegURL'
    });

    // Play the video
    player.play();

    $(modal).on('hidden.bs.modal', function () {
        player.pause();
    });
}

$(document).on('mouseenter', 'span.cctv-name', function() {
    var customAttribute = $(this).data('coordinate-attribute');
    //console.log('Custom 속성 값:', customAttribute);
  });


//기상 레이더 레이어 체크박스 이벤트
function radarLayerChange(e) {
    if (e) {
        //e.target.disabled = true;
        var url = 'http://apis.data.go.kr/1360000/RadarObsInfoService/getNationalRadarRn';
    
        // 파라미터 설정
        var serviceKey = "myYHhhNxJO5zGLT39cjBldHCap4TWme/JU4ubw5WcPfX0CX5CIFLuEA6N0zH115SujHcKBLUbGsxo/Nn8jIVDw==";
        var pageNo = 1;
        var numOfRows = 10;
        var dataType = 'json';
        var qcType = 'NQC'; // 실제 값을 지정하세요
        var compType = 'M'; // 실제 값을 지정하세요
        var dateTime = getTwentyMinutesBefore(); // 실제 값을 지정하세요

        if(webGlVectorLayer){
            map.removeLayer(webGlVectorLayer)
        }
        // AJAX 호출
        $.ajax({
            url: url,
            method: 'GET',
            data: {
                ServiceKey: serviceKey,
                pageNo: pageNo,
                numOfRows: numOfRows,
                dataType: dataType,
                qcType: qcType,
                compType: compType,
                dateTime: dateTime
            },
            success: function(data) {
                // API 응답 데이터 처리
                //console.log(data);
                if(data.response.header == undefined){
                    e.target.checked = false;
                    e.target.disabled = false;
                    return alert("api 호출 에러")
                }
                if(data.response.header.resultCode != "00"){
                    e.target.checked = false;
                    e.target.disabled = false;
                    return alert("api 호출 에러")
                }
                //$("#legend").css("display", "block")
                var csvData = decodeCAPPIData(data.response.body.items.item[0].cappiCompressData)

                var startLon = data.response.body.items.item[0].lon;
                var startLat = data.response.body.items.item[0].lat;
                var gridKm = data.response.body.items.item[0].gridKm;

                var xdim = data.response.body.items.item[0].xdim;
                var ydim = data.response.body.items.item[0].ydim

                var altitude = data.response.body.items.item[0].altitudeKm

                var dataWithCoords = assignCoordinates(startLon, startLat, gridKm, csvData, xdim, ydim, altitude);

                var geojsonData = toGeoJSON(dataWithCoords);

                var geoJsonFeatures = geojsonFormat.readFeatures(geojsonData, {
                    dataProjection: 'EPSG:4326',
                    featureProjection: 'EPSG:3857'
                });

                var getJsonSource = new ol.source.Vector({
                    features: geoJsonFeatures
                });

                webGlVectorLayer = new ol.layer.WebGLPoints({
                    preload: Infinity,
                    source: getJsonSource,
                    style: webGlStyle,
                    blur: 2,
                });
                webGlVectorLayer.setZIndex(5)
                map.addLayer(webGlVectorLayer);
                //e.target.disabled = false;
            },
            error: function(error) {
                // 오류 처리
                //e.target.checked = false;
                //e.target.disabled = false;
                alert("레이더 api 호출에 실패하였습니다.")
                //console.log(error);
            }
        });
    }else{
        //$("#legend").css("display", "none")
        if(webGlVectorLayer){
            map.removeLayer(webGlVectorLayer)
        }
    }
}

//base64로 인코딩되고, 압축되어있는 csv 데이터를 디코딩하고 압축을 해제하는 함수 2차원 배열로 반환된다.
function decodeCAPPIData(cappiCompressData) {
    // BASE64 디코딩
    var decodedData = atob(cappiCompressData);
  
    // 압축 해제
    var compressedData = Uint8Array.from(decodedData, c => c.charCodeAt(0));
    var decompressedData = pako.inflate(compressedData, { to: 'string' });
  
    // CSV 데이터로 변환
    var csvData = decompressedData.split('\n').map(row => row.split(','));
  
    return csvData;
}

//API응답의 가중치에 따라 webGL 객체의 색을 변환하는 함수
var webGlStyle = {
    symbol: {
      symbolType: 'square',
      size: [
        'case',
        ['>', ['zoom'], 8], 0,
        ['interpolate', ['exponential', 2.5], ['zoom'], 6, 3, 9, 5]
      ],
      color: [
        'case',
        ['>=', ['get', 'value'], 110], '#333333',
        ['>=', ['get', 'value'], 90], '#000390',
        ['>=', ['get', 'value'], 80], '#4C4EB1',
        ['>=', ['get', 'value'], 70], '#B3B4DE',
        ['>=', ['get', 'value'], 60], '#9300E4',
        ['>=', ['get', 'value'], 50], '#B329FF',
        ['>=', ['get', 'value'], 40], '#C969FF',
        ['>=', ['get', 'value'], 30], '#E0A9FF',
        ['>=', ['get', 'value'], 25], '#B40000',
        ['>=', ['get', 'value'], 20], '#D20000',
        ['>=', ['get', 'value'], 15], '#FF3200',
        ['>=', ['get', 'value'], 10], '#FF6600',
        ['>=', ['get', 'value'], 9], '#CCAA00',
        ['>=', ['get', 'value'], 8], '#E0B900',
        ['>=', ['get', 'value'], 7], '#F9CD00',
        ['>=', ['get', 'value'], 6], '#FFDC1F',
        ['>=', ['get', 'value'], 5], '#FFE100',
        ['>=', ['get', 'value'], 4], '#005A00',
        ['>=', ['get', 'value'], 3], '#008C00',
        ['>=', ['get', 'value'], 2], '#00BE00',
        ['>=', ['get', 'value'], 1], '#00FF00',
        ['>=', ['get', 'value'], 0.5], '#0033F5',
        ['>=', ['get', 'value'], 0.1], '#009BF5',
        ['==', ['get', 'value'], 0], 'rgba(0,0,0,0)',
        'rgba(0,0,0,0)' // default color if no match
      ],
      opacity: 1,
    }
  };

//레이더 좌표를 4326 좌표계로 변환하는 함수. api 응답객체의 값을 이용해 2진 좌표계에 실제 좌표계를 대입한다.
function assignCoordinates(startLon, startLat, gridKm, csvData, xdim, ydim, altitude) {
    var dataWithCoords = [];
    for (var i = 0; i < ydim; i++) {
        var row = csvData[i];
        for (var j = 0; j < xdim; j++) {
            if(row[j] == -127 || row[j] == -128){
                continue;
            }
            //cappi 고도를 고려하여 피타고라스 정리를 이용해 거리를 재 계산한다.
            var realDistance = Math.sqrt(Math.pow(gridKm*j, 2) + Math.pow(altitude, 2));
            // 좌표 할당
            var point = turf.destination([startLon, startLat], realDistance, 90, {units: 'kilometers'});
            var lon = point.geometry.coordinates[0];
            // 좌표와 함께 데이터 저장
            dataWithCoords.push({
                lon: lon,
                lat: startLat,
                value: row[j]
            });
        }
        var realDistance = Math.sqrt(Math.pow(gridKm*i, 2) + Math.pow(altitude, 2));
        var point = turf.destination([startLon, startLat], gridKm, 0, {units: 'kilometers'});
        startLat = point.geometry.coordinates[1];
    }
    return dataWithCoords;
}

//4326 배열 데이터를 geoJson 형태로 변환하는 함수
function toGeoJSON(data) {
    var features = data.map(function(d) {
        return {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [d.lon, d.lat]
            },
            properties: {
                value: d.value
            }
        };
    });

    return {
        type: 'FeatureCollection',
        features: features
    };
}


//건물 레이어 체크박스 이벤트
function buildLayerChange(e) {
    if (e) {
        if(buildingLayer){
            map.removeLayer(buildingLayer)
            buildingLayer = null;
        }
        buildingLayer = requestWmsLayer(BUILDING_LAYER_ID)
    }else{
        if(buildingLayer){
            map.removeLayer(buildingLayer)
            buildingLayer = null;
        }
    }
}

//시도 경계 레이어 체크박스 이벤트
function sidoLayerChange(e) {
    if (e) {
        if(sidoLayer){
            map.removeLayer(sidoLayer)
            sidoLayer = null;
        }
        sidoLayer = requestWmsLayer(SIDO_LAYER_ID)
    }else{
        if(sidoLayer){
            map.removeLayer(sidoLayer)
            sidoLayer = null;
        }
    }
}

//시 군 구 경계 레이어 체크박스 이벤트
function sigunLayerChange(e) {
    if (e) {
        if(sigunguLayer){
            map.removeLayer(sigunguLayer)
            sigunguLayer = null;
        }
        sigunguLayer = requestWmsLayer(SIGUNGU_LAYER_ID)
    }else{
        if(sigunguLayer){
            map.removeLayer(sigunguLayer)
            sigunguLayer = null;
        }
    }
}

//읍 면 동 경계 레이어 체크박스 이벤트
function dongLayerChange(e) {
    if (e) {
        if(myeondongLayer){
            map.removeLayer(myeondongLayer)
            myeondongLayer = null;
        }
        myeondongLayer = requestWmsLayer(MYEONDONG_LAYER_ID)
    }else{
        if(myeondongLayer){
            map.removeLayer(myeondongLayer)
            myeondongLayer = null;
        }
    }
}

//리 경계 레이어 체크박스 이벤트
function riLayerChange(e) {
    if (e) {
        if(riLayer){
            map.removeLayer(riLayer)
            riLayer = null;
        }
        riLayer = requestWmsLayer(RI_LAYER_ID)
    }else{
        if(riLayer){
            map.removeLayer(riLayer)
            riLayer = null;
        }
    }
}

//전국 도로 레이어 체크박스 이벤트
function roadLayerChange(e) {
    if (e) {
        if(roadLayer){
            map.removeLayer(roadLayer)
            roadLayer = null;
        }
        roadLayer = requestWmsLayer(ROAD_LAYER_ID)
    }else{
        if(roadLayer){
            map.removeLayer(roadLayer)
            roadLayer = null;
        }
    }
}

//연속지적도 레이어 체크박스 이벤트
function cadastralLayerChange(e) {
    if (e) {
        if(cadastralMapLayer){
            map.removeLayer(cadastralMapLayer)
            cadastralMapLayer = null;
        }
        cadastralMapLayer = requestWmsLayer(CADASTRAL_MAP_LAYER_ID)
    }else{
        if(cadastralMapLayer){
            map.removeLayer(cadastralMapLayer)
            cadastralMapLayer = null;
        }
    }
}

// document.getElementById('mountaion-fire-map-checkbox').addEventListener('change', function() {
//     if (this.checked) {
//         if(mountaionFireMapLayer){
//             map.removeLayer(mountaionFireMapLayer)
//             mountaionFireMapLayer = null;
//         }
//         mountaionFireMapLayer = requestWmsLayer(MOUNTAIN_FIRE_MAP_LAYER_ID)
//     }else{
//         if(mountaionFireMapLayer){
//             map.removeLayer(mountaionFireMapLayer)
//             mountaionFireMapLayer = null;
//         }
//     }
// })

// document.getElementById('firestation-jurisdiction-checkbox').addEventListener('change', function() {
//     if (this.checked) {
//         if(firestationJurisdictionLayer){
//             map.removeLayer(firestationJurisdictionLayer)
//             firestationJurisdictionLayer = null;
//         }
//         firestationJurisdictionLayer = requestWmsLayer(FIRESTATION_JURISDICTION)
//     }else{
//         if(firestationJurisdictionLayer){
//             map.removeLayer(firestationJurisdictionLayer)
//             firestationJurisdictionLayer = null;
//         }
//     }
// })

// document.getElementById('disaster-danger-checkbox').addEventListener('change', function() {
//     if (this.checked) {
//         if(disasterDangerLayer){
//             map.removeLayer(disasterDangerLayer)
//             disasterDangerLayer = null;
//         }
//         disasterDangerLayer = requestWmsLayer(DISASTER_DANGER_LAYER_ID)
//     }else{
//         if(disasterDangerLayer){
//             map.removeLayer(disasterDangerLayer)
//             disasterDangerLayer = null;
//         }
//     }
// })

document.getElementById('map-graticule-checkbox').addEventListener('change', function() {
    if (this.checked) {
        if(graticuleLayer){
            map.removeLayer(graticuleLayer)
            graticuleLayer = null;
        }
        graticuleLayer = new ol.layer.Graticule({
            strokeStyle: new ol.style.Stroke({
                color: 'rgba(255,120,0,0.9)',
                width: 2,
                lineDash: [0.5, 4],
              }),
              showLabels: true,
              wrapX: false,
        })
        graticuleLayer.setZIndex(5)
        map.addLayer(graticuleLayer)
    }else{
        if(graticuleLayer){
            map.removeLayer(graticuleLayer)
            graticuleLayer = null;
        }
    }
})

//vworld wms api 호출 공통 함수
function requestWmsLayer(layerId, layerIndex = 5){
    //console.log(document.getElementById('map').offsetWidth, document.getElementById('map').offsetHeight)
    let layer = new ol.layer.Image({
        name: layerId, //vmap 올린 레이어를 삭제하거나 수정,변경할때 접근할 name 속성
        projection: "EPSG:3857",
        extent: map.getView().getProjection().getExtent(), //[-20037508.34, -20037508.34, 20037508.34, 20037508.34]
        source: new ol.source.ImageWMS({
            ratio: 1,
            url: "http://api.vworld.kr/req/wms?",
            params: {
                LAYERS: layerId,
                STYLES: layerId,
                REQUEST : "getMap",
                EXCEPTIONS : "text/xml",
                TRANSPARENT : true,
                CRS: "EPSG:3857",
                apikey: VWORLD_API_KEY,
                DOMAIN:"http://127.0.0.1:3000/openlayers_test.html",
                FORMAT: "image/png",
            },
        })
    });
    layer.setZIndex(layerIndex);
    map.addLayer(layer);

    return layer;
}

//현재시간에서 20분 전 시간을 얻어오는 함수. 레이더 API가 바로 반영되지 않음
function getTwentyMinutesBefore() {
    var now = new Date();
    var twentyMinutesAgo = new Date(now.getTime() - 20 * 60000); // 20분(1분 = 60000밀리초) 이전의 시간 계산
  
    var year = twentyMinutesAgo.getFullYear();
    var month = String(twentyMinutesAgo.getMonth() + 1).padStart(2, '0');
    var day = String(twentyMinutesAgo.getDate()).padStart(2, '0');
    var hours = String(twentyMinutesAgo.getHours()).padStart(2, '0');
    var minutes = String(Math.floor(twentyMinutesAgo.getMinutes() / 10) * 10).padStart(2, '0');
  
    var twentyMinutesBefore = year + month + day + hours + minutes;
    return twentyMinutesBefore;
  }
  
  //오버뷰 맵이 클릭되었을 때 발생하는 이벤트
  $(".ol-overviewmap button").click(function() {
    setTimeout(function() {
        var isCollapsed = overviewMapControl.getCollapsed();
        localStorage.setItem("overviewMapCollapsed", isCollapsed);
    }, 0);
});

document.getElementById('mapLayerSelect').addEventListener('change', function() {
    const selectedLayer = this.value;
    if(swipeLayer){
        map.removeLayer(swipeLayer)
    }   
    switch (selectedLayer) {
      case 'default':
        swipeLayer = new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: `http://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/Base/{z}/{y}/{x}.png`,
                serverType: "geoserver",
                crossOrigin: "anonymous",
            }),
            preload: Infinity,
            type : "submap",
            zIndex : 0
        });
        $(swipe).css("display", "block")
        $(line).css("display", "block")
        break;
      case 'aerial':
        // 항공 사진 레이어 표시 로직
        swipeLayer = new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: `http://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/Satellite/{z}/{y}/{x}.jpeg`,
                crossOrigin: "anonymous",
            }),
            preload: Infinity,
            type : "submap",
            zIndex : 0
        });
        $(swipe).css("display", "block")
        $(line).css("display", "block")
        break;
      case 'gray':
        // 회색 지도 레이어 표시 로직
        swipeLayer = new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: `http://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/gray/{z}/{y}/{x}.png`,
                crossOrigin: "anonymous",
            }),
            preload: Infinity,
            type : "submap",
            zIndex : 0
        });
        $(swipe).css("display", "block")
        $(line).css("display", "block")
        break;
      case 'night':
        // 야간 지도 레이어 표시 로직
        swipeLayer = new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: `http://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/midnight/{z}/{y}/{x}.png`,
                crossOrigin: "anonymous",
            }),
            preload: Infinity,
            type : "submap",
            zIndex : 0
        });
        $(swipe).css("display", "block")
        $(line).css("display", "block")
        break;
      default:
        // 데이터 없음 선택 시 로직
        if(swipeLayer){
            map.removeLayer(swipeLayer)
        }   
        $(swipe).css("display", "none")
        $(line).css("display", "none")
        return;
    }
    map.addLayer(swipeLayer)
    swipeLayer.on('prerender', function (event) {
        const thumbWidth = 20;
        const ctx = event.context;
        const mapSize = map.getSize();
        const width = (mapSize[0] - thumbWidth) * (swipe.value / 100) + thumbWidth / 2;
        const tl = ol.render.getRenderPixel(event, [width, 0]);
        const tr = ol.render.getRenderPixel(event, [mapSize[0], 0]);
        const bl = ol.render.getRenderPixel(event, [width, mapSize[1]]);
        const br = ol.render.getRenderPixel(event, mapSize);
        
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(tl[0], tl[1]);
        ctx.lineTo(bl[0], bl[1]);
        ctx.lineTo(br[0], br[1]);
        ctx.lineTo(tr[0], tr[1]);
        ctx.closePath();
        ctx.clip();
    });
    swipeLayer.on('postrender', function (event) {
        const ctx = event.context;
        ctx.restore();
    });
});

swipe.addEventListener('input', function (e) {
    var rangeValue = e.target.value;
    var swipeWidth = e.target.offsetWidth;
    var thumbWidth = parseInt(getComputedStyle(e.target).getPropertyValue('--thumb-width'), 10) || 20; // thumb의 너비 가져오기
    var max = parseInt(e.target.getAttribute('max'), 10); // range 요소의 최댓값 가져오기
    var linePosition = (rangeValue / max) * (swipeWidth - thumbWidth); // range 값에 따라 div 위치 계산
    line.style.left = linePosition + (thumbWidth / 2) + 'px';
    map.render();
});

var printControl = new ol.control.PrintDialog({ 
    lang : "ko",
    scales : false,
    className : "ol-print"
});

printControl.setSize('A4');
map.addControl(printControl);

printControl.on("show", function(){
    extentInteraction.setActive(false)
    map.removeInteraction(dragBox);

    const storageObject = {
        zoomLevel : map.getView().getZoom(),
        centerCoordinate : map.getView().getCenter(),
        rotate : map.getView().getRotation(),
    }
    const objString = JSON.stringify(storageObject);
    
    window.localStorage.setItem("beforeState", objString)
})

printControl.on("hide", function(){
    extentInteraction.setActive(true)
    map.addInteraction(dragBox);
    contextmenu.enable();
    const value = JSON.parse(window.localStorage.getItem("beforeState"));
    map.getView().setCenter(value.centerCoordinate);
    map.getView().setZoom(value.zoomLevel)
    map.getView().setRotation(value.rotate);
    window.localStorage.removeItem("beforeState");
})
  
  /* On print > save image file */
printControl.on(['print', 'error'], function(e) {
    // Print success
    if (e.image) {
      if (e.pdf) {
        // Export pdf using the print info
        var pdf = new jspdf.jsPDF({
          orientation: e.print.orientation,
          unit: e.print.unit,
          format: e.print.size
        });
        pdf.addImage(e.image, 'JPEG', e.print.position[0], e.print.position[0], e.print.imageWidth, e.print.imageHeight);
        pdf.save(e.print.legend ? 'legend.pdf' : 'map.pdf');
      } else {
        // Save image as file
        e.canvas.toBlob(function(blob) {
          var name = (e.print.legend ? 'legend.' : 'map.')+e.imageType.replace('image/','');
          saveAs(blob, name);
        }, e.imageType, e.quality);
      }
    } else {
      console.warn('No canvas to export');
    }
  });

$('.coordinate-system-selector').change(function() {
    const prevValue = $(this).data('prevValue');
    const selectedValue = $(this).val();

    if(contextmenu.isOpen()){
        let li = $('.ol-coordinate');
        let htmlContent = li.html();
        let htmlLines = htmlContent.split("<br>");
        let address = htmlLines[2];
        let newCoordinates = ol.proj.transform([parseFloat(htmlLines[0]), parseFloat(htmlLines[1])], prevValue, selectedValue);
        htmlLines[0] = `${newCoordinates[0]},`;
        htmlLines[1] = newCoordinates[1];
        htmlLines[2] = address;
        li.html(htmlLines.join("<br>"));
    }

    if ($('.popup-coordinate').length) {
        let htmlLines = $('.popup-coordinate').text().split(",");
        let newCoordinates = ol.proj.transform([parseFloat(htmlLines[0]), parseFloat(htmlLines[1])], prevValue, selectedValue);
        $('.popup-coordinate').text(newCoordinates)
    }

    let coordinateValue = $("#coordinate").text().split(",")
    info.innerHTML = formatCoordinate([parseFloat(coordinateValue[0]), parseFloat(coordinateValue[1])], prevValue, selectedValue);

    $(this).data('prevValue', selectedValue);
    
}).data('prevValue', $('.coordinate-system-selector').val()); 


function layerOpacityChage(treeNode, opacity){
    if(treeNode.children){
        return;
    }
    var opacityInt = parseFloat(Number(opacity))
    switch(treeNode.id){
        case 31 :{
            if(webGlVectorLayer){
                webGlVectorLayer.setOpacity(opacityInt)
            }
            //radarLayerChange(treeNode.checked)
            break;
        }
        case 32 :{
            if(clusterLayer){
                clusterLayer.setOpacity(opacityInt)
            }
            //cctvLayerChange(treeNode.checked)
            break;
        }
        case 33 :{
            if(roadLayer){
                roadLayer.setOpacity(opacityInt)
            }
            //roadLayerChange(treeNode.checked)
            break;
        }
        case 34 :{
            if(buildingLayer){
                buildingLayer.setOpacity(opacityInt)
            }
            //buildLayerChange(treeNode.checked)
            break;
        }
        case 35 :{
            if(cadastralMapLayer){
                cadastralMapLayer.setOpacity(opacityInt)
            }
            //cadastralLayerChange(treeNode.checked)
            break;
        }
        case 41 :{
            if(sidoLayer){
                sidoLayer.setOpacity(opacityInt)
            }
            //sidoLayerChange(treeNode.checked)
            break;
        }
        case 42 :{
            if(sigunguLayer){
                sigunguLayer.setOpacity(opacityInt)
            }
            //sigunLayerChange(treeNode.checked)
            break;
        }
        case 43 :{
            if(myeondongLayer){
                myeondongLayer.setOpacity(opacityInt)
            }
            //dongLayerChange(treeNode.checked)
            break;
        }
        case 44 :{
            if(riLayer){
                riLayer.setOpacity(opacityInt)
            }
            //riLayerChange(treeNode.checked)
            break;
        }
    }
}

//vworld API를 이용해 장소를 검색하는 함수
function searchPlace(query, page = 1) {
    return $.ajax({
        url: "http://api.vworld.kr/req/search",
        dataType: "jsonp",
        data: {
            service: "search",
            request: "search",
            version: 2.0,
            crs: "EPSG:3857",
            size: 10,
            page: page,
            query: query,
            type: "place",
            format: "json",
            errorformat: "json",
            key: `${VWORLD_API_KEY}`
        }
    });
}


//vworld API를 이용해 주소를 검색하는 함수
function searchAddress(query, page = 1) {
    return $.ajax({
        url: "http://api.vworld.kr/req/search",
        dataType: "jsonp",
        data: {
            service: "search",
            request: "search",
            version: 2.0,
            crs: "EPSG:3857",
            size: 10,
            page: page,
            query: query,
            type: "address",
            category : "road",
            format: "json",
            errorformat: "json",
            key: `${VWORLD_API_KEY}`
        }
    });
}

//vworld API를 이용해 행정구역을 검색하는 함수
function searchDistrict(query, page = 1) {
    return $.ajax({
        url: "http://api.vworld.kr/req/search",
        dataType: "jsonp",
        data: {
            service: "search",
            request: "search",
            version: 2.0,
            crs: "EPSG:3857",
            size: 10,
            page: page,
            query: query,
            type: "district",
            category : "L4",
            format: "json",
            errorformat: "json",
            key: `${VWORLD_API_KEY}`
        }
    });
}

//vworld API를 이용해 도로명을 검색하는 함수
function searchRoad(query, page = 1) {
    return $.ajax({
        url: "http://api.vworld.kr/req/search",
        dataType: "jsonp",
        data: {
            service: "search",
            request: "search",
            version: 2.0,
            crs: "EPSG:3857",
            size: 10,
            page: page,
            query: query,
            type: "road",
            format: "json",
            errorformat: "json",
            key: `${VWORLD_API_KEY}`
        }
    });
}

function addPlace(elementId, response, searchQuery, pagenation = 3){
    $(`#${elementId}`).empty()
    let htmlContent = "";
    if(elementId.includes("all")){
        htmlContent += `
            <thead>
                <tr>
                    <td scope="col">장소</td>
                    <td scope="col" class="text-danger search-place-count">${parseInt(response.response.record.total).toLocaleString('ko-KR')}건</td>
                    <td>
                        <a href="#" class="link-secondary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover place-more-view">
                            <span>더보기</span>
                            <i class="bi bi-chevron-right"></i>
                        </a>
                    </td>
                </tr>
            </thead>
        `
    }
    if(response.response.result && response.response.result.items.length > 0){
        const maxLength = response.response.result.items.length > pagenation ? pagenation : response.response.result.items.length
        htmlContent += '<tbody>'
        for(var i = 0; i < maxLength; i ++){
            htmlContent += `
                <tr class="address-table-first-child"></tr>
                <tr>
                    <td scope="row" colspan="3" class="address-name">
                        <span>${addHighlight(response.response.result.items[i].title, searchQuery)}</span>
                    </td>
                </tr>
                <tr>
                    <td scope="row" colspan="3" class="address-category">
                        <span>${addHighlight(response.response.result.items[i].category, searchQuery)}</span>
                    </td>
                </tr>
                <tr style="cursor:pointer" onclick="clickAddress(event)">
                    <td scope="row" colspan="3" class="address-parcel">
                        <div class="badge bg-warning text-wrap" style="width: 3rem;">지번</div>
                        <span data-coord="${response.response.result.items[i].point.x}, ${response.response.result.items[i].point.y}">${addHighlight(response.response.result.items[i].address.parcel, searchQuery)}</span>
                    </td>
                </tr>
                <tr style="cursor:pointer" onclick="clickAddress(event)">
                    <td scope="row" colspan="3" class="address-road">
                        <div class="badge bg-primary text-wrap" style="width: 3rem;">도로명</div>
                        <span data-coord="${response.response.result.items[i].point.x}, ${response.response.result.items[i].point.y}">${addHighlight(response.response.result.items[i].address.road, searchQuery)}</span>
                    </td>
                </tr>`;
            htmlContent += `<tr class="address-table-last-child"></tr>`
        }
        htmlContent += '</tbody>'
    }
    $(`#${elementId}`).append(htmlContent)
}

function addAddress(elementId, response, searchQuery, pagenation = 3){
    $(`#${elementId}`).empty()
    let htmlContent = "";
    if(elementId.includes("all")){
        htmlContent += `
            <thead>
                <tr>
                    <td scope="col">주소</td>
                    <td scope="col" class="text-danger search-address-count">${parseInt(response.response.record.total).toLocaleString('ko-KR')}건</td>
                    <td>
                        <a href="#" class="link-secondary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover address-more-view">
                            <span>더보기</span>
                            <i class="bi bi-chevron-right"></i>
                        </a>
                    </td>
                </tr>
            </thead>
        `
    }
    if(response.response.result && response.response.result.items.length > 0){
        const maxLength = response.response.result.items.length > pagenation ? pagenation : response.response.result.items.length
        htmlContent += '<tbody>'
        for(var i = 0; i < maxLength; i ++){
            htmlContent += `
                <tr class="address-table-first-child"></tr>
                <tr style="cursor:pointer" onclick="clickAddress(event)">
                    <td scope="row" colspan="3" class="address-name">
                        <span data-coord="${response.response.result.items[i].point.x}, ${response.response.result.items[i].point.y}">(${response.response.result.items[i].address.zipcode}) ${addHighlight(response.response.result.items[i].address.road, searchQuery)}</span>
                    </td>
                </tr>
                <tr class="address-table-last-child-md"></tr>
            `
        }
        htmlContent += '</tbody>'
    }
    $(`#${elementId}`).append(htmlContent)
}

function addDistrict(elementId, response, searchQuery, pagenation = 3){
    $(`#${elementId}`).empty()
    let htmlContent = "";
    if(elementId.includes("all")){
        htmlContent += `
            <thead>
                <tr>
                    <td scope="col">행정구역</th>
                    <td scope="col" class="text-danger search-district-count">${parseInt(response.response.record.total).toLocaleString('ko-KR')}건</td>
                    <td>
                        <a href="#" class="link-secondary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover district-more-view">
                            <span>더보기</span>
                            <i class="bi bi-chevron-right"></i>
                        </a>
                    </td>
                </tr>
            </thead>
        `
    }
    if(response.response.result && response.response.result.items.length > 0){
        const maxLength = response.response.result.items.length > pagenation ? pagenation : response.response.result.items.length
        htmlContent += '<tbody>'
        for(var i = 0; i < maxLength; i ++){
            htmlContent += `
                <tr class="address-table-first-child"></tr>
                <tr onclick="clickGeoData(event, 'district')" style="cursor:pointer">
                    <td scope="row" colspan="3" class="address-name">
                        <span data-district-code="${response.response.result.items[i].id}" data-geo-url="${response.response.result.items[i].geometry}" data-coord="${response.response.result.items[i].point.x}, ${response.response.result.items[i].point.y}">(${response.response.result.items[i].id}) ${addHighlight(response.response.result.items[i].title, searchQuery)}</span>
                    </td>
                </tr>
                <tr class="address-table-last-child-md"></tr>
            `
        }
        htmlContent += '</tbody>'
    }
    $(`#${elementId}`).append(htmlContent)
}

function addRoad(elementId, response, searchQuery, pagenation = 3){
    $(`#${elementId}`).empty()
    let htmlContent = "";
    if(elementId.includes("all")){
        htmlContent += `
            <thead>
                <tr>
                    <td scope="col">도로명</th>
                    <td scope="col" class="text-danger search-road-count">${parseInt(response.response.record.total).toLocaleString('ko-KR')}건</th>
                    <td>
                        <a href="#" class="link-secondary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover road-more-view">
                            <span>더보기</span>
                            <i class="bi bi-chevron-right"></i>
                        </a>
                    </td>
                </tr>
            </thead>
        `
    }
    if(response.response.result && response.response.result.items.length > 0){
        const maxLength = response.response.result.items.length > pagenation ? pagenation : response.response.result.items.length
        htmlContent += '<tbody>'
        for(var i = 0; i < maxLength; i ++){
            htmlContent += `
                <tr class="address-table-first-child"></tr>
                <tr onclick="clickGeoData(event, 'road')" style="cursor:pointer">
                    <td scope="row" colspan="3" class="address-name">
                        <span title="${response.response.result.items[i].district}" data-geo-url="${response.response.result.items[i].geometry}">(${response.response.result.items[i].id}) ${addHighlight(response.response.result.items[i].title, searchQuery)}</span>
                    </td>
                </tr>
                <tr class="address-table-last-child-md"></tr>
            `
        }
        htmlContent += '</tbody>'
    }
    $(`#${elementId}`).append(htmlContent)
}

function clickAddress(event){
    const target = event.target;

    // 클릭한 요소가 <span>인지 확인합니다.
    if (target.tagName.toLowerCase() === 'span' || 'mark') {
        // data-coord 속성의 값을 가져옵니다.
        console.log($(target).text())
        const coords = target.tagName.toLowerCase() === 'mark' ? $(target).parent().data('coord') : target.getAttribute('data-coord');

        const coordinates = coords.split(", ")
        const coordinate = [parseFloat(coordinates[0]), parseFloat(coordinates[1])]
        map.getView().setCenter(coordinate);
        if(map.getView().getZoom() < 14){
            map.getView().setZoom(14)
        }

        if (clickCurrentLayer) {
            map.removeLayer(clickCurrentLayer);
        }

        if (clickCurrentOverlay) {
            map.removeOverlay(clickCurrentOverlay);
        }

        var url = 'https://api.vworld.kr/req/data?';
        url += 'service=data';
        url += '&request=GetFeature';
        url += '&data=LP_PA_CBND_BUBUN';
        url += `&key=${VWORLD_API_KEY}`; // Replace with your actual API key
        url += '&format=json';
        url += "&crs=EPSG:3857";
        url += '&geomFilter=POINT(' + coordinates[0] + ' ' + coordinates[1] + ')';
        url +=  "&domain=http://127.0.0.1:3000/openlayers_test.html"
    
        $.ajax({
            url: url,
            type: 'GET',
            dataType: "jsonp",
            async : false,
            jsonpCallback: 'callback',
            success: function(data) {
                //console.log(data)
                if(data.response.status != "OK"){
                    return;
                }
                var geoInfoObject = data.response.result.featureCollection.features[0];
                var geojsonObject = geoInfoObject.geometry;
                 
                var vectorSource = new ol.source.Vector({
                    features: (new ol.format.GeoJSON()).readFeatures(geojsonObject)
                });
                vectorSource.set("ctp_kor_nm",data.response.result.featureCollection.features[0].properties.ctp_kor_nm); 
                vectorSource.set("ctp_eng_nm",data.response.result.featureCollection.features[0].properties.ctp_eng_nm); 
                //layer.getSource().getKeys()로 확인
    
                var vectorStyle = new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(135,206,250, 0.5)', // Skyblue color fill with opacity
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'orange', // Orange stroke color
                        width: 2
                    }),
                });
                 
                var vector_layer = new ol.layer.Vector({
                  source: vectorSource,
                  style: vectorStyle
                })
                vector_layer.set("ctp_kor_nm_layer",data.response.result.featureCollection.features[0].properties.ctp_kor_nm+"_layer");
                //layer.getKeys() 로 확인
                 
                map.addLayer(vector_layer);
                clickCurrentLayer = vector_layer
    
                var selectedValue = $(".coordinate-system-selector").val();
                var coord = ol.proj.transform(coordinate, "EPSG:3857", selectedValue)
    
                var overlayElement = document.createElement('div');
                overlayElement.className = "ol-popup";
                overlayElement.innerHTML += `<a href="#" id="popup-closer" class="ol-popup-closer"></a>`
                overlayElement.innerHTML += `<div id="popup-content">
                                                <div class="ol-popup-title">정보</div>
                                                    <code class="code">
                                                        <div class="popup-coordinate">${coord}</div><span>주소</span><br>
                                                        <div class="leftBottom__etcBtn">
                                                            <ul>
                                                                <li class="select customSelect">
                                                                    <p onclick="searchLocalAddress(this)">${geoInfoObject.properties.addr}</p>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </code>
                                                    <br>
                                                    <div style="float: left;">공시지가 : ${geoInfoObject.properties.jiga != "" ? geoInfoObject.properties.jiga.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : "--"}&#8361;, 지목 : ${geoInfoObject.properties.jibun.slice(-1)}</div>
                                                </div>`
                var overlay = new ol.Overlay({
                    element: overlayElement,
                    position: coordinate
                });
                // Add the overlay to the map
                map.addOverlay(overlay);
                clickCurrentOverlay = overlay;
    
                var deleteButton = overlayElement.querySelector(".ol-popup-closer");
                deleteButton.addEventListener("click", function () {
                    map.removeLayer(vector_layer);
                    map.removeOverlay(clickCurrentOverlay);
                });
            },
            beforesend: function(){
                 
            },
            error: function(xhr, stat, err) {}
          });
    }
}

function clickGeoData(event, type){
    const target = event.target;

    // 클릭한 요소가 <span>인지 확인합니다.
    if (target.tagName.toLowerCase() === 'span' || 'mark') {

//         var format = new ol.format.WKT();
//         var feature5181 = format.readFeature("MULTIPOLYGON(((1107777.5945 1780522.2654,1107849.3517 1780256.7622,1108232.4563 1780033.8702,1108382.8717 1779974.9638,1108540.391 1779921.9983,1108722.1813 1779887.8993,1108798.5895 1779884.818,1109227.5084 1779819.8033,1109576.4159 1779760.0072,1110028.2352 1779602.742,1110068.7179 1779567.3681,1110097.4039 1779519.0238,1110189.4324 1779504.7103,1110526.3051 1779234.0037,1110573.7195 1779187.4256,1110659.5115 1779077.4544,1110732.9381 1778911.1059,1110898.7123 1778609.6045,1111031.922 1778560.7622,1111047.2583 1778545.3174,1111100.1549 1778492.045,1111209.8561 1778329.9151,1111225.8697 1778290.3849,1111246.102 1778240.4297,1111293.0519 1778070.2227,1111307.1948 1778057.1263,1111245.76 1777928.8221,1111157.8862 1777803.6529,1111153.1196 1777800.4682,1111147.773 1777796.8955,1111059.544 1777737.9339,1111043.1754 1777706.017,1111017.9914 1777656.8854,1110984.1032 1777449.0146,1110967.9216 1777210.289,1111084.2938 1777033.3263,1111131.9569 1776994.3552,1111147.5926 1776981.5709,1111171.134 1776962.3236,1111371.3798 1776866.1929,1111422.0293 1776816.5069,1111490.3129 1776749.5221,1111522.5799 1776649.1294,1111545.3786 1776530.1412,1111614.8472 1776348.1026,1111687.5969 1776270.1799,1111821.5956 1776161.9585,1111933.2332 1776102.9199,1112074.6886 1776060.376,1112135.1732 1776039.2653,1112278.6782 1775969.9747,1112324.4805 1775911.7409,1112347.884 1775864.741,1112359.1978 1775842.0062,1112291.0357 1775436.2331,1112191.9351 1775137.2767,1112114.4671 1774695.1626,1112087.528 1774404.8324,1112080.1162 1774390.7844,1112069.6771 1774371.0055,1112042.0405 1774329.0749,1111988.4749 1774280.0941,1111922.9558 1774253.6386,1111920.3399 1774252.5823,1111847.9661 1774202.2924,1111722.6342 1774099.7396,1111693.1273 1774052.3841,1111673.5952 1774019.564,1111666.8536 1774008.23,1111646.0923 1773973.2933,1111639.1905 1773955.1508,1111654.3034 1773943.9366,1111746.9486 1773875.1924,1111807.7093 1773830.107,1111887.3575 1773665.6329,1112052.0219 1773256.7621,1112039.9416 1773197.1066,1112037.2842 1773056.0095,1112172.7494 1772739.582,1112181.844 1772712.4946,1112208.621 1772632.7381,1112204.2682 1772612.3169,1112185.3896 1772523.7597,1111930.6613 1772097.324,1111826.1894 1771908.3352,1111923.3368 1771842.2487,1111762.7555 1771607.2283,1111694.1922 1771417.9325,1111716.4868 1771202.8417,1111709.24 1771135.4147,1111652.8534 1771029.2915,1111563.3638 1771028.7854,1111649.9931 1770866.6764,1111749.8875 1770740.4528,1111767.5471 1770718.4054,1111806.7421 1770675.1354,1111874.4395 1770598.6744,1111969.6837 1770405.792,1112101.4057 1770132.799,1112102.3835 1770128.5777,1112111.1205 1770090.2724,1112128.7525 1770005.3018,1112237.9275 1769906.974,1112380.3239 1769822.3556,1112643.0999 1769745.1478,1112678.8231 1769700.9276,1112859.5021 1769626.795,1112874.1303 1769626.2962,1112900.0319 1769625.4132,1112979.1107 1769622.7038,1113217.9849 1769466.4588,1113221.7313 1769463.6472,1113247.5155 1769444.2874,1113256.2509 1769437.7274,1113260.9559 1769434.1884,1113361.9025 1769280.2932,1113412.3187 1769178.5822,1113457.1717 1769075.9418,1113620.9277 1768695.0416,1113679.1876 1768532.9876,1113634.8627 1768508.9696,1113510.5883 1768441.6296,1113431.5331 1768341.0784,1113405.5613 1768289.1086,1113401.3922 1768254.152,1113395.9681 1768208.6702,1113390.9751 1768166.75,1113449.9805 1767677.5292,1113481.7477 1767440.1296,1113517.0861 1767253.45,1113739.6123 1766761.766,1113844.9859 1766392.6742,1113820.3161 1765947.5382,1113791.6075 1765837.237,1113743.2383 1765718.666,1113631.5087 1765487.0424,1113511.7249 1765332.661,1113580.7829 1765125.714,1113837.4561 1764978.096,1113842.7201 1764974.138,1113843.239 1764973.4838,1113847.3691 1764968.2756,1113856.6685 1764937.6044,1113853.9109 1764928.034,1113849.1039 1764917.5246,1113700.1525 1764597.9576,1113692.5797 1764583.7592,1113687.8297 1764576.2512,1113684.8709 1764571.6442,1113644.5653 1764513.5682,1113635.1037 1764501.7794,1113629.1471 1764497.2494,1113590.8803 1764471.5842,1113738.006 1764090.6761,1113737.8619 1764078.7726,1113737.3047 1764037.4486,1113736.9183 1764012.022,1113689.0679 1763974.352,1113649.0325 1763950.6316,1113607.1179 1763925.7982,1113572.1571 1763905.9686,1113552.0509 1763894.5648,1113536.2071 1763884.9316,1113519.9105 1763875.0148,1113467.4269 1763842.9626,1113440.7657 1763826.6698,1113430.2147 1763820.0862,1113427.8521 1763818.6086,1113390.2852 1763794.8802,1113338.6609 1763752.356,1113316.4073 1763729.5342,1113314.1715 1763726.253,1113311.6163 1763722.4796,1113293.2015 1763694.3076,1113141.6395 1763439.2818,1113093.7103 1763356.1024,1113064.2287 1763289.1956,1112943.6907 1763066.8372,1112932.5557 1763051.3714,1112917.0853 1763043.33,1112655.9067 1762937.5322,1112491.0115 1762873.189,1112459.6955 1762862.9166,1112439.9205 1762849.806,1112431.8951 1762843.9756,1112074.7251 1762527.5628,1111984.8577 1762442.6278,1111900.5637 1762386.8706,1111875.5209 1762370.5924,1111848.5836 1762353.0872,1111841.5319 1762348.5048,1111772.1055 1762337.1154,1111752.1841 1762333.85,1111740.6939 1762331.971,1111721.2467 1762334.2516,1111701.2359 1762336.5986,1111634.7499 1762344.4052,1111520.5169 1762360.3856,1111467.1999 1762396.7008,1111414.4155 1762433.5496,1111406.8527 1762438.8294,1111400.5491 1762443.241,1111379.2449 1762458.1538,1111238.2746 1762594.953,1111031.3423 1762757.3164,1110753.9799 1762951.4198,1110660.9253 1763046.8073,1110616.2262 1763056.413,1110588.107 1763069.4766,1110548.0372 1763075.6141,1110529.4638 1763073.612,1110431.0172 1763059.6889,1110425.6616 1763056.905,1110325.797 1762956.1885,1110406.501 1762790.4987,1110495.0085 1762739.2871,1110535.3309 1762722.0026,1110557.7438 1762702.0209,1110650.7123 1762612.5258,1110652.9618 1762607.5285,1110652.742 1762606.3277,1110651.5502 1762599.8198,1110672.9509 1762289.7213,1110758.9673 1761969.5751,1110790.5974 1761881.9924,1110800.0347 1761803.1905,1110783.5136 1761589.0778,1110781.5896 1761573.1117,1110745.8128 1761359.9041,1110700.8401 1761296.9371,1110575.4889 1761102.5423,1110550.2541 1761016.7015,1110549.7952 1760908.5442,1110551.2246 1760900.9313,1110554.5887 1760893.4204,1110565.7549 1760871.6074,1110577.7047 1760853.9079,1110589.6545 1760836.2085,1110597.4887 1760822.7837,1110654.4034 1760693.1739,1110652.2739 1760683.4745,1110651.5129 1760680.0085,1110644.1331 1760653.8728,1110638.0259 1760636.4216,1110563.2458 1760593.8019,1110367.4146 1760491.0149,1110360.8906 1760488.8353,1110350.1149 1760485.2353,1110342.1723 1760485.7537,1110340.6286 1760485.8553,1110327.689 1760508.5027,1110318.8363 1760526.8863,1110285.4702 1760589.8299,1110277.4007 1760596.3417,1110275.8873 1760597.5623,1110272.8283 1760599.7354,1110269.8574 1760601.8456,1110223.2229 1760632.9833,1110205.8327 1760634.2743,1110164.7065 1760636.7577,1110112.4884 1760613.766,1110009.4799 1760505.0462,1109781.9843 1760312.5408,1109720.2723 1760261.7255,1109437.9587 1759940.0025,1109407.3586 1759904.1655,1109373.6891 1759855.7805,1109357.1702 1759831.8305,1109326.3908 1759779.9531,1109325.6816 1759773.3573,1109324.8558 1759765.6237,1109323.4872 1759752.6405,1109322.7531 1759745.6745,1109276.2919 1759711.2147,1109196.186 1759609.2252,1109172.1934 1759571.6178,1109171.1514 1759550.9773,1109170.5436 1759217.0667,1109175.2456 1759189.7754,1109179.9476 1759162.4851,1109217.6116 1759020.8707,1109253.2793 1758980.4393,1109266.242 1758965.7454,1109366.5418 1758893.9925,1109498.1321 1758778.5552,1109596.7491 1758652.5744,1109631.2225 1758608.0793,1109658.714 1758572.5834,1109678.2087 1758499.9292,1109682.3919 1758424.6371,1109683.0389 1758336.5964,1109684.87 1758328.2198,1109752.5785 1758035.8962,1109846.5575 1757669.6102,1109914.0107 1757601.6864,1110001.833 1757394.1419,1109941.4533 1757370.8598,1109347.7363 1757102.4036,1109340.3781 1757097.3386,1109128.4333 1756903.2424,1109126.9157 1756900.2976,1109123.0267 1756889.0526,1108972.9733 1756614.793,1108919.1113 1756597.1574,1108778.8513 1756543.1394,1108754.0953 1756525.3144,1108667.4725 1756462.9436,1108662.6929 1756458.8091,1108489.0469 1756277.4706,1108487.2069 1756274.1776,1108477.1257 1756256.135,1108469.4145 1756241.4566,1108464.6843 1756197.4218,1108464.1301 1756143.8904,1108461.9725 1756109.3316,1108455.5377 1756100.0468,1108417.5221 1756065.7662,1108207.2183 1755985.8038,1108122.0829 1756009.7452,1108031.8707 1756088.6936,1107978.3241 1756164.6104,1107941.2869 1756251.9982,1107827.6249 1756251.5058,1107769.5339 1756227.4464,1107643.8879 1756127.129,1107630.0045 1756092.1407,1107623.8985 1756056.3342,1107619.1697 1755986.5424,1107613.0179 1755961.0256,1107573.5659 1755874.7002,1107553.3779 1755842.3176,1107513.2753 1755800.5064,1107465.6665 1755784.735,1107382.5845 1755757.2124,1107356.5249 1755749.1263,1107288.8703 1755746.6675,1106861.0293 1755503.2098,1106860.1726 1755501.2783,1106766.6329 1755026.8264,1106767.1267 1754933.4066,1106773.8007 1754881.348,1106783.5109 1754816.0572,1106808.2459 1754726.0868,1106811.2457 1754717.076,1106915.2501 1754488.3982,1107005.1207 1754331.3004,1107095.4011 1754184.717,1107147.1234 1754164.274,1107168.6877 1754160.954,1107194.0171 1754164.3296,1107234.7955 1754095.5724,1107285.1185 1753905.7036,1107304.9303 1753697.6566,1107294.6281 1753627.9456,1107293.2493 1753620.3796,1107286.2797 1753590.4654,1107240.989 1753485.5978,1107209.8765 1753408.2072,1107214.6131 1753244.7686,1107236.6909 1753130.9896,1107246.5283 1753109.2018,1107281.5225 1753079.0676,1107301.1291 1753065.1872,1107301.5847 1753065.723,1107306.7811 1753071.0688,1107442.4949 1753055.7386,1107481.4107 1753008.1594,1107513.9753 1752957.7932,1107690.7081 1752644.8676,1107702.6645 1752606.8676,1107705.7159 1752537.2452,1107707.0341 1752507.168,1107707.8329 1752472.9176,1107812.1783 1752089.8214,1107868.9857 1752047.3682,1107960.6349 1751966.0116,1108016.4205 1751898.0358,1108035.2173 1751870.7038,1108054.3379 1751826.2116,1108080.0645 1751701.144,1108043.7851 1751653.0316,1108013.9243 1751627.9832,1108008.9317 1751609.7374,1107978.4667 1751469.7354,1107975.9275 1751268.2286,1107968.5109 1751123.7104,1107961.5267 1751053.4062,1107935.1705 1750979.0532,1107921.2753 1750948.0012,1107890.9107 1750927.5764,1107850.9845 1750901.3304,1107843.9963 1750896.7366,1107816.6929 1750695.3976,1107844.8427 1750558.121,1107931.0698 1750358.273,1107792.6486 1750205.2756,1107616.2191 1750026.8458,1107540.2778 1749969.708,1107526.5361 1749922.865,1107524.5395 1749738.8971,1107634.5281 1749617.6719,1107736.0222 1749524.2803,1107787.6976 1749429.9381,1107795.205 1749204.0191,1107722.2751 1748990.1557,1107704.7593 1748939.4967,1107668.3807 1748892.7511,1107632.9991 1748857.6697,1107429.2347 1748684.4729,1107249.4687 1748578.4695,1107170.3403 1748510.3183,1107004.0176 1748341.9,1106999.3727 1748312.3573,1107002.5736 1748247.8345,1107018.4001 1748080.9143,1107033.9744 1748024.7965,1107043.2802 1747986.2229,1107044.7178 1747974.6697,1107044.128 1747921.9231,1107018.7792 1747884.6069,1106689.1537 1747822.9671,1106682.0796 1747823.4688,1106570.4488 1747831.3879,1106536.3777 1747840.7091,1106282.1978 1747848.9427,1106125.3029 1747823.8105,1105982.5584 1747769.1398,1105975.9521 1747754.0082,1105912.0684 1747594.8935,1105910.5445 1747591.0974,1105909.0193 1747587.2988,1105885.6364 1747583.4766,1105489.5113 1747623.7037,1105236.7266 1747757.6963,1104940.239 1747633.5264,1104614.8559 1747457.155,1104527.7882 1747292.6169,1104508.226 1747244.3537,1104481.8127 1747167.9291,1104387.0827 1747067.7863,1104334.4442 1747012.1401,1103778.2864 1746740.9277,1103735.6654 1746525.9732,1103732.2682 1746508.8387,1103686.8434 1746371.8081,1103442.5079 1746238.4555,1103151.6389 1746146.8479,1102969.4529 1746099.0859,1102867.1997 1746097.2958,1102830.9497 1746133.9789,1102678.6927 1746154.983,1102305.8017 1746202.5459,1102267.4918 1746188.7762,1101925.4319 1745967.8096,1101728.593 1745814.6003,1101684.6906 1745696.7054,1101302.1351 1745753.7173,1101301.0745 1745937.6914,1101203.3226 1746015.948,1101160.4514 1746044.0402,1101088.0031 1746103.4743,1100763.1221 1746523.0779,1100756.0903 1746558.0511,1100754.6075 1746910.7113,1100760.8471 1747003.7382,1100787.0992 1747042.2881,1100790.4555 1747047.2165,1100816.9608 1747071.8217,1100857.8748 1747109.8028,1100910.4988 1747158.6545,1101003.7431 1747250.9309,1101022.8758 1747299.741,1101025.5445 1747390.7007,1100954.3901 1747605.0216,1100922.7773 1747670.4063,1100869.0352 1747747.488,1100760.508 1747884.4685,1100637.567 1747924.9787,1100633.3063 1747926.3822,1100384.0783 1748186.608,1100382.3259 1748222.5236,1100381.6439 1748236.5038,1100397.7059 1748335.1038,1100558.163 1748536.412,1100627.7967 1748606.8124,1100727.8318 1748666.2557,1100795.3614 1748717.2293,1100829.2615 1748795.4162,1100822.6507 1748830.7662,1100816.3531 1748864.4412,1100795.2786 1748905.5613,1100763.5903 1748951.9289,1100719.1819 1749028.8354,1100750.9376 1749195.7196,1100726.7701 1749523.2681,1100613.883 1749674.5044,1100601.5391 1749691.0414,1100593.048 1749702.4167,1100299.6219 1749742.9049,1100297.6872 1749743.0046,1100290.7064 1749743.3642,1100146.1137 1749750.544,1100023.6044 1749647.5099,1099933.2243 1749587.649,1099714.0191 1749493.534,1099562.1507 1749480.2143,1099424.9002 1749473.7724,1099274.1213 1749496.4825,1099074.2896 1749540.2749,1099035.9003 1749539.9652,1098949.9164 1749523.7638,1098913.4014 1749447.7848,1098940.0143 1749353.9286,1098767.1152 1749031.5234,1098693.4702 1748986.1593,1098536.8417 1748901.1454,1098523.0079 1748910.1775,1098494.9903 1748928.4706,1098130.3323 1749233.9859,1098091.7187 1749313.6557,1098083.7332 1749330.1955,1098022.0518 1749437.5049,1097952.0551 1749548.9203,1097878.6841 1749651.4728,1097706.4696 1749686.5314,1097342.0691 1749476.123,1097103.3943 1749334.5848,1096916.8349 1749223.756,1096836.5771 1749218.4021,1096579.5639 1749332.1025,1096546.6803 1749396.1147,1096454.2787 1749481.9595,1096284.6194 1749459.7604,1096202.2757 1749390.0461,1096175.5567 1749360.2118,1096158.2824 1749278.5332,1096129.6473 1749135.5256,1095999.1141 1748776.4241,1095951.2347 1748674.2311,1095834.5594 1748582.9838,1095590.1855 1748447.2718,1095536.4951 1748426.558,1095390.7784 1748420.6406,1095226.954 1748328.0465,1095172.365 1748293.1397,1094744.106 1747967.0574,1094659.6255 1747884.3517,1094557.6943 1747703.3879,1094434.8263 1747517.6675,1094377.6364 1747500.0408,1094310.9896 1747480.1258,1094241.5055 1747463.261,1093915.7011 1747353.157,1093463.6226 1747178.2842,1092979.035 1746759.8284,1092992.1784 1746735.689,1093036.9815 1746653.4029,1093055.9699 1746619.8514,1093080.0391 1746597.7779,1093111.1439 1746569.2519,1093168.0698 1746491.327,1093174.4745 1746482.5596,1093223.18 1746391.8074,1093277.3998 1746189.1727,1093488.6064 1745780.976,1093531.2127 1745713.97,1093419.4233 1745430.0635,1093355.9802 1744975.1338,1093570.0987 1744777.7369,1093660.566 1744689.6578,1093537.4932 1744409.2449,1093446.478 1744253.142,1093316.9326 1744003.4546,1093323.5037 1743858.5775,1093329.0357 1743736.6102,1093332.2238 1743716.128,1093354.7304 1743571.5351,1093365.5713 1743501.8886,1093189.6811 1743464.6808,1093015.2467 1743478.3589,1092678.2333 1743327.0122,1092463.0499 1743223.4543,1092136.3155 1743055.7725,1091957.4801 1742806.6081,1091955.0513 1742778.298,1091836.5751 1742607.7054,1091710.5622 1742567.3614,1091496.7295 1742517.0909,1091361.642 1742523.8893,1091353.4631 1742524.8542,1091292.0287 1742482.6109,1091247.2303 1742426.605,1091209.7688 1742368.0896,1091183.2735 1742317.1263,1091180.5955 1742300.8998,1091172.7267 1742252.9496,1091191.4623 1742203.4103,1091207.3061 1742161.5175,1091261.3059 1742084.0453,1091305.4019 1742021.1762,1091315.4751 1742006.8145,1091321.9897 1741976.4505,1091334.8691 1741894.8617,1091336.2873 1741497.5111,1091264.0191 1741357.1355,1091236.7579 1741304.1827,1091245.966 1741114.4255,1091235.6099 1740723.8535,1091223.1571 1740632.5365,1091168.3329 1740380.1621,1091142.7484 1740026.9427,1091142.3856 1739816.0629,1091142.3546 1739797.6643,1091248.341 1739720.0075,1091275.8113 1739699.8798,1091355.4233 1739593.0108,1091490.13 1739404.3594,1091496.2382 1739379.7869,1091500.2411 1739307.0754,1091497.3736 1739268.7135,1091428.5583 1739008.2981,1091422.9082 1738999.8026,1091386.7799 1738952.4057,1091280.5348 1738822.8773,1091194.3439 1738722.1929,1091102.0799 1738622.3947,1091054.7837 1738590.3231,1091004.2915 1738567.9967,1090976.9761 1738556.7399,1090882.2239 1738534.2463,1090787.0201 1738528.2895,1090735.5825 1738530.8713,1090594.2766 1738550.6497,1090504.1087 1738558.2499,1090148.1325 1738554.9483,1090140.0755 1738546.0833,1090127.6549 1738523.7843,1089781.4219 1738334.6679,1089474.6325 1738203.5217,1089005.0224 1738099.8969,1088976.9869 1738094.3699,1088941.3517 1738093.8489,1088928.1389 1738096.7723,1088903.8519 1738104.9167,1088852.7209 1738123.6527,1088819.8931 1738226.7137,1088791.9967 1738330.9157,1088791.6167 1738363.2009,1088791.5033 1738373.7677,1088789.6187 1738421.1027,1088780.8979 1738501.1569,1088777.0611 1738531.9745,1088737.0773 1738616.7901,1088681.7783 1738667.881,1088677.0058 1738672.2903,1088628.2317 1738690.3474,1088589.2398 1738704.7827,1088477.1689 1738702.4693,1088453.4767 1738697.0537,1088407.3837 1738680.3043,1088380.7373 1738667.0441,1088332.4497 1738614.4194,1088318.7532 1738599.1524,1088216.7609 1738485.4667,1087920.7902 1738282.2722,1087887.0062 1738263.7744,1087775.2928 1738263.2664,1087485.965 1738274.1018,1087438.4842 1738304.9599,1087409.7109 1738323.867,1087213.8538 1738457.4376,1087172.8912 1738487.1472,1086945.9574 1738694.7027,1086938.1769 1738693.7056,1086899.7354 1738684.8844,1086874.4506 1738678.4848,1086805.5562 1738654.4128,1086772.2935 1738635.303,1086690.1107 1738586.2908,1086686.9034 1738582.9646,1086684.6829 1738578.9628,1086682.9081 1738574.9774,1086682.4051 1738564.72,1086689.5339 1738530.4386,1086689.3221 1738513.0286,1086681.4003 1738477.2476,1086675.4181 1738459.286,1086599.6533 1738339.661,1086303.1333 1738279.587,1086236.0763 1738286.875,1086047.1615 1738365.0637,1085864.2901 1738366.7584,1085772.7517 1738426.8834,1085754.5735 1738435.9356,1085735.8957 1738442.2378,1085723.7105 1738444.2052,1085712.0699 1738444.9404,1085692.5995 1738441.8516,1085687.7153 1738434.1432,1085683.1155 1738426.8834,1085630.1559 1738251.3358,1085212.6631 1737922.5692,1085232.2361 1737818.0304,1085230.5966 1737787.1334,1085155.6443 1737568.9134,1085101.4783 1737551.0734,1085077.0305 1737543.3778,1085010.6884 1737537.388,1084990.6102 1737547.668,1084920.4327 1737585.2256,1084906.2791 1737579.3268,1084898.3307 1737576.0132,1084849.5353 1737516.013,1084478.1135 1736927.7578,1084382.7874 1736738.8464,1084371.7949 1736691.2878,1084308.5153 1736568.6434,1084307.2137 1736567.9206,1084198.3735 1736603.8054,1084111.0723 1736682.1182,1084017.7615 1736764.0292,1083832.601 1736925.222,1083795.4995 1736954.3756,1083781.3237 1736962.8392,1083732.892 1736981.0572,1083590.4832 1736956.4096,1083575.7877 1736953.256,1083560.2673 1736945.2058,1083553.4569 1736940.0312,1083535.8853 1736920.0346,1083514.2947 1736891.9276,1083482.5121 1736845.2364,1083466.0283 1736818.504,1083447.0693 1736782.3182,1083379.1779 1736640.9432,1083192.8837 1736498.9856,1082930.0757 1736371.6946,1082888.0433 1736251.2788,1082766.6259 1736064.8208,1082684.0291 1735989.143,1082140.8793 1735765.7424,1081943.0742 1735933.6342,1081882.2357 1736035.3796,1081879.8735 1736038.119,1081827.0927 1736074.1124,1081822.3099 1736075.815,1081443.3619 1735906.8422,1081187.0439 1735777.696,1081126.5967 1735705.9668,1081115.1051 1735714.9152,1081079.1699 1735742.8972,1081073.6689 1735747.1806,1080617.0093 1735506.892,1080518.9465 1735402.5222,1080460.6007 1735327.2642,1080403.9445 1735257.6306,1080265.4073 1735249.686,1080148.0661 1735246.4296,1080102.9569 1735228.6964,1080101.2167 1735228.0122,1080060.0331 1735193.2122,1080042.8973 1735104.6608,1079924.7137 1734854.6402,1079922.7093 1734852.7222,1079508.0553 1734879.7028,1079449.0967 1734894.9824,1079440.4057 1734897.2348,1079045.8575 1735056.6698,1078936.6979 1735148.4716,1078920.2997 1735162.6378,1078909.5547 1735182.0846,1078900.0381 1735253.2304,1078953.6849 1735325.5948,1079007.3321 1735397.9584,1079102.9883 1735504.9765,1079272.6893 1735554.9784,1079350.1633 1735577.0874,1079554.5413 1735637.928,1080452.6718 1736120.6994,1080496.2602 1736175.2484,1080538.1293 1736228.4144,1080566.7561 1736265.0944,1080893.8085 1736714.8708,1080948.3035 1736803.717,1080988.3067 1736870.0596,1081068.6143 1737003.572,1081115.9461 1737103.7462,1081169.4689 1737218.0274,1081603.6951 1737772.851,1081609.0771 1737802.335,1081618.0847 1737851.6816,1081655.5011 1738058.8116,1081664.2733 1738107.7635,1081656.2931 1738173.8466,1081641.5667 1738286.6432,1081632.5195 1738354.1026,1081616.2271 1738470.2784,1081480.6773 1739194.4264,1081420.4229 1739305.1176,1081284.9957 1739553.614,1080856.6987 1739975.0488,1080729.6239 1740089.1262,1080184.7651 1740484.731,1079965.9983 1740642.1746,1079171.1041 1741324.0286,1079101.9715 1741385.7854,1079041.0937 1741441.088,1078967.9761 1741508.4144,1078036.8223 1742493.3414,1077922.0947 1742667.0522,1077867.9897 1742749.065,1077817.7409 1742825.4442,1077681.6335 1743037.8835,1077661.7163 1743068.9822,1077637.6469 1743107.4752,1077565.8852 1743223.6252,1077556.1047 1743244.2354,1077542.6557 1743272.5766,1077523.1557 1743314.4326,1077452.2067 1743466.8864,1077389.8645 1743640.2714,1077363.0137 1743715.5186,1077323.6101 1743827.587,1077239.8469 1744084.15,1077218.8507 1744149.1834,1077205.6205 1744188.5265,1077126.8283 1744490.5655,1077111.5473 1744549.9936,1077104.6223 1744584.1838,1077088.9421 1744663.7613,1077041.0125 1744912.001,1077032.5419 1745130.724,1077051.8717 1745538.1894,1077057.1737 1745639.5464,1077102.3031 1745692.817,1077374.8185 1746010.2966,1077501.5149 1746091.812,1077605.0015 1746146.1053,1077693.2695 1746164.8221,1077955.2653 1746115.2344,1078110.7543 1746069.7886,1078247.0819 1746029.943,1078891.203 1745776.192,1079138.4569 1745651.3362,1079331.3791 1745553.893,1079443.8133 1745512.7593,1079667.3941 1745433.4919,1079857.3012 1745386.9171,1080089.7143 1745375.4235,1080226.7213 1745368.6199,1080266.7616 1745366.447,1080657.8754 1745334.2189,1080804.7965 1745313.2067,1081156.0807 1745255.3965,1081979.8821 1744983.2583,1082530.2359 1744782.0647,1082741.7683 1744799.187,1082820.2068 1744805.7672,1083155.0829 1744849.0601,1083276.6327 1744892.0331,1083435.4772 1744948.8353,1083475.5963 1744971.8065,1083501.0367 1744986.7581,1083517.8598 1744997.1961,1083523.9189 1745001.6817,1083726.0996 1745169.0087,1084325.2391 1745803.0762,1084382.7182 1745874.7987,1084407.4206 1745905.6426,1084413.2629 1745913.0632,1084418.2759 1745920.8962,1084436.2451 1745952.3575,1084488.8717 1746045.9739,1084541.5305 1746290.8666,1084561.1608 1746431.4649,1084562.7509 1746535.8009,1084562.8922 1746636.2937,1084562.9441 1746899.4001,1084538.3641 1747065.4589,1084462.7563 1747624.3429,1084449.5875 1747694.0491,1084442.1183 1747732.2068,1084439.3692 1747740.3594,1084417.9875 1747803.7668,1084405.6876 1747838.2275,1084401.7438 1747849.2765,1084339.0036 1747985.1595,1084305.1289 1748044.1033,1084273.5178 1748099.1074,1084156.2975 1748190.1628,1084058.0974 1748266.0219,1083963.8524 1748340.3118,1083550.9803 1748694.6031,1083514.4472 1748735.2753,1083498.4481 1748753.4629,1083442.6547 1748816.8889,1083423.0467 1748839.4889,1082840.3358 1749255.5373,1082524.5351 1749452.904,1081303.3435 1750132.1486,1081105.0439 1750225.7989,1081043.4403 1750255.0924,1081017.4617 1750272.9152,1080763.3125 1750449.7818,1080671.3995 1750519.553,1080581.4287 1750588.822,1080503.0589 1750705.838,1080455.8069 1750806.4414,1080258.5157 1751165.5938,1080073.1931 1751409.5938,1079931.5441 1751586.3062,1079923.7722 1751594.86,1079887.7725 1751642.0236,1079864.5929 1751681.8156,1079852.1409 1751717.2512,1079849.5399 1751762.9882,1079851.4387 1751776.613,1079858.3872 1751826.4698,1079866.4709 1751883.9462,1079947.8127 1752053.7814,1080241.8099 1752620.1374,1080413.5771 1752987.0697,1080443.2105 1753037.8022,1080481.0251 1753102.1578,1080523.1797 1753172.7064,1080586.7109 1753276.5322,1080635.4861 1753355.6732,1080644.0939 1753365.7626,1080676.4543 1753403.6924,1080727.0197 1753462.1658,1080811.0469 1753556.7902,1080864.0287 1753616.3188,1080891.5409 1753646.6758,1080944.4267 1753704.702,1080964.8387 1753726.6906,1081013.0519 1753785.2812,1081063.0807 1753846.743,1081123.7544 1753954.0294,1081167.6497 1754052.0394,1081186.6821 1754095.2936,1081217.7609 1754177.6658,1081232.0557 1754215.9446,1081257.9105 1754310.9377,1081266.6761 1754343.9109,1081273.7105 1754393.8046,1081281.9929 1754461.0442,1081395.5011 1754827.1909,1081467.7132 1754994.3864,1081568.0341 1755221.7551,1081892.2065 1755929.1938,1082054.6905 1756243.4717,1082217.0829 1756256.6881,1082273.7403 1756261.2991,1082276.2561 1756292.7722,1082289.1937 1756454.3237,1082322.7113 1756497.2595,1082390.8197 1756583.9451,1082421.0808 1756622.4599,1082441.4196 1756648.1705,1082491.2271 1756648.4644,1082549.4929 1756648.8077,1082555.1418 1756648.8407,1082742.4616 1756649.9348,1082740.5294 1756982.7917,1082740.3455 1757013.4385,1082773.0797 1757013.6285,1083010.8621 1757015.002,1083147.4885 1757015.7911,1083173.7039 1757028.8621,1083194.5695 1757041.2141,1083194.0891 1757124.5719,1083192.7711 1757352.2809,1083192.6055 1757379.5667,1083213.0239 1757379.6859,1085010.1041 1757390.1463,1085011.1209 1757220.2323,1085012.237 1757029.2935,1085021.1488 1757026.6967,1085803.8383 1757031.2403,1086904.0294 1757026.8681,1087677.9661 1757042.1569,1087729.8221 1757057.9017,1087817.0545 1757098.6055,1087843.7276 1757111.3867,1087970.2653 1757180.0957,1087957.132 1757246.4817,1088021.1322 1757485.212,1088331.1641 1757749.3002,1088345.3418 1757761.386,1088518.3692 1757979.824,1088593.7505 1758075.0065,1088618.1267 1758105.7997,1088618.4239 1758106.1751,1088622.0441 1758110.7447,1088670.0079 1758171.2811,1088775.53820114 1758118.20499996,1088777.20550336 1758119.64333547,1088780.19379997 1758164.02169991,1088793.90649986 1758367.82970238,1088795.6425991 1758393.68670082,1088798.1563015 1758494.63620186,1088802.49010277 1758671.04010201,1088802.69109917 1758741.29990196,1088800.4049015 1758782.57370186,1088791.22089958 1758948.21970177,1088781.84010124 1759026.1019001,1088773.30050087 1759096.92130089,1088742.22010231 1759280.26650047,1088701.53450203 1759400.1359005,1088696.64590263 1759414.54010201,1088648.75710106 1759584.19190025,1088613.29330127 1759737.11910029,1088087.2189 1759955.6623,1088005.1339 1759989.7704,1087984.8631 1759998.1934,1087896.7947 1760067.8874,1087859.9963 1760097.465,1087838.3767 1760114.8805,1087485.1625 1760650.045,1087500.7924 1760775.6506,1087488.7097 1760770.7216,1087295.0059 1760788.8225,1087212.9027 1760818.1187,1086728.6441 1760990.9719,1086645.1992 1761043.0522,1086592.0533 1761076.2221,1086513.6467 1761125.1595,1086281.2517 1761270.2155,1086222.8483 1761302.4267,1085788.0779 1761542.1769,1085713.7876 1761563.2337,1085309.8001 1761677.7395,1085127.7983 1761686.9073,1084958.6665 1761695.4249,1084758.6262 1761705.2977,1084538.3302 1761716.177,1084401.9874 1761757.7083,1084290.6857 1761791.6197,1084105.9124 1761847.9257,1083309.4871 1761923.5056,1083000.4635 1761947.7237,1082782.9013 1762045.9518,1082710.6395 1762078.5718,1082256.6847 1762088.8186,1080967.8927 1762090.5048,1080435.2739 1762087.1172,1080284.2743 1762093.8141,1080052.6387 1762003.9808,1079777.3533 1762171.1236,1079772.8245 1762242.4696,1079770.2355 1762316.2544,1079767.1669 1762787.4334,1079766.1667 1763066.2428,1079775.2583 1763249.302,1079827.6177 1763593.7948,1079890.1683 1763762.0828,1079928.1045 1763853.7268,1079963.4739 1763918.674,1079995.3349 1763956.52,1080032.8163 1764000.9278,1080041.9323 1764012.5098,1080076.1429 1764060.8076,1080090.4895 1764081.7028,1080188.6695 1764243.2758,1080204.2979 1764274.3104,1080240.3567 1764373.7996,1080287.9623 1764542.7064,1080301.8543 1764594.7498,1080396.6339 1765072.9262,1080758.4081 1766010.7788,1080867.2565 1766288.3086,1080902.3091 1766357.377,1080904.2961 1766361.292,1080937.0847 1766413.0344,1080956.9637 1766438.6096,1080973.6516 1766461.5836,1081006.2309 1766507.133,1081021.6191 1766540.3144,1081051.1649 1766605.7706,1081125.1157 1766902.614,1081129.5677 1766922.9862,1081143.8721 1767007.0976,1081127.4421 1767291.1718,1081125.9221 1767407.1212,1081384.6331 1767459.8333,1081440.9769 1767471.1126,1081591.9761 1767477.0612,1081860.7825 1767502.4672,1082020.4879 1767776.0963,1082048.9117 1767912.5294,1082077.6673 1768023.1478,1082086.0033 1768050.968,1082087.2799 1768055.228,1082128.8365 1768150.673,1082472.1025 1768685.6375,1082512.0117 1768732.614,1082600.3167 1768804.0806,1082691.9409 1768950.0208,1082784.4589 1769216.666,1082825.1347 1769405.6034,1082821.9715 1769454.8942,1082818.0449 1769555.2678,1082826.2399 1769770.5068,1082828.7777 1769792.9654,1083052.7953 1769880.575,1083312.0533 1769963.9866,1083340.1529 1769999.9862,1083408.6023 1770171.0827,1083423.2705 1770217.4074,1083416.0251 1770422.9256,1083435.9753 1770547.322,1083560.9265 1770471.5289,1083581.0349 1770459.9379,1083592.9993 1770457.1207,1083675.1411 1770471.1609,1083680.4333 1770478.0317,1083689.8031 1770498.4439,1083690.6391 1770503.2397,1083690.9217 1770507.2765,1083690.9669 1770507.9237,1083683.8505 1770524.7143,1083676.5881 1770535.0551,1083716.4483 1770648.6585,1083770.6801 1770702.0613,1083980.7375 1770845.3729,1084148.1439 1770896.8231,1084601.9521 1770959.7995,1084643.9807 1770946.852,1084647.4325 1770946.5371,1084681.1381 1770945.067,1084777.595 1771029.9002,1084805.0243 1771058.4674,1084828.1885 1771131.699,1084849.6343 1771199.5544,1084857.0309 1771222.9586,1084890.6155 1771327.0052,1084931.2557 1771356.5376,1085005.0037 1771365.6462,1085248.9913 1771353.3826,1085544.1453 1771316.2898,1085624.6493 1771326.091,1085723.1423 1771345.8838,1085758.4119 1771374.4398,1085823.3717 1771427.0738,1085880.1367 1771473.068,1085941.4621 1771522.7822,1085971.4705 1771675.7141,1086000.6525 1771905.8789,1086031.0281 1772158.286,1086058.6739 1772248.544,1086172.5571 1772214.291,1086232.7043 1772141.0022,1086324.7621 1772098.2022,1086393.1671 1772072.2426,1086575.6337 1772064.9308,1086658.9817 1772011.3984,1086789.3289 1771902.4822,1086919.3972 1771765.139,1087304.5753 1771748.0292,1087479.9963 1771719.9594,1087714.7573 1771623.6284,1087885.0581 1771530.661,1087974.6875 1771468.5126,1088013.7723 1771426.3956,1088022.9347 1771416.5222,1088076.4313 1771302.2924,1088080.4659 1771262.5492,1088091.1937 1771139.6682,1088099.3179 1771037.5506,1088061.1333 1770611.476,1088016.0199 1770485.5696,1087989.4839 1770411.511,1087905.6655 1770262.7446,1087834.9339 1770129.2692,1087821.0481 1770094.9952,1087804.6879 1770043.4397,1087809.7523 1769901.2452,1087831.0625 1769475.8538,1087874.4003 1769412.0294,1087856.7219 1769350.3712,1087845.7353 1769312.0526,1087768.0647 1769080.2495,1087753.4761 1769061.5133,1087709.9985 1769005.7212,1087606.7223 1768886.1248,1087407.9581 1768678.2907,1087333.1721 1768660.4968,1087219.3887 1768604.095,1087160.3901 1768527.338,1087110.7169 1768425.2981,1087152.7485 1768349.585,1087233.1019 1768261.89,1087288.2373 1768186.6505,1087289.1611 1768182.0258,1087313.1015 1768061.6394,1087311.3901 1767810.403,1087332.4773 1767498.7996,1087389.6477 1767416.4296,1087424.6066 1767389.668,1087437.5531 1767379.7573,1087455.0678 1767366.3494,1087607.5426 1767242.1056,1087672.912 1767155.2229,1087721.0288 1767091.2702,1087837.6214 1766980.1908,1087955.9594 1766904.1974,1087982.5336 1766887.8187,1088017.0394 1766866.5515,1088054.1804 1766891.9217,1088150.848 1766968.5096,1088208.5034 1767046.5216,1088303.8693 1767131.9606,1088366.2136 1767109.3198,1088676.96 1766956.0692,1088799.801 1766881.3236,1088849.2416 1766862.1045,1088883.4732 1766992.9472,1088904.8338 1767031.837,1088975.7999 1767098.5582,1089149.4062 1767221.077,1089160.6806 1767228.3778,1089203.863 1767245.0488,1089246.1912 1767255.2452,1089334.443 1767243.0794,1089398.6596 1767226.73,1089525.4583 1767089.4394,1089571.6978 1766952.9034,1089632.803 1766820.0946,1089760.0758 1766556.6956,1089926.1727 1766305.666,1089955.3585 1766315.4424,1090160.9314 1766384.3029,1090176.2075 1766388.2327,1090196.7603 1766380.4142,1090218.2218 1766346.7083,1090267.4995 1766221.1613,1090281.2265 1766152.2529,1090281.8706 1766120.8174,1090282.8661 1766071.0472,1090288.4127 1766001.0325,1090294.1712 1766002.9445,1090337.9162 1766018.218,1090352.9383 1766023.463,1090380.7429 1766033.1892,1090392.5914 1766037.3524,1090430.9553 1766056.42,1090460.4351 1766071.7036,1090525.659 1766137.8538,1090606.3917 1766224.0933,1090624.5941 1766244.2407,1090669.1886 1766304.8442,1090630.0803 1766353.0861,1090687.9472 1766559.7717,1090698.8522 1766586.7914,1090773.999 1767141.1122,1090773.0977 1767544.1752,1090746.8292 1767746.2608,1090859.6826 1768187.1637,1091144.6733 1768615.1073,1091443.8979 1768794.2712,1091459.3719 1768795.0988,1091499.6737 1768797.2542,1091813.3279 1768960.5208,1092238.7382 1769362.1012,1092312.3126 1769473.9786,1092311.371 1769606.6876,1092301.007 1769661.644,1092320.5031 1769699.554,1092527.0393 1769969.244,1092626.9179 1770050.2604,1092711.0812 1770104.5686,1092773.7473 1770140.889,1092800.1351 1770156.1828,1092874.2573 1770151.7231,1092919.5619 1770452.5332,1092926.6311 1770556.7756,1092937.4612 1770626.201,1092944.8893 1770661.1852,1092969.4417 1770733.9889,1092976.4547 1770753.6009,1093248.0699 1771394.6701,1093303.4081 1771455.3565,1093293.2064 1771530.9398,1093298.3511 1771606.3546,1093302.8673 1771639.7655,1093366.7108 1771805.7401,1093332.0743 1772177.1411,1093286.689 1772229.955,1093199.6657 1772584.598,1093258.5917 1772647.3003,1093236.7939 1772896.0174,1093221.3229 1772990.5692,1093163.6766 1773028.5894,1093124.0046 1773130.1552,1093120.8085 1773140.5248,1093158.6739 1773396.0128,1093173.6384 1773470.1254,1093177.618 1773489.8344,1093194.384 1773535.1622,1093229.5408 1773638.6735,1093252.7723 1773707.204,1093288.9258 1773850.1486,1093298.5897 1773904.5994,1093314.2512 1773992.8436,1093315.5858 1774012.1196,1093315.6042 1774012.3855,1093192.4982 1774287.6357,1093132.6769 1774329.0304,1092913.6884 1774457.6732,1092868.2664 1774707.959,1092861.3633 1774744.6902,1092807.9255 1775013.8398,1092715.5959 1775342.3693,1092662.726 1775460.046,1092596.6761 1775866.8018,1092707.6305 1776442.7688,1092746.8416 1776446.7271,1093185.0885 1776360.8378,1093576.2187 1776084.138,1093688.5895 1776033.7765,1093853.2679 1775969.3434,1094018.1831 1775890.0417,1094078.4827 1775838.8846,1094101.3771 1775802.0674,1094333.9343 1775195.508,1094351.2219 1775039.5641,1094345.8515 1774905.5362,1094376.7385 1774831.6044,1094604.6959 1774522.632,1094731.8479 1774479.9418,1094855.6593 1774390.834,1094982.8609 1774296.1559,1095042.7193 1774555.9094,1095209.7927 1775192.3908,1095238.0782 1775483.2904,1095243.4753 1775514.5834,1095305.9041 1775569.7899,1095436.2089 1775628.8748,1095598.1379 1775644.681,1095720.1921 1775607.61,1095994.0498 1775655.7522,1096080.5165 1775744.9484,1096080.3557 1775755.3209,1096078.4732 1775876.6984,1096720.5397 1776259.9919,1097236.4219 1776278.9394,1097478.6465 1776238.7272,1097657.8835 1776155.91,1098280.7312 1776379.669,1098538.9273 1776560.7528,1098525.3017 1776840.175,1098812.1842 1776975.0741,1099016.3473 1777034.123,1099211.3103 1777083.7558,1099418.9847 1777131.877,1099462.0464 1777345.6007,1099534.6038 1777456.4664,1099844.3726 1777936.9098,1100065.9096 1778290.6822,1100448.7321 1778704.8472,1100557.6252 1778817.3563,1100595.3314 1778947.0321,1100638.5383 1779113.9093,1100671.0706 1779271.0965,1100703.1453 1779426.0735,1100816.8706 1779423.2076,1100984.4118 1779381.5597,1101106.9542 1779384.1497,1101261.0576 1779426.4321,1101275.5405 1779461.1841,1101299.3034 1779545.6117,1101336.7384 1779567.3137,1101390.9229 1779578.4057,1101484.5612 1779590.7634,1101889.4856 1779514.2631,1101912.8711 1779530.5265,1102076.12 1779635.2347,1102266.6278 1779727.5398,1102320.1986 1779733.8957,1102464.4154 1779746.9386,1102537.2376 1779746.6056,1102598.2358 1779754.3956,1102628.4674 1779758.2566,1102731.5112 1779795.9281,1102798.8836 1779901.3825,1102797.971 1779903.1098,1102855.2151 1779891.2434,1102991.7083 1779879.801,1103125.4263 1779907.6034,1103126.5933 1779907.846,1103159.3225 1779901.1196,1103364.8539 1779800.4642,1103501.4671 1779720.777,1103544.7373 1779674.2986,1103668.1261 1779592.2418,1103719.6345 1779562.6648,1103730.4723 1779556.4416,1103916.9397 1779642.7848,1103981.8731 1779746.3972,1104014.3037 1779798.166,1104371.9987 1779848.1898,1104593.5991 1779854.3649,1104594.2557 1779854.392,1104913.5989 1779881.6182,1105026.3345 1779927.2352,1105035.4037 1779941.7746,1105140.0825 1780109.7116,1105221.9273 1780167.2626,1105390.9769 1780237.2648,1105689.5925 1780230.0846,1106105.6275 1780243.7586,1106282.2853 1780368.917,1106296.3733 1780378.8981,1106340.8137 1780420.7734,1106919.6037 1780391.4501,1107617.8271 1780551.1334,1107736.703 1780587.4087,1107777.5945 1780522.2654)))", {
//             dataProjection: 'EPSG:5179',
//             featureProjection: 'EPSG:3857'
//           });

//           var vectorSources = new ol.source.Vector({
//             features: [feature5181],
//           });
//           var vectorLayer = new ol.layer.Vector({
//             source: vectorSources,
//             style: new ol.style.Style({
//                 fill: new ol.style.Fill({
//                     color: 'rgba(135,206,250, 0.5)', // Skyblue color fill with opacity
//                 }),
//                 stroke: new ol.style.Stroke({
//                     color: 'orange', // Orange stroke color
//                     width: 2
//                 }),
//             })
//           });

//           map.addLayer(vectorLayer)
          
//           map.getView().fit(vectorSources.getExtent());
// map.getView().setCenter(ol.extent.getCenter(vectorSources.getExtent()));

        //TODO 추후 서버 생성시 진행 예정
        // if (clickCurrentLayer) {
        //     map.removeLayer(clickCurrentLayer);
        // }

        // if (clickCurrentOverlay) {
        //     map.removeOverlay(clickCurrentOverlay);
        // }

        // const geoUrl = target.getAttribute('data-geo-url');

        // $.ajax({
        //     url : "/api",
        //     data : {
        //         url : geoUrl
        //     },
        //     success: function(data) {
        //         console.log(data)
        //         var geoInfoObject = data.features[0];
        //         var geojsonObject = geoInfoObject.geometry;

        //         const format = new ol.format.GeoJSON({
        //             featureProjection: "EPSG:3857",
        //         });
                 
        //         const feature = format.readFeature(geojsonObject);
        //         var vectorSource = new ol.source.Vector({
        //             features: [feature]
        //         });

        //         const geometry = feature.getGeometry();
        //         const center = ol.extent.getCenter(geometry.getExtent());
        //         //layer.getSource().getKeys()로 확인
    
        //         var vectorStyle = new ol.style.Style({
        //             fill: new ol.style.Fill({
        //                 color: 'rgba(135,206,250, 0.5)', // Skyblue color fill with opacity
        //             }),
        //             stroke: new ol.style.Stroke({
        //                 color: 'orange', // Orange stroke color
        //                 width: 2
        //             }),
        //         });
                 
        //         var vector_layer = new ol.layer.Vector({
        //           source: vectorSource,
        //           style: vectorStyle
        //         })
        //         //layer.getKeys() 로 확인
                 
        //         map.addLayer(vector_layer);
        //         clickCurrentLayer = vector_layer
    
        //         var selectedValue = $(".coordinate-system-selector").val();
        //         var coord = ol.proj.transform(center, "EPSG:3857", selectedValue)
    
        //         var overlayElement = document.createElement('div');
        //         overlayElement.className = "ol-popup";
        //         overlayElement.innerHTML += `<a href="#" id="popup-closer" class="ol-popup-closer"></a>`
        //         overlayElement.innerHTML += `<div id="popup-content">
        //                                         <div class="ol-popup-title">정보</div>
        //                                             <code class="code">
        //                                                 <div class="popup-coordinate">${coord}</div><span>주소</span><br>
        //                                                 <div class="leftBottom__etcBtn">
        //                                                     <ul>
        //                                                         <li class="select customSelect">
        //                                                             <p onclick="searchLocalAddress(this)">${geoInfoObject.properties.addr == null ? geoInfoObject.properties.title : geoInfoObject.properties.addr}</p>
        //                                                         </li>
        //                                                     </ul>
        //                                                 </div>
        //                                             </code>
        //                                             <br>
        //                                         </div>`
        //         var overlay = new ol.Overlay({
        //             element: overlayElement,
        //             position: center
        //         });

        //         map.getView().setCenter(center);
        //         if(map.getView().getZoom() < 14){
        //             map.getView().setZoom(14)
        //         }
                
        //         // Add the overlay to the map
        //         map.addOverlay(overlay);
        //         clickCurrentOverlay = overlay;
    
        //         var deleteButton = overlayElement.querySelector(".ol-popup-closer");
        //         deleteButton.addEventListener("click", function () {
        //             map.removeLayer(vector_layer);
        //             map.removeOverlay(clickCurrentOverlay);
        //         });
        //     },beforesend: function(){
                
        //     },
        //     error: function(xhr, stat, err) {
        //         console.log(xhr, stat, err)
        //     }
        // })
        
    }
}

function addHighlight(html, query){
    return html.replaceAll(query, `<mark style="padding:0px;">${query}</mark>`)
}

function searchLocalAddress(e){
    console.log(e.innerText)
    var depth1Element = new bootstrap.Tab(document.getElementById('profile-tab'));
    var depth2Element = new bootstrap.Tab(document.getElementById('all-tab'));
    $("#search-input").val(e.innerText)
    $("#serach-button").data('searchParam', 'PARCEL');
    $("#serach-button").click()
    // Show the tab
    depth1Element.show();
    depth2Element.show();
}


function addControlTitle(){
    $(".ol-zoom-in").attr("title", "줌인")
    $(".ol-zoom-out").attr("title", "줌아웃")
    $(".ol-zoom-extent button").attr("title", "범위 맞춤")
    $(".ol-zoomslider-thumb").attr("title", "줌 슬라이더")
    $(".ol-compass").attr("title", "회전 초기화")
    $(".ol-fullscreen-control-false").attr("title", "전체 화면")
    $(".ol-overviewmap button").attr("title", "개요도")
    $(".ol-print button").attr("title", "프린트")
    $(".ol-scale-bar .ol-scale-bar-inner").attr("title", "축적/거리")
}