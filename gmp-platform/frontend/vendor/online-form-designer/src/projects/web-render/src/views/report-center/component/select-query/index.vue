<template>
  <a-tabs v-model:activeKey="activeKey" class="waiting-area-tabs" centered>
    <a-tab-pane key="User" :tab="t('sys.user')">
      <user style="padding: 8px 12px" v-model:value="selectUser" @changeOptions="changeOptions" />
    </a-tab-pane>
    <a-tab-pane key="Org" :tab="t('sys.pageDesigner.dept')">
      <dept v-model:value="selectUser" @changeOptions="changeOptions" />
    </a-tab-pane>
    <a-tab-pane key="UserGroup" :tab="t('sys.role')">
      <role v-model:value="selectUser" @changeOptions="changeOptions" />
    </a-tab-pane>
  </a-tabs>
</template>
<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import Role from './role.vue';
  import Dept from './dept.vue';
  import User from './user.vue';

  const props = defineProps<{
    selectKey?: string;
  }>();

  const emit = defineEmits(['changeSelect']);

  const { t } = useI18n();
  const selectUser = ref('');
  const activeKey = ref('User');
  const selectOptions = ref();

  const changeOptions = (option) => {
    selectOptions.value = option;
  };

  watch(
    () => selectUser.value,
    (val) => {
      emit('changeSelect', val, selectOptions.value);
    },
  );

  watch(
    () => props.selectKey,
    () => {
      if (!props.selectKey) {
        selectUser.value = '';
      }
    },
  );
</script>

<style lang="less" scoped></style>
