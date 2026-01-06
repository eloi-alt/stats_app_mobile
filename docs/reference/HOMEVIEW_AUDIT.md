# HomeView.tsx - Comprehensive UX & Code Audit

> **Audit Date:** January 4, 2026  
> **Component:** `components/Views/HomeView.tsx`  
> **Lines of Code:** 329

---

## Executive Summary

The HomeView serves as the primary dashboard of the STATS App. It features a 3D "Emulsion Sphere" for overall harmony, a quick stats bar, and a grid of domain module cards. While the core functionality is solid, several issues related to placeholder assets, interactivity, and accessibility were identified.

---

## 1. Element Audit Results

### A. Greeting Section ✅ PASS
| Element | Status | Notes |
|---------|--------|-------|
| Time-based greeting | ✅ | Correctly shows "Good morning/afternoon/evening" |
| User name (Eloi) | ✅ | Displays first name from profile |
| Week/Year display | ✅ | "Week 1 • 2026" shown correctly |

**Code Reference:** Lines 93-99, 119-138

### B. Emulsion Sphere (Harmony Center) ✅ PASS
| Element | Status | Notes |
|---------|--------|-------|
| 3D Rendering | ✅ | Loads via dynamic import with skeleton fallback |
| Click interaction | ✅ | Opens `HarmonyHistoryModal` |
| Modal content | ✅ | Shows score, history chart, comparison data |

**Screenshot:**
![HarmonyHistoryModal](/Users/ooranq/.gemini/antigravity/brain/54609152-5544-48fc-bf64-1c3d236df043/harmony_modal.png)

**Code Reference:** Lines 14-17 (dynamic import), 141-146

---

### C. Quick Stats Bar ✅ PASS
| Element | Status | Notes |
|---------|--------|-------|
| Best module % | ✅ | Shows top performing domain |
| Connections count | ✅ | "2050 Tracked" |
| Low module % | ✅ | Shows domain needing improvement |

**Code Reference:** Lines 149-201

---

### D. Module Cards (Your Domains) ✅ PASS
| Element | Status | Notes |
|---------|--------|-------|
| Grid layout | ✅ | 2-column responsive grid |
| Click interaction | ✅ | Opens `ObjectiveModal` with details |
| Trendline charts | ✅ | Shows 8-week history via `ModuleChart` |
| Comparison stats | ✅ | Friends/Global averages shown |

**Screenshot:**
![Health ObjectiveModal](/Users/ooranq/.gemini/antigravity/brain/54609152-5544-48fc-bf64-1c3d236df043/health_modal.png)

**Code Reference:** Lines 222-317

---

## 2. Issues Identified

### 🔴 Critical Issues
| ID | Issue | Location | Impact |
|----|-------|----------|--------|
| C1 | **Placeholder Nav Icons** | TabBar.tsx (not HomeView) | Bottom nav shows "X" boxes instead of icons for Map/Pro/Social |

### 🟡 Medium Issues
| ID | Issue | Location | Impact |
|----|-------|----------|--------|
| M1 | **Static Charts** | ModuleChart.tsx | Charts don't respond to hover/tap - no tooltips |
| M2 | **Small Hit Areas** | Modal close button | 'x' button is only 32x32px, should be 44x44 for mobile |
| M3 | **Card Icon Size** | Line 254-258 | Icons (w-10 h-10) feel small relative to percentage text |

### 🟢 Minor Issues
| ID | Issue | Location | Impact |
|----|-------|----------|--------|
| L1 | **Hardcoded Spacer** | Line 204 | `calc(100vh - 600px)` may break on atypical devices |
| L2 | **Random History** | Lines 64-71 | `generateModuleHistory` uses `Math.random()` on every render |
| L3 | **Missing Accessibility** | Line 229-247 | Module cards lack `role="button"` and `aria-label` |

---

## 3. Weird Points

### Unused Props
```typescript
// Line 50-55: These props are destructured but NEVER USED in the component
export default function HomeView({
  ...
  pinnedModuleId,      // ❌ Never used
  isReorderMode,       // ❌ Never used
  onPinModule,         // ❌ Never used
  onMoveUp,            // ❌ Never used
  onMoveDown,          // ❌ Never used
  onToggleReorderMode, // ❌ Never used
}: HomeViewProps)
```
**Suggestion:** Remove these props if the "reorder mode" feature is deprecated, or implement the feature if planned.

### Regenerating History on Every Render
```typescript
// Line 225 - Called inside .map() on every render!
const history = generateModuleHistory(module.percentage, module.id)
```
This creates new random data every time the component re-renders, causing visual inconsistency.  
**Fix:** Use `useMemo` to cache history or move generation to a stable source.

---

## 4. Enhanceable Points

### Accessibility Improvements
```diff
// Line 229
<div
  key={module.id}
  className="rounded-2xl p-4 cursor-pointer..."
  onClick={() => {...}}
+ tabIndex={0}
+ role="button"
+ aria-label={`${colors.name}: ${module.percentage}%`}
+ onKeyDown={(e) => e.key === 'Enter' && onClick()}
>
```

### Interactive Charts
The `ModuleChart` component should accept an `onPointClick` callback to display specific values when a data point is tapped.

### Performance Optimization
Wrap `generateModuleHistory` calls in `useMemo` with module IDs as dependencies to prevent regeneration.

---

## 5. Swift/iOS Implementation Notes

| Web Pattern | iOS Equivalent |
|-------------|----------------|
| `EmulsionSphere` (Three.js) | **SceneKit** or **RealityKit** with `SCNSphere` |
| `HarmonyHistoryModal` | `UISheetPresentationController` with `.medium()` detent |
| `ModuleChart` (SVG) | **Swift Charts** framework (`Chart { LineMark }`) |
| Click-to-open cards | `UICollectionView` with `didSelectItemAt` |
| `useMemo` calculations | `@State` + computed properties |

---

## 6. Recording

![HomeView UX Test Recording](/Users/ooranq/.gemini/antigravity/brain/54609152-5544-48fc-bf64-1c3d236df043/homeview_ux_audit_1767520399252.webp)

---

*End of Audit Report*
