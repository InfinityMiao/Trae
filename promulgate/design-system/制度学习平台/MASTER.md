# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

***

**Project:** 制度学习平台
**Generated:** 2026-05-02
**Category:** Enterprise Learning & Exam Management System (Green Theme)
**Stack:** Vue 3 + TypeScript + Element Plus

***

## 1. Color Palette

> **Simplification Note:** Compared to earlier versions, the following duplicate variables have been removed (their usages merged into the kept variable):
>
> - `--color-text-dark` → use `--color-text` (same hex `#1E293B`)
> - `--color-text-placeholder` → use `--color-text-muted` (close values)
> - `--color-border-light` → use `--color-divider` (same hex `#F1F5F9`)
> - `--color-primary-hover` → use `--color-primary-hover-bg` (same value)
> - `--color-primary-active` → use `--color-primary-active-bg` (same value)
> - `--color-amber` / `--color-amber-light` → removed (not defined in App.vue)
>
> **Total CSS color variables reduced from 52 → 39** (13 removed).

### 1.1 Primary Brand Colors (Emerald Green)

| Role              | Hex                    | CSS Variable                | Usage                               |
| ----------------- | ---------------------- | --------------------------- | ----------------------------------- |
| Primary           | `#059669`              | `--color-primary`           | Main buttons, links, active states  |
| Primary Dark      | `#047857`              | `--color-primary-dark`      | Button hover, darker accents        |
| Primary Light     | `#34D399`              | `--color-primary-light`     | Gradients, lighter accents          |
| Primary Bg        | `#ECFDF5`              | `--color-primary-bg`        | Subtle backgrounds, tag backgrounds |
| Primary Hover Bg  | `rgba(5,150,105,0.06)` | `--color-primary-hover-bg`  | Row hover, card hover               |
| Primary Active Bg | `rgba(5,150,105,0.12)` | `--color-primary-active-bg` | Active menu items, selected states  |
| Primary Border    | `rgba(5,150,105,0.3)`  | `--color-primary-border`    | Focus rings, active borders         |
| Primary Shadow    | `rgba(5,150,105,0.25)` | `--color-primary-shadow`    | Button shadows, glow effects        |

### 1.2 Secondary & Accent Colors

| Role            | Hex       | CSS Variable              | Usage                                |
| --------------- | --------- | ------------------------- | ------------------------------------ |
| Secondary       | `#6EA7ED` | `--color-secondary`       | Secondary interactive elements       |
| Secondary Light | `#BFD9F7` | `--color-secondary-light` | Gradient endpoints                   |
| CTA/Accent      | `#22C55E` | `--color-cta`             | Call-to-action, vibrant green accent |
| Success         | `#22C55E` | `--color-success`         | Passed status, positive indicators   |
| Success Bg      | `#DCFCE7` | `--color-success-bg`      | Success tag/alert backgrounds        |

### 1.3 Semantic Colors

| Role          | Hex       | CSS Variable            | Usage                              |
| ------------- | --------- | ----------------------- | ---------------------------------- |
| Danger        | `#EF4444` | `--color-danger`        | Delete, error, fail, logout hover  |
| Danger Light  | `#F87171` | `--color-danger-light`  | Danger gradient endpoints          |
| Danger Bg     | `#FEF2F2` | `--color-danger-bg`     | Danger tag backgrounds             |
| Warning       | `#FBBF24` | `--color-warning`       | Pending status, warning indicators |
| Warning Light | `#FDDD8C` | `--color-warning-light` | Warning gradient endpoints         |
| Info          | `#3B82F6` | `--color-info`          | Info badges, type indicators       |
| Info Bg       | `#DBEAFE` | `--color-info-bg`       | Info tag backgrounds               |

### 1.4 Extended Palette

| Role       | Hex       | CSS Variable         | Usage                                       |
| ---------- | --------- | -------------------- | ------------------------------------------- |
| Blue       | `#0C8BC6` | `--color-blue`       | Employee type (blue avatar), document stats |
| Blue Light | `#8EDAFB` | `--color-blue-light` | Blue gradient endpoints                     |
| Blue Bg    | `#E6F5FF` | `--color-blue-bg`    | Action icon backgrounds                     |
| Purple     | `#8B5CF6` | `--color-purple`     | Multiple choice question type               |
| Purple Bg  | `#EDE9FE` | `--color-purple-bg`  | Purple tag backgrounds                      |

### 1.5 Neutral Colors

| Role             | Hex       | CSS Variable               | Usage                                              |
| ---------------- | --------- | -------------------------- | -------------------------------------------------- |
| Surface          | `#FFFFFF` | `--color-surface`          | Cards, header, modals                              |
| Surface Hover    | `#FAFAFA` | `--color-surface-hover`    | Action item hover                                  |
| Background       | `#ecf5f1` | `--color-background`       | Page backgrounds (light green tint)                |
| Background Light | `#edf8f3` | `--color-background-light` | Login page, lighter areas                          |
| Border           | `#E2E8F0` | `--color-border`           | Card borders, table borders                        |
| Divider          | `#F1F5F9` | `--color-divider`          | Dividers, subtle item borders, table header bottom |

### 1.6 Text Colors

| Token                    | Hex       | Usage                                          |
| ------------------------ | --------- | ---------------------------------------------- |
| `--color-text`           | `#1E293B` | Main body text, titles, headings (unified)     |
| `--color-text-secondary` | `#64748B` | Secondary text, descriptions                   |
| `--color-text-tertiary`  | `#475569` | Table headers, secondary info                  |
| `--color-text-muted`     | `#94A3B8` | Muted text, subtitles, timestamps, placeholder |
| `--color-text-light`     | `#FFFFFF` | Light text on dark/colored backgrounds         |

### 1.7 Sidebar Colors

| Token                        | Hex/CSS                  | Usage                                  |
| ---------------------------- | ------------------------ | -------------------------------------- |
| `--color-sidebar-bg`         | `#064E3B`                | Dark sidebar background (deep emerald) |
| `--color-sidebar-text`       | `#A7F3D0`                | Default sidebar icon/text              |
| `--color-sidebar-text-light` | `#D1FAE5`                | Hover sidebar text                     |
| `--color-sidebar-hover`      | `rgba(255,255,255,0.15)` | Menu item hover                        |
| `--color-sidebar-active`     | `rgba(255,255,255,0.06)` | Active menu bg                         |
| `--color-sidebar-border`     | `rgba(255,255,255,0.08)` | Sidebar item separators                |

### 1.8 Special Colors

| Token               | Value                   | Usage                    |
| ------------------- | ----------------------- | ------------------------ |
| `--overlay-white`   | `rgba(255,255,255,0.5)` | Login bg pattern overlay |
| `--watermark-color` | `rgba(128,128,128,0.2)` | PDF watermark text       |

***

## 2. Typography

### 2.1 Font Families

| Role    | Font          | CSS Variable     | Weight                  | Usage                                     |
| ------- | ------------- | ---------------- | ----------------------- | ----------------------------------------- |
| Heading | **Fira Code** | `--font-heading` | 400, 500, 600, 700      | Page titles, card titles, section headers |
| Body    | **Fira Sans** | `--font-body`    | 300, 400, 500, 600, 700 | All body text, labels, descriptions       |

**Google Fonts Import:**

```css
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:wght@300;400;500;600;700&display=swap');
```

### 2.2 Type Scale

| Level         | Size    | Weight  | Usage                                        |
| ------------- | ------- | ------- | -------------------------------------------- |
| Hero Title    | 28-32px | 700     | Dashboard stat values, result scores         |
| Page Title    | 24px    | 700     | `h1.page-title`                              |
| Section Title | 20px    | 700     | `span.section-title` (exam records)          |
| Card Title    | 16-18px | 600-700 | Quick card titles, exam names, detail titles |
| Subtitle      | 16px    | 600     | Breadcrumb, section headers                  |
| Body          | 14-15px | 400-500 | Table cells, regulation items, descriptions  |
| Small         | 12-13px | 400     | Tags, meta info, timestamps                  |
| Micro         | 11px    | 400-600 | Menu dividers, sidebar sub-labels            |

***

## 3. Spacing System

### 3.1 Spacing Tokens

| Token         | Value             | Usage                                                 |
| ------------- | ----------------- | ----------------------------------------------------- |
| `--space-xs`  | `4px` / `0.25rem` | Tag padding gaps                                      |
| `--space-sm`  | `8px` / `0.5rem`  | Icon gaps, inline spacing, card body gap (exam cards) |
| `--space-md`  | `16px` / `1rem`   | Standard padding, card inner padding, dialog padding  |
| `--space-lg`  | `24px` / `1.5rem` | Section padding, page header margin, form item gap    |
| `--space-xl`  | `32px` / `2rem`   | Card body padding (detail), dialog content padding    |
| `--space-2xl` | `48px` / `3rem`   | Section margins, result card padding                  |
| `--space-3xl` | `64px` / `4rem`   | Hero padding (result icon spacing)                    |

### 3.2 Layout Spacing

| Context           | Padding          | Notes                        |
| ----------------- | ---------------- | ---------------------------- |
| Page main content | `28px`           | Consistent across all pages  |
| Card body         | `20px`           | Standard card inner padding  |
| Card header       | `16px 20px`      | Header padding               |
| Dialog header     | `20px 24px`      | With bottom border           |
| Dialog body       | `24px`           | Form content                 |
| Dialog footer     | `16px 24px`      | With top border              |
| Table cell        | `0` (full width) | Table card body `padding: 0` |
| Pagination        | `16px 20px`      | Table bottom spacing         |

### 3.3 Gap Patterns

| Context            | Gap             | Usage                     |
| ------------------ | --------------- | ------------------------- |
| Grid gutter        | `20px`          | `el-row :gutter="20"`     |
| Quick actions grid | `12px`          | Action items grid gap     |
| Nav items          | `4px`           | Header nav button spacing |
| Form items         | `16px` (bottom) | Standard form spacing     |
| Section margin     | `24px`          | Between major sections    |
| Card bottom margin | `20px`          | Profile cards             |

***

## 4. Border Radius

| Token         | Value  | Usage                                            |
| ------------- | ------ | ------------------------------------------------ |
| `--radius-sm` | `8px`  | Buttons, inputs, tags, tree nodes, nav buttons   |
| `--radius-md` | `12px` | Option cards, exam cards, detail sections        |
| `--radius-lg` | `16px` | Main cards, dialogs, stat cards                  |
| Circle        | `50%`  | Avatars, result icons, notification dots         |
| Rounded       | `10px` | Logo wrapper, icon wrappers, action icon buttons |

***

## 5. Shadow Depths

| Token                 | Value                          | Usage                       |
| --------------------- | ------------------------------ | --------------------------- |
| `--shadow-sm`         | `0 1px 2px rgba(0,0,0,0.05)`   | Subtle lift                 |
| `--shadow-md`         | `0 4px 6px rgba(0,0,0,0.1)`    | Cards, buttons              |
| `--shadow-lg`         | `0 10px 15px rgba(0,0,0,0.1)`  | Modals, dropdowns           |
| `--shadow-xl`         | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |
| `--shadow-header`     | `0 1px 3px rgba(0,0,0,0.08)`   | Sticky header bar           |
| `--shadow-card-hover` | `0 8px 20px rgba(0,0,0,0.1)`   | Card hover lift state       |
| `--shadow-login`      | `0 12px 40px rgba(0,0,0,0.12)` | Login card                  |
| `--shadow-sidebar`    | `rgba(0,0,0,0.15)`             | Sidebar right shadow        |
| `--shadow-pdf`        | `0 2px 8px rgba(0,0,0,0.15)`   | PDF pages                   |

***

## 6. Component Specs

### 6.1 Navigation & Header

**Frontend Header (sticky):**

- Height: `64px`
- Padding: `0 28px`
- Background: `var(--color-surface)`
- Shadow: `var(--shadow-header)`
- Z-index: `5`
- Logo wrapper: `40x40px`, `border-radius: 10px`, gradient primary → primary-light

**Admin Sidebar:**

- Width: `240px`
- Background: `linear-gradient(180deg, var(--color-sidebar-bg))` (deep emerald `#064E3B`)
- Menu items: `height: 44px`, `border-radius: 10px`, `margin: 4px 12px`
- Active item: primary border bg (emerald), white text, shadow
- Menu divider: uppercase, primary (emerald) color, `font-size: 11px`, `letter-spacing: 1px`

### 6.2 Buttons

```css
/* Primary Button */
.btn-primary {
  background: var(--color-primary);
  border-color: var(--color-primary);
  font-weight: 600;
  border-radius: var(--radius-sm);
}
.btn-primary:hover {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
}

/* Login / Submit Button (full-width gradient) */
.submit-btn {
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  border: none;
  font-weight: 600;
  font-size: 15px;
}
.submit-btn:hover {
  background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary));
  transform: translateY(-1px);
  box-shadow: 0 6px 16px var(--color-primary-shadow);
}

/* Nav Button (text) */
.nav-btn {
  font-size: 14px;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  cursor: pointer;
}
.nav-btn:hover {
  color: var(--color-primary);
  background: var(--color-primary-hover-bg);
}
.nav-btn.active {
  color: var(--color-primary);
  font-weight: 600;
}
.logout-btn:hover {
  color: var(--color-danger);
  background: var(--color-danger-light);
}

/* Secondary (outline) */
.retake-btn {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.retake-btn:hover {
  background: var(--color-primary-hover-bg);
  border-color: var(--color-primary);
  color: var(--color-primary);
}
```

### 6.3 Cards

```css
/* Main Content Card */
.card {
  border-radius: var(--radius-lg);  /* 16px */
  border: 1px solid var(--color-border);
  transition: all 0.25s ease;
}

/* Quick Action / Stat Card (hoverable) */
.quick-card,
.stat-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.25s ease;
}
.quick-card:hover,
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-card-hover);
}

/* Table Card (no padding body) */
.table-card {
  border-radius: 16px;
  border: 1px solid var(--color-border);
}
.table-card :deep(.el-card__body) {
  padding: 0;
}

/* Filter Card */
.filter-card {
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

/* Exam Card */
.exam-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  transition: all 0.25s ease;
}
.exam-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-card-hover);
}
```

### 6.4 Icon Wrappers (Gradient Icon Boxes)

```css
/* Stat/Quick icon wrapper - 4 sizes */
/* Large (52px) - Quick card icons */
.quick-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Medium (48px) - Stat card icons */
.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  /* same flex layout */
}

/* Action icon (44px) */
.action-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  /* same flex layout */
}

/* Small (40px) - Profile, reg icon */
.profile-icon-wrapper,
.reg-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
```

**Icon Wrapper Color Combinations:**

| Purpose           | Background                                                                  | Icon Color             |
| ----------------- | --------------------------------------------------------------------------- | ---------------------- |
| Primary (emerald) | `linear-gradient(135deg, var(--color-primary), var(--color-primary-light))` | `var(--color-surface)` |
| Blue              | `linear-gradient(135deg, var(--color-blue), var(--color-blue-light))`       | `var(--color-surface)` |
| Danger/Feedback   | `linear-gradient(135deg, var(--color-danger), var(--color-danger-light))`   | `var(--color-surface)` |
| Warning           | `linear-gradient(135deg, var(--color-warning), var(--color-warning-light))` | `var(--color-surface)` |
| Primary Bg        | `var(--color-primary-bg)`                                                   | `var(--color-primary)` |
| Blue Bg           | `var(--color-blue-bg)`                                                      | `var(--color-blue)`    |
| Danger Bg         | `var(--color-danger-bg)`                                                    | `var(--color-danger)`  |
| Success / Pass    | `linear-gradient(135deg, var(--color-cta), var(--color-secondary))`         | `var(--color-surface)` |
| Fail              | `linear-gradient(135deg, var(--color-danger), var(--color-danger-light))`   | `var(--color-surface)` |

### 6.5 Forms & Inputs

```css
.input-field {
  border-radius: var(--radius-sm);
  box-shadow: 0 0 0 1px var(--color-border) inset;
  transition: all 0.2s ease;
}
.input-field:hover {
  box-shadow: 0 0 0 1px var(--color-secondary) inset;
}
.input-field:focus {
  box-shadow: 0 0 0 1px var(--color-primary) inset,
              0 0 0 3px var(--color-primary-border);
}
```

### 6.6 Tags & Badges

**Status Tags (Element Plus):**

| Status                | `type`    | Usage                 |
| --------------------- | --------- | --------------------- |
| Online/Active/Success | `success` | Green, passed, active |
| Offline/Disabled      | `info`    | Grey, offline         |
| Pending               | `warning` | Yellow, pending       |
| Processing            | `primary` | Blue, processing      |
| Danger/Fail           | `danger`  | Red, failed           |

**Custom Status Dots:**

```css
.status-dot.active { background: var(--color-primary); }
.status-dot.disabled { background: var(--color-danger); }
```

**Custom Tags:**

- `category-tag`: `background: var(--color-primary-bg)`, `color: var(--color-primary)`, `border: none`, `border-radius: 6px`
- `system-tag`: `color: var(--color-danger)`, `border: 1px solid var(--color-danger-light)`, `background: var(--color-danger-bg)`
- `score-tag`: `border-radius: 6px`
- `type-tag`: `border-radius: 8px`, `border: none`, `font-weight: 600`

### 6.7 Tables

```css
.table-card :deep(.el-table__header th) {
  background: var(--color-background);
  font-weight: 600;
  color: var(--color-text-tertiary);
  font-size: 13px;
}
```

- Table header bg: `var(--color-background)`
- Stripe rows for readability
- Pagination: `padding: 16px 20px`, `justify-content: flex-end`

### 6.8 Modals / Dialogs

```css
.custom-dialog :deep(.el-dialog__header) {
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-divider);
  margin-right: 0;
}
.custom-dialog :deep(.el-dialog__body) {
  padding: 24px;
}
.custom-dialog :deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid var(--color-divider);
}
```

### 6.9 Page Header Pattern

```css
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  font-family: var(--font-heading);
}
.page-desc {
  font-size: 14px;
  color: var(--color-text-secondary);  /* or var(--color-text-muted) */
  margin: 6px 0 0;
}
```

### 6.10 Section Header Pattern

```css
.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}
```

### 6.11 Hoverable List Items

```css
.hover-item {
  padding: 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-divider);
  cursor: pointer;
  transition: all 0.2s ease;
}
.hover-item:hover {
  border-color: var(--color-secondary);
  background: var(--color-primary-hover-bg);
  box-shadow: 0 2px 8px var(--color-primary-hover-bg);
}
/* Arrow animation on hover */
.hover-item:hover .item-arrow {
  transform: translateX(4px);
  color: var(--color-primary);
}
```

### 6.12 Progress Bar (Exam)

Uses an emerald green gradient to reflect the new brand identity.

```css
.progress-track {
  height: 4px;
  background: var(--color-divider);
  border-radius: 2px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  border-radius: 2px;
  transition: width 0.3s ease;
}
```

### 6.13 Exam Question Type Tags

| Type            | Background                | Color                 |
| --------------- | ------------------------- | --------------------- |
| Single choice   | `var(--color-info-bg)`    | `var(--color-info)`   |
| Multiple choice | `var(--color-purple-bg)`  | `var(--color-purple)` |
| Judge (T/F)     | `var(--color-success-bg)` | `var(--color-cta)`    |

### 6.14 Option Cards (Exam)

```css
.option-card {
  flex: 1;
  min-width: 0;
  padding: 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-divider);
  transition: all 0.2s ease;
  cursor: pointer;
}
.option-card:hover {
  border-color: var(--color-secondary);
  background: var(--color-primary-hover-bg);
}
.option-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--color-primary-bg);
  color: var(--color-primary);
  font-weight: 600;
  font-size: 13px;
  margin-right: 10px;
  flex-shrink: 0;
}
```

***

## 7. Style Guidelines

**Style:** Data-Dense Enterprise Dashboard

**Keywords:** Data tables, KPI stat cards, management lists, filter/search bars, paginated lists, form dialogs, tree menus, minimum visual weight, maximum data visibility

**Best For:** Enterprise internal tools, learning management systems, exam platforms, admin dashboards, employee management portals

**Key Effects:** Card hover lift, arrow slide animation, smooth gradient transitions, sticky headers, row highlight on hover, loading spinners

### Page Pattern

**Pattern Name:** Enterprise Management Console

- **CTA Placement:** Top-right of page header (Create/Add button)
- **Section Order:**
  1. Page Header (title + description + CTA)
  2. Filter Bar (optional, for list pages)
  3. Content Area (cards, tables, tree)
  4. Pagination (for lists)
- **Modal Pattern:** Dialog overlay for create/edit forms

### Page Type Categories

| Type                    | Pages                                                        | Layout                                  |
| ----------------------- | ------------------------------------------------------------ | --------------------------------------- |
| **Dashboard/Home**      | Home.vue, admin/Dashboard.vue                                | Stat cards row + content sections       |
| **List (with filters)** | RegulationList, EmployeeList, FeedbackList, ExamList (admin) | Filter card + table card + pagination   |
| **List (simple)**       | AnnouncementList, FaqList, ExamList (front)                  | Table/items + pagination                |
| **Tree/Manage**         | CategoryList, PositionList, DepartmentList                   | Tree card + dialog                      |
| **Detail/View**         | RegulationDetail                                             | Back button + detail card               |
| **Form/Submit**         | FeedbackSubmit, ExamTake                                     | Form card                               |
| **Result**              | ExamResult                                                   | Centered result card                    |
| **Profile**             | Profile                                                      | Profile info + password + notifications |
| **Login**               | Login                                                        | Centered card on gradient bg            |

***

## 8. Animation & Transition Standards

| Element          | Duration | Type | Property                   |
| ---------------- | -------- | ---- | -------------------------- |
| Card hover       | 250ms    | ease | `all` (transform + shadow) |
| Button hover     | 200ms    | ease | `all`                      |
| Nav hover        | 200ms    | ease | `color`, `background`      |
| Item hover       | 200ms    | ease | `all`                      |
| Arrow slide      | 200ms    | ease | `transform`                |
| Progress fill    | 300ms    | ease | `width`                    |
| Login button     | 250ms    | ease | `all`                      |
| Dialog           | 200ms    | -    | Element Plus default       |
| Input focus      | 200ms    | ease | `box-shadow`               |
| Page transitions | 200ms    | ease | (router default)           |

***

## 9. CSS Variable System

All design tokens are defined as CSS custom properties on `:root`:

### Naming Convention

```
--color-[role]          → Main color value
--color-[role]-light    → Lighter variant
--color-[role]-dark     → Darker variant
--color-[role]-bg       → Background/tag variant
--color-[role]-hover-bg → Hover state background
--color-[role]-active-bg → Active state background
--color-[role]-border   → Border/focus variant
--color-[role]-shadow   → Shadow variant
--color-[role]-text     → Text on this color's bg
```

### Required Variables for New Components

When creating new components, always use these CSS variables instead of hardcoded values:

```
--color-primary, --color-primary-dark, --color-primary-light
--color-primary-bg, --color-primary-hover-bg, --color-primary-active-bg
--color-primary-border, --color-primary-shadow
--color-secondary, --color-secondary-light
--color-cta
--color-surface, --color-surface-hover
--color-background, --color-background-light
--color-text, --color-text-secondary, --color-text-tertiary, --color-text-muted, --color-text-light
--color-border, --color-divider
--color-danger, --color-danger-light, --color-danger-bg
--color-success, --color-success-bg
--color-warning, --color-warning-light
--color-info, --color-info-bg
--color-blue, --color-blue-light, --color-blue-bg
--color-purple, --color-purple-bg
--font-heading, --font-body
--radius-sm, --radius-md, --radius-lg
--shadow-md, --shadow-lg, --shadow-header, --shadow-card-hover
```

***

## 10. Anti-Patterns (Do NOT Use)

- ❌ Ornate or playful design
- ❌ No filtering on list pages
- ❌ **Emojis as icons** — Use Element Plus icons or SVG icons (consistent set)
- ❌ **Missing cursor:pointer** — All clickable elements must have `cursor:pointer`
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout (use translateY instead)
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y
- ❌ **Hardcoded colors** — Always use CSS variables for theme consistency
- ❌ **Mixed border-radius** — Use consistent radius tokens
- ❌ **Duplicate CSS variables** — Do not define new variables that duplicate existing ones (check current list first)

***

## 11. Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use Element Plus/SVG icons)
- [ ] All icons from consistent icon set (Element Plus icons)
- [ ] `cursor:pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
- [ ] All colors use CSS variables (no hardcoded hex)
- [ ] Consistent border-radius using radius tokens
- [ ] Page header pattern followed (title + desc + optional CTA)
- [ ] Card hover effect uses translateY (not scale)

