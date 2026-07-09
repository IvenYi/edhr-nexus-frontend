import { isEmpty } from 'lodash-es';
import { EntityModelCategoryEnum } from '@gct/runtime';
import {
  getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey,
} from '/@/apis/gct-apaas/ModelComprehensiveController';
import { DocOutlineResponse, EdhrInstanceResponse } from '/@/apis/gct-apaas/model';
import { commonUtils } from '@gct/nocode-base';
import { EModuleEnum, ESubCategoryEnum } from '../enums';
import { sleep } from '/@/projects/online-form/src/utils/common';

interface IPayload {
  categoryModule: EModuleEnum;
  payload: any;
  props: any;
}
interface I_DhrResponse {
  docOutlines: Array<DocOutlineResponse>;
  edhrInstance: EdhrInstanceResponse;
}

interface I_ProductionParams {
  edhrInstId?: string;
  materialNo?: string;
  materialStatus?: string;
  mfgOrderId?: string;
}

interface I_InspectionParams {
  materialNo: string;
  txnNodeStatusId?: string;
}

interface I_ReleaseParams {
  materialNo: string;
  txnNodeStatusId?: string;
}

interface I_LinkParams extends I_ProductionParams {
  txnNodeStatusId?: string;
}

interface I_InspectionData {
  txnDefinitionId: string;
  txnDefinitionName: string;
  txnNodeStatusId: string;
  txnInstId: string;
  formList: Array<{
    id: string;
    name: string;
    formTmplId: string;
    forceSubmit: string;
    tmplId: string;
    [keyof: string]: string | undefined;
  }>;
  appendixList?: any[];
  reworkList?: any[];
  txnList?: any[];
}

interface I_ProductionData {
  appendixList: any[];
  reworkList: any[];
  txnList: any[];
  linkList: any[];
}

interface I_ReleaseData {
  txnDefinitionId: string;
  txnDefinitionName: string;
  txnNodeStatusId: string;
  txnInstId: string;
  formList: Array<{
    id: string;
    name: string;
    formTmplId: string;
    forceSubmit: string;
    tmplId: string;
    [keyof: string]: string | undefined;
  }>;
}

interface I_LinkData {
  id: string;
  name: string;
  formTmplId: string;
  forceSubmit: string;
  tmplId: string;
  [keyof: string]: string | undefined;
}

export class CategoryModuleController {
  constructor({ categoryModule, props, payload }: IPayload) {
    this.categoryModule = categoryModule;
    this.props = props;
    this.payload = payload;
  }

  categoryModule: EModuleEnum;
  props: any;
  payload: any;

  /** 数据缓存 Map<模块类型，数据> */
  private dataCache = new Map<EModuleEnum, any>();
  /** 加载状态 Map<模块类型，是否已加载> */
  private loadedMap = new Map<EModuleEnum, boolean>();
  /** DHR实例数据 */
  private edhrResponseCache: I_DhrResponse | null = null;
  private onlyShowReleaseSelf = false;
  private onlyShowInspectionSelf = false;

  updateCategoryModule(newCategoryModule) {
    const { categoryModule } = this;
    if (categoryModule !== newCategoryModule) {
      this.categoryModule = newCategoryModule;
    }
  }

  /**
   * @description 获取dhr信息. 根据是否有关联的dhr实例，来判断是否展示生产模块
   * @param materialNo
   * @returns
   */
  async requestInstanceByMaterialNo(materialNo: string): Promise<I_DhrResponse | null> {
    if (!materialNo) return null;

    try {
      const detail: I_DhrResponse =
        (await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
          {
            modelCategory: EntityModelCategoryEnum.ENTITY,
            modelKey: 'em_product_process',
            bsKey: 'getInstanceByMaterialNo',
          },
          {},
          // @ts-ignore
          { materialNo, mfgOrderId: this!.props?.paramExtraProps?._gct_nocode_mfg_order_id_ },
          { ignoreParamsToData: true },
        )) as any as I_DhrResponse;

      this.edhrResponseCache = detail;
      return detail;
    } catch (error) {
      this.edhrResponseCache = null;
      return null;
    }
  }

  /**
   * @description 获取目录数据（如果没有dhr实例则不展示目录数据）
   * @param materialNo
   * @returns Array<any>
   */
  async loadCatalogTreeData(materialNo: string, forceRefresh?: boolean): Promise<any[]> {
    if (forceRefresh) {
      this.edhrResponseCache = null;
    }

    if (!this.edhrResponseCache) {
      const res = await this.requestInstanceByMaterialNo(materialNo);
      if (res) {
        return this.createCatalogTreeData(res.docOutlines);
      }
      return [];
    }
    const cachedData = this.createCatalogTreeData(this.edhrResponseCache.docOutlines);
    return cachedData;
  }

  /**
   * @description 获取生产数据(如果没有dhr实例则不展示生产数据)
   * @param params
   * @returns
   */
  async loadProductionData(params: I_ProductionParams): Promise<I_ProductionData> {
    const defaultResult = {
      appendixList: [],
      reworkList: [],
      txnList: [],
      linkList: [],
    };
    if (!params?.edhrInstId) return defaultResult;

    const res: any = (await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: EntityModelCategoryEnum.ENTITY,
        modelKey: 'em_edhr_summary_form_inst',
        bsKey: 'biz_search_all_form_inst',
      },
      {
        // @ts-ignore
        edhrInstId: params?.edhrInstId,
        materialNo: params?.materialNo,
        materialStatus: params?.materialStatus,
        mfgOrderId: params?.mfgOrderId,
        isAll: true,
      },
    )) as any;

    return {
      appendixList: res?.appendixList || [],
      txnList: res?.txnList || [],
      reworkList: res?.reworkList || [],
      linkList: res?.relationFormList || [],
    };
  }

  /**
   * @description 获取检验模块的数据
   * @param params
   * @returns {Array<I_InspectionData>}
   * *: 批次号查询当前关联的所有事务的数据，区分事务节点则使用txnNodeStatusId参数来查询对应节点的数据
   */
  async loadInspectionData(params: I_InspectionParams): Promise<I_InspectionData[]> {
    const res: I_InspectionData[] =
      (await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          modelCategory: 'entity',
          modelKey: 'em_inspection_list',
          bsKey: 'biz_inspection_execute_get_all_form',
        },
        {
          // @ts-ignore
          materialNo:
            !this.onlyShowInspectionSelf || !params.txnNodeStatusId
              ? params?.materialNo
              : undefined,
          txnNodeStatusId: this.onlyShowReleaseSelf ? undefined : params?.txnNodeStatusId,
        },
      )) as any as I_InspectionData[];

    return res || [];
  }

  /**
   * @description 查询放行单列表
   * @param params.materialNo 批次/sn号
   *
   *  */
  async loadReleaseData(params: I_ReleaseParams): Promise<I_ReleaseData[]> {
    const res = (await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: EntityModelCategoryEnum.ENTITY,
        modelKey: 'em_product_release_list',
        bsKey: 'biz_release_execute_get_all_form',
      },
      {
        // @ts-ignore
        materialNo:
          !this.onlyShowReleaseSelf || !params.txnNodeStatusId ? params?.materialNo : undefined,
        txnNodeStatusId: this.onlyShowInspectionSelf ? undefined : params?.txnNodeStatusId,
      },
    )) as any;

    return res || [];
  }

  /**
   * @description 查询关联数据
   * @param params
   * @returns
   */
  async loadLinkData(params: I_ProductionParams): Promise<I_LinkData[]> {
    const result = await this.loadProductionData(params);
    return result?.linkList || [];
  }

  async loadDataByCategory(params?: any, forceRefresh = false, callback?: any): Promise<any> {
    let result: any = null;

    // 检查缓存，有缓存且非强制刷新则直接返回
    if (!forceRefresh && this.loadedMap.get(this.categoryModule)) {
      console.log(`[Controller] 使用缓存数据：${this.categoryModule}`);
      return this.dataCache.get(this.categoryModule);
    }
    switch (this.categoryModule) {
      case EModuleEnum.CATALOG:
        result = await this.loadCatalogTreeData(params?.materialNo, forceRefresh);
        break;
      case EModuleEnum.PRODUCTION:
        result = await this.loadProductionData(params as I_ProductionParams);
        break;
      case EModuleEnum.INSPECTION:
        result = await this.loadInspectionData(params as I_InspectionParams);
        break;
      case EModuleEnum.RELEASE:
        result = await this.loadReleaseData(params as I_ReleaseParams);
        break;
      case EModuleEnum.LINK:
        result = await this.loadLinkData(params as I_LinkParams);
        break;
      default:
        break;
    }
    // 缓存数据并标记已加载
    this.dataCache.set(this.categoryModule, result);
    this.loadedMap.set(this.categoryModule, true);

    callback && callback(result);
    await sleep(600);
    return result;
  }

  /**
   * @description ⬇️⬇️⬇️
   * 计算目录树的展示逻辑。
   *  - 1. 批次来源于[DHR填报]：目录、检验、放行、关联。
   *  - 2. 批次来源于[工单拆分]：目录、生产、检验、放行、关联。
   *  - 3. 批次来源于[检验事务]：检验、放行、关联。
   *  - *. 通过批次号查询判断是否有关联的DHR实例，如果没有关联的DHR实例，则不展示目录和生产模块。
   * @param params.pageType 页面类型：DHR填报
   */
  calcCategoryMenuData(payload?: any, props?: any) {
    const { pageType, dhrInstance } = payload;
    const arr = [
      EModuleEnum.CATALOG, // 目录
      EModuleEnum.PRODUCTION, // 生产
      EModuleEnum.INSPECTION, // 检验
      EModuleEnum.RELEASE, // 放行
      EModuleEnum.LINK, // 关联
    ];

    const hasDhrInstance = isEmpty(dhrInstance) ? false : true;
    if (!hasDhrInstance) {
      arr.splice(arr.indexOf(EModuleEnum.CATALOG), 1);
      arr.splice(arr.indexOf(EModuleEnum.PRODUCTION), 1);
      arr.splice(arr.indexOf(EModuleEnum.LINK), 1);
    }
    // 如果批次/SN来自于DHR填报（存在dhr实例但是未关联工单），则不展示生产模块
    if (hasDhrInstance && dhrInstance?.module === 'dhr' && !dhrInstance?.mfgOrderId) {
      arr.splice(arr.indexOf(EModuleEnum.PRODUCTION), 1);
    }

    let currentModule = EModuleEnum.CATALOG;
    switch (pageType) {
      case 'edhr-filling':
        // DHR填报产生的批次不展示生产模块
        currentModule = EModuleEnum.CATALOG;
        break;
      case 'inspection-execution':
        currentModule = EModuleEnum.INSPECTION;
        this.onlyShowInspectionSelf = true;
        break;
      case 'release-execution':
        currentModule = EModuleEnum.RELEASE;
        this.onlyShowReleaseSelf = true;
        break;
      default:
        currentModule = arr[0];
        this.onlyShowInspectionSelf = false;
        this.onlyShowReleaseSelf = false;
        break;
    }

    if (props.sopList?.length) {
      arr.push(EModuleEnum.ESOP);
    }
    return {
      menus: arr,
      currentMenu: currentModule,
    };
  }

  /**
   * 创建目录树
   * @param data
   */
  createCatalogTreeData(data: DocOutlineResponse[]) {
    if (data) {
      const catalogTreeData = commonUtils.listTransformTree(data);
      return catalogTreeData;
    }
    return [];
  }

  /**
   * 清除缓存
   * @param moduleType 模块类型，不传则清除全部
   */
  clearCache(moduleType?: EModuleEnum) {
    if (moduleType) {
      this.dataCache.delete(moduleType);
      this.loadedMap.delete(moduleType);
      console.log(`[Controller] 清除缓存：${moduleType}`);
    } else {
      this.dataCache.clear();
      this.loadedMap.clear();
      console.log('[Controller] 清除全部缓存');
    }
  }

  /**
   *
   * @param data {Array} 需要查找的数据
   * @param ofTmplId {string} 指定默认选中的表单模板ID（优先级高于默认选中逻辑）
   * @returns {* docData, selfInfo, category}  docData: 默认选中的目录数据；selfInfo：默认选中的表单实例数据；category：默认选中的表单分类类型（ESubCategoryEnum）
   */
  getDefaultSelectedData(
    data: any,
    ofTmplId?: string,
  ): {
    docData?: any; // 默认选中的目录数据
    selfInfo?: any; // 默认选中的表单实例数据
    category?: ESubCategoryEnum; // 默认选中的表单分类类型
  } {
    const defaultResult = Object.create({
      docData: undefined,
      selfInfo: undefined,
      category: undefined,
    });
    if (!this.categoryModule) return defaultResult;

    switch (this.categoryModule) {
      case EModuleEnum.CATALOG:
        const firstDoc = !data?.[0]?.children?.length ? data?.[0] : data?.[0]?.children?.[0];
        defaultResult.docData = commonUtils.findFirstDoc(data, ofTmplId) || firstDoc;
        break;
      case EModuleEnum.PRODUCTION:
        const productionConfig = [
          { key: 'appendixList', category: ESubCategoryEnum.APPENDIX_FORM },
          { key: 'txnList', category: ESubCategoryEnum.TXN_FORM },
          { key: 'reworkList', category: ESubCategoryEnum.REWORK_FORM },
        ] as const;
        // 查找第一个有数据的源
        const matched = productionConfig.find((config) => data?.[config.key]?.[0]);
        if (matched) {
          defaultResult.selfInfo = data[matched.key][0];
          defaultResult.category = matched.category;
        }
        break;
      case EModuleEnum.INSPECTION:
        const inspectionForms = (data as any[]).reduce((acc, item) => {
          if (item.formList?.length > 0) {
            acc.push(...item.formList);
          }
          return acc;
        }, [] as any[]);
        defaultResult.docData = commonUtils.findFirstDoc(inspectionForms, ofTmplId);
        defaultResult.category = ESubCategoryEnum.INSPECTION_FORM;
        break;
      case EModuleEnum.RELEASE:
        defaultResult.selfInfo = data?.[0]?.formList?.[0];
        defaultResult.category = ESubCategoryEnum.RELEASE_FORM;
        break;
      case EModuleEnum.LINK:
        defaultResult.selfInfo = data?.[0];
        defaultResult.category = ESubCategoryEnum.LINK_FORM;
        break;
      default:
        break;
    }
    return defaultResult;
  }
}
