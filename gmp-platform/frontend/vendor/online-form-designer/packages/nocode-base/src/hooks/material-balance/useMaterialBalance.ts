import { getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { NocodeAdapter } from '../../adapter/adapter';

export function useMaterialBalance() {
  async function getConsumeData({ cloneRuntimeJson, operationId, materialNo }) {
    const balanceTables: any[] = cloneRuntimeJson?.paper?.props?.materialBalanceTableList;
    if (!balanceTables?.length || !materialNo || !operationId) return {};
    const res: any = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: 'entity',
        bsKey: 'get_material_consume_group_product',
        modelKey: 'em_material_consume',
      },
      {
        routing_operation_id_: operationId,
        material_no_: materialNo,
      },
    );
    return balanceTables.reduce((obj, e) => {
      obj[e.masterSubField] = res?.data.map((e) => {
        const productDict = res?.dict?.product_id_ || {};
        return {
          ...e,
          product_id_label: productDict[e.product_id_],
        };
      });
      return obj;
    }, {});
  }

  function openConsumeModal(data) {
    NocodeAdapter.mbRender?.openConsumeModal(data);
  }

  function destoryConsumeModal() {
    NocodeAdapter.mbRender?.destoryConsumeModal();
  }

  return {
    getConsumeData,
    openConsumeModal,
    destoryConsumeModal,
  };
}
