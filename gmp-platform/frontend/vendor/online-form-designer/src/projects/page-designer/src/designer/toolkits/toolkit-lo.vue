<template>
  <div class="designer-lo">
    <div
      class="designer-lo__item"
      v-for="(loItem, key) in groupLos"
      :key="key"
      @click="handleEdit(loItem)"
    >
      <div class="designer-lo__item-title">{{ loItem.title }}</div>
      <div class="designer-lo__item-key">{{ key }}</div>

      <!-- <a-tooltip>
        <template #title>{{ t('sys.copyBtn') }}</template>
        <i class="iconfont icon-fuzhi" @click.stop="handleCopy(key)"></i>
      </a-tooltip>

      <a-tooltip>
        <template #title>{{ t('sys.delete') }}</template>
        <i class="iconfont icon-shanchu" @click.stop="handleDelete(key)"></i>
      </a-tooltip> -->
    </div>
  </div>
</template>

<script lang="ts" setup name="toolkit-lo">
  import { unref } from 'vue';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { openLoEditorDrawer } from '/@/components/Lo';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
  import { useMessage } from '/@/hooks/web/useMessage';

  const { setLo, groupLos, removeLo } = useDesigner();
  const { t } = useI18n();
  const { createMessage } = useMessage();

  const handleEdit = (loItem) => {
    console.log(loItem);
    openLoEditorDrawer({
      data: loItem,
      callback(value) {
        setLo(loItem.name, value);
      },
    });
  };

  const handleDelete = (key) => {
    removeLo(key);
  };

  const handleCopy = (key) => {
    const { isSuccessRef } = useCopyToClipboard(key);
    unref(isSuccessRef) && createMessage.success(t('sys.copySuccess'));
  };
</script>

<style lang="less" scoped>
  .designer-lo {
    height: 100%;
    overflow: auto;
  }
  .designer-lo__item {
    border-bottom: 1px solid #eaeaea;
    border-radius: 4px;
    padding: 10px;
    cursor: pointer;
    color: #333;
    height: 68px;
    padding: 12px 16px;
    position: relative;
    transition: all 0.3s;

    &:hover {
      background-color: #f5f5f5;
      color: var(--ant-primary-color);
    }

    &-title {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &-key {
      color: #9d9da6;
    }

    .iconfont {
      position: absolute;
      right: 10px;
      bottom: 10px;
      color: #9d9da6;
      &:hover {
        color: #ff4d4f;
      }

      &.icon-fuzhi {
        right: 35px;
        &:hover {
          color: var(--ant-primary-color);
        }
      }
    }
  }
</style>
