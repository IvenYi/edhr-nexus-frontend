import { computed, defineComponent, reactive, toRefs, WritableComputedRef, PropType } from 'vue';
import { useNamespace } from '@gct/runtime';
import { useI18n } from 'vue-i18n';
import { props } from '/@page-designer/hooks/usePropEditor';
import { buttonShowType } from '/@page-designer/enum';
import { ButtonItem } from './button-item/button-item';
import { ButtonConfig } from './interface';
import { openButtonModal } from '../gct-table-add-button-editor/gct-table-add-button-editor';
import { cloneDeep } from 'lodash-es';
import './gct-table-button-list-editor.scss';

export const GctTableButtonListEditor = defineComponent({
  // eslint-disable-next-line vue/component-definition-name-casing
  name: 'gct-table-button-list-editor',
  props: {
    ...props,
    hiddenHeader: {
      type: Boolean,
      required: false,
    },
    hiddenTitle: {
      type: Boolean,
      required: false,
    },
    showBorder: {
      type: Boolean,
      required: false,
    },
    single: {
      type: Boolean,
      default: false,
    },
    map: {
      type: Object as PropType<Map<string, WritableComputedRef<any>>>,
      required: true,
    },
    propValue: {
      type: Object as PropType<WritableComputedRef<any>>,
      required: true,
    },
  },
  setup(defProps) {
    const { t } = useI18n() as any;
    const ns = useNamespace('table-button-list-editor');

    const map: Map<string, WritableComputedRef<any>> = defProps.map;

    const propConfig = reactive<ButtonConfig>(defProps.propConfig as ButtonConfig);
    const { propValue } = defProps;

    const { children } = toRefs(propValue.value);

    const options = [
      {
        label: '1',
        value: 1,
      },
      {
        label: '2',
        value: 2,
      },
      {
        label: '3',
        value: 3,
      },
      {
        label: '4',
        value: 4,
      },
      {
        label: '5',
        value: 5,
      },
    ];

    if (!children.value) {
      children.value = [];
    }

    const items = computed<IData[]>(() => {
      return children.value;
    });

    const types = [buttonShowType.FOLD_ALL, buttonShowType.FOLD_PART];

    let oldButtons = 1;

    const showMode = computed({
      get() {
        const num = propValue.value!.props?.visibleButtons ?? propConfig.defaultMaxCount ?? 1;
        return num === 0 ? buttonShowType.FOLD_ALL : buttonShowType.FOLD_PART;
      },
      set(val) {
        if (buttonShowType.FOLD_PART === val) {
          propValue.value!.props.visibleButtons =
            visibleButtons.value === 0 ? oldButtons : visibleButtons.value;
        } else {
          oldButtons = visibleButtons.value;
          propValue.value!.props.visibleButtons = 0;
        }
      },
    });

    const visibleButtons = computed({
      get() {
        const num = propValue.value!.props?.visibleButtons ?? propConfig.defaultMaxCount ?? 1;
        return num;
      },
      set(val) {
        propValue.value!.props.visibleButtons = Math.floor(val);
      },
    });

    const moveCard = (dragIndex: number, dropIndex: number, mode: 'before' | 'after') => {
      const item = children.value[dragIndex];
      if (dragIndex > dropIndex) {
        children.value.splice(dragIndex, 1);
      }
      if (mode === 'before') {
        children.value.splice(dropIndex, 0, item);
      } else {
        children.value.splice(dropIndex + 1, 0, item);
      }
      if (dragIndex < dropIndex) {
        children.value.splice(dragIndex, 1);
      }
    };

    const onEdit = async (i: number) => {
      const data = children.value[i];
      // 表格按钮位置
      const oldPos = data.props.pos;
      const oldVersionMode = data.props.versionMode;
      const res = await openButtonModal(
        {
          title: t('sys.pageDesigner.editButton'),
          model: data.props.model,
          cmpId: propValue.value.cmpId,
          options: propConfig.options,
        },
        defProps.widget!,
        data,
        propConfig,
      );
      if (res.ok && res.data) {
        const item = res.data[0];
        const newPos = item.pos;
        const newVersionMode = item.versionMode;
        if (
          (oldPos != null && oldPos !== newPos) ||
          (oldVersionMode != null && oldVersionMode !== newVersionMode)
        ) {
          const newData = cloneDeep(data);
          onDel(i);
          if (propConfig.calcPosTag) {
            const key = propConfig.calcPosTag(newData.props);
            const btn = map.get(key);
            if (btn) {
              const idx = btn.value.children.findIndex((e) => e.id === newData.props.id);
              if (idx > -1) {
                btn.value.children.splice(idx, 1, newData);
              } else {
                btn.value.children.push(newData);
              }
            }
          }
        }
      }
    };

    const onDel = (i: number) => {
      children.value.splice(i, 1);
    };

    return {
      t,
      ns,
      propConfig,
      items,
      types,
      showMode,
      visibleButtons,
      options,
      moveCard,
      onEdit,
      onDel,
    };
  },
  render() {
    return (
      <div
        class={[this.ns.b(), this.ns.is('show-border', this.showBorder && this.single === false)]}
      >
        {this.hiddenHeader === false ? (
          <div class={[this.ns.b('header'), this.ns.is('single', this.single)]}>
            {this.hiddenTitle === false && (this.propConfig.title || this.propConfig.subTitle) ? (
              <div class={this.ns.be('header', 'label')}>
                {this.propConfig.title ? <span>{this.t(this.propConfig.title)}</span> : null}
                {this.propConfig.subTitle ? <span>{this.t(this.propConfig.subTitle)}</span> : null}
              </div>
            ) : null}
            {this.propConfig.max ? (
              <div class={this.ns.be('header', 'input')}>
                <a-input-group compact>
                  <a-select
                    v-model:value={this.showMode}
                    size="small"
                    style={`width: ${
                      this.showMode === buttonShowType.FOLD_ALL ? '100%' : '120px'
                    };`}
                  >
                    {this.types.map((e) => {
                      return (
                        <a-select-option key={e} value={e}>
                          {this.t('sys.pageDesigner.' + e)}
                        </a-select-option>
                      );
                    })}
                  </a-select>
                  {this.showMode === buttonShowType.FOLD_PART ? (
                    <a-auto-complete options={this.options} v-model:value={this.visibleButtons}>
                      {{
                        default: () => (
                          <a-input-number
                            v-model:value={this.visibleButtons}
                            size="small"
                            min={1}
                            max={this.propConfig.max}
                            precision={0}
                            controls={true}
                            style={{ width: '68px !important' }}
                          />
                        ),
                      }}
                    </a-auto-complete>
                  ) : null}
                </a-input-group>
                <span>个</span>
              </div>
            ) : null}
            {this.propConfig.desc ? (
              <div class={this.ns.be('header', 'desc')}>
                {this.propConfig.max && this.showMode !== buttonShowType.FOLD_ALL
                  ? this.t('_kit.pageDesigner.rdoTableButtonAddDesc', { max: this.propConfig.max })
                  : this.t('_kit.pageDesigner.rdoTableButtonDesc')}
              </div>
            ) : null}
          </div>
        ) : null}
        <div class={this.ns.b('content')}>
          {this.items.map((item, i) => {
            return (
              <ButtonItem
                type={this.propConfig.type!}
                index={i}
                data={item.props}
                moveCard={this.moveCard}
                onEdit={() => this.onEdit(i)}
                onDelete={() => this.onDel(i)}
              />
            );
          })}
        </div>
      </div>
    );
  },
});

export default GctTableButtonListEditor;
