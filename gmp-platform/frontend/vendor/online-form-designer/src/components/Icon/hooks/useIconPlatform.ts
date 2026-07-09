import { computed } from 'vue';
import { IconNamespaceEnum, ICategory } from '../types';
import iconIds from 'virtual:svg-icons-names';

const iconPlatformCats = computed(() => {
  return [
    {
      id: 'medicalCare',
      name: '医疗器械',
      icons: medicalCareIcons.value,
    },
    {
      id: 'IconPlatform',
      name: '平台图标',
      icons: platformIcons.value,
    },
  ];
});

const platformIcons = computed(() => {
  const icons: ICategory[] = iconIds
    .filter((e) => /^(icon-platform)/.test(e))
    .map((e) => {
      const iconName = e.replace(/icon-/g, '');
      return {
        id: `${IconNamespaceEnum.Platform}:${iconName}`,
        name: iconName,
        _filter_: [iconName],
      };
    });
  return icons;
});
const medicalCareIcons = computed(() => {
  const icons: ICategory[] = iconIds
    .filter((e) => /^(icon-medicalCare)/.test(e))
    .map((e) => {
      const iconName = e.replace(/icon-/g, '');
      return {
        id: `${IconNamespaceEnum.Platform}:${iconName}`,
        name: e.replace(/icon-medicalCare-/g, ''),
        _filter_: [iconName],
      };
    });
  return icons;
});
// console.log(iconIds, medicalCareIcons)
export function useIconPlatform() {
  function getIconPlatformCats() {
    return iconPlatformCats.value;
  }
  return { getIconPlatformCats };
}
