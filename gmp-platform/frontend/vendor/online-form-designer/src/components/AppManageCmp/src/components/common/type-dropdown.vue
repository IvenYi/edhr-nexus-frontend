<template>
  <a-select v-model:value="value" :bordered="false" :dropdownMatchSelectWidth="false">
    <a-select-option v-for="option in options" :key="option.id" :value="option.id">
      {{ `${option.title}(${option.total})` }}
    </a-select-option>
  </a-select>
</template>
<script lang="ts" name="type-dropdown" setup>
  import { computed } from 'vue';
  import { AppTabsMenuEnum } from '/@/components/AppManageCmp/src/constant/interface';
  import type { ICreateAppTabsMenuOptions } from '/@/components/AppManageCmp/src/types/index.d';
  import { useStorage } from '@vueuse/core';
  import { useUserStore } from '/@/store/modules/user';

  interface IProps {
    options: ICreateAppTabsMenuOptions[];
    activeKey: AppTabsMenuEnum;
    isTenant?: boolean;
  }

  const props = defineProps<IProps>();

  const userStore = useUserStore();

  const activeKeyCache = useStorage<{ [key: string]: any }>(
    `${userStore?.getUserInfo?.userId}_${props.isTenant ? 'tenant_' : ''}active-key`,
    () => {
      return {
        key: '',
      };
    },
  );

  const emit = defineEmits(['update:activeKey']);

  const value = computed<AppTabsMenuEnum>({
    get() {
      return props.activeKey;
    },
    set(val) {
      activeKeyCache.value.key = val;
      emit('update:activeKey', val);
    },
  });
</script>
