import { computed, defineComponent, ref, watch } from 'vue';
import { useNamespace } from '@gct/runtime';
import { IDesignNode } from '@gct/base';
import { useDesignViewController } from '../../../hooks';
import { MaterialRegister } from '../../../register';
import './material-outline-tree.scss';

type TreeNode = {
  key: string;
  title: string;
  icon: any;
  children: TreeNode[];
};

export const MaterialOutlineTree = defineComponent({
  name: 'MaterialOutlineTree',
  setup() {
    const ns = useNamespace('material-outline-tree');

    const treeRef = ref();

    const selectedKeys = ref<string[]>([]);

    const c = useDesignViewController();

    watch(
      () => c.store.selected,
      () => {
        if (c.store.selected) {
          selectedKeys.value = [c.store.selected.id];
        } else {
          selectedKeys.value = [];
        }
      },
    );

    watch(selectedKeys, () => {
      const val = selectedKeys.value[0];
      if (val) {
        const node = c.store.getNode(val);
        if (node && node.id !== c.store.selected?.id) {
          c.store.setActive(node);
        }
      } else {
        c.store.setActive(null);
      }
    });

    const calcDeepTree = (items: IDesignNode[]): TreeNode[] => {
      const arr: TreeNode[] = [];
      items.forEach((_) => {
        const p = MaterialRegister.getMaterial(_.type, c.store.prefix);
        const node: TreeNode = {
          key: _.id,
          title: _.label,
          icon: p && p.icon ? <i class={`iconfont ${p.icon}`} /> : '',
          children: [],
        };
        const children = c.store.getChildren(_.id);
        if (children && children.length > 0) {
          node.children = calcDeepTree(children);
        }
        arr.push(node);
      });
      return arr;
    };

    const treeData = computed<TreeNode[]>(() => {
      const items = c.store.getChildren();
      return calcDeepTree(items);
    });

    return { ns, treeRef, selectedKeys, treeData };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <a-tree
          ref="treeRef"
          class={this.ns.e('tree')}
          v-model:selectedKeys={this.selectedKeys}
          treeData={this.treeData}
          blockNode
          show-icon
          autoExpandParent
          default-expand-all
        />
      </div>
    );
  },
});
