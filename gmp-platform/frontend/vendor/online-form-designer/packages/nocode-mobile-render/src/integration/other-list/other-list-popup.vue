<template>
  <BasicPopup
    :show="show"
    class="other-list-popup"
    @update:show="emit('update:show', $event)"
    :popup-props="{ position: 'right', ...popupProps }"
    :title="title"
    :extraStyle="{
      width: '480px',
    }"
  >
    <template #header-bottom>
      <SearchBar :showAddBtn="false" @search="onSearch" />
    </template>
    <div class="other-list-popup-container">
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
                <template v-if="i.showType === 'TMPL'">
                  <div class="flex align-middle">
                    <div
                      class="title"
                      v-html="i.highlightName || i.tmplName"
                      :title="i.tmplName"
                    ></div>
                    <div class="tmpl-tag">模板</div>
                  </div>
                </template>
                <template v-else>
                  <div
                    class="title"
                    v-html="i.highlightName || i.tmplName"
                    :title="i.tmplName"
                  ></div>
                  <div class="subtitle">表单备注名：{{ i.title || '--' }} </div>
                  <div class="subtitle">表单流水号：{{ i.serialNo || '--' }}</div>
                  <instance-status-label
                    :form-type="i.formType!"
                    :data-status="i.dataStatus"
                    :instance-status="i.instanceStatus!"
                    :status-type="i?.showType"
                  />
                </template>
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
        <van-button class="flex-1" type="primary" @click="onOk">确认</van-button>
      </div>
    </template>
  </BasicPopup>
</template>

<script setup lang="ts" name="other-list-popup">
  import { computed, ref, watch } from 'vue';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import emptyPng from '/@/assets/images/empty.png';
  import InstanceStatusLabel from '../instance-status/instance-status-label.vue';
  import SearchBar from '../../components/_common_/search-bar/search-bar.vue';

  const props = withDefaults(
    defineProps<{
      show: boolean;
      /** 抽屉标题 */
      title: string;
      /** 表单列表集合 */
      otherList: any;
      selectedId?: string;
      popupProps?: any; // 组件属性
    }>(),
    {
      otherList: () => [],
    },
  );

  const emit = defineEmits<{
    (e: 'update:show', value: boolean): void;
    (e: 'selected', value?: any): void;
  }>();

  const checkedId = ref('');

  const _searchVal = ref('');

  watch(
    () => props.show,
    (v) => {
      if (v) {
        checkedId.value = props.selectedId || '';
        _searchVal.value = '';
      }
    },
    {
      immediate: true,
    },
  );

  const filteredList = computed(() =>
    (props.otherList || [])
      .map((item) => {
        const h = highlightName(item.tmplName);
        return h ? { ...item, highlightName: h } : null;
      })
      .filter(Boolean),
  );

  const onSearch = (value: string) => {
    _searchVal.value = value;
  };

  // 内容高亮处理
  function highlightName(name?: string) {
    const displayName = name;
    const rDisplayName = displayName?.replace(
      new RegExp(_searchVal.value?.replace(new RegExp(/(?=[$.?+\[\]\*^|\\(){}/])/g), '\\'), 'g'),
      (s) => `<span class="is-highlight">${s}</span>`,
    );
    if (rDisplayName === displayName) return null;

    return rDisplayName;
  }

  /** 执行关闭操作 */
  const doClose = (_data?: any) => {
    emit('update:show', false);
  };

  const onCancel = () => {
    doClose();
  };

  const onOk = async () => {
    const info = props.otherList.find((item) => item.id === checkedId.value);
    emit('selected', info);
    doClose();
  };
</script>

<style lang="less">
  .other-list-popup.van-popup .popup__header {
    box-shadow: none;
  }
</style>

<style lang="less" scoped>
  .other-list-popup-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: #f7f8fa;
    padding: 16px;
    --van-field-input-text-color: #a6a6a6;
    --van-search-left-icon-color: #5a5f6b;
    --van-cell-group-background: transparent;
    --van-cell-background: #ffffff;
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

    .tmpl-tag {
      margin-left: 6px;
      background: rgba(130, 116, 255, 0.1);
      border-radius: 4px 4px 4px 4px;
      border: 1px solid rgba(130, 116, 255, 0.3);
      font-weight: 400;
      font-size: 12px;
      color: #8274ff;
      padding: 0 6px;
      line-height: 22px;
      flex-shrink: 0;
    }
  }
</style>
