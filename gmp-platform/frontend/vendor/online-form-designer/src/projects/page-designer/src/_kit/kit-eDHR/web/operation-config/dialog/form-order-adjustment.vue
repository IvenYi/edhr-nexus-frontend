<template>
  <div class="form-order-adjustment-container">
    <div class="draggable-container">
      <div class="title">
        <span class="ml-48px pl-16px ks-col ell">{{ $t('sys.onlineForm.formName') }}</span>
        <span class="px-16px">{{ $t('sys.edhr.endBeforeCompletion') }}</span>
      </div>

      <draggable
        :list="sort"
        handle=".cursor-move"
        :animation="200"
        chosen-class="drawing-chosen"
        drag-class="drawing-drag"
        item-key="id_"
        class="field-list"
      >
        <template #item="{ element }">
          <div class="fieldrow" v-if="!element.deleted_">
            <span class="icon-drag iconfont cursor-move primary-gct-hover"></span>
            <a-tooltip>
              <template #title>{{ element.name_ }}</template>
              <div class="name ks-col ell"> {{ element.name_ }}</div>
            </a-tooltip>
            <div class="action">
              <a-switch disabled size="small" :checked="element.force_submit_" />
            </div>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, unref } from 'vue';
  import { IModal, useModal } from '@gct/runtime';
  import draggable from 'vuedraggable';

  const props = withDefaults(
    defineProps<{
      sortData: any[];
      modal: IModal;
      callback?: any;
    }>(),
    {},
  );

  const sort = ref(props.sortData);

  async function onSave() {
    try {
      return {
        ok: true,
        params: {
          data: sort.value.map((item) => item.id_),
        },
      };
    } catch (err) {
      console.warn(err);
    }
    return {
      ok: false,
    };
  }

  useModal(onSave);
</script>
<style lang="less" scoped>
  .form-order-adjustment-container {
    position: relative;
    padding: 16px;

    .draggable-container {
      border: 1px solid #e8ebf0;
      border-radius: 4px;

      .title {
        height: 44px;
        background: #f6f8fa;
        border-bottom: 1px solid #e8ebf0;
        color: #1a1d23;
        display: flex;
        align-items: center;

        > span {
          position: relative;
          &::before {
            content: '';
            position: absolute;
            width: 1px;
            height: 100%;
            background: #e0e3eb;
            left: 0;
          }
        }
      }

      .fieldrow {
        height: 44px;
        display: flex;
        align-items: center;
        border-bottom: 1px solid #e8ebf0;

        &:hover {
          background: #e1f0ff;
        }

        &:last-child {
          border-bottom: none;
        }

        .iconfont {
          line-height: 1;
          width: 48px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .name {
          padding: 0 16px;
          color: #1a1d23;
        }

        .action {
          padding: 0 16px;
          width: 102px;
        }
      }
    }
  }
</style>
