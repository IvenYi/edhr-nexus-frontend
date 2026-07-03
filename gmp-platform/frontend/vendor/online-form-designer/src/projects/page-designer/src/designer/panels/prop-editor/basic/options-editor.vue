<template>
  <div class="relative">
    <div class="mb10px ks-row-middle">
      <div class="mr-auto">{{ $t('sys.pageDesigner.option') }}</div>
      <a :class="['link', { disabled: options.length >= 10 }]" @click="addFiled">
        <PlusOutlined />
        {{ $t('sys.pageDesigner.add') }}
      </a>
    </div>
    <draggable
      :list="options"
      handle=".mover"
      :animation="200"
      chosen-class="drawing-chosen"
      drag-class="drawing-drag"
      item-key="id"
    >
      <template #item="{ element, index }">
        <div
          class="ks-row-middle mb5px px-12px py-5px option-bg flex"
          :key="element.value + '_' + index"
        >
          <span class="iconfont icon-drag mr5px mover cursor-pointer text-[#C3C3C3]"></span>
          <a-radio
            v-if="type === 'gen-radio'"
            class="gen-radio"
            :checked="checked === element.value"
            :key="element.value + '_' + index + '_radio'"
            @change="checkValue(element.value)"
          />
          <a-checkbox
            v-if="type === 'gen-checkbox'"
            class="gen-checkbox"
            :checked="checked.includes(element.value)"
            :key="element.value + '_' + index + '_checkbox'"
            @change="checkValue(element.value)"
          />
          <div :class="['ks-col', 'flex-1', 'truncate', { 'ml-8px': type === 'gen-checkbox' }]">
            <a-tooltip>
              <template #title>{{ element.props ? element.props.label : element.label }}</template>
              <slot>
                <span>{{ element.props ? element.props.label : element.label }}</span>
              </slot>
            </a-tooltip>
          </div>
          <edit-outlined
            class="cursor-pointer ml5px edit-btn mb1px"
            @click="editFiled($event, element, index)"
          />
          <a-popconfirm
            class="delete-btn"
            v-if="options.length > 1"
            placement="topLeft"
            :title="$t('sys.pageDesigner.areYouSureToDelete')"
            @confirm="deleteList(index)"
          >
            <span class="cursor-pointer iconfont icon-shanchu1 ml5px"></span>
          </a-popconfirm>
        </div>
      </template>
    </draggable>
    <add-options-field ref="addOptionsFieldModel" />
  </div>
</template>

<script setup lang="ts" name="options-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { ref, reactive, computed } from 'vue';
  import draggable from 'vuedraggable';
  import addOptionsField from '../modals/add-options-field.vue';
  import { uuid2 } from '/@/utils/uuid';

  const defProps = defineProps(props);
  const checked = ref(defProps.widget!.props.checked!);
  const type = ref(defProps.widget!.type);
  const addOptionsFieldModel = ref<InstanceType<typeof addOptionsField> | null>(null);
  const options = ref(getOrgOptions());

  function getOrgOptions() {
    const arr = ['一', '二', '三'];
    const defaultOptions = new Array(3)
      .fill(0)
      .map((i, index) => ({ label: '选项' + arr[index], value: uuid2(16, 16) }));
    if (!defProps.widget!.props.options?.length) {
      defProps.widget!.props.options = [...defaultOptions];
    }
    return defProps.widget!.props.options;
  }

  function deleteList(index) {
    let row = options.value[index];
    options!.value?.splice(index, 1);
    if (checked.value.includes(row.id) || checked.value == row.id) {
      checked.value =
        type.value === 'gen-radio'
          ? options.value[0].id
          : checked.value.filter((i) => i !== row.id);
    }
  }

  async function addFiled($event) {
    if (options!.value.length >= 10) return;
    const keys = options!.value.map((i) => i.value) || [];
    const values: any = await addOptionsFieldModel.value!.open({
      modelKey: defProps.widget?.props.model,
      option: { label: '', value: uuid2(16, 16) },
      clientX: $event.clientX,
      clientY: $event.clientY,
      type: 'add',
      keys: keys,
    });
    if (values?.label && values?.value) {
      options!.value.push(values);
    }
  }

  async function editFiled($event, option: any, index: any) {
    const keys =
      options!.value.filter((val) => val.value !== option.value).map((i) => i.value) || [];
    const values: any = await addOptionsFieldModel.value!.open({
      modelKey: defProps.widget?.props.model,
      option: option,
      clientX: $event.clientX,
      clientY: $event.clientY,
      type: 'edit',
      keys: keys,
    });
    if (values?.label && values?.value) {
      options!.value[index] = values;
    }
  }

  function checkValue(id: any) {
    if (type.value === 'gen-radio') {
      checked.value = id;
      defProps.widget!.props.checked = id;
    } else {
      if (!checked.value.includes(id)) {
        checked.value.push(id);
        defProps.widget!.props.checked = checked.value;
      } else {
        checked.value = checked.value.filter((i) => i !== id);
        defProps.widget!.props.checked = checked.value;
      }
    }
  }
</script>

<style lang="less" scoped>
  .link {
    color: var(--ant-primary-color);
    &.disabled {
      color: #eaeaea;
      cursor: auto;
    }
  }
  .option-bg {
    border-radius: 4px;
    background: #f5f5f5;
    line-height: 24px;
    .icon-drag {
      &:hover {
        color: var(--ant-primary-color);
      }
    }
    .gen-radio {
      :deep(.ant-radio) {
        top: 0.2em;
        .ant-radio-inner {
          width: 14px;
          height: 14px;
        }
      }
    }
    .gen-checkbox {
      :deep(.ant-checkbox) {
        top: 0.21em;
        .ant-checkbox-inner {
          width: 14px;
          height: 14px;
        }
        &.ant-checkbox-checked .ant-checkbox-inner:after {
          left: 2px;
        }
      }
    }
    &:hover {
      background: #eaeaea;
      .delete-btn {
        visibility: visible;
        &:hover {
          color: @error-color;
        }
      }
      .edit-btn {
        visibility: visible;
        &:hover {
          color: @success-color;
        }
      }
    }
    .edit-btn {
      visibility: hidden;
    }
    .delete-btn,
    .edit-btn {
      font-size: 16px;

      color: #7f8695;
    }
  }
</style>
