<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="modelTitle || t('sys.printDesigner.convertTmpl')"
    centered
    width="800px"
    :maskClosable="false"
    :afterClose="handleModalClose"
    :zIndex="1002"
    @visible-change="handleModalVisibleChange"
    @ok="handleSubmit"
  >
    <a-form ref="formRef" layout="vertical" class="mt-2 px-2 pb-6" :model="formState">
      <a-row :gutter="16">
        <a-col :span="12">
          <!-- BarTender 标签模板 -->
          <a-form-item
            :label="`BarTender ${t('sys.printDesigner.labelTemplate')}`"
            name="printKey"
            :rules="[
              {
                required: true,
                message: t('sys.pleaseSelectSth', {
                  sth: t('sys.printDesigner.labelTemplate'),
                }),
              },
            ]"
          >
            <div class="relative z-0">
              <a-tree-select
                allowClear
                showSearch
                class="btw-label-tree-select"
                dropdownClassName="btw-label-tree-dropdown"
                :placeholder="t('sys.chooseText')"
                v-model:value="formState.printKey"
                :tree-data="printerTreeOptions"
                :tree-expanded-keys="expandedIds"
                :filterTreeNode="handleFilterTreeNode"
                :searchPlaceholder="'abc'"
                @treeExpand="handlePrinterTreeExpand"
                @search="handlePrintSearch"
                @dropdownVisibleChange="handleDropdownVisibleChange"
              >
                <template #title="{ label, value, type, pathType, children }">
                  <div
                    class="btw-label-tree-node flex items-center gap-1 absolute z-0 inset-0 pl-2 pr-3"
                    @click="handlePrinterTreeClick(value, children)"
                    :title="selectedPrinterLinkOptions.map((o) => o.label?.replace(labelRegex, '\/')).join('/')"
                  >
                    <img
                      v-if="type !== 'file'"
                      :src="type === 'service' ? svgPrinter : svgFolder"
                    />
                    <div v-if="label" v-ellipsis-title="label" class="flex-1 pr-2 min-w-0 truncate">
                      {{ label?.replace(labelRegex, '\/') }}
                      <span
                        v-if="type !== 'file' && type !== 'service'"
                        :class="['btw-label-tag', pathType === 'common' ? 'common' : 'local']"
                        >{{ pathType === 'common' ? $t('sys.shared') : $t('sys.local') }}</span
                      >
                    </div>
                  </div>
                </template>
              </a-tree-select>

              <!-- 自行渲染链路，遮盖在 select 上 -->
              <div
                v-if="formState.printKey"
                class="items-center absolute inset-px left-[8px] right-[29px] px-1 pointer-events-none overflow-hidden"
                :class="[
                  'bg-white',
                  printerSearchValue || printerDropdownVisible ? 'hidden' : 'flex',
                ]"
              >
                <template v-if="selectedPrinterLinkOptions.length">
                  <div
                    v-for="(o, i) in selectedPrinterLinkOptions"
                    :key="o.value"
                    class="shrink-0 flex items-center gap-1"
                  >
                    <span v-if="i > 0" class="shrink-0 ml-[3px] mr-px">/</span>
                    <img
                      v-if="o.type !== 'file'"
                      class="shrink-0"
                      :src="o.type === 'service' ? svgPrinter : svgFolder"
                    />
                    <div class="shrink-0 flex-1 min-w-0 truncate">
                      {{ o.label?.replace(labelRegex, '\/') }}
                      <span
                        v-if="o.type !== 'file' && o.type !== 'service' && i === 1"
                        :class="[
                          'btw-label-tag',
                          o.pathType ? ( o.pathType === 'common' ? 'common' : 'local') : (formState.pathType === 'common' ? 'common' : 'local'),
                        ]"
                        >{{
                          o.pathType ? (o.pathType === 'common' ? $t('sys.shared') : $t('sys.local')) : (formState.pathType === 'common' ? $t('sys.shared') : $t('sys.local'))
                        }}</span
                      >
                    </div>
                  </div>
                </template>
                <div v-else class="whitespace-nowrap">
                  {{ formState.printKey }}
                </div>

                <div
                  class="absolute z-0 top-0 right-0 bottom-0 bg-linear-to-r w-12 from-transparent"
                  :class="'to-white'"
                ></div>
              </div>
            </div>
          </a-form-item>
          <!-- 刷新按钮 -->
          <div v-if="!isEdit" class="-mt-3 mb-4">
            <span class="text-[#8B8B8B]">{{ t('sys.printDesigner.noFoundLabelTmplTip') }}</span>
            <span
              class="text-[var(--ant-primary-color)] cursor-pointer hover:opacity-80"
              @click="!isPrinterTreeLoading && handleQueryBtwTreeData()"
            >
              {{ t('sys.redo') }}
            </span>
          </div>
        </a-col>
        <a-col v-if="!isEdhr" :span="12">
          <!-- 标签模板-参数取值模型 -->
          <a-form-item
            :label="`${t('sys.printDesigner.labelTemplate')} - ${t('sys.printDesigner.paramsValModel')}`"
            name="modelKey"
            :rules="[
              {
                required: true,
                message: t('sys.pleaseSelectSth', {
                  sth: t('sys.entityModel'),
                }),
              },
            ]"
          >
            <div class="input-and-select-group flex items-center w-[368px]">
              <a-input readOnly :value="t('sys.entityModel')" class="shrink-0" :allowClear="false" />
              <a-select
                allowClear
                show-search
                class="grow min-w-0"
                v-model:value="formState.modelKey"
                :filter-option="filterModelOption"
                :placeholder="t('sys.chooseText')"
                @change="handleModelChange"
              >
                <a-select-opt-group
                  v-for="(models, modelType) in groupedModelOptions"
                  :key="modelType"
                >
                  <template #label>
                    <span>{{ modelType }}</span>
                  </template>
                  <a-select-option
                    v-for="model in models"
                    :key="model.key"
                    :value="model.key"
                    :name="model.name"
                    :type="model.type"
                    :subModel="model.subModel"
                    :category="model.category"
                    :supportProcess="model.supportProcess"
                  >
                    {{ model.name }}
                  </a-select-option>
                </a-select-opt-group>
              </a-select>
            </div>
          </a-form-item>
        </a-col>
      </a-row>

      <!-- 字段映射 -->
      <div class="flex justify-between items-center my-1 pb-2 sticky top-0 z-10 bg-white">
        <div>{{ t('sys.printDesigner.fieldMapping') }}</div>
        <div
          v-if="formState.printKey && formState.mappingFields.length"
          class="text-[var(--ant-primary-color)] cursor-pointer select-none hover:opacity-80"
          @click="handleFieldAddClick"
        >
          + {{ t('sys.printDesigner.addLabelTmplParam') }}
        </div>
      </div>

      <!-- 映射列表 -->
      <div
        v-if="!formState.printKey"
        class="flex justify-center items-center h-48 bg-[#F9FAFB] border border-dashed border-[#C6C6C6] rounded-md color-[#A6A6A6] select-none"
      >
        {{ t('sys.printDesigner.pleaseSelectLabelTmpl') }}
      </div>

      <div
        v-else
        class="relative z-0 p-3 pb-1 min-h-48 bg-[#FBFBFC] rounded max-h-[416px] overflow-y-auto"
      >
        <div
          v-if="!formState.mappingFields.length"
          class="flex justify-center items-center absolute inset-0"
        >
          <div
            class="text-[var(--ant-primary-color)] cursor-pointer select-none hover:opacity-80"
            @click="handleFieldAddClick"
          >
            + {{ t('sys.printDesigner.addLabelTmplParam') }}
          </div>
        </div>
        <div
          v-for="(row, rowIndex) in formState.mappingFields"
          :key="row.id"
          class="flex items-center mb-2"
        >
          <a-form-item
            class="mapping-field-item"
            :class="
              duplicatedRowKeyList.includes(row.key) ? 'ant-form-item-has-error duplicated-key' : ''
            "
            style="margin-bottom: 0"
            :name="['mappingFields', rowIndex, 'key']"
            :rules="{ required: true, message: '' }"
          >
            <a-input
              class="shrink-0 w-32"
              :placeholder="t('sys.printDesigner.pleaseEnterParam')"
              :id="`btw-label-field-${row.id}`"
              v-model:value="row.key"
              @change="handleFieldKeyChange(row.key)"
            />
          </a-form-item>

          <span class="shrink-0 mx-2 keep-all select-none">{{ t('sys.printDesigner.valueFrom') }}</span>

          <a-select
            class="shrink-0 w-32"
            :placeholder="t('sys.chooseText')"
            :options="isEdhr ? edhrFieldTypeOptions : fieldTypeOptions"
            v-model:value="row.type"
            @change="handleFieldTypeChange(rowIndex)"
          />

          <div class="grow ml-2 w-80">
            <a-form-item
              class="mapping-field-item"
              style="margin-bottom: 0"
              :name="['mappingFields', rowIndex, 'value']"
              :rules="{ required: true, message: '' }"
            >
              <a-input v-if="row.type === 'fixed'" :placeholder="t('sys.pleaseInputSth')" v-model:value="row.value" />

              <FieldCascader
                v-if="row.type === 'model'"
                allowClear
                valueSeparator="."
                :placeholder="t('sys.chooseText')"
                :key="String(isFieldListReady)"
                :modelName="modelName"
                :fieldMetaList="selectedModelFieldList"
                :value="row.value"
                @labelChange="(val) => handleUpdateLabel(rowIndex, val)"
                @FieldClick="(val) => handleUpdateValue(rowIndex, val)"
              />

              <a-input
                v-if="row.type === 'expression'"
                readOnly
                :allowClear="false"
                :placeholder="t('sys.pleaseInputSth')"
                class="expression-input"
                :value="row.value?.expression"
                @click="handleOpenExpr(rowIndex)"
              />
              <LabelParamsSelect
                v-if="row.type === 'label_params'"
                v-model="row.value"
                @change="(val, opt) => labelParamsChange(val, opt, rowIndex)"
              />
            </a-form-item>
          </div>

          <div
            class="shrink-0 flex justify-center items-center ml-3 w-8 h-8 text-[#8B8B8B] hover:text-black hover:bg-[#E8EAEE] rounded-sm cursor-pointer"
            @click="handleFieldDeleteClick(row.id)"
          >
            <i class="icon gct-iconfont icon-icon_shanchu"></i>
          </div>
        </div>
      </div>

      <div v-if="duplicatedRowKeyList.length" class="absolute mt-1 flex items-center">
        <img :src="svgFormItemErrorTip" />
        <span class="ml-1 text-[var(--ant-error-color)]">{{ t('sys.printDesigner.paramNameNotAllowedTip') }}</span>
      </div>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, nextTick } from 'vue';
  import { FormInstance, message } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getPrintBtwFileTree } from '/@/apis/gct-apaas/PrintController';
  import { getModelComprehensiveModelSummary } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import {
    postLabelBtw,
    putLabelBtwUpdate,
    postLabelBtwCopy,
  } from '/@/apis/gct-apaas/LabelController';
  import { LabelRequest } from '/@/apis/gct-apaas/model';
  import svgPrinter from '/@/assets/svg/icon-print-printer.svg';
  import svgFolder from '/@/assets/svg/icon-print-folder.svg';
  import svgFormItemErrorTip from '/@/assets/svg/icon-form-item-error-tip.svg';
  import { countBy, groupBy } from 'lodash-es';
  import { useUUid } from '@/hooks/web/useUUid';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';
  import {
    fieldTypeOptions,
    edhrFieldTypeOptions,
    fields2page,
    IMappingField,
    page2fields,
  } from './convert.util';
  import useExpression, { ExpressionModeEnum, ExpressionTabEnum } from '/@/components/Expression';
  import { FIELD_TYPE } from '@gct/runtime';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { FieldCascader } from '/@/components/FieldCascader';
  import LabelParamsSelect from '../label-design/panels/widget/components/label-params-select.vue';

  const props = defineProps<{
    isEdhr?: boolean;
  }>();

  interface LabelOption {
    label: string;
    value: string;
    type: 'service' | 'directory' | 'file';
    selectable: boolean;
    pathType?: string;
    children?: LabelOption[];
  }

  const { t } = useI18n();
  const { getUuid } = useUUid([] as any, '' as any);
  const { keyPad } = useKeyParser('plb');
  const { openModal, identify } = useExpression();

  const emit = defineEmits(['refresh', 'register']);

  const formRef = ref<FormInstance>();
  const printerTreeOptions = ref<LabelOption[]>([]);
  const isPrinterTreeLoading = ref(false);
  const printerSearchValue = ref('');
  const printerDropdownVisible = ref(false);
  const modelOptions = ref<any>([]);
  const isFieldListReady = ref(false);
  const selectedModelFieldList = ref<any>([]);
  const groupedModelOptions = ref<any>([]);
  const expandedIds = ref<string[]>([]);
  const type = ref<'new' | 'update' | 'copy'>('new');
  const map: Map<string, any[]> = new Map();
  const labelPath = ref();
  const printLabelOptions = ref([]);
  const isOrgin = ref(true); // isOrgin表示是否回填，如果回填则handleModelChange不走模型字段清空
  const labelRegex = /(?<!\\)\\(?!\\)/g;

  const formState = reactive<
    LabelRequest & { id?: string; mappingFields: IMappingField[]; pathType?: string }
  >({
    key: '',
    printKey: undefined,
    modelKey: undefined,
    mappingFields: [],
    pathType: undefined,
  });

  const getPathList = (tree: LabelOption[], value: string) => {
    const pathList: LabelOption[] = [];

    function dfs(nodes, currentPathList) {
      for (const node of nodes) {
        const newPathList = [...currentPathList, node];
        if (node.value === value) {
          pathList.push(...newPathList);
          return true;
        }
        if (node.children && dfs(node.children, newPathList)) {
          return true;
        }
      }
      return false;
    }

    dfs(tree, []);
    return pathList;
  };

  const isEdit = computed(() => !!formState.id);

  const isCopy = computed(() => !formState.id && type.value === 'copy');

  const modelTitle = computed(() => (isEdit.value ? t('sys.edit') : isCopy.value ? t('sys.copy') : t('sys.printDesigner.convertTmpl')));

  const selectedPrinterLinkOptions = computed(() => {
    if (!formState.printKey) return [];
    const list = getPathList(printerTreeOptions.value, formState.printKey);
    return list.length ? list : printLabelOptions.value;
  });

  const modelName = computed(() => {
    const { modelKey } = formState;
    return modelOptions.value.find((m) => m.key === modelKey)?.name || '';
  });

  const duplicatedRowKeyList = computed(() => {
    return Object.entries(countBy(formState.mappingFields, 'key'))
      .filter(([key, count]) => key && count > 1)
      .map(([key]) => key);
  });

  /**
   * 获取全路径列表以在回填时，printerTreeOptions中没有对应的printKey的情况下，从而显示路径名称而不是直接显示printKey
   * @param {Object} data - 回填数据
   * @returns {Array} 全路径列表
   */
  const getPathOptions = (data) => {
    if (!data.fullPath) return [];
    const keys = data.printKey?.split(':');
    const fullPath =
      data.printName + (isBtwFile(data.fullPath) ? data.fullPath : `${data.fullPath}.btw`);
    const pathArr = fullPath?.split('/') || [];
    return pathArr?.map((item, index) => {
      const data = {
        value:
          index === 0 ? keys[index] : index === pathArr.length - 1 ? keys[keys.length - 1] : index,
        label: item,
        type: index === 0 ? 'service' : index === pathArr.length - 1 ? 'file' : 'folder',
      };
      return data;
    });
  };

  const [registerInner, { closeModal, setModalProps }] = useModalInner(async (data) => {
    console.log('useModalInner-----', data);
    if (data?.data) {
      const { id, key, printKey, modelKey, designerJson, fullPath, pathType } = data.data;
      const { page } = JSON.parse(designerJson || '{}');
      const uuid = getUuid();
      type.value = data.type;
      formState.id = data.type === 'update' ? id : undefined;
      formState.key = data.type === 'update' ? key : keyPad(uuid);
      formState.printKey = printKey;
      formState.modelKey = modelKey;
      formState.mappingFields = designerJson ? page2fields(page || []) : [];
      formState.pathType = pathType;
      labelPath.value = fullPath;
      printLabelOptions.value = getPathOptions(data.data);
    } else {
      const uuid = getUuid();
      type.value = 'new';
      formState.id = undefined;
      formState.key = keyPad(uuid);
      formState.printKey = undefined;
      formState.modelKey = undefined;
      formState.mappingFields = [];
      formState.pathType = undefined;
    }
  });

  const filterModelOption = (input: string, option: any) => {
    if (!option.label) {
      return option.name.includes(input) || option.value.includes(input);
    }
    return false;
  };

  const convertLabelOptions = (options: any[]) => {
    return options.map((o) => {
      const { name, printKey, type, pathType, children } = o;

      const option: LabelOption = {
        label: name,
        value: printKey,
        pathType,
        type,
        selectable: type === 'file',
        children: children ? convertLabelOptions(children) : undefined,
      };
      return option;
    });
  };

  const getExpandedIds = (options: LabelOption[]) => {
    const ids: string[] = [];

    options.forEach((o) => {
      if (o.type !== 'file') {
        ids.push(o.value);

        if (o.children) {
          ids.push(...getExpandedIds(o.children));
        }
      }
    });

    return ids;
  };

  const handleQueryBtwTreeData = () => {
    isPrinterTreeLoading.value = true;

    getPrintBtwFileTree()
      .then((data: any) => {
        printerTreeOptions.value = data.map(({ id, name, fileTree }) => {
          const serviceOption: LabelOption = {
            label: name!,
            value: id!,
            type: 'service',
            selectable: false,
            children: convertLabelOptions(fileTree || []),
          };
          return serviceOption;
        });

        expandedIds.value = getExpandedIds(printerTreeOptions.value);

        // 新建时，刷新 btw 树结构后，如果没有找到已选项，则清空已选值
        setTimeout(() => {
          if (
            !isEdit.value &&
            formState.printKey &&
            !selectedPrinterLinkOptions.value.length &&
            !isCopy.value
          ) {
            formState.printKey = undefined;
          }
        }, 1);
      })
      .finally(() => {
        isPrinterTreeLoading.value = false;
      });
  };

  const handleModalVisibleChange = async (visible) => {
    if (!visible) return;

    // 初始化 模板 数据
    handleQueryBtwTreeData();

    // 初始化 模型 数据
    const modelData =
      (await getModelComprehensiveModelSummary({
        includeSys: 0,
        category: 'entity',
        report: true,
      })) || [];

    modelOptions.value = modelData;

    groupedModelOptions.value = groupBy(
      modelData.filter((i) => {
        if (i.category === 'view' && i.group === '系统') return false;
        return true;
      }),
      'group',
    );

    if (formState.modelKey) {
      handleModelChange(formState.modelKey);
    } else {
      isOrgin.value = false;
    }
  };

  const handleFilterTreeNode = (searchValue, { label }) => {
    if (!searchValue || !label) return false;
    return label.toLowerCase().includes(searchValue.toLowerCase());
  };

  const handlePrinterTreeExpand = (ids: any) => {
    expandedIds.value = Array.isArray(ids) ? ids : [];
  };

  const handlePrintSearch = (v: string) => {
    printerSearchValue.value = v;
  };

  const handleDropdownVisibleChange = (v: boolean) => {
    printerDropdownVisible.value = v;
    if (!v) {
      printerSearchValue.value = '';
    }
  };

  const handlePrinterTreeClick = (id: string, children?) => {
    if (children?.length) {
      if (expandedIds.value.includes(id)) {
        expandedIds.value = expandedIds.value.filter((_id) => _id !== id);
      } else {
        expandedIds.value = [...expandedIds.value, id];
      }
    }
  };

  const handleModelChange = async (modelKey: string) => {
    // 切换模型后，已选的模型字段需要清空
    if (!isOrgin.value) {
      formState.mappingFields.forEach((field) => {
        if (field.type === 'model' || field.type === 'expression') {
          field.value = '';
        }
      });
      selectedModelFieldList.value = [];
    }

    isOrgin.value = false;

    isFieldListReady.value = false;

    if (!modelKey) return;

    getFieldMetaList({ modelKey })
      .then((res) => {
        selectedModelFieldList.value = res || [];
      })
      .finally(() => {
        isFieldListReady.value = true;
      });
  };

  // 表达式只能选第一层
  const maxLevel = 1;
  const getModelFields = async (level = 1) => {
    const { modelKey } = formState;

    if (!modelKey) return [];

    // const children =
    //   selectedModelFieldList.value
    //     ?.filter(formulaFilter)
    //     .map((i) => ({ id: i.key!, name: i.name!, valueType: i.type! })) || [];

    // return [
    //   {
    //     id: modelKey,
    //     name: modelName.value,
    //     children,
    //   },
    // ];

    if (level > maxLevel) {
      return [];
    }
    const items: any[] = [];
    let files: any[] = [];
    if (!map.has(modelKey)) {
      files = (await getFieldMetaList({ modelKey }))!;
      if (files && files.length > 0) {
        map.set(modelKey, files);
      } else {
        files = [];
      }
    } else {
      files = map.get(modelKey)!;
    }
    const all: Promise<void>[] = [];
    files.forEach((item) => {
      const opt: any = {
        id: item.key,
        name: item.name,
        valueType: item.type,
      };
      items.push(opt);
      if ((item.type === FIELD_TYPE.REF || item.type === FIELD_TYPE.RDO_REF) && level <= maxLevel) {
        const fn = async () => {
          const arr = await getModelFields(level + 1);
          if (arr && arr.length > 0) {
            opt.children = arr;
          }
        };
        all.push(fn());
      }
    });
    await Promise.all(all);
    return items;
  };

  const handleFieldKeyChange = (value) => {
    if (!value) {
      setTimeout(() => {
        formRef.value?.clearValidate();
      });
    }
  };

  const handleFieldTypeChange = (rowIndex: number) => {
    formState.mappingFields[rowIndex].value = '';
  };

  const handleUpdateLabel = (rowIndex: number, label?: string) => {
    formState.mappingFields[rowIndex].label = label;
  };

  const handleUpdateValue = (rowIndex: number, value?: string) => {
    formState.mappingFields[rowIndex].value = value;
  };

  const handleOpenExpr = async (rowIndex: number) => {
    openModal({
      expr: formState.mappingFields[rowIndex].value.exp,
      mode: props.isEdhr ? ExpressionModeEnum.EDHR_LABEL_PRINT : ExpressionModeEnum.LABEL_PRINT,
      modelKey: props.isEdhr ? 'em_label_param' : undefined,
      identifiers: {
        [ExpressionTabEnum.FIELD]: await getModelFields(),
      },
      callback: (exp, expression) => {
        formState.mappingFields[rowIndex].value = {
          exp,
          expression,
          relationColumns: identify(exp),
        };
      },
    });
  };

  const handleFieldAddClick = () => {
    const id = Math.random().toString(36).slice(-8) + Date.now();

    formState.mappingFields.push({
      id,
      key: '',
      type: 'fixed',
      value: '',
    });

    // 快速实现滚动至底部
    setTimeout(() => {
      const input: any = document.querySelector(`#btw-label-field-${id}`);
      if (input) {
        input.focus();
        input.blur();
      }
    });
  };

  const handleFieldDeleteClick = (id: string) => {
    formState.mappingFields = formState.mappingFields.filter((row) => row.id !== id);
  };

  const handleModalClose = () => {
    formRef.value?.resetFields();
    isOrgin.value = true;
    closeModal();
  };

  /**
   * 判断文件名是否以.btw结尾
   * @param {string} fileName - 文件名（如"test.btw"、"file.txt.btw"、"test.BTW"）
   * @param {boolean} ignoreCase - 是否忽略大小写（默认true）
   * @returns {boolean} 是否为.btw结尾
   */
  function isBtwFile(fileName, ignoreCase = true) {
    if (typeof fileName !== 'string') return false; // 非字符串直接返回false
    const suffix = '.btw';
    // 忽略大小写：统一转小写后判断
    return ignoreCase ? fileName.toLowerCase().endsWith(suffix) : fileName.endsWith(suffix);
  }

  /**
   * 获取文件fullpath
   * @returns {string | undefined} 返回以.btw结尾的fullpath(不包括printName)
   */
  const getLabelPath = () => {
    const options = getPathList(printerTreeOptions.value, formState.printKey) || [];
    const paths = options.map((i) => i.label);
    paths.shift();
    return paths.length
      ? `/${paths.join('/')}`
      : labelPath.value
        ? isBtwFile(labelPath.value)
          ? labelPath.value
          : `${labelPath.value}.btw`
        : undefined;
  };

  const handleSubmit = async () => {
    if (duplicatedRowKeyList.value.length) {
      return;
    }

    formRef.value
      ?.validate()
      .then(async () => {
        setModalProps({ confirmLoading: true });

        const { id, key, printKey, modelKey, mappingFields } = formState;
        const name = selectedPrinterLinkOptions.value.slice(-1)[0]?.label.slice(0, -4);
        const pathType = selectedPrinterLinkOptions.value.slice(-2)[0]?.pathType;
        const page = mappingFields.length ? fields2page(mappingFields) : undefined;

        const designerJson = JSON.stringify({
          id,
          projectName: name,
          key,
          modelKey,
          printType: 'btw',
          page,
        });

        if (isEdit.value) {
          const formData = {
            id,
            designerJson,
            modelKey, // 绑定模型key
            printKey, // 标签模板唯一标识（btw标签模板）
            fullPath: getLabelPath(), // btw模板的相对路径
            pathType,
          };

          putLabelBtwUpdate(formData)
            .then(() => {
              message.success('编辑成功');
              emit('refresh');
              closeModal();
            })
            .finally(() => {
              setModalProps({ confirmLoading: false });
            });
        } else {
          const formData = {
            name,
            key,
            printKey,
            modelKey,
            version: '1',
            printType: 'btw',
            designerJson,
            fullPath: getLabelPath(),
            pathType,
          };

          if (isCopy.value) {
            try {
              await postLabelBtwCopy(formData);
              message.success(t('sys.printDesigner.copySuccess'));
              emit('refresh');
              closeModal();
            } catch (err) {
              setModalProps({ confirmLoading: false });
            }
          } else {
            try {
              await postLabelBtw(formData);
              message.success(t('sys.printDesigner.convertTmplSuccess'));
              emit('refresh');
              closeModal();
            } catch (err) {
              setModalProps({ confirmLoading: false });
            }
          }
          setModalProps({ confirmLoading: false });
        }
      })
      .catch(() => {});
  };

  function labelParamsChange(val, opt, idx) {
    formState.mappingFields[idx].label = opt?.label;
  }
</script>

<style lang="less" scoped>
  .input-and-select-group {
    :deep(.ant-input-affix-wrapper) {
      width: 100px;
      border-right: none;
      border-radius: 4px 0 0 4px;
      pointer-events: none;

      input {
        text-align: center;
      }
    }

    :deep(.ant-select .ant-select-selector) {
      border-radius: 0 4px 4px 0;
    }
  }

  :deep(.ant-form-item-has-error.duplicated-key .ant-input) {
    color: var(--ant-error-color);
  }

  :deep(.mapping-field-item .ant-form-item-explain) {
    display: none;
  }

  :deep(.expression-input .ant-input) {
    cursor: pointer !important;
  }

  :deep(.ant-select-disabled .ant-select-selector) {
    cursor: default !important;
  }
</style>

<style>
  .btw-label-tree-select .btw-label-tree-node {
    padding-left: 0;
  }

  .btw-label-tree-dropdown.ant-select-dropdown
    .ant-select-tree
    .ant-select-tree-node-content-wrapper {
    position: relative;
  }

  .btw-label-tag {
    padding: 2px 6px;
    border-width: 1px;
    border-style: solid;
    border-radius: 4px;
    font-size: 12px;
  }

  .btw-label-tag.common {
    border-color: #c0dbff;
    background: #e8f5ff;
    color: #1990ff;
  }

  .btw-label-tag.local {
    border-color: #e4e9f2;
    background: #f5f7fa;
    color: #5e6b7f;
  }
</style>
