import { useCallback, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getPublicSystemSettings, type SystemSettings } from '@/api/system';

export const DEFAULT_SYSTEM_BRANDING: SystemSettings = {
  systemName: 'eDHR 系统',
  browserTitle: 'eDHR - 医疗器械电子设备历史记录系统',
  logoUrl: '',
  logoWidth: 32,
  logoHeight: 32,
  faviconUrl: '',
};

export const SYSTEM_BRANDING_QUERY_KEY = ['system-branding', 'public'] as const;

export function normalizeSystemBranding(settings?: Partial<SystemSettings>): SystemSettings {
  return {
    ...DEFAULT_SYSTEM_BRANDING,
    ...(settings ?? {}),
    systemName: settings?.systemName?.trim() || DEFAULT_SYSTEM_BRANDING.systemName,
    browserTitle: settings?.browserTitle?.trim() || DEFAULT_SYSTEM_BRANDING.browserTitle,
    logoWidth: settings?.logoWidth ?? DEFAULT_SYSTEM_BRANDING.logoWidth,
    logoHeight: settings?.logoHeight ?? DEFAULT_SYSTEM_BRANDING.logoHeight,
  };
}

export function applySystemBranding(settings: Partial<SystemSettings> = DEFAULT_SYSTEM_BRANDING) {
  const title = settings.browserTitle?.trim() || DEFAULT_SYSTEM_BRANDING.browserTitle;
  document.title = title;

  const faviconUrl = settings.faviconUrl?.trim();
  let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!favicon) {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    document.head.appendChild(favicon);
  }

  if (faviconUrl) {
    favicon.href = faviconUrl;
  }
}

export function useSystemBranding() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: SYSTEM_BRANDING_QUERY_KEY,
    queryFn: getPublicSystemSettings,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const branding = useMemo<SystemSettings>(() => normalizeSystemBranding(query.data), [query.data]);

  useEffect(() => {
    applySystemBranding(branding);
  }, [branding]);

  const refreshBranding = useCallback(async (settings?: SystemSettings) => {
    if (settings) {
      const nextBranding = normalizeSystemBranding(settings);
      queryClient.setQueryData<SystemSettings>(SYSTEM_BRANDING_QUERY_KEY, nextBranding);
      applySystemBranding(nextBranding);
    }
    await queryClient.invalidateQueries({ queryKey: SYSTEM_BRANDING_QUERY_KEY });
  }, [queryClient]);

  return {
    branding,
    isLoading: query.isLoading,
    isError: query.isError,
    refreshBranding,
  };
}
