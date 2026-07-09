<template>
  <div
    class="menu-title"
    :class="[
      {
        'submenu--open': isOpen,
        'menu--selected': isSelected,
      },
      `menu-title--${level}`,
    ]"
    @click="onClick(data)"
  >
    <div v-if="getIcon" class="menu-icon">
      <IconNext v-if="renderIconNext" :size="18" :value="getIcon" color="currentcolor" />
      <Icon v-else :icon="getIcon" :size="18" />
    </div>
    <span class="menu-name" :title="t(props.data.name) || ''" v-html="getTitle"></span>
    <div v-if="submenu" class="menu-trigger ml-6px">
      <down-outlined />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, inject } from 'vue';
  import Icon from '@/components/Icon/Icon.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { IconNext } from '/@/components/Icon';
  import { ProjectName } from '/@/enums/appEnum';
  import { usePermissionStoreWithOut } from '/@/store/modules/permission';
  import { useMenu } from '../useMenu';
  import { useThemeSetting } from '/@/hooks/platform/useThemeSetting';
  import { match } from 'pinyin-pro';

  const props = defineProps<{
    data: any;
    level: number;
    submenu: boolean;
    searchVal: string;
    isPopover?: boolean;
  }>();

  const handleMenuClick = inject('handleMenuClick') as Function;

  const { t } = useI18n();
  const { getCurrentProject } = usePermissionStoreWithOut();
  const { openKeys, selectedKeys, setSelectedKeys, addOpenKey, deleteOpenKey } = useMenu();
  const { menuCollapsed } = useThemeSetting();

  const getIcon = computed(() => props.data?.icon || props.data?.meta?.icon || false);
  const getTitle = computed(() => {
    let title = t(props.data.name) || '';
    const searchVal = props.searchVal;
    if (searchVal) {
      if (title.includes(searchVal)) {
        title = title.replace(searchVal, `<span class="primary-color">${searchVal}</span>`);
      } else if (match(title, searchVal)) {
        const keywords = match(title, searchVal).map((i) => title[i]);
        title = title.replace(
          new RegExp(`(${keywords.join('|')})`, 'g'),
          '<span class="primary-color">$1</span>',
        );
      }
    }
    return title;
  });

  const renderIconNext = computed(() => {
    return getCurrentProject === ProjectName.WEB_RENDER;
  });

  const isOpen = computed(() => {
    return props.submenu && openKeys.value.includes(props.data.path);
  });

  const isSelected = computed(() => {
    return !props.submenu && selectedKeys.value.includes(props.data.path);
  });

  const onClick = (data) => {
    if (props.submenu) {
      // 当侧边收起时，一级菜单无需点击展开收起效果
      if (menuCollapsed.value && !props.isPopover) return;
      if (isOpen.value) {
        deleteOpenKey(data.path);
      } else {
        addOpenKey(data.path);
      }
    } else {
      handleMenuClick(data);
      const { type, openMode } = data;
      // 外部打开的不需要选中
      if ((type === 'STANDARD' && openMode === 'NEW') || (type === 'LINK' && openMode === 'NEW'))
        return;
      setSelectedKeys([data.path]);
    }
  };
</script>
