import { defineComponent, PropType } from 'vue';
import { useNamespace } from '@gct/runtime';
import { ITimedTaskItem } from '../../interface';
import { TimedTaskAction } from '../../constant';
import './search-form.scss';

export const SearchForm = defineComponent({
  props: {
    items: {
      type: Array as PropType<ITimedTaskItem[]>,
      default: () => [],
    },
  },
  emits: ['action'],
  setup(_props, { emit }) {
    const ns = useNamespace('timed-task-search-form');

    const onClick = (e: MouseEvent, type: string, item: ITimedTaskItem) => {
      e.stopPropagation();
      emit('action', type, item);
    };

    return { ns, onClick };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        {this.items.map((item) => {
          return (
            <a-card class={this.ns.b('item')}>
              <div class={this.ns.be('item', 'info-form')}>
                <div class={this.ns.be('item', 'info-form-trigger-type')}>触发类型：单次触发</div>
                <div class={this.ns.be('item', 'info-form-trigger-mode')}>触发方式：服务编排</div>
                <div class={this.ns.be('item', 'info-form-service-script')}>服务脚本：脚本</div>
              </div>
              <div class={this.ns.be('item', 'more-action')}>
                <a-dropdown trigger={['click']}>
                  {{
                    default: () => <a class="ant-dropdown-link">更多操作</a>,
                    overlay: () => (
                      <a-menu>
                        <a-menu-item
                          key={0}
                          onClick={(e: MouseEvent) => this.onClick(e, TimedTaskAction.EDIT, item)}
                        >
                          编辑
                        </a-menu-item>
                        <a-menu-item
                          key={1}
                          onClick={(e: MouseEvent) =>
                            this.onClick(e, TimedTaskAction.MANUAL_EXECUTION, item)
                          }
                        >
                          手动触发
                        </a-menu-item>
                        <a-menu-item
                          key={2}
                          onClick={(e: MouseEvent) => this.onClick(e, TimedTaskAction.ENABLE, item)}
                        >
                          启用
                        </a-menu-item>
                        <a-menu-item
                          key={3}
                          onClick={(e: MouseEvent) =>
                            this.onClick(e, TimedTaskAction.DISABLE, item)
                          }
                        >
                          禁用
                        </a-menu-item>
                        <a-menu-item
                          key={4}
                          onClick={(e: MouseEvent) => this.onClick(e, TimedTaskAction.DELETE, item)}
                        >
                          删除
                        </a-menu-item>
                      </a-menu>
                    ),
                  }}
                </a-dropdown>
              </div>
            </a-card>
          );
        })}
      </div>
    );
  },
});

export default SearchForm;
