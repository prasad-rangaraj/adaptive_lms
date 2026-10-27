/**
 * Adaptive LMS — Dynamic Tenant White-Label Theme Engine
 * Automatically generates a complete, accessible, harmonized design system
 * (tints, shades, shadows, glows, and badges) from the tenant's primary and secondary brand colors.
 */

// Helper to convert hex to rgba
export function hexToRgba(hex, alpha = 1) {
  if (!hex || typeof hex !== 'string') return `rgba(14, 116, 144, ${alpha})`;
  let c = hex.replace('#', '').trim();
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  if (c.length < 6) return `rgba(14, 116, 144, ${alpha})`;
  const num = parseInt(c.slice(0, 6), 16);
  if (isNaN(num)) return `rgba(14, 116, 144, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Helper to lighten or darken a hex color by percentage (-100 to 100)
export function shadeHex(hex, percent) {
  if (!hex || typeof hex !== 'string') return hex;
  let c = hex.replace('#', '').trim();
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  if (c.length < 6) return hex;
  let num = parseInt(c.slice(0, 6), 16);
  if (isNaN(num)) return hex;
  const amt = Math.round(2.55 * percent);
  let R = (num >> 16) + amt;
  let G = ((num >> 8) & 0x00FF) + amt;
  let B = (num & 0x0000FF) + amt;
  R = Math.min(255, Math.max(0, R));
  G = Math.min(255, Math.max(0, G));
  B = Math.min(255, Math.max(0, B));
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

export const PRESET_THEMES = [
  { name: 'Ocean Cyan (Default)', primary: '#0e7490', secondary: '#0891b2', previewBg: '#ecfeff' },
  { name: 'Tech Indigo',         primary: '#4f46e5', secondary: '#6366f1', previewBg: '#eef2ff' },
  { name: 'Emerald Campus',      primary: '#059669', secondary: '#10b981', previewBg: '#ecfdf5' },
  { name: 'Ivy Crimson',         primary: '#be123c', secondary: '#e11d48', previewBg: '#fff1f2' },
  { name: 'Royal Violet',        primary: '#7c3aed', secondary: '#8b5cf6', previewBg: '#f5f3ff' },
  { name: 'Academic Amber',      primary: '#b45309', secondary: '#d97706', previewBg: '#fffbeb' },
  { name: 'Midnight Slate',      primary: '#1e293b', secondary: '#334155', previewBg: '#f8fafc' },
];

/**
 * Apply tenant theme directly to document root CSS variables
 */
export function applyTenantTheme(primaryColor, secondaryColor) {
  if (typeof document === 'undefined') return;
  const primary = primaryColor || '#0e7490';
  const secondary = secondaryColor || shadeHex(primary, 15);

  const root = document.documentElement;

  // Primary & secondary core brand colors
  root.style.setProperty('--brand-600', primary);
  root.style.setProperty('--brand-500', secondary);

  // Harmonized shades & tints
  root.style.setProperty('--brand-700', shadeHex(primary, -20));
  root.style.setProperty('--brand-400', shadeHex(secondary, 20));
  root.style.setProperty('--brand-200', hexToRgba(primary, 0.25));
  root.style.setProperty('--brand-100', hexToRgba(primary, 0.12));
  root.style.setProperty('--brand-50',  hexToRgba(primary, 0.06));

  // Visual effects
  root.style.setProperty('--text-brand', primary);
  root.style.setProperty('--shadow-brand', `0 4px 14px ${hexToRgba(primary, 0.28)}`);
  root.style.setProperty('--glow-brand', `0 0 0 3px ${hexToRgba(primary, 0.18)}`);
}

/**
 * Reset root variables back to platform default
 */
export function resetTenantTheme() {
  applyTenantTheme('#0e7490', '#0891b2');
}

/**
 * LocalStorage caching for zero-flicker instant render
 */
export function getCachedTenantTheme(tenantId) {
  try {
    if (!tenantId) return null;
    const raw = localStorage.getItem(`lms_theme_tenant_${tenantId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function cacheTenantTheme(tenantId, data) {
  try {
    if (!tenantId || !data) return;
    localStorage.setItem(`lms_theme_tenant_${tenantId}`, JSON.stringify(data));
  } catch (_) {}
}
