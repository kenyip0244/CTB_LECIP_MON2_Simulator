/**
 * CTB LECIP MON2 SIMULATOR - ROUTE & SYSTEM DATA
 * Based on authentic Citybus / NWFB LECIP Mon2 specifications and OMSI 2 Mon2 Addon.
 */

const MON2_DATA = {
  // Preset Routes
  routes: [
    {
      code: "914",
      company: "CTB",
      name: "914",
      origin: { zh: "銅鑼灣 (天后)", en: "Causeway Bay (Tin Hau)" },
      dest: { zh: "海麗邨", en: "Hoi Lai Estate" },
      colorHex: "#0022AA",
      textColor: "#FFFFFF",
      isAirport: false,
      isRickshaw: false,
      stops: [
        { num: 1, zh: "銅鑼灣 (天后)", en: "Causeway Bay (Tin Hau)", lat: 22.2825, long: 114.1925, fare: "$11.4" },
        { num: 2, zh: "香港中央圖書館", en: "Hong Kong Central Library", lat: 22.2801, long: 114.1895, fare: "$11.4" },
        { num: 3, zh: "維多利亞公園", en: "Victoria Park", lat: 22.2805, long: 114.1870, fare: "$11.4" },
        { num: 4, zh: "怡和街", en: "Yee Wo Street", lat: 22.2798, long: 114.1852, fare: "$11.4" },
        { num: 5, zh: "銅鑼灣 - 怡和街", en: "Causeway Bay - Yee Wo Street", subZh: "銅鑼灣站", subEn: "Causeway Bay Station", lat: 22.2795, long: 114.1835, fare: "$11.4", landmarks: ["銅鑼灣站", "崇光百貨"] },
        { num: 6, zh: "堅拿道東", en: "Canal Road East", subZh: "時代廣場", subEn: "Times Square", lat: 22.2785, long: 114.1818, fare: "$11.4", landmarks: ["時代廣場"] },
        { num: 7, zh: "北海中心", en: "CNT Tower", subZh: "CNT Tower", subEn: "CNT Tower", lat: 22.2778, long: 114.1785, fare: "$11.4" },
        { num: 8, zh: "軒尼詩道官立小學", en: "Hennessy Road Gov Primary School", lat: 22.2772, long: 114.1755, fare: "$11.4" },
        { num: 9, zh: "修頓球場", en: "Southorn Playground", subZh: "灣仔站", subEn: "Wan Chai Station", lat: 22.2770, long: 114.1725, fare: "$11.4" },
        { num: 10, zh: "金鐘 - 高等法院", en: "Admiralty - High Court", lat: 22.2785, long: 114.1645, fare: "$11.4" },
        { num: 11, zh: "匯豐總行大廈", en: "HSBC Main Building", lat: 22.2802, long: 114.1595, fare: "$11.4" },
        { num: 12, zh: "皇后街", en: "Queen Street", lat: 22.2882, long: 114.1465, fare: "$11.4" },
        { num: 13, zh: "西區海底隧道收費廣場", en: "Western Harbour Crossing Toll Plaza", subZh: "西隧轉乘站", subEn: "WHC BBI", lat: 22.3025, long: 114.1585, fare: "$6.0" },
        { num: 14, zh: "柯士甸道西", en: "Austin Road West", subZh: "西九文化區", subEn: "West Kowloon Cultural District", lat: 22.3045, long: 114.1635, fare: "$6.0" },
        { num: 15, zh: "富榮花園", en: "Charming Garden", lat: 22.3160, long: 114.1630, fare: "$6.0" },
        { num: 16, zh: "柏景灣", en: "Park Avenue", subZh: "奧海城二期", subEn: "Olympian City 2", lat: 22.3180, long: 114.1615, fare: "$6.0" },
        { num: 17, zh: "海富苑", en: "Hoi Fu Court", lat: 22.3205, long: 114.1605, fare: "$6.0" },
        { num: 18, zh: "富昌邨", en: "Fu Cheong Estate", lat: 22.3295, long: 114.1545, fare: "$6.0" },
        { num: 19, zh: "東京街西", en: "Tonkin Street West", lat: 22.3325, long: 114.1525, fare: "$6.0" },
        { num: 20, zh: "海麗邨", en: "Hoi Lai Estate", lat: 22.3355, long: 114.1510, fare: "$6.0", isTerminus: true }
      ]
    },
    {
      id: "780",
      company: "CTB",
      isAirport: false,
      isRickshaw: false,
      code: "780",
      origin: { zh: "柴灣 (東)", en: "Chai Wan (East)" },
      dest: { zh: "中環碼頭", en: "Central (Ferry Piers)" },
      via: { zh: "特快經東區走廊、灣仔、金鐘", en: "Express via Island Eastern Corridor, Wan Chai, Admiralty" },
      colorHex: "#004B87",
      textColor: "#FFFFFF",
      stops: [
        {
          num: 1,
          zh: "柴灣 (東)",
          en: "Chai Wan (East)",
          lat: 22.2685, long: 114.2468,
          subZh: "總站",
          subEn: "Terminus",
          fare: "$7.7",
          landmarks: ["柴灣公眾貨物裝卸區"],
          isTerminusStart: true
        },
        {
          num: 2,
          zh: "樂軒臺",
          en: "Lok Hin Terrace",
          lat: 22.2642, long: 114.2384,
          subZh: "柴灣道",
          subEn: "Chai Wan Road",
          fare: "$7.7",
          landmarks: ["樂軒臺", "柴灣市政大廈"]
        },
        {
          num: 3,
          zh: "環翠商場",
          en: "Wan Tsui Shopping Centre",
          lat: 22.2618, long: 114.2361,
          subZh: "華廈街",
          subEn: "Wah Haa Street",
          fare: "$7.7",
          landmarks: ["環翠商場", "港鐵柴灣站 A 出口"]
        },
        {
          num: 4,
          zh: "環翠邨澤翠樓",
          en: "Chak Tsui House Wan Tsui Estate",
          lat: 22.2605, long: 114.2355,
          subZh: "翡翠道",
          subEn: "Fei Tsui Road",
          fare: "$7.7",
          landmarks: ["澤翠樓", "環翠邨"]
        },
        {
          num: 5,
          zh: "興華邨卓華樓",
          en: "Cheuk Wah House Hing Wah Estate",
          lat: 22.2625, long: 114.2335,
          subZh: "環翠道",
          subEn: "Wan Tsui Road",
          fare: "$7.7",
          landmarks: ["興華(二)邨"]
        },
        {
          num: 6,
          zh: "興華邨豐興樓",
          en: "Fung Hing House Hing Wah Estate",
          lat: 22.2638, long: 114.2325,
          subZh: "環翠道",
          subEn: "Wan Tsui Road",
          fare: "$7.7",
          landmarks: ["興華(一)邨"]
        },
        {
          num: 7,
          zh: "興華邨裕興樓",
          en: "Yu Hing House Hing Wah Estate",
          lat: 22.2652, long: 114.2312,
          subZh: "柴灣道",
          subEn: "Chai Wan Road",
          fare: "$7.7",
          landmarks: ["文理書院(香港)"]
        },
        {
          num: 8,
          zh: "天主教海星堂",
          en: "Star of the Sea Catholic Church",
          lat: 22.268, long: 114.2295,
          subZh: "柴灣道",
          subEn: "Chai Wan Road",
          fare: "$7.7",
          landmarks: ["海星堂", "柴灣天主教海星小學"]
        },
        {
          num: 9,
          zh: "興民邨",
          en: "Hing Man Estate",
          lat: 22.271, long: 114.227,
          subZh: "柴灣道",
          subEn: "Chai Wan Road",
          fare: "$7.7",
          landmarks: ["興民商場", "興民邨"]
        },
        {
          num: 10,
          zh: "山翠苑",
          en: "Shan Tsui Court",
          lat: 22.2745, long: 114.2255,
          subZh: "東區醫院",
          subEn: "Eastern Hospital",
          fare: "$7.7",
          landmarks: ["東區尤德夫人那打素醫院", "山翠苑"]
        },
        {
          num: 11,
          zh: "筲箕灣東官立中學",
          en: "Shau Kei Wan East Govt Secondary School",
          lat: 22.2778, long: 114.224,
          subZh: "柴灣道",
          subEn: "Chai Wan Road",
          fare: "$7.7",
          landmarks: ["筲箕灣官立中學", "筲箕灣東官立中學"]
        },
        {
          num: 12,
          zh: "阿公岩道",
          en: "A Kung Ngam Road",
          lat: 22.2815, long: 114.223,
          subZh: "柴灣道",
          subEn: "Chai Wan Road",
          fare: "$7.7",
          landmarks: ["阿公岩村", "明華大廈"]
        },
        {
          num: 13,
          zh: "舊灣仔警署",
          en: "Old Wan Chai Police Station",
          lat: 22.2798, long: 114.1745,
          subZh: "香港會議展覽中心",
          subEn: "HK Convention and Exhibition Centre",
          fare: "$7.7",
          landmarks: ["香港會議展覽中心", "舊灣仔警署古蹟"],
          interchanges: [
            { route: "2A", destZh: "耀東邨", destEn: "Yiu Tung Estate", eta: 3 },
            { route: "18X", destZh: "堅尼地城", destEn: "Kennedy Town", eta: 6 },
            { route: "722", destZh: "耀東邨", destEn: "Yiu Tung Estate", eta: 8 }
          ]
        },
        {
          num: 14,
          zh: "分域街",
          en: "Fenwick Street",
          lat: 22.2785, long: 114.1702,
          subZh: "香港演藝學院",
          subEn: "Hong Kong Academy for Performing Arts",
          fare: "$7.7",
          landmarks: ["香港演藝學院", "香港藝術中心", "電訊大廈"]
        },
        {
          num: 15,
          zh: "海富中心",
          en: "Admiralty Centre",
          lat: 22.2795, long: 114.165,
          subZh: "金鐘站",
          subEn: "Admiralty Station",
          fare: "$7.7",
          landmarks: ["港鐵金鐘站", "政府總部", "夏愨花園"],
          interchanges: [
            { route: "港鐵", destZh: "荃灣綫 / 港島綫 / 南港島綫 / 東鐵綫", destEn: "MTR Mega Interchange", eta: 2 },
            { route: "111", destZh: "坪石", destEn: "Ping Shek", eta: 4 },
            { route: "690", destZh: "康盛花園", destEn: "Hong Sing Garden", eta: 9 }
          ]
        },
        {
          num: 16,
          zh: "中環碼頭",
          en: "Central (Ferry Piers)",
          lat: 22.2868, long: 114.1595,
          subZh: "終點站",
          subEn: "Terminus",
          fare: "$7.7",
          landmarks: ["中環 3-6 號外島渡輪碼頭", "國際金融中心 IFC", "香港摩天輪"],
          isTerminus: true
        }
      ]
    },
    {
      id: "A12",
      company: "CTB",
      isAirport: true,
      isRickshaw: false,
      code: "A12",
      origin: { zh: "機場 (地面運輸中心)", en: "Airport (GTC)" },
      dest: { zh: "小西灣 (藍灣半島)", en: "Siu Sai Wan (Island Resort)" },
      via: { zh: "特快經西區海底隧道、東區走廊", en: "Express via Western Harbour Crossing & IEC" },
      colorHex: "#FF007F",
      textColor: "#FFFFFF",
      stops: [
        {
          num: 1,
          zh: "機場 (地面運輸中心)",
          en: "Airport (Ground Transportation Centre)",
          subZh: "總站",
          subEn: "Terminus",
          fare: "$47.1",
          landmarks: ["香港國際機場", "一號客運大樓"],
          isTerminusStart: true
        },
        {
          num: 16,
          zh: "西區海底隧道轉乘站",
          en: "Western Harbour Crossing Interchange",
          subZh: "收費廣場",
          subEn: "Toll Plaza",
          fare: "$47.1",
          landmarks: ["西九文化區", "M+ 博物館", "香港故宮文化博物館"],
          interchanges: [
            { route: "905", destZh: "荔枝角", destEn: "Lai Chi Kok", eta: 2 },
            { route: "970", destZh: "數碼港", destEn: "Cyberport", eta: 4 },
            { route: "A11", destZh: "北角碼頭", destEn: "North Point Ferry", eta: 7 }
          ]
        },
        {
          num: 17,
          zh: "阿公岩道",
          en: "A Kung Ngam Road",
          subZh: "柴灣道",
          subEn: "Chai Wan Road",
          fare: "$7.7",
          landmarks: ["阿公岩村", "明華大廈"]
        },
        {
          num: 18,
          zh: "鯉魚門公園",
          en: "Lei Yue Mun Park",
          subZh: "柴灣道",
          subEn: "Chai Wan Road",
          fare: "$7.7",
          landmarks: ["鯉魚門公園及度假村"]
        },
        {
          num: 19,
          zh: "大潭道",
          en: "Tai Tam Road",
          subZh: "柴灣道",
          subEn: "Chai Wan Road",
          fare: "$7.7",
          landmarks: ["興民邨", "山翠苑"]
        },
        {
          num: 20,
          zh: "東區醫院",
          en: "Eastern Hospital",
          subZh: "樂民道",
          subEn: "Lok Man Road",
          fare: "$7.7",
          landmarks: ["東區尤德夫人那打素醫院"]
        },
        {
          num: 21,
          zh: "高威閣",
          en: "Koway Court",
          subZh: "柴灣道",
          subEn: "Chai Wan Road",
          fare: "$7.7",
          landmarks: ["高威閣", "柴灣市政大廈"]
        },
        {
          num: 22,
          zh: "康民街",
          en: "Hong Man Street",
          subZh: "柴灣道",
          subEn: "Chai Wan Road",
          fare: "$7.7",
          landmarks: ["康翠臺", "柴灣工廠邨大廈"]
        },
        {
          num: 23,
          zh: "興華邨興翠樓",
          en: "Hing Tsui House Hing Wah Estate",
          subZh: "環翠道",
          subEn: "Wan Tsui Road",
          fare: "$7.7",
          landmarks: ["興華(一)邨", "文理書院"]
        },
        {
          num: 24,
          zh: "興華邨卓華樓",
          en: "Cheuk Wah House Hing Wah Estate",
          subZh: "環翠道",
          subEn: "Wan Tsui Road",
          fare: "$7.7",
          landmarks: ["興華(二)邨", "柴灣浸信會"]
        },
        {
          num: 25,
          zh: "青年廣場",
          en: "Youth Square",
          subZh: "柴灣道",
          subEn: "Chai Wan Road",
          fare: "$7.7",
          landmarks: ["青年廣場", "新翠商場", "港鐵柴灣站"]
        },
        {
          num: 26,
          zh: "怡泰街",
          en: "Yee Tai Street",
          subZh: "柴灣道",
          subEn: "Chai Wan Road",
          fare: "$7.7",
          landmarks: ["怡翠苑", "柴灣公園"]
        },
        {
          num: 27,
          zh: "漁灣邨",
          en: "Yue Wan Estate",
          subZh: "柴灣道",
          subEn: "Chai Wan Road",
          fare: "$7.7",
          landmarks: ["漁灣街市", "柴灣體育館"]
        },
        {
          num: 28,
          zh: "小西灣 (藍灣半島)",
          en: "Siu Sai Wan (Island Resort)",
          subZh: "終點站",
          subEn: "Terminus",
          fare: "$7.7",
          landmarks: ["藍灣半島商場", "小西灣海濱花園"],
          isTerminus: true
        }
      ]
    },
    {
      id: "905",
      company: "CTB",
      isAirport: false,
      isRickshaw: false,
      code: "905",
      origin: { zh: "會展站", en: "Exhibition Centre Station" },
      dest: { zh: "荔枝角 (盈暉臺)", en: "Lai Chi Kok (Nob Hill)" },
      via: { zh: "經金鐘、中環、西區海底隧道", en: "via Admiralty, Central, Western Harbour Crossing" },
      colorHex: "#004B87",
      textColor: "#FFFFFF",
      stops: [
        {
          num: 1,
          zh: "會展站",
          en: "Exhibition Centre Station",
          subZh: "總站",
          subEn: "Terminus",
          fare: "$11.4",
          landmarks: ["港鐵會展站", "香港會議展覽中心", "灣仔碼頭"],
          isTerminusStart: true
        },
        {
          num: 2,
          zh: "菲林明道",
          en: "Fleming Road",
          subZh: "軒尼詩道",
          subEn: "Hennessy Road",
          fare: "$11.4",
          landmarks: ["菲林明大廈", "修頓球場"]
        },
        {
          num: 3,
          zh: "盧押道",
          en: "Luard Road",
          subZh: "軒尼詩道",
          subEn: "Hennessy Road",
          fare: "$11.4",
          landmarks: ["盧押道酒吧區", "衛蘭軒", "港鐵灣仔站"]
        },
        {
          num: 4,
          zh: "金鐘 - 高等法院",
          en: "Admiralty - High Court",
          subZh: "金鐘道",
          subEn: "Queensway",
          fare: "$11.4",
          landmarks: ["高等法院", "太古廣場", "金鐘廊"]
        },
        {
          num: 5,
          zh: "中銀大廈",
          en: "Bank of China Tower",
          subZh: "金鐘道",
          subEn: "Queensway",
          fare: "$11.4",
          landmarks: ["中銀大廈", "花旗銀行大廈", "長江集團中心"]
        },
        {
          num: 6,
          zh: "利源東街",
          en: "Li Yuen Street East",
          subZh: "德輔道中",
          subEn: "Des Voeux Road Central",
          fare: "$11.4",
          landmarks: ["中環街市", "利源東街排檔", "港鐵中環站"]
        },
        {
          num: 7,
          zh: "中環街市",
          en: "Central Market",
          subZh: "德輔道中",
          subEn: "Des Voeux Road Central",
          fare: "$11.4",
          landmarks: ["中環街市歷史活化建築", "半山扶手電梯"]
        },
        {
          num: 8,
          zh: "文華里",
          en: "Man Wa Lane",
          subZh: "德輔道中",
          subEn: "Des Voeux Road Central",
          fare: "$11.4",
          landmarks: ["文華里印章街", "永安百貨", "港鐵上環站"]
        },
        {
          num: 9,
          zh: "西港城",
          en: "Western Market",
          subZh: "德輔道中",
          subEn: "Des Voeux Road Central",
          fare: "$11.4",
          landmarks: ["西港城古蹟商場", "港澳碼頭", "上環街市"]
        },
        {
          num: 10,
          zh: "皇后街",
          en: "Queen Street",
          subZh: "干諾道西",
          subEn: "Connaught Road West",
          fare: "$11.4",
          landmarks: ["皇后街熟食市場", "海味街"]
        },
        {
          num: 11,
          zh: "高陞街",
          en: "Ko Shing Street",
          subZh: "德輔道西",
          subEn: "Des Voeux Road West",
          fare: "$11.4",
          landmarks: ["高陞街藥材街", "西營盤郵政局"]
        },
        {
          num: 12,
          zh: "正街",
          en: "Centre Street",
          subZh: "德輔道西",
          subEn: "Des Voeux Road West",
          fare: "$11.4",
          landmarks: ["正街街市", "西區警署", "港鐵西營盤站"]
        },
        {
          num: 13,
          zh: "水街",
          en: "Water Street",
          subZh: "德輔道西",
          subEn: "Des Voeux Road West",
          fare: "$11.4",
          landmarks: ["水街休憩處", "西區社區中心"]
        },
        {
          num: 14,
          zh: "西區海底隧道轉車站",
          en: "Western Harbour Crossing Interchange",
          subZh: "收費廣場",
          subEn: "Toll Plaza",
          fare: "$7.2",
          landmarks: ["西九文化區", "港鐵九龍站"],
          interchanges: [
            { route: "904", destZh: "荔枝角", destEn: "Lai Chi Kok", eta: 3 },
            { route: "970", destZh: "蘇屋", destEn: "So Uk", eta: 5 },
            { route: "971", destZh: "海麗邨", destEn: "Hoi Lai Estate", eta: 8 }
          ]
        },
        {
          num: 15,
          zh: "荔枝角 (盈暉臺)",
          en: "Lai Chi Kok (Nob Hill)",
          subZh: "終點站",
          subEn: "Terminus",
          fare: "$6.2",
          landmarks: ["盈暉臺商場", "荔枝角公園", "港鐵美孚站"],
          isTerminus: true
        }
      ]
    },
    {
      id: "702",
      company: "CTB", // CTB = 1
      isAirport: false,
      isRickshaw: false,
      code: "702",
      origin: { zh: "海麗邨", en: "Hoi Lai Estate" },
      dest: { zh: "又一城", en: "Festival Walk" },
      via: { zh: "經深水埗、石硤尾", en: "via Sham Shui Po, Shek Kip Mei" },
      colorHex: "#FFD100",
      textColor: "#000000",
      stops: [
        {
          num: 1,
          zh: "海麗邨",
          en: "Hoi Lai Estate",
          subZh: "總站",
          subEn: "Terminus",
          fare: "$4.4",
          landmarks: ["海麗商場", "碧海藍天"],
          isTerminusStart: true
        },
        {
          num: 2,
          zh: "泓景臺",
          en: "Banyan Garden",
          subZh: "西九四小龍",
          subEn: "West Kowloon Four Estates",
          fare: "$4.4",
          landmarks: ["泓景臺", "宇晴軒", "昇悅居"]
        },
        {
          num: 3,
          zh: "碧海藍天",
          en: "AquaMarine",
          subZh: "深盛路",
          subEn: "Sham Shing Road",
          fare: "$4.4",
          landmarks: ["碧海藍天", "長沙灣海濱"]
        },
        {
          num: 4,
          zh: "深水埗 (欽州街)",
          en: "Sham Shui Po (Yen Chow Street)",
          subZh: "西九龍中心",
          subEn: "Dragon Centre",
          fare: "$4.4",
          landmarks: ["西九龍中心", "鴨寮街", "欽州街小販市場"],
          interchanges: [
            { route: "2A", destZh: "美孚", destEn: "Mei Foo", eta: 3 },
            { route: "6F", destZh: "麗閣", destEn: "Lai Kok", eta: 5 },
            { route: "12A", destZh: "黃埔花園", destEn: "Whampoa Garden", eta: 8 }
          ]
        },
        {
          num: 5,
          zh: "怡閣苑",
          en: "Yee Kok Court",
          subZh: "長沙灣道",
          subEn: "Cheung Sha Wan Road",
          fare: "$4.4",
          landmarks: ["怡閣苑", "麗安邨", "深水埗公園"]
        },
        {
          num: 6,
          zh: "麗閣邨",
          en: "Lai Kok Estate",
          subZh: "東京街",
          subEn: "Tonkin Street",
          fare: "$4.4",
          landmarks: ["麗閣商場", "長沙灣鐵路站"]
        },
        {
          num: 7,
          zh: "福華街",
          en: "Fuk Wa Street",
          subZh: "黃金電腦商場",
          subEn: "Golden Computer Arcade",
          fare: "$4.4",
          landmarks: ["黃金電腦商場", "高登電腦中心", "福華街市集"]
        },
        {
          num: 8,
          zh: "北河街",
          en: "Pei Ho Street",
          subZh: "元州街",
          subEn: "Un Chau Street",
          fare: "$4.4",
          landmarks: ["北河街市政大廈", "鴨寮街電子街"]
        },
        {
          num: 9,
          zh: "石硤尾街",
          en: "Shek Kip Mei Street",
          subZh: "深水埗郵政局",
          subEn: "Sham Shui Po Post Office",
          fare: "$4.4",
          landmarks: ["美荷樓", "石硤尾邨"]
        },
        {
          num: 10,
          zh: "石硤尾站",
          en: "Shek Kip Mei Station",
          subZh: "港鐵石硤尾站 B 出口",
          subEn: "MTR Shek Kip Mei Station Exit B",
          fare: "$4.4",
          landmarks: ["石硤尾邨商場", "石硤尾公園"],
          interchanges: [
            { route: "港鐵", destZh: "觀塘綫", destEn: "Kwun Tong Line", eta: 2 },
            { route: "2E", destZh: "九龍城碼頭", destEn: "Kowloon City Ferry", eta: 6 },
            { route: "40", destZh: "麗港城", destEn: "Laguna City", eta: 9 }
          ]
        },
        {
          num: 11,
          zh: "民泰樓",
          en: "Man Tai House",
          subZh: "南昌街",
          subEn: "Nam Cheong Street",
          fare: "$4.4",
          landmarks: ["南昌街休憩處", "石硤尾天主教小學"]
        },
        {
          num: 12,
          zh: "聖方濟各書院",
          en: "St. Francis of Assisi's College",
          subZh: "石硤尾邨美如樓",
          subEn: "Mei Yu House Shek Kip Mei Estate",
          fare: "$4.4",
          landmarks: ["聖方濟各英文小學", "銘賢書院"]
        },
        {
          num: 13,
          zh: "賽馬會創意藝術中心",
          en: "JCCAC",
          subZh: "白田街",
          subEn: "Pak Tin Street",
          fare: "$4.4",
          landmarks: ["JCCAC 藝術中心", "白田社區會堂"]
        },
        {
          num: 14,
          zh: "白田邨瑞田樓",
          en: "Sui Tin House Pak Tin Estate",
          subZh: "白雲街",
          subEn: "Pak Wan Street",
          fare: "$4.4",
          landmarks: ["白田商場", "白田邨重建區"]
        },
        {
          num: 15,
          zh: "白田巴士總站",
          en: "Pak Tin Bus Terminus",
          subZh: "偉智街",
          subEn: "Wai Chi Street",
          fare: "$4.4",
          landmarks: ["白田邨", "石硤尾配水庫遊樂場"]
        },
        {
          num: 16,
          zh: "白田邨第9座",
          en: "Block 9 Pak Tin Estate",
          subZh: "南坑徑",
          subEn: "Nam Hang Path",
          fare: "$4.4",
          landmarks: ["石硤尾食水配水庫"]
        },
        {
          num: 17,
          zh: "石硤尾消防局",
          en: "Shek Kip Mei Fire Station",
          subZh: "南昌街",
          subEn: "Nam Cheong Street",
          fare: "$4.4",
          landmarks: ["石硤尾消防局", "則仁中心學校"]
        },
        {
          num: 18,
          zh: "則仁中心",
          en: "Chak Yan Centre",
          subZh: "歌和老街",
          subEn: "Cornwall Street",
          fare: "$4.4",
          landmarks: ["香港城市大學學生宿舍", "歌和老街公園"]
        },
        {
          num: 19,
          zh: "又一城",
          en: "Festival Walk",
          subZh: "九龍塘站 / 轉車站",
          subEn: "Kowloon Tong Station / Interchange",
          fare: "$4.4",
          landmarks: ["又一城商場", "香港城市大學", "港鐵九龍塘站"],
          specialNotice: {
            zh: "乘客如在深水埗(欽州街)或之前上車並續程前往此站以後各站，必須於此站重新繳付車資。",
            en: "If passenger boards at or before Sham Shui Po (Yen Chow Street) and continues the journey to bus stops after this stop, re-tendering bus fare is required at this stop."
          },
          interchanges: [
            { route: "港鐵", destZh: "東鐵綫 / 觀塘綫", destEn: "East Rail / Kwun Tong", eta: 2 },
            { route: "22", destZh: "啟德郵輪碼頭", destEn: "Kai Tak Cruise Terminal", eta: 7 },
            { route: "203C", destZh: "尖沙咀東 (麼地道)", destEn: "Tsim Sha Tsui East", eta: 11 },
            { route: "41M", destZh: "石硤尾", destEn: "Shek Kip Mei", eta: 4 }
          ]
        },
        {
          num: 20,
          zh: "又一村 (達之路)",
          en: "Yau Yat Chuen (Tat Chee Avenue)",
          subZh: "終點站",
          subEn: "Terminus",
          fare: "$4.4",
          landmarks: ["又一村花園", "香島中學"],
          isTerminus: true
        }
      ]
    },
    {
      id: "A21",
      company: "CTB",
      isAirport: true, // Cityflyer! Priority 2
      isRickshaw: false,
      code: "A21",
      origin: { zh: "紅磡站", en: "Hung Hom Station" },
      dest: { zh: "機場 (地面運輸中心)", en: "Airport (GTC)" },
      via: { zh: "特快經青嶼幹線、港珠澳大橋香港口岸", en: "Express via Lantau Link & HZMB" },
      colorHex: "#8B0000",
      textColor: "#FFFFFF",
      stops: [
        {
          num: 1,
          zh: "紅磡站",
          en: "Hung Hom Station",
          subZh: "紅磡車站巴士總站",
          subEn: "Hung Hom Station Bus Terminus",
          fare: "$34.6",
          landmarks: ["港鐵紅磡站", "香港體育館 (紅館)", "香港理工大學"],
          isTerminusStart: true
        },
        {
          num: 2,
          zh: "香港科學館",
          en: "Hong Kong Science Museum",
          subZh: "漆咸道南",
          subEn: "Chatham Road South",
          fare: "$34.6",
          landmarks: ["香港歷史博物館", "香港科學館", "新文華中心"]
        },
        {
          num: 3,
          zh: "麼地道",
          en: "Mody Road",
          subZh: "漆咸道南",
          subEn: "Chatham Road South",
          fare: "$34.6",
          landmarks: ["千禧新世界香港酒店", "麼地道公園"]
        },
        {
          num: 4,
          zh: "加連威老道",
          en: "Granville Road",
          subZh: "漆咸道南",
          subEn: "Chatham Road South",
          fare: "$34.6",
          landmarks: ["加連威老道購物區", "香港天文台"]
        },
        {
          num: 5,
          zh: "尖沙咀站",
          en: "Tsim Sha Tsui Station",
          subZh: "彌敦道",
          subEn: "Nathan Road",
          fare: "$34.6",
          landmarks: ["港鐵尖沙咀站", "九龍公園", "The ONE"]
        },
        {
          num: 15,
          zh: "中間道",
          en: "Middle Road",
          subZh: "半島酒店、喜來登酒店",
          subEn: "The Peninsula, Sheraton HK",
          fare: "$34.6",
          landmarks: [
            "半島酒店",
            "喜來登酒店",
            "金域假日酒店",
            "九龍酒店",
            "港青酒店 - 香港基督教青年會",
            "重慶大廈"
          ],
          landmarksEn: [
            "The Peninsula",
            "Sheraton HK",
            "Holiday Inn Golden Mile",
            "The Kowloon Hotel",
            "The Salisbury - YMCA",
            "Chungking Mansions"
          ],
          interchanges: [
            { route: "港鐵", destZh: "屯馬綫 尖東站", destEn: "Tuen Ma Line East TST", eta: 2 },
            { route: "1", destZh: "竹園邨", destEn: "Chuk Yuen Estate", eta: 5 },
            { route: "2", destZh: "蘇屋", destEn: "So Uk", eta: 7 },
            { route: "9", destZh: "彩福", destEn: "Choi Fook", eta: 10 }
          ]
        },
        {
          num: 16,
          zh: "九龍中央郵政局",
          en: "Kowloon Central Post Office",
          subZh: "彌敦道",
          subEn: "Nathan Road",
          fare: "$34.6",
          landmarks: ["九龍政府合署", "油麻地玉器市場"]
        },
        {
          num: 20,
          zh: "旺角維景酒店",
          en: "Metropark Hotel Mongkok",
          subZh: "荔枝角道",
          subEn: "Lai Chi Kok Road",
          fare: "$34.6",
          landmarks: ["旺角維景酒店", "港鐵太子站 C2 出口"]
        },
        {
          num: 21,
          zh: "青嶼幹線轉車站",
          en: "Lantau Link Interchange",
          subZh: "青嶼幹線收費廣場",
          subEn: "Lantau Link Toll Plaza",
          fare: "$34.6",
          landmarks: ["青嶼幹線訪客中心", "馬灣轉車站"],
          interchanges: [
            { route: "A11", destZh: "機場 / 機場博覽館", destEn: "Airport / AsiaWorld-Expo", eta: 3 },
            { route: "A12", destZh: "機場 (地面運輸中心)", destEn: "Airport (GTC)", eta: 6 },
            { route: "A22", destZh: "機場 (地面運輸中心)", destEn: "Airport (GTC)", eta: 9 },
            { route: "E21", destZh: "航天城 / 機場博覽館", destEn: "SKYCITY / AsiaWorld-Expo", eta: 12 },
            { route: "E22", destZh: "航天城", destEn: "SKYCITY", eta: 14 }
          ]
        },
        {
          num: 22,
          zh: "一號客運大樓",
          en: "Terminal 1",
          subZh: "暢達路",
          subEn: "Cheong Tat Road",
          fare: "$34.6",
          landmarks: ["香港國際機場一號客運大樓", "離境大堂", "機場站"]
        },
        {
          num: 23,
          zh: "港珠澳大橋香港口岸",
          en: "HZMB Hong Kong Port",
          subZh: "順運路",
          subEn: "Shun Wan Road",
          fare: "$34.6",
          landmarks: ["港珠澳大橋旅檢大樓", "跨境巴士總站"]
        },
        {
          num: 24,
          zh: "機場地面運輸中心",
          en: "Airport (Ground Transportation Centre)",
          subZh: "終點站",
          subEn: "Terminus",
          fare: "$34.6",
          landmarks: ["香港國際機場", "機場快綫站", "富豪機場酒店"],
          specialNotice: {
            zh: "前往航天城及亞洲國際博覽館之乘客，請到暢達路轉乘路線 E11, E21, E21D, E22, E22A。",
            en: "Passengers for SKYCITY and AsiaWorld-Expo, please cross to Cheong Tat Road and interchange to Route E11, E21, E21D, E22, E22A."
          },
          isTerminus: true
        }
      ]
    },
    {
      id: "E73C",
      company: "CTB",
      isAirport: false,
      isRickshaw: false,
      code: "E73C",
      origin: { zh: "和利菲廣場", en: "Wollife Square" },
      dest: { zh: "飛機維修區", en: "Aircraft Maintenance Area" },
      via: { zh: "經中間島、海景灣物流中心、博覽館", en: "via Chung Kuen Is., Cargo Area, Expo" },
      colorHex: "#FFD100",
      textColor: "#000000",
      stops: [
        {
          num: 1,
          zh: "和利菲廣場",
          en: "Wollife Square",
          subZh: "總站",
          subEn: "Terminus",
          fare: "$12.8",
          landmarks: ["和利菲商業大廈", "廣場噴泉"],
          isTerminusStart: true
        },
        {
          num: 2,
          zh: "中間島九巴車廠",
          en: "KMB Depot Chung Kuen Island",
          subZh: "島北路",
          subEn: "Island North Road",
          fare: "$12.8",
          landmarks: ["中間島巴士總修中心"]
        },
        {
          num: 3,
          zh: "海景灣物流中心",
          en: "Ocean Bay Logistics Centre",
          subZh: "中間島工業區",
          subEn: "Chung Kuen Industrial Area",
          fare: "$12.8",
          landmarks: ["海景灣貨運碼頭", "空運貨站"],
          interchanges: [
            { route: "E73", destZh: "和利菲廣場", destEn: "Wollife Square", eta: 4 },
            { route: "E81C", destZh: "南區市集", destEn: "Southern Market", eta: 8 }
          ]
        },
        {
          num: 4,
          zh: "飛機燃料庫",
          en: "Aviation Fuel Tank Farm",
          subZh: "機場南路",
          subEn: "Airport South Road",
          fare: "$12.8",
          landmarks: ["航空燃油專用碼頭"]
        },
        {
          num: 5,
          zh: "機場博覽館",
          en: "AsiaWorld-Expo",
          subZh: "航展道",
          subEn: "Airport Expo Boulevard",
          fare: "$12.8",
          landmarks: ["亞洲國際博覽館", "麗豪航天城酒店"],
          interchanges: [
            { route: "S1", destZh: "東涌站", destEn: "Tung Chung Station", eta: 3 },
            { route: "E32", destZh: "葵芳 (南)", destEn: "Kwai Fong (South)", eta: 9 },
            { route: "A26", destZh: "油塘", destEn: "Yau Tong", eta: 15 }
          ]
        },
        {
          num: 6,
          zh: "飛機維修區",
          en: "Aircraft Maintenance Area",
          subZh: "終點站 (著名日落觀景勝地)",
          subEn: "Terminus (Famous Sunset Spot)",
          fare: "$12.8",
          landmarks: ["香港飛機工程 (HAECO)", "南環路海堤觀景台"],
          specialNotice: {
            zh: "「山映斜陽天接水」— 城巴 E73C 途經南環路壯麗日落海景，拍照請注意道路安全。",
            en: "'Sunset over the shimmering bay' - CTB E73C scenic sunset route. Please mind road safety when viewing."
          },
          isTerminus: true
        }
      ]
    },
    {
      id: "8P",
      company: "CTB",
      isAirport: false,
      isRickshaw: false,
      code: "8P",
      origin: { zh: "小西灣 (藍灣半島)", en: "Siu Sai Wan (Island Resort)" },
      dest: { zh: "灣仔北", en: "Wan Chai North" },
      via: { zh: "特快東區走廊", en: "Express via Island Eastern Corridor" },
      colorHex: "#FFD100",
      textColor: "#000000",
      stops: [
        {
          num: 1,
          zh: "小西灣 (藍灣半島)",
          en: "Siu Sai Wan (Island Resort)",
          subZh: "總站",
          subEn: "Terminus",
          fare: "$7.2",
          landmarks: ["藍灣半島商場", "小西灣海濱花園"],
          isTerminusStart: true
        },
        {
          num: 2,
          zh: "富怡花園",
          en: "Fullview Garden",
          subZh: "小西灣道",
          subEn: "Siu Sai Wan Road",
          fare: "$7.2",
          landmarks: ["富怡商場", "衛理中學"]
        },
        {
          num: 3,
          zh: "小西灣邨",
          en: "Siu Sai Wan Estate",
          subZh: "小西灣道",
          subEn: "Siu Sai Wan Road",
          fare: "$7.2",
          landmarks: ["小西灣社區會堂", "瑞樂樓"]
        },
        {
          num: 4,
          zh: "曉翠街",
          en: "Hiu Tsui Street",
          subZh: "小西灣道",
          subEn: "Siu Sai Wan Road",
          fare: "$7.2",
          landmarks: ["曉翠苑", "中華基金中學"]
        },
        {
          num: 5,
          zh: "富城閣",
          en: "Fu Shing Court",
          subZh: "柴灣道",
          subEn: "Chai Wan Road",
          fare: "$7.2",
          landmarks: ["柴灣市政大廈", "樂軒臺"]
        },
        {
          num: 6,
          zh: "環翠商場",
          en: "Wan Tsui Market",
          subZh: "柴灣道",
          subEn: "Chai Wan Road",
          fare: "$7.2",
          landmarks: ["環翠邨", "港鐵柴灣站 A 出口"]
        },
        {
          num: 7,
          zh: "張振興伉儷書院",
          en: "CGH College",
          subZh: "東區走廊入口",
          subEn: "Island Eastern Corridor Entrance",
          fare: "$7.2",
          landmarks: ["張振興伉儷書院"],
          specialTrigger: "!SeatBelt" // Triggers Seat Belt alert!
        },
        {
          num: 8,
          zh: "永興街",
          en: "Wing Hing Street",
          subZh: "英皇道",
          subEn: "King's Road",
          fare: "$5.2",
          landmarks: ["天后廟", "柏景臺", "港鐵天后站"]
        },
        {
          num: 9,
          zh: "香港中央圖書館",
          en: "Hong Kong Central Library",
          subZh: "高士威道",
          subEn: "Causeway Road",
          fare: "$5.2",
          landmarks: ["香港中央圖書館", "維多利亞公園"]
        },
        {
          num: 10,
          zh: "希慎廣場",
          en: "Hysan Place",
          subZh: "軒尼詩道",
          subEn: "Hennessy Road",
          fare: "$5.2",
          landmarks: ["希慎廣場", "崇光百貨 SOGO", "港鐵銅鑼灣站 F 出口"],
          interchanges: [
            { route: "2A", destZh: "灣仔北", destEn: "Wan Chai North", eta: 2 },
            { route: "2X", destZh: "西灣河", destEn: "Sai Wan Ho", eta: 5 },
            { route: "112", destZh: "蘇屋", destEn: "So Uk", eta: 7 }
          ]
        },
        {
          num: 11,
          zh: "熙華大廈",
          en: "CNT Tower",
          subZh: "軒尼詩道",
          subEn: "Hennessy Road",
          fare: "$5.2",
          landmarks: ["修頓球場", "港鐵灣仔站 A2 出口"]
        },
        {
          num: 12,
          zh: "軒尼詩道官立小學",
          en: "Hennessy Road Government Primary School",
          subZh: "軒尼詩道",
          subEn: "Hennessy Road",
          fare: "$5.2",
          landmarks: ["灣仔電腦城", "修頓中心"]
        },
        {
          num: 13,
          zh: "灣仔碼頭 (灣仔北)",
          en: "Wan Chai Ferry (Wan Chai North)",
          subZh: "終點站",
          subEn: "Terminus",
          fare: "$5.2",
          landmarks: ["灣仔天星碼頭", "香港會議展覽中心", "港鐵會展站"],
          isTerminus: true
        }
      ]
    },
    {
      id: "H1",
      company: "NWFB", // Rickshaw Sightseeing Bus (Priority 1: Starts with H, CTBorNWFB=0)
      isAirport: false,
      isRickshaw: true,
      code: "H1",
      origin: { zh: "中環 (天星碼頭)", en: "Central (Star Ferry)" },
      dest: { zh: "尖沙咀 (天星碼頭)", en: "Tsim Sha Tsui (Star Ferry)" },
      via: { zh: "人力車觀光巴士懷舊之旅", en: "Rickshaw Sightseeing Heritage Tour" },
      colorHex: "#B22222",
      textColor: "#FFFFFF",
      stops: [
        {
          num: 1,
          zh: "中環 (天星碼頭)",
          en: "Central (Star Ferry)",
          subZh: "中環7/8號碼頭",
          subEn: "Central Piers 7/8",
          fare: "$43.8",
          landmarks: ["香港摩天輪", "中環天星碼頭", "國際金融中心 IFC"],
          isTerminusStart: true
        },
        {
          num: 2,
          zh: "中環大會堂",
          en: "City Hall Interchange",
          subZh: "干諾道中",
          subEn: "Connaught Road Central",
          fare: "$43.8",
          landmarks: ["香港大會堂", "遮打花園", "終審法院"],
          interchanges: [
            { route: "H2", destZh: "夜景之旅", destEn: "Night Tour", eta: 15 },
            { route: "15C", destZh: "山頂纜車站", destEn: "Peak Tram Station", eta: 8 },
            { route: "720", destZh: "嘉亨灣", destEn: "Grand Promenade", eta: 4 }
          ]
        },
        {
          num: 3,
          zh: "文華東方酒店",
          en: "Mandarin Oriental Hotel",
          subZh: "干諾道中",
          subEn: "Connaught Road Central",
          fare: "$43.8",
          landmarks: ["文華東方酒店", "皇后像廣場", "太子大廈"]
        },
        {
          num: 4,
          zh: "舊灣仔郵政局",
          en: "Old Wan Chai Post Office",
          subZh: "皇后大道東",
          subEn: "Queen's Road East",
          fare: "$43.8",
          landmarks: ["藍屋建築群", "太原街玩具街", "利東街"]
        },
        {
          num: 5,
          zh: "尖沙咀天星碼頭",
          en: "Tsim Sha Tsui Star Ferry",
          subZh: "終點站",
          subEn: "Terminus",
          fare: "$43.8",
          landmarks: ["尖沙咀鐘樓", "香港文化中心", "星光大道"],
          isTerminus: true
        }
      ]
    }
  ],

  // 21 Electronic Posters (LECIP Mon2 Max_Poster_Number = 21)
    // Authentic Electronic Posters (LECIP Mon2 Max_Poster_Number = 21)
  // Directly modeled on real Citybus / OMSI 2 System\\Poster\\LECIP_Mon2_Poster_[N].png
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
