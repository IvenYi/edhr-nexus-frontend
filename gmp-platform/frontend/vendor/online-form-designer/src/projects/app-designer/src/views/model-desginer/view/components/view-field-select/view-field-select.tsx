import { defineComponent, PropType, computed, ref } from 'vue';
import {
  EditorType,
  IModal,
  ITable,
  ITableEditItem,
  ITextEditor,
  useModal,
  useNamespace,
} from '@gct/runtime';
import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';
import { FieldMetaDTO } from '/@/apis/gct-apaas/model';
import { getViewModelInfo, putViewModelById } from '/@/apis/gct-apaas/ViewModelController';
import { SelectContainer } from './select-container/select-container';
import { cloneDeep } from 'lodash-es';
import { useKeyParser } from '/@/hooks/develop/useKeyParser';
import { useI18n } from 'vue-i18n';
import './view-field-select.scss';
import { FIELD_TYPE, FieldIconMap } from '/@/enums/appEnum';
import { message } from 'ant-design-vue';

interface TargetItem {
  // 临时唯一标识
  id: string;
  // 临时呈现的拼接原字段呈现名称
  originName: string;
  // 原属性所属模型
  originModelKey: string;
  // 原属性标识
  originFieldKey: string;
  // 原属性类型
  originFieldType: string;
  // 新属性标识，默认与原属性标识相同
  newKey: string;
  newName: string;
}

export const ViewFieldSelect = defineComponent({
  name: 'ViewFieldSelect',
  props: {
    id: {
      type: String,
      required: true,
    },
    // 已经新建过的属性
    sourceFields: {
      type: Array as PropType<IData[]>,
      default: () => [],
    },
    // 连接实体信息
    joinConfig: {
      type: Object as PropType<IData>,
      required: true,
    },
    modal: {
      type: Object as PropType<IModal>,
      required: true,
    },
    hasKeys: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
    const { t } = useI18n() as any;

    const ns = useNamespace('view-field-select');

    const { keyPrefix, keySuffix } = useKeyParser('f_');

    const modelCache: Map<string, IData> = new Map();

    const refGctTable = ref<any>();

    // 根模型选择值
    const val = ref<string>('');

    // 待选区搜索
    const fieldSearchVal = ref<string>('');

    // 当前根选择模型下的属性
    const fields = ref<FieldMetaDTO[]>([]);

    // 当前已经选中的字段清单
    const selectKeys = ref<string[]>([]);

    // 已选区搜索
    const newFieldSearchVal = ref<string>('');

    // 新建的字段清单
    const newFields = ref<TargetItem[]>([]);

    // 选中的新建字段清单
    const selectNewKeys = ref<string[]>([]);

    // E-SOP、序列号规则、主从关联、标签设计、在线表单字段不支持新建
    const noSelectTypes = [
      FIELD_TYPE.ESOP,
      FIELD_TYPE.SERIALRULE,
      FIELD_TYPE.MASTERSLAVE,
      FIELD_TYPE.LABEL_TEMPLATE,
      // FIELD_TYPE.ONLINE_FORM,
      FIELD_TYPE.EXPRESSION_CONDITION,
    ];

    const options = computed(() => {
      const arr: any[] = [];
      if (props.joinConfig) {
        const cfg = props.joinConfig;
        arr.push({
          label: cfg.mainModelName,
          value: cfg.mainModelKey,
        });
        if (cfg.joins) {
          (cfg.joins as any[]).forEach((item) => {
            arr.push({
              label: item.modelName,
              value: item.modelKey,
            });
          });
        }
      }
      return arr;
    });

    const onFieldChange = () => {
      loadFields();
    };

    const loadFields = async () => {
      const data = await getModelMetaDetail({ modelKey: val.value });
      if (data) {
        modelCache.set(data.key!, data);
        fields.value = data.fieldMetaList || [];
      } else {
        fields.value = [];
      }
      const sourceKeys = props.sourceFields.map((item) => item.id);
      fields.value = fields.value.filter((item) => {
        if (sourceKeys.includes(item.id)) {
          return false;
        }
        return true;
      });
      selectKeys.value = [];
    };

    if (props.joinConfig) {
      val.value = props.joinConfig.mainModelKey!;
      loadFields();
    }

    // 新增字段
    const addNewField = (e: MouseEvent) => {
      e.stopPropagation();
      const selectFields = fields.value.filter((item) => {
        if (selectKeys.value.includes(item.id!)) {
          return true;
        }
        return false;
      });
      selectFields.forEach((item) => {
        const model = modelCache.get(item.modelKey!)!;
        // 导入的应用中创建视图模型与模型A和模型B关联（这两个模型都是由导入而来），视图模型新建字段时选择模型A的字段前后缀与当前模型的前后缀不同，进行相关处理
        let newKey =
          item.createType === 'USER_DEFINED'
            ? item.key!
            : `${keyPrefix.value}${item.key}${keySuffix.value}`;
        const keys = item.key?.split('_') || [];
        if (
          gct.appInfo.sourceType === 'IMPORT' &&
          item.createType === 'USER_DEFINED' &&
          keys.length > 2
        ) {
          const suffix = keys[keys?.length - 1];
          if (keySuffix.value !== suffix) {
            keys.shift();
            keys.pop();
            const keyStr = keys.join('_');
            console.log(`${keyPrefix.value}${keyStr}${keySuffix.value}`);
            newKey = `${keyPrefix.value}${keyStr}${keySuffix.value}`;
          }
        }
        newFields.value.push({
          id: item.id!,
          originName: `${model.name}.${item.name}`,
          originModelKey: item.modelKey!,
          originFieldKey: item.key!,
          originFieldType: item.type!,
          newKey,
          newName: item.name!,
        });
      });
      selectKeys.value = [];
      newFields.value = newFields.value!;
    };

    // 删除字段
    const deleteNewField = (e: MouseEvent) => {
      e.stopPropagation();
      const deletes: string[] = newFields.value
        .map((item) => {
          if (selectNewKeys.value.includes(item.id!)) {
            return item.id;
          }
          return null;
        })
        .filter((i) => i != null) as string[];
      deletes.forEach((key) => {
        const i = newFields.value.findIndex((item) => item.id === key);
        newFields.value.splice(i, 1);
      });
      selectNewKeys.value = [];
      newFields.value = newFields.value!;
    };

    const columns: IData[] = [
      {
        key: 'name',
        title: t('sys.appDesigner.newViewField.mapFields'),
        dataIndex: 'name',
      },
    ];

    // 待选区
    const items = computed(() => {
      const newKeys = newFields.value.map((item) => item.id);
      const arr = fields.value
        .filter((item) => {
          if (newKeys.includes(item.id!)) {
            return false;
          }
          return item;
        })
        .filter((i) => !noSelectTypes.includes(i.type!));
      const searchVal = fieldSearchVal.value;
      if (searchVal) {
        return arr.filter((item) => {
          return item.name?.includes(searchVal) || item.key?.includes(searchVal);
        });
      }
      return arr;
    });

    const newItems = computed(() => {
      const searchVal = newFieldSearchVal.value;
      if (searchVal) {
        return newFields.value.filter((item) => {
          return (
            item.newKey.includes(searchVal) ||
            item.newName.includes(searchVal) ||
            item.originName.includes(searchVal)
          );
        });
      }
      return newFields.value;
    });

    const onSelectChange = (keys: string[]) => {
      selectKeys.value = keys;
    };

    const onSelectNewChange = (keys: string[]) => {
      selectNewKeys.value = keys;
    };

    // 保存批量新建的字段
    const save = async () => {
      await refGctTable.value.validate();
      for (let i = 0; i < newFields.value?.length; i++) {
        if (props.hasKeys.includes(newFields.value[i].newKey)) {
          message.error(
            t('sys.appDesigner.newViewField.valiKeyTip', { sth: newFields.value[i].newKey }),
          );
          return false;
        }
      }
      const info = await getViewModelInfo({ id: props.id });
      const cloneInfo = cloneDeep(info);
      if (cloneInfo) {
        if (!cloneInfo.fieldConfig) {
          cloneInfo.fieldConfig = {};
        }
        const fields = cloneInfo.fieldConfig.fields || [];
        fields.unshift(
          ...newFields.value.map((item) => {
            return {
              id: item.id,
              originModelKey: item.originModelKey,
              originFieldKey: item.originFieldKey,
              key: item.newKey,
              name: item.newName,
              /**
               * 用flag判断是新增还是编辑以便于后端获取相应时间，0为新增，1为编辑
              */
              flag: 0,
            };
          }),
        );
        cloneInfo.fieldConfig.fields = fields;
        await putViewModelById(
          {
            id: props.id,
          },
          cloneInfo,
          {
            transferToConfig: { headers: { operateType: 'INSERT' } },
          },
        );
      }
      return true;
    };

    useModal(async () => {
      const flag = await save();
      return { ok: flag };
    });

    const tableModel: ITable = {
      local: true,
      autoLoad: false,
      key: 'id',
      columns: [
        {
          name: 'originName',
          title: t('sys.appDesigner.newViewField.originalField'),
          dataIndex: 'originName',
          type: 'edit',
          editor: {
            type: EditorType.SPAN,
            icon: (data) => {
              return FieldIconMap[data.originFieldType];
            },
          },
        } as ITableEditItem,
        {
          name: 'newName',
          title: t('sys.appDesigner.newViewField.newField'),
          dataIndex: 'newName',
          type: 'edit',
          editor: {
            type: EditorType.TEXT,
            placeholder: t('sys.appDesigner.inputPlaceholder'),
          },
          rules: [
            {
              required: true,
              message: t('sys.appDesigner.newViewField.pleaseEnterTheFieldName'),
              trigger: 'blur',
            },
          ],
        } as ITableEditItem,
        {
          name: 'newKey',
          title: '字段KEY',
          dataIndex: 'newKey',
          type: 'edit',
          editor: {
            prefix: keyPrefix.value,
            suffix: keySuffix.value,
            type: EditorType.TEXT,
            placeholder: t('sys.appDesigner.inputPlaceholder'),
          } as ITextEditor,
          rules: [
            {
              required: true,
              message: t('sys.appDesigner.newViewField.pleaseEnterTheFieldKye'),
              trigger: 'blur',
            },
            {
              pattern: /^[a-z0-9_]*$/,
              message: t('sys.appDesigner.newViewField.errorMessage.key'),
              type: 'string',
              trigger: ['change', 'blur'],
            },
            {
              validator: (rule, value, callback) => {
                const items = newFields.value.filter((item) => {
                  return item.newKey === value;
                });
                if (items.length >= 2) {
                  callback(t('sys.appDesigner.newViewField.fieldKyeDuplicated'));
                } else {
                  callback();
                }
              },
              trigger: 'blur',
            },
          ],
        } as ITableEditItem,
      ],
    };

    const rowChange = (data: IData): void => {
      const item = newFields.value.find((item) => item.id === data.id);
      if (item) {
        Object.assign(item, data);
      }
    };

    return {
      t,
      ns,
      val,
      options,
      fields,
      selectKeys,
      newFields,
      selectNewKeys,
      columns,
      items,
      newItems,
      fieldSearchVal,
      newFieldSearchVal,
      tableModel,
      refGctTable,
      rowChange,
      onFieldChange,
      addNewField,
      deleteNewField,
      onSelectChange,
      onSelectNewChange,
    };
  },
  render() {
    const newItems = this.newItems;
    return (
      <view-container class={this.ns.b()}>
        <div class={this.ns.b('container')}>
          <div class={this.ns.b('header')}>
            <a-form>
              <a-form-item label={this.t('sys.appDesigner.newViewField.modelSelection')}>
                <a-select
                  placeholder={this.t('sys.appDesigner.pleaseSelect')}
                  v-model:value={this.val}
                  options={this.options}
                  onChange={this.onFieldChange}
                />
              </a-form-item>
            </a-form>
          </div>
          <div class={this.ns.b('content')}>
            <div class={this.ns.be('content', 'left')}>
              <SelectContainer
                caption={this.t('sys.appDesigner.newViewField.candidateArea')}
                count={this.selectKeys.length}
                total={this.items.length}
                onSearch={(val) => {
                  this.selectKeys = [];
                  this.fieldSearchVal = val;
                }}
              >
                <a-table
                  class={this.ns.b('candidate-area-table')}
                  scroll={{ x: 250, y: 340 }}
                  row-selection={{
                    selectedRowKeys: this.selectKeys,
                    onChange: this.onSelectChange,
                  }}
                  data-source={this.items}
                  columns={this.columns}
                  pagination={false}
                  row-key={(record) => record.id}
                >
                  {{
                    bodyCell: ({ _column, text, record }) => {
                      return (
                        <div class={this.ns.b('table-item')}>
                          <span class={this.ns.be('table-item', 'icon')}>
                            <i
                              class={`iconfont ${
                                FieldIconMap[record.type] ?? FieldIconMap[FIELD_TYPE.TEXT]
                              }`}
                            />
                          </span>
                          <span class={this.ns.be('table-item', 'text')}>{text}</span>
                        </div>
                      );
                    },
                  }}
                </a-table>
              </SelectContainer>
            </div>
            <div class={this.ns.be('content', 'center')}>
              <a-button
                type={this.selectKeys.length > 0 ? 'primary' : ''}
                size="small"
                onClick={this.addNewField}
                icon={<i class="iconfont icon-a-Rightarrow" />}
              />
              <a-button
                size="small"
                type={this.selectNewKeys.length > 0 ? 'primary' : ''}
                onClick={this.deleteNewField}
                icon={<i class="iconfont icon-a-Leftarrow" />}
              />
            </div>
            <div class={this.ns.be('content', 'right')}>
              <SelectContainer
                caption={this.t('sys.appDesigner.newViewField.selectedArea')}
                count={this.selectNewKeys.length}
                total={newItems.length}
                onSearch={(val) => {
                  this.selectNewKeys = [];
                  this.newFieldSearchVal = val;
                }}
              >
                <gct-table
                  ref="refGctTable"
                  model={this.tableModel}
                  count={newItems.length}
                  data={newItems}
                  scroll={{ x: 550, y: 340 }}
                  row-selection={{
                    selectedRowKeys: this.selectNewKeys,
                    onChange: this.onSelectNewChange,
                  }}
                  pagination={false}
                  onRowChange={this.rowChange}
                />
              </SelectContainer>
            </div>
          </div>
        </div>
      </view-container>
    );
  },
});
