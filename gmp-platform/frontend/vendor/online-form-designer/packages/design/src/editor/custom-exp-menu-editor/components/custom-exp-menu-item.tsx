import { defineComponent } from 'vue';
import { useNamespace } from '@gct/runtime';
import { IMobileHomeMenuItem } from '@gct/base';
import './custom-exp-menu-item.scss';

export const CustomExpMenuItem = defineComponent({
  name: 'CustomExpMenuItem',
  props: {
    // 是否允许控制隐藏和显示
    isHidden: {
      type: Boolean,
      default: true,
    },
    data: {
      type: Object as PropType<IMobileHomeMenuItem>,
      required: true,
    },
  },
  emits: ['home', 'remove', 'edit', 'hidden', 'show'],
  setup(props, { emit }) {
    const t = window.$t;
    const ns = useNamespace('custom-exp-menu-item');

    const onDelete = (e: MouseEvent) => {
      e.stopPropagation();
      emit('remove', props.data);
    };

    const onHome = (e: MouseEvent) => {
      e.stopPropagation();
      if (props.data.isHome !== true) {
        emit('home', props.data);
      }
    };

    const onEdit = (e: MouseEvent) => {
      e.stopPropagation();
      emit('edit', props.data);
    };

    const onHidden = (e: MouseEvent) => {
      e.stopPropagation();
      if (props.data.isHidden !== true) {
        emit('hidden', props.data);
      } else {
        emit('show', props.data);
      }
    };

    return { t, ns, onDelete, onHome, onEdit, onHidden };
  },
  render() {
    let icon: any = null;
    if (this.data.icon) {
      icon = this.data.icon.icon.startsWith('iconfont:') ? (
        <i class={`iconfont ${this.data.icon.icon.replace('iconfont:', '')}`} />
      ) : (
        <icon-next value={this.data.icon.icon} color={this.data.icon.color} size={16} />
      );
    }
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('drag')} title={this.t('sys.developer.designView.dragSort')}>
          <i class="iconfont icon-drag" />
        </div>
        <div class={this.ns.e('icon')}>{icon}</div>
        <div class={this.ns.e('label')}>{this.data.label}</div>
        <div class={this.ns.e('actions')}>
          {this.data.isSystem ? null : (
            <div class={[this.ns.e('action-item'), this.ns.em('action-item', 'delete')]}>
              <a-tooltip placement="top">
                {{
                  default: () => (
                    <a-popconfirm
                      title={this.t('sys.confirmExecution')}
                      ok-text={this.t('sys.okText')}
                      cancel-text={this.t('sys.cancelText')}
                      onConfirm={this.onDelete}
                    >
                      <i class="iconfont icon-shanchu" />
                    </a-popconfirm>
                  ),
                  title: () => {
                    return <span>{this.t('sys.delete')}</span>;
                  },
                }}
              </a-tooltip>
            </div>
          )}
          <div
            class={[this.ns.e('action-item'), this.ns.em('action-item', 'edit')]}
            title={this.t('sys.edit')}
            onClick={this.onEdit}
          >
            <a-tooltip placement="top">
              {{
                default: () => <i class="iconfont icon-bianji" />,
                title: () => {
                  return <span>{this.t('sys.edit')}</span>;
                },
              }}
            </a-tooltip>
          </div>
          <div
            class={[
              this.ns.e('action-item'),
              this.ns.em('action-item', 'home'),
              this.ns.is('active', this.data.isHome),
            ]}
            onClick={this.onHome}
          >
            <a-tooltip placement="topRight" arrowPointAtCenter>
              {{
                default: () => <i class="iconfont icon-zidingyi-zhuanqu" />,
                title: () => {
                  return (
                    <span>
                      {this.data.isHome
                        ? this.t('sys.developer.designView.info')
                        : this.t('sys.developer.designView.info2')}
                    </span>
                  );
                },
              }}
            </a-tooltip>
          </div>
          <div
            v-show={this.isHidden}
            class={[this.ns.e('action-item'), this.ns.em('action-item', 'hidden')]}
            onClick={this.onHidden}
          >
            <a-tooltip placement="top">
              {{
                default: () => (
                  <i class={`iconfont ${this.data.isHidden ? 'icon-baomi' : 'icon-chakan1'}`} />
                ),
                title: () => {
                  return (
                    <span>
                      {this.data.isHidden
                        ? this.t('sys.developer.designView.show')
                        : this.t('sys.developer.designView.hidden')}
                    </span>
                  );
                },
              }}
            </a-tooltip>
          </div>
        </div>
      </div>
    );
  },
});
