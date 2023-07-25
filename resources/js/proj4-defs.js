//좌표계 변환을 위한 epsg:5178 좌표계 정의
proj4.defs(
    "EPSG:5178",
    "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=500000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs"
);
//좌표계 변환을 위한 epsg:5179 좌표계 정의
proj4.defs(
    "EPSG:5179",
    "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs "
);
//좌표계 변환을 위한 epsg:5181 좌표계 정의
proj4.defs("EPSG:5181", "+proj=utm +zone=52 +ellps=GRS80 +units=m +no_defs");
//openlayer에 좌표계 정의 내용을 적용
ol.proj.proj4.register(proj4);