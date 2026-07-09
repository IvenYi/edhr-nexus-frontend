<template>
  <basic-info v-if="PanelTypeEnum.BASIC_INFO === panel" />
  <global-setting v-if="PanelTypeEnum.GLOBAL_SETTING === panel" />
  <control-props v-if="PanelTypeEnum.CONTROL_RPOPS === panel" />
  <history-list />
</template>

<script lang="ts" setup>
  import BasicInfo from './panels/basic-info.vue';
  import GlobalSetting from './panels/global-setting.vue';
  import ControlProps from './panels/control-props.vue';
  import HistoryList from './panels/history-list.vue';

  import { useSOInstance } from '../hooks/useSOInstance';
  import { PanelTypeEnum } from '../types';

  const { panel } = useSOInstance();
</script>

<style lang="less" scoped></style>
