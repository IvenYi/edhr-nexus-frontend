import { message as Message } from 'ant-design-vue';
import { debounce } from 'lodash-es';
import { EntityModelCategoryEnum } from '@gct/runtime';
import { defHttp } from '@/utils/http/axios';
import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { useBusinessSetting } from '/@web-render/views/system-config/hooks/useBusinessSetting';
/**
 * 获取EDHR的业务配置信息
 *
 * @export
 * @return {*}
 */
export function getEdhrSetting() {
  const { businessSetting } = useBusinessSetting();
  return businessSetting;
}

/**
 * 通用的非平台post接口调用方法
 * @param fullPath {string} 接口地址
 * @param data {object} 请求体
 * @param params {object} 查询参数
 * @param config {object} 其他axios配置项，详见defHttp.post的第二个参数
 * @returns
 */
export async function customRequest(fullPath, data, params, config?) {
  return defHttp.post(
    {
      url: fullPath,
      data,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改模型 状态-operating_state 字段
 * @param payload.modelKey {string} 模型key
 * @param payload.operatingState {boolean} 目标状态
 * @param payload.id {string} 记录id
 * @param payload.multiple {boolean} 是否批量操作
 * @param payload.ids {string[]} 记录id列表（仅在批量操作时使用）
 * @param callback {Function}
 */
async function _changeModelOperatingState(
  payload: {
    modelKey: string;
    operatingState: boolean;
    id: string;
    /**
     * 兼容后续批量修改操作
     */
    multiple?: boolean;
    ids?: string[];
  },
  callback?: () => void,
) {
  const { operatingState, multiple } = payload;
  try {
    await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: EntityModelCategoryEnum.ENTITY,
        modelKey: 'em_edhr_summary_approve_his',
        bsKey: 'operating_state',
      },
      {
        ...payload,
        id: !multiple ? payload.id : undefined,
        ids: multiple ? payload.ids : undefined,
      },
      {} as any,
      {
        errorMessageMode: 'none',
      },
    );

    callback && (await callback());

    Message.success(
      $t('sys.edhr.successOfSth', {
        sth: operatingState
          ? $t('sys.appDesigner.fieldEnable')
          : $t('sys.appDesigner.fieldUnEnable'),
      }),
    );
  } catch (error) {
    console.error(error);
    Message.error(
      $t('sys.edhr.failOfSth', {
        sth: operatingState
          ? $t('sys.appDesigner.fieldEnable')
          : $t('sys.appDesigner.fieldUnEnable'),
      }),
    );
  }
}
export const changeModelOperatingState = debounce(_changeModelOperatingState, 500);
