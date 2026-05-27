import { create } from 'zustand';

const useVillageStore = create((set) => ({
  // 낮 / 밤 여부
  isDay: true,
  toggleDayNight: () => set((state) => ({ isDay: !state.isDay })),

  // 방문한 구역 목록 ex) ['village', 'museum']
  visitedZones: [],
  addVisitedZone: (zone) =>
    set((state) => ({
      visitedZones: state.visitedZones.includes(zone)
        ? state.visitedZones
        : [...state.visitedZones, zone],
    })),

  // 발견한 오브젝트 목록 ex) ['old-book', 'hidden-flower']
  discoveredItems: [],
  addDiscoveredItem: (item) =>
    set((state) => ({
      discoveredItems: state.discoveredItems.includes(item)
        ? state.discoveredItems
        : [...state.discoveredItems, item],
    })),

  // 관리자 로그인 여부
  isAdminLoggedIn: false,
  setAdminLoggedIn: (value) => set({ isAdminLoggedIn: value }),
}));

export default useVillageStore;
