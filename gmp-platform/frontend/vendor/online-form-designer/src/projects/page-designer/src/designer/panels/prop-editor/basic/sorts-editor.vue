<template>
  <a-form-item-rest>
    <div class="ks-row mb6px">
      <span>
        {{ propConfig?.label || $t('sys.pageDesigner.collationField') }}
      </span>
      <a @click="handleClick" class="ml-auto">
        {{ $t('sys.pageDesigner.add') }}
      </a>
    </div>
    <draggable
      :list="collationList"
      handle=".cursor-move"
      :animation="200"
      chosen-class="drawing-chosen"
      drag-class="drawing-drag"
      item-key="id"
      class="field-list"
    >
      <template #item="{ element, index }">
        <div class="ks-row-middle fieldrow mb5px">
          <span
            class="icon-drag iconfont mr4px cursor-move text-[#C3C3C3] primary-gct-hover"
          ></span>
          <div class="ks-col ks-row">
            <div class="w86px">
              <a-select
                v-model:value="element.collationField"
                :placeholder="$t('sys.chooseText')"
                size="small"
              >
                <template v-for="(opt, ind) in options">
                  <a-select-option
                    :value="opt.key"
                    :key="ind"
                    v-if="
                      !collationList.some((i) => i.collationField === opt.key) ||
                      opt.key === element.collationField
                    "
                    >{{ opt.name }}</a-select-option
                  ></template
                >
              </a-select></div
            >
            <div class="w4px"></div>
            <div class="w86px">
              <a-select
                v-model:value="element.collationSort"
                :placeholder="$t('sys.chooseText')"
                size="small"
              >
                <a-select-option v-for="opt in sortTypeEnum" :value="opt" :key="opt">{{
                  $t('sys.pageDesigner.' + opt)
                }}</a-select-option>
              </a-select></div
            >
          </div>
          <a-tooltip title="删除">
            <span
              v-show="collationList.length > 1"
              @click="deleteList(index)"
              class="icon-shanchu iconfont cursor-pointer text-[#797A7D] ml4px"
            ></span
          ></a-tooltip>
        </div>
      </template>
    </draggable>
  </a-form-item-rest>
</template>

<script setup lang="ts" name="sorts-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { ref, computed, reactive, onMounted } from 'vue';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { sortTypeEnum } from '/@page-designer/enum';
  import draggable from 'vuedraggable';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import { EntityModelCategoryEnum } from '@/projects/app-designer/src/enum';

  const defProps = defineProps(props);
  const propConfig = reactive(defProps.propConfig);

  const filterTypes = propConfig?.filterTypes;
  // 关联类型不支持排序
  const filterFields = [
    FIELD_TYPE.INTEGER,
    FIELD_TYPE.LONG,
    FIELD_TYPE.DOUBLE,
    FIELD_TYPE.DECIMAL,
    FIELD_TYPE.DATE,
    FIELD_TYPE.DATE_TIME,
    FIELD_TYPE.TIME,
  ];
  const widget = ref(defProps.widget);

  if (propConfig.standardSorting !== false) {
    filterFields.push(FIELD_TYPE.TEXT);
    filterFields.push(FIELD_TYPE.LONG_TEXT);
  }

  const options = ref<ReturnPromiseType<typeof getFieldMetaList>>([]);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);

  let modelKey =
    typeof propConfig?.getModelKey === 'function'
      ? propConfig.getModelKey(widget.value)
      : widget.value?.props.model;

  getFieldMetaList({ modelKey: modelKey }).then((res) => {
    options.value = res
      ?.filter((i) => checkKeyByList(i.createType!, filterTypes))
      .filter((j) => checkKeyByList(j.type!, filterFields));
  });

  function checkKeyByList(key: string, filters): boolean {
    return !filters || filters.indexOf(key) > -1;
  }
  const collationList = computed({
    get() {
      return (
        propValue.value || [
          {
            collationField: widget.value?.props.collationField,
            collationSort: widget.value?.props.collationSort,
          },
        ]
      );
    },
    set(value) {
      propValue.value = value;
    },
  });
  const handleClick = () => {
    if (!propValue.value) {
      propValue.value = [
        {
          collationField: widget.value?.props.collationField,
          collationSort: widget.value?.props.collationSort,
        },
      ];
    }
    propValue.value.push({
      collationField: undefined,
      collationSort: sortTypeEnum.DESC,
    });
  };
  const deleteList = (index) => {
    collationList.value.splice(index, 1);
    // 当 collationList 只剩一个并且没有 collationField 时默认显示创建时间
    // 模型为实体模型 entity 时
    if (
      collationList.value.length == 1 &&
      !collationList.value[0].collationField &&
      widget.value?.props.modeldata?.modelCategory == EntityModelCategoryEnum.ENTITY
    ) {
      propValue.value = [
        {
          collationField: propConfig.notCollationField ? null : 'create_time_',
          collationSort: sortTypeEnum.DESC,
        },
      ];
    }
  };

  const initData = () => {
    if (
      (!collationList.value || collationList.value.length === 0) &&
      (widget.value?.props.modeldata?.modelCategory == EntityModelCategoryEnum.VIEW ||
        propConfig.notCollationField)
    ) {
      setTimeout(() => {
        handleClick();
      });
    }
  };

  onMounted(() => {
    initData();
  });
</script>

<style lang="less" scoped>
  .fieldrow {
    padding: 4px;
    border-radius: 4px;
    background-color: #f2f4f7;
  }
</style>
