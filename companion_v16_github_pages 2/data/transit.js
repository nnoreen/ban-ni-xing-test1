"use strict";

const source = (label, url) => ({ label, url });
const hsrArticle = id => "https://www.thsrc.com.tw/ArticleContent/" + id;
const railPage = path => "https://www.railway.gov.tw/tra-tip-web/tip/" + path;
const SOURCES = {
  metroBuy: source("北捷網頁購票", "https://ticket.metro.taipei/"),
  hsrDirect: source("高鐵線上訂票", "https://irs.thsrc.com.tw/IMINT/"),
  bus: source("大臺北公車", "https://ebus.gov.taipei/"),
  busNorth: source("新北低地板公車", "https://www.traffic.ntpc.gov.tw/websitedowndoc?file=traffic%2F202511050931070.pdf&filedisplay=%E6%9C%AC%E5%B8%82%E4%BD%8E%E5%9C%B0%E6%9D%BF%E5%85%AC%E8%BB%8A%E8%B7%AF%E7%B7%9A-%E5%90%88%E4%BD%B5%E7%89%881141028.pdf"),
  busFare: source("雙北公車刷卡", "https://pto.gov.taipei/News_Content.aspx?n=D065CCB1467288C8&s=F559285363C09664&sms=72544237BBE4C5F6"),
  busContact: source("臺北公車資訊", "https://pto.gov.taipei/"),
  metro: source("北捷路線與票價", "https://web.metro.taipei/pages2026/WebRoutePlan"),
  metroPoints: source("雙北捷運扣點", "https://www.metro.taipei/News_Content.aspx?n=566DA580861CEE77&s=41B78C4788395C41&sms=87415A8B9CE81B16"),
  metroQr: source("北捷手機購票", "https://web.metro.taipei/QRCode/multipayment/MetroGOAPPandWeb/purchase.html"),
  metroFare: source("北捷票種", "https://www.metro.taipei/cp.aspx?Create=1&n=CEF54168B23F73B4&s=AD70DC4F6A708EA7"),
  metroAccess: source("北捷無障礙", "https://www.metro.taipei/News_Content.aspx?n=C0EB9D07B84907D9&s=4FDC24D931DE6050"),
  ntMetro: source("新北捷運路線", "https://www.ntmetro.com.tw/"),
  ntMetroFare: source("新北捷運票種", "https://www.ntmetro.com.tw/basic/?node=10102"),
  ntMetroFaq: source("新北捷運問答", "https://www.ntmetro.com.tw/basic/?node=10005"),
  ntMetroAccess: source("新北捷運無障礙", "https://ori-www.ntmetro.com.tw/basic/?node=10041"),
  rail: source("台鐵時刻查詢", "https://tip.railway.gov.tw/tra-tip-web/tip?site_preference=mobile"),
  railMachine: source("台鐵車站購票", railPage("tip00C/tipC21/view?proCode=8ae4cac3756b7b41017572e5974c178b&subCode=8ae4cac3756b7b41017573dc041e1881")),
  railPoints: source("台鐵社福卡扣點", railPage("tip00C/tipC21/view?proCode=8ae4cac388f3efbd0188f764d94406ff&subCode=8ae4cac388f3efbd0188f766b49c0709")),
  railBook: source("台鐵訂票", railPage("tip001/tip121/query")),
  railFare: source("台鐵用票規定", railPage("file/a070f149-f250-4c76-bc64-b321cd832d7c")),
  railHelp: source("台鐵客服", railPage("callCenter")),
  railStation: source("台鐵車站資訊", railPage("tip00H/tipH41/viewStaInfo/1020")),
  hsr: source("高鐵時刻與票價", hsrArticle("a3b630bb-1066-4352-a1ef-58c7b4e8ef7c")),
  hsrBook: source("高鐵網路訂票", hsrArticle("dea241a9-fe69-4e9d-b9a5-6caed6e486d6")),
  hsrMachine: source("高鐵自動售票機", hsrArticle("6be4173c-91dc-4d06-ae3e-a19de420a237")),
  hsrCounter: source("高鐵售票窗口", hsrArticle("43d5e5e2-3777-46b9-bc8f-8b5b579b50ed")),
  hsrApp: source("高鐵手機購票", hsrArticle("4d262503-84bc-4963-a58e-4ca1a6453ad3")),
  hsrFare: source("高鐵票種", hsrArticle("743c51ac-124d-4b1a-a57b-1fd820848032")),
  railAccess: source("台鐵無障礙", railPage("tip00C/tipC21/view?proCode=8ae4cac38c017e9f018c243c41f93326&subCode=8ae4cac38c017e9f018c243cd8673327")),
  hsrAccess: source("高鐵無障礙", hsrArticle("dba4ecd0-5ef0-45d2-aa64-bcecdf7d5fde")),
  hsrContact: source("高鐵客服", hsrArticle("AFAC38BD-AC68-419A-9B7F-E5C0EBCE3CE8")),
  taipei: source("臺北敬老卡申請", "https://dosw.gov.taipei/cp.aspx?n=4683CD9EE2EB68B1"),
  taipeiCare: source("臺北愛心卡申請", "https://dosw.gov.taipei/cp.aspx?n=98EA840859DF5D7F"),
  taipeiUse: source("臺北敬老卡優惠", "https://dosw.gov.taipei/cp.aspx?n=59C18B4C973AED21"),
  taipeiPoints: source("臺北敬老卡點數", "https://dosw.gov.taipei/News_Content.aspx?n=6CA16D3397A7A302&s=EFF9CE431990FCDB"),
  newTaipei: source("新北敬老愛心卡", "https://lkk.ntpc.gov.tw/new/home.jsp?id=aa967983e02a861f"),
  newTaipeiApply: source("新北申辦與優惠", "https://service.ntpc.gov.tw/eservice/CaseData.action?itemId=110026"),
  taoyuanCards: source("桃園敬老愛心卡", "https://sab.tycg.gov.tw/News_Content.aspx?n=7372&s=684795"),
  hsinchuCards: source("新竹市敬老愛心卡", "https://dgservice.hccg.gov.tw/serviceNotice.do?id=18&rule=guest")
};
const task = (title, action, official, guideSource = official, extra = []) => ({ title, action, official, guideSource, extra });
const TRANSIT = {
  bus: { name: "公車", tasks: {
    arrival: task("到站查詢", "直接查詢", "bus")
  } },
  metro: { name: "捷運", tasks: {
    fare: task("票價與乘車時間", "直接查詢", "metro", "metro", ["ntMetroFare"]),
    buy: task("購票", "直接購票", "metroBuy", "metroQr")
  } },
  rail: { name: "台鐵", tasks: {
    time: task("時刻查詢", "直接查詢", "rail"),
    buy: task("購票", "直接購票", "railBook")
  } },
  hsr: { name: "高鐵", tasks: {
    time: task("班次查詢", "直接查詢", "hsr"),
    buy: task("購票", "直接購票", "hsrDirect", "hsrBook")
  } }
};

const railPointTrains = "台鐵可搭區間車、區間快車、莒光號和推拉式自強號。";

const BENEFITS = {
  cards: {
    title: "敬老卡與愛心卡",
    sections: [
      ["", [
        "各縣市政府發卡，主要提供搭車點數或免費乘車優惠。部分縣市也能折抵醫療、運動、觀光或日常消費費用。",
        ['<strong class="benefit-metric">每月 600 點</strong>', "臺北市與新北市自 2026 年 7 月起實施。敬老卡、愛心卡都適用。1 點折 1 元，月底歸零"]
      ], ["newTaipeiApply", "taoyuanCards", "hsinchuCards"], [
        "部分縣市也開放持永久居留證的外籍人士申請。申請敬老卡通常須滿 65 歲，申請愛心卡須取得我國身心障礙證明。"
      ]],
      ["臺北市", [
        ["交通用途", `可折抵指定公車、捷運、計程車、YouBike 和台鐵。${railPointTrains}`],
        ["其他用途", "敬老卡可折抵指定運動中心、醫院門診掛號費和溫泉大眾池。愛心卡加註敬老資格後，可使用同樣的項目。"],
        ["辦理資格", "滿 65 歲（原住民滿 55 歲）戶籍及居住地為臺北市者"],
        ["辦理地點", "臺北市任何一區公所"],
        ["辦理所需資料", "身分證正本、2 吋彩色照片 1 張（原住民另帶戶口名簿）"]
      ], ["taipei", "taipeiCare", "taipeiUse", "taipeiPoints", "railPoints"], [
      ]],
      ["新北市", [
        ["交通用途", `可折抵指定公車、國道客運、捷運、台鐵、計程車和 YouBike；${railPointTrains}`],
        ["其他用途", "可折抵新北市國民運動中心費用，以及市立聯合醫院和各區衛生所的門診掛號費。"],
        ["辦理資格", "滿 65 歲（原住民滿 55 歲）戶籍為新北市者"],
        ["辦理地點", "新北市區公所或掛號寄申請資料"],
        ["辦理所需資料", "申請表、身分證正反面影本、印章、近 3 個月拍的 1 吋照片一張（原住民另準備戶口名簿影本）"]
      ], ["newTaipeiApply", "railPoints"], [
      ]]
    ]
  },
  bus: {
    title: "公車優惠",
    sections: [
      ["臺北市敬老卡", ["在適用的市區公車刷本人敬老卡"], ["taipeiUse"]],
      ["新北市敬老卡", ["可用於新北、臺北、基隆市區公車", "雙北公車上、下車刷同一張卡"], ["newTaipei", "busFare"]]
    ]
  },
  metro: {
    title: "捷運優惠",
    sections: [
      ["臺北市、新北市敬老卡", [
        ['<strong class="benefit-metric">每月 600 點</strong>', "1 點折 1 元，雙北捷運共用，月底歸零"],
        ['<strong class="benefit-metric">4 折</strong>後扣點', "全票 20 元，扣 8 點", "600 點全用於同一車程，可搭 75 趟"],
        ["點數不夠怎麼辦？", "差額扣儲值金，點數用完仍享 4 折"]
      ], ["metroPoints"], []],
      ["臺北捷運", [
        ["未攜帶敬老卡", "可帶身分證明到車站詢問處買敬老單程票"]
      ], ["metroFare"], []]
    ]
  },
  rail: {
    title: "台鐵敬老票",
    sections: [
      ["敬老資格", [
        ['<strong class="benefit-metric">滿 65 歲</strong>', "購票與搭車需攜帶有效身分證明"],
        ['<strong class="benefit-metric">每趟最多 150 點</strong>', [
          "持雙北敬老卡刷卡進出站。",
          "出發或抵達其中一站須在臺北、新北、基隆、桃園或宜蘭。",
          railPointTrains,
          { notice: "普悠瑪、太魯閣和 3000 型自強號不可用" },
          { notice: "點數不夠，差額扣卡片儲值金" }
        ]]
      ], ["railFare", "railBook", "railPoints", "taipeiUse", "newTaipei"], []]
    ]
  },
  hsr: {
    title: "高鐵敬老票",
    sections: [
      ["", [
        ['<strong class="benefit-metric">滿65歲者半價</strong>'],
        ["自助取票先登記", "帶證件正本到高鐵售票窗口登記，隔天起至隔年年底可用 T-EX 高鐵 App 取票，或在車站售票機買票、取票，搭車時也要帶證件正本"]
      ], ["hsrFare", "hsrCounter", "hsrBook", "hsrApp", "hsrMachine"], [
        "已在網路訂票、又還沒完成資格登記，可以帶證件到高鐵站窗口取票。",
        "符合高鐵馬偕計畫的外籍人士，可向售票窗口確認資格。"
      ]]
    ]
  }
};
