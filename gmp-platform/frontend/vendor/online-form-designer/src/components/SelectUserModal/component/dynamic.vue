<template>
  <div class="select-user-modal__waiting-area">
    <div class="waiting-area-content">
      <Scrollbar class="px-12px py-24px">
        <a-checkbox-group v-model:value="selectDynFormatIds" :disabled="readonly" class="w100%">
          <div v-for="(el, i) in dynamicData" :key="i" class="waiting-area-content-item">
            <a-checkbox
              :value="`${el.formatId}:current`"
              @change="(e) => handleDynamicCheck(e, el, el.formatId)"
            >
              <div class="ks-col pl-8px">
                <div :title="el.name" class="content-item-title gct-text-overflow ks-col">
                  {{ el.name }}
                </div>
                <div :title="el.desc" class="content-item-desc gct-text-overflow ks-col">
                  {{ el.desc }}
                </div>
              </div>
            </a-checkbox>
            <div
              v-if="
                el.showPanel &&
                el.panelType === 'area' &&
                selectDynFormatIds.includes(`${el.formatId}:current`)
              "
              class="content-item-user-select-area"
            >
              <template v-for="(pKey, index) of el.panelKey">
                <a-checkbox
                  class="!w-auto"
                  v-for="field in fieldMap[pKey]"
                  :key="field.id"
                  :value="`${el.formatId}:${field.key}`"
                  @change="(e) => handleDynamicCheck(e, field)"
                >
                  <div class="content-item-title gct-text-overflow pl-4px" :title="field.name">{{
                    field.name
                  }}</div>
                </a-checkbox>
              </template>
            </div>
            <a-tree-select
              v-if="
                el.showPanel &&
                el.panelType === 'select' &&
                selectDynFormatIds.includes(`${el.formatId}:current`)
              "
              multiple
              v-model:value="orgDsValue"
              :show-checked-strategy="TreeSelect.SHOW_PARENT"
              :fieldNames="{ children: 'children', label: 'name', value: 'id' }"
              :height="233"
              class="w-260px !ml-20px !my-4px"
              :tree-data="treeData"
              placeholder="请选择部门负责人"
              tree-default-expand-all
              treeNodeFilterProp="name"
            />
          </div>
        </a-checkbox-group>
      </Scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts" name="waiting-area-dynamic">
  import { ref, watch, computed } from 'vue';
  import { TreeSelect } from 'ant-design-vue';
  import { pick } from 'lodash-es';
  import { Scrollbar } from '/@/components/Scrollbar';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { DYN_FORMAT_TYPE_ENUM, findUniqueNode, dynamicData } from '../utils/index';

  const props = defineProps<{
    fieldMap: any;
    treeData: any;
    selectDyn: any;
    readonly?: boolean;
  }>();

  const emit = defineEmits(['update:selectDyn']);

  const selectDynFormatIds = computed(() => {
    return props.selectDyn?.map((item) => item.formatId);
  });

  const orgDsValue = computed<string[]>({
    get() {
      const list = processByPrefix(props.selectDyn, DYN_FORMAT_TYPE_ENUM.DYN_DEPT_PRINCIPAL, true);
      return list
        .map((e) =>
          e.formatId.replace(new RegExp(`^${DYN_FORMAT_TYPE_ENUM.DYN_DEPT_PRINCIPAL}:`), ''),
        )
        .filter((item) => item !== 'current');
    },
    set(values: string[]) {
      const otherList = processByPrefix(props.selectDyn, DYN_FORMAT_TYPE_ENUM.DYN_DEPT_PRINCIPAL);
      const list = processByPrefix(props.selectDyn, DYN_FORMAT_TYPE_ENUM.DYN_DEPT_PRINCIPAL, true);

      const selected = values.map((value) => {
        const node = findUniqueNode(props.treeData, value);
        return {
          id: value,
          formatId: `${DYN_FORMAT_TYPE_ENUM.DYN_DEPT_PRINCIPAL}:${value}`,
          name: node?.name,
        };
      });

      const selectList = [
        ...list.filter(
          (a) =>
            selected.some((b) => b.formatId === a.formatId) ||
            a.formatId === `${DYN_FORMAT_TYPE_ENUM.DYN_DEPT_PRINCIPAL}:current`,
        ),
        ...selected.filter((b) => !list.some((a) => a.formatId === b.formatId)),
      ];

      emit('update:selectDyn', [...otherList, ...selectList]);
    },
  });

  const processByPrefix = (array, prefix, keep = false) => {
    const regex = new RegExp(`^${prefix}:`);

    return array.filter((item) => (keep ? regex.test(item.formatId) : !regex.test(item.formatId)));
  };

  function handleDynamicCheck(event, data, formatId?: string) {
    const { value, checked } = event.target;

    let selectList = props.selectDyn ?? [];

    if (checked) {
      selectList?.push({
        ...pick(data, ['id', 'name']),
        formatId: value,
      });
    } else {
      if (formatId) {
        selectList = processByPrefix(selectList, formatId);
      } else {
        selectList = selectList.filter((f) => f.formatId !== value);
      }
    }

    emit('update:selectDyn', selectList);
  }
</script>

<style scoped lang="less">
  .waiting-area-content-item {
    margin-bottom: 20px;
    flex-direction: column;

    :deep(.ant-checkbox-wrapper) {
      .content-item-title {
        color: #474747 !important;
      }
      .content-item-desc {
        color: #8f8f8f;
        font-size: 12px;
        margin-top: 2px;
        line-height: 18px;
      }
    }

    .content-item-user-select-area {
      margin: 4px 0;
      background: #fafafa;
      border-radius: 4px;
      padding: 8px;
      margin-left: 20px;

      display: grid;
      grid-column-gap: 8px;
      grid-row-gap: 8px;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));

      :deep(.ant-checkbox-wrapper) {
        margin-right: 0 !important;
        .content-item-title {
          color: #212528 !important;
        }
      }
    }
  }
</style>
