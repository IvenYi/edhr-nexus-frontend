import { Component, computed, defineComponent, h, PropType, ref, resolveComponent } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { formatFieldValue as formatFieldValueUtil, IDesignNode } from '@gct/base';
import {
  FIELD_TYPE,
  FieldMetaDTO,
  modelLoader,
  transformField2Component,
  nullDisplayEnum,
} from '@gct/runtime';
import { IRenderEditorNodeProvider, RenderNodeRegister } from '@gct/runtime-render';
import { isString } from 'lodash-es';
import './render-card-field.scss';

export const RenderCardField = defineComponent({
  name: 'RenderCardField',
  props: {
    model: {
      type: Object as PropType<IDesignNode>,
      default: () => ({}),
    },
    context: {
      type: Object,
      default: () => ({}),
    },
    preview: {
      type: Boolean,
      default: false,
    },
    pageModel: {
      type: Object as PropType<IDesignNode>,
      default: () => ({}),
    },
  },
  setup(props) {
    const t = (window as any).$t;
    const ns = useNamespace('render-mobile-card-field');

    const pageData = computed(() => {
      return props.pageModel?.data || {};
    });

    // 获取节点数据
    const nodeData = computed(() => {
      return (props.model?.data as any) || {};
    });
    const fieldProvider = computed<IRenderEditorNodeProvider | null>(() => {
      return RenderNodeRegister.getDesignEditorNode(nodeData.value.type as FIELD_TYPE);
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
      return props.pageModel.data.layout_mode || 'horizontal';
    });

    // 标签是否换行
    const labelWrap = computed(() => {
      return nodeData.value.wrap_mode === 'wrap';
    });

    // 标签样式
    const labelStyle = computed(() => {
      const style: Record<string, any> = {};

      // 标签宽度
      if (pageData.value.custom_label_width) {
        const width = pageData.value.label_width;
        const mode = pageData.value.label_mode;
        style.width = `${width}${mode === 'percent' ? '%' : 'px'}`;
      }

      // 应用标签字体样式
      if (nodeData.value.label_font) {
        const font_style = nodeData.value.label_font;
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
      const style: Record<string, any> = {};

      // 应用内容字体样式
      if (nodeData.value.content_font) {
        const font_style = nodeData.value.content_font;
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

    // 获取字段定义
    const field = ref<FieldMetaDTO | null>(null);

    // 字段标签
    const fieldLabel = computed(() => {
      return nodeData.value.label || field.value?.name || '';
    });

    // 字段值
    const fieldValue = computed(() => {
      if (!field.value) return '';
      let text = '';
      // preview 模式下走示例数据
      if (props.preview === true) {
        text = getLabelText(field.value) || '';
      } else {
        text = props.context.data?.[field.value.key!] || '';
      }
      if (text) {
        return formatFieldValue(text);
      }
      return '';
    });

    // 格式化字段值
    function formatFieldValue(text: any): string {
      if (!field.value) return String(text || '');

      return formatFieldValueUtil(text, {
        field: {
          type: field.value.type || '',
          mappingType: field.value.mappingType,
          specificConfig: field.value.specificConfig,
        },
        format: nodeData.value.format,
        editorType: nodeData.value.editor_type,
        currency: nodeData.value.currency,
        timeType: nodeData.value.time_type,
      });
    }

    // 获取示例文本
    function getLabelText(field: any): string {
      const type =
        field.type === FIELD_TYPE.AGG || field.type === FIELD_TYPE.EXPRESSION
          ? field.mappingType
          : field.type;
      const example = type ? transformField2Component(type).example : '';

      let showMsg = example ? (isString(example) ? t(example) : example.map((e: any) => t(e))) : '';
      if (type === FIELD_TYPE.ENUM_MULTI || type === FIELD_TYPE.ENUM) {
        showMsg = showMsg ? (isString(showMsg) ? [showMsg] : showMsg) : [];
      }
      if (showMsg instanceof Array) {
        return showMsg.join('，');
      } else {
        return showMsg;
      }
    }

    // 渲染字段值
    function renderFieldValue() {
      if (fieldValue.value === null || fieldValue.value === undefined || fieldValue.value === '') {
        return nullDisplayEnum[gct.appSetting.emptyDisplay];
      }
      const content = fieldCom.value
        ? h(fieldCom.value, {
            ...props,
            field: field.value,
            value: fieldValue.value,
          })
        : fieldValue.value;

      const tagStyle = nodeData.value.tag_style;
      // 如果有标签样式配置且字段类型是枚举类型，渲染为标签
      if (tagStyle && tagStyle.check === true && fieldValue.value) {
        return (
          <van-tag
            class={[ns.e('value-tag'), tagStyle.mode]}
            style={{ '--van-primary-color': tagStyle.color }}
            type="primary"
            size="medium"
          >
            {content}
          </van-tag>
        );
      }
      return content;
    }

    // 加载模型数据
    async function loadModelField(): Promise<void> {
      try {
        field.value = (await modelLoader.loadField(
          nodeData.value.modelKey,
          nodeData.value.key,
        )) as FieldMetaDTO;
      } catch (error) {
        console.warn('加载模型失败:', error);
      }
    }

    loadModelField();

    return () => {
      if (!field.value) {
        return null;
      }
      return (
        <div class={[ns.b(), layout.value === 'vertical' ? ns.m('vertical') : ns.m('horizontal')]}>
          {nodeData.value.show_label !== true ? null : (
            <div class={ns.e('label')} style={labelStyle.value}>
              <span
                title={fieldLabel.value}
                class={[ns.em('label', 'name'), ns.is('ellipsis', labelWrap.value !== true)]}
              >
                {fieldLabel.value}
              </span>
              <span class={ns.em('label', 'colon')}>：</span>
            </div>
          )}
          <div class={ns.e('value')} style={contentStyle.value}>
            {renderFieldValue()}
          </div>
        </div>
      );
    };
  },
});
