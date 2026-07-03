import { defaults } from 'lodash-es';
import { IBomEntry, IFormTmplBom, IMaterialConsumeData } from './types';
import { BaseCoreComponent, IPaper } from '../../types';
import { MaterialConsumeTableController } from './material-consume-table-controller';
import { FormInstBomResponse } from '/@/apis/gct-apaas/model';
import { fetchHistoryConsume } from './service';
import { FIELD_TYPE } from '@gct/runtime';

/**
 * 表单模板bom配置控制器（物料消耗表）
 * @export
 * @class FormTmplBomController
 */
export class FormTmplBomController {
  /** 实例bom配置信息 */
  formInstBom: FormInstBomResponse | null = null;
  /** 工序id */
  operationId!: string;
  /** 批次/sn */
  materialNo!: string;
  /** 历史填报数据 */
  historyData: IMaterialConsumeData[] = [];
  /** 表单控制器(key是tableKey) */
  tableControllers: Record<string, MaterialConsumeTableController> = {};
  /** 字段key和tableKey的映射 */
  field2TableMap: Record<string, string> = {};
  constructor() {}

  /**
   * 判断使用场景，不符合的报错提示
   * @param opts
   */
  judgeScene(opts: { cloneRuntimeJson: any; selfInfo: any }) {
    if (!opts.selfInfo.businessType) {
      // 表单模板的场景不用提示
      return;
    }
    const hasMCTable = opts.cloneRuntimeJson?.paper?.props?.materialConsumeTableList?.length;
    const isAllowBusinessType = ['DHR', 'TXN'].includes(opts.selfInfo.businessType);
    const hasBusinessId = !!opts.selfInfo.businessId;
    if (hasMCTable && (!isAllowBusinessType || !hasBusinessId)) {
      MaterialConsumeTableController.render.message({
        type: 'error',
        content: $t('sys.onlineForm.mcTableCannotUseTip'),
      });
    }
    const hasBalanceTable = opts.cloneRuntimeJson?.paper?.props?.materialBalanceTableList?.length;
    if (hasBalanceTable && (!isAllowBusinessType || !hasBusinessId)) {
      MaterialConsumeTableController.render.message({
        type: 'error',
        content: $t('sys.onlineForm.balanceTableCannotUseTip'),
      });
    }
  }
  /**
   * 批次数量
   * @readonly
   */
  get materialNoNum() {
    return this.formInstBom?.qty ?? 1;
  }

  /**
   * bom模块配置关联过来的bom明细集合
   * @readonly
   */
  get bomEntries() {
    return this.formInstBom?.bomEntries as IBomEntry[];
  }

  /** 表单模板bom信息配置列表 */
  get tmplBomList() {
    return this.formInstBom?.formTmplBomList as IFormTmplBom[];
  }

  /**
   * bom那边指定的当前工序的开关
   * @readonly
   */
  get enableSequenceLoading() {
    // todo enableSequenceLoading
    console.log('enableSequenceLoading', this.formInstBom?.sequenceEntries);
    return !!this.formInstBom?.sequenceEntries?.[0]?.enabled_;
  }

  /**
   * 初始化模板的物料消耗的配置
   */
  async init(data: { formInstBom: FormInstBomResponse; operationId: string; materialNo: string }) {
    if (!data.formInstBom) {
      return;
    }
    this.operationId = data.operationId;
    this.materialNo = data.materialNo;
    this.formInstBom = data.formInstBom;
    this.historyData = await fetchHistoryConsume({
      production_identification_id_: this.formInstBom.productionIdentificationId!,
      routing_operation_id_: this.operationId,
    });
    this.tableControllers = {};
    this.tmplBomList.forEach((cur) => {
      const controller = new MaterialConsumeTableController(this, cur);
      const [tableKey, fieldKey] = cur.table_key_.split(':');
      this.tableControllers[tableKey] = controller;
      this.field2TableMap[fieldKey] = tableKey;
    }, {});
  }

  /**
   * 根据字段key获取子表控制器
   * @param field
   * @return {*}
   */
  findTableControllerByField(field: string) {
    return this.tableControllers[this.field2TableMap[field]];
  }

  /** 计算表单数据(需求废弃，不初始化了) */
  calcFormState(paper: IPaper) {
    return undefined;
    const { materialConsumeTableList = [] } = paper?.props ?? {};
    const formState: any = {};
    if (materialConsumeTableList.length) {
      materialConsumeTableList.forEach((item) => {
        const tableC = this.tableControllers[item.tableKey];
        if (tableC) {
          formState[item.masterSubField] = tableC.calcFormState();
        } else {
          console.warn('没有找到表单模板bom配置');
        }
      });
    }
    return formState;
  }

  /**
   * 处理字段组件
   * - 补充物料字段的额外查询条件
   * @param field
   */
  handleField(field: BaseCoreComponent.FieldBasicProps) {
    const { subFieldKey, fieldType } = field;
    const tableC = this.findTableControllerByField(subFieldKey!);
    if (!tableC) {
      return;
    }
    field.isMaterialConsumeField = true;
    if (fieldType === FIELD_TYPE.PRODUCT && field.field === 'product_id_') {
      field.newSpecificConfig!.newQueryData = tableC.getProductQuery();
      field.newSpecificConfig!.newComponentProps = {
        hideSingleVersion: false,
        parentToDefault: true,
      };
    }
  }

  /**
   * 处理默认值，
   * - 补充行数据的工序默认值
   * @param defaultMap
   */
  handleDefaultMap(defaultMap: Record<string, any>) {
    Object.keys(this.field2TableMap).forEach((key) => {
      if (!defaultMap[key]) {
        defaultMap[key] = {};
      }
      // 补充缺失的默认值（如工序没有拖到页面上时）
      defaults(defaultMap[key], {
        routing_operation_id_: this.operationId,
      });
    });
  }

  async submitValidate(showMsg, notifyCallback) {
    const results = await Promise.allSettled(
      Object.values(this.tableControllers).map((c) => c.submitValidate()),
    );
    const successful = results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value);
    const fieldArr = successful.filter(Boolean);
    const notify = (params: Record<string, any> = {}) => {
      if (typeof notifyCallback === 'function') {
        notifyCallback(params);
      }
    };
    const message = $t('sys.onlineForm.mcTableFillError');

    if (fieldArr.length) {
      const fields = fieldArr.reduce((acc, cur) => {
        acc[cur.field] = [cur];
        return acc;
      }, {});
      if (showMsg) {
        notify({ message, fields });
      }
      throw {
        isValid: false,
        callback: (opts = {}) => notify({ message, fields, ...opts }),
      };
    }
  }
}
