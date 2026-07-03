import { WritableComputedRef, defineComponent, reactive, ref } from 'vue';
import {
  EntityModelCategoryEnum,
  IModalData,
  Platform,
  operateSysEnums,
  useNamespace,
  FormComponents,
} from '@gct/runtime';
import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
import AddButtonModal from '../../modals/gct-add-button-modal.vue';
import { PageTypeEnum } from '/@/layouts/tree-sider-page/enum';
import { BaseButton } from '../gct-table-button-list-editor/interface';
import { useI18n } from 'vue-i18n';
import './gct-table-add-button-editor.scss';

export async function openButtonModal(
  data: IData,
  widget: IData,
  button: IData,
  config: IData,
): Promise<IModalData> {
  const moduleType: string =
    widget.platform === Platform.MOBILE ? PageTypeEnum.MOBILE : PageTypeEnum.WEB;

  const platFormType: Platform =
    moduleType === PageTypeEnum.MOBILE ? Platform.MOBILE : Platform.WEB;

  const sysMethodData = (() => {
    if (!config.options) {
      const arr: string[] = [];
      const { props } = widget;
      arr.push(operateSysEnums.COLUMNLINK);
      if (
        !props ||
        !props.modeldata ||
        props.modeldata.modelCategory !== EntityModelCategoryEnum.VIEW
      ) {
        arr.push(operateSysEnums.COLUMNDELETE);
      }
      return arr;
    } else if (typeof config.options === 'function') {
      return config.options(widget);
    }
    return config.options;
  })();
  const res = await gct.openUtil.modal(
    AddButtonModal,
    {
      model: data.model || widget.props.model,
      id: widget.id,
      module: moduleType,
      sysMethodData,
      compType: widget!.type,
      data: button.props,
      modeldata: widget.props.modeldata || {},
      type: widget.type,
      buttonType: button.type,
      isTree: config.isTree === true ? true : false,
      isNew: data.isNew,
    },
    {
      title: data.title,
      width: 740,
      okText: (window as any).$t('sys.pageDesigner.savebutton'),
    },
  );
  if (res.ok && res.data) {
    const form = res.data[0];
    if (form) {
      const b = button;
      b.platform = platFormType;
      b.props = { ...form };
      b.alias = form.title;
      b.props.model = widget.props.model ?? data.model;
      b.props.displayType = undefined;
      b.props.displayRule = undefined;
      b.events = form.events;
      b.props.refTable = widget.id;
      b.props.modeldata = widget.props.modeldata;
      b.props.componentDependency = { configDependency: form.configDependency };
      b.props.excludeField = form.excludeField;
      if (form.innerEvent && b.props.sysMethedType === operateSysEnums.EXPORT) {
        b.type = FormComponents.ExportButton;
      }
      if (form.innerEvent && b.props.sysMethedType === operateSysEnums.IMPORT) {
        b.type = FormComponents.ImportButton;
      }
      if (form.innerEvent && b.props.sysMethedType === operateSysEnums.BATCHDELETE) {
        b.type = FormComponents.BatchDeleteButton;
      }
    }
  }
  return res;
}

export const GctTableAddButtonEditor = defineComponent({
  // eslint-disable-next-line vue/component-definition-name-casing
  name: 'gct-table-add-button-editor',
  props,
  setup(defProps) {
    const { t } = useI18n() as any;

    const map: Map<string, WritableComputedRef<any>> = new Map();

    const ns = useNamespace('table-add-button-editor');

    const buttonComp = ref<BaseButton>();

    const propConfig = reactive<IData>(defProps.propConfig);

    // 按钮组各个按钮的位置
    const keys = Object.keys((defProps.propName as IData).list);

    const setProp = (key: string, tag: string) => {
      const propEditor = usePropEditor(tag, defProps.changeCallback);
      if (!propEditor.propValue.value) {
        propEditor.propValue.value = {
          children: [],
        };
      }
      map.set(key, propEditor.propValue);
    };

    keys.forEach((key) => {
      const val = (defProps.propName as IData).list[key];
      if (val instanceof Array) {
        val.forEach((item, i) => setProp(`${key}.${i}`, item));
      } else {
        setProp(key, val);
      }
    });

    async function addButton() {
      buttonComp.value = propConfig.createField!();
      const b = buttonComp.value!;
      const { modeldata, props } = defProps.widget as any;
      if (!modeldata) {
        Object.assign(b.props, {
          id: b.id,
          modeldata,
          ...(propConfig.defaultButtonType || {}),
        });
      }
      const res = await openButtonModal(
        {
          title: t('sys.pageDesigner.addButton'),
          model: props.model,
          cmpId: (defProps.propName as IData).cmpId,
          isNew: true,
        },
        defProps.widget!,
        b,
        propConfig,
      );
      if (res.ok && b) {
        if (propConfig.calcPosTag) {
          const key = propConfig.calcPosTag(b.props);
          const btn = map.get(key);
          if (btn) {
            const idx = btn.value.children.findIndex((e) => e.id === b.props.id);
            if (idx > -1) {
              btn.value.children.splice(idx, 1, b);
            } else {
              btn.value.children.push(b);
            }
          }
        }
      }
    }

    return { t, ns, map, addButton };
  },
  render() {
    return [
      <div class={this.ns.b()}>
        <a-button type="primary" ghost block onClick={this.addButton}>
          {this.t('sys.pageDesigner.addButton')}
        </a-button>
      </div>,
    ];
  },
});

export default GctTableAddButtonEditor;
