<template>
  <div class="databox ks-row">
    <tabs
      class="flex-shrink-0"
      :appId="appId"
      :suiteKey="defProps.suiteKey"
      v-model:selectKey="selectKey"
      @addBarKeys="adddDataByKeys"
      :checkedModal="checkedModal"
    />
    <div class="ks-col w0px">
      <div v-if="SysPage" class="ks-column h100%">
        <navbar
          :barOptions="barOptions"
          v-model:selectKey="selectKey"
          @deleteBarKeys="deleteBarKeys"
        />
        <div class="p20px ks-col" v-if="SysPage">
          <!-- {{ SysPage }} -->
          <dSearch
            ref="searchRef"
            @search="search"
            :key="selectKey"
            :SysPage="SysPage"
            :configByHeaders="configByHeaders"
            @changeExpand="changeExpand"
          />
          <div class="pt8px pb8px">
            <a-checkbox
              v-model:checked="SysPage.checked"
              :indeterminate="SysPage.indeterminate && SysPage.checked"
              @change="changeBox"
              >{{$t('sys.platform.selectAll')}}</a-checkbox
            >
            <span v-if="selectedRows">
              {{ $t('sys.batchOperation.selected')}} 
              <a class="cursor-default">{{ selectedRows }}</a> 
              {{$t('sys.batchOperation.lines')}}
            </span>
          </div>
          <div :style="{ height: `calc(100vh - 200px)` }" class="position-relative">
            <dTable
              :configByHeaders="configByHeaders"
              ref="refTable"
              :SysPage="SysPage"
              :key="selectKey"
              :formRefHeight="formRefHeight"
              :appId="appId"
              @countSum="countSum"
              v-if="SysPage"
            />
          </div>
        </div>
      </div>
      <div class="text-center pt200px" v-else>
        <img src="/@/assets/images/empty.png" width="200" />
        <div class="text-[#8f8f8f] lh-0">{{$t('sys.platform.pleaseSelectModuleModel')}}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, inject, computed, nextTick, watch } from 'vue';
  import navbar from './nav-bar.vue';
  import tabs from './tabs.vue';
  import dTable from './d-table.vue';
  import { CheckedData, DataTabEnum, SysPageEnum } from '../../const';
  import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';
  import dSearch from './query/index.vue';
  import fieldFilter from './query/component/field_filter_button.vue';

  const defProps = defineProps<{
    appId: string;
    suiteKey?: string;
  }>();
  const sourceEnv = inject('sourceEnv') as any;
  const branchId = inject('branchId') as any;
  const configByHeaders = {
    transferToConfig: {
      headers: {
        'App-Tag': defProps.appId,
        Env: sourceEnv.sourceEnv,
        'Branch-Id': sourceEnv.sourceEnv === 'dev' ? branchId.value : '',
        'Is-Preview': 'true',
      },
    },
  };
  const refTable = ref();
  const searchRef = ref();
  /**当前选中的模块 */
  const selectKey = ref();

  const selectedRows = ref(0);

  const tableTotal = ref(0);
  const barKeys = ref<string[]>([]);
  /**已经被选中的模块的数据源 */
  const checkedDataMap = ref<{ [key: string]: CheckedData }>({});

  const expandChange = ref(false);
  const formRefHeight = ref(40);
  const SysPage = computed(() => checkedDataMap.value[selectKey.value]);

  /**快捷导航数据 */
  const barOptions = computed(() => {
    return barKeys.value.map((i) => checkedDataMap.value[i]).filter((i) => i);
  });

  async function adddDataByKeys(
    isChecked: boolean,
    type: DataTabEnum,
    data: any[],
    operateType: string,
  ) {
    data.forEach(async (i) => {
      const item = checkedDataMap.value[i.id];
      if (!item) {
        checkedDataMap.value[i.id] = await createRendererData(type, i);
      }

      checkedDataMap.value[i.id].checkedNode(isChecked);
      /**维护导航 */
      if (!(operateType === 'checked' && !isChecked)) {
        barKeys.value.includes(i.id) || barKeys.value.push(i.id);
      }

      if (i.id === selectKey.value) {
        await nextTick();
        refTable.value.checkedAll(isChecked);
        // 计算已选中行数
        selectedRows.value = isChecked ? tableTotal.value : 0;
      }
    });
  }

  function deleteBarKeys(key) {
    let index = barKeys.value.findIndex((i) => i === key);
    barKeys.value.splice(index, 1);
    if (selectKey.value === key) {
      selectKey.value = barKeys.value.at(-1);
    }
  }

  const changeExpand = (flag) => {
    expandChange.value = flag;
  };

  watch(
    () => expandChange.value,
    () => {
      setTimeout(() => {
        formRefHeight.value = searchRef.value?.$el.offsetHeight ?? 0;
      });
    },
  );
  /** 计算总选中条数 */
  const countSum = (total) => {
    tableTotal.value = total;
    selectedRows.value = !SysPage.value.in
      ? total - SysPage.value.moveDataIds.length + SysPage.value.rdoDataIds.length
      : SysPage.value.moveDataIds.length - SysPage.value.rdoDataIds.length;
  };

  const modelTypeMap = {
    RDO: SysPageEnum.rdo_model,
    NDO: SysPageEnum.ndo_model,
    WORKFLOW: SysPageEnum.rdo_model,
  };
  /**创建选中的数据源 */
  async function createRendererData(type, data) {
    const params = {
      title: data.name,
      key: data.id,
      type,
      name: data.id,
      fieldMetaList: [],
      modelKey: '',
      modelName: '',
    };
    if (type === DataTabEnum.APP_MODULAR) {
      const { type, fieldMetaList, key, name } = await getModelMetaDetail(
        { modelKey: data.id },
        configByHeaders,
      );
      params.name = modelTypeMap[type] || SysPageEnum.basic_model;
      params.fieldMetaList = fieldMetaList;
      params.modelKey = key;
      params.modelName = name;
    }
    return new CheckedData(params);
  }
  function changeBox(e) {
    refTable.value.checkedAll(e.target.checked);
    SysPage.value.in = !e.target.checked;
    SysPage.value.indeterminate = false;
    SysPage.value.moveDataIds = [];
    SysPage.value.rdoDataIds = [];
    // 计算已选中行数
    selectedRows.value = SysPage.value.in ? 0 : tableTotal.value;
  }
  function search(arg) {
    refTable.value.reload(arg);
  }
  const checkedModal = computed(() => Object.values(checkedDataMap.value).filter((i) => i.checked));
  defineExpose({
    getSelectData() {
      return checkedModal.value.map((i) => {
        return {
          in: i.in,
          moveDataIds: i.moveDataIds,
          name: i.name === SysPageEnum.ndo_model ? SysPageEnum.basic_model : i.name,
          type: i.type,
          modelKey: i.modelKey,
          modelName: i.modelName,
        };
      });
    },
  });
</script>
<style scoped lang="less">
  .databox {
    height: 100%;
    border: 1px solid #e0e3ea;
    border-radius: 4px;
    background-color: #fff;
  }
</style>
