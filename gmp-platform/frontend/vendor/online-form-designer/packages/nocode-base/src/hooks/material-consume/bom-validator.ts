import { cloneDeep, merge } from 'lodash-es';
import { stockCheck } from './service';
import { IBomEntry, IFormTmplBom, IMaterialConsumeData } from './types';

export class BomEntryValidator {
  /** 该明细使用到的产品的id集合 */
  productIds: string[] = [];

  /** 物料和code的映射 */
  productCodes: Record<string, string> = {};

  /** 历史数据中已经消耗的 */
  hasConsumed: number = 0;

  /** 需求总量 */
  total: number = 0;

  /** 剩于可消耗数量 */
  get remainingNum() {
    return this.total - this.hasConsumed;
  }

  constructor(
    public bomEntry: IBomEntry,
    /** 是否启用顺序投料 */
    public enableSequenceLoading: boolean,
    /** 批次数量 */
    public materialNoNum: number,
    /** 历史填报数据 */
    public historyData: IMaterialConsumeData[],
    /** 表单实例的批次号 */
    public mainMaterialNo: string,
  ) {
    this.productIds.push(this.bomEntry.product_id_);
    this.productCodes[this.bomEntry.product_id_] = this.bomEntry.product_code_;
    if (this.bomEntry.substitute_material_enabled_ && this.bomEntry.substitute_material_entries_) {
      this.bomEntry.substitute_material_entries_.forEach((i) => {
        this.productIds.push(i.product_id_);
        this.productCodes[i.product_id_] = i.product_code_;
      });
    }

    this.hasConsumed = this.calcQtyConsumed(this.historyData);
    this.total = this.materialNoNum * this.bomEntry.qty_required_;
  }

  /**
   * 翻译物料的code
   * @param productId
   * @return {*}
   */
  translateProductCode(productId: string) {
    return this.productCodes[productId];
  }

  /**
   *过滤出该组明细的数据
   * @param arr
   * @return {*}
   */
  filterGroupData(arr: IMaterialConsumeData[]) {
    return arr.filter((i) => this.productIds.includes(i.product_id_!));
  }

  validateSubstitute(arr: IMaterialConsumeData[]) {
    const groupData = this.filterGroupData(arr);
    if (!this.bomEntry.substitute_material_enabled_) {
      const notMain = groupData.find((i) => i.product_id_ !== this.bomEntry.product_id_);
      if (notMain) {
        throw new Error($t('sys.edhr.mcTable.onlyMainMaterialCanSelect'));
      }
    } else if (this.bomEntry.substitute_policy_ === 'only_one') {
      const idSet = new Set(groupData.map((i) => i.product_id_));
      if (idSet.size > 1) {
        throw new Error($t('sys.edhr.mcTable.notAllowMixSubstituteMaterial'));
      }
    }
  }

  validateLotMixing(arr: IMaterialConsumeData[]) {
    // 不开启不校验
    if (!this.bomEntry.lot_mixing_enabled_) {
      return;
    }
    // 上料方式不是批次的，不需要校验
    if (this.bomEntry.type_ !== 'by_lot') {
      return;
    }
    const groupData = this.filterGroupData(arr);
    const maxTimes = this.bomEntry.lot_mixing_times_;
    const set = new Set();
    let errorMsg = '';
    groupData.find((i) => {
      set.add(i.material_no_!);
      // 超过最大次数
      if (set.size > maxTimes) {
        errorMsg = $t('sys.edhr.mcTable.overMaterialMaxError', {
          product: this.translateProductCode(this.bomEntry.product_id_),
          max: maxTimes,
        });
        return true;
      }
    });
    if (errorMsg) {
      throw new Error(errorMsg);
    }
  }

  /**
   * 校验数量
   * @param arr
   * @return {*}
   */
  validateNum(arr: IMaterialConsumeData[]) {
    // 不开启不校验
    if (!this.bomEntry.qty_validation_enabled_) {
      return;
    }
    // 上料方式仅查看不校验
    if (this.bomEntry.type_ === 'view') {
      return;
    }

    // 消耗数据
    const consumeNum = this.calcQtyConsumed(arr);

    // 0 数量为0的时候表示没有填入数据，不校验
    if (consumeNum === 0) {
      return;
    }

    // 只能判断有没有超，小于的判断由顺序那边判断
    if (
      ['eq', 'lte'].includes(this.bomEntry.qty_validation_rule_) &&
      consumeNum > this.remainingNum
    ) {
      throw new Error($t('sys.edhr.mcTable.overMaterialConsumeError'));
    }
    return;
  }
  /**
   * 校验库存
   * @param row 当前行数据
   */
  async validateStock(row: IMaterialConsumeData) {
    await stockCheck({ row, entry: this.bomEntry, mainMaterialNo: this.mainMaterialNo });
  }

  /**
   * 计算已经消耗的数量之和
   * @param arr
   * @return {*}
   */
  calcQtyConsumed(arr: IMaterialConsumeData[] = this.historyData) {
    const groupData = this.filterGroupData(arr);
    return groupData.reduce((acc, cur) => acc + (cur.qty_ ?? 0), 0);
  }

  /**
   * 按顺序投料用
   * 检查数据中的当前明细的填报是否已经完成
   * @param arr
   */
  validateHasCompleted(arr: IMaterialConsumeData[]) {
    const groupData = this.filterGroupData(arr);
    const message = $t('sys.edhr.mcTable.sequenceLoadingError', {
      product: this.bomEntry.product_code_,
    });

    if (!groupData.length) {
      throw new Error(message);
    }
    // 仅查看有值就算完成
    if (this.bomEntry.type_ === 'view') {
      return;
    }
    // 根据数量校验
    const consumeNum = this.calcQtyConsumed(groupData);
    // 不开启数值校验的时候，有消耗就算完成填报
    if (!this.bomEntry.qty_validation_enabled_ && consumeNum) {
      return;
    }

    switch (this.bomEntry.qty_validation_rule_) {
      // 等于的时候要相等才算填报完成，小于的时候报错，大于由修改的时候报错，这边不报错
      case 'eq':
        if (consumeNum < this.remainingNum) {
          throw new Error(message);
        }
        break;
      // 大于等于的时候要大于等于才算完成
      case 'gte':
        if (consumeNum < this.remainingNum) {
          throw new Error(message);
        }
        break;
      // 小于等于的时候要小于等于有值就算算完成
      case 'lte':
        if (consumeNum <= 0) {
          throw new Error(message);
        }
        break;
      default:
        break;
    }
  }
}

export class BomEntriesValidator {
  bomEntryValidators: BomEntryValidator[];
  constructor(
    public entries: IBomEntry[],
    /** 是否启用顺序投料 */
    public enableSequenceLoading: boolean,
    /** 批次数量 */
    public materialNoNum: number,
    /** 历史填报数据 */
    public historyData: IMaterialConsumeData[],
    /** 表单实例的批次号 */
    public mainMaterialNo: string,
  ) {
    this.bomEntryValidators = entries.map(
      (i) =>
        new BomEntryValidator(i, enableSequenceLoading, materialNoNum, historyData, mainMaterialNo),
    );
  }

  /**
   * 翻译物料的code
   * @param productId
   * @return {*}
   */
  translateProductCode(productId?: string) {
    if (!productId) {
      return '';
    }
    const util = this.findUtilByProductId(productId);
    if (util) {
      return util.translateProductCode(productId);
    }
  }

  /**
   * 找到物料对应的validator
   * @param productId
   * @return {*}
   */
  findUtilByProductId(productId: string) {
    return this.bomEntryValidators.find((i) => i.productIds.includes(productId));
  }

  /**
   * 检验是否符合顺序投料的顺序要求
   * @param row 当前编辑的行
   * @param arr 所有的数据
   * @return {*}
   */
  validateSequenceLoading(row?: IMaterialConsumeData, arr: IMaterialConsumeData[]) {
    /** 没有开启顺序投料则不校验 */
    if (!this.enableSequenceLoading) {
      return;
    }
    // 投料顺序前提，只能一张表填报
    // 按顺序校验之前的明细是否填完，不填完报错
    const util = row ? this.findUtilByProductId(row.product_id_!) : undefined;
    for (const item of this.bomEntryValidators) {
      if (item === util) {
        // 给行的时候，校验到当前行所在的明细时中断校验
        // 不给时校验所有明细
        break;
      } else {
        item.validateHasCompleted(arr);
      }
    }
  }

  /**
   * 校验物料是否在bom里被使用
   * @param row 单行的数据
   */
  validateInBom(row: IMaterialConsumeData) {
    if (!row.product_id_) {
      throw new Error($t('sys.edhr.mcTable.materialEmptyError'));
    }
    const util = this.findUtilByProductId(row.product_id_!);
    if (!util) {
      const name = row.product_id__lb_ ? JSON.parse(row.product_id__lb_).join(',') : '';
      throw new Error(
        $t('sys.edhr.mcTable.productNotDefine', {
          product: name,
        }),
      );
    }
  }

  /**
   * 检查数据是否完整
   * @param arr
   */
  validateDataCompleted(row: IMaterialConsumeData) {
    this.validateInBom(row);
    const util = this.findUtilByProductId(row.product_id_!)!;
    const { type_ } = util.bomEntry;
    if (type_ === 'view') {
      // 仅查看数量，批号不看
      return;
    }
    // 按批次要看批次
    if (type_ === 'by_lot' && !row.material_no_) {
      throw new Error(
        $t('sys.edhr.mcTable.materialNoEmptyError', {
          product: this.translateProductCode(row.product_id_),
        }),
      );
    }
    // 按数量和安批次都要看数量
    if (!row.qty_) {
      throw new Error(
        $t('sys.edhr.mcTable.materialNumEmptyError', {
          product: this.translateProductCode(row.product_id_),
        }),
      );
    }
  }

  /**
   * 校验替代料校验
   * @param arr
   */
  validateSubstitute(arr: IMaterialConsumeData[]) {
    this.bomEntryValidators.forEach((i) => {
      i.validateSubstitute(arr);
    });
  }

  /**
   * 校验混批校验
   * @param arr
   */
  validateLotMixing(arr: IMaterialConsumeData[]) {
    this.bomEntryValidators.forEach((i) => {
      i.validateLotMixing(arr);
    });
  }

  /**
   * 校验数量
   * @param arr
   */
  validateNum(arr: IMaterialConsumeData[]) {
    this.bomEntryValidators.forEach((i) => {
      i.validateNum(arr);
    });
  }

  /**
   * 校验库存消耗
   * @param row
   */
  async validateStock(row: IMaterialConsumeData) {
    const find = this.findUtilByProductId(row.product_id_!);
    await find!.validateStock(row);
  }

  /**
   * 检验整个数组是否符合bom配置的要求
   * @param arr
   */
  async validate(arr: IMaterialConsumeData[]) {
    const editRow = arr.find((i) => !i.is_confirmed_);
    if (!editRow) {
      throw new Error($t('sys.edhr.mcTable.noEditingRow'));
    }
    this.validateInBom(editRow);
    this.validateSequenceLoading(editRow, arr);
    this.validateSubstitute(arr);
    this.validateLotMixing(arr);
    this.validateDataCompleted(editRow);
    this.validateNum(arr);

    // 最后校验库存
    if (editRow) {
      await this.validateStock(editRow);
    }
  }

  /**
   * 检查扫描数据是否可以插入
   * @param arr
   */
  async validateScanCanInsert(arr: IMaterialConsumeData[]) {
    const editRow = arr.find((i) => !i.is_confirmed_);
    if (!editRow) {
      throw new Error($t('sys.edhr.mcTable.noEditingRow'));
    }
    this.validateInBom(editRow);
    this.validateSequenceLoading(editRow, arr);
    this.validateSubstitute(arr);
    this.validateLotMixing(arr);
  }

  /**
   * 把扫描数据按情况插入到数组的位置，返回新数组
   * @param row
   * @param arr
   * @return {*}
   */
  mergeRowInArr(row: IMaterialConsumeData, arr: IMaterialConsumeData[]) {
    this.validateInBom(row);
    // 合并的时候删除空行
    const newArr = cloneDeep(arr).filter((i) => i.product_id_);
    const util = this.findUtilByProductId(row.product_id_!)!;
    const sameIndex = newArr.findLastIndex((i) => {
      if (row.product_id_ !== i.product_id_) {
        return false;
      }
      if (i.material_no_) {
        return i.material_no_ === row.material_no_;
      } else {
        return true;
      }
    });
    // 相同的数据合并数量
    if (sameIndex >= 0) {
      const oldQty = newArr[sameIndex].qty_ ?? 0;
      const newQty = oldQty + (row.qty_ ?? 0);
      merge(newArr[sameIndex], row, { qty_: newQty });
      return newArr;
    }

    // 插入到同一组的下方
    const sameGroupIndex = newArr.findLastIndex((i) => {
      return util.productIds.includes(i.product_id_!);
    });
    if (sameGroupIndex >= 0) {
      newArr.splice(sameGroupIndex + 1, 0, row);
      return newArr;
    }

    //其他情况最后一行插入新数据
    newArr.push(row);
    return newArr;
  }

  /**
   * 获取BOM里面所有的主料，替换料的id集合
   */
  getAllMaterialIds() {
    const result = new Set<string>();
    this.bomEntryValidators.forEach((i) => {
      i.productIds.forEach((i) => {
        result.add(i);
      });
    });
    return Array.from(result).map((i) => i.split(':').pop());
  }
}
