# 📊 Google Sheet 資料庫結構建議書

為了配合這款 Timeline App 的運作邏輯（年份軸與機型卡片分離），建議將 Google Sheet 拆分為兩個分頁 (Tabs) 來管理，這樣轉出 JSON 時會最乾淨，也能避免重複輸入年份說明。

## 分頁 1：Year_Timeline (年份主軸)
這個分頁管理「時間軸上顯示的文字」，也就是該年度的市場總結。

| Year (A) | Era_Title (B) | Market_Description (C) |
| :--- | :--- | :--- |
| **2007** | 前置控制普及年 | 博世確立前置控制面板標準，Makita 則以此時期的雙軌精度聞名... |
| **2008** | 高轉速移動性 | 地板裝修需求帶動了高轉速小鋸片的市場... |
| **2010** | DXT 與滑移革命 | Makita DXT 挑戰 12 吋切深極限，Bosch 推出機械手臂... |

*   **Year**: 對應時間軸刻度。
*   **Era_Title**: (選填) 該年度的簡短標題 (如：DXT元年)。
*   **Market_Description**: 該年度的市場概況，會在點擊年份時展開。

---

## 分頁 2：Models_Data (機型詳細資料)
這個分頁管理「每一個點」的內容。您的欄位規劃很棒，我稍微將「規格」具體化，方便程式未來抓取做比較。

| ID (A) | Year (B) | Brand (C) | Model (D) | Type (E) | Blade (F) | Spec_Motor (G) | Spec_Feature (H) | Image_File (I) | Description (J) | Ref_Link (K) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| mak_1016 | 2009 | Makita | LS1016L | DXT Slide | 10" | 15A / 3200rpm | 4-Rail, DXT | `Makita_LS1016L_2009.jpg` | 首款 DXT 技術導入... | http... |
| bcl_axial | 2010 | Bosch | GCM 12 SD | Axial-Glide | 12" | 15A / 3800rpm | Zero-Clearance | `Bosch_GCM12SD_2010.jpg` | 世界首創機械手臂... | http... |

### 欄位說明建議：
1.  **ID**: **(重要)** 建議格式 `brand_year_model` (如 `mak_2009_ls1016`)，這是程式辨識唯一性的關鍵。
2.  **Type (類型)**: 建議統一用語，如 `Dual Bevel`, `Sliding`, `Compound`，方便未來做篩選器。
3.  **Blade (鋸片)**: 統一格式 (e.g., `10"` 或 `254mm`)，方便程式在 Side Panel 顯示規格。
4.  **Image_File**: 建議直接填「檔名」就好 (App 會自動去 `assets/` 資料夾找)，比填長串 URL 穩定。
5.  **Description**: 這裡放針對「該台機器」的具體評價，而不是年份評價。

---

## 💡 為什麼要這樣分？
如果您把「年份說明」跟「機型」寫在同一張表，當 2007 年有 5 台機器時，您就必須重複貼上 5 次一樣的「2007 市場總結」，這在管理上很累贅。拆成兩張表 (關聯式資料庫概念) 是最穩健的作法。
