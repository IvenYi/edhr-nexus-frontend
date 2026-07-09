<template>
  <basicButton
    v-if="Object.prototype.hasOwnProperty.call(widget.props, 'basic')"
    type="primary"
    @click="sumbit"
    v-bind="basic"
  >
    {{ title }}</basicButton
  >
  <!-- 新版本的BaseButton -->
  <baseButton :widget="widget" v-else v-bind="widget.props" @click="sumbit" />
</template>

<script setup lang="ts" name="gct-copy-button">
  import basicButton from '../../__components__/basic_button.vue';
  import baseButton from '../../__components__/base_button.vue';
  import { ref, toRefs, onBeforeMount, onMounted, watchEffect, reactive } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { Button } from '/@page-designer/types/web';
  import { isArray } from '/@/utils/is';

  const props = defineProps<{ widget: Button }>();
  const { title, refForm, basic, refList } = reactive(props.widget.props);
  const Event = getPageEvent();

  async function sumbit() {
    try {
      const form = await Event.getSyncComponent(refForm);
      const formData = form.getValue();
      const childrenValue = {};
      /**复制时候需要清空子表内容的id */
      for (let key in formData) {
        const formVal = formData[key];
        if (isArray(formVal)) {
          formVal.forEach((i) => {
            i.id_ = null;
          });
          childrenValue[key] = formVal;
        }
      }
      const { name_, id_ } = formData;
      if (!id_) return;
      form.addValue!({
        id_: null,
        name_: name_ ? `copy_of_${name_}` : null,
        base_id_: null,
        default_: false,
        ...childrenValue,
      });
      form.clearValidate();
      if (refList) {
        const list = await Event.getSyncComponent(refList);
        list.setValue!();
      }
      await Event.runEventByName('onClick', props.widget.events);
    } catch (error) {
      console.error(error);
    }
  }
  defineExpose({});
</script>
<style scoped lang="less"></style>
