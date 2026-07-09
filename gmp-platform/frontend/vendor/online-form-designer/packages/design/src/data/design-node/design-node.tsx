import { uuid } from '@jsplumb/browser-ui';
import { cloneDeep } from 'lodash-es';
import { IDesignNode, IDesignNodeData } from '@gct/base';

/**
 * 界面设计节点
 *
 * @author zhanghanrui
 * @date 2024-07-12 13:07:30
 * @export
 * @abstract
 * @class DesignNode
 * @implements {IDesignNode<T>}
 * @template T
 */
export abstract class DesignNode<T extends IDesignNodeData = IDesignNodeData>
  implements IDesignNode<T>
{
  id!: string;

  /**
   * 排序值
   *
   * @deprecated 去掉排序值，采用结构树排序
   * @author zhanghanrui
   * @date 2024-08-21 13:08:35
   * @type {number}
   */
  order!: number;

  get label(): string {
    return this.data.name || '';
  }

  abstract type: string;

  updateDate!: number;

  data!: T;

  constructor(data?: Partial<IDesignNode<T>>) {
    this.init(data);
  }

  /**
   * 实例化时设置
   *
   * @author zhanghanrui
   * @date 2024-07-12 13:07:50
   * @protected
   * @param {Partial<IDesignNode<T>>} [data]
   */
  protected init(data?: Partial<IDesignNode<T>>): void {
    if (data) {
      this.id = data.id || uuid();
      this.type = data.type || this.type;
      this.updateDate = data.updateDate || Date.now();
    } else {
      this.id = uuid();
      this.updateDate = Date.now();
    }
    let params = this.createData();
    if (data && data.data) {
      params = Object.assign(params, cloneDeep(data.data));
    }
    this.setData(params);
  }

  protected setData(data: T): void {
    this.data = data;
  }

  protected createData(): T {
    return {} as T;
  }

  clone(): IDesignNode {
    return new (this.constructor as any)(this);
  }
}
