<template>
  <div class="editor-header">
    <a-breadcrumb>
      <a-breadcrumb-item>{{ scriptInfo.categoryResponse?.name }}</a-breadcrumb-item>
      <a-breadcrumb-item> {{ scriptInfo.name }}</a-breadcrumb-item>
    </a-breadcrumb>

    <user-occupy class="ml-40px" />

    <div @click="link" class="editor-link">
      <i class="iconfont icon-a-tiaozhuanwendang1"></i>
      <span>{{ t('sys.editor.helpDoc') }}</span>
    </div>

    <user-lock class="mr-20px" />

    <a-dropdown-button class="editor-dropdown-btn" type="primary" @click="() => save('')">
      <div
        class="flex items-center"
        :style="{
          'line-height': 1,
        }"
      >
        <i class="iconfont icon-baocun1 mr-4px"></i>
        {{ t('sys.saveText') }}
      </div>
      <template #overlay>
        <a-menu @click="() => saveAndActivate('')">
          <a-menu-item key="1">
            <i class="iconfont icon-baocun1 mr-4px"></i>
            {{ t('sys.editor.saveAndActivate') }}
          </a-menu-item>
        </a-menu>
      </template>
      <template #icon><DownOutlined /></template>
    </a-dropdown-button>
  </div>
</template>

<script lang="ts" setup>
  import { useScript } from '/@app-designer/views/script-editor/hooks/useScript';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { DownOutlined } from '@ant-design/icons-vue';

  import { UserOccupy, UserLock } from '/@/components/UserOccupy';

  const { t } = useI18n();
  const { scriptInfo, save, saveAndActivate } = useScript();

  const link = () => {
    window.open(`${location.origin}/api-doc/`, '_blank');
  };
</script>

<style lang="less" scoped>
  .editor-header {
    display: flex;
    align-items: center;
    padding: 0 16px;
    justify-content: space-between;
    background: #1a1d23;
    :deep(.ant-breadcrumb) {
      color: #fff;
      .ant-breadcrumb-link,
      .ant-breadcrumb-separator {
        color: #fff;
      }
    }
    .editor-link {
      margin-left: auto;
      cursor: pointer;
      margin-right: 14px;
      color: rgba(255, 255, 255, 0.72);
      .iconfont {
        margin-right: 6px;
      }
      &:hover {
        color: #fff;
        .iconfont,
        .user-lock-info {
          color: #fff;
        }
      }
    }
  }
  :deep(.editor-dropdown-btn) {
    .ant-btn-primary {
      background: #444444;
      border-color: #444444;
    }
    &.ant-btn-group .ant-btn-primary:first-child:not(:last-child) {
      border-right-color: #1a1d23;
    }
    &.ant-btn-group .ant-btn-primary:last-child:not(:first-child) {
      border-left-color: #1a1d23;
    }
  }
</style>
