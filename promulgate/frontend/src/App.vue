-- Active: 1775227715248@@127.0.0.1@3306@institution_learning
<template>
  <router-view />
</template>

<script setup lang="ts">
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:wght@300;400;500;600;700&display=swap');

:root {
  /* ===== Primary Brand (Emerald Green) ===== */
  --color-primary: #059669;
  --color-primary-dark: #047857;
  --color-primary-light: #34D399;
  --color-primary-bg: #ECFDF5;
  --color-primary-hover-bg: rgba(5, 150, 105, 0.06);
  --color-primary-active-bg: rgba(5, 150, 105, 0.12);
  --color-primary-border: rgba(5, 150, 105, 0.3);
  --color-primary-shadow: rgba(5, 150, 105, 0.25);

  /* ===== Secondary & Semantic ===== */
  --color-secondary: #6EA7ED;
  --color-secondary-light: #BFD9F7;
  --color-cta: #22C55E;
  --color-success: #22C55E;
  --color-success-bg: #DCFCE7;
  --color-warning: #FBBF24;
  --color-warning-light: #FDDD8C;
  --color-danger: #EF4444;
  --color-danger-light: #F87171;
  --color-danger-bg: #FEF2F2;
  --color-info: #3B82F6;
  --color-info-bg: #DBEAFE;

  /* ===== Extended Accents ===== */
  --color-blue: #0C8BC6;
  --color-blue-light: #8EDAFB;
  --color-blue-bg: #E6F5FF;
  --color-purple: #8B5CF6;
  --color-purple-bg: #EDE9FE;

  /* ===== Text ===== */
  --color-text: #1E293B;
  --color-text-secondary: #64748B;
  --color-text-tertiary: #475569;
  --color-text-muted: #94A3B8;
  --color-text-light: #FFFFFF;

  /* ===== Background & Surface ===== */
  --color-background: #ecf5f1;
  --color-background-light: #edf8f3;
  --color-surface: #FFFFFF;
  --color-surface-hover: #FAFAFA;

  /* ===== Border & Divider ===== */
  --color-border: #E2E8F0;
  --color-divider: #F1F5F9;

  /* ===== Shadow ===== */
  --shadow-header: 0 1px 3px rgba(0,0,0,0.04);
  --shadow-card: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-card-hover: 0 12px 24px rgba(0,0,0,0.06);
  --shadow-login: 0 25px 50px rgba(0,0,0,0.25);
  --shadow-pdf: 0 2px 8px rgba(0,0,0,0.08);
  --shadow-sidebar: 4px 0 24px rgba(30, 27, 75, 0.15);
  --shadow-dialog: 0 2px 8px rgba(5, 150, 105, 0.25);

  /* ===== Sidebar ===== */
  --color-sidebar-bg: #064E3B;
  --color-sidebar-text: #A7F3D0;
  --color-sidebar-text-light: #D1FAE5;
  --color-sidebar-hover: rgba(255, 255, 255, 0.15);
  --color-sidebar-active: rgba(255, 255, 255, 0.06);
  --color-sidebar-border: rgba(255, 255, 255, 0.08);

  /* ===== Misc ===== */
  --watermark-color: rgba(128, 128, 128, 0.2);
  --overlay-white: rgba(255, 255, 255, 0.5);

  /* ===== Spacing ===== */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* ===== Radius ===== */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;

  /* ===== Font ===== */
  --font-heading: 'Fira Code', monospace;
  --font-body: 'Fira Sans', sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--color-text);
  background: var(--color-background);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}
</style>
