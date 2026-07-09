<template>
  <BasicPopup
    :show="show"
    class="change-form-ins-popup"
    @update:show="emit('update:show', $event)"
    :popup-props="{ position: 'right', ...popupProps }"
    title="切换实例"
    :extraStyle="{
      width: '480px',
    }"
  >
    <template #header-bottom>
      <SearchBar @search="onSearch" @add="handleCreateInstance" :showAddBtn="showAddBtn" />
    </template>
    <div class="change-form-ins-popup-container">
      <template v-if="filteredList && filteredList.length">
        <van-radio-group :modelValue="checkedId">
          <van-cell-group>
            <van-cell
              v-for="i in filteredList"
              :key="i.id"
              :title="i.description"
              clickable
              @click="checkedId = i.id"
              class="mb-8px rounded-8px border border-solid border-transparent"
              :class="checkedId === i.id ? 'selected' : ''"
            >
              <template #title>
                <div class="title">
                  <span>{{ i.modifyUserName }}</span>
                  <span> - </span>
                  <span v-html="i.highlightName || i.description"></span>
                </div>
                <div class="subtitle">表单流水号：{{ i.serialNo }}</div>
                <div class="status">
                  <instance-status-label
                    :form-type="i.formType!"
                    :data-status="i.dataStatus"
                    :instance-status="i.instanceStatus!"
                  />
                </div>
              </template>
              <template #right-icon>
                <van-radio :name="i.id" />
              </template>
            </van-cell>
          </van-cell-group>
        </van-radio-group>
      </template>

      <template v-else>
        <div class="empty">
          <van-empty :image="emptyPng" description="暂无数据" />
        </div>
      </template>
    </div>
    <template #footer>
      <div class="flex">
        <van-button class="w-140px important-mr-16px" type="default" @click="onCancel">
          取消
        </van-button>
        <van-button class="flex-1" type="primary" @click="onOk">确认切换</van-button>
      </div>
    </template>
  </BasicPopup>
</template>

<script setup lang="ts" name="change-form-ins-popup">
  import { computed, ref, watch } from 'vue';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import emptyPng from '/@/assets/images/empty.png';
  import { OnlineFormInstanceResponse } from '/@/apis/gct-apaas/model';
  import AddFormInsPopup from './add-form-ins-popup.vue';
  import { GctPopup } from '@mobile/utils/popup';

  import InstanceStatusLabel from '../instance-status/instance-status-label.vue';
  import SearchBar from '../../components/_common_/search-bar/search-bar.vue';

  const props = withDefaults(
    defineProps<{
      show: boolean;
      /** 在线表单实例列表 */
      docInstanceList: Array<OnlineFormInstanceResponse>;
      searchValue: string;
      /** 选择的实例id */
      selectedId?: string;
      /** 是否显示新增按钮 */
      showAddBtn?: boolean;
      popupProps?: any; // 组件属性
    }>(),
    {
      showAddBtn: true,
    },
  );

  const emit = defineEmits<{
    (e: 'update:show', value: boolean): void;
    (e: 'search', value?: string): void;
    (e: 'selected', value?: any): void;
    (e: 'createNewIns', description: string): void;
  }>();

  const checkedId = ref('');

  watch(
    [() => props.show, () => props.selectedId],
    ([v]) => {
      if (v) {
        checkedId.value = props.selectedId || '';
      }
    },
    {
      immediate: true,
    },
  );

  const filteredList = computed(() =>
    (props.docInstanceList || [])
      .map((item) => {
        const h = highlightName(item.description);
        return h ? { ...item, highlightName: h } : null;
      })
      .filter(Boolean),
  );

  const onSearch = (value?: string) => {
    emit('search', value);
  };

  // 内容高亮处理
  function highlightName(name?: string) {
    const displayName = name;
    console.log('searchValue', props.searchValue);
    const rDisplayName = displayName?.replace(
      new RegExp(props.searchValue?.replace(new RegExp(/(?=[$.?+\[\]\*^|\\(){}/])/g), '\\'), 'g'),
      (s) => `<span class="is-highlight">${s}</span>`,
    );
    if (rDisplayName === displayName) return null;

    return rDisplayName;
  }

  /** 执行关闭操作 */
  const doClose = (_data?: any) => {
    checkedId.value = '';
    emit('update:show', false);
  };

  const onCancel = () => {
    doClose();
  };

  const onOk = async () => {
    const info = props.docInstanceList.find((item) => item.id === checkedId.value);
    emit('selected', info);
    doClose();
  };

  const handleCreateInstance = () => {
    GctPopup.open(AddFormInsPopup, {
      beforeClose: (data) => {
        if (data?.description) {
          emit('createNewIns', data.description);
        }
      },
    });
  };
</script>

<style lang="less">
  .change-form-ins-popup.van-popup .popup__header {
    box-shadow: none;
  }
</style>

<style lang="less" scoped>
  .change-form-ins-popup-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: #f7f8fa;
    padding: 16px;
    --van-field-input-text-color: #a6a6a6;
    --van-search-left-icon-color: #5a5f6b;
    --van-cell-group-background: transparent;
    :deep(.van-cell:after) {
      display: none;
    }

    :deep(.van-cell-group) {
      &::after {
        border: none;
      }
    }

    .title {
      font-weight: 500;
      font-size: 16px;
      color: #1a1d23;
      line-height: 24px;
    }

    .subtitle {
      font-size: 14px;
      color: #8b8b8b;
      line-height: 20px;
      margin-top: 4px;
      margin-bottom: 4px;
    }

    .selected {
      background: rgba(0, 153, 255, 0.08);
      border: 1px solid rgba(0, 153, 255, 0.3);
      border-radius: 8px;
    }

    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    :deep(.is-highlight) {
      color: var(--van-primary-color);
    }
  }
</style>
