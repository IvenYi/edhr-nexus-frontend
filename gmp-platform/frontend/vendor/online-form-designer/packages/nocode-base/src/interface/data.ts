import { isEmpty } from 'lodash-es';
import { FormTypeEnum, ViewTypeEnum } from '../constant';

import { postSqlViewBizServiceByModelKeyByBsKey } from '/@/apis/gct-apaas/SqlViewModelBsServiceController';
import { postViewModelBizServiceByModelKeyByBsKey } from '/@/apis/gct-apaas/ViewModelBsController';
import { getJsEngineExecByKey } from '/@/apis/gct-apaas/JsEngineController';
import { getStashInfo } from '/@/apis/gct-apaas/StashController';
import { postModelComprehensiveQueryModelDataAndDrillData } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';

/** 数据基础接口工具类 */
export const baseDataUtils = {
  baseApis: {
    getOneData2SqlView: postSqlViewBizServiceByModelKeyByBsKey,
    getOneData2ViewModel: postViewModelBizServiceByModelKeyByBsKey,
    getOneData2ViewJs: getJsEngineExecByKey,
  },
  /** 请求单据模板相关信息 */
  requestTemplateInfo: async (payload: {
    /** 模板id */
    tid: string;
    /** 请求函数 */
    request: Function;
  }) => {
    const { tid, request } = payload || {};
    const data = await request({
      id: tid,
      runtimeJson: true,
    });
    // 如果没有模板数据
    if (!data || !data.runtimeJson) {
      return false;
    }
    return data;
  },
  /** 请求真实填报的渲染数据 */
  requestRenderData: async (payload: {
    /** 信息 */
    info: {
      /** 表单类型 */
      formType: FormTypeEnum;
      /** 视图类型 */
      viewType: ViewTypeEnum;
      /** 模型key */
      modelKey: string;
      /** 脚本绑定的事件key */
      bindKey?: string;
    } & Record<string, any>;
    /** 请求配置信息 */
    fetchConfig: {
      /** 批次号/物料编号 */
      _gct_materialNo_?: string;
    };
    /** 查询条件信息 */
    queryConfig: {
      id_?: string;
      /** 暂存状态 */
      _gct_dataStatus_?: string;
    } & Record<string, any>;
    /** 主模型的关联字段信息 */
    foreignFields: any;
    /** 子模型的关联字段信息 */
    subModelFields: any;
    /** 是否是模拟填报 */
    isMockReport: boolean;
  }) => {
    const { info, fetchConfig, queryConfig, foreignFields, subModelFields, isMockReport } =
      payload || {};

    // 模拟填报不去请求接口信息
    if (isMockReport) {
      return Promise.resolve();
    }

    if (info.formType === FormTypeEnum.VIEW) {
      let requestName;
      const path = {};
      const query = {};

      if (info.viewType === ViewTypeEnum.VIEW_SQL) {
        requestName = 'getOneData2SqlView';
        Object.assign(path, { modelKey: info.modelKey, bsKey: 'getOne' });
      } else if (info.viewType === ViewTypeEnum.VIEW_MODEL) {
        requestName = 'getOneData2ViewModel';
        Object.assign(path, { modelKey: info.modelKey, bsKey: 'getOne' });
      } else if (info.viewType === ViewTypeEnum.VIEW_JS) {
        requestName = 'getOneData2ViewJs';
        Object.assign(path, { key: info.bindKey });
        Object.assign(query, { materialNo: fetchConfig._gct_materialNo_ });
      }

      if (!requestName) {
        return Promise.resolve();
      }
      return await baseDataUtils.baseApis[requestName](path, query, {});
    } else if (info.formType !== FormTypeEnum.TEXT) {
      const { _gct_dataStatus_, _gct_formChangeApprovalInfo_, ...otherQuery } = queryConfig;

      // 要判断query是否是空的情况，不然会全查数据的
      if (isEmpty(otherQuery)) {
        return Promise.resolve();
      }

      // 暂存
      if (_gct_dataStatus_ && _gct_dataStatus_ === 'STASH') {
        const stashData = await getStashInfo({ id: otherQuery.id_! });
        return {
          data: stashData && stashData.content ? JSON.parse(stashData.content) : undefined,
        };
      }

      // 变更审核中的数据
      const { isSupport, ...other } = _gct_formChangeApprovalInfo_ || {};

      if (isSupport) {
        const res: any = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
          {
            modelCategory: 'entity',
            modelKey: 'em_edhr_summary_approve_his',
            bsKey: 'getOne',
          },
          {
            query: {
              ...other,
              online_form_instance_id_: info.id,
            },
          },
        );

        // 需要过滤掉作废审核
        if (res && res.data && res.data.params_ && res.data.change_type_ !== 'ABANDON') {
          const params = JSON.parse(res.data.params_ || '{}');

          // 需要转换下数据格式
          const newFormData = Object.entries(params.data || undefined).reduce(
            (acc, [key, value]) => {
              if (Array.isArray(value)) {
                acc[key] = { data: value };
              } else {
                acc[key] = value;
              }
              return acc;
            },
            {},
          );

          return {
            data: newFormData,
          };
        }
      }

      return await postModelComprehensiveQueryModelDataAndDrillData({
        query: otherQuery,
        modelKey: info.modelKey,
        foreignFields,
        subModelFields,
      });
    }
    return Promise.resolve();
  },
};
