import { Component, computed, defineComponent, h, ref, resolveComponent } from 'vue';
import { useNamespace } from '@gct-paas/core';
import {
  IModelFieldNodeData,
  INodeProvider,
  NodeRegister,
  nodeProps as props,
  useDesignViewController,
} from '@gct/runtime-design';
import { FIELD_TYPE, modelLoader, nullDisplayEnum, transformField2Component } from '@gct/runtime';
import { isString } from 'lodash-es';
import { formatFieldValue as formatFieldValueUtil } from '@gct/base';
import { ICardDesignPageNodeData } from '../../../interface';
import { CARD_LABEL_WIDTH_MODE, CARD_LABEL_WRAP_MODE, CARD_LAYOUT_MODE } from '../../../enum';
import './card-field-design.scss';

export const CardFieldDesign = defineComponent({
  name: 'CardFieldDesign',
  props,
  setup(props) {
    const t = (window as any).$t;
    const ns = useNamespace('card-field-design');
    // 设计界面控制器
    const c = useDesignViewController();
    // 卡片界面配置数据
    const pageData = computed<ICardDesignPageNodeData | null>(() => {
      return (c.store.pageNode?.data as unknown as ICardDesignPageNodeData) || null;
    });
    // 获取节点数据
    const nodeData = computed<IModelFieldNodeData>(() => {
      return (props.data?.data as IModelFieldNodeData) || {};
    });
    const fieldProvider = computed<INodeProvider | null>(() => {
      return NodeRegister.getDesignEditorNode(nodeData.value.type as FIELD_TYPE);
    });
    const fieldCom = computed<Component | null>(() => {
      if (fieldProvider.value && fieldProvider.value.component) {
        if (typeof fieldProvider.value.component === 'string') {
          return resolveComponent(fieldProvider.value.component) as Component;
        }
        return fieldProvider.value.component as Component;
      }
      return null;
    });
    // 字段项的布局模式
    const layout = computed(() => {
      return pageData.value?.layout_mode || CARD_LAYOUT_MODE.HORIZONTAL;
    });
    // 标签是否换行
    const labelWrap = computed(() => {
      return pageData.value?.wrap_mode === CARD_LABEL_WRAP_MODE.WRAP;
    });
    // 标签样式
    const labelStyle = computed(() => {
      const style: IObject = {};
      if (pageData.value?.custom_label_width) {
        style.width = `${pageData.value.label_width}${
          pageData.value.label_mode === CARD_LABEL_WIDTH_MODE.PERCENT ? '%' : 'px'
        }`;
      }
      // 应用标签字体样式
      if (props.data.data.label_font) {
        const font_style = props.data.data.label_font;
        Object.assign(style, {
          fontSize: font_style.fontSize,
          color: font_style.color,
          justifyContent: font_style.align === 'justify' ? 'space-between' : font_style.align,
          fontWeight: font_style.bold ? 'bold' : 'normal',
          fontStyle: font_style.italic ? 'italic' : 'normal',
          textDecoration: font_style.textDecoration,
        });
      }
      return style;
    });

    // 内容样式
    const contentStyle = computed(() => {
      const style: IObject = {};
      // 应用内容字体样式
      if (props.data.data.content_font) {
        const font_style = props.data.data.content_font;
        Object.assign(style, {
          fontSize: font_style.fontSize,
          color: font_style.color,
          justifyContent: font_style.align === 'justify' ? 'space-between' : font_style.align,
          fontWeight: font_style.bold ? 'bold' : 'normal',
          fontStyle: font_style.italic ? 'italic' : 'normal',
          textDecoration: font_style.textDecoration,
        });
      }
      return style;
    });

    const field = ref<IObject>({});

    const fieldLabel = computed(() => {
      if (!field.value) {
        return '';
      }
      return props.data.data.label || field.value.name;
    });

    const fieldValue = computed(() => {
      if (!field.value) {
        return nullDisplayEnum[gct.appSetting.emptyDisplay] || '';
      }
      const text = getLabelText(field.value);
      return formatFieldValueUtil(text, {
        field: {
          type: field.value.type || '',
          mappingType: field.value.mappingType,
        },
        format: nodeData.value.format,
        editorType: nodeData.value.editor_type,
        currency: nodeData.value.currency,
        timeType: nodeData.value.time_type,
      });
    });

    function getLabelText(field: IObject): string {
      const type =
        field.type === FIELD_TYPE.AGG || field.type === FIELD_TYPE.EXPRESSION
          ? field.mappingType
          : field.type;
      // 获取样例文本
      const example = type ? transformField2Component(type).example : '';

      // 样例文本转为国际化文本
      let showMsg = example ? (isString(example) ? t(example) : example.map((e) => t(e))) : '';
      if (type === FIELD_TYPE.ENUM_MULTI || type === FIELD_TYPE.ENUM) {
        showMsg = showMsg ? (isString(showMsg) ? [showMsg] : showMsg) : [];
      }
      if (type === FIELD_TYPE.BOOLEAN) {
        showMsg = '真';
      }
      if (showMsg instanceof Array) {
        return showMsg.join('，');
      } else {
        return showMsg;
      }
    }

    // 渲染字段值
    function renderFieldValue() {
      if (!field.value) {
        return '';
      }
      const tagStyle = props.data.data.tag_style;
      const content = fieldCom.value
        ? h(fieldCom.value, {
            count: props.count,
            data: props.data,
            parent: props.parent,
            field: field.value,
            value: fieldValue.value,
          })
        : fieldValue.value;
      // 如果有标签样式配置且字段类型是枚举类型，渲染为标签
      if (tagStyle && tagStyle.check === true) {
        return (
          <span
            class={[ns.e('value-tag'), tagStyle.mode]}
            style={{ '--ant-primary-color': tagStyle.color }}
          >
            {content}
          </span>
        );
      }

      // 普通渲染
      return content;
    }

    async function onInit(): Promise<void> {
      if (nodeData.value.modelKey) {
        const f = await modelLoader.loadField(nodeData.value.modelKey, nodeData.value.key);
        if (f) {
          field.value = f;
        }
      }
    }

    onInit();

    return () => {
      if (!field.value) {
        return null;
      }
      return (
        <div
          class={[
            ns.b(),
            layout.value === CARD_LAYOUT_MODE.VERTICAL
              ? ns.m(CARD_LAYOUT_MODE.VERTICAL)
              : ns.m(CARD_LAYOUT_MODE.HORIZONTAL),
          ]}
        >
          {nodeData.value.show_label !== true ? null : (
            <div class={ns.e('label')} style={labelStyle.value}>
              <span
                title={fieldLabel.value}
                class={[ns.em('label', 'name'), ns.is('ellipsis', labelWrap.value !== true)]}
              >
                {fieldLabel.value}
              </span>
              {layout.value === CARD_LAYOUT_MODE.VERTICAL ? null : (
                <span class={ns.em('label', 'colon')}>：</span>
              )}
            </div>
          )}
          <div title={fieldValue.value} class={ns.e('value')} style={contentStyle.value}>
            {renderFieldValue()}
          </div>
        </div>
      );
    };
  },
});
