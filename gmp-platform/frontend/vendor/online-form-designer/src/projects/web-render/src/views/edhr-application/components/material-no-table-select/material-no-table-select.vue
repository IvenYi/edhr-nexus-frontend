<template>
  <div class="material-no-table-select">
    <lot-table-select
      :variant="'select'"
      :tableColumns="['lot2sn', 'mfgOrderId']"
      :custom-fetch="getAsyncOptions"
      :pageAttr="pageAttr"
      v-model:value="value"
      @update:value="updateValue"
    />
  </div>
</template>

<script setup lang="ts" name="material-no-table-select">
  import { computed } from 'vue';
  import { uniq } from 'lodash-es';
  import { transformUtils } from '@gct/nocode-base';
  import { getEdhrInstanceFindMaterialNo } from '/@/apis/gct-apaas/EdhrInstanceController';

  import LotTableSelect from '../lot-table-select/lot-table-select.vue';

  const props = withDefaults(
    defineProps<{
      value?: string;
      ignoreArchived: boolean;
      pageAttr?: any;
    }>(),
    {
      value: undefined,
      ignoreArchived: true,
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', val: string): void;
  }>();

  const value = computed<any>({
    get() {
      return props.value;
    },
    set(val: string) {
      emit('update:value', val);
    },
  });
  async function getAsyncOptions({ keyword = '', pageNo = 1, pageSize = 20 }) {
    const { data, dict, totalCount, totalPage } = (await getEdhrInstanceFindMaterialNo({
      materialNo: keyword,
      ignoreArchived: props.ignoreArchived,
      pageNo: pageNo,
      pageSize: pageSize,
    })) as any;

    const _data = data.map((e) => {
      return {
        ...e,
        material_no_: e.materialNo,
        mfg_order_id_: e.mfgOrderId,
        _info_: e,
      };
    });

    const _dict = {
      ...dict,
      mfg_order_id_: dict?.mfgOrderId,
    };
    const options = transformUtils.transformSourceData2SubTable(_data || [], _dict);

    return {
      options: options,
      finished: totalPage && totalPage <= pageNo,
      totalCount,
    };
  }

  /**
   * @description deprecated
   * @param data
   * @returns { mfg_order_id_: object }
   */
  function transformDict(data) {
    const dict = {
      mfg_order_id_: {},
    };

    const mfgOrderIds = uniq(data.map((e) => e.mfgOrderId).filter((f) => !!f)) as string[];
    mfgOrderIds.forEach((id: string) => {
      const mfgOrder = data.find((e) => e.mfgOrderId === id);
      dict['mfg_order_id_'][id] = mfgOrder?.mfgOrderCode ?? undefined;
    });

    return dict;
  }

  function updateValue(val) {
    value.value = val;
    emit('update:value', val);
  }
</script>
