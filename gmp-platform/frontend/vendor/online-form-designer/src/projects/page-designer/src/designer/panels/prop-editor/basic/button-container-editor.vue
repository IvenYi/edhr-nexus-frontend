<template>
  <div class="content-center">
    <div v-if="align === AGLINE_ENUMS.BETWEEN">
      <div class="mb10px">
        <a-button
          type="primary"
          @click="addButton(leftChildren)"
          ghost
          style="line-height: 1"
          block
          size="small"
        >
          <!-- <span class="iconfont icon-tianjia"></span> -->
          {{ $t('sys.pageDesigner.addLeftButton') }}
        </a-button>
        <div class="mt8px btn-list-wrap">
          <draggable
            group="button"
            :list="leftChildren"
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
                  @click="setSelectedWidget(element)"
                  v-show="!element.props.isEdit"
                  class="ks-col gct-text-overflow text-[#212528] primary-gct-hover cursor-pointer"
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
                <a-tooltip placement="top" v-if="!element.props.noEdit">
                  <template #title>{{ $t('sys.edit') }}</template>
                  <i
                    v-show="!element.props.isEdit"
                    class="iconfont icon-bianji cursor-pointer primary-gct-hover ml8px text-[#797A7D]"
                    @click="editButton(element, leftChildren, index)"
                  ></i>
                </a-tooltip>
                <a-popconfirm
                  v-if="!element.props.noDelete"
                  placement="topLeft"
                  :title="$t('sys.pageDesigner.areYouSureToDelete')"
                  @confirm="deleteList(leftChildren, index)"
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
      <div>
        <a-button
          type="primary"
          @click="addButton(rightChildren)"
          ghost
          style="line-height: 1"
          block
          size="small"
        >
          <!-- <span class="iconfont icon-tianjia"></span> -->
          {{ $t('sys.pageDesigner.addRightButton') }}
        </a-button>
        <div class="btn-list-wrap" :class="{ mt8px: rightChildren.length }">
          <draggable
            group="button"
            :list="rightChildren"
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
                  @click="setSelectedWidget(element)"
                  v-show="!element.props.isEdit"
                  class="ks-col gct-text-overflow text-[#212528] primary-gct-hover cursor-pointer"
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
                <a-tooltip placement="top" v-if="!element.props.noEdit">
                  <template #title>{{ $t('sys.edit') }}</template>
                  <i
                    v-show="!element.props.isEdit"
                    class="iconfont icon-bianji cursor-pointer primary-gct-hover ml8px text-[#797A7D]"
                    @click="editButton(element, rightChildren, index)"
                  ></i>
                </a-tooltip>
                <a-popconfirm
                  v-if="!element.props.noDelete"
                  placement="topLeft"
                  :title="$t('sys.pageDesigner.areYouSureToDelete')"
                  @confirm="deleteList(rightChildren, index)"
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
    </div>
    <template v-else>
      <a-button
        type="primary"
        @click="addButton(children)"
        ghost
        style="line-height: 1"
        block
        size="small"
      >
        <!-- <span class="iconfont icon-tianjia"></span> -->
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
                @click="setSelectedWidget(element)"
                v-show="!element.props.isEdit"
                class="ks-col gct-text-overflow text-[#212528] primary-gct-hover cursor-pointer"
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
              <a-tooltip placement="top" v-if="!element.props.noEdit">
                <template #title>{{ $t('sys.edit') }}</template>
                <i
                  v-show="!element.props.isEdit"
                  class="iconfont icon-bianji cursor-pointer primary-gct-hover ml8px text-[#797A7D]"
                  @click="editButton(element, children, index)"
                ></i>
              </a-tooltip>
              <a-popconfirm
                v-if="!element.props.noDelete"
                placement="topLeft"
                :title="$t('sys.pageDesigner.areYouSureToDelete')"
                @confirm="deleteList(children, index)"
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
    </template>
  </div>
  <addButtonForm
    ref="addButtonModel"
    :platform="widget?.platform"
    :isBottomButton="widget?.type === FormComponents.BottomButtonContainer"
    :butOptions="selectOptions"
  />
</template>

<script setup lang="ts" name="button-container-editor">
  import { props } from '/@page-designer/hooks/usePropEditor';
  import addButtonForm from '../modals/add-button-container.vue';
  import { ref, toRef, Ref, nextTick, computed } from 'vue';
  import draggable from 'vuedraggable';
  import { BaseButton } from '/@page-designer/types/web';
  import { AGLINE_ENUMS } from '@/enums/designEnum';
  import { createWidgetByType, getCompPos } from '/@page-designer/schema/utils';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { ButtonSize, ButtonStyle, FormComponents } from '/@page-designer/enum';
  import { useI18n } from 'vue-i18n';
  import { I18nSelectInput } from '/@/components/I18nSelect';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  const { t } = useI18n();
  const defProps = defineProps(props);
  const selectOptions = computed(() => {
    if (typeof defProps.propConfig?.options === 'function') {
      return defProps.propConfig?.options(defProps.widget);
    } else {
      return defProps.propConfig?.options || [];
    }
  });
  const { setSelectedWidget } = useSelectedWidget();
  const children = toRef(() => defProps.widget?.children || []);
  const align = toRef(() => defProps.widget?.props.align);
  const addButtonModel = ref<InstanceType<typeof addButtonForm> | null>(null);
  async function addButton(child) {
    const { type } = await addButtonModel.value!.open(t('sys.pageDesigner.addButton'));
    type.forEach((e) => {
      const data = createWidgetByType(e);
      const { buttonStyle, size } = defProps.widget?.props || {};
      data.props.parentWidgetId = defProps.widget?.id;
      data.props.buttonStyle = buttonStyle || ButtonStyle.ORDINARY;
      data.props.size = size || ButtonSize.DEFAULT;
      data.props.refTable = defProps.widget.preLocation;
      // data.props.model = defProps.widget.props.model || undefined;
      child.push(data);
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
  const leftChildren = toRef(() => children.value[0]?.children || []);
  const rightChildren = toRef(() => children.value[1]?.children || []);
</script>

<style lang="less" scoped>
  .fieldrow {
    height: 32px;
    padding: 4px 8px;
    border-radius: 4px;
    background-color: #f2f4f7;

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
