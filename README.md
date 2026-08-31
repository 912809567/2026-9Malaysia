# Malaysia 2026 · 吉隆坡 × 亚庇

深圳—吉隆坡—亚庇 7 天 6 晚自由行的交互式旅行攻略，针对手机现场查看设计。

## 本地启动

```bash
npm install
npm run dev
```

## 构建与部署

```bash
npm run build
```

项目已配置 GitHub Actions：推送到 `main` 后自动构建并发布 GitHub Pages。Vite 使用相对资源路径，适配仓库子路径；网站采用单页滚动结构，不使用会导致 Pages 刷新 404 的服务端路由。

## 修改旅行数据

行程、航班、酒店、清单和地图地点分别位于：

- `src/data/trip.ts`
- `src/data/itinerary.ts`
- `src/data/flights.ts`
- `src/data/hotels.ts`
- `src/data/checklists.ts`
- `src/data/places.ts`

Checklist、每日完成、天气排期、预算、MDAC 和红树林开关使用浏览器 `localStorage` 保存。PWA manifest 与离线 service worker 已配置。

## 技术栈

React + TypeScript + Vite + Leaflet / OpenStreetMap + Lucide Icons。

## 发布地址

仓库创建后，GitHub Pages 地址通常为：

`https://<用户名>.github.io/<仓库名>/`
