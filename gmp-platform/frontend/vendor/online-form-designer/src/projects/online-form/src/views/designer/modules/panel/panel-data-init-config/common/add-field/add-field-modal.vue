<template>
  <a-modal
    v-model:visible="visible"
    v-bind="props.options ?? {}"
    width="800px"
    wrapClassName="add-field-modal-wrapper"
    :class="{ isFullScreen }"
    :mask-closable="false"
    destroyOnClose
    :keyboard="false"
    :title="$t('sys.pageDesigner.addField')"
    :cancelText="t('sys.cancel')"
    :okText="t('sys.ok')"
    @cancel="handleClose"
    @ok="handleOk"
  >
    <div class="add-field-modal-full-screen" @click="onFullScreen">
      <i :class="['iconfont', isFullScreen ? 'icon-tuichuquanping' : 'icon-quanping']"></i>
    </div>
    <div class="add-field-modal-container">
      <add-field-cascader
        :modelKey="modelKey"
        v-model:select-value="selectCascaderValue"
        :isShowCascader="isShowCascader"
      />
      <div class="search">
        <a-input
          :placeholder="$t('sys.appDesigner.newViewField.pleaseEnterSearchContent')"
          allowClear
          v-model:value="searchValue"
        >
          <template #suffix>
            <i class="iconfont icon-sousuoMedpro leading-none"></i>
          </template>
        </a-input>
      </div>
      <div class="field-table-wrap">
        <a-table
          :columns="columns.map(e => ({
            ...e,
            title: $t(e.title),
          }))"
          :dataSource="filterDataSource"
          :showIndexColumn="false"
          :pagination="false"
          :striped="false"
          :bordered="false"
          :rowSelection="rowSelection"
          :scroll="{ x: 'max-content', y: 'max-content' }"
          sticky
        />
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts" name="AddFieldModal">
  import { ref, onBeforeMount, computed, reactive, toRaw, onMounted, nextTick } from 'vue';
  import { message } from 'ant-design-vue';
  import { last, isEmpty } from 'lodash-es';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { columns } from '../../utils/index';
  import AddFieldCascader from './add-field-cascader';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { useField } from './useField';
  import type { TableRowSelection } from 'ant-design-vue/lib/table/interface';

  const { t } = useI18n();

  const props = defineProps<{
    isRequest?: boolean;
    modelKey: string;
    joinModelType: string;
    joinFormRefId: string;
    actionType: string;
    cascaderValue?: string;
    fieldSelected: string;
    isShowCascader: boolean;
    filterFieldType?: FIELD_TYPE | Function;
    callback?: any;
    options?: object;
  }>();

  const visible = ref<boolean>(true);
  const isFullScreen = ref<boolean>(false);

  const searchValue = ref();
  const selectCascaderValue = ref(props.cascaderValue || `-:${props.modelKey}`);

  const rowSelection = reactive<TableRowSelection>({
    selectedRowKeys: [],
    columnWidth: 56,
    type: props.actionType ?? 'checkbox',
    onChange: handleRowChange,
  });

  const { initData, joinModelMetaMap } = useField();

  onBeforeMount(() => {
    if (props.isRequest) {
      initData(props.modelKey, {
        joinModelType: props.joinModelType,
        joinFormRefId: props.joinFormRefId,
      });
    }
  });

  onMounted(() => {
    nextTick(() => {
      if (props.fieldSelected) {
        rowSelection.selectedRowKeys =
          props.actionType === 'radio' ? [props.fieldSelected] : props.fieldSelected.slice();
      }
    });
  });

  const dataSource = computed(() => {
    let modelKey = props.modelKey;
    if (selectCascaderValue.value) {
      const lastPos: string = last(selectCascaderValue.value.split('$')) ?? '';
      if (lastPos) {
        const lastValue = last(lastPos.split(';'));
        if (lastValue) {
          const [_, bindModelKey] = lastValue.split(':');
          modelKey = bindModelKey;
        }
      }
    }

    const metaInfo = joinModelMetaMap.value?.[modelKey];

    return !isEmpty(metaInfo)
      ? metaInfo.fields.filter((item) => {
          if (!props.filterFieldType) return true;

          if (typeof props.filterFieldType === 'function') return props.filterFieldType(item);

          const typeMap = {
            [FIELD_TYPE.TEXT]: true,
            [FIELD_TYPE.LONG_TEXT]: true,
            [FIELD_TYPE.INTEGER]: [FIELD_TYPE.INTEGER, FIELD_TYPE.LONG],
            [FIELD_TYPE.LONG]: [FIELD_TYPE.INTEGER, FIELD_TYPE.LONG],
            [FIELD_TYPE.DOUBLE]: [
              FIELD_TYPE.INTEGER,
              FIELD_TYPE.LONG,
              FIELD_TYPE.DOUBLE,
              FIELD_TYPE.DECIMAL,
            ],
            [FIELD_TYPE.DECIMAL]: [
              FIELD_TYPE.INTEGER,
              FIELD_TYPE.LONG,
              FIELD_TYPE.DOUBLE,
              FIELD_TYPE.DECIMAL,
            ],
            [FIELD_TYPE.OPTION]: [FIELD_TYPE.OPTION, FIELD_TYPE.ENUM],
            [FIELD_TYPE.OPTION_MULTI]: [FIELD_TYPE.OPTION_MULTI, FIELD_TYPE.ENUM_MULTI],
          };

          const validTypes = typeMap[props.filterFieldType];
          return validTypes
            ? validTypes === true || validTypes.includes(item.fieldType)
            : props.filterFieldType === item.fieldType;
        })
      : [];
  });

  const filterDataSource = computed(() => {
    if (searchValue.value) {
      const regex = new RegExp(searchValue.value, 'i');
      return dataSource.value.filter(
        (item) => regex.test(item.fieldKey) || regex.test(item.fieldName),
      );
    }
    return dataSource.value;
  });

  function handleRowChange(selectedRowKeys, selectedRows) {
    // 删除已过滤的行的选中状态
    const filteredTableKeys = filterDataSource.value.map((item) => item.fieldKey!);
    const retainKeys = rowSelection.selectedRowKeys!.filter(
      (key) => !filteredTableKeys.includes(key),
    );
    rowSelection.selectedRowKeys = retainKeys.concat(selectedRowKeys);
  }

  const onFullScreen = () => {
    isFullScreen.value = !isFullScreen.value;
  };

  function handleOk() {
    if (rowSelection.selectedRowKeys?.length === 0) {
      message.warn($t('sys.dataSet.pleaseSelectField'));
      return;
    }
    const selectKeys = toRaw(rowSelection.selectedRowKeys);
    props.callback({
      cascaderSelected: selectCascaderValue.value,
      fieldSelected: selectKeys,
      fieldInfoSelected: selectKeys?.map((fieldId) =>
        toRaw(dataSource.value.find((item) => item.fieldKey === fieldId)),
      ),
    });

    handleClose();
  }

  function handleClose() {
    visible.value = false;
    isFullScreen.value = false;
    searchValue.value = undefined;
    selectCascaderValue.value = undefined;
    rowSelection.selectedRowKeys = [];
  }
</script>

<style lang="less" scoped>
  .add-field-modal-full-screen {
    position: absolute;
    top: 0;
    right: 48px;
    padding: 16px 8px;
    color: #212528;
    font-size: 16px;
    line-height: 1;
    line-height: 22px;
    cursor: pointer;
  }
</style>

<style lang="less">
  .add-field-modal-wrapper {
    .ant-modal-content {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      max-height: 80vh;

      > .ant-modal-close {
        > .ant-modal-close-x {
          width: auto;
          height: auto;
          padding: 16px;
          color: #212528;
          line-height: 1;
          line-height: 22px;
        }
      }

      > .ant-modal-header,
      > .ant-modal-footer {
        flex-shrink: 0;
        padding: 16px;
      }

      > .ant-modal-header {
        border-bottom: 1px solid #e0e3ea;
      }

      > .ant-modal-footer {
        padding: 12px 16px;
        border-top: 1px solid #e0e3ea;
        background-color: #fff;
      }

      > .ant-modal-header .ant-modal-title {
        color: #000;
        font-weight: 600;
      }

      > .ant-modal-body {
        display: flex;
        flex-grow: 1;
        min-height: 600px;
        padding: 0;
        overflow: auto;
        background-color: #fff;

        .add-field-modal-container {
          display: flex;
          flex-direction: column;
          width: 100%;
          padding: 16px 24px;
          overflow: hidden;

          .title {
            margin-bottom: 16px;
            margin-left: 4px;
            color: #212528;
          }

          .search {
            width: 264px;
            margin-top: 16px;
            margin-bottom: 16px;
          }

          .field-table-wrap {
            overflow: hidden;

            .ant-table-wrapper {
              position: relative;
              height: 100%;

              .ant-spin-nested-loading {
                height: 100%;

                .ant-spin-container {
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                  height: 100%;
                  overflow: hidden;

                  .ant-table {
                    flex: 1;
                    overflow: hidden;
                  }

                  .ant-table-container {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    height: 100%;
                    overflow: hidden;

                    .ant-table-body {
                      flex: 1;
                      overflow: auto !important;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    .isFullScreen {
      top: 0;
      width: 100vw !important;
      max-width: 100%;
      margin: 0;
      padding-bottom: 0;

      .ant-modal-content {
        display: flex;
        flex-direction: column;
        width: 100vw;
        max-width: 100vw;
        height: 100vh;
        max-height: 100vh;
      }
    }
  }
</style>
