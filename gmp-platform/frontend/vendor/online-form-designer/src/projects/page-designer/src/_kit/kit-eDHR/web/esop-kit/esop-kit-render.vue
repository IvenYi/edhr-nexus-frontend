<template>
  <EsopPreview ref="esopPreview" :sopList="sopList" />
</template>

<script setup lang="ts" name="gct-esop-kit-render">
  import { computed, toRefs, ref, toRef } from 'vue';
  import { watchDebounced } from '@vueuse/core';
  import { getQuerySort } from '/@page-designer/components/widgets/hooks/listhook';
  import { formMap } from '/@web-render/render/Event/utils/runGlobalByPage';
  import { postBizServiceByModelKeyByBsKey } from '/@/apis/gct-apaas/BsServiceController';
  import { ISopDocument } from './type';
  import { type IESopKit } from './schema';
  import EsopPreview from '/@online-form/components/esop/esop-preview.vue';
  import { getPageEvent } from '../../../../components/widgets/hooks/hooks';
  import { E_PRODUCT_MODALITY } from '../../../enums';

  const props = defineProps<{
    widget: IESopKit;
  }>();
  const {
    batchRefForm,
    modelKey,
    collation,
    refContainerField,
    refOperationField,
    businessType,
    productionType,
    customdataSource,
    datasourceConfig,
  } = toRefs(props.widget?.props);

  const esopPreview = ref();

  const Event = getPageEvent();

  /** 所有文件列表 */
  const sopList = ref<{ sopDocument: ISopDocument }[]>([]);

  const txnField = computed(() => {
    return productionType?.value === E_PRODUCT_MODALITY.CONTAINER ? 'container_id_' : 'sn_id_';
  });
  /**排序字段 */
  const querySort = getQuerySort({ collation: collation.value });
  const refFormData = toRef(() => {
    const data: any = {};
    /**
     * 查询字段
     * 注意：这里的字段名需要和后端接口保持一致
     * 后端固定使用container_id_/sn_id_, routing_operation_id_作为查询key
     */
    data[txnField.value] = formMap.value[batchRefForm?.value as string]?.[refContainerField.value];
    data['routing_operation_id_'] =
      formMap.value[batchRefForm?.value as string]?.[refOperationField.value];
    data['task_type_'] = businessType?.value;
    data['production_type_'] = productionType?.value;
    return data;
  });

  const customApi =
    customdataSource?.value && datasourceConfig?.value?.name
      ? (queryData) =>
          Event.runExportByName(
            datasourceConfig?.value?.name,
            queryData,
            refFormData.value,
            datasourceConfig?.value?.extraParams,
          )
      : undefined;

  watchDebounced(
    () => refFormData.value,
    async () => {
      if (props.widget?.props?.noNeedAutoQuery) return;
      let needQueryFlag = true;

      //如果关联的值为空 则不用查询
      if (
        !refFormData.value[txnField.value] ||
        !refFormData.value['routing_operation_id_'] ||
        !refFormData.value['task_type_']
      ) {
        needQueryFlag = false;
      }

      if (needQueryFlag) {
        const sopData = (await getSopList()) || { data: [], dict: {} };
        sopList.value = sopData?.data?.filter((d) => d.sopDocument.file || d.sopDocument.url);
      } else {
        reset();
      }
    },
    {
      deep: true,
      debounce: 200,
    },
  );

  async function getSopList(queryParam = {}) {
    const param = Object.assign(
      {
        ...refFormData.value,
      },
      queryParam,
    );

    try {
      if (customApi) {
        return await customApi(param);
      }
      // 当搜索条件【事务主体id: snId/containerId】为空时，不请求数据
      if (!param?.[txnField.value]) return;

      return (await postBizServiceByModelKeyByBsKey(
        { bsKey: 'biz_get_sop', modelKey: modelKey.value },
        {
          ...param,
          sorts: [...querySort],
        },
      )) as any;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  function reset() {
    sopList.value = [];
    esopPreview.value?.reset();
  }

  defineExpose({
    async reload(queryParam) {
      reset();
      const sopData = (await getSopList(queryParam)) || { data: [], dict: {} };
      sopList.value = sopData?.data?.filter((d) => d.sopDocument.file || d.sopDocument.url);
    },
    reset,
    getValue() {
      return sopList.value;
    },
  });
</script>

<style scoped lang="less">
  .esop-kit-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    .esop-kit-container {
      width: 100%;
      height: 100%;
      display: flex;

      .esop-kit-left {
        width: 130px;
        height: 100%;
        border-right: 1px solid #e8ecf0;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;

        &--open {
          cursor: pointer;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 14px;

          .icon-next {
            color: rgba(0, 0, 0, 0.8);
            margin-right: 4px;
          }
          &:hover {
            color: var(--ant-primary-color);
            .icon-next {
              color: var(--ant-primary-color);
            }
          }
        }

        .card-list {
          padding-left: 14px;
          padding-right: 14px;
          padding-top: 14px;

          &-item {
            display: flex;
            flex-direction: column;
            text-align: center;
            padding: 12px;
            margin-bottom: 12px;
            border: 1px solid #e8ebf0;
            border-radius: 4px;
            background: #fff;

            &-svg {
              margin: 8px auto 0;
            }

            &-name {
              cursor: pointer;
              width: 100%;
              height: 22px;
              line-height: 22px;
              margin: 8px auto 4px;

              span {
                display: inline-block;
                max-width: 100%;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                -webkit-line-clamp: 2; /* 这里是超出几行省略 */
              }
            }

            &.is-selected {
              background-color: rgb(2 106 200 / 10%);
              border: 1px solid var(--ant-primary-color);
            }

            &:hover {
              border: 1px solid var(--ant-primary-color);
              cursor: pointer;
            }
          }
        }
      }

      .esop-kit-right {
        position: relative;
        flex: 1;
        height: 100%;
        overflow: hidden;

        .esop-kit-content {
          height: 100%;
          overflow: auto;
          padding: 14px;
          padding-top: 0;
          background-color: #ffffff;
        }
      }
    }

    .esop-kit-empty-area {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #fff;
      height: 100%;
    }
  }

  .loading-box {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    pointer-events: none;
  }
</style>
