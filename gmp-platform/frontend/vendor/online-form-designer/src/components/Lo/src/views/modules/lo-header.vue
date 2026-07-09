<template>
  <div class="editor-header">
    <a-breadcrumb>
      <a-breadcrumb-item>{{ t('逻辑编排') }}</a-breadcrumb-item>
      <a-breadcrumb-item> {{ loDataObject.title }}</a-breadcrumb-item>
    </a-breadcrumb>

    {{ modalInfo }}

    <a-button style="margin-left: auto" @click="close">
      <div
        class="flex items-center"
        :style="{
          'line-height': 1,
        }"
      >
        <i class="iconfont icon-baocun1 mr-4px"></i>
        {{ t('sys.closeText') }}
      </div>
    </a-button>
    <a-button type="primary" class="ml-12px" @click="save">
      <div
        class="flex items-center"
        :style="{
          'line-height': 1,
        }"
      >
        <i class="iconfont icon-baocun1 mr-4px"></i>
        {{ t('sys.saveText') }}
      </div>
    </a-button>

    <!-- <a-dropdown-button type="primary" @click="() => save('')">
      <template #overlay>
        <a-menu @click="() => saveAndActivate('')">
          <a-menu-item key="1">
            <i class="iconfont icon-baocun1 mr-4px"></i>
            {{ t('sys.editor.saveAndActivate') }}
          </a-menu-item>
        </a-menu>
      </template>
      <template #icon><DownOutlined /></template>
    </a-dropdown-button> -->
  </div>
</template>

<script lang="ts" setup>
  // import { useSOInstance } from '../hooks/useSOInstance';
  import { useI18n } from '/@/hooks/web/useI18n';
  // import { DownOutlined } from '@ant-design/icons-vue';
  import { useLo } from '../../hooks/useLo';

  // import { UserOccupy, UserLock } from '/@/components/UserOccupy';

  const { t } = useI18n();
  const { save, close, loDataObject } = useLo();
  // const { save, saveAndActivate, soResponse } = useSOInstance();
</script>

<style lang="less" scoped>
  .editor-header {
    display: flex;
    align-items: center;
    padding: 0 16px;
    justify-content: space-between;
  }
</style>
