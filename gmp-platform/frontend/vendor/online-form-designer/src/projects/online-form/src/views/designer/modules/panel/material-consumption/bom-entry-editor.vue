<template>
  <div class="bom-entry-editor">
    <a-button type="dashed" block @click="() => add()" class="primary-gct mb8px">
      <plus-outlined />
      {{ $t('sys.kit.addMaterial') }}
    </a-button>
    <draggable
      :list="showList"
      handle=".mover"
      :animation="200"
      chosen-class="drawing-chosen"
      drag-class="drawing-drag"
      item-key="id"
      class="dragable-wrap max-h420px overflow-auto"
      @end="onDragEnd"
    >
      <template #item="{ element }">
        <div class="bom-entry-item flex items-center">
          <i v-if="!disabled" class="iconfont icon-drag mover"></i>
          <div class="bom-entry-item-content ks-col">
            <div class="bom-entry-item-content-item ell overflow-hidden">
              <TranslateSpan :key="element.product_id_" :value="element.product_id_" />
            </div>
            <div
              class="text-[#5A5F6B] ell"
              :title="`${$t('sys.edhr.unitQty')}：${element.qty_required_}`"
            >
              {{ $t('sys.edhr.unitQty') }}：{{ element.qty_required_ }}
            </div>
          </div>
          <div class="bom-entry-item-btns ml8px">
            <a-tooltip :title="$t('sys.edit')">
              <i class="iconfont btn-item icon-bianjimingcheng" @click="edit(element)"></i>
            </a-tooltip>
            <a-popconfirm
              placement="topLeft"
              :title="$t('sys.pageDesigner.confirmTodo')"
              @confirm="() => remove(element)"
            >
              <a-tooltip :title="$t('sys.delete')">
                <i class="iconfont btn-item icon-shanchu"></i>
              </a-tooltip>
            </a-popconfirm>
          </div>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script lang="ts" setup name="bom-entry-editor">
  import { cloneDeep } from 'lodash-es';
  import BomModal from './bom-modal.vue';
  import { watch, onMounted, ref, computed } from 'vue';
  import draggable from 'vuedraggable';
  import { IBomEntry } from '@gct/nocode-base';
  import TranslateSpan from './translate-span.vue';

  const props = withDefaults(
    defineProps<{
      list?: IBomEntry[];
      disabled?: boolean;
    }>(),
    {
      list: undefined,
    },
  );

  const emit = defineEmits<{
    (e: 'update:list', list?: IBomEntry[]): void;
  }>();

  /** 过滤且排序后的集合 */
  const showList = computed(
    () =>
      props.list
        ?.filter((item) => item.deleted_ !== true)
        .sort((a, b) => (a.operation_sort_num_ ?? 0) - (b.operation_sort_num_ ?? 0)) ?? [],
  );

  /** 计算已经存在的物料id集合（除开自身编辑的这个的） */
  function calcHasProductIds(editRow?: IBomEntry) {
    const ids = new Set<string>();
    showList.value.forEach((item) => {
      if (item === editRow) {
        return;
      }
      if (item.product_id_) {
        ids.add(item.product_id_);
      }
    });
    return Array.from(ids);
  }

  /** 编辑 */
  const edit = async (data?: any) => {
    const cloneData = cloneDeep(data);
    const res: any = await gct.openUtil.modal(BomModal, {
      data: cloneData,
      hasIds: calcHasProductIds(data),
    });
    if (res.ok) {
      Object.assign(data, res.data);
    }
  };

  /** 添加 */
  const add = async () => {
    const res: any = await gct.openUtil.modal(BomModal, {
      hasIds: calcHasProductIds(),
    });
    if (res.ok) {
      const newData = { ...res.data };
      // 新增的放最后
      newData.operation_sort_num_ = showList.value.length;
      props.list!.push(newData);
    }
  };

  const remove = (item: any) => {
    // 打删除标记
    item.deleted_ = true;

    // 删除完后把打标记并且id为空的临时数据删除掉。
    const newArr = props.list!.filter((item) => !(item.deleted_ === true && !item.id_));
    emit('update:list', newArr);
  };

  function onDragEnd(e) {
    // draggable组件已经修改了showList，所以这里不需要处理
    // 更新排序字段
    showList.value.forEach((item, index) => {
      item.operation_sort_num_ = index;
    });
  }

  onMounted(() => {
    // 默认为空的话补个数组
    if (!props.list) {
      emit('update:list', []);
    }
  });
</script>

<style lang="less" scoped>
  .bom-entry-item {
    color: #1a1d23;
    font-size: 12px;
    padding: 10px 0;
    border: 1px dashed #e0e3eb;
    border-radius: 4px;
    background-color: #fff;

    & + & {
      margin-top: 8px;
    }

    &:hover {
      border-color: var(--ant-primary-color);
      background-color: rgba(from var(--ant-primary-color) r g b / 2%);
    }

    &-content {
      width: 1px;
    }

    .iconfont {
      color: #a6a6a6;
      font-size: 14px;
      cursor: pointer;

      &.mover {
        color: #c6c6c6;
        padding: 0 4px;
      }

      &.btn-item {
        margin-right: 8px;
      }
    }
  }
</style>
