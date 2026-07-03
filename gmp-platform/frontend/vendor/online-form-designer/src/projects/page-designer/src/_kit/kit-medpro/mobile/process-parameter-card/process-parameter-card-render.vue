<template>
  <div>
    <van-collapse
      v-model="activeNames"
      ref="collapseRef"
      class="process-parameter-card"
      v-for="item of tableData"
      :key="item.id"
    >
      <van-collapse-item :name="item.process_parameter_card_id_">
        <template #title>
          <div class="process-parameter-card-title">
            <span>
              {{ item?._DICT?.process_parameter_card_id_?.[item.process_parameter_card_id_][0] }}
            </span>
          </div>
        </template>
        <div class="process-parameter-card-content">
          <van-field
            v-for="data in getData(item)"
            :key="data.name_"
            :border="false"
            readonly
            :label="data.name_"
            inputAlign="right"
          >
            <template #input>
              <div>
                {{ data.value_ + '' + data.uom_ }}
              </div>
            </template>
          </van-field>
          <div
            v-if="
              parameterCollection[item.process_parameter_card_id_].processParameterCard.length >
              maxLength
            "
            class="show-more-btn"
            @click="
              parameterCollection[item.process_parameter_card_id_].showMore =
                !parameterCollection[item.process_parameter_card_id_].showMore
            "
          >
            {{ parameterCollection[item.process_parameter_card_id_].showMore ? '收起' : '展开' }}
            <van-icon
              name="arrow-down"
              class="text-[#A2A9B5] font-16px arrow"
              :class="{
                showMore: parameterCollection[item.process_parameter_card_id_].showMore,
              }"
            />
          </div>
        </div>
      </van-collapse-item>
    </van-collapse>
  </div>
</template>

<script setup lang="ts" name="gct-process-parameter-card">
  import { ref, toRef, toRefs, watch } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { formMap } from '/@web-render/render/Event/utils/runGlobalByPage';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  import { getQuerySort } from '/@page-designer/components/widgets/hooks/listhook';

  const Event = getPageEvent();

  const props = defineProps<{ modelValue: Array<any>; widget }>();
  const {
    deviceGroupForm,
    batchRefForm,
    refFormField,
    refSearchField,
    txnType,
    collation,
    defaultExpand,
    maxLength,
  } = toRefs(props.widget?.props);
  const tableData = ref<any[]>([]);
  const refFormData = toRef(() => {
    const data: any = {};
    refFormField.value?.forEach((i) => {
      data[i] = formMap.value[deviceGroupForm.value]?.[i];
    });
    refSearchField.value.forEach((i) => {
      data[i] = formMap.value[batchRefForm.value]?.[i];
    });
    return data;
  });
  /**排序字段 */
  const querySort = getQuerySort({ collation: collation.value });

  const activeNames = ref<any>([]);

  const parameterCollection = ref<any>({});

  const getDataSource = async (queryParam = {}) => {
    const param = Object.assign(
      {
        ...refFormData.value,
        txn_key_: txnType?.value,
      },
      queryParam,
    );
    const res = await Event.context.$customBizService.post(
      {
        // @ts-ignore
        action: 'biz_get_process_parameter_card',
        key: 'em_process_parameter_card',
      },
      {
        query: { ...param },
        sorts: [...querySort],
      },
    );
    return (
      transformSourceData(res.data, res.dict).map((d, index) => {
        return {
          index,
          ...d,
        };
      }) || []
    );
  };
  watch(
    () => refFormData.value,
    async () => {
      if (props.widget.props.noNeedAutoQuery) return;
      let needQueryFlag = true;
      refSearchField.value.forEach((i) => {
        //如果关联的值为空 则不用查询
        if (!formMap.value[batchRefForm.value]?.[i]) {
          needQueryFlag = false;
        }
      });
      if (needQueryFlag) {
        tableData.value = await getDataSource();
        tableData.value.forEach((item) => {
          parameterCollection.value[item.process_parameter_card_id_] = {};
          parameterCollection.value[item.process_parameter_card_id_].showMore = false;
          parameterCollection.value[item.process_parameter_card_id_].processParameterCard =
            item.processParameterCard;
          if (defaultExpand.value) {
            activeNames.value.push(item.process_parameter_card_id_);
          }
        });
      }
    },
    {
      deep: true,
      immediate: true,
    },
  );

  const getData = (item) => {
    return parameterCollection.value[item.process_parameter_card_id_].showMore
      ? parameterCollection.value[item.process_parameter_card_id_].processParameterCard
      : parameterCollection.value[item.process_parameter_card_id_].processParameterCard.slice(
          0,
          maxLength.value,
        );
  };
  defineExpose({
    async reload(queryParam) {
      tableData.value = await getDataSource(queryParam);
    },
    reset() {
      tableData.value = [];
    },
    getValue() {
      return {
        tableData: tableData.value,
        // parameterData: parameterData.value
      };
    }
  });
</script>

<style lang="less" scoped>
  .process-parameter-card {
    background-color: #fff;
    border-radius: 6px;
    margin: 8px 0;
    :deep(.van-collapse-item__title) {
      &::after {
        display: none;
      }
    }
    &-title {
      position: relative;

      span {
        font-weight: 600;
        font-size: 16px;
        color: #000000;
        padding-left: 14px;
      }

      &::before {
        content: ' ';
        display: inline-block;
        width: 3px;
        height: 14px;
        background: #026ac8;
        position: absolute;
        top: 5px;
      }
    }
    &-content {
      .van-cell {
        padding: 0 0 16px 0;
      }

      .show-more-btn {
        text-align: center;
        cursor: pointer;
        font-weight: 400;
        font-size: 14px;
        color: #026ac8;

        .arrow {
          transform: rotateX(0);
          color: #026ac8;

          &.showMore {
            transform: rotateX(-180deg);
          }
        }
      }
    }
  }
</style>
