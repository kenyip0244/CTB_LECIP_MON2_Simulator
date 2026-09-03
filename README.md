# CTB LECIP MON2 PIS SIMULATOR (城巴旅客資訊系統模擬器)

![CTB LECIP Mon2 Badge](https://img.shields.io/badge/CTB%20%2F%20NWFB-LECIP%20MON2-FFD100?style=for-the-badge&logoColor=000)
![Platform](https://img.shields.io/badge/Platform-Web%20%2F%20GitHub%20Pages-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Build-Passing-success?style=for-the-badge)

本項目是一個基於香港城巴（Citybus / NWFB）車廂內真實運作之 **LECIP Mon2 乘客資訊顯示系統（Passenger Information System, PIS）** 及 OMSI 2 LECIP Mon2 Addon（由 Limit Studio - George Fung 開發）運作原理而建構的開源 **GitHub Web App 模擬器**。

---

## 🌟 核心運作原理與功能對照 (Operating Principles)

本模擬器忠實重現了附件 `LECIP Mon2 Readme.pdf` 中的所有核心系統邏輯與變數控制：

| 變數 / 參數 | 系統運作原理 | 模擬器實現 |
| :--- | :--- | :--- |
| **Priority 優先次序** | 1. **新巴人力車觀光巴士** (路線開頭為 H, `CTBorNWFB=0`)<br>2. **城巴機場快線 Cityflyer** (路線開頭為 A 或 NA)<br>3. **城巴市區線** (`CTBorNWFB=1`)<br>4. **新巴市區線** (`CTBorNWFB=0`) | 依據路線代號自動切換品牌配色、車頭標籤、頂欄與底欄主題樣式。 |
| **DirectionV** | `0`: 橫向版本 (Landscape)<br>`1`: 直向版本 (Portrait - 真正巴士立柱常見規格) | 支援一鍵於直向（9:16）與橫向（16:9）外框之間即時切換。 |
| **ColorP** | `0`: 淡灰色背景 (Light Grey)<br>`1`: 淡紫色背景 (Light Purple) | 即時切換屏幕底色主題。 |
| **Display_Mode** | `0`: 正常模式 (輪播 7 秒，待機為純黑)<br>`1`: 測試/補檔模式 (輪播縮短為 3 秒，通電待機畫面為藍色) | 完整支援 7 秒 / 3 秒自動輪播時長切換，並於待機時呈現藍色工程測試畫面。 |
| **10 分鐘開車規則** | 參考城巴原廠邏輯：剩餘開車時間超過 10 分鐘時，顯示「系統未入線」待機畫面，開車前 10 分鐘內自動載入主報站介面。 | 提供開車倒數計時器滑桿，超過 10 分鐘時即時顯示未入線、實時時間與城巴 App 推廣 QR code。 |
| **車長資料與員工編號自訂** | 支援自訂員工編號、車長性別/稱謂（先生 Mr. / 女士 Ms.）及中英文姓氏。當未登入或手動隱藏時，改為顯示下載 App 資訊。 | 於控制台提供即時輸入面板（員工編號、稱謂、中英文姓氏），屏幕底欄以「車長: 陳先生 Mr. CHAN (#9821)」實時顯示；點擊屏幕車長欄可即時切換顯示/隱藏。 |
| **終點站邏輯 (Terminus)** | 當路線最後一站或名稱為 Terminal 時，系統更新顯示為「終點站 / 總站」，並提示乘客攜帶隨身物品下車。 | 到達總站時自動彈出深色高對比度總站專屬資訊框，並觸發抵達總站語音。 |
| **轉乘路線 (Interchange)** | 於 HOF 標記 `1#/2#` 的指定車站，自動切換至「轉乘路線 Interchange routes」表格（顯示路線、方向、抵站時間 ETA）。 | 在重要交匯站（如又一城、中間道、青嶼幹線轉車站、中環大會堂等）自動輪播轉乘班次表。 |
| **特殊廣播 (!SeatBelt)** | 偵測 `!SeatBelt` 指令，優先彈出佩戴安全帶提示。 | 提供獨立安全帶警報按鈕，一鍵插播安全帶警告卡片。 |
| **Max_Poster_Number** | 支援多款電子海報宣傳資訊（預設 21 款）。 | 內置 21 款繁中 / 英文雙語電子宣傳海報輪播。 |

---


---

## 📸 真實車載螢幕照片對照與排版實作 (Real Bus Display Comparison)

本模擬器對照真實城巴 LECIP Mon2 實車屏幕進行像素級還原：

### 1. 直向螢幕版本 (Vertical Screen - 參考城巴 905 線實車)
- **車長資料位置**：位於**螢幕最底部資訊列 (Footer Bar)**，上方設有紅線邊框。
- **排版結構**：
  - **左側**：`[姓氏]車長` / `Bus Captain [Surname]`（例如 `李車長` / `Bus Captain Li`）
  - **中間**：`員工編號 Staff No.` 搭配大字號粗體編號（例如 `34006`）
  - **右側**：深藍色斜邊色塊 `為您服務` / `is serving you`
- **主站台呈現**：黃白相間交替之站名列表（Stop Ladder），左側設有貫穿圓圈之藍色立線，首站以綠色圓圈及「此站 This stop」箭頭指示。

### 2. 橫向螢幕版本 (Horizontal Screen - 參考城巴機場快線 A12 實車)
- **車長資料位置**：位於**螢幕頂部資訊欄 (Top Header Bar)**，介於行駛方向與現在時間之間。
- **排版結構**：
  - **第一欄**：`[姓氏]車長` / `Bus Captain [Surname]`（例如 `黃車長` / `Bus Captain Huang`）
  - **第二欄**：`為您服務` / `is serving you`
  - **第三欄**：`員工編號 Staff No.` 與大字號員工編號（例如 `62075`）
- **右側預估時間**：站表右方設有 `預計(分鐘) ETA(min)` 即時動態抵站時間欄位。

---
## 🚌 內置預設路線 (Pre-loaded Routes)

1. **城巴 702**（海麗邨 ⇄ 又一城 / 九龍塘學校村）
   - 包含文件記載之深水埗欽州街至又一城「重新拍卡繳付分段車資」特殊警示。
2. **城巴機場快線 A21**（紅磡站 ⇄ 機場地面運輸中心）
   - 優先次序 2（Cityflyer 尊爵酒紅配色）。
   - 包含尖沙咀「中間道」站豪華酒店群地標列表，以及青嶼幹線轉車站轉乘班次。
3. **城巴 E73C**（和利菲廣場 ⇄ 飛機維修區）
   - 源自 PDF 中 Grundorf Island V4 路線補檔。
   - 途經海景灣物流中心、博覽館，並收錄「山映斜陽天接水」南環路日落景觀提示。
4. **城巴 8P**（小西灣藍灣半島 ⇄ 灣仔北）
   - 特快東區走廊路線，展示 `!SeatBelt` 廣播與港島電車/地鐵轉乘。
5. **人力車觀光巴士 H1**（中環天星碼頭 ⇄ 尖沙咀天星碼頭）
   - 優先次序 1（新巴 / 人力車懷舊紅色主題，H 字頭觸發）。
6. **自訂路線編輯器 (Custom Route JSON)**：
   - 隨時匯出或貼入自訂路線 JSON，方便巴士迷與 OMSI 補檔製作者快速調試。

---

## 🔊 音效與雙語語音系統 (Audio & Speech Engine)

- **經典叮噹報站音 (Ding-Dong Chime)**：
  - 使用現代瀏覽器 **Web Audio API** 原生合成雙音頻率振盪器（~830Hz 至 ~622Hz），無需外部音訊檔案即可精確還原城巴經典報站叮噹聲。
- **粵英雙語語音播報 (Bilingual Cantonese & English TTS)**：
  - 整合 **Web Speech API**，當巴士開出或抵站時，自動依序播報廣東話（zh-HK）與英語（en-GB / en-US）下一站及地標引導。

---

## 🚀 部署到 GitHub Pages (Deployment Guide)

本模擬器為標準靜態 Web App，無任何外部建置依賴，可直接在瀏覽器運行或一鍵託管於 GitHub Pages：

### 步驟：
1. 在 GitHub 上新建一個倉庫（例如 `ctb-lecip-mon2-simulator`）。
2. 將本項目所有檔案推送到倉庫主分支（`main`）：
   ```bash
   git init
   git add .
   git commit -m "Initial commit of CTB LECIP Mon2 Simulator"
   git branch -M main
   git remote add origin https://github.com/<your-username>/ctb-lecip-mon2-simulator.git
   git push -u origin main
   ```
3. 進入 GitHub 倉庫的 **Settings** ➔ **Pages**。
4. 在 **Build and deployment** 下的 **Branch** 選擇 `main`，資料夾選擇 `/ (root)`，點擊 **Save**。
5. 幾分鐘後即可透過 `https://<your-username>.github.io/ctb-lecip-mon2-simulator/` 訪問！

---

## 📂 檔案結構 (File Structure)

```
ctb-lecip-mon2-simulator/
├── index.html            # 主介面 HTML（包含 Mon2 屏幕外框與控制台）
├── css/
│   └── style.css         # 高精度像素級 CSS 樣式（包含直向/橫向及多種品牌主題）
├── js/
│   ├── data.js           # 路線資料庫（702, A21, E73C, 8P, H1 及 21 款海報）
│   ├── audio.js          # Web Audio 叮噹振盪器及雙語語音合成引擎
│   ├── mon2-display.js   # Mon2 核心渲染、分頁輪播與狀態機
│   ├── controller.js     # 車長控制台邏輯、參數聯動與定時巡航
│   └── app.js            # 主程式協調整合
├── assets/               # 靜態資源目錄
└── README.md             # 項目說明文件
```

---

## 📜 鳴謝與版權說明 (Credits & Disclaimer)

- 原作 OMSI 2 LECIP Mon2 Addon 由 **Limit Studio - George Fung** 製作設計。
- 本 Web App 為車迷與社群學習、展示及補檔調試用途所編寫，所有提及之城巴（Citybus）及新巴（NWFB）之名稱、商標及路線版權均歸城巴有限公司（Citybus Limited）所有。
