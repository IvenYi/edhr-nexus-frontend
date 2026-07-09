import { defineComponent, PropType, ref, computed } from 'vue';
import {
  IActionItem,
  IEditForm,
  IFormGroup,
  IFormItem,
  IModal,
  INumberEditor,
  ITextEditor,
  ITextareaEditor,
  useEditFormController,
  useNamespace,
} from '@gct/runtime';
import { useKeyParser } from '/@/hooks/develop/useKeyParser';
import { ReceiptFormController } from './receipt-form.controller';
import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
import {
  getDocumentInfo,
  postDocument,
  putDocumentById,
} from '/@/apis/gct-apaas/DocumentController';
import { DocumentRequest } from '/@/apis/gct-apaas/model';
import { useI18n } from 'vue-i18n';
import { pagerSizeMap } from '../document-designer/constants';
import { XlsxParser } from '/@online-form/views/designer/utils/xlsx-parser';
import { uploaderFiles } from '/@/utils/file/download';
import { uuid } from '@jsplumb/browser-ui';

/**
 * 单据编辑界面
 */
export const ReceiptModal = defineComponent({
  name: 'ReceiptModal',
  props: {
    context: {
      type: Object as PropType<IParams>,
    },
    params: {
      type: Object as PropType<IParams>,
    },
    modal: {
      type: Object as PropType<IModal>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('receipt-modal');

    const editFormRef = ref(null);

    const { t } = useI18n() as any;

    const { keyPrefix, keySuffix } = useKeyParser('pd', 'isu');

    const isNew = computed(() => !props.context?.id);

    let designerJson: string | undefined = '';

    // 表单第一层分组
    const formGroups: IFormGroup[] = [
      {
        name: 'group_1',
        isCollapse: true,
        title: t('sys.appDesigner.basicInfo'),
        type: 'container',
        layout: 'grid',
        children: [
          {
            name: 'categoryId',
            type: 'item',
            label: t('sys.appDesigner.printDesign.form.category'),
            defaultValue: props.context?.category,
            dictionary: {
              tag: 'receipt_classification',
              mode: 'async',
              fetch(_params) {
                return getCategoryListComplete({ module: 'document_module' }).then((items) => {
                  const list = items?.map((item) => {
                    if (item.children) {
                      delete item.children;
                    }
                    return item;
                  });
                  return props.context?.isFrontPrint ? list?.filter((i) => i.id !== '_SYS_') : list;
                });
              },
            },
            editor: {
              type: 'picker',
              placeholder: t('sys.appDesigner.pleaseSelect'),
            },
            rules: [{ required: true }],
          },
          {
            name: 'name',
            type: 'item',
            label: t('sys.appDesigner.printDesign.form.name'),
            editor: {
              type: 'i18n',
              placeholder: t('sys.appDesigner.inputPlaceholder'),
            },
            rules: [{ required: true }],
          },
          {
            name: 'i18nConfig',
            type: 'hidden',
          },
          {
            name: 'key',
            type: 'item',
            label: t('sys.appDesigner.printDesign.form.key'),
            defaultValue: `${keyPrefix.value}${uuid().substring(0, 8)}${
              props.context?.isFrontPrint ? '' : keySuffix.value
            }`,
            editor: {
              type: 'text',
              placeholder: t('sys.appDesigner.inputPlaceholder'),
              addonBefore: keyPrefix.value,
              addonAfter: props.context?.isFrontPrint ? '' : keySuffix.value,
              disabled: !isNew.value,
              max:
                32 -
                keyPrefix.value.length -
                (props.context?.isFrontPrint ? 0 : keySuffix.value.length),
            } as ITextEditor,
            rules: [
              {
                pattern: /^[a-z0-9_]*$/,
                message: t('sys.appDesigner.printDesign.form.errorMessage.key'),
                type: 'string',
                trigger: ['change', 'blur'],
              },
              {
                required: true,
                trigger: 'blur',
              },
            ],
          },
        ] as IFormItem[],
      },
      {
        name: 'group_2',
        isCollapse: true,
        title: t('sys.appDesigner.configOption'),
        type: 'container',
        layout: 'grid',
        children: [
          {
            // 绑定模型类型(实体:entity,视图:view,数据:data)
            name: 'modelCategory',
            type: 'hidden',
            defaultValue: 'entity',
          },
          {
            name: 'modelKey',
            type: 'item',
            label: t('sys.appDesigner.printDesign.form.modelKey'),
            editor: {
              type: 'model-picker',
              disabled: !isNew.value,
            },
            rules: [
              {
                required: true,
                message: t('sys.appDesigner.printDesign.placeSelectModel'),
                trigger: 'blur',
              },
            ],
          },
          {
            name: 'paperSize',
            type: 'item',
            label: t('sys.appDesigner.printDesign.form.paperSize'),
            defaultValue: 'A4',
            editor: {
              type: 'select',
              placeholder: t('sys.appDesigner.pleaseSelect'),
              codeList: {
                tag: 'paper_size',
                mode: 'static',
                items: Object.keys(pagerSizeMap).map((key) => {
                  return { value: key, label: pagerSizeMap[key] };
                }),
              },
              disabled: !isNew.value,
            },
            rules: [{ required: true }],
          },
          {
            name: 'group_2_1',
            type: 'container',
            layout: 'flex',
            children: [
              {
                name: 'group_2_1_1',
                type: 'container',
                layout: 'grid',
                width: '100px',
              },
              {
                name: 'group_2_1_2',
                type: 'container',
                layout: 'flex',
                children: [
                  {
                    name: 'height',
                    type: 'item',
                    label: t('sys.appDesigner.printDesign.form.height'),
                    labelWidth: 'auto',
                    editor: {
                      type: 'number',
                      placeholder: t('sys.appDesigner.inputPlaceholder'),
                      addonAfter: 'mm',
                      disabled: !isNew.value,
                      precision: 0,
                    } as INumberEditor,
                    rules: [{ required: true }],
                  },
                  {
                    name: 'width',
                    type: 'item',
                    label: t('sys.appDesigner.printDesign.form.width'),
                    labelWidth: '60px',
                    editor: {
                      type: 'number',
                      placeholder: t('sys.appDesigner.inputPlaceholder'),
                      addonAfter: 'mm',
                      disabled: !isNew.value,
                      precision: 0,
                    } as INumberEditor,
                    rules: [{ required: true }],
                  },
                ] as IFormItem[],
              },
            ] as IFormGroup[],
          } as IFormGroup,
          {
            name: 'description',
            type: 'item',
            label: t('sys.appDesigner.printDesign.form.desc'),
            editor: {
              placeholder: t('sys.appDesigner.placeEnterDesc'),
              type: 'textarea',
              autoSize: { minRows: 4, maxRows: 4 },
              max: 120,
            } as ITextareaEditor,
          },
        ] as IFormItem[],
      },
    ];

    // 编辑表单模型
    const model: IEditForm = {
      type: 'edit',
      children: formGroups,
      newRequest(data: IData): Promise<IData> {
        return postDocument({
          ...data,
          designerJson,
        } as DocumentRequest).then(() => {
          return data;
        });
      },
      loadRequest(params: { id: string }): Promise<IData> {
        return getDocumentInfo(params) as Promise<IData>;
      },
      updateRequest(params: { id: string }, data: IData): Promise<IData> {
        return putDocumentById(params, data as DocumentRequest).then(() => {
          return data;
        });
      },
    };

    const c = useEditFormController(() => new ReceiptFormController(model));

    const footerActions: IActionItem[] = [
      {
        text: t('sys.appDesigner.cancel'),
        onClick: async (): Promise<void> => {
          await props.modal.dismiss();
        },
      },
      {
        text: t('sys.appDesigner.ok'),
        props: {
          type: 'primary',
        },
        onClick: async (): Promise<void> => {
          if (props.modal.ok) {
            const result = await props.modal.ok();
            if (result && result.ok) {
              await props.modal.dismiss(result);
            }
          }
        },
      },
    ];

    if (isNew.value) {
      footerActions.splice(1, 0, {
        text: t('sys.appDesigner.templateImportConfirmation'),
        props: {
          type: 'primary',
        },
        onClick: async (): Promise<void> => {
          const files = await uploaderFiles({
            accept: '.xlsx',
          });
          const paperJson = await XlsxParser.xlsx2json(files[0]);
          designerJson = JSON.stringify(paperJson);
          if (props.modal.ok) {
            const result = await props.modal.ok();
            if (result && result.ok) {
              await props.modal.dismiss(result);
            }
          }
        },
      });
    }

    return { ns, c, editFormRef, model, footerActions };
  },
  render() {
    return (
      <view-container class={this.ns.b()}>
        {{
          default: () => {
            return (
              <gct-edit-form
                ref="editFormRef"
                context={this.context}
                params={this.params}
                controller={this.c}
                model={this.model}
              />
            );
          },
          footer: () => {
            return <view-footer actions={this.footerActions} />;
          },
        }}
      </view-container>
    );
  },
});

export default ReceiptModal;
