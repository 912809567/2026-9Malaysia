import assert from 'node:assert/strict'
import { alternativeAttractions, alternativeById } from '../src/data/alternatives'
import { itinerary, createSabahActivityItem, type DayPlan, type ItineraryItem } from '../src/data/itinerary'
import { defaultSabahPlan, activityLabel, customSabahLabel, isCustomSabahActivity, type SabahPlan } from '../src/utils/planSabah'
import { assessDayLoad, checkInsertion, checkReplacement } from '../src/utils/itineraryConflictChecker'
import { applyItineraryOverrides, getItemSlotId, replacementCandidates, restoreDay, restoreSlot, upsertOverride } from '../src/utils/itineraryCustomizer'

function item(partial: Partial<ItineraryItem> = {}): ItineraryItem {
  const id = partial.id ?? 'test-item'
  const time = partial.time ?? '10:00'
  return {
    id,
    time,
    title: '测试景点',
    summary: '测试行程',
    details: [],
    dateTime: '2026-09-08T10:00:00+08:00',
    reservationStatus: 'none',
    ...partial,
  }
}

function day(date: string, items: ItineraryItem[]): DayPlan {
  return { date, weekday: '测试日', title: '测试行程', intensity: '适中', items }
}

function candidate(id: string) {
  const value = alternativeById[id]
  assert(value, '缺少候选景点：' + id)
  return value
}

const central = item({
  id: 'd8-1',
  slotId: 'central-market',
  time: '10:45',
  title: '中央市场段 · 独立广场老城连续步行线',
  duration: '约3小时',
  zone: 'Old Town',
  mapTarget: 'Central Market Kuala Lumpur',
  replaceability: 'flexible',
  slotType: 'half-day',
})
const oldTownStart = item({
  id: 'd8-0',
  time: '09:45',
  title: '独立广场',
  duration: '约45分钟',
  zone: 'Old Town',
  mapTarget: 'Merdeka Square',
  slotId: 'merdeka-square',
})
const oldTownNext = item({
  id: 'd8-2',
  time: '12:00',
  title: '茨厂街',
  duration: '约1小时',
  zone: 'Old Town',
  mapTarget: 'Petaling Street',
  slotId: 'petaling-street',
})
const centralItems = [oldTownStart, central, oldTownNext]

assert.equal(alternativeAttractions.filter(place => place.city === 'kuala-lumpur' && place.images.length > 0).length, 16, '吉隆坡候选应有16个可展示景点')
assert.equal(alternativeAttractions.filter(place => place.city === 'kota-kinabalu' && place.images.length > 0).length, 14, '亚庇候选应有14个可展示景点')
assert(alternativeAttractions.every(place => place.images.every(image => image.src.endsWith('.webp'))), '候选图片应统一使用WebP')
assert.equal(itinerary.find(plan => plan.date === '9/8')?.items.find(entry => entry.id === 'd8-1')?.title, central.title, '默认中央市场标题应保持基线版本')

const candidateIds = replacementCandidates(central, centralItems, undefined, '9/8').map(entry => entry.candidate.id)
assert(candidateIds.includes('national-mosque'), '中央市场应出现国家清真寺候选')
assert(candidateIds.includes('kl-tower'), '中央市场应出现吉隆坡塔候选')
assert(candidateIds.includes('batu-caves'), '中央市场应出现黑风洞候选')

const nationalReport = checkReplacement({
  date: '9/8',
  current: central,
  candidate: candidate('national-mosque'),
  previous: oldTownStart,
  next: oldTownNext,
  existingItems: centralItems,
})
assert.equal(nationalReport.canConfirm, true, '国家清真寺应允许替换中央市场')
assert.equal(nationalReport.route.quality, 'green', '国家清真寺应为绿色顺路')

const towerReport = checkReplacement({
  date: '9/8',
  current: central,
  candidate: candidate('kl-tower'),
  previous: oldTownStart,
  next: oldTownNext,
  existingItems: [...centralItems, item({ id: 'petronas-viewpoint', title: '双子塔登塔', zone: 'KLCC' })],
})
assert.equal(towerReport.canConfirm, true, '吉隆坡塔应允许在预览后确认')
assert.equal(towerReport.route.quality, 'yellow', '吉隆坡塔应显示黄色路线')
assert(towerReport.warnings.some(message => message.includes('体验存在一定重复')), '吉隆坡塔应提示与双子塔体验重复')

const batuReport = checkReplacement({
  date: '9/8',
  current: central,
  candidate: candidate('batu-caves'),
  previous: oldTownStart,
  next: oldTownNext,
  existingItems: centralItems,
})
assert.equal(batuReport.canConfirm, false, '黑风洞不能塞进中央市场小时级槽位')
assert.equal(batuReport.route.quality, 'red', '黑风洞应显示红色路线')
assert(batuReport.blockers.some(message => message.includes('北郊') || message.includes('半日')), '黑风洞应说明北郊半日不匹配')

const fixedHotel = item({
  id: 'd11-fixed',
  slotId: 'hotel-transfer-9-11',
  title: '亚庇喜来登酒店 → 亚庇凯悦尚萃酒店 · 行李先行',
  replaceability: 'fixed',
  zone: 'Gaya / City Centre',
})
const fixedReport = checkReplacement({
  date: '9/11',
  current: fixedHotel,
  candidate: candidate('national-mosque'),
  existingItems: [fixedHotel],
})
assert.equal(fixedReport.canConfirm, false, '固定换酒店事项不可替换')
assert(fixedReport.blockers.some(message => message.includes('固定事项')), '固定事项应给出锁定提示')

const preserved = applyItineraryOverrides(
  [day('9/11', [fixedHotel, item({ id: 'd11-city', time: '10:00', title: '亚庇市区', slotId: 'city-day' })])],
  [{ date: '9/11', slotId: 'hotel-transfer-9-11', action: 'remove' }],
  alternativeById,
)[0]
assert.deepEqual(preserved.items.map(entry => entry.id), ['d11-fixed', 'd11-city'], '应用删除覆盖时必须保留9/11换酒店固定事件')

const override = upsertOverride([], { date: '9/8', slotId: 'central-market', action: 'replace', attractionId: 'national-mosque' })
const customDay = applyItineraryOverrides([day('9/8', centralItems)], override, alternativeById)[0]
assert.equal(customDay.items[1].source, 'custom', '替换后项目应标记为CUSTOM')
assert.equal(customDay.items[1].title, '国家清真寺', '替换后应显示新景点')
assert.equal(customDay.items[2].time, '12:12', '替换后应把下一项按游览+交通时长顺延')
assert.equal(getItemSlotId(customDay.items[1]), 'central-market', '替换后仍应保留原槽位ID')

const restoredSlot = restoreSlot(override, '9/8', 'central-market')
const defaultAgain = applyItineraryOverrides([day('9/8', centralItems)], restoredSlot, alternativeById)[0]
assert.equal(defaultAgain.items[1].title, central.title, '恢复单项应回到默认景点')
assert.equal(defaultAgain.items[1].source, 'default', '恢复单项应回到默认来源')
const replaceAndMove = upsertOverride(override, { date: '9/8', slotId: 'central-market', action: 'move', targetSlotId: 'petaling-street' })
assert(replaceAndMove.some(entry => entry.action === 'replace'), '调序不能抹掉已有替换覆盖')
assert(replaceAndMove.some(entry => entry.action === 'move'), '自定义事项应记录调序覆盖')
const movedCustomDay = applyItineraryOverrides([day('9/8', centralItems)], replaceAndMove, alternativeById)[0]
assert.deepEqual(movedCustomDay.items.map(entry => entry.title), [oldTownStart.title, oldTownNext.title, '国家清真寺'], '替换后的事项应可继续调序')
const removedCustomDay = applyItineraryOverrides([day('9/8', centralItems)], upsertOverride(override, { date: '9/8', slotId: 'central-market', action: 'remove', removedTitle: central.title }), alternativeById)[0]
assert(!removedCustomDay.items.some(entry => entry.slotId === 'central-market'), '自定义事项应支持删除')
assert(replacementCandidates(customDay.items[1], customDay.items, undefined, '9/8').length > 0, '自定义事项仍应有继续调整的候选')
const withOtherDay = upsertOverride(override, { date: '9/9', slotId: 'd9-1', action: 'remove' })
const restoredDay = restoreDay(withOtherDay, '9/8')
assert(!restoredDay.some(entry => entry.date === '9/8'), '恢复某一天应清除该天全部覆盖')
assert(restoredDay.some(entry => entry.date === '9/9'), '恢复某一天不能清除其它日期覆盖')
assert.equal(applyItineraryOverrides([day('9/8', centralItems)], [], alternativeById)[0].items[1].title, central.title, '空覆盖应完整保留默认行程')

const fullDayInShortSlot = checkReplacement({
  date: '9/8',
  current: central,
  candidate: candidate('kinabalu-park-kundasang'),
  previous: oldTownStart,
  next: oldTownNext,
  existingItems: centralItems,
})
assert.equal(fullDayInShortSlot.canConfirm, false, '全天项目不能塞进小时级槽位')
assert(fullDayInShortSlot.blockers.some(message => message.includes('全天项目')), '全天项目冲突应给出明确提示')

const flightConflict = checkInsertion({
  date: '9/9',
  startTime: '14:00',
  durationMin: 180,
  slotType: 'short',
  nextFixedTime: '16:30',
  routeMinutes: 15,
})
assert.equal(flightConflict.canConfirm, false, '16:30航班前没有三小时新增景点空位')
assert(flightConflict.blockers.some(message => message.includes('固定事项') || message.includes('航班')), '航班冲突应阻止确认')
assert.equal(checkInsertion({ date: '9/13', startTime: '07:00', durationMin: 30, slotType: 'short' }).canConfirm, false, '返程日早晨不可增加景点')

const outdoorLoad = assessDayLoad([
  item({ id: 'outdoor-a', time: '09:00', duration: '约2小时', environment: 'outdoor', sunExposure: 'high' }),
  item({ id: 'outdoor-b', time: '11:15', duration: '约2小时', environment: 'outdoor', sunExposure: 'high' }),
])
assert(outdoorLoad.warnings.some(message => message.includes('连续户外')), '连续户外时间超过3小时应提醒')

const kinabalu = candidate('kinabalu-park-kundasang')
const tarpCurrent = item({
  id: '2026-09-12-tarp',
  slotId: 'sabah-main-2026-09-12',
  time: '08:30',
  title: 'TARP近海双岛 · 沙比岛＋马努干岛',
  zone: 'Gaya / City Centre',
  mapTarget: 'South Jetty, KK Port',
  replaceability: 'major',
  slotType: 'full-day',
})
const highlandReport = checkReplacement({
  date: '9/12',
  current: tarpCurrent,
  candidate: kinabalu,
  existingItems: [tarpCurrent],
})
assert.equal(highlandReport.canConfirm, true, '全天TARP应允许预览并替换为全天高地线路')
assert.equal(highlandReport.route.quality, 'red', '亚庇到昆达山应显示红色长途路线提示')
assert(highlandReport.warnings.some(message => message.includes('全天换全天')), '全天替换应说明独立天气窗口')

const customActivity = { source: 'alternative' as const, attractionId: kinabalu.id }
const customSabahItem = createSabahActivityItem('2026-09-12', customActivity)
assert.equal(customSabahItem.source, 'custom', 'SabahPlan自定义项目应生成CUSTOM行程项')
assert.equal(customSabahItem.slotId, 'sabah-main-2026-09-12', '自定义全天项目应复用Sabah主活动槽位')
assert.equal(customSabahItem.title, kinabalu.nameZh, '自定义SabahPlan应显示候选景点')
assert.equal(customSabahItem.slotType, 'full-day', '神山候选应保持全天属性')
assert(isCustomSabahActivity(customActivity), '自定义Sabah活动应可被类型守卫识别')
assert.equal(activityLabel(customActivity), kinabalu.nameZh, '天气助手与Timeline应读取同一自定义活动标签')
assert.equal(customSabahLabel(customActivity), '已自定义：' + kinabalu.nameZh, '自定义Sabah活动应显示锁定标签')
const customPlan: SabahPlan = { ...defaultSabahPlan, '2026-09-12': customActivity }
assert(isCustomSabahActivity(customPlan['2026-09-12']), '自定义SabahPlan应保留alternative活动对象')

console.log('✓ itinerary customization scenarios passed')
console.log('  fixed protection · restore slot/day/all baseline · green/yellow/red route checks')
console.log('  time reflow · flight conflict · full-day slot guard · SabahPlan custom sync')
