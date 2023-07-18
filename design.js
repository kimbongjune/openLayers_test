proj4.defs("EPSG:5178","+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=500000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs");
proj4.defs("EPSG:5179","+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=500000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs");
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
    //                                                             <p>${geoInfoObject.properties.addr}</p>
    //                                                         </li>
    //                                                     </ul>
    //                                                 </div>
    //                                             </code>
    //                                             <br>
    //                                             <div>공시지가 : ${geoInfoObject.properties.jiga != "" ? geoInfoObject.properties.jiga.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : "--"}&#8361;, 지목 : ${geoInfoObject.properties.jibun.slice(-1)}</div>
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

            var overlayElement = document.createElement('div');
            overlayElement.className = "ol-popup";
            overlayElement.innerHTML += `<a href="#" id="popup-closer" class="ol-popup-closer"></a>`
            overlayElement.innerHTML += `<div id="popup-content">
                                            <div class="ol-popup-title">연속 지적도 정보</div>
                                                <code class="code">${evt.coordinate}<br>주소<br>
                                                    <div class="leftBottom__etcBtn">
                                                        <ul>
                                                            <li class="select customSelect">
                                                                <p>${geoInfoObject.properties.addr}</p>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </code>
                                                <br>
                                                <div>공시지가 : ${geoInfoObject.properties.jiga != "" ? geoInfoObject.properties.jiga.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : "--"}&#8361;, 지목 : ${geoInfoObject.properties.jibun.slice(-1)}</div>
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
            //console.log(res);
            //console.log(ol.proj.transform([res.documents[0].x, res.documents[0].y], "EPSG:4326", "EPSG:3857"));
            const corrdinate = ol.proj.transform([res.documents[0].address.x, res.documents[0].address.y], 'EPSG:4326', 'EPSG:3857');
            map.getView().setCenter(corrdinate);
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
        $(swipe).css("visibility", "visible")
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
        $(swipe).css("visibility", "visible")
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
        $(swipe).css("visibility", "visible")
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
        $(swipe).css("visibility", "visible")
        break;
      default:
        // 데이터 없음 선택 시 로직
        if(swipeLayer){
            map.removeLayer(swipeLayer)
        }   
        $(swipe).css("visibility", "hidden")
        return;
    }
    map.addLayer(swipeLayer)
    swipeLayer.on('prerender', function (event) {
        const ctx = event.context;
        const mapSize = map.getSize();
        const width = mapSize[0] * (swipe.value / 100);
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

swipe.addEventListener('input', function () {
    map.render();
});

var printControl = new ol.control.PrintDialog({ 
    lang : "ko",
    scales : false,
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
        var pdf = new jsPDF({
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
                <tr onclick="clickGeoData(event)" style="cursor:pointer">
                    <td scope="row" colspan="3" class="address-name">
                        <span data-geo-url="${response.response.result.items[i].geometry}" data-coord="${response.response.result.items[i].point.x}, ${response.response.result.items[i].point.y}">(${response.response.result.items[i].id}) ${addHighlight(response.response.result.items[i].title, searchQuery)}</span>
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
                <tr onclick="clickGeoData(event)" style="cursor:pointer">
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
    if (target.tagName.toLowerCase() === 'span') {
        // data-coord 속성의 값을 가져옵니다.
        const coords = target.getAttribute('data-coord');

        const coordinates = coords.split(", ")
        map.getView().setCenter([parseFloat(coordinates[0]), parseFloat(coordinates[1])]);
        if(map.getView().getZoom() < 14){
            map.getView().setZoom(14)
        }
    }
}

function clickGeoData(event){
    const target = event.target;

    // 클릭한 요소가 <span>인지 확인합니다.
    if (target.tagName.toLowerCase() === 'span') {
        const coords = target.getAttribute('data-coord');
        const geoUrl = target.getAttribute('data-geo-url');

        console.log(geoUrl)
        // 콘솔에 출력하여 확인합니다.
        if(coords){
            const coordinates = coords.split(", ")
            map.getView().setCenter([parseFloat(coordinates[0]), parseFloat(coordinates[1])]);
            if(map.getView().getZoom() < 14){
                map.getView().setZoom(14)
            }
        }

        $.ajax({
            url: geoUrl,
            type: 'GET',
            dataType: "jsonp",
            async : false,
            jsonp: 'callback',
            success: function(data) {
                console.log(data)
                // if(data.response.status != "OK"){
                //     return;
                // }
                // var geoInfoObject = data.response.result.featureCollection.features[0];
                // var geojsonObject = geoInfoObject.geometry;
                 
                // var vectorSource = new ol.source.Vector({
                //     features: (new ol.format.GeoJSON()).readFeatures(geojsonObject)
                // });
                // vectorSource.set("ctp_kor_nm",data.response.result.featureCollection.features[0].properties.ctp_kor_nm); 
                // vectorSource.set("ctp_eng_nm",data.response.result.featureCollection.features[0].properties.ctp_eng_nm); 
                // //layer.getSource().getKeys()로 확인
    
                // var vectorStyle = new ol.style.Style({
                //     fill: new ol.style.Fill({
                //         color: 'rgba(135,206,250, 0.5)', // Skyblue color fill with opacity
                //     }),
                //     stroke: new ol.style.Stroke({
                //         color: 'orange', // Orange stroke color
                //         width: 2
                //     }),
                // });
                 
                // var vector_layer = new ol.layer.Vector({
                //   source: vectorSource,
                //   style: vectorStyle
                // })
                // vector_layer.set("ctp_kor_nm_layer",data.response.result.featureCollection.features[0].properties.ctp_kor_nm+"_layer");
                // //layer.getKeys() 로 확인
                 
                // map.addLayer(vector_layer);
                // clickCurrentLayer = vector_layer
    
                // var overlayElement = document.createElement('div');
                // overlayElement.className = "ol-popup";
                // overlayElement.innerHTML += `<a href="#" id="popup-closer" class="ol-popup-closer"></a>`
                // overlayElement.innerHTML += `<div id="popup-content">
                //                                 <div class="ol-popup-title">연속 지적도 정보</div>
                //                                     <code class="code">${evt.coordinate}<br>주소<br>
                //                                         <div class="leftBottom__etcBtn">
                //                                             <ul>
                //                                                 <li class="select customSelect">
                //                                                     <p>${geoInfoObject.properties.addr}</p>
                //                                                 </li>
                //                                             </ul>
                //                                         </div>
                //                                     </code>
                //                                     <br>
                //                                     <div>공시지가 : ${geoInfoObject.properties.jiga != "" ? geoInfoObject.properties.jiga.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : "--"}&#8361;, 지목 : ${geoInfoObject.properties.jibun.slice(-1)}</div>
                //                                 </div>`
                // var overlay = new ol.Overlay({
                //     element: overlayElement,
                //     position: evt.coordinate
                // });
                // // Add the overlay to the map
                // map.addOverlay(overlay);
                // clickCurrentOverlay = overlay;
    
                // var deleteButton = overlayElement.querySelector(".ol-popup-closer");
                // deleteButton.addEventListener("click", function () {
                //     map.removeLayer(vector_layer);
                //     map.removeOverlay(clickCurrentOverlay);
                // });
            },
            beforesend: function(){
                 
            },
            error: function(xhr, stat, err) {
                console.log(xhr, stat, err)
            }
          });
    }

}

function addHighlight(html, query){
    return html.replaceAll(query, `<mark style="padding:0px;">${query}</mark>`)
}
