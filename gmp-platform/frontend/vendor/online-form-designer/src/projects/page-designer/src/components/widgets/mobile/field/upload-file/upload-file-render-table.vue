<template>
  <div v-if="value.length" class="ell file-list-table" @click.stop="onOpen">
    <i class="iconfont icon-PaperClip"></i>
    {{ $t('sys.pageDesigner.xFiles', { text: value.length }) }}
  </div>

  <FilesPopup ref="popupRef" :title="label || fieldName" @click.stop />
</template>

<script name="gct-upload-file" setup lang="ts">
  import { reactive, computed, ref } from 'vue';
  import { UploadFile } from '/@page-designer/types/mobile';
  import FilesPopup from './components/filesPopup.vue';

  const emit = defineEmits(['update:modelValue']);
  const props = defineProps<{ modelValue?: string; widget: UploadFile; formData: Object }>();

  const { label, fieldName } = reactive(props.widget.props);
  const popupRef = ref();

  const value = props.widget.props.field
    ? computed<string[]>({
        get() {
          try {
            return props.modelValue ? props.modelValue.split(',') : [];
          } catch (error) {
            return [];
          }
        },
        set(value) {
          if (value?.length > 0) {
            emit('update:modelValue', value ? value.join(',') : '');
          } else {
            emit('update:modelValue', '');
          }
        },
      })
    : ref([]);

  const onOpen = () => {
    popupRef.value?.open(value.value);
  };

  defineExpose({
    getValue() {
      return value.value;
    },
    setValue(v) {
      value.value = v;
    },
  });
</script>

<style lang="less" scoped>
  .file-list-table {
    display: block;
    margin: 0 -10px;
    padding: 13px 10px;
  }
</style>
