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

## 当前功能

- 每日现场行动卡：交通方式、距离、时长、建议出发、预约状态、现场步骤、携带物品、费用、最晚返程、Plan B 和来源核验
- 9/7 KUL入境、取行李、找Grab、The FACE与KLCC；9/8老城连续步行、午休、PETRONAS timed entry / Pavilion Plan B
- 9/9黑风洞、KUL T2、BKI沙巴入境检查；9/11约09:00换酒店并叠加动态主活动
- 亚庇天气排期：最早的good优先给环滩岛，TARP作为近海备选，Klias可舍弃且不与TARP同日
- 中国大陆游客入境准备：护照、离线材料、MDAC时间窗、沙巴单独入境提醒
- 订票中心：MDAC、PETRONAS、Mengalum、Klias、TARP；完成状态保存在本机
- Leaflet + OpenStreetMap：The FACE、老城、Batu Caves、BKI、酒店、South Jetty、海岛日落等地点可聚焦
- 2026临时码头提醒：South Jetty, Kota Kinabalu Port；TARP最晚返程船约16:00
- 同行状态 JSON 导出 / 导入，包含清单、排期、天气、收藏、预算、订票与入境状态

## 图片

景点图片已全部下载到 `public/images/places/` 并转换为 WebP，页面运行时不再请求 Wikimedia 图片直链；原始文件页、作者和许可仍保留在网站“图片来源”折叠项与 `src/data/imageCredits.ts` 中。图片最长边约1280px，页面按容器裁切。

运行图片审计：

```bash
npm run audit:images
npm run audit:dist
```

审计会检查源码引用是否有对应本地文件、来源记录是否完整、图片是否重复，以及构建产物是否残留第三方图片直链。

## 修改旅行数据

行程、航班、酒店、清单、地图、图鉴、订票和入境数据分别位于：

- `src/data/trip.ts`
- `src/data/itinerary.ts`
- `src/data/flights.ts`
- `src/data/hotels.ts`
- `src/data/checklists.ts`
- `src/data/places.ts`
- `src/data/discover.ts`
- `src/data/bookings.ts`
- `src/data/entryPrep.ts`
- `src/data/durians.ts`
- `src/data/imageCredits.ts`
- `src/utils/planSabah.ts`

Checklist、每日完成、天气排期、SabahPlan、预算、MDAC、入境准备、订票、红树林、收藏、旅行模式和实际集合点使用浏览器 `localStorage` 保存。

## 技术栈

React + TypeScript + Vite + Leaflet / OpenStreetMap + Lucide Icons + vite-plugin-pwa。
