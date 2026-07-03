<template>
  <div class="gct-component-search">
    <a-input
      v-model:value="searchVal"
      :placeholder="t('sys.searchKey')"
      @pressEnter="handlerSearch"
      @clear="clear"
      allow-clear
    >
      <template #prefix>
        <SearchOutlined />
      </template>
    </a-input>
    <search-modal ref="searchRef" @selectResult="selectResult" />
  </div>
</template>
<script setup lang="ts" name="ComponentSearch">
  import { ref } from 'vue';
  import { message } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import SearchModal from './search-modal.vue';
  import { getEleSearchSearchByKey } from '/@/apis/gct-apaas/ElementSearchController';
  import { useSearchEvent } from '/@/hooks/web/useQuickSearch';

  const { t } = useI18n();
  const { quickSearchEvent } = useSearchEvent();
  const searchVal = ref('');
  const searchRef = ref(null);

  const selectResult = async (record) => {
    // 这里进行跳转
    if (!record) return;
    const { code, key, name, categoryId } = record;
    await quickSearchEvent(code, key, name, categoryId);
    // 跳转成功后关闭弹窗，清除输入框
    searchVal.value = '';
    searchRef.value.close();
  };

  const clear = () => {
    searchRef.value.close();
  };

  const handlerSearch = async () => {
    const key = searchVal?.value?.trim();
    getEleSearchSearchByKey({ key }).then((res) => {
      if (!res || !res.length) {
        searchRef.value.close();
        message.warning(t('sys.component.app.searchNotData'));
        return;
      }
      if (res.length == 1) {
        selectResult(res[0]);
      } else {
        searchRef.value.showModal(res);
      }
    });
  };
</script>
<style lang="less" scoped>
  .gct-component-search {
    display: flex;
    width: 260px;
    margin-left: auto;
    border-radius: 4px;

    .ant-input-affix-wrapper {
      border: none;
      background: #444;
      color: rgb(255 255 255 / 44%);

      :deep(.ant-input) {
        background: #444;
        color: #fff;

        &::placeholder {
          transition: all 0.3s;
          color: rgb(255 255 255 / 44%);
          font-size: 14px;
          font-weight: 400;
        }
      }

      :deep(.ant-input-suffix) {
        .ant-input-clear-icon-has-suffix {
          color: rgb(255 255 255 / 44%);
        }
      }

      &:hover {
        background: #4f4f4f;
        color: #fff;

        :deep(.ant-input) {
          background: #4f4f4f;
        }
      }

      &:active,
      &-focused {
        background: #5c5c5c !important;
        color: #fff;

        :deep(.ant-input) {
          background: #5c5c5c !important;

          &::placeholder {
            // color: #fff;
          }
        }
      }
    }
  }

  :deep(.gct-hidden-input-icon) {
    .anticon-close-circle {
      visibility: visible;
    }
  }

  :deep(.anticon.ant-input-clear-icon-hidden) {
    visibility: hidden;
  }
</style>
