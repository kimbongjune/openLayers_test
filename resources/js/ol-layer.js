/**
 *  @author 김봉준
 *  @date   2023-07-27
 *  지도 서비스의 레이어를 관리하는 파일.
 */


//vworld 기본 타일
const baseLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `http://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/Base/{z}/{y}/{x}.png`,
        serverType: "geoserver",
        crossOrigin: "anonymous",
    }),
    preload: Infinity,
    type: "map",
});

//vworld 문자열 타일
const textLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `http://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/Hybrid/{z}/{y}/{x}.png`,
        crossOrigin: "anonymous",
    }),
    preload: Infinity,
    type: "map",
});

//vworld 위성지도 타일
const satelliteLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `http://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/Satellite/{z}/{y}/{x}.jpeg`,
        crossOrigin: "anonymous",
    }),
    preload: Infinity,
    type: "map",
});

//vworld 회색 지도 타일
const greyLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `http://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/gray/{z}/{y}/{x}.png`,
        crossOrigin: "anonymous",
    }),
    preload: Infinity,
    type: "map",
});

//vworld 야간지도 타일
const midnightLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `http://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/midnight/{z}/{y}/{x}.png`,
        crossOrigin: "anonymous",
    }),
    preload: Infinity,
    type: "map",
});

//추가되는 벡터레이어, 마커 등을 지도 레이어가 가리지 않게 하기위해 지도 레이어의 zIndex를 낮게 설정함
baseLayer.setZIndex(0);
satelliteLayer.setZIndex(0);
textLayer.setZIndex(0);
midnightLayer.setZIndex(0);
greyLayer.setZIndex(0);

//맵의 객체를 컨트롤하기 위한 빈 벡터 레이어
const objectControllVectorLayer = new ol.layer.Vector({
    source: new ol.source.Vector(),
});
objectControllVectorLayer.setZIndex(5);
map.addLayer(objectControllVectorLayer);

//경로탐색 결과에 마우스를 호버 하였을 때 지도에 포인트를 찍기위한 벡터 레이어
let routeSummuryPointStyle = new ol.style.Style({
    image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({
            color: "#D5DCEF",
            width: 2,
        }),
        stroke: new ol.style.Stroke({
            color: "blue",
            width: 2,
        }),
    }),
});

//경로탐색 레이어를 지도위에 표출하기 위한 레이어 소스.
let routeVectorSource = new ol.source.Vector({});
//경로탐색 레이어를 지도위에 표출하기 위한 벡터 레이어
let routeVectorLayer = new ol.layer.Vector({
    source: routeVectorSource,
    style: routeSummuryPointStyle,
});
//경로탐색 레이어는 다른 벡터레이어보다 높게 있어야 하기에 zIndex 값을 설정함
routeVectorLayer.setZIndex(10);

//맵에 경로탐색 레이어 추가
map.addLayer(routeVectorLayer);

//직선 길이측정 레이어를 지도위에 표출하기 위한 레이어 소스.
const lineSource = new ol.source.Vector();
//직선 길이측정 레이어를 지도위에 표출하기 위한 벡터 레이어
const lineSourceLayer = new ol.layer.Vector({
    source: lineSource,
    style : new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: "rgba(255,0,94)",
            width: 3,
        }),
    }),
});
lineSourceLayer.setZIndex(5);
map.addLayer(lineSourceLayer);

//면적 측정 레이어를 지도위에 표출하기 위한 레이어 소스.
const polygonSource = new ol.source.Vector();
//면적 측정 레이어를 지도위에 표출하기 위한 벡터 레이어
const polygonSourceLayer = new ol.layer.Vector({
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
polygonSourceLayer.setZIndex(5);
map.addLayer(polygonSourceLayer);

//원형 면적 측정 레이어를 지도위에 표출하기 위한 레이어 소스.
const cricleSource = new ol.source.Vector();
//원형 면적 측정 레이어를 지도위에 표출하기 위한 벡터 레이어
const circleSourceLayer = new ol.layer.Vector({
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
circleSourceLayer.setZIndex(5);
map.addLayer(circleSourceLayer);