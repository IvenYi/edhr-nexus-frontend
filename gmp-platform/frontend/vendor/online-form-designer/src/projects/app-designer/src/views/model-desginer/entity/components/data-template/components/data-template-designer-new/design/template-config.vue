<template>
  <div class="template-config ks-row w100% h100% px24px pt24px pb32px">
    <div class="template-config-aside w296px bg-[#FBFBFC] ks-column h100%">
      <div class="text-[#797A7D] px16px py12px border-b border-b-[#F0F0F0] border-b-solid">
        选择
        <span class="font-600 text-[#242424]">{{
          t(`sys.app.templateType.${tmplInfo.type}`)
        }}</span>
        的表头字段
      </div>
      <fieldsTree
        :tree-data="treeData"
        :checkedKeys="checkedKeys"
        :spinning="treeSpinning"
        v-model:expandedKeys="expandedTreeKeys"
        @on-tree-check="(ckeys, e) => onFieldTreeCheck(ckeys, e, afterSort)"
      />
    </div>
    <div class="template-config-main ks-col bg-[#FFFFFF] px20px py16px relative overflow-auto">
      <div class="title py4px">
        {{ t('sys.app.tmplType') }}：{{ t(`sys.app.templateType.${tmplInfo.type}`) }}
      </div>
      <div v-if="!modelColumns.length" class="ks-column bg-[#FBFBFC] py32px">
        <img src="../../../../../../../../assets/image/template-no-columns.svg" height="120" />
        <div class="text-center text-[#797A7D] mt4px">
          {{ t('sys.app.tmplTypeTip', { sth: t(`sys.app.templateType.${tmplInfo.type}`) }) }}
        </div>
      </div>
      <div v-else class="main-wrap">
        <div class="sort-btn">
          <sortColumnsBtn
            v-model:table="tableColumns"
            v-model:data="modelColumns"
            @after-sort="afterSort"
          />
        </div>
        <div v-if="tableColumns.length || modelColumns.length" class="mt4px relative pb36px">
          <vxe-grid
            ref="vxeTableRef"
            v-bind="gridOptions"
            :columns="tableColumns"
            :class="['vxetable', 'default']"
            :header-cell-class-name="gridHeaderCellClass"
            @resizable-change="resizeChange"
          >
            <template #header="{ column }">
              <div v-if="!column.params?.isEdit" class="ks-row px16px py7px">
                <div class="ell" :title="column.params?.aliasName || column.params?.name">
                  <i
                    v-show="
                      column.params?.required ||
                      modelColumns
                        .find((e) => e.key === column.params.modelKey)
                        ?.configJson?.required?.includes(column.params?.id)
                    "
                    class="error-gct"
                    >*</i
                  >
                  {{ column.params?.aliasName || column.params?.name }}
                </div>
                <i
                  class="iconfont icon-bianji ml8px cursor-pointer primary-gct"
                  @click="onEditColumn(column)"
                ></i>
              </div>
              <div v-else>
                <a-input
                  ref="titleInputRef"
                  v-model:value="column.params.fName"
                  allowClear
                  class="h35px"
                  :maxlength="32"
                  @change="(e) => onTitleInputChange(e, column)"
                  @blur="onTitleInputBlur(column)"
                />
                <div
                  v-if="column.params.isError"
                  class="text-[12px] error-gct lh-14px py2px error-tip"
                >
                  {{ t('sys.model.modelNameError') }}
                </div>
              </div>
            </template>
          </vxe-grid>
          <div class="tabs-wrap">
            <div
              v-for="item in modelColumns.filter((e) => !e.subModel)"
              :key="item.id"
              class="tab-item active"
            >
              {{ item.name }}
            </div>
          </div>
        </div>
        <templateConfigImport v-if="tmplInfo.type === DataTemplateEnum.IMPORT" />
        <div class="mt20px"></div>
        <a-tabs v-if="treeData.length > 1" v-model:activeKey="activeModel">
          <a-tab-pane
            v-for="item in tabList"
            :key="item.id"
            :tab="
              item.subModel
                ? item.bindField?.name + '（' + t('sys.pageDesigner.subTable') + '）'
                : item.name
            "
          />
        </a-tabs>
        <template v-for="(item, idx) in modelColumns" :key="idx">
          <template v-if="tmplInfo.type === DataTemplateEnum.IMPORT">
            <fieldConfigImport
              v-show="activeModel === item.id"
              :ref="setRefs(idx)"
              :form="getConfigJson(idx)"
              v-model:columns="item.children"
            >
              <EventConfigImport
                v-if="tmplInfo.type === DataTemplateEnum.IMPORT && !modelDetail.subModel"
                :eventInfo="eventInfo"
                @change="(info) => (eventInfo = info)"
              />
            </fieldConfigImport>
          </template>
          <template v-else>
            <fieldConfigExport v-show="activeModel === item.id" v-model:columns="item.children" />
          </template>
        </template>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed, nextTick, onMounted, reactive, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { DataTemplateEnum } from '../../../type';
  import sortColumnsBtn from '../components/sort-columns-btn.vue';
  import templateConfigImport from '../components/template-config-import.vue';
  import fieldConfigImport from '../components/field-config-import.vue';
  import fieldConfigExport from '../components/field-config-export.vue';
  import fieldsTree from '../components/fields-tree.vue';
  import { cloneDeep } from 'lodash-es';
  import { message } from 'ant-design-vue';
  import { useRefs } from '@vben/hooks';
  import { hasEmojiAndSpecStr } from '/@/utils/validate';
  import { useDesigner } from '../hook/useDesigner';
  import EventConfigImport from '../components/event-config-import.vue';

  const {
    tmplInfo,
    eventInfo,
    treeData,
    treeSpinning,
    onFieldTreeCheck,
    modelColumns,
    activeModel,
    saveConfig,
    expandedTreeKeys,
    tableColumns,
    modelDetail,
  } = useDesigner();

  const { t } = useI18n();
  const props = defineProps<{
    isEdit?: boolean;
  }>();

  const { refs, setRefs } = useRefs();
  const vxeTableRef = ref();
  const titleInputRef = ref();
  const gridOptions = reactive<{
    data: object[];
    columnConfig: Object;
    editConfig: Object;
  }>({
    data: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
    columnConfig: {
      resizable: true,
      slots: {
        header: 'header',
      },
    },
    editConfig: {
      trigger: 'click',
    },
  });

  // const tableColumns = computed(() => {
  //   return modelColumns.value?.reduce((list, item) => {
  //     const children = (item.children || []).map((e) => {
  //       return {
  //         ...e,
  //         params: {
  //           ...e,
  //         },
  //       };
  //     });
  //     if (!item.subModel) {
  //       list.push(...children);
  //     } else {
  //       list.push({
  //         title: item.bindField?.name + '（子表）',
  //         modelKey: item.key,
  //         children,
  //       });
  //     }
  //     return list;
  //   }, []);
  // });

  const checkedKeys = computed(() => {
    return modelColumns.value
      .map((e) => e.children || [])
      .flat()
      .map((e) => e.id);
  });

  const tabList = computed(() => {
    if (tmplInfo.value.type === DataTemplateEnum.IMPORT) {
      return modelColumns.value;
    } else {
      return modelColumns.value.filter((e) => e.children.some((f) => hasExportConfig(f)));
    }
  });

  function hasExportConfig(field) {
    const { type, mappingType } = field;
    return (
      [
        FIELD_TYPE.INTEGER,
        FIELD_TYPE.LONG,
        FIELD_TYPE.DOUBLE,
        FIELD_TYPE.DECIMAL,
        FIELD_TYPE.DATE,
        FIELD_TYPE.TIME,
        FIELD_TYPE.DATE_TIME,
      ].includes(type) ||
      ([FIELD_TYPE.AGG, FIELD_TYPE.EXPRESSION].includes(type) &&
        [FIELD_TYPE.INTEGER, FIELD_TYPE.LONG, FIELD_TYPE.DECIMAL].includes(mappingType))
    );
  }

  onMounted(async () => {
    activeModel.value = modelColumns.value[0]?.id;
  });

  function getConfigJson(idx) {
    const modelObj = modelColumns.value[idx];
    if (modelObj && !modelObj?.configJson)
      modelObj['configJson'] = cloneDeep({
        required: [],
        uniqueColumns: [],
      });
    return modelObj?.configJson;
  }

  // 表格-列字段排序
  const afterSort = () => {
    vxeTableRef.value?.loadColumn(tableColumns.value);
  };

  // 表格-调整列宽事件
  const resizeChange = (data) => {
    const { resizeWidth, column } = data;
    column.params.width = resizeWidth;
  };

  // 表格列头-切换编辑态
  const onEditColumn = (column) => {
    column.params.isEdit = true;
    column.params.fName = column.params.aliasName || column.params.name;
    nextTick(() => {
      titleInputRef.value?.select();
    });
  };

  const onTitleInputChange = (e, column) => {
    const value = e.target.value;
    column.params.isError = value && hasEmojiAndSpecStr(value);
  };

  // 表格列头-保存编辑
  const onTitleInputBlur = (column) => {
    let { name, fName } = column.params || {};
    let aliasName = fName.trim();
    if (aliasName && hasEmojiAndSpecStr(aliasName)) {
      column.params.isError = true;
      return;
    }
    if (
      !aliasName &&
      (column.type === FIELD_TYPE.RDO_REF || column.type === FIELD_TYPE.ONLINE_FORM_TEMPLATE)
    ) {
      aliasName = name;
    }
    column.params.aliasName = aliasName;
    column.params.isEdit = false;
    column.params.isError = false;
    column.params.aliasName = aliasName;
  };

  // 保存
  const save = async () => {
    if (!modelColumns.value.length) {
      message.error(t('sys.app.pleaseConfigTemplate'));
      return Promise.reject();
    }
    if (tmplInfo.value.type === DataTemplateEnum.IMPORT && refs.value.length) {
      const results = await Promise.all([
        ...refs.value.filter((e) => !!e).map((e) => e.validate()),
      ]);

      const idx = results.findIndex((e) => !e);
      if (idx > -1) {
        activeModel.value = modelColumns.value![idx].id;
        return Promise.reject();
      }
    }
    await saveConfig(props.isEdit);
    message.success(t('sys.saveSuccess'));
  };

  function gridHeaderCellClass(params) {
    const field = params.column.params;
    const master = tableColumns.value.filter((e) => e.key);
    return master.length &&
      field?.id === master.slice(-1)[0]?.id &&
      tableColumns.value[master.length]
      ? 'last-master-column'
      : '';
  }

  defineExpose({ save });
</script>
<style lang="less" scoped>
  .template-config {
    &-aside {
      border-top: 1px solid @gct-modal-border-color;
      border-bottom: 1px solid @gct-modal-border-color;
      border-left: 1px solid @gct-modal-border-color;
      border-radius: 4px 0 0 4px;
    }

    &-main {
      border: 1px solid @gct-modal-border-color;
      border-radius: 0 4px 4px 0;

      .title {
        display: flex;
        align-items: center;
        font-size: 16px;
        &::before {
          content: ' ';
          display: block;
          width: 3px;
          height: 16px;
          background-color: var(--ant-primary-color);
          margin-right: 8px;
        }
      }
      .main-wrap {
        .sort-btn {
          position: absolute;
          top: 16px;
          right: 20px;
        }

        .tabs-wrap {
          width: 100%;
          background-color: #fbfbfc;
          border: 1px solid var(--vxe-table-border-color);
          border-top: 0;
          border-radius: 0 0 4px 4px;
          box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.12);
          position: absolute;
          bottom: 0;
          z-index: 10;
          padding-bottom: 4px;

          .tab-item {
            font-weight: 500;
            padding: 5px 12px;
            position: relative;
            display: inline-block;
            cursor: pointer;

            &::before {
              content: ' ';
              display: block;
              width: 100%;
              height: 1px;
              position: absolute;
              bottom: 0;
              left: 0;
            }

            &.active {
              color: var(--ant-primary-color);
              background-color: #fff;
              &::before {
                background-color: var(--ant-primary-color);
              }
            }
          }
        }
      }
    }
  }

  :deep(.vxe-header--column) {
    padding: 0 !important;

    &.col--group {
      border-right: 1px solid var(--vxe-table-border-color);
      .vxe-cell {
        padding: 7px 16px;
        text-align: center;
      }
    }
  }
  :deep(.vxe-table--render-default .vxe-cell) {
    padding: 0;

    span.ant-input-affix-wrapper {
      border-radius: 0;
      margin-top: 1px;
      margin-left: 1px;

      &.ant-input-affix-wrapper-focused {
        border-color: var(--ant-primary-color);
      }
    }
  }

  :deep(.ant-tabs-tab) {
    padding: 12px 16px;

    & + .ant-tabs-tab {
      margin-left: 24px;
    }
  }
  :deep(.vxe-table--render-default.vxe-editable .vxe-body--column) {
    height: 36px;
  }
  :deep(.vxe-table--render-default.vxe-editable .vxe-body--column) {
    height: 36px !important;
    // background: none;
  }
  :deep(.vxe-table) {
    --vxe-table-resizable-line-color: #e0e3ea;
    .vxe-table--render-wrapper {
      .vxe-table--body {
        // position: relative;
        min-width: 100%;
        .vxe-cell {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        // &::after,
        // &::before {
        //   content: ' ';
        //   display: block;
        //   width: 100%;
        //   height: 36px;
        //   border-top: 1px solid @gct-table-border-color;
        //   border-bottom: 1px solid @gct-table-border-color;
        //   box-sizing: border-box;
        //   position: absolute;
        //   top: 36px;
        //   left: 0;
        //   z-index: 999;
        // }
        // &::after {
        //   top: 108px;
        //   left: 0;
        // }
      }

      .vxe-table--body {
        // visibility: hidden;
      }
      .last-master-column .is--line {
        &::before {
          height: 100%;
        }
      }
    }

    // &.is--group {
    //   .vxe-table--render-wrapper {
    //     &::after,
    //     &::before {
    //       top: 108px;
    //     }
    //     &::after {
    //       top: 180px;
    //       left: 0;
    //     }
    //   }
    // }
  }
</style>
