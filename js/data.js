/**
 * CTB LECIP MON2 SIMULATOR - ROUTE & SYSTEM DATA
 * Based on authentic Citybus / NWFB LECIP Mon2 specifications and OMSI 2 Mon2 Addon.
 */

const MON2_DATA = {
  // Preset Routes
  routes: [], // 所有路線資料均動態從 Citybus Open Data API 獲取
  posters: [
    {
      id: 1,
      filename: "LECIP_Mon2_Poster_1.png",
      tag: "綠色能源 GREEN HYDROGEN",
      titleZh: "從此氫起未來",
      titleEn: "THE FUTURE IS H2",
      subZh: "只排放純水 • ONLY EMITS WATER",
      subEn: "Zero Emission Hydrogen Double Decker",
      bullets: [
        "全港首輛雙層氫能巴士投入服務",
        "加氫僅需 10-15 分鐘，續航力超卓",
        "運行過程只排放純水，真正綠色出行"
      ],
      descZh: "城巴領航綠色運輸，引進全港首輛雙層氫能巴士，為香港構建零碳排放的清新空氣與潔淨未來。",
      descEn: "Citybus leads green transport with Hong Kong's first hydrogen bus, emitting only water.",
      theme: "h2",
      icon: "h2",
      bgGradient: "linear-gradient(180deg, #E0F7FA 0%, #FFFFFF 50%, #B2EBF2 100%)",
      accentColor: "#0284C7"
    },
    {
      id: 2,
      filename: "LECIP_Mon2_Poster_2.png",
      tag: "$2 搭車優惠 正確使用攻略",
      titleZh: "善用短途車及分段收費",
      titleEn: "Proper Ways to Use $2 Scheme",
      subZh: "長途短搭要避免 • 珍惜公帑善用資源",
      subEn: "Make use of short-haul routes & section fares",
      bullets: [
        "【攻略一】短線行程選乘短途車，避免乘搭長途線",
        "【攻略二】如設雙向分段收費，下車時請再次拍卡"
      ],
      descZh: "善用政府 $2 乘車優惠，短途旅程請盡量選乘短途巴士，若路線設有雙向分段，落車時記得再次拍卡確認！",
      descEn: "Make good use of $2 Scheme. Take short-haul buses for short trips, tap again for section fare.",
      theme: "twodollar",
      icon: "fare",
      bgGradient: "linear-gradient(180deg, #E0F2FE 0%, #FFFFFF 45%, #F0FDF4 100%)",
      accentColor: "#EA580C"
    },
    {
      id: 3,
      filename: "LECIP_Mon2_Poster_3.png",
      tag: "車廂規則 RULES",
      titleZh: "車廂嚴禁吸煙",
      titleEn: "No Smoking on Buses",
      subZh: "包括電子煙及加熱煙草產品",
      subEn: "Including all e-cigarettes and heated products",
      bullets: [
        "法例嚴格規定全車內外均禁止吸煙",
        "違者可被檢控，最高罰款港幣五千元"
      ],
      descZh: "請保持車廂空氣清新，車內包括所有座位及梯間嚴禁吸煙。",
      descEn: "Smoking is strictly prohibited on all buses. Maximum fine HK$5,000.",
      theme: "nosmoking",
      icon: "nosmoking",
      bgGradient: "linear-gradient(180deg, #FFE4E6 0%, #FFFFFF 50%, #FEE2E2 100%)",
      accentColor: "#DC2626"
    },
    {
      id: 4,
      filename: "LECIP_Mon2_Poster_4.png",
      tag: "乘車禮儀 COURTESY",
      titleZh: "請往車廂後方移入",
      titleEn: "Move Towards Upper Deck / Rear",
      subZh: "騰出走廊空間 • 方便乘客上落",
      subEn: "Facilitate other boarding passengers",
      bullets: [
        "上車後請移步至下層車廂後方或上層",
        "請勿堵塞通道及下車門口"
      ],
      descZh: "請發揮禮讓精神，上車後盡量往車廂後方或上層移入，加快靠站效率。",
      descEn: "Please move inside or upstairs to leave aisle clear for other passengers.",
      theme: "moveinside",
      icon: "moveinside",
      bgGradient: "linear-gradient(180deg, #DCFCE7 0%, #FFFFFF 50%, #D1FAE5 100%)",
      accentColor: "#059669"
    },
    {
      id: 5,
      filename: "LECIP_Mon2_Poster_5.png",
      tag: "安全提示 SAFETY",
      titleZh: "請佩戴安全帶",
      titleEn: "Please Fasten Seat Belt",
      subZh: "法例規定 • 全程佩戴",
      subEn: "Mandatory by law where fitted",
      bullets: [
        "當座椅設有安全帶時，乘客必須扣上",
        "保障自身安全，平安抵達目的地"
      ],
      descZh: "行車安全至關重要，就座後請立即扣妥安全帶，切勿在行車期間解開。",
      descEn: "Passengers must fasten seat belts throughout the journey where installed.",
      theme: "seatbelt",
      icon: "seatbelt",
      bgGradient: "linear-gradient(180deg, #DBEAFE 0%, #FFFFFF 50%, #BFDBFE 100%)",
      accentColor: "#2563EB"
    },
    {
      id: 6,
      filename: "LECIP_Mon2_Poster_6.png",
      tag: "關愛共融 CARE",
      titleZh: "請讓座予有需要人士",
      titleEn: "Offer Seat to People in Need",
      subZh: "長者 • 孕婦 • 殘疾人士 • 抱嬰者",
      subEn: "Elderly, pregnant, mobility impaired, with infants",
      bullets: [
        "主動讓出關愛座及就近座位",
        "一句體貼問候，溫暖整個車廂"
      ],
      descZh: "看見身邊有行動不便或有需要人士，請主動讓出座位，共同營造友善關懷空間。",
      descEn: "Please offer priority seats to those in need to build a caring community.",
      theme: "priority",
      icon: "priority",
      bgGradient: "linear-gradient(180deg, #F3E8FF 0%, #FFFFFF 50%, #E9D5FF 100%)",
      accentColor: "#7C3AED"
    },
    {
      id: 7,
      filename: "LECIP_Mon2_Poster_7.png",
      tag: "注入發展動力 FUEL THE CITY",
      titleZh: "特快路線 Express Bus Service",
      titleEn: "Fuel the city dynamics",
      subZh: "把握新基建落成機遇 • 普及東區走廊特快服務",
      subEn: "Signature Express service connecting communities",
      bullets: [
        "90 年代善用東區走廊開辦多條特快路線",
        "特快網絡已成為城巴最鮮明的服務標誌",
        "45 周年不斷創新，為城市注入全新發展動力"
      ],
      descZh: "城巴積極把握新基建機遇，早於90年代善用東區走廊優勢開創多條特快路線，奠定特快巴士服務的行業標竿。",
      descEn: "Citybus pioneered express bus services via Island Eastern Corridor in the 1990s.",
      theme: "express",
      icon: "express",
      bgGradient: "linear-gradient(180deg, #EFF6FF 0%, #FFFFFF 50%, #DBEAFE 100%)",
      accentColor: "#0284C7"
    },
    {
      id: 8,
      filename: "LECIP_Mon2_Poster_8.png",
      tag: "政府長者及合資格殘疾人士 $2 計劃",
      titleZh: "必須使用樂悠咭享用 $2 優惠",
      titleEn: "Must Use JoyYou Card for $2 Scheme",
      subZh: "出行樂悠悠 • 換咭係時候",
      subEn: "It's time to get your JoyYou Card",
      bullets: [
        "60歲或以上香港居民（包括殘疾人士）專用",
        "可透過八達通 App 或郵寄表格遞交申請",
        "及早更換樂悠咭，繼續輕鬆享受 $2 乘車"
      ],
      descZh: "自2024年8月25日起，滿60歲香港居民必須使用專用「樂悠咭」方可享有 $2 乘車優惠，請及早遞交申請換咭！",
      descEn: "Eligible HK residents aged 60+ must use JoyYou Card to enjoy $2 Scheme.",
      theme: "joyyou",
      icon: "joyyou",
      bgGradient: "linear-gradient(180deg, #E0F2FE 0%, #FFFFFF 50%, #E0F7FA 100%)",
      accentColor: "#0284C7"
    },
    {
      id: 9,
      filename: "LECIP_Mon2_Poster_9.png",
      tag: "巴士安全方程式 SAFE JOURNEY",
      titleZh: "一路安全靠晒你",
      titleEn: "Safe Journey Begins with You & Me",
      subZh: "留心 • 禮讓 • 守規則",
      subEn: "Be Attentive • Be Gracious • Abide by the Rules",
      bullets: [
        "【記住要緊握扶手】車未停穩前常握扶手",
        "【有安全帶就要緊扣】法例規定全程佩戴",
        "【咪望手機唔睇路】上下車及梯間留意腳步",
        "【行動不便/拎大袋細袋】避免前往上層"
      ],
      descZh: "乘車安全由你我做起：行車緊握扶手、扣上安全帶、行走不看手機，攜帶大件行李避免前往上層！",
      descEn: "Hold handrail, fasten seat belt, watch your step, avoid upper deck with bulky baggage.",
      theme: "safetyformula",
      icon: "safetyformula",
      bgGradient: "linear-gradient(180deg, #FEF9C3 0%, #FFFFFF 50%, #ECFDF5 100%)",
      accentColor: "#16A34A"
    },
    {
      id: 10,
      filename: "LECIP_Mon2_Poster_10.png",
      tag: "注入發展動力 FUEL THE CITY",
      titleZh: "城巴機場快線 Cityflyer",
      titleEn: "Cityflyer - Premium Airport Journey",
      subZh: "豪華、舒適的巴士服務代名詞",
      subEn: "An essential bridge entering the international hub",
      bullets: [
        "尊尚皮質座椅配備可調校獨立頭枕",
        "設有全車特大行李架及即時閉路電視監察",
        "點對點特快直達港九主要酒店及商業核心區"
      ],
      descZh: "「城巴機場快線」是舒適直達市區的優質服務象徵，亦是帶領海內外旅客抵達國際金融中心的首要空中陸路樞紐。",
      descEn: "Cityflyer represents premium travel between Hong Kong Airport and urban hubs.",
      theme: "cityflyer",
      icon: "cityflyer",
      bgGradient: "linear-gradient(180deg, #FFF1F2 0%, #FFFFFF 50%, #FFE4E6 100%)",
      accentColor: "#7A0016"
    },
    {
      id: 11,
      filename: "LECIP_Mon2_Poster_11.png",
      tag: "加入我們 JOIN US",
      titleZh: "車長為城市添上動力",
      titleEn: "Bus Captain - Serving the City",
      subZh: "全職平均月入可達 $28,000 • 半日制 $16,700",
      subEn: "Welcome to join the Citybus family",
      bullets: [
        "迎新獎金高達 $12,000，巴士牌獎金 $5,000",
        "提供全薪有薪巴士牌照考試與專業培訓",
        "年滿21歲並持有私家車牌滿1年即可申請！"
      ],
      descZh: "城巴盛情招募全職及半日制車長！福利豐厚、彈性工時、享有完善培訓與晉升機會，即刻致電或 WhatsApp 5562 2152 報名！",
      descEn: "Join Citybus as Bus Captain! Paid driving training and generous bonuses provided.",
      theme: "recruitment",
      icon: "recruitment",
      bgGradient: "linear-gradient(180deg, #FEF08A 0%, #FFFFFF 45%, #E0F2FE 100%)",
      accentColor: "#CA8A04"
    },
    {
      id: 12,
      filename: "LECIP_Mon2_Poster_12.png",
      tag: "轉乘優惠 TRANSFER SCHEMES",
      titleZh: "巴士轉乘優惠計劃 (BBI)",
      titleEn: "Bus-Bus Interchange Discounts",
      subZh: "精明出行 • 節省車資",
      subEn: "Connecting across Hong Kong Island, Kowloon & NT",
      bullets: [
        "指定轉車站使用八達通或電支享第二程扣減",
        "涵蓋西隧、青嶼幹線及紅隧轉乘網絡"
      ],
      descZh: "善用城巴龐大轉車站網絡，跨區轉乘可享優惠扣減，兼具快捷與經濟效益。",
      descEn: "Enjoy interchange discounts across major toll plazas and transfer hubs.",
      theme: "transfer",
      icon: "transfer",
      bgGradient: "linear-gradient(180deg, #E0F2FE 0%, #FFFFFF 50%, #DBEAFE 100%)",
      accentColor: "#0284C7"
    },
    {
      id: 13,
      filename: "LECIP_Mon2_Poster_13.png",
      tag: "車廂安全 CARRIAGE SAFETY",
      titleZh: "緊握扶手",
      titleEn: "HOLD THE HANDRAIL",
      subZh: "巴士行駛時 • 常握黃色扶手",
      subEn: "Hold handrails firmly throughout the ride",
      bullets: [
        "車輛起步、轉彎或減速時隨時握緊扶手",
        "巴士未完全停定前，切勿走動準備落車",
        "手抱嬰兒者請特別注意站立姿勢"
      ],
      descZh: "車廂各處均設有醒目黃色防滑扶手，行車期間請全程握緊扶手，確保行車安全。",
      descEn: "Please hold the handrails firmly. Do not stand up before the bus has come to a stop.",
      theme: "handrail",
      icon: "handrail",
      bgGradient: "linear-gradient(180deg, #F3E8FF 0%, #FFFFFF 50%, #EDE9FE 100%)",
      accentColor: "#9333EA"
    },
    {
      id: 14,
      filename: "LECIP_Mon2_Poster_14.png",
      tag: "無障礙出行 ACCESSIBILITY",
      titleZh: "輪椅乘客登車指引",
      titleEn: "Wheelchair Boarding Guide",
      subZh: "低地台斜板 • 專業協助",
      subEn: "Safe and accessible transit for everyone",
      bullets: [
        "車長會主動放下輪椅斜板協助上下車",
        "請將輪椅停放於專用泊位並鎖緊輪胎安全扣"
      ],
      descZh: "城巴全線低地台巴士配備無障礙斜板與專用泊位，請其他乘客體諒讓出空間。",
      descEn: "Captains will deploy wheelchair ramps to facilitate boarding.",
      theme: "wheelchair",
      icon: "wheelchair",
      bgGradient: "linear-gradient(180deg, #ECFDF5 0%, #FFFFFF 50%, #D1FAE5 100%)",
      accentColor: "#059669"
    },
    {
      id: 15,
      filename: "LECIP_Mon2_Poster_15.png",
      tag: "車廂規則 RULES",
      titleZh: "切勿在車廂內飲食",
      titleEn: "No Eating or Drinking on Buses",
      subZh: "保持車廂清潔 • 營造良好乘車環境",
      subEn: "Keep the cabin clean and pleasant",
      bullets: [
        "車內請勿進食任何食物或飲用開口飲品",
        "共同維護衛生，切勿在座位遺留垃圾"
      ],
      descZh: "為了所有乘客的乘車舒適，全車嚴禁飲食，攜帶之外賣食物請妥善密封包裝。",
      descEn: "Eating or drinking is prohibited on board. Please help keep the cabin clean.",
      theme: "nofood",
      icon: "nofood",
      bgGradient: "linear-gradient(180deg, #FFF1F2 0%, #FFFFFF 50%, #FFE4E6 100%)",
      accentColor: "#E11D48"
    },
    {
      id: 16,
      filename: "LECIP_Mon2_Poster_16.png",
      tag: "落車須知 ALIGHTING",
      titleZh: "如要下車，請在到站前",
      titleEn: "If you wish to alight, please",
      subZh: "提早按鐘 • RING THE BELL",
      subEn: "ring the bell before arriving the stop",
      bullets: [
        "請於巴士抵達指定車站前按鐘示意",
        "按鐘後請安心就座，待巴士停穩後方才起身下車",
        "落車請留意車門開關及梯級安全"
      ],
      descZh: "如需於下一站下車，請於巴士到站前預先按下紅色 STOP 鐘掣，讓車長有足夠時間安全減速靠站。",
      descEn: "If you wish to alight, please press the bell before arriving the stop.",
      theme: "stopbell",
      icon: "stopbell",
      bgGradient: "linear-gradient(180deg, #FEF3C7 0%, #FFFFFF 50%, #FFEDD5 100%)",
      accentColor: "#D97706"
    },
    {
      id: 17,
      filename: "LECIP_Mon2_Poster_17.png",
      tag: "分段收費 SECTION FARE",
      titleZh: "八達通雙向分段收費",
      titleEn: "Two-way Section Fare Scheme",
      subZh: "短途行程享折扣 • 落車拍卡有回贈",
      subEn: "Tap again when alighting to enjoy rebate",
      bullets: [
        "上車以八達通繳付全程正價車資",
        "於指定分段車站下車前，在拍卡機再次拍卡即享回贈"
      ],
      descZh: "乘搭指定分段路線，於落車前於車門拍卡機再次拍卡，即可享受短途車資扣減優惠！",
      descEn: "Tap Octopus again before alighting to receive short-distance fare rebate.",
      theme: "sectionfare",
      icon: "fare",
      bgGradient: "linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 50%, #DCFCE7 100%)",
      accentColor: "#16A34A"
    },
    {
      id: 18,
      filename: "LECIP_Mon2_Poster_18.png",
      tag: "安全防護 SAFETY",
      titleZh: "請勿倚附車門",
      titleEn: "Do Not Lean Against Doors",
      subZh: "保持車門暢通 • 留意開關門動作",
      subEn: "Keep clear of the doors at all times",
      bullets: [
        "站立時請勿將身體倚靠在車門或玻璃上",
        "聽到車門開關警號時請立即退後"
      ],
      descZh: "車門開關具有機械動力，站立乘客切勿貼近或阻礙車門，以免發生夾傷意外。",
      descEn: "Do not lean against bus doors. Stand back when the door warning chime sounds.",
      theme: "doors",
      icon: "doors",
      bgGradient: "linear-gradient(180deg, #FEF2F2 0%, #FFFFFF 50%, #FEE2E2 100%)",
      accentColor: "#B91C1C"
    },
    {
      id: 19,
      filename: "LECIP_Mon2_Poster_19.png",
      tag: "實時抵站時間 REAL-TIME ETA",
      titleZh: "全港專營巴士、專線小巴",
      titleEn: "All Franchised Buses & Minibuses",
      subZh: "都查到！立即下載城巴 App",
      subEn: "Download Citybus App - '原來呢架都得！'",
      bullets: [
        "全港巴士、港鐵及專線小巴 ETA 一 App 掌握",
        "精準路線推介：「原來呢架都得！」",
        "即刻掃描 QR Code 或於 App Store / Google Play 下載"
      ],
      descZh: "城巴流動應用程式提供全港所有巴士及小巴的即時抵站時間，更能推薦同站其他路線，為您節省等車時間！",
      descEn: "Check real-time arrival times for all franchised buses and green minibuses in HK.",
      theme: "citybusapp",
      icon: "citybusapp",
      bgGradient: "linear-gradient(180deg, #FEF08A 0%, #FFFFFF 40%, #BFDBFE 100%)",
      accentColor: "#0284C7"
    },
    {
      id: 20,
      filename: "LECIP_Mon2_Poster_20.png",
      tag: "失物招領 LOST PROPERTY",
      titleZh: "失物處理與查詢",
      titleEn: "Lost Property Inquiries",
      subZh: "妥善保管隨身行李 • 如有遺留即刻協助",
      subEn: "Contact Citybus for items left behind",
      bullets: [
        "落車前請再次檢查座位及行李架物品",
        "如遺留物品可致電客服熱線或透過手機 App 登記"
      ],
      descZh: "城巴設有完善的失物登記與認領服務，車長拾獲之隨身物品均會妥善移交處理。",
      descEn: "If you leave belongings on board, file a report via Citybus App or Hotline.",
      theme: "lostfound",
      icon: "lostfound",
      bgGradient: "linear-gradient(180deg, #EEF2FF 0%, #FFFFFF 50%, #E0E7FF 100%)",
      accentColor: "#4F46E5"
    },
    {
      id: 21,
      filename: "LECIP_Mon2_Poster_21.png",
      tag: "顧客服務 CUSTOMER CARE",
      titleZh: "城巴顧客服務專線",
      titleEn: "Customer Service Hotline",
      subZh: "服務熱線：(852) 2136 8888",
      subEn: "Live Agent Daily 08:00 - 20:00",
      bullets: [
        "路線查詢、意見反饋與即時乘車協助",
        "城巴網站 www.citybus.com.hk 同步提供支援"
      ],
      descZh: "城巴顧客服務熱線每日有專人接聽，隨時解答乘客對路線、班次及票價的疑問。",
      descEn: "Citybus hotline (852) 2136 8888 is available daily for route and fare inquiries.",
      theme: "hotline",
      icon: "phone",
      bgGradient: "linear-gradient(180deg, #E0F2FE 0%, #FFFFFF 50%, #BAE6FD 100%)",
      accentColor: "#0369A1"
    }
  ]
};

if (typeof module !== "undefined") {
  module.exports = MON2_DATA;
}
