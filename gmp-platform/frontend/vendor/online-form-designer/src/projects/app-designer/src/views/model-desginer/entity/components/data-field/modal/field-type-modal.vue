<template>
  <a-modal
    v-model:visible="visible"
    :title="$t('sys.new') + $t('sys.field')"
    width="640px"
    wrapClassName="field-type-modal ant-modal-new"
    :ok-text="$t('sys.editor.next')"
    :afterClose="afterClose"
    @ok="handleOk"
  >
    <a-layout>
      <a-layout-sider width="150px" theme="light">
        <a-menu v-model:selectedKeys="selectedMenu" mode="inline">
          <a-menu-item v-for="k in validCategories" :key="k">
            {{ $t(`sys.model.${k}`) }}
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout-content>
        <div class="input-wrap">
          <a-input v-model:value="search" :placeholder="$t('sys.model.searchFieldType')">
            <template #suffix>
              <i class="iconfont icon-sousuo1"></i>
            </template>
          </a-input>
        </div>
        <div class="fields-list-wrapper">
          <div ref="fieldsListRef" class="fields-list">
            <div
              v-for="(item, index) in searchedFieldList"
              :key="index"
              :class="['filed-item', { 'is-selected': item === selectedType }]"
              :id="item"
              @click="handleSelectType(item)"
            >
              <div class="field-name" :id="item">
                <span>{{ $t(`sys.pageDesigner.fieldCmp.${item}`) }}</span>
                <span v-show="selectedMenu[0] === FIELD_TYPE_CATEGORY.ALL" class="field-type">
                  {{ getCategoryLabel(item) }}
                </span>
              </div>
              <div class="field-desc">
                {{ $t(`sys.model.${item === 'enum' ? 'ref_enum' : item}_tip`) }}
              </div>
            </div>
            <div
              v-for="(item, index) in searchedBalanceFieldList"
              :class="['filed-item', { 'is-selected': item.key === selectedType }]"
              :id="item"
              :key="index"
              @click="handleSelectType(item.key)"
            >
              <div class="field-name" :id="item">
                <span>{{ item.name }}</span>
                <span v-show="selectedMenu[0] === FIELD_TYPE_CATEGORY.ALL" class="field-type">
                  {{ $t('sys.model.field_type_material_balance') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </a-layout-content>
    </a-layout>
  </a-modal>
</template>
<script lang="ts" setup>
  import { ref, computed, inject } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useModalDragMove } from '/@/components/Modal/src/hooks/useModalDrag';
  import {
    FIELD_TYPE_CATEGORY,
    FIELD_TYPE,
    FIELD_TYPE_BASIC,
    FIELD_TYPE_LOGIC,
    FIELD_TYPE_TRACE,
    FIELD_TYPE_BUSINESS,
    FIELD_TYPE_PRODUCE,
    FIELD_TYPE_MATERIAL,
  } from '@/enums/appEnum';
  import { useAppInfoStore } from '/@/store/modules/app-info';
  import { getNeedShowFields, getNeedShowCategories } from '../utils';
  import { useModelConfig } from '/@web-render/views/edhr-application/render/model-config/useModelConfig';

  const isInOnlineForm = inject<boolean>('isInOnlineForm', false);
  const { getModelFields } = useModelConfig();

  const emit = defineEmits(['next']);
  const { t } = useI18n();
  const visible = ref(false);
  const selectedMenu = ref([FIELD_TYPE_CATEGORY.ALL]);
  const selectedType = ref(FIELD_TYPE.TEXT);
  const search = ref(undefined);
  const { appInfo } = useAppInfoStore();

  const validCategories = computed(() => {
    const Need2ShowCategories = getNeedShowCategories({
      suiteKey: appInfo.suiteKey,
      isInOnlineForm,
    });

    const cates = Object.values(FIELD_TYPE_CATEGORY).filter((item) =>
      Need2ShowCategories.includes(item),
    );
    // 没有配置自定义字段时，显示物料平衡的分类
    return balanceFields.value.length
      ? cates
      : cates.filter((e) => e !== FIELD_TYPE_CATEGORY.BALANCE);
  });

  const getCategoryLabel = (item) => {
    const categoryMap = [
      [FIELD_TYPE_BASIC, FIELD_TYPE_CATEGORY.BASIC],
      [FIELD_TYPE_LOGIC, FIELD_TYPE_CATEGORY.LOGIC],
      [FIELD_TYPE_TRACE, FIELD_TYPE_CATEGORY.TRACE],
      [FIELD_TYPE_BUSINESS, FIELD_TYPE_CATEGORY.BUSINESS],
      [FIELD_TYPE_MATERIAL, FIELD_TYPE_CATEGORY.MATERIAL],
      [FIELD_TYPE_PRODUCE, FIELD_TYPE_CATEGORY.PRODUCE],
    ];

    for (const [values, category] of categoryMap) {
      if (Object.values(values).includes(item)) {
        return t(`sys.model.${category}`);
      }
    }

    return t(`sys.model.${FIELD_TYPE_CATEGORY.LOGIC}`);
  };

  const fieldsListRef = ref();
  const balanceFields = ref<any[]>([]);

  const props = defineProps({
    isSubModel: {
      type: Boolean,
      default: false,
    },
    isDataModel: {
      type: Boolean,
      default: false,
    },
    maxSubLevel: {
      type: Number,
      default: 0,
    },
    keyList: {
      type: Array,
      default: () => [],
    },
  });

  // modal拖拽的方法
  useModalDragMove({ visible, destroyOnClose: ref(false), draggable: ref(true) });

  const fieldList = computed(() => {
    const category = selectedMenu.value[0];

    if (category === FIELD_TYPE_CATEGORY.BALANCE) {
      return [];
    }

    // 创建分类到字段的映射
    const categoryMap = {
      [FIELD_TYPE_CATEGORY.BASIC]: Object.entries(FIELD_TYPE_BASIC),
      [FIELD_TYPE_CATEGORY.LOGIC]: Object.entries(FIELD_TYPE_LOGIC),
      [FIELD_TYPE_CATEGORY.TRACE]: Object.entries(FIELD_TYPE_TRACE),
      [FIELD_TYPE_CATEGORY.BUSINESS]: Object.entries(FIELD_TYPE_BUSINESS),
      [FIELD_TYPE_CATEGORY.MATERIAL]: Object.entries(FIELD_TYPE_MATERIAL),
      [FIELD_TYPE_CATEGORY.PRODUCE]: Object.entries(FIELD_TYPE_PRODUCE),
    };

    // 获取对应的字段数据，如果没有匹配则使用 FIELD_TYPE
    const data = categoryMap[category] || Object.entries(FIELD_TYPE);

    const NeedShowFields = getNeedShowFields({
      suiteKey: appInfo.suiteKey,
      isSubModel: props.isSubModel,
      isDataModel: props.isDataModel,
      isInOnlineForm,
      maxSubLevel: props.maxSubLevel,
    });

    // 返回需要显示的字段结果
    return data.filter(([key, type]) => NeedShowFields.includes(type));
  });

  const searchedFieldList = computed(() => {
    const filterList = fieldList.value.filter((e) => {
      const value = t(`sys.pageDesigner.fieldCmp.${e[1]}`);
      return value.toLowerCase().indexOf((search.value || '').toLowerCase()) >= 0;
    });
    return Object.fromEntries(filterList);
  });

  const searchedBalanceFieldList = computed(() => {
    return balanceFields.value.filter((e) => {
      return e.name.indexOf(search.value || '') >= 0;
    });
  });

  const open = async (data, history: any = {}) => {
    visible.value = true;
    search.value = history.search || undefined;
    selectedMenu.value = history.selectedMenu || [FIELD_TYPE_CATEGORY.ALL];
    selectedType.value =
      selectedMenu.value[0] === FIELD_TYPE_CATEGORY.BALANCE
        ? data?.key
        : data?.type || FIELD_TYPE.TEXT;
    setTimeout(() => {
      const parentDiv = document.querySelector('.fields-list-wrapper') as HTMLElement;
      const selectedDiv = document.querySelector('.filed-item.is-selected') as HTMLElement;
      const selectedTop = selectedDiv.offsetTop;
      const parentTop = parentDiv.offsetTop;
      parentDiv.scrollTo(0, selectedTop - parentTop);
    });
    if (props.isSubModel) {
      const fls = await getModelFields('em_material_balance_model');
      balanceFields.value = fls.filter((e) => !props.keyList?.includes(e.key));
    }
  };
  const afterClose = () => {
    // selectedMenu.value = [FIELD_TYPE_CATEGORY.ALL];
    // selectedType.value = FIELD_TYPE.TEXT;
    // search.value = undefined;
  };
  // 选中字段类型
  const handleSelectType = (val) => {
    selectedType.value = val;
    // search.value = undefined;
  };
  // 下一步
  const handleOk = () => {
    visible.value = false;
    const balaField = balanceFields.value.find((e) => e.key === selectedType.value);
    emit(
      'next',
      selectedType.value,
      { search: search.value, selectedMenu: selectedMenu.value },
      balaField
        ? {
            key: selectedType.value,
            name: balaField?.name,
            type: balaField?.mappingType,
            required: balaField?.required,
          }
        : undefined,
    );
    // emit('next', selectedType.value);
  };

  defineExpose({
    open,
  });
</script>
<style lang="less" scoped>
  :deep(.ant-layout-sider) {
    padding: 16px 0 16px 16px;

    .ant-menu-inline {
      border: 0;

      .ant-menu-item {
        margin-top: 0;
        margin-bottom: 12px;
        padding: 0 !important;
        text-align: center;

        &:last-child {
          margin: 0;
        }
      }
    }
  }

  :deep(.ant-layout.ant-layout-has-sider) {
    height: 100%;
  }

  :deep(.ant-layout-content) {
    max-height: 62vh;
    overflow: hidden;
    border-left: 1px solid @gct-modal-border-color;
    background-color: #fff;
  }

  .input-wrap {
    padding: 16px 16px 0;
  }

  .fields-list-wrapper {
    box-sizing: border-box;
    height: calc(62vh - 84px);
    margin-top: 20px;
    padding: 0 16px 16px;
    overflow: auto;
  }

  .fields-list {
    .filed-item {
      padding: 10px 12px;
      border: 1px solid #fff;
      border-radius: 4px;
      cursor: pointer;

      & + .filed-item {
        margin-top: 8px;
      }

      .field-name {
        margin-bottom: 4px;
        color: #212528;
      }

      .field-type {
        display: inline-block;
        margin-left: 8px;
        padding: 2px 6px;
        border-radius: 2px;
        background-color: @gct-table-header-bgcolor;
        color: #797a7d;
        font-size: 10px;
        vertical-align: bottom;
      }

      .field-desc {
        color: @gct-placeholder-color;
        font-size: 12px;
      }

      &:hover {
        box-shadow: 0 0 6px 0 rgb(0 0 0 / 8%);

        .field-name {
          color: var(--ant-primary-color);
        }

        .field-desc {
          color: #797a7d;
        }
      }

      &.is-selected {
        border: 1px solid var(--ant-primary-color);
        background-color: rgba(from var(--ant-primary-color) r g b / 5%) !important;

        .field-name {
          color: var(--ant-primary-color);
        }

        .field-desc {
          color: #384356;
        }
      }
    }
  }
</style>
<style lang="less">
  .field-type-modal {
    .ant-modal-body {
      padding: 0;
    }
  }
</style>
