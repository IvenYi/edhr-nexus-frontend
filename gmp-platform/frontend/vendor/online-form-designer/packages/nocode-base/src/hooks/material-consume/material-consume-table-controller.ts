import { IBomEntry, IFormTmplBom, IMaterialConsumeData } from './types';
import { FormTmplBomController } from './tmpl-bom-controller';
import { Ref, markRaw, onUnmounted } from 'vue';
import { materialCheck } from './service';
import { BomEntriesValidator } from './bom-validator';
import { merge } from 'lodash-es';
import { ISubTable } from '../../types';
import { getParseRuleValue, getParseRuleInfo } from '../label-parse-rule';
import { NocodeAdapter } from '../../adapter/adapter';

export class MCDataUtil {
  static allFields: Array<keyof IMaterialConsumeData> = [
    'product_id_',
    'material_no_',
    'qty_consumed_',
    'qty_',
    'qty_required_',
    'routing_operation_id_',
  ];

  static editMCTable(row: IMaterialConsumeData, data: IMaterialConsumeData['_MCTABLE']) {
    if (!row._MCTABLE) {
      row._MCTABLE = {};
    }
    merge(row, { _MCTABLE: data });
  }

  /**
   * 数组转对象并付统一的值
   * @static
   * @param arr
   * @param [keyVal=true]
   * @return {*}
   */
  static arrToObj(arr: string[], keyVal: any = true) {
    return arr.reduce((acc, key) => {
      acc[key] = keyVal;
      return acc;
    }, keyVal);
  }
  /**
   * 设置禁用字段
   * @static
   * @param opts 参数
   */
  static setFieldsDisabled(opts: {
    /** 数据 */
    row: IMaterialConsumeData;
    /** 属性key集合(不给则默认全部) */
    keys?: Array<keyof IMaterialConsumeData>;
    /** 设置的值(不给则true) */
    disabled?: boolean;
  }) {
    const { row, keys = this.allFields, disabled = true } = opts;
    this.editMCTable(row, { fieldDisabled: this.arrToObj(keys, disabled) });
  }

  /**
   * 设置行数据的编辑状态
   * @static
   * @param row
   * @param editing
   */
  static setRowEditing(row: IMaterialConsumeData, editing: boolean) {
    row.is_confirmed_ = !editing;
  }
}

export class MaterialConsumeTableController {
  /**
   * 绘制UI工具，需要pc移动端替换对应的实现类
   * @static
   */
  static get render() {
    return NocodeAdapter.mcRender;
  }

  /**
   * 之前提交的数据（跨表处理的情况）
   */
  beforeData: IMaterialConsumeData[] = [];

  /** 表格数据引用对象 */
  tableDataRef!: Ref<IMaterialConsumeData[]>;

  /**
   * 子表组件的信息
   */
  widget!: ISubTable;

  /** 批次数量 */
  get materialNoNum() {
    return this.tmplBomController.materialNoNum;
  }

  /**
   * 解析规则数据对象
   */
  scanRuleInfo!: {
    rules_: string;
    id_: string;
    base_id_?: string;
  };

  /**
   * 解析规则配置
   */
  get scanRules(): string {
    return this.scanRuleInfo.rules_;
  }

  bomEntriesValidator: BomEntriesValidator;

  /**
   * 是否求用顺序投料
   * @readonly
   */
  get enableSequenceLoading() {
    if (this.tmplBom.personal_bom_enabled_) {
      return this.tmplBom.sequence_loading_enabled_!;
    }
    // todo 从bom导入数据里判断启用顺序投料
    return this.tmplBomController.enableSequenceLoading;
  }

  /**
   * 实际使用的数据（过滤掉打deleted_标签的数据)
   */
  get actualTableData() {
    return this.tableDataRef.value.filter((i) => !i.deleted_);
  }

  /**
   * 修改表格数据（保留打deleted_标签的数据）
   */
  set actualTableData(value: IMaterialConsumeData[]) {
    const deletedArr = this.tableDataRef.value.filter((i) => i.deleted_);
    this.tableDataRef.value = [...value, ...deletedArr];
  }

  constructor(
    private tmplBomController: FormTmplBomController,
    private tmplBom: IFormTmplBom,
  ) {
    this.initScanRule(this.tmplBom.barcode_parsing_rules_id_!);
    // 防止被vue响应式之后，tableDataRef被拆解
    markRaw(this);

    this.bomEntriesValidator = new BomEntriesValidator(
      this.actualBomEntries,
      this.enableSequenceLoading,
      this.materialNoNum,
      this.tmplBomController.historyData,
      this.tmplBomController.materialNo,
    );
  }

  /** 错误信息 */
  error(message: string) {
    MaterialConsumeTableController.render.message({
      type: 'error',
      content: message,
    });
  }

  /**
   * 初始化扫描解析规则
   * @param id
   */
  protected async initScanRule(id: string) {
    if (!id) {
      // this.error($t('sys.edhr.mcTable.scanRuleNotFound'));
      return;
    }
    this.scanRuleInfo = await getParseRuleInfo({ id });
  }

  /**
   * 变更条码规则
   */
  async changeScanRule() {
    const { id_, base_id_ } = this.scanRuleInfo ?? {};
    const newId = await MaterialConsumeTableController.render.openChangeRuleModal({
      id: `${base_id_ ? base_id_ + ':' : ''}${id_}`,
    });
    if (newId) {
      this.initScanRule(newId);
    }
  }

  /**
   * 是否人为指定物料
   * @readonly
   */
  get isPersonalBom() {
    return this.tmplBom.personal_bom_enabled_;
  }

  /**
   * 实际使用的bom明细信息(排序)
   * @readonly
   */
  get actualBomEntries() {
    const entries = this.isPersonalBom ? this.tmplBom.entries_ : this.tmplBomController.bomEntries;
    return (entries ?? []).sort(
      (a, b) => (a.operation_sort_num_ ?? 0) - (b.operation_sort_num_ ?? 0),
    );
  }

  /**
   * 根据bom明细构造子表数据(初始化时)
   */
  calcFormState() {
    if (this.tmplBom.material_loading_model_enabled_) {
      // todo 启用上下料模式，请求后台构造数据
    } else if (this.isPersonalBom || this.tmplBom.bom_init_enabled_) {
      // 根据配置项构造（人为指定或者，开启从bom导入）
      return this.tmplBom.entries_.map((i) => {
        return {
          product_id_: i.product_id_,
          qty_required_: i.qty_required_ * this.materialNoNum,
          // routing_operation_id_: this.tmplBomController.operationId,
        } as IMaterialConsumeData;
      });
    }
  }

  /**
   * 根据数据计算需要禁用的字段
   * @param row
   * @return {*}
   */
  calcDisabledFields(row: IMaterialConsumeData) {
    // 需求数量和已消耗数量不能改
    const disabledKeys: Array<keyof IMaterialConsumeData> = ['qty_consumed_', 'qty_required_'];
    if (row.product_id_) {
      const util = this.bomEntriesValidator.findUtilByProductId(row.product_id_);
      // 仅查看的时候禁用批次和数量
      if (util?.bomEntry.type_ === 'view') {
        disabledKeys.push('material_no_', 'qty_');
      }
    }
    return disabledKeys;
  }

  /**
   * 获取bom内主物料，替换物料查询的算子
   * @return {*}
   */
  getProductQuery() {
    return {
      'id_.in': this.bomEntriesValidator.getAllMaterialIds(),
    };
  }

  /**
   * 是否是第一行且物料是空行
   * @return {*}
   */
  isFirstBlankRow() {
    return this.actualTableData.length === 1 && !this.actualTableData[0].product_id_;
  }

  /**
   * 解析扫码的数据
   * 并判断是否能存入表中,返回对象则表示可以存入
   * @param str
   */
  protected async parseScanStr(str: string): Promise<void> {
    if (!this.isFirstBlankRow() && this.hasEditingRow()) {
      return;
    }
    // 解析规则获得条码的数据
    const data = getParseRuleValue(str, this.scanRules);
    console.log('parseScanStr', data);
    // todo 有过期时间的，校验是否过期，过期弹报错提示，中断逻辑
    // 后台校验和转换数据
    const arr = await materialCheck({
      material_no_: data.materialCode,
      production_identification_name_: data.lot,
      qty_: data.qty,
      validate_: data.expiration,
      bom_entries_bom: this.actualBomEntries,
      operation_id_: this.tmplBomController.operationId,
    });
    if (!arr) {
      this.error($t('sys.edhr.mcTable.notInBom'));
      return;
    }

    // 扫码返回多条数据的处理
    let materialData = arr[0];
    if (arr.length > 1) {
      // 处理多条的数据的时候，从返回的多条里找到需要的那条，找不到或不符合则报错
      const ids = this.actualTableData.map((i) => i.product_id_);
      const find = arr.find((j) => ids.includes(j.materialId));
      if (!find) {
        throw new Error($t('sys.edhr.mcTable.noMatchMaterial'));
      }
      materialData = find;
    }

    // 转换格式变成表格内数据，然后根据bom配置校验
    const row: IMaterialConsumeData = {
      product_id_: materialData.materialId,
      material_no_: materialData.productionIdentificationName,
      qty_: data.qty,
      is_confirmed_: false,
    };
    this.setDefaultValue(row);
    try {
      const newArr = this.bomEntriesValidator.mergeRowInArr(row, this.actualTableData);
      // 校验一部分逻辑，不通过则回退数据
      await this.bomEntriesValidator.validateScanCanInsert(newArr);
      this.tableDataRef.value = newArr;
      const editingRow = this.actualTableData.find((i) => !i.is_confirmed_);
      // 走后续校验逻辑
      if (editingRow) {
        this.confirm(editingRow);
      }
    } catch (e) {
      console.error(e);
      if (e.message) {
        this.error(e.message);
      }
    }
  }

  /** 扫描是否已经打开 */
  isScanOpen = false;
  /**
   * 打开扫描弹窗
   * @param opts
   */
  async openScanModal(opts: { title: string }) {
    if (this.isScanOpen) {
      return;
    }
    if (!this.scanRuleInfo) {
      this.error($t('sys.edhr.mcTable.scanRuleNotFound'));
      return;
    }
    const { title } = opts;
    this.isScanOpen = true;
    await MaterialConsumeTableController.render.openScanModal({
      title: title,
      onScan: async (str) => {
        console.log('onScan', str);
        await this.parseScanStr(str);
      },
    });
    this.isScanOpen = false;
  }

  /**
   * 打开扫描弹窗
   * @param opts
   */
  async openBomModal() {
    if (!this.actualBomEntries) {
      return;
    }
    await MaterialConsumeTableController.render.openBomModal({
      bomList: this.actualBomEntries,
      onSubstitute: async () => {
        console.log('一键导入数据逻辑');
      },
    });
  }

  /**
   * 消耗表组件setup时调用
   * @param opts
   */
  async setup(opts: { tableDataRef: Ref<any>; widget: ISubTable }) {
    this.tableDataRef = opts.tableDataRef;
    this.widget = opts.widget;
    console.log('setup', this.tableDataRef);
    if (this.actualTableData.length === 1) {
      const firstRow = this.actualTableData[0];
      // 第一行是空行的时候设置编辑开启
      if (!firstRow.product_id_) {
        MCDataUtil.setRowEditing(firstRow, true);
      }
    }

    onUnmounted(() => {
      MaterialConsumeTableController.render.destroyAllModals();
    });
  }

  /**
   * 校验数据，并退出编辑
   * @param row
   */
  async confirm(row: IMaterialConsumeData) {
    try {
      await this.bomEntriesValidator.validate(this.actualTableData);
      MCDataUtil.setRowEditing(row, false);
    } catch (e) {
      if (e.message) {
        this.error(e.message);
      }
    }
  }

  /**
   * 生成校验清单格式的报错
   * @param message
   * @return {*}
   */
  calcErrorObj(message: string) {
    return {
      field: this.widget.props.field + '_0_product_id_',
      message: JSON.stringify({
        message: message,
        showFieldName: $t('sys.model.product'),
        showModelKey: this.widget.props.modelKey!,
        showModelName: this.widget.props.tableTitle!,
        subFieldKey: this.widget.props.field,
        targetFieldId: 'product_id_',
      }),
    };
  }

  /**
   * 提交的时候的校验
   */
  async submitValidate() {
    let errorObj: any;
    const hasEditing = this.hasEditingRow(false);
    if (hasEditing) {
      errorObj = this.calcErrorObj($t('sys.edhr.mcTable.hasEditingRow'));
    }
    // 校验顺序填报时是否都完成填报
    try {
      this.bomEntriesValidator.validateSequenceLoading(undefined, this.actualTableData);
    } catch (e) {
      if (e.message) {
        errorObj = this.calcErrorObj(e.message);
      }
    }
    return errorObj;
  }

  /**
   * 是否有正在编辑的行
   * @return {*}
   */
  hasEditingRow(showMessage = true) {
    const hasEditing = this.actualTableData.some((i) => !i.is_confirmed_);
    if (hasEditing && showMessage) {
      this.error($t('sys.edhr.mcTable.onlyOneEditingRow'));
    }
    return hasEditing;
  }

  /**
   * 选中行开启编辑
   * @param row
   */
  editRow(row: IMaterialConsumeData) {
    if (this.hasEditingRow()) {
      return;
    }
    const isLast = this.actualTableData[this.actualTableData.length - 1] === row;
    if (this.enableSequenceLoading && !isLast) {
      this.error($t('sys.edhr.mcTable.onlyLastRowCanEdit'));
      return;
    }
    MCDataUtil.setRowEditing(row, true);
  }

  /**
   * 设置默认值，如工序，需求数量/已消耗数量
   * @param row
   */
  setDefaultValue(row: IMaterialConsumeData) {
    if (!row.routing_operation_id_) {
      row.routing_operation_id_ = this.tmplBomController.operationId;
    }
    if (row.product_id_) {
      const util = this.bomEntriesValidator.findUtilByProductId(row.product_id_);
      if (util) {
        row.qty_required_ = util.total;
        row.qty_consumed_ = util.hasConsumed;
        row.bom_entry_id_ = util.bomEntry.id_;
      }
    }
  }

  /**
   * 统一处理表格内部的字段的值变更
   * @param opts
   */
  handleChange(opts: { field: string; row: IMaterialConsumeData; value: any; option?: any }) {
    const { field, row, value, option } = opts;
    console.log('handleChange', opts);
    if (field === 'product_id_') {
      // 选择物料的时候清空批次和数量
      row.material_no_ = undefined;
      row.qty_ = undefined;
      this.setDefaultValue(row);
    } else if (field === 'material_no_') {
      row.product_id_ = option.product_id_;
      this.setDefaultValue(row);
    }
  }
}
