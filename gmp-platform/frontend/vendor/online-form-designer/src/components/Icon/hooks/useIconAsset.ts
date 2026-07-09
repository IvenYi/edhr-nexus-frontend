import { ref, computed } from 'vue';
import { IconNamespaceEnum, ICategory } from '../types';
import { getAssetsList } from '/@/apis/gct-platform/AssetsController';
import { getCategoryList } from '/@/apis/gct-platform/CategoryController';

const iconAssetIcons = ref<ICategory[]>([]);
const iconParkCats = computed(() => {
  return [
    {
      id: 'IconAsset',
      name: '资产图标',
      children: iconAssetIcons.value,
    },
  ].filter((i) => i.children?.length);
});

export function useIconAsset() {
  async function getIconAssetCats() {
    if (iconAssetIcons.value.length > 0) {
      return iconParkCats.value;
    }

    const params = {
      assetsModule: 'ICON',
    };
    const result = await Promise.all([getCategoryList(params), getAssetsList(params)]).then(
      ([catRes, iconRes]) => {
        return catRes
          ?.map((c) => {
            return {
              id: `${c.id}`,
              name: c.name,
              icons: iconRes
                ?.filter((i) => i.categoryId === c.id)
                .map((item) => {
                  Object.assign(item, {
                    id: `${IconNamespaceEnum.Asset}:${item.path}`,
                    _filter_: [item.name],
                  });
                  return item;
                }),
            };
          })
          .filter((i) => i.icons?.length);
      },
    );
    iconAssetIcons.value = result as ICategory[];

    return iconParkCats.value;
  }

  return {
    getIconAssetCats,
  };
}
