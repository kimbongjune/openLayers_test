
//현재시간에서 20분 전 시간을 얻어오는 함수. 레이더 API가 바로 반영되지 않음
function getTwentyMinutesBefore() {
    const now = new Date();
    const twentyMinutesAgo = new Date(now.getTime() - 20 * 60000); // 20분(1분 = 60000밀리초) 이전의 시간 계산

    const year = twentyMinutesAgo.getFullYear();
    const month = String(twentyMinutesAgo.getMonth() + 1).padStart(2, "0");
    const day = String(twentyMinutesAgo.getDate()).padStart(2, "0");
    const hours = String(twentyMinutesAgo.getHours()).padStart(2, "0");
    const minutes = String(
        Math.floor(twentyMinutesAgo.getMinutes() / 10) * 10
    ).padStart(2, "0");

    const twentyMinutesBefore = year + month + day + hours + minutes;
    return twentyMinutesBefore;
}

//초를 시간 + 분으로 만들어주는 함수
function convertSecondsToHoursAndMinutes(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

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
    const kilometers = totalMeters / 1000;
    const meters = totalMeters % 1000;
    if (kilometers < 1) {
        return meters + "m";
    } else {
        return kilometers.toFixed(1) + "km";
    }
}

//base64로 인코딩되고, 압축되어있는 csv 데이터를 디코딩하고 압축을 해제하는 함수. 2차원 배열로 반환된다.
function decodeCAPPIData(cappiCompressData) {
    // BASE64 디코딩
    const decodedData = atob(cappiCompressData);

    // 압축 해제
    const compressedData = Uint8Array.from(decodedData, (c) => c.charCodeAt(0));
    const decompressedData = pako.inflate(compressedData, { to: "string" });

    // CSV 데이터로 변환
    const csvData = decompressedData.split("\n").map((row) => row.split(","));

    return csvData;
}

//레이더 좌표를 4326 좌표계로 변환하는 함수. api 응답객체의 값을 이용해 2진 좌표계에 실제 좌표계를 대입한다.
function assignCoordinates(startLon, startLat, gridKm, csvData, xdim, ydim, altitude) {
    const dataWithCoords = [];
    for (let i = 0; i < ydim; i++) {
        const row = csvData[i];
        for (let j = 0; j < xdim; j++) {
            if (row[j] == -127 || row[j] == -128) {
                continue;
            }
            //cappi 고도를 고려하여 피타고라스 정리를 이용해 거리를 재 계산한다.
            const realDistance = Math.sqrt(
                Math.pow(gridKm * j, 2) + Math.pow(altitude, 2)
            );
            // 좌표 할당
            const point = turf.destination(
                [startLon, startLat],
                realDistance,
                90,
                {
                    units: "kilometers",
                }
            );
            const lon = point.geometry.coordinates[0];
            // 좌표와 함께 데이터 저장
            dataWithCoords.push({
                lon: lon,
                lat: startLat,
                value: row[j],
            });
        }
        const realDistance = Math.sqrt(
            Math.pow(gridKm * i, 2) + Math.pow(altitude, 2)
        );
        const point = turf.destination([startLon, startLat], gridKm, 0, {
            units: "kilometers",
        });
        startLat = point.geometry.coordinates[1];
    }
    return dataWithCoords;
}

//4326 배열 데이터를 geoJson 형태로 변환하는 함수
function toGeoJSON(data) {
    const features = data.map(function (d) {
        return {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [d.lon, d.lat],
            },
            properties: {
                value: d.value,
            },
        };
    });

    return {
        type: "FeatureCollection",
        features: features,
    };
}

//카카오 좌표를 행정구역으로 변환하는 API를 호출하는 함수
async function reverseGeoCodingToRegion(coordinateX, coordinateY) {
    try {
        const response = await axios.get("https://dapi.kakao.com/v2/local/geo/coord2regioncode.json", {
            params: {
                x: coordinateX,
                y: coordinateY
            },
            headers: {
                "Authorization": `KakaoAK ${KAKAO_REST_API_KEY}`
            }
        });

        const res = response.data;

        addressInfo.innerHTML = `${res.documents[1].address_name}`;
        const depth1Address = res.documents[1].region_1depth_name;
        const depth2Address =
            res.documents[1].region_1depth_name == "세종특별자치시"
                ? "세종시"
                : res.documents[1].region_2depth_name;
        const depth3Address = res.documents[1].region_3depth_name;
        findCodeByNames(depth1Address, depth2Address, depth3Address);
    } catch (error) {
        addressInfo.innerHTML = "주소를 찾을 수 없습니다.";
    }
}

//카카오 좌표를 상세 주소로 변환하는 API를 호출하는 함수
async function reverseGeoCoding(coordinateX, coordinateY) {
    let result = "";

    try {
        const response = await axios.get("https://dapi.kakao.com/v2/local/geo/coord2address.json", {
            params: {
                x: coordinateX,
                y: coordinateY,
            },
            headers: {
                'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}`
            },
        });

        const res = response.data;

        if (res.documents.length < 1) {
            result = "주소를 찾을 수 없습니다.";
        } else {
            result = res.documents[0].road_address !== null
                ? res.documents[0].road_address.address_name
                : res.documents[0].address.address_name;
        }
    } catch (error) {
        result = "주소를 찾을 수 없습니다.";
    }

    return result;
}

//spectrum 라이브러리 초기화 함수
function initSpectrum() {
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
}

//지도에서 주어진 거리를 지구의 구형을 적용하여 실제 길이를 게산하는 함수
function formatLength(line) {
    const length = ol.sphere.getLength(line);
    let output;
    let outputUnit;
    if (length > 100) {
        output = Math.round((length / 1000) * 100) / 100;
        outputUnit = "km";
    } else {
        output = Math.round(length * 100) / 100;
        outputUnit = "m";
    }
    return [output, outputUnit];
}

//주어진 숫자를 km / m로 변환하는 함수
function convertingLength(line) {
    let output;
    let outputUnit;
    if (line > 1000) {
        output = Math.round((line / 1000) * 100) / 100;
        outputUnit = "km";
    } else {
        output = Math.round(line * 100) / 100;
        outputUnit = "m";
    }
    return [output, outputUnit];
}

//주어진 숫자를 km^ / m^로 변환하는 함수
function convertingMeasure(area) {
    let output;
    let outputUnit;
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

//지도에서 주어진 면적을 지구의 구형을 적용하여 실제 면적을 게산하는 함수
function formatArea(polygon) {
    const area = ol.sphere.getArea(polygon);
    let output;
    let outputUnit;
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

//지도에서 주어진 구형 면적/반경 을 지구의 구형을 적용하여 실제 구형 면적/반경을 게산하는 함수
function formatCircleArea(polygon) {
    const radiusInMeters = new ol.geom.Polygon.fromCircle(polygon, 100);
    const area = ol.sphere.getArea(radiusInMeters);
    let distance = Math.sqrt(area / Math.PI);
    let output;
    let outputUnit;
    let distanceUnit;
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

//지도 canvas의 특정 영역을 pdf로 저장하는 함수
function saveExtentAsPdf() {
    const extent = extentInteraction.getExtent();
    if (extent) {
        const mapCanvas = document.querySelector(".ol-viewport canvas");

        // 1. Convert extent to pixel coordinates
        const bottomLeft = map.getPixelFromCoordinate(
            ol.extent.getBottomLeft(extent)
        );
        const topRight = map.getPixelFromCoordinate(
            ol.extent.getTopRight(extent)
        );

        // 2. Clip the part of the map canvas within the extent
        const width = topRight[0] - bottomLeft[0];
        const height = bottomLeft[1] - topRight[1];
        const clippedCanvas = document.createElement("canvas");
        clippedCanvas.width = width;
        clippedCanvas.height = height;
        const clippedContext = clippedCanvas.getContext("2d");
        clippedContext.drawImage(
            mapCanvas,
            bottomLeft[0],
            topRight[1],
            width,
            height,
            0,
            0,
            width,
            height
        );

        const format = document.getElementById("format").value;

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
        const pdf = new jspdf.jsPDF("landscape", undefined, format);
        const imgData = clippedCanvas.toDataURL("image/png");
        pdf.addImage(imgData, "JPEG", 0, 0, dim[0], dim[1]);

        // Save the PDF
        pdf.save("map.pdf");
    }
}

//지도 canvas의 특정 영역을 이미지로 저장하는 함수
function saveExtentAsImage() {
    const extent = extentInteraction.getExtent();
    if (extent) {
        const mapCanvas = document.querySelector(".ol-viewport canvas");

        // 1. Convert extent to pixel coordinates
        const bottomLeft = map.getPixelFromCoordinate(
            ol.extent.getBottomLeft(extent)
        );
        const topRight = map.getPixelFromCoordinate(
            ol.extent.getTopRight(extent)
        );

        // 2. Clip the part of the map canvas within the extent
        const width = topRight[0] - bottomLeft[0];
        const height = bottomLeft[1] - topRight[1];
        const clippedCanvas = document.createElement("canvas");
        clippedCanvas.width = width;
        clippedCanvas.height = height;
        const clippedContext = clippedCanvas.getContext("2d");
        clippedContext.drawImage(
            mapCanvas,
            bottomLeft[0],
            topRight[1],
            width,
            height,
            0,
            0,
            width,
            height
        );

        // 3. Convert the clipped canvas to an image
        const image = new Image();
        image.src = clippedCanvas.toDataURL("image/png");
        image.onload = function () {
            // Create a link for downloading the image
            const link = document.createElement("a");
            link.href = image.src;
            link.download = "map.png";
            link.style.display = "none";
            link.click();
        };
    }
}