<template>
  <BasicPopup
    :show="show"
    @update:show="emit('update:show', $event)"
    :popup-props="{ position: 'right', ...popupProps }"
    title="附录列表"
    :extraStyle="{
      width: '480px',
    }"
  >
    <template #header-bottom>
      <SearchBar :showAddBtn="false" @search="onSearch" @add="handleCreateInstance" />
    </template>
    <div class="flex flex-col h-full w-full appendix-list-popup">
      <van-radio-group :modelValue="checkedIns.id">
        <van-cell-group inset>
          <van-cell
            v-for="i in filterList"
            :key="i.id"
            :title="i.description"
            clickable
            @click="checkedIns = i"
            class="mb-8px"
            :class="checkedIns.id === i.id ? 'selected' : ''"
          >
            <template #title>
              <div class="title">
                {{ i.tmplName }}
              </div>
              <div class="subtitle"> 表单备注名 ：{{ i.title }} </div>
              <div class="subtitle">表单流水号：{{ i.serialNo }}</div>
              <instance-status-label
                class="status"
                :form-type="i.formType!"
                :data-status="i.dataStatus"
                :instance-status="i.instanceStatus!"
              />
            </template>
            <template #right-icon>
              <van-radio :name="i.id" />
            </template>
          </van-cell>
        </van-cell-group>
      </van-radio-group>
    </div>
    <template #footer>
      <div class="flex">
        <van-button class="w-80px important-mr-16px" type="default" @click="onCancel">
          取消
        </van-button>
        <van-button class="flex-1" type="primary" @click="onOk">确认</van-button>
      </div>
    </template>
  </BasicPopup>
</template>

<script setup lang="ts" name="appendix-list-popup">
  import { computed, ref, watch, watchEffect } from 'vue';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';

  import { i18n } from '@mobile/locales/setupI18n';
  import InstanceStatusLabel from '../instance-status/instance-status-label.vue';
  import SearchBar from '../../components/_common_/search-bar/search-bar.vue';

  const { t } = i18n.global;

  const props = withDefaults(
    defineProps<{
      show: boolean;
      /** eDHR附录 */
      appendixList: any;
      /** 选择的实例信息 */
      selectSelfInfo: any;
      popupProps?: any; // 组件属性
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:show', value: boolean): void;
    (e: 'update:selectSelfInfo', value?: any): void;
  }>();

  const checkedIns = ref();
  const _searchVal = ref('');

  watch(
    () => props.selectSelfInfo?.id,
    () => {
      if (props.selectSelfInfo) {
        checkedIns.value = props.selectSelfInfo;
      }
    },
    { immediate: true },
  );

  watch(
    () => props.show,
    (val) => {
      if (val) {
        _searchVal.value = '';
      }
    },
    { immediate: true },
  );

  const filterList = computed(() => {
    const reg = new RegExp(
      _searchVal.value?.replace(new RegExp(/(?=[$.?+\[\]\*^|\\(){}/])/g), '\\'),
      'g',
    );
    return props.appendixList.filter((item) => reg.test(item.tmplName));
  });

  const onSearch = (value: string) => {
    _searchVal.value = value;
  };

  /** 执行关闭操作 */
  const doClose = (_data?: any) => {
    emit('update:show', false);
  };

  const onCancel = () => {
    doClose();
  };

  const onOk = async () => {
    const data = {};
    if (props.selectSelfInfo.id !== checkedIns.value.id) {
      emit('update:selectSelfInfo', checkedIns.value);
    }
    doClose(data);
  };
</script>

<style lang="less" scoped>
  .appendix-list-popup {
    background: #f7f8fa;
    padding-top: 16px;
    --van-field-input-text-color: #a6a6a6;
    --van-search-left-icon-color: #5a5f6b;
    --van-cell-group-background: transparent;
    --van-cell-background: #ffffff;
    :deep(.van-cell:after) {
      display: none;
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
      background: #f0f6fc;
      border-radius: 8px 8px 8px 8px;
      border: 1px solid #026ac8;
    }
  }
</style>
