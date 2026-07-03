import { h } from 'vue';
import { EditFormController, IFormContainer, IFormEditItem, IFormItemBasic } from '@gct/runtime';
import { IDesignNode } from '@gct/base';
import { message } from 'ant-design-vue';
import AsyncValidator from 'async-validator';
import { IDesignViewController } from '../../interface';
import { NodeRegister } from '../../register';
import { useDesignViewStore } from '../../store';
import { DesignViewHooks } from '../../hooks/designer.hooks';
import { isFunction } from 'lodash-es';

/**
 * 设计界面控制器
 *
 * @author zhanghanrui
 * @date 2024-07-05 14:07:35
 * @export
 * @class DesignViewController
 * @implements {IDesignViewController}
 */
export class DesignViewController implements IDesignViewController {
  readonly store = useDesignViewStore();

  readonly hooks = new DesignViewHooks();

  protected expansionTimer: number | null = null;

  protected findModelPaths(
    paths: IFormItemBasic[],
    items: IFormItemBasic[],
    model: IFormItemBasic,
  ): IFormItemBasic[] | null {
    const i = items.findIndex((item) => {
      const container = item as IFormContainer;
      if (container.children) {
        const result = this.findModelPaths(paths, container.children, model);
        if (result !== null) {
          paths.push(item);
          return true;
        }
        return false;
      }
      const _ = item as IFormEditItem;
      if (_.name === model.name) {
        return true;
      }
      return false;
    });
    if (i !== -1) {
      return paths;
    }
    return null;
  }

  /**
   * 效验整个设计页面的表单数据
   *
   * @author zhanghanrui
   * @date 2024-08-04 14:08:35
   * @return {*}  {Promise<boolean>}
   */
  async validate(): Promise<boolean> {
    const data = this.store.getData();
    for (let i = 0; i < data.nodes.length; i++) {
      const node = data.nodes[i];
      const provider = NodeRegister.get(node.type, this.store.prefix);
      if (provider) {
        const model = provider.model;
        if (model) {
          const formC = new EditFormController(isFunction(model) ? model({}, node) : model);
          Object.assign(formC.state.data, node.data);
          formC.loaded();
          formC.validate = async () => {
            const rules: IData = {};
            const keys = Object.keys(formC.item);
            for (let i = 0; i < keys.length; i++) {
              const key = keys[i];
              const item = formC.item[key];
              if (item.type === 'item' && (item.model as IFormEditItem).rules) {
                rules[key] = (item.model as IFormEditItem).rules;
              }
            }
            if (rules && Object.keys(rules).length > 0) {
              const validator = new AsyncValidator(rules);
              validator.validate(formC.state.data);
              return new Promise((resolve) => {
                validator.validate(formC.state.data, (errors, _fields) => {
                  if (errors && errors.length > 0) {
                    const err = errors[0];
                    const { field } = err;
                    const c = formC.item[field!];
                    const pathModels = this.findModelPaths([], formC.model.children, c.model)
                      ?.filter((_: any) => {
                        return _.title;
                      })
                      .reverse();
                    console.log('pathModels', pathModels);
                    message.warn(
                      h('span', {}, [
                        h('span', {}, [
                          `【${c.data.name}】组件 - 【${
                            pathModels ? pathModels.map((_: any) => `${_.title} - `).join('') : null
                          }${(c.model as IFormEditItem).label}】必填`,
                          // h(
                          //   'a',
                          //   {
                          //     href: 'javascript:void(0);',
                          //     style: {
                          //       'margin-left': '5px',
                          //     },
                          //     onClick: () => {
                          //       this.store.setActive(node);
                          //     },
                          //   },
                          //   ['查看'],
                          // ),
                        ]),
                      ]),
                    );
                    resolve(false);
                  } else {
                    resolve(true);
                  }
                });
              });
            }
            return true;
          };
          const bol = await formC.validate();
          if (bol !== true) {
            return false;
          }
        }
      }
    }
    return true;
  }

  /**
   * 设置展开节点
   *
   * @param {string[]} ids 只指定自身需要额外设置的节点，默认会根据当前往上取3层展开
   * @returns {*}  {void}
   */
  setExpansion(ids: string[]): void {
    if (this.store.isDragging !== true) {
      return;
    }
    if (this.expansionTimer) {
      clearTimeout(this.expansionTimer);
      this.expansionTimer = null;
    }
    this.expansionTimer = setTimeout(() => {
      ids.forEach((id) => {
        this.store.expansions.add(id);
      });
      const keys = this.hooks.expansion.callSync([]);
      // 暂时只取最后3层展开
      keys.slice(keys.length - 3).forEach((id) => {
        this.store.expansions.add(id);
      });
      this.store.countAdd();
    }, 2000) as unknown as number;
  }

  /**
   * 取消展开容器
   */
  cancelExpansion(): void {
    if (this.expansionTimer) {
      clearTimeout(this.expansionTimer);
      this.expansionTimer = null;
    }
    this.store.expansions.clear();
    this.store.countAdd();
  }

  /**
   * 当前节点左右子节点类型
   *
   * @param {IDesignNode} node
   * @returns {*}  {string[]}
   */
  types(node: IDesignNode): string[] {
    const items = this.store.getChildren(node);
    const types: string[] = [];
    items.forEach((item) => {
      types.push(item.type);
      types.push(...this.types(item));
    });
    return types;
  }

  mounted(): void {
    // 组件挂载
  }

  unmounted(): void {
    this.store.history.clearAll();
    this.store.$reset();
  }

  dropEnd(): void {
    this.cancelExpansion();
    this.store.dropContainer = null;
  }
}
