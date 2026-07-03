import { ref, computed } from 'vue';
import IconParkJson from '@icon-park/vue-next/icons.json';
import { IconNamespaceEnum, ICategory } from '../types';

enum CategoyEnum {
  Base = 'Base',
  Others = 'Others',
}

const iconParkIcons = ref<ICategory[]>([]);
const iconParkCats = computed(() => {
  return [
    {
      id: 'IconPark',
      name: 'IconPark',
      children: iconParkIcons.value,
    },
  ];
});

export function useIconPark() {
  function getIconParkCats() {
    if (iconParkIcons.value.length > 0) {
      return iconParkCats.value;
    }

    const cats: ICategory[] = [];
    IconParkJson.forEach((item) => {
      const icon = {
        ...item,
        id: `${IconNamespaceEnum.IconPark}:${item.name}`,
        _filter_: [...item.tag, item.title, item.name],
      };
      let category = cats.find((c) => c.id === icon.category);
      if (category) {
        category.icons!.push(icon);
      } else {
        category = {
          id: icon.category,
          name: icon.categoryCN,
          icons: [icon],
        };
        cats.push(category);
      }
    });

    const base = cats.filter((c) => c.id === CategoyEnum.Base);
    const others = cats.filter((c) => c.id === CategoyEnum.Others);
    const middle = cats.filter(
      (c) => ![CategoyEnum.Base, CategoyEnum.Others].includes(c.id as CategoyEnum),
    );

    iconParkIcons.value = base.concat(middle, others);

    return iconParkCats.value;
  }

  return {
    getIconParkCats,
  };
}
