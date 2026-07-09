import type { FieldMetaDTO as OriginalFieldMetaDTO } from '/@/apis/gct-apaas/model';
import { ref, onMounted, h, computed, nextTick, reactive } from 'vue';
import SearchInput from './SearchInput.vue';
import { FIELD_TYPE } from '/@/enums/appEnum';
import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';

export function useFieldCascader(props: comPropsType, { onFieldClick }) {
  const { fieldMetaList, modelName, maxLevel, filterFieldByFunction = () => true } = props;
  const optionsMapByModalKey = ref<{ [key: string]: { keyword: string; option: Option[] } }>({});

  const fieldMapByKey = reactive<{ [key: string]: { name: string } }>({});
  /**根节点第一个查询 */
  const keyword = ref();
  // const searchKeywordByLevel = reactive<{ [key: string]: { id: string; keyword: string } }>({});
  const options = ref<Option[]>([]);
  const fieldValues = computed(() => {
    return props.value ? props.value.split(props.valueSeparator || '$') : [];
  });
  const visibleValue = ref(false);
  const filterOptions = computed(() => {
    const values = options.value.filter(
      (i) => !i.title || !keyword.value || i.title.includes(keyword.value || ''),
    );
    return values.map((i) => {
      const children = i.isExpandField
        ? recursionTreeFilterByKeyword(i, 2, optionsMapByModalKey.value)
        : [];
      return {
        ...i,
        children,
      };
    });
  });
  /**初始化自动展开 */
  async function autoExpand() {
    const fields = [...fieldValues.value];
    let nodeOptions = [...options.value];
    let level = 1;
    while (fields.length > 1) {
      const filedKey = fields.shift();
      const fieldItem = nodeOptions.find((i) => i.value === filedKey);
      if (!fieldItem) return;
      level++;
      nodeOptions = (await getChildrenOptionsByKey(fieldItem?.__props, level)) || [];
    }
  }
  onMounted(() => {
    /**添加第一列 */
    options.value = createOptionsByModel({
      fields: fieldMetaList,
      title: modelName,
      search: (val) => {
        keyword.value = val;
      },
      onFieldClick,
      level: 1,
      __bindFields: [],
    });
    autoExpand();
    // console.log('FieldCascader options', options.value, fieldMetaList);
  });

  /**根据模型key 获取子节点信息 */
  async function getChildrenOptionsByKey(
    { bindInfo: modelKey, relationModelName, id, __bindFields, key, name },
    level: number,
  ) {
    fieldMapByKey[key] = { name };
    /**级联字段唯一标识 */
    const fieldKey = id + level;
    if (optionsMapByModalKey.value[fieldKey]) {
      optionsMapByModalKey.value[fieldKey].keyword = '';
      return;
    }
    const res = await getModelMetaDetail({ modelKey });
    optionsMapByModalKey.value[fieldKey] = {
      keyword: '',
      option: [],
    };
    optionsMapByModalKey.value[fieldKey].option = createOptionsByModel({
      fields: res.fieldMetaList,
      title: relationModelName,
      search: (val) => {
        optionsMapByModalKey.value[fieldKey].keyword = val;
      },
      onFieldClick,
      level,
      __bindFields,
    });
    return optionsMapByModalKey.value[fieldKey].option;
  }

  function createSearchInput(onChange, level): Option {
    return {
      value: level,
      label: h(SearchInput, {
        visibleValue: visibleValue,
        onChange,
      }),
      isLeaf: false,
      __props: {},
      isExpandField: false,
    };
  }
  /**
   * 根据模型名称获取模型下拉数据
   */
  function createOptionsByModel({
    fields,
    title,
    search,
    level,
    onFieldClick,
    __bindFields,
  }): Option[] {
    const options: Option[] = [
      props.searchable ? createSearchInput(search, level) : null,
      createTitleItem(title),
    ].filter(Boolean) as Option[];
    fields.filter(filterFieldByFunction).forEach((row) => {
      options.push(
        createOptionItem(row, {
          level,
          onClick() {
            onFieldClick(row, level);
          },
          __bindFields,
        }),
      );
    });
    return options;
  }
  function createOptionItem(row: FieldMetaDTO, { level, onClick, __bindFields }): Option {
    const hasNext = level < maxLevel;
    const isExpandField = hasNext && isExpandFieldArg.includes(row.type!);
    row.__bindFields = [...__bindFields, row.key];
    // const labels = isExpandField ? `${row.name}(${row.relationModelName})` : row.name;
    const titleWithRelation = isExpandField ? `${row.name}(${row.relationModelName})` : row.name;
    const labels = row.name;
    return {
      value: row.key!,
      label: getFileldLabel(labels, isExpandField, onClick),
      title: labels,
      titleWithRelation,
      isLeaf: false,
      isExpandField,
      children: [],
      __props: row,
      __level: level,
      __id: row.id,
    };
  }
  /**根距关键字递归过滤tree */
  function recursionTreeFilterByKeyword(row: Option, level, optionKey) {
    const fieldKey = row.__id + level;
    const { option = [], keyword = '' } = optionKey[fieldKey] || {};
    const children = option.filter((i) => !i.title || !keyword || i.title.includes(keyword));
    return children.map((i) => {
      return {
        ...i,
        children: i.isExpandField ? recursionTreeFilterByKeyword(i, level + 1, optionKey) : [],
      };
    });
  }
  return {
    visibleValue,
    filterOptions,
    getChildrenOptionsByKey,
    fieldValues,
    fieldMapByKey,
  };
}

export const comProps = {
  fieldMetaList: {
    type: Object as PropType<comPropsType['fieldMetaList']>,
    default: () => [],
  },
  filterFieldByFunction: {
    type: Function,
    default: () => true,
  },
  modelName: {
    type: String,
    required: true,
    default: '',
  },
  maxLevel: {
    type: Number,
    default: 3,
  },
  value: {
    type: String,
    default: '',
  },
  allowClear: {
    type: Boolean,
    default: false,
  },
  valueSeparator: {
    type: String,
    default: '$',
  },
  searchable: {
    type: Boolean,
    default: true,
  },
  // 级联向左展开
  expandToLeft: {
    type: Boolean,
    default: false,
  },
};

function createTitleItem(title: string): Option {
  return {
    value: title,
    label: h('div', { class: 'gct-option-title ell' }, title),
    isLeaf: false,
    __props: {},
    isExpandField: false,
  };
}
const getFileldLabel = (labels, isExpandField, onClick) => {
  return (
    <div class="ell gct-option-label ks-row" onClick={onClick}>
      <div class="ks-col ell"> {labels}</div>
      {isExpandField ? <span class="iconfont icon-pad_arrow_right"></span> : null}
    </div>
  );
};
const isExpandFieldArg: string[] = [FIELD_TYPE.RDO_REF, FIELD_TYPE.REF, FIELD_TYPE.REF_MULTI];
export interface Option {
  value: string;
  label?: any;
  disabled?: boolean;
  children?: Option[];
  // 标记是否为叶子节点，设置了 `loadData` 时有效
  // 设为 `false` 时会强制标记为父节点，即使当前节点没有 children，也会显示展开图标
  isLeaf?: boolean;
  __props: FieldMetaDTO;
  __id?: string;
  [key: string]: any;
}
interface comPropsType {
  fieldMetaList: FieldMetaDTO[];
  modelName: string;
  maxLevel: number;
  value: string;
  valueSeparator?: string;
  searchable?: boolean;
  /**过滤函数 */
  filterFieldByFunction?: (w: FieldMetaDTO) => boolean;
}

// 局部扩展 FieldMetaDTO，仅在此文件内生效
interface FieldMetaDTO extends OriginalFieldMetaDTO {
  /**字段链路 */
  __bindFields?: string[];
}
