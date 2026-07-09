import { computed, defineComponent, onMounted, PropType, ref, watch } from 'vue';
import { useNamespace } from '@gct-paas/core';
import {
  EditorType,
  IEditForm,
  IEditFormController,
  IFormGroup,
  IFormItem,
  IFormTab,
  IFormTabController,
  IFormTabPane,
  IModal,
  ISelectTableEditor,
  useModal,
} from '@gct/runtime';
import { getReportDataSetPageList } from '/@/apis/gct-apaas/ReportDataSetController';
import { openReportDataSetPreviewModal } from '../report-data-set-design';
import './model-select-modal.scss';

export const ModelSelectModal = defineComponent({
  name: 'ModelSelectModal',
  props: {
    modal: {
      type: Object as PropType<IModal>,
      required: true,
    },
    data: {
      type: Object as PropType<IObject & { isDataSet?: boolean }>,
      default: () => {
        return {};
      },
    },
  },
  setup(props) {
    const ns = useNamespace('model-select-modal');

    props.modal.state.okDisabled = true; // 禁用默认的ok按钮

    const formRef = ref();

    const data = ref<IObject>(props.data.isDataSet ? { table: [props.data.model] } : props.data);

    const items = ref<IObject[]>([]);

    const activePane = computed(() => {
      if (formRef.value) {
        const c = formRef.value.c as IEditFormController;
        if (c.item.tab1) {
          return (c.item.tab1 as IFormTabController).state.activePane;
        }
      }
      return '';
    });

    function calcOkState() {
      if (formRef.value) {
        const c = formRef.value.c as IEditFormController;
        if (c.item.tab1) {
          if (activePane.value === 'tabPane1') {
            props.modal.state.okDisabled = !data.value.model;
          } else if (activePane.value === 'tabPane2') {
            props.modal.state.okDisabled = !data.value.table;
          }
        }
      }
    }

    watch(data, () => {
      calcOkState();
    });

    onMounted(() => {
      // 初始化时计算一次ok按钮状态
      calcOkState();

      if (formRef.value) {
        const c = formRef.value.c as IEditFormController;

        if (c.item.tab1) {
          const tab1 = c.item.tab1 as IFormTabController;
          if (props.data.isDataSet) {
            tab1.state.activePane = 'tabPane2';
          } else {
            tab1.state.activePane = 'tabPane1';
          }
        }

        c.evt.on('changeState', (key: string, item) => {
          calcOkState();
        });
      }
    });

    const formModel: IEditForm = {
      type: 'edit',
      children: [
        {
          type: 'tab',
          name: 'tab1',
          isContainer: true,
          layout: 'grid',
          children: [
            {
              type: 'tab-pane',
              name: 'tabPane1',
              isContainer: true,
              layout: 'grid',
              title: '模型',
              children: [
                {
                  type: 'container',
                  name: 'group1',
                  layout: 'grid',
                  class: ns.e('model-select-group'),
                  children: [
                    {
                      type: 'item',
                      name: 'model',
                      label: '选择模型',
                      rules: [
                        {
                          required: true,
                          message: '请选择模型',
                        },
                      ],
                      editor: {
                        type: EditorType.MODEL_SELECT,
                        props: {
                          exclude: ['data'],
                        },
                      },
                    },
                    {
                      type: 'hidden',
                      name: 'modelName',
                    },
                    {
                      type: 'hidden',
                      name: 'category',
                    },
                    {
                      type: 'hidden',
                      name: 'categorySelect',
                    },
                    {
                      type: 'hidden',
                      name: 'formId',
                    },
                  ] as IFormItem[],
                },
              ] as IFormGroup[],
            },
            {
              type: 'tab-pane',
              name: 'tabPane2',
              isContainer: true,
              layout: 'grid',
              class: ns.e('select-table-tab-pane'),
              title: '数据集',
              children: [
                {
                  type: 'container',
                  name: 'group2',
                  class: ns.e('select-table-group'),
                  layout: 'grid',
                  children: [
                    {
                      type: 'item',
                      name: 'table',
                      class: ns.e('select-table'),
                      editor: {
                        type: EditorType.SELECT_TABLE,
                        isKeys: true,
                        tableModel: {
                          key: 'id',
                          pagination: {
                            pageSize: 20,
                          },
                          columns: [
                            {
                              dataIndex: 'index',
                              name: 'index',
                              title: '序号',
                              width: 60,
                            },
                            {
                              dataIndex: 'name',
                              name: 'name',
                              title: '数据集名称',
                              ellipsis: true,
                              type: 'link',
                              click(record) {
                                openReportDataSetPreviewModal(record.id);
                              },
                            },
                            {
                              dataIndex: 'description',
                              name: 'description',
                              title: '描述',
                              ellipsis: true,
                            },
                          ],
                          async fetch(params = {}, controller) {
                            const res = await getReportDataSetPageList({
                              pageNo: params.page,
                              pageSize: params.size,
                            });
                            items.value = res?.data || [];
                            items.value.forEach((item, index) => {
                              item.index = index + 1;
                            });
                            if (params.query) {
                              // 模拟数据
                              return items.value.filter((item) => {
                                return item.name.includes(params.query);
                              }).map((item, index) => {
                                item.index = index + 1;
                                return item;
                              });
                            }
                            return items.value;
                          },
                        },
                      } as ISelectTableEditor,
                    },
                  ] as IFormItem[],
                },
              ] as IFormGroup[],
            },
          ] as IFormTabPane[],
        } as IFormTab,
      ],
    };

    useModal(async () => {
      if (activePane.value === 'tabPane1') {
        return {
          ok: true,
          data: [
            {
              model: data.value.model,
              modelName: data.value.modelName,
              category: data.value.category,
              categorySelect: data.value.categorySelect,
              formId: data.value.formId,
              isDataSet: false,
            },
          ],
        };
      } else if (activePane.value === 'tabPane2') {
        const itemKey = data.value.table[0];
        const item = items.value.find((i) => i.id === itemKey);
        if (item) {
          return {
            ok: true,
            data: [
              {
                model: item.id,
                modelName: item.name,
                isDataSet: true,
              },
            ],
          };
        }
      }
      return {
        ok: false,
      };
    });

    return { ns, formRef, data, formModel };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <gct-edit-form
          ref="formRef"
          v-model:data={this.data}
          model={this.formModel}
          embed
          adaptModal={false}
        />
      </div>
    );
  },
});
