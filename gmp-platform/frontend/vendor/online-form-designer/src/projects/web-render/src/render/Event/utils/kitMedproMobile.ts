import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { EntityModelCategoryEnum } from '/@/projects/app-designer/src/enum';

let modelingElectronicSignature: any = null;
/**
 * 自动执行事务
 * @param { txnType } 事务类型
 * @param { params } 数据主体
 * @param { callback } 执行后回调
 */
export async function executeTxn(signatureIns, txnType = '', params = {}, callback = () => {}) {
  modelingElectronicSignature = signatureIns;
  const res = await postExecute(txnType, params);
  callback?.(res);
}

/**
 * 执行接口 + 回调电子签名
 * @param txnType 事务类型
 * @param params formData
 * @param callback callback
 */
async function postExecute(txnType: string, params: object, closePop?: Function) {
  const signRes = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
    {
      modelCategory: EntityModelCategoryEnum.ENTITY,
      modelKey: txnType,
      bsKey: 'execute',
    },
    {
      ...params,
      _DICT: undefined,
      _OPCT: undefined,
      _NOSUBMIT: undefined,
    },
  );

  const { relation_id_, sec_relation_id_, sign_requirement_, sign_requirement_entry_ } =
    signRes || ({} as any);
  const relationId = relation_id_ || sec_relation_id_;
  const relationKey = sec_relation_id_ ? 'sec_relation_id_' : 'relation_id_';

  // 回调电子签名
  if (relationId) {
    closePop && closePop();
    await openModelingElectronicSignature(txnType, params, {
      relationKey,
      relationId,
      signRequirementId: sign_requirement_?.id_,
      configs: sign_requirement_entry_,
      type: sign_requirement_?.sign_method_,
    });
  }
  return signRes;
}

async function openModelingElectronicSignature(txnType, paramsData, signConfig) {
  return new Promise<void>((res, rej) => {
    const vm = modelingElectronicSignature({
      async successCallback({ relationId, signRequirementId, ...otherParams }) {
        const relationKey: string = otherParams?.relationKey || 'relation_id_';
        const executeData = {
          ...paramsData,
          [relationKey]: relationId,
          sign_requirement_id_: signRequirementId,
        };
        await vm?.validateForm();
        postExecute(txnType, executeData, vm.close).then(async () => {
          await vm.close();
          res();
        }, rej);
      },
      cancel() {
        rej();
      },
    });
    vm.open(signConfig);
  });
}
