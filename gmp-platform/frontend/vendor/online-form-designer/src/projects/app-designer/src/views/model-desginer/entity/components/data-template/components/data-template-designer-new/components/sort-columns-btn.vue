<template>
  <div>
    <a-dropdown
      :visible="visible"
      :trigger="['click']"
      placement="bottomRight"
      :overlayStyle="{
        boxShadow: '0px 0px 4px 0px rgba(0,0,0,0.1)',
        width: '260px',
      }"
    >
      <a class="ant-dropdown-link" @click.prevent="dropdownChange">
        {{ t('sys.app.sortColumns') }}
      </a>
      <template #overlay>
        <div ref="dropdownRef" class="bg-[#ffffff] p8px" @click.prevent>
          <div class="px4px py8px text-[#212528] font-500">{{ t('sys.app.sortColumns') }}</div>
          <div class="parent-wrap max-h320px overflow-y-auto">
            <div
              v-for="(element, i) in data"
              :key="element.id"
              class="parent item"
              :class="[!element.subModel && 'ignore-item', data.length > 1 && 'parent-item']"
            >
              <div
                v-if="data.length > 1"
                class="ks-row-middle text-[#242424] py5px drag-row cursor-move"
              >
                <div
                  v-if="element.children && element.children.length"
                  class="cursor-pointer text-[12px] lh-22px w24px text-center"
                  :class="[!foldIds[element.id] && 'primary-gct']"
                  @click="updateFold(element.id)"
                >
                  <caret-down-outlined v-if="!foldIds[element.id]" />
                  <caret-right-outlined v-else />
                </div>
                <div
                  v-if="!element.subModel"
                  class="ks-col ell"
                  :title="element.aliasName || element.name"
                >
                  {{ element.aliasName || element.name }}
                </div>
                <div class="ks-col ks-row overflow-hidden" v-else>
                  <div class="ell" :title="element.bindField?.name">
                    {{ element.bindField?.name }}
                  </div>
                  <span class="sub-tag ml4px">{{ t('sys.pageDesigner.subTable') }}</span>
                </div>
                <span
                  v-if="element.subModel"
                  class="icon-drag iconfont w20px lh-22px text-[#C3C3C3] primary-gct-hover cursor-move"
                ></span>
              </div>
              <div v-show="!foldIds[element.id]" class="child-wrap" :class="`child-wrap-${i}`">
                <div
                  v-for="child in element.children"
                  :key="child.id"
                  class="ks-row-middle fieldrow py6px text-[14px] lh-20px child item drag-row cursor-move"
                  :class="[data.length > 1 ? 'pl24px' : 'pl4px']"
                  :data-model="element.key"
                  :data-submodel="element.subModel"
                >
                  <span
                    class="iconfont mr4px primary-gct field-icon"
                    :class="FieldIconMap[child.type]"
                  ></span>
                  <div class="ks-col ell text-[#474747]" :title="child.aliasName || child.name">
                    {{ getColumnName(element.subModel, element.key, child.id) }}
                  </div>
                  <span class="icon-drag iconfont text-[#C3C3C3] primary-gct-hover w20px"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </a-dropdown>
  </div>
</template>
<script setup lang="ts">
  import { FieldIconMap } from '/@/enums/appEnum';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { nextTick, ref } from 'vue';
  import { onClickOutside } from '@vueuse/core';
  import Sortable from 'sortablejs';
  import { cloneDeep } from 'lodash-es';

  const emit = defineEmits(['after-sort']);
  const props = defineProps<{
    data: any[];
    table: any[];
  }>();

  const { t } = useI18n();
  const visible = ref(false);
  const dropdownRef = ref();
  // 注意：这里的expand为false表示展开
  const foldIds = ref<any>({});
  const copyIds = ref<any>({});

  function dropdownChange() {
    visible.value = true;
    foldIds.value = {};
    copyIds.value = {};
    nextTick(() => {
      initSortable('.parent-wrap', 'parent');
      props.data.forEach((e, i) => {
        e.children && initSortable(`.child-wrap-${i}`, 'child');
      });
    });
  }

  function initSortable(cls, name) {
    new Sortable(document.querySelector(cls), {
      group: {
        name,
        pull: false,
        put: false,
      },
      draggable: '.item',
      animation: 150,
      handle: '.drag-row',
      filter: '.ignore-item',
      onUnchoose: () => {
        foldIds.value = cloneDeep(copyIds.value);
      },
      onStart: (evt) => {
        const { item } = evt;
        const { model, submodel } = item.dataset;
        if (!model && !submodel) {
          copyIds.value = cloneDeep(foldIds.value);
          foldIds.value = props.data.reduce((obj, e) => {
            obj[e.id] = true;
            return obj;
          }, {});
        }
      },
      onMove: (evt) => {
        const { related } = evt;
        if (related?.outerHTML?.indexOf('ignore-item') > -1) {
          return false;
        }
      },
      onEnd: (evt) => {
        const { oldIndex, newIndex, item } = evt;
        const { model, submodel } = item.dataset;
        if (newIndex === oldIndex) return;
        if (!submodel && !model) {
          const childs = props.data.find((e) => !e.subModel)?.children || [];
          // eslint-disable-next-line vue/no-mutating-props
          props.table.splice(
            childs.length + newIndex - 1,
            0,
            // eslint-disable-next-line vue/no-mutating-props
            props.table.splice(childs.length + oldIndex - 1, 1)[0],
          );
        }
        if (submodel === '0') {
          // eslint-disable-next-line vue/no-mutating-props
          props.table.splice(newIndex!, 0, props.table.splice(oldIndex!, 1)[0]);
        } else if (submodel === '1') {
          props.table.forEach((e) => {
            if (e.modelKey === model && e.children) {
              e.children.splice(newIndex, 0, e.children.splice(oldIndex, 1)[0]);
            }
          });
        }
        if (!model) {
          // eslint-disable-next-line vue/no-mutating-props
          props.data.splice(newIndex!, 0, props.data.splice(oldIndex!, 1)[0]);
        } else {
          props.data.forEach((e) => {
            if (e.key === model && e.children) {
              e.children.splice(newIndex, 0, e.children.splice(oldIndex, 1)[0]);
            }
          });
        }
        emit('after-sort');
      },
    });
  }

  function updateFold(id) {
    foldIds.value[id] = !foldIds.value[id];
  }

  function getColumnName(subModel, mKey, fId) {
    let field: any;
    if (!subModel) {
      field = props.table.find((e) => mKey === e.modelKey && e.id === fId) || {};
    } else {
      const obj = props.table.find((e) => e.modelKey === mKey);
      field = obj?.children.find((e) => e.id === fId) || {};
    }
    return field?.params?.aliasName || field?.params?.name;
  }

  onClickOutside(dropdownRef, () => {
    visible.value = false;
  });
</script>
<style lang="less" scoped>
  .field-icon {
    font-size: 14px;
  }
  .field-list {
    max-height: 320px;
    overflow: auto;
  }
  .sub-tag {
    display: inline-block;
    padding: 0 6px;
    border-radius: 4px;
    background: rgba(15, 186, 132, 0.12);
    color: #0fba84;
    min-width: 40px;
  }
  .child.item,
  .parent-item > div:first-child {
    &:hover {
      background-color: #f7f8fa;
      border-radius: 4px;
    }
  }
  .sortable-chosen {
    background-color: hsl(from var(--ant-primary-color) h s 95%);
  }
  .parent-item.sortable-chosen {
    .child-wrap {
      display: none;
    }
  }
</style>
