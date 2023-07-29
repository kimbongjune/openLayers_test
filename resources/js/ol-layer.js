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


//CCTV 레이어 토글 함수.
function cctvLayerChange(treeNode, treeId) {
    if (treeNode.checked) {
        addCctvLayer(treeNode, treeId);
    } else {
        removeCctvLayer();
    }
}

//CCTV 레이어 표출 함수.
async function addCctvLayer(treeNode, treeId) {
    const treeObj = $.fn.zTree.getZTreeObj(treeId);
    treeObj.setChkDisabled(treeNode, true, false, false);
    //대한민국 전역을 Extent로 잡기 위해 좌표를 고정하였음
    const extent4326 = ol.proj.transformExtent(
        KOREA_EXTENT,
        "EPSG:3857",
        "EPSG:4326"
    );

    let url = `https://openapi.its.go.kr:9443/cctvInfo?`;
    url += `type=all`;
    url += `&cctvType=1`;
    url += `&minX=${extent4326[0]}`;
    url += `&maxX=${extent4326[2]}`;
    url += `&minY=${extent4326[1]}`;
    url += `&maxY=${extent4326[3]}`;
    url += `&getType=json`;
    url += `&apiKey=12a08608b49a43f0a4f4a6fb1d838d8b`;
    // Add geomFilter if you want to limit CCTV data to a certain area

    try {
        const res = await axios.get(url);

        //console.log(data.response.datacount)
        if (res.data.response.datacount <= 0) {
            return;
        }
        const cctvSource = new ol.source.Vector({});

        for (let i = 0; i < res.data.response.data.length; i++) {
            let feature = res.data.response.data[i];

            let cctvFeature = new ol.Feature({
                geometry: new ol.geom.Point(
                    ol.proj.transform(
                        [feature.coordx, feature.coordy],
                        "EPSG:4326",
                        "EPSG:3857"
                    )
                ),
                cctvname: feature.cctvname,
                cctvformat: feature.cctvformat,
                cctvurl: feature.cctvurl,
                cctvFeature: true,
            });

            cctvSource.addFeature(cctvFeature);
        }

        const clusterSource = new ol.source.Cluster({
            distance: 30,
            source: cctvSource,
        });

        clusterLayer = new ol.layer.AnimatedCluster({
            name: "Cluster",
            source: clusterSource,
            animationDuration: 400,
            style: getCctvClusterLayerStyle,
        });

        clusterLayer.setZIndex(5);
        map.addLayer(clusterLayer);
        treeObj.setChkDisabled(treeNode, false, false, false);
    } catch (err) {
        treeObj.setChkDisabled(treeNode, false, false, false);
        treeObj.checkNode(treeNode, false, false);
        const parentNode = treeNode.getParentNode();
        let allChildrenUnchecked = parentNode.children.every((child) => {
            return !child.checked;
        });
    
        if (allChildrenUnchecked) {
            // 모든 자식 노드가 체크 해제된 상태라면 부모 노드도 체크 해제
            treeObj.checkNode(parentNode, false, true);
        }
        alert("CCTV api 호출에 실패하였습니다.");
    }
}

//CCTV 레이어 제거 함수.
function removeCctvLayer() {
    if (clusterLayer) {
        map.removeLayer(clusterLayer);
        clusterLayer = null;
    }
}


//기상 레이더 레이어 토글 함수
async function radarLayerChange(treeNode, treeId) {
    const treeObj = $.fn.zTree.getZTreeObj(treeId);
    if (treeNode.checked) {
        try {
            treeObj.setChkDisabled(treeNode, true, false, false);

            const url = "http://apis.data.go.kr/1360000/RadarObsInfoService/getNationalRadarRn";
            const serviceKey ="myYHhhNxJO5zGLT39cjBldHCap4TWme/JU4ubw5WcPfX0CX5CIFLuEA6N0zH115SujHcKBLUbGsxo/Nn8jIVDw==";
            const pageNo = 1;
            const numOfRows = 10;
            const dataType = "json";
            const qcType = "NQC"; // 실제 값을 지정하세요
            const compType = "M"; // 실제 값을 지정하세요
            const dateTime = getTwentyMinutesBefore(); // 실제 값을 지정하세요

            if (webGlVectorLayer) {
                map.removeLayer(webGlVectorLayer);
            }

            const response = await axios.get(url, {
                params: {
                    ServiceKey: serviceKey,
                    pageNo: pageNo,
                    numOfRows: numOfRows,
                    dataType: dataType,
                    qcType: qcType,
                    compType: compType,
                    dateTime: dateTime,
                },
            });

            const data = response.data;
            if (!data.response.header || data.response.header.resultCode != "00") {
                treeObj.setChkDisabled(treeNode, false, false, false);
                return alert("api 호출 에러");
            }

            const csvData = decodeCAPPIData(
                data.response.body.items.item[0].cappiCompressData
            );

            const startLon = data.response.body.items.item[0].lon;
            const startLat = data.response.body.items.item[0].lat;
            const gridKm = data.response.body.items.item[0].gridKm;

            const xdim = data.response.body.items.item[0].xdim;
            const ydim = data.response.body.items.item[0].ydim;

            const altitude = data.response.body.items.item[0].altitudeKm;

            const dataWithCoords = assignCoordinates(
                startLon,
                startLat,
                gridKm,
                csvData,
                xdim,
                ydim,
                altitude
            );

            const geojsonData = toGeoJSON(dataWithCoords);

            const geoJsonFeatures = geojsonFormat.readFeatures(
                geojsonData,
                {
                    dataProjection: "EPSG:4326",
                    featureProjection: "EPSG:3857",
                }
            );

            const getJsonSource = new ol.source.Vector({
                features: geoJsonFeatures,
            });

            webGlVectorLayer = new ol.layer.WebGLPoints({
                preload: Infinity,
                source: getJsonSource,
                style: webGlStyle,
                blur: 2,
            });
            webGlVectorLayer.setZIndex(5);
            map.addLayer(webGlVectorLayer);
            treeObj.setChkDisabled(treeNode, false, false, false);
        } catch (error) {
            console.log(error)
            treeObj.setChkDisabled(treeNode, false, false, false);
            treeObj.checkNode(treeNode, false, false);
            const parentNode = treeNode.getParentNode();
            let allChildrenUnchecked = parentNode.children.every((child) => {
                return !child.checked;
            });
        
            if (allChildrenUnchecked) {
                // 모든 자식 노드가 체크 해제된 상태라면 부모 노드도 체크 해제
                treeObj.checkNode(parentNode, false, true);
            }
            alert("레이더 api 호출에 실패하였습니다.");
        }
    } else {
        if (webGlVectorLayer) {
            map.removeLayer(webGlVectorLayer);
        }
    }
}

//건물 레이어 토글 함수
function buildLayerChange(e) {
    if (e) {
        if (buildingLayer) {
            map.removeLayer(buildingLayer);
            buildingLayer = null;
        }
        buildingLayer = requestWmsLayer(BUILDING_LAYER_ID);
    } else {
        if (buildingLayer) {
            map.removeLayer(buildingLayer);
            buildingLayer = null;
        }
    }
}

//시도 경계 레이어 토글 함수
function sidoLayerChange(e) {
    if (e) {
        if (sidoLayer) {
            map.removeLayer(sidoLayer);
            sidoLayer = null;
        }
        sidoLayer = requestWmsLayer(SIDO_LAYER_ID);
    } else {
        if (sidoLayer) {
            map.removeLayer(sidoLayer);
            sidoLayer = null;
        }
    }
}

//시 군 구 경계 레이어 토글 함수
function sigunLayerChange(e) {
    if (e) {
        if (sigunguLayer) {
            map.removeLayer(sigunguLayer);
            sigunguLayer = null;
        }
        sigunguLayer = requestWmsLayer(SIGUNGU_LAYER_ID);
    } else {
        if (sigunguLayer) {
            map.removeLayer(sigunguLayer);
            sigunguLayer = null;
        }
    }
}

//읍 면 동 경계 레이어 토글 함수
function dongLayerChange(e) {
    if (e) {
        if (myeondongLayer) {
            map.removeLayer(myeondongLayer);
            myeondongLayer = null;
        }
        myeondongLayer = requestWmsLayer(MYEONDONG_LAYER_ID);
    } else {
        if (myeondongLayer) {
            map.removeLayer(myeondongLayer);
            myeondongLayer = null;
        }
    }
}

//리 경계 레이어 토글 함수
function riLayerChange(e) {
    if (e) {
        if (riLayer) {
            map.removeLayer(riLayer);
            riLayer = null;
        }
        riLayer = requestWmsLayer(RI_LAYER_ID);
    } else {
        if (riLayer) {
            map.removeLayer(riLayer);
            riLayer = null;
        }
    }
}

//전국 도로 레이어 토글 함수
function roadLayerChange(e) {
    if (e) {
        if (roadLayer) {
            map.removeLayer(roadLayer);
            roadLayer = null;
        }
        roadLayer = requestWmsLayer(ROAD_LAYER_ID);
    } else {
        if (roadLayer) {
            map.removeLayer(roadLayer);
            roadLayer = null;
        }
    }
}

//연속지적도 레이어 토글 함수
function cadastralLayerChange(e) {
    if (e) {
        if (cadastralMapLayer) {
            map.removeLayer(cadastralMapLayer);
            cadastralMapLayer = null;
        }
        cadastralMapLayer = requestWmsLayer(CADASTRAL_MAP_LAYER_ID);
    } else {
        if (cadastralMapLayer) {
            map.removeLayer(cadastralMapLayer);
            cadastralMapLayer = null;
        }
    }
}

//vworld wms api 호출 공통 함수
function requestWmsLayer(layerId, layerIndex = 5) {
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
                REQUEST: "getMap",
                EXCEPTIONS: "text/xml",
                TRANSPARENT: true,
                CRS: "EPSG:3857",
                apikey: VWORLD_API_KEY,
                DOMAIN: "http://127.0.0.1:3000/openlayers_test.html",
                FORMAT: "image/png",
            },
        }),
    });
    layer.setZIndex(layerIndex);
    map.addLayer(layer);

    return layer;
}