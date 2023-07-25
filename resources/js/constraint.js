//지도의 최대 줌 레벨
const MAX_ZOOM_LEVEL = 20;
//지도의 최소 줌 레벨
const MIN_ZOOM_LEVEL = 6;
//지도의 최초 줌 레벨
const DEFAULT_ZOOM_LEVEL = 15;

//vworld 건물 레이어 WMS API 요청 아이디
const BUILDING_LAYER_ID = "lt_c_spbd";
//vworld 시도 경계 레이어 WMS API 요청 아이디
const SIDO_LAYER_ID = "lt_c_adsido";
//vworld 시/군/구 경계 레이어 WMS API 요청 아이디
const SIGUNGU_LAYER_ID = "lt_c_adsigg";
//vworld 읍/면/동 경계 레이어 WMS API 요청 아이디
const MYEONDONG_LAYER_ID = "lt_c_ademd";
//vworld 리 경계 레이어 WMS API 요청 아이디
const RI_LAYER_ID = "lt_c_adri";
//vworld 도로 레이어 WMS API 요청 아이디
const ROAD_LAYER_ID = "lt_l_moctlink";
//vworld 연속지적도 WMS API 요청 아이디
const CADASTRAL_MAP_LAYER_ID = "lp_pa_cbnd_bubun";
//vworld 산불위험 예측지도 WMS API 요청 아이디
const MOUNTAIN_FIRE_MAP_LAYER_ID = "lt_c_kfdrssigugrade";
//vworld 소방서관할구역 WMS API 요청 아이디
const FIRESTATION_JURISDICTION = "lt_c_usfsffb";
//vworld 재해위험지구 WMS API 요청 아이디
const DISASTER_DANGER_LAYER_ID = "lt_c_up201";

//vworld API 키를 저장하기 위한 변수.
let VWORLD_API_KEY;

//vworld API 키는 현재 url에 따라 달라지기에 내부망 접속 설정을 위해 두개 발급받고, 상황에 따라 API키를 다르게 사용함
if (window.location.href.includes("192")) {
    VWORLD_API_KEY = "055CF644-B04A-3772-BF8A-B31B9CDD6364";
} else {
    VWORLD_API_KEY = "A5C5E9FF-F9FC-3012-9D01-41A62F369AA7";
}

//kakao API키를 저장하기 위한 변수
const KAKAO_REST_API_KEY = "a75f661f8fd50587142251f0476ef2da";