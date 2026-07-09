import { defineComponent, h, ref, resolveComponent } from 'vue';
import { useNamespace } from '@gct/runtime';
import { MaterialTabs } from '../material-tabs/material-tabs';
import { MaterialTabPane } from '../material-tab-pane/material-tab-pane';
import { MaterialOutlineTree } from '../material-outline-tree/material-outline-tree';
import { MaterialModule } from '../material-module/material-module';
import './material-content.scss';

export const MaterialContent = defineComponent({
  name: 'MaterialContent',
  components: {
    MaterialTabs,
    MaterialTabPane,
    MaterialOutlineTree,
    MaterialModule,
  },
  setup() {
    const ns = useNamespace('material-content');

    const tabs = [
      {
        id: 'outline-tree',
        icon: 'icon-RDOliebiao',
        label: '大纲',
        title: '大纲',
        component: 'MaterialOutlineTree',
      },
      {
        id: 'component',
        icon: 'icon-zujian',
        label: '组件',
        title: '页面组件',
        default: true,
        component: 'MaterialModule',
      },
    ];

    const active = ref<string>(tabs.find((_) => _.default)!.id);

    return { ns, tabs, active };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <material-tabs tabs={this.tabs} v-model:active={this.active}>
          {{
            default: () =>
              this.tabs.map((tab) => {
                return (
                  <MaterialTabPane key={tab.id} tabTag={tab.id}>
                    <div class={this.ns.b('header')}>
                      <span>{tab.title}</span>
                      {/* <span>{<i class="iconfont icon-zhankaiqiehuanyingyong" />}</span> */}
                    </div>
                    <div class={this.ns.b('content')}>{h(resolveComponent(tab.component))}</div>
                  </MaterialTabPane>
                );
              }),
          }}
        </material-tabs>
      </div>
    );
  },
});
