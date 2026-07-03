import { computed, defineComponent, nextTick, PropType } from 'vue';
import { IFormEditItemController, useForm, useNamespace } from '@gct/runtime';
import { useI18n } from 'vue-i18n';
import { IDesignNode } from '@gct/base';
import { useDesignViewController } from '../../hooks';
import { IChildListEditor } from '../../interface';
import { NodeRegister } from '../../register';
import { ChildListItemEditor } from './components/child-list-item-editor';
import './child-list-editor.scss';

export const ChildListEditor = defineComponent({
  name: 'ChildListEditor',
  components: {
    ChildListItemEditor,
  },
  props: {
    data: {
      type: Object as PropType<IData>,
      required: true,
    },
    model: {
      type: Object as PropType<IChildListEditor>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('child-list-editor');

    const { t } = useI18n() as any;

    const form = useForm();

    const designView = useDesignViewController();

    const p = NodeRegister.get(props.model.childDesignType, designView.store.prefix);

    const items = computed<IDesignNode[]>(() => {
      if (designView.store.selected) {
        const list = designView.store.getChildren(designView.store.selected.id);
        return list;
      }
      return [];
    });

    const create = async () => {
      if (p && designView.store.selected) {
        const data = await p.create();
        data.data.name = `${data.data.name}${items.value.length + 1}`;
        designView.store.setNode(designView.store.selected.id, data);
      }
    };

    const onAdd = (e: MouseEvent) => {
      e.stopPropagation();
      create();
    };

    const defaultSelectC = form.item[
      props.model.defaultSelectChildKey || 'defaultKey'
    ] as IFormEditItemController;

    const init = () => {
      if (items.value && items.value.length === 0) {
        nextTick(() => {
          if (defaultSelectC && items.value.length > 0) {
            defaultSelectC.value = items.value[0].id;
          }
        });
      }
    };

    const checkVal = computed(() => {
      if (defaultSelectC) {
        return defaultSelectC.value;
      }
      return '';
    });

    const onCheckChange = (id: string) => {
      defaultSelectC.value = id;
    };

    const onDelete = (id: string) => {
      designView.store.deleteNode(id);
    };

    const moveCard = (dragIndex: number, dropIndex: number) => {
      const item = items.value[dragIndex];
      designView.store.setNode(props.data.id, item, dropIndex);
    };

    init();

    return { ns, designView, p, t, items, checkVal, moveCard, onAdd, onCheckChange, onDelete };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('header')}>
          <div class={this.ns.e('title')}>{this.model.title}</div>
          <div class={this.ns.e('add')}>
            {this.model.add !== false ? (
              <a-button type="link" size="small" onClick={this.onAdd}>
                {this.t('sys.add')}
              </a-button>
            ) : null}
          </div>
        </div>
        <div class={this.ns.e('content')}>
          {this.items.map((item, i) => {
            return (
              <child-list-item-editor
                count={this.items.length}
                index={i}
                node={item}
                v-model:value={item.data[this.model.childEditFieldKey || 'name']}
                fieldKey={this.model.childEditFieldKey}
                showLabel={this.model.showLabel}
                drag={this.model.sort}
                check={this.model.select}
                delete={this.model.delete}
                editorType={this.model.editorType}
                editorProps={this.model.editorProps}
                checked={this.checkVal === item.id}
                onCheck={() => this.onCheckChange(item.id)}
                onDelete={() => this.onDelete(item.id)}
                moveCard={this.moveCard}
              />
            );
          })}
        </div>
      </div>
    );
  },
});
