import { defineComponent, nextTick, onMounted, onUnmounted } from 'vue';
import { useNamespace } from '@gct/runtime';
import { useI18n } from 'vue-i18n';
import { uuid } from '@jsplumb/browser-ui';
import { IRelationshipDiagramLink } from '../../interface';
import { LinkType } from '../../constant';
import { useRootController } from '../../hooks';
import './diagram-config-item-virtual.scss';

/**
 * 最后一个虚拟节点
 */
export const DiagramConfigItemVirtual = defineComponent({
  name: 'DiagramConfigItemVirtual',
  props: {
    i: {
      type: Number,
      required: true,
    },
    beforeNodeId: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n() as any;
    const ns = useNamespace('diagram-config-item-virtual');

    const c = useRootController();

    const link: IRelationshipDiagramLink = {
      id: uuid(),
      i: props.i - 1,
      source: props.beforeNodeId,
      target: props.id,
      type: LinkType.VIRTUAL,
      return: props.i % c.config.lineCount === 0,
      startLine: Math.floor((props.i - 1) / 3) + 1,
    };

    onMounted(() => {
      nextTick(() => {
        c.connect(link);
      });
    });

    onUnmounted(() => {
      c.disconnect(link);
    });

    return { t, ns };
  },
  render() {
    return <div class={this.ns.b()}></div>;
  },
});
