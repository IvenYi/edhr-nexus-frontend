import { reactive } from 'vue';

/**
 * 物料消耗表渲染工具类
 * @export
 * @class MCRender
 */
export class MCRender {
  /**
   * 提示信息
   * @param opts
   */
  message(opts: { type: 'error' | 'warning'; content: string }) {
    throw new Error('Function message not implemented.');
  }

  /**
   * 已经打开的bom的modal的参数对象
   * @static
   */
  static bomModalProps: any;
  async openScanModal(opts: { title: string; onScan: (str: string) => void }) {
    throw new Error('Function openScanModal not implemented.');
  }

  /**
   * 实际打开UIModal的函数
   */
  protected async _openBomModal(reactiveOpts: { bomList: any[]; onSubstitute: Function }) {}

  async openBomModal(opts: { bomList: any[]; onSubstitute: Function }) {
    if (MCRender.bomModalProps) {
      // 已经存在则覆盖props
      Object.assign(MCRender.bomModalProps, opts);
      return;
    }
    MCRender.bomModalProps = reactive(opts);
    await this._openBomModal(MCRender.bomModalProps);
    console.log('模态关闭');
    // 关闭后删除掉模态参数对象
    MCRender.bomModalProps = undefined;
  }

  /**
   * 打开修改条码解析规则的modal
   * 返回空或者修改后的规则字段id
   * @param opts \
   * - id 回显用的id
   * @return {*}
   */
  async openChangeRuleModal(opts: { id: string }): Promise<string | undefined> {
    throw new Error('Function openChangeRuleModal not implemented.');
  }

  /**
   * 销毁所有固定的模态
   */
  destroyAllModals() {
    throw new Error('Function destroyAllModals not implemented.');
  }
}
