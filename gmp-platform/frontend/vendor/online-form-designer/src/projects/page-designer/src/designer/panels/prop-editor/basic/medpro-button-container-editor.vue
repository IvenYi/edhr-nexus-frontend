<template>
  <div class="content-center">
    <a-button
      type="primary"
      @click="addButton(children)"
      ghost
      style="line-height: 1"
      block
      size="small"
    >
      {{ $t('sys.pageDesigner.addButton') }}
    </a-button>
    <div class="mt8px btn-list-wrap">
      <draggable
        :list="children"
        handle=".mover"
        :animation="200"
        chosen-class="drawing-chosen"
        drag-class="drawing-drag"
        item-key="id"
      >
        <template #item="{ element, index }">
          <div class="ks-row-middle fieldrow mt8px">
            <i class="iconfont icon-drag mover cursor-pointer mr8px text-[#C3C3C3]"></i>
            <div
              v-show="!element.props.isEdit"
              class="ks-col gct-text-overflow text-[#212528]"
              :title="element.props.title"
            >
              {{ element.props.title }}
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
                    ref="i18nInputRef"
                    v-model:value="element.props.title"
                    :placeholder="t('sys.inputText')"
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
                v-show="!element.props.isEdit"
                class="iconfont icon-bianji cursor-pointer primary-gct-hover ml8px text-[#797A7D]"
                @click="editButton(element, children, index)"
              ></i>
            </a-tooltip>
            <a-popconfirm
              placement="topLeft"
              :title="$t('sys.pageDesigner.areYouSureToDelete')"
              @confirm="deleteList(children, index)"
              v-if="children.length > 1"
            >
              <a-tooltip placement="top">
                <template #title>{{ $t('sys.delete') }}</template>
                <i
                  class="iconfont icon-shanchu2 cursor-pointer ml8px error-gct-hover text-[#797A7D]"
                ></i>
              </a-tooltip>
            </a-popconfirm>
          </div>
        </template>
      </draggable>
    </div>
  </div>
  <addButtonForm ref="addButtonModel" />
</template>

<script setup lang="ts" name="medpro-button-container-editor">
  import { props } from '/@page-designer/hooks/usePropEditor';
  import addButtonForm from '../modals/medpro-add-button-container.vue';
  import { ref, toRef, nextTick, computed } from 'vue';
  import draggable from 'vuedraggable';
  import { BaseButton } from '/@page-designer/types/web';
  import { createWidgetByType } from '/@page-designer/schema/utils';
  import { useI18n } from 'vue-i18n';
  import { I18nSelectInput } from '/@/components/I18nSelect';

  const { t } = useI18n();
  const defProps = defineProps(props);

  const children = toRef(() => defProps.widget?.children || []);

  const modalFormData = computed(() => {
    return children.value.map((n) => n.type);
  });
  const addButtonModel = ref<InstanceType<typeof addButtonForm> | null>(null);
  async function addButton(child) {
    const { type } = await addButtonModel.value!.open(
      t('sys.pageDesigner.addButton'),
      modalFormData.value,
    );
    // 处理新增的项目
    type.forEach((e) => {
      if (!child.some((n) => n.type === e)) {
        const data = createWidgetByType(e);
        child.push(data);
      }
    });

    // 处理需要删除的项目
    child.forEach((item, index) => {
      if (!type.includes(item.type)) {
        child.splice(index, 1);
      }
    });
  }

  const i18nInputRef = ref();
  async function editButton(value: BaseButton, child, index) {
    value.props.isEdit = true;
    nextTick(() => {
      i18nInputRef.value?.input?.focus();
      i18nInputRef.value?.input?.select();
    });
  }
  const clickOutside = (e) => {
    e.props.isEdit = false;
  };
  const handleI18nSelect = (data, ele) => {
    if (!ele.props.title.trim()) ele.props.title = data.i18nTitle;
    ele.props.i18nConfig = JSON.stringify({ title: data.i18nKey });
  };
  function deleteList(child, index) {
    child.splice(index, 1);
  }
</script>

<style lang="less" scoped>
  .fieldrow {
    height: 32px;
    padding: 4px 8px;
    background-color: #f2f4f7;
    border-radius: 4px;

    &:first-child {
      margin-top: 0;
    }
  }
  .btn-list-wrap {
    & > div {
      max-height: 390px;
      overflow: auto;
    }
  }
</style>
