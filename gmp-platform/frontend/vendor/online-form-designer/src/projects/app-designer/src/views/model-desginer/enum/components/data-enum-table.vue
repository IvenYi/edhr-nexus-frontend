<template>
  <BasicTable
    ref="tableRef"
    :striped="false"
    :bordered="true"
    :showIndexColumn="false"
    :ellipsis="true"
    row-key="id"
    :columns="tableColumns"
    :dataSource="filterTableData"
    :pagination="false"
    row-draggable
    class="model-designer-basic-table"
    :row-drag-api="enumModelFieldDrag"
    @row-drag-end="
      () => {
        createMessage.success(t('sys.operationSuccess'));
        getTableData();
      }
    "
  >
    <template #headerTop>
      <a-row justify="space-between" type="flex">
        <a-col style="display: flex">
          <a-input
            v-model:value="searchKey"
            :placeholder="t('sys.searchEnumKey')"
            alowClear
            @pressEnter="handleSearch"
          >
            <template #prefix>
              <!-- <search-outlined /> -->
              <i class="iconfont icon-sousuo1"></i>
            </template>
          </a-input>
          <a-button type="primary" @click="handleAddEnum" style="margin-left: 20px">
            <template #icon><plus-outlined /></template>
            {{ t('sys.new') }}
          </a-button>
        </a-col>
        <a-col :span="10">
          <span class="table-header-top">
            {{ t('sys.pageDesigner.icon') }}：
            <a-switch v-model:checked="iconState" @change="handleIconConfigChange" />
          </span>
          <span class="table-header-top">
            {{ t('sys.appDesigner.textColor') }}：
            <a-switch v-model:checked="textState" @change="handleColorConfigChange" />
          </span>
        </a-col>
      </a-row>
    </template>
    <template #bodyCell="{ column, index, record }">
      <template v-if="column.key === 'index'">
        <span>{{ index + 1 }}</span>
      </template>
      <template v-if="column.key === 'icon'">
        <IconNext
          :size="22"
          :value="record.icon"
          :color="record.iconColor"
          style="vertical-align: middle"
        />
      </template>
      <template v-if="column.key === 'textColor'">
        <div class="textColorDiv" :style="`background-color:${record.textColor}`"></div>
        {{ record.textColor }}
      </template>
      <template v-if="column.key === 'action'">
        <table-action-auto
          :actions="[
            {
              label: t('sys.edit'),
              onClick: handleEnumEdit.bind(null, record),
            },
            {
              label: t('sys.delete'),
              color: 'error',
              placement: 'topRight',
              popConfirm: {
                title: t('sys.sureToDelete'),
                confirm: handleEnumDelete.bind(null, record.id),
              },
            },
          ]"
          :stopButtonPropagation="true"
        />
      </template>
    </template>
  </BasicTable>
  <enum-modal-field
    @register="register"
    :id="id"
    :show-color="textState"
    :show-icon="iconState"
    @refresh="onRefresh"
  />
</template>

<script lang="ts" setup>
  import { ref, watch, computed } from 'vue';
  import { SearchOutlined, PlusOutlined } from '@ant-design/icons-vue';

  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import EnumModalField from '../modal/enum-modal-field.vue';
  import { dataEnumColumns, ConfigColumns } from '../constants/enum-columns';

  import { useModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { IconNext } from '/@/components/Icon';

  import { useTheme } from '/@/hooks/web/useTheme';

  import {
    deleteEnumModelField,
    getEnumModelFieldPageList,
    postEnumModelFieldDrag,
    postEnumModelFieldSort,
  } from '/@/apis/gct-apaas/EnumModelFieldController';
  import { EnumModelFieldResponse, EnumModelResponse } from '/@/apis/gct-apaas/model';
  import {
    putEnumModelUpdateTextStateById,
    putEnumModelUpdateIconStateById,
  } from '/@/apis/gct-apaas/EnumModelController';

  const props = defineProps<{
    id: string;
    model: EnumModelResponse;
  }>();

  const { themeVars } = useTheme();

  const { t } = useI18n();
  const [register, { openModal }] = useModal();
  const { createMessage } = useMessage();

  const searchKey = ref('');
  const tableData = ref<EnumModelFieldResponse[]>([]);
  const filterTableData = ref<Array<EnumModelFieldResponse>>([]);

  const textState = ref(false);
  const iconState = ref(false);
  const tableRef = ref();
  // 获取枚举字段列表
  const getTableData = async () => {
    const res = await getEnumModelFieldPageList({
      enumModelId: props.id,
      enumModelKey: props.model.key,
      searchKey: searchKey.value ? searchKey.value : undefined,
    });
    tableData.value = res!.data;
    filterTableData.value = res!.data;

  };
  const handleSearch = (e)=>{
    filterTableData.value = tableData.value.filter((ele) => ele.value.toLowerCase().includes(searchKey.value.toLowerCase())||ele.text.toLowerCase().includes(searchKey.value.toLowerCase()));
   }
  watch(
    () => props.model.key,
    () => {
      textState.value = Boolean(props.model.textState);
      iconState.value = Boolean(props.model.iconState);
      getTableData();
    },
  );

  watch(
    () => searchKey.value,
    (val) => {
      if (!val) {
        getTableData();
      }
    },
  );

  const tableColumns = computed(() => {
    let data = Object.assign([], dataEnumColumns);
    if (textState?.value) {
      data.push(ConfigColumns.color);
    } else {
      data = data.filter((e) => e !== ConfigColumns.color);
    }
    if (iconState?.value) {
      data.push(ConfigColumns.icon);
    } else {
      data = data.filter((e) => e !== ConfigColumns.icon);
    }
    return data;
  });

  // 添加枚举模型
  const handleAddEnum = () => {
    openModal(true, {
      isEdit: false,
      textColor: '#000000',
      icon: 'icon-park:all-application',
      iconColor: themeVars.primaryColor,
      enumModelKey: props.model.key,
    });
  };

  const onRefresh = () => {
    getTableData();
  };

  // 编辑枚举模型
  const handleEnumEdit = (record) => {
    const data = record;
    data.isEdit = true;
    openModal(true, data);
  };

  // 删除枚举模型
  const handleEnumDelete = async (id: string) => {
    await deleteEnumModelField(
      { ids: id },
      {
        joinParamsToUrl: true,
      },
    );
    createMessage.success(t('sys.delSuccess'));
    getTableData();
  };

  const handleColorConfigChange = async () => {
    await putEnumModelUpdateTextStateById(
      {
        id: props.id,
      },
      {
        textState: Number(textState?.value),
      },
    );
    createMessage.success(
      textState?.value ? t('sys.tipEnabledSuccess') : t('sys.tipDisabledSuccess'),
    );
  };
  const handleIconConfigChange = async () => {
    await putEnumModelUpdateIconStateById(
      {
        id: props.id,
      },
      {
        iconState: Number(iconState?.value),
      },
    );
    createMessage.success(
      iconState?.value ? t('sys.tipEnabledSuccess') : t('sys.tipDisabledSuccess'),
    );
  };

  const enumModelFieldDrag = async (e) => {
    await postEnumModelFieldSort({
      enumModelId: props.id,
      ids: e.sortList,
    });
  };

  defineExpose({
    redoHeight() {
      tableRef.value && tableRef.value.redoHeight();
    },
  });
</script>

<style lang="less" scoped>
  .table-header-top {
    margin-right: 20px;
    float: right;
  }

  .textColorDiv {
    display: inline-block;
    width: 22px;
    height: 22px;
    margin: 0 auto;
    border-radius: 2px;
    vertical-align: top;
  }
</style>
