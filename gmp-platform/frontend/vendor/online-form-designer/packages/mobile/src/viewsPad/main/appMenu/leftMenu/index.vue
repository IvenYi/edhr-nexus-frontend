<template>
  <div class="left-menu" :style="gradientStyle">
    <div class="left-menu-search">
      <van-field :placeholder="$t('sys.searchMenu')" v-model="searchValue" clearable>
        <template #left-icon>
          <span class="icon iconfont icon-pad_search"></span>
        </template>
      </van-field>
    </div>
    <div class="left-menu-list">
      <menuGroup
        v-for="row in searchOptions"
        :menu="row"
        @select="selectPage"
        :selectId="selectId"
        :key="row.id"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { getMenuConfigAvailableList } from '@mobile/apis/gct-apaas/MenuConfigController';
  import { ref, onMounted, watchEffect, computed } from 'vue';
  import { list_to_tree } from '@mobile/utils/treeHelper';
  import { LogoTypeEnum } from '@mobile/type';
  import type { Menus } from '@mobile/components/appItem/type';
  import menuGroup from './menu-group.vue';
  import { useRoute } from 'vue-router';
  import { match } from 'pinyin-pro';
  import { watchDebounced } from '@vueuse/core';
  import { useplatSetting } from '@mobile/utils/useplatSetting';

  defineProps<{
    selectId?: string;
  }>();
  const emit = defineEmits(['select']);
  const menuOptions = ref<Menus[]>([]);
  const searchOptions = ref<Menus[]>([]);

  const route = useRoute();
  const { themeSetting } = useplatSetting();

  const searchValue = ref('');
  const menuId = route.query.menuId;
  getMenus();
  async function getMenus() {
    const res = (await getMenuConfigAvailableList({ menuType: 'PAD' })) || [];
    if (!res.length) return;
    menuOptions.value = list_to_tree(
      res
        .filter((i) => i.visible === 1 && !i.sysBuiltin)
        .map((i) => ({ ...i, logoType: LogoTypeEnum.Icon, open: false })),
      (curr, parent) => {
        if (curr.id === menuId) {
          selectPage(curr);
          parent.open = true;
        }
        return curr;
      },
    ).filter((e) => e?.children?.length);
    if (!menuId && menuOptions.value?.[0]) {
      const first = menuOptions.value?.[0].children?.[0];
      first && selectPage(first);
      menuOptions.value[0].open = true;
    }
    searchOptions.value = menuOptions.value;
  }

  const gradientStyle = computed(() => {
    return {
      background: `linear-gradient(
        180deg,
        ${themeSetting.primaryColor},
        ${themeSetting.primaryColor}A3
      )`,
    };
  });

  function selectPage(row: Menus) {
    emit('select', row);
  }
  /**
   * 查询事件
   */
  function searchMenusByKeyWord(keyword) {
    return menuOptions.value
      .map((i) => {
        const children = i.children.filter(({ name }) => {
          console.log(name);
          const isMatch = name.includes(keyword) || match(name, keyword);
          console.log(isMatch);
          return isMatch;
        });
        return {
          ...i,
          open: true,
          children,
        };
      })
      .filter((i) => i.children.length);
  }
  watchDebounced(
    searchValue,
    () => {
      if (!searchValue.value.toLowerCase()) {
        searchOptions.value = menuOptions.value;
      } else {
        searchOptions.value = searchMenusByKeyWord(searchValue.value.toLowerCase());
      }
    },
    { debounce: 300 },
  );
</script>
<style scoped lang="less">
  .left-menu {
    display: flex;
    position: absolute;
    z-index: 999;
    top: 24px;
    bottom: 24px;
    left: 24px;
    flex-direction: column;
    width: 240px;
    transition: transform 0.3s;
    border-radius: 8px;
    box-shadow: 0 4px 28px 0 rgb(0 0 0 / 20%);
    backdrop-filter: blur(20px);

    &-search {
      padding: 12px;

      :deep(.van-field) {
        // height: 36px;
        padding: 6px 14px;
        border-radius: 4px;
        background: rgb(255 255 255 / 20%);
        color: #fff;
        font-size: 15px;

        .van-field__control {
          color: #fff !important;

          &::placeholder {
            color: #fff !important;
          }
        }
      }
    }

    .left-menu-list {
      flex: 1;
      overflow-y: auto;
      color: #fff;
    }
  }
</style>
