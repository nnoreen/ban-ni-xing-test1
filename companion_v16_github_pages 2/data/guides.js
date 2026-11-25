"use strict";

const busRoutePlanFrame = {
  image: "assets/guides/bus-app-plan.webp", width: 997, height: 2108, marks: [
    [12.5, 14.1, 72, 7.4, "填起點和終點"],
    [91, 14, 2, 1, "點放大鏡查詢", "left"],
    [8, 89.5, 83, 1, "比較所需時間和車資"],
  ]
};

const railMachinePaymentFrames = [
  { image: "assets/guides/TRA_step_05.webp", width: 1448, height: 1086, marks: [
    [42, 49, 27, 2, "點選＋或−調整數量", "below"],
    [79, 89, 17, 2, "點確定", "left"],
  ] },
  { image: "assets/guides/TRA_step_06.webp", width: 1448, height: 1086, marks: [
    [12, 17.2, 76, 1, "核對車次與金額"],
    [20, 65, 75, 2, "選付款方式"],
    [85, 91, 11, 2, "點確定", "left"],
  ] },
];

const VISUAL_GUIDES = {
  "bus/arrival": {
    title: "台北等公車APP指南",
    channel: "台北等公車 App 畫面",
    showNotes: true,
    frames: [
      { image: "assets/guides/bus-app-home.webp", width: 1206, height: 2622,
        callouts: [[5.2, 70.9, "查詢如何從Ａ到Ｂ", "large"]], marks: [
        [9.2, 55.8, 37, 2, "查到站時間", "large"],
      ] },
      { image: "assets/guides/bus-app-search.webp", width: 997, height: 2108,
        inset: { image: "assets/guides/bus-app-more-keys.webp", width: 936, height: 516,
          arrowPath: "M128 1870 C388 1740 463 1455 350 1238 M344 1265 L350 1238 L375 1250" },
        rings: [[3.7, 88.6, 18.5, 5.8]], callouts: [[31, 76.5, "點「更多」查看其他路線", "large"]], marks: [
        [15.5, 8.7, 76, 4, "輸入公車路線", "below"],
      ] },
      { image: "assets/guides/bus-app-arrival.webp", width: 997, height: 2108,
        finishLabel: "我懂了",
        rings: [[6, 72.1, 20, 4.8], [68.5, 42.1, 22.2, 4.7, "公車車牌號碼", "single-ink"]],
        marks: [
        [9, 14, 85, 2.4, "選擇搭車方向", "inset"],
        [4.6, 73.3, 90.4, 2, "預計幾分鐘到這站", "right"],
      ] },
    ]
  },
  "metro/fare": {
    buttonLabel: "台北等公車APP指南",
    showNotes: true,
    frames: [
      { image: "assets/guides/metro-app-fare.webp", width: 997, height: 2108,
        channel: "愛心（敬老）票價・台北車站起算", marks: [
        [35.5, 13, 28, 3.2, "選愛心（敬老）", "below"],
      ] },
      { image: "assets/guides/metro-app-time.webp", width: 997, height: 2108,
        channel: "行駛時間・亞東醫院起算", finishLabel: "我懂了", marks: [
        [64.5, 13, 28, 3.2, "選行駛時間", "below"],
      ] },
    ]
  },
  "metro/buy": {
    title: "現場機台購票",
    channel: "捷運售票機畫面",
    official: "metroFare",
    showNotes: true,
    frames: [
      { image: "assets/guides/metro-machine-1.webp", width: 1448, height: 1086, marks: [
        [4.2, 94, 23, 1, "輕觸開始"],
      ] },
      { image: "assets/guides/metro-machine-2.webp", width: 1448, height: 1086, marks: [
        [59, 70.2, 18, 2, "點單程票"],
      ] },
      { image: "assets/guides/metro-machine-3.webp", width: 1448, height: 1086, marks: [
        [56, 42, 33, 4, "選單程票價"],
        [60.8, 51.5, 33, 4, "路網圖可查票價"],
        [40, 77.2, 28, 1, "選購買張數", "below"],
      ] },
      { image: "assets/guides/metro-machine-4.webp", width: 1448, height: 1086,
        note: "請先選擇到達站，系統才會顯示對應票價。",
        marks: [] },
      { image: "assets/guides/metro-machine-5.webp", width: 1448, height: 1086, marks: [
        [52.5, 53, 35, 2, "付款後取票與找零"],
      ] },
    ]
  },
  "rail/time": {
    buttonLabel: "台北等公車APP指南",
    title: "時刻查詢",
    channel: "台北等公車 App 畫面",
    showNotes: true,
    frames: [
      { image: "assets/guides/taipei-bus-app-home.webp", width: 997, height: 2108,
        rings: [[54.7, 18.5, 12.6, 8.2]], marks: [
        [53, 17.2, 14, 2, "點火車"],
      ] },
      { image: "assets/guides/rail-app-time-search.webp", width: 997, height: 2108, marks: [
        [8, 17.8, 71, 10, "選出發站與到達站", "right"],
        [8, 32.3, 70, 6, "選日期與時間", "right"],
        [8, 47.8, 76, 4, "點查詢時刻", "below"],
      ] },
      { image: "assets/guides/rail-app-time-results.webp", width: 997, height: 2108, marks: [
        [8.5, 56.3, 66, 3, "點車次看各站時間"],
      ] },
      { image: "assets/guides/rail-app-time-stops.webp", width: 997, height: 2108,
        rings: [[45.5, 18.4, 43, 2.8]], marks: [
        [7, 94, 64, .5, "看各站到站與離站時間", "below"],
      ] },
    ]
  },
  "rail/buy": {
    title: "現場機台購票",
    channel: "模擬現場機台畫面",
    official: "railMachine",
    showNotes: true,
    frames: [
      { image: "assets/guides/TRA_step_01.webp", width: 1448, height: 1086, marks: [
        [9, 15, 24, 2, "點購買車票"],
      ] },
      { image: "assets/guides/TRA_step_02.webp", width: 1448, height: 1086, marks: [] },
      { image: "assets/guides/TRA_step_03.webp", width: 1448, height: 1086, marks: [
        [34, 28, 30, 2, "選起站與到達站"],
        [78, 89, 18, 2, "點確定", "left"],
      ] },
      { image: "assets/guides/TRA_step_04.webp", width: 1448, height: 1086, rings: [[89.2, 61.3, 6.7, 8.8]], marks: [
        [93, 91.5, 2, 2, "點右側票券", "left"],
      ] },
      ...railMachinePaymentFrames,
    ],
    unreservedFrames: [
      { image: "assets/guides/rail-machine-local-start.webp", width: 1448, height: 1086, marks: [
        [5, 39, 16, 8, "選起站與到達站"],
      ] },
      { image: "assets/guides/rail-machine-local-destination.webp", width: 1544, height: 1018, marks: [
        [41, 40, 17, 5, "選起站與到達站"],
      ] },
      ...railMachinePaymentFrames,
    ]
  },
  "hsr/time": {
    buttonLabel: "台北等公車APP指南",
    channel: "台北等公車 App 畫面",
    showNotes: true,
    frames: [
      { image: "assets/guides/taipei-bus-app-home.webp", width: 997, height: 2108,
        rings: [[77, 18.5, 12.6, 8.2]], marks: [
        [74, 17.2, 14, 2, "點高鐵"],
      ] },
      { image: "assets/guides/hsr-app-time-board.webp", width: 997, height: 2108, marks: [
        [34, 14.2, 48, 1, "選要查的車站"],
        [5, 19, 34, 2, "看是北上還是南下", "below"],
      ] },
      { image: "assets/guides/hsr-app-time-board.webp", width: 997, height: 2108,
        channel: "日期與起始車站", finishLabel: "我懂了",
        rings: [[74.3, 8.1, 8.8, 4.1], [87.8, 8.1, 6.8, 4.1]],
        callouts: [[30, 8.7, "左邊選日期與時間"], [57, 12.6, "右邊選起始車站"]],
        marks: [] },
    ]
  },
  "hsr/buy": {
    buttonLabel: "T-EX App指南",
    channel: "T-EX App・使用者提供範例",
    official: "hsrApp",
    showNotes: true,
    frames: [
      { image: "assets/guides/hsr-buy-1.webp", width: 729, height: 1421, marks: [
        [14.13, 25.33, 72.7, 6.9, "選起訖站"],
        [15.09, 39.41, 70.51, 6.12, "選日期與時間"],
        [15.23, 53.62, 70.51, 5.91, "選票種和張數", "right"],
        [14.81, 75.3, 70.78, 4.43, "點查詢"],
      ] },
      { image: "assets/guides/hsr-buy-2.webp", width: 729, height: 1421, marks: [
        [9.88, 60.17, 80.11, 11.26, "選要搭的車次"],
        [10.56, 88.04, 79.42, 4.57, "可看更早或更晚車次"],
      ] },
      { image: "assets/guides/hsr-buy-3.webp", width: 729, height: 1421, codeExampleStep: 3, marks: [
        [13.99, 16.68, 72.7, 3.8, "填證件資料"],
        [13.85, 28.57, 72.84, 13.23, "填聯絡資料"],
        [14.27, 49.47, 72.43, 27.94, "會員資料可留空"],
        [13.85, 78.82, 72.84, 5.35, "填畫面上的驗證碼"],
        [15.5, 88.53, 68.59, 4.43, "送出訂位"],
      ] },
      { image: "assets/guides/hsr-buy-4.webp", width: 729, height: 1421, marks: [
        [13.31, 62.56, 74.35, 3.59, "核對金額"],
        [9.3, 70.3, 77.53, 5.14, "閱讀後勾選"],
        [16.32, 77.48, 67.76, 4.57, "確認車次", "below"],
      ] },
      { image: "assets/guides/hsr-buy-5.webp", width: 729, height: 1421, finishLabel: "我懂了", marks: [
        [14.27, 22.73, 34.57, 11.82, "看付款期限"],
        [16.19, 50.04, 53.22, 4.15, "沒有點數或優惠券可跳過"],
        [51.3, 87.47, 37.04, 4.08, "立即付款"],
      ] },
    ]
  },
};
