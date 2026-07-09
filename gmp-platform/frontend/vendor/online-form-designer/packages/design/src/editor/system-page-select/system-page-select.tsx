import { defineComponent } from 'vue';
import { IFormItem, useGctFormValue, useNamespace } from '@gct/runtime';
import { ISystemPageSelectModel } from './i-system-page-select';
import './system-page-select.scss';

export const SystemPageSelect = defineComponent({
  name: 'SystemPageSelect',
  props: {
    itemModel: {
      type: Object as PropType<IFormItem>,
      required: true,
    },
    model: {
      type: Object as PropType<ISystemPageSelectModel>,
      required: true,
    },
    value: {
      type: String,
    },
  },
  setup() {
    const ns = useNamespace('system-page-select');

    const val = useGctFormValue();

    const menus = [
      {
        label: '消息首页',
        title: '消息',
        value: 'message',
        icon: 'icon-yidongduan-xiaoxi',
      },
      {
        label: '工作台首页',
        title: '工作台',
        value: 'workbench',
        icon: 'icon-yidongduan-gongzuotai',
      },
      {
        label: '个人中心首页',
        title: '我的',
        value: 'personalCenter',
        icon: 'icon-yidongduan-wode',
      },
      {
        label: '审批首页',
        title: '审批',
        value: 'todo',
        icon: 'icon-daiban',
      },
    ];

    const onActive = (e: MouseEvent, value: string) => {
      e.stopPropagation();
      val.value = value;
    };

    return { ns, val, menus, onActive };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        {this.menus.map((_) => {
          const isActive = _.value === this.val;
          return (
            <div class={this.ns.e('item')} onClick={(e) => this.onActive(e, _.value)}>
              <div class={[this.ns.b('menu'), this.ns.is('active', isActive)]}>
                <div class={this.ns.be('menu', 'select-icon')}>
                  <i class={`iconfont ${isActive ? 'icon-Successful' : ''}`} />
                </div>
                <div class={this.ns.be('menu', 'icon')}>
                  <i class={`iconfont ${_.icon}`} />
                </div>
                <div class={this.ns.be('menu', 'label')}>{_.label}</div>
              </div>
              <div class={this.ns.e('title')}>{_.title}</div>
            </div>
          );
        })}
      </div>
    );
  },
});
