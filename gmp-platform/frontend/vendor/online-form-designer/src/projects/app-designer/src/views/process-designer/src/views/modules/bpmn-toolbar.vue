<template>
  <div class="bpmn-toolbar">
    <a-select
      class="w-160px"
      :value="processResponse.activeId"
      @select="(value) => changeVersion(value)"
    >
      <a-select-option v-for="item in processVersionList" :key="item.id"
        >{{ item.version }}
        <span v-if="item.active === 1" class="primary-gct"
          >({{ t('sys.process.active') }})</span
        ></a-select-option
      >
    </a-select>

    <a-button class="ml-10px mr-24px" type="primary" @click="handleClickSaveAs">{{
      t('新建版本')
    }}</a-button>

    <div
      class="flex setting"
      :class="{
        active: globalSettingVisible,
      }"
      @click="toggleGlobalSetting"
    >
      <i class="iconfont icon-shezhi"></i>{{ t('sys.pageDesigner.globalSetting') }}
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { inject } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useBpmn } from '../../hooks/useBpmn';

  const { t } = useI18n();
  const {
    processVersionList,
    processResponse,
    changeVersion,
    globalSettingVisible,
    setGlobalSettingVisible,
    toXml,
  } = useBpmn();

  const openSaveAsModal = inject('openSaveAsModal') as Function;

  const toggleGlobalSetting = () => {
    setGlobalSettingVisible(!globalSettingVisible.value);
  };

  const handleClickSaveAs = () => {
    openSaveAsModal(true, {});
  };
</script>

<style lang="less" scoped>
  .bpmn-toolbar {
    display: flex;
    align-items: center;
    line-height: 1em;
    padding: 0 20px;
    border-left: 1px solid #eaeaea;

    .ant-select {
      margin-left: auto;
    }

    .setting {
      cursor: pointer;

      &.active {
        color: var(--ant-primary-color);
      }
    }
  }
</style>
../../hooks/useBpmnDesigner
