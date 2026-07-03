import { useNamespace } from '@gct/runtime';
import { SlotsType, computed, defineComponent, ref, renderSlot, watch } from 'vue';
import { useI18n } from '/@/hooks/web/useI18n';
import { ITreeJsonParam } from '../types';
import { AuthKeyTypeEnum } from '/@ipaas/enums';
import './json-param-tree.scss';

export const JsonParamTree = defineComponent({
  name: 'JsonParamTree',
  props: {
    value: {
      type: Object as PropType<ITreeJsonParam>,
      required: true,
    },
  },
  emits: {
    'update:value': (_value: ITreeJsonParam) => true,
  },
  slots: Object as SlotsType<{
    default: { param: ITreeJsonParam; level: number; index?: number; parent?: ITreeJsonParam };
  }>,
  setup(props, { slots, emit }) {
    const ns = useNamespace('json-param-tree');
    const { t } = useI18n() as any;

    const renderContent = (opts: {
      param: ITreeJsonParam;
      level: number;
      index?: number;
      parent?: ITreeJsonParam;
    }) => {
      const { param, level, parent, index } = opts;
      let children: any = null;
      // 绘制子节点
      if ([AuthKeyTypeEnum.Object, AuthKeyTypeEnum.Array].includes(param.type) && param.children) {
        children = param.children.map((item, index) => {
          return renderContent({ param: item, level: level + 1, index, parent: param });
        });
      }

      return [
        <div class={[ns.e('node')]}>
          {renderSlot(slots, 'default', { param, level, index, parent })}
        </div>,
        !param.collapse && <div class={[ns.e('node-children')]}>{children}</div>,
      ];
    };

    return { ns, t, renderContent };
  },
  render() {
    return (
      <div class={[this.ns.b()]}>
        {this.renderContent({
          param: this.value,
          level: 0,
        })}
      </div>
    );
  },
});

export default JsonParamTree;
