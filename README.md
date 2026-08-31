# Malaysia 2026 · 吉隆坡 × 亚庇

深圳—吉隆坡—亚庇 7天6晚自由行的手机优先旅行现场工具。

## 本地启动

```bash
npm install
npm run dev
```

## 构建与部署

```bash
npm run lint
npm run build
```

项目已配置 GitHub Actions：推送到 `main` 后自动构建并发布 GitHub Pages。Vite 使用相对资源路径，适配仓库子路径；网站采用单页滚动结构，不使用会导致 Pages 刷新 404 的服务端路由。

线上地址：<https://912809567.github.io/2026-9Malaysia/>

## 本轮功能

- 统一 SabahPlan：天气助手、每日行程、海岛模块和图鉴入口共用同一排期状态
- 9/11 固定换酒店叠加动态主活动，不会吞掉环滩岛资格
- 今天按钮、下一项、旅行模式、动态日落倒计时
- 锁定方案 / 重新按天气规划，三天全 bad 时不安排远海
- Leaflet + OpenStreetMap；可保存实际出海码头名称和 Google Maps URL
- vite-plugin-pwa：App Shell、JS/CSS、核心数据和本地图片预缓存，地图瓦片离线时显示说明
- 景点与活动图鉴：分类、收藏、卡片/Gallery、Lightbox、动态查看行程
- 同行状态 JSON 导出 / 导入

## 修改旅行数据

行程、航班、酒店、清单、地图和图鉴数据分别位于：

- `src/data/trip.ts`
- `src/data/itinerary.ts`
- `src/data/flights.ts`
- `src/data/hotels.ts`
- `src/data/checklists.ts`
- `src/data/places.ts`
- `src/data/discover.ts`
- `src/data/durians.ts`
- `src/data/imageCredits.ts`
- `src/utils/planSabah.ts`

Checklist、每日完成、天气排期、SabahPlan、预算、MDAC、红树林、收藏、旅行模式和实际集合点使用浏览器 `localStorage` 保存。

## 图片

图片优先使用 Wikimedia Commons 的可追溯素材，并在网站“图片来源”折叠项与 `src/data/imageCredits.ts` 中记录作者、许可和原始链接。暂时无法确认授权或无法获得准确地点照片的卡片使用图标占位，不抓取用户图片。

## 技术栈

React + TypeScript + Vite + Leaflet / OpenStreetMap + Lucide Icons + vite-plugin-pwa。
