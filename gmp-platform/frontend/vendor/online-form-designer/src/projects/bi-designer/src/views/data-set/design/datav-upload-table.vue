<template>
  <div :class="ns.b()">
    <div :class="ns.e('left')">
      <a-button
        class="important-px-0"
        v-if="canAddFormulaField"
        type="link"
        @click="handleAddFormulaField"
        >新建公式字段</a-button
      >
      <div :class="[ns.e('search-container')]">
        <a-input
          :class="[ns.e('search-input')]"
          v-model:value="searchKey"
          :placeholder="t('sys.searchText')"
          allowClear
        >
          <template #prefix>
            <i class="iconfont icon-sousuo1"></i>
          </template>
        </a-input>
      </div>
      <div :class="[ns.e('search-container-tree-box')]">
        <TreeEx
          :class="[ns.e('tree')]"
          ref="treeExRef"
          bordered
          :draggable="false"
          v-model:selected-keys="selectedKeys"
          defaultExpandAll
          :data="treeData"
          last-selection-locked
          :filter="searchKey ? searchKey.trim() : ''"
          @select="handleSelect"
        >
          <template #title="{ node }">
            <div :class="[ns.b('tree-node'), ns.is('highlight', highlightId === node.key)]">
              <span
                :class="['field-icon', node.fieldType.split('_')[0], 'mr-4px']"
                v-if="node.fieldType"
              >
                <template v-if="node.fieldType.split('_')[1] == 'text'">Str.</template>
                <template v-else-if="node.fieldType.split('_')[1] == 'number'">No.</template>
                <template v-else-if="node.fieldType.split('_')[1] == 'date'">
                  <calendar-outlined class="new-size" />
                </template>
                <template v-else-if="node.fieldType.split('_')[1] == 'img'">
                  <i class="icon iconfont icon-tupian_wudaima new-size"></i>
                </template>
              </span>

              <template v-if="['dim', 'meas'].includes(node.key)">
                <span :class="[ns.be('tree-node', 'title'), ns.be('tree-node', 'top')]">
                  {{ node.title }}
                  <span class="ml-4px color-[#777777]">{{ node.children?.length }}</span>
                </span>
              </template>
              <template v-else>
                <a-tooltip placement="left" color="#ffffff">
                  <template #title>
                    <DatavFieldTooltip :data="node" />
                  </template>
                  <span :class="[ns.be('tree-node', 'title')]">{{ node.title }}</span>
                </a-tooltip>

                <div :class="[ns.be('tree-node', 'actions')]">
                  <div :class="[ns.be('tree-node', 'action-config')]">
                    <DatavFieldContextMenu
                      :data="node"
                      :datasetId="props.datasetId"
                      :onMenu-click="onMenuClick"
                    />
                  </div>
                </div>
              </template>
            </div>
          </template>
        </TreeEx>
      </div>
    </div>
    <div :class="ns.e('right')">
      <template v-if="!open">
        <a-table
          :dataSource="tableData"
          :columns="columns"
          bordered
          ref="tableRef"
          class="gct-edhr-table h-full"
          size="middle"
          :pagination="false"
          @change="handleTableChange"
          :scroll="{ x: 'max-content', y: scrollHeight - 12 }"
        >
          <template #headerCell="{ column }">
            <template v-if="column.key == 'dim'">
              <div style="text-align: left" class="ml-8px dim-head">
                <span class="icon iconfont icon-weidu mr-4px"></span>
                {{ column.title }}
              </div>
            </template>
            <template v-else-if="column.key == 'meas'">
              <div style="text-align: left" class="ml-8px meas-head">
                <span class="icon iconfont icon-duliang mr-4px"></span>
                {{ column.title }}
              </div>
            </template>
            <template v-else>
              <div>{{ column.title }}</div>
              <span
                v-if="column.fieldType"
                :class="['field-icon', column.fieldType.split('_')[0], 'mr-4px']"
                style="width: 100%"
              >
                <template v-if="column.fieldType.split('_')[1] == 'text'">Str.</template>
                <template v-else-if="column.fieldType.split('_')[1] == 'number'">No.</template>
                <template v-else-if="column.fieldType.split('_')[1] == 'date'">
                  <calendar-outlined class="new-size" />
                </template>
                <template v-else-if="column.fieldType.split('_')[1] == 'img'">
                  <i class="icon iconfont icon-tupian_wudaima new-size"></i>
                </template>
              </span>
            </template>
          </template>
          <template #bodyCell="{ column, text }">
            <span :title="text">{{ text }}</span>
          </template>
        </a-table>
      </template>

      <div class="h-full overflow-auto" v-else>
        <a-result
          status="error"
          :title="$t('sys.bi.runFailed')"
          :sub-title="$t('sys.bi.runFailedTip')"
        >
          <template #extra>
            <div class="w-full flex justify-between items-center">
              <span>{{ $t('sys.bi.errorDetail') }}</span>
              <span class="copy cursor-pointer" @click="handleCopy">{{
                $t('sys.bi.copyDetail')
              }}</span>
            </div>
          </template>
          <div class="desc">
            <p style="font-size: 16px">
              <strong>The content you submitted has the following error:</strong>
              {{ wrongInfo }}
            </p>
          </div>
        </a-result>
      </div>
    </div>
    <auto-sort-modal @register="register" @ok="handleOk" />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, reactive, onMounted } from 'vue';
  import { useNamespace, useAntTableScrollHeight, IModalData } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { TreeEx, TreeExInstance } from '/@/components/TreeEx';
  import { message } from 'ant-design-vue';
  import type { TablePaginationConfig } from 'ant-design-vue';
  import { DatavFieldTooltip } from './datav-field-tooltip/datav-field-tooltip';
  import { DatavFieldContextMenu } from './datav-field-context-menu/datav-field-context-menu';
  import { DatavChangeName } from '../modal/change-name/datav-change-name';
  import { DatavEmptyModal } from '../modal/empty-modal/datav-empty-modal';
  import AutoSortModal from '../modal/auto-sort-modal.vue';
  import { MENU_ACTION, emptyValueEnum, fieldTypeEnum, sortTypeEnum } from '../interface/type';
  import { useModal } from '/@/components/Modal';
  import { cloneDeep } from 'lodash-es';
  import { uuid2 } from '/@/utils/uuid';
  import useExpression, { ExpressionModeEnum, ExpressionTabEnum } from '/@/components/Expression';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { DataSourceType } from '/@bi-designer/enum/database';

  const ns = useNamespace('datav-upload-table');
  const { t } = useI18n();
  const [register, { openModal, closeModal }] = useModal();
  const { openModal: openExpressModal } = useExpression(false);

  const props = defineProps<{
    dataSource: any;
    configData: any;
    fileUrl: string;
    scrollHeight: any;
    datasetId: string;
    open: boolean;
    wrongInfo?: string;
    databaseType?: DataSourceType;
  }>();

  const emit = defineEmits(['updateData', 'addFormulaField', 'editFormulaField']);

  const tableRef = ref();
  // const { scrollHeight } = useAntTableScrollHeight(tableRef, {
  //   pagination: false,
  // });

  const treeDatahead = ref([
    { title: '维度', key: 'dim', resizable: false, children: [] },
    { title: '度量', key: 'meas', resizable: false, children: [] },
  ]);

  const selectedKeys = ref<any>([]);
  const searchKey = ref();
  const treeExRef = ref<TreeExInstance>();
  const highlightId = ref<string>('');
  const sortMap = ref(new Map());

  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  //第一次上传数据时不可以新建公式字段
  const canAddFormulaField = computed(
    () =>
      !(
        (props.databaseType == DataSourceType.FILE || props.databaseType == DataSourceType.API) &&
        !props.datasetId
      ),
  );

  onMounted(() => {
    if (props.configData?.length) {
      props.configData?.forEach((item) => {
        if (item.customSortArr?.length) {
          const customSortArr = item.customSortArr?.map((i) => ({
            id: uuid2(16, 16),
            [item.fieldName]: i,
          }));
          sortMap.value.set(item.key, customSortArr);
        }
      });
    }
  });

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
  };

  const columns = computed(() => {
    return props.configData.length
      ? treeDatahead.value
          .map((item) => {
            const list: any =
              props.configData
                ?.filter((i) => i.type === item.key)
                .map((v) => {
                  return {
                    title: v.colName?.split('.')?.at(-1),
                    dataIndex: v.colName?.split('.')?.at(-1),
                    key: v.key,
                    fieldType: v.fieldType,
                    resizable: false,
                    width: 130,
                  };
                }) || [];
            return { ...item, children: list };
          })
          .filter((i) => i.children.length)
      : treeDatahead.value;
  });

  const tableData = computed(() => {
    const list = props.dataSource?.map((item, ind) => {
      let obj = { key: ind };
      props.configData?.map((i, index) => {
        let colName = item[i.fieldName?.split('.')?.at(-1)] ?? item[index];
        obj[i.colName] = colName;
        if (i.emptyValue && (colName === undefined || colName === null || colName === '')) {
          obj[i.colName] = i.emptyStr || '';
        }
      });
      return obj;
    });
    return list;
  });

  const treeData = computed(() => {
    return props.configData.length
      ? treeDatahead.value.map((item) => {
          const list: any =
            props.configData
              ?.map((v) => ({ ...v, title: v.colName || v.alias || v.fieldName }))
              .filter((i) => i.type === item.key) || [];
          item.children = list;
          return item;
        })
      : [];
  });

  /**
   * 节点选中事件
   */
  const handleSelect = (sKeys, { node }) => {
    // 不可取消选中
    if (sKeys.length === 0) return;
    // 文件夹不可选中
    if (node.dataRef?.children?.length) return;
    // if (!selfExpandedKeys.value.includes(node.categoryId)) {
    //   selfExpandedKeys.value.push(node.categoryId);
    // }
    // emit('changeValue', node.dataRef);
  };

  const getFieldIdentifiers = () => {
    return (props.configData ?? [])
      .filter((item) => !item.fieldSql)
      .map((item) => {
        return {
          id: item.fieldName,
          name: item.colName || item.fieldName,
          valueType: item.fieldType.includes('_number') ? FIELD_TYPE.INTEGER : FIELD_TYPE.TEXT,
        };
      });
  };

  const onMenuClick = async (action, data) => {
    // console.log('onMenuClick', action, data, props.configData, props.dataSource);
    if (action.name === MENU_ACTION.CHANGE_NAME) {
      const treeList = cloneDeep(props.configData);
      const res = await gct.openUtil.modal<IModalData>(
        DatavChangeName,
        { data: data, list: treeList },
        { title: '重命名', width: '640px', height: '282px' },
      );
      if (res.ok && res.data) {
        const resData = res.data[0];
        const configData = props.configData.map((i) => {
          let config = {};
          if (i.fieldName == resData.fieldName) {
            config = resData;
          }
          const configItem = Object.assign(i, config);
          return configItem;
        });
        emit('updateData', { configData, dataSource: props.dataSource, url: props.fileUrl });
      }
    } else if (action.name === MENU_ACTION.DELETE) {
      const configData = props.configData.map((i) => {
        if (i.fieldName == data.fieldName) {
          i.deleted = true;
        }
        return i;
      });
      emit('delData', {
        data,
      });
      emit('updateData', {
        configData,
        dataSource: props.dataSource,
        url: props.fileUrl,
      });
    } else if (action.name === MENU_ACTION.EDIT) {
      openExpressModal({
        expr: data.formula,
        exprName: data.colName,
        mode: ExpressionModeEnum.BI_FORMULA,
        identifiers: {
          [ExpressionTabEnum.FIELD]: getFieldIdentifiers(),
        },
        callback: async (...payload) => {
          const expr = payload[0];
          const name = payload[2]?.exprName;
          emit('editFormulaField', {
            expr,
            name,
            fieldName: data.fieldName,
          });
        },
      });
    } else {
      let emptyStr = '';
      if (action.emptyValue == emptyValueEnum.E) {
        const res = await gct.openUtil.modal<IModalData>(
          DatavEmptyModal,
          { data: { emptyStr: '' } },
          { title: '自定义空值样式', width: '640px', height: '222px' },
        );
        if (res.ok && res.data) {
          emptyStr = res.data[0]?.emptyStr;
        }
      }
      let hasSort = false;
      const configData = props.configData.map((i) => {
        let configItem = i;
        if (i.key == data.key) {
          if (action.emptyValue && Object.values(emptyValueEnum).includes(action.emptyValue!)) {
            action['emptyStr'] = handleColEmpty(action.emptyValue, emptyStr);
          }
          if (action.fieldType && Object.values(fieldTypeEnum).includes(action.fieldType!)) {
            const types = action.fieldType.split('_');
            action['type'] = types[0] || i.type;
          }
          if (action.sortType && Object.values(sortTypeEnum).includes(action.sortType!)) {
            action['customSortArr'] = undefined;
            hasSort = [sortTypeEnum.ASC, sortTypeEnum.DESC, sortTypeEnum.NO].includes(
              action.sortType!,
            );
            if (action.sortType == sortTypeEnum.CUSTOM) {
              openModal(true, {
                column: data.fieldName,
                datasetId: props.datasetId,
                key: data.key,
                sortMap: sortMap.value,
              });
            }
          }
          configItem = Object.assign(configItem, action);
        }
        return configItem;
      });
      emit('updateData', { configData, dataSource: props.dataSource, url: props.fileUrl, hasSort });
    }
  };

  const handleOk = (data) => {
    sortMap.value.set(data.key, data.items);
    const configData = props.configData.map((i) => {
      let configItem = i;
      configItem['customSortArr'] = undefined;
      if (i.key == data.key) {
        configItem = Object.assign(configItem, {
          customSortArr: data.items?.map((v) => v[i.fieldName]),
        });
      }
      return configItem;
    });
    emit('updateData', {
      configData,
      dataSource: props.dataSource,
      url: props.fileUrl,
      hasSort: true,
    });
    // console.log('updateData', props.configData);
    closeModal();
    message.success(t('sys.doSuccess'));
  };

  const handleColEmpty = (emptyValue, emptyName) => {
    switch (emptyValue) {
      case emptyValueEnum.A:
        emptyName = '--';
        break;
      case emptyValueEnum.B:
        emptyName = 'null';
        break;
      case emptyValueEnum.C:
        emptyName = 'N/A';
        break;
      case emptyValueEnum.D:
        emptyName = '';
        break;
      default:
        return emptyName;
    }
    return emptyName;
  };

  const handleAddFormulaField = async () => {
    openExpressModal({
      expr: '',
      exprName: '',
      mode: ExpressionModeEnum.BI_FORMULA,
      identifiers: {
        [ExpressionTabEnum.FIELD]: getFieldIdentifiers(),
      },
      callback: async (...payload) => {
        const expr = payload[0];
        const name = payload[2]?.exprName;
        emit('addFormulaField', {
          expr,
          name,
        });
      },
    });
  };
</script>

<style lang="scss" scoped>
  @include b(datav-upload-table) {
    height: 100%;
    display: flex;

    @include e(left) {
      width: 250px;
      height: 100%;
      border-right: 1px solid #e0e3ea;
      padding: 16px;
    }

    @include e(right) {
      padding: 16px 6px 16px 16px;
      flex: 1;
      width: calc(100% - 250px);
      height: 100%;
    }

    @include e('search-container') {
      padding: 8px 0 8px;
    }

    @include e('search-container-tree-box') {
      width: 100%;
      height: calc(100% - 70px);
      overflow-y: auto;
    }
  }

  :deep(.ant-tree .ant-tree-treenode) {
    padding-bottom: 0;
    .ant-tree-indent {
      .ant-tree-indent-unit {
        width: 0;
      }
    }
    .ant-tree-switcher {
      line-height: 32px;
    }
  }
  :deep(.ant-tree .ant-tree-node-content-wrapper) {
    border-radius: 4px;
    height: 32px;
    line-height: 32px;
    width: calc(100% - 32px);
    &.ant-tree-node-selected {
      background-color: transparent;
      &:hover {
        background-color: #f5f5f5;
      }
    }
    &:has(.gct-upload-table-tree-node__top) {
      &:hover {
        background-color: transparent;
      }
    }
  }

  @include b(datav-upload-table-tree-node) {
    display: flex;
    position: relative;
    align-items: center;
    flex: 0 0 auto;
    padding-right: 4px;
    &:hover {
      .#{bem(datav-upload-table-tree-node, actions)} {
        visibility: visible;
      }
    }
    @include e(title) {
      display: inline-block;
      margin-right: 5px;
      flex-grow: 1;
      text-wrap: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    @include e(actions) {
      visibility: hidden;
      align-items: center;
      // width: 34px;
      flex-shrink: 0;
      transform: translateY(2px);
    }
  }

  .field-icon {
    display: inline-block;
    width: 20px;
    font-size: 14px;
    &.dim {
      color: var(--ant-primary-color);
    }
    &.meas {
      color: var(--ant-success-color);
    }
    .new-size {
      font-size: 16px;
    }
  }

  :deep(.ant-table .ant-table-header) {
    .ant-table-thead {
      tr:first-child {
        th {
          color: #fff;
          padding: 5px;
          &:has(div.dim-head) {
            background: var(--ant-primary-color);
          }
          &:has(div.meas-head) {
            background: var(--ant-success-color);
          }
          // &:first-child {
          //   background: var(--ant-primary-color);
          // }
          // &:nth-child(2) {
          //   background: var(--ant-success-color);
          // }
          &.ant-table-cell-scrollbar {
            background: transparent;
          }
        }
      }
    }
  }

  :deep(.ant-table-body) {
    border-right: 1px solid #f0f0f0;
    border-bottom: 1px solid #f0f0f0;
  }
</style>
