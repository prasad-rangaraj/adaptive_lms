import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { tenantsAPI } from '../../services/api.service';
import { applyTenantTheme, getCachedTenantTheme, cacheTenantTheme } from '../../utils/themeUtils';

/**
 * TenantThemeApplier
 * Mounts at root of app to dynamically load, synchronize, and enforce
 * the active organization's custom branding, palette, and CSS variables.
 */
export default function TenantThemeApplier() {
  const user = useAuthStore(s => s.user);
  const tenantId = user?.tenant_id;

  // 1. Synchronously apply cached theme to prevent any theme flash on reload
  useEffect(() => {
    if (tenantId) {
      const cached = getCachedTenantTheme(tenantId);
      if (cached?.primary_color) {
        applyTenantTheme(cached.primary_color, cached.secondary_color);
      }
    }
  }, [tenantId]);

  // 2. Fetch latest tenant profile from backend database
  const { data: tenant } = useQuery({
    queryKey: ['tenant-branding-active', tenantId],
    queryFn: () => tenantsAPI.get(tenantId).then(r => r.data),
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 10,
  });

  // 3. When fresh tenant data arrives, apply and update cache
  useEffect(() => {
    if (tenant?.primary_color) {
      applyTenantTheme(tenant.primary_color, tenant.secondary_color);
      cacheTenantTheme(tenantId, {
        primary_color: tenant.primary_color,
        secondary_color: tenant.secondary_color,
        logo_url: tenant.logo_url,
        name: tenant.name,
      });
    }
  }, [tenant, tenantId]);

  return null;
}
