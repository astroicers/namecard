# namecard

賽博風格電子名片（單頁靜態 HTML），部署於 GitHub Pages。

🔗 **線上版**：<https://id.astroicers.link>

## 結構

```
namecard/
├── index.html      # 名片本體（含所有樣式與腳本）
├── assets/
│   └── me.jpg      # 頭像照片（方形）
└── CNAME           # 自訂網域：id.astroicers.link
```

## 維護

改完 `index.html` 後直接 push，約一分鐘自動上線，無 build 步驟：

```bash
git add index.html && git commit -m "update: xxx" && git push
```

換照片：覆蓋 `assets/me.jpg`（建議方形、≥320px）後 push 即可。
