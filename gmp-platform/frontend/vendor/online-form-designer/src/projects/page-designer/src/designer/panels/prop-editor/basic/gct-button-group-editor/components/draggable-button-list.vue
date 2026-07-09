<template>
  <draggable
    :list="children"
    handle=".mover"
    :animation="200"
    chosen-class="drawing-chosen"
    drag-class="drawing-drag"
    item-key="id"
    class="mt10px"
  >
    <template #item="{ element, index }">
      <div class="ks-row-middle fieldrow mt8px" v-show="!element.props.hidden">
        <i class="iconfont icon-drag mover cursor-pointer mr8px text-[#C3C3C3]"></i>
        <div
          @click="setSelectedWidget(element)"
          v-show="!element.props.isEdit"
          class="ks-col primary-gct-hover text-[#212528] cursor-pointer ell h100% lh-24px"
          :title="element.props.title"
        >
          {{ element.props.title || $t(element.displayName || element.name) }}
        </div>
        <div v-if="element.props.isEdit">
          <i18n-select-input
            :i18nConfig="element.props.i18nConfig"
            attr="title"
            size="small"
            i18nModalKey="i18nInputGroup"
            @on-i18n-select="(data) => handleI18nSelect(data, element)"
            @clickOutside="clickOutside(element)"
          >
            <template #i18n-input>
              <a-input
                :allowClear="false"
                ref="i18nInputRef"
                v-model:value="element.props.title"
                :placeholder="$t(element.displayName || element.name || 'sys.inputText')"
                :maxlength="32"
                :showCount="true"
                size="small"
                style="width: calc(100% - 28px)"
              />
            </template>
          </i18n-select-input>
        </div>
        <a-tooltip placement="top">
          <template #title>{{ $t('sys.edit') }}</template>
          <i
            v-show="!element.props.isEdit && !element.props.noEdit"
            class="iconfont icon-bianji cursor-pointer primary-gct-hover ml8px text-[#797A7D]"
            @click="editButton(index)"
          ></i>
        </a-tooltip>
        <a-popconfirm
          placement="topLeft"
          :title="$t('sys.pageDesigner.areYouSureToDelete')"
          @confirm="deleteList(index)"
        >
          <a-tooltip placement="top">
            <template #title>{{ $t('sys.delete') }}</template>
            <i
              v-show="!element.props.noDelete"
              class="iconfont icon-shanchu2 cursor-pointer ml8px error-gct-hover text-[#797A7D]"
            ></i>
          </a-tooltip>
        </a-popconfirm>
      </div>
    </template>
  </draggable>
</template>
<script setup lang="ts">
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import draggable from 'vuedraggable';
  import { ref, toRef, Ref, nextTick, computed } from 'vue';

  const defProps = defineProps<{
    children: object[];
  }>();
  const i18nInputRef = ref(null);
  const { setSelectedWidget } = useSelectedWidget();
  const clickOutside = (e) => {
    e.props.isEdit = false;
  };
  const handleI18nSelect = (data, ele) => {
    if (!ele.props.title.trim()) ele.props.title = data.i18nTitle;
    ele.props.i18nConfig = JSON.stringify({ title: data.i18nKey });
  };
  const editButton = (index) => {
    defProps.children.forEach((e, edex) => {
      e.props.isEdit = index === edex;
    });
    nextTick(() => {
      i18nInputRef.value?.input?.focus();
      i18nInputRef.value?.input?.select();
    });
  };

  const deleteList = (index) => {
    defProps.children.splice(index, 1);
  };
</script>
<style lang="scss" scoped>
  .fieldrow {
    height: 32px;
    padding: 4px 8px;
    border-radius: 4px;
    background-color: #f2f4f7;

    &:first-child {
      margin-top: 0;
    }
  }
</style>
