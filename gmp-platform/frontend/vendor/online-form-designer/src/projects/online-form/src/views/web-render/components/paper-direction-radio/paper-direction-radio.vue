<template>
  <a-radio-group :class="[ns.b()]" v-model:value="local">
    <label>
      <div>
        <PortraitIcon />
      </div>
      <a-radio :value="Orientation.Portrait">{{
        $t('sys.appDesigner.printDesign.form.portrait')
      }}</a-radio>
    </label>
    <label>
      <div>
        <LandscapeIcon />
      </div>
      <a-radio :value="Orientation.Landscape">{{
        $t('sys.appDesigner.printDesign.form.landscape')
      }}</a-radio>
    </label>
  </a-radio-group>
</template>

<script lang="ts" setup name="paper-direction-radio">
  import { useNamespace } from '@gct/runtime';
  import { Orientation } from '@gct/nocode-base';
  import { computed } from 'vue';
  import PortraitIcon from '/@online-form/views/designer/icons/portrait.vue';
  import LandscapeIcon from '/@online-form/views/designer/icons/landscape.vue';

  const ns = useNamespace('paper-direction-radio');

  const props = withDefaults(
    defineProps<{
      value?: Orientation;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:value', value: Orientation): void;
  }>();

  const local = computed({
    get() {
      return props.value;
    },
    set(v) {
      emit('update:value', v);
    },
  });
</script>

<style lang="scss" scoped>
  $paper-direction-radio: (
    height: auto,
  );

  @include b(paper-direction-radio) {
    @include set-component-css-var(paper-direction-radio, $paper-direction-radio);
    height: getCssVar(paper-direction-radio, height);

    display: flex;
    column-gap: 48px;
    & > label {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;

      & > div {
        height: 48px;
        width: 48px;
        border-radius: 4px;
        border: 1px solid #e8ebf0;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 6px;
      }

      &:has(:checked) > div {
        border-color: var(--ant-primary-color);
      }
      &:has(:checked) :deep(svg) {
        color: var(--ant-primary-color);
      }
      &:has(:disabled) > div {
        border-color: #c3c3c3;
      }
      &:has(:disabled) :deep(svg) {
        color: #c3c3c3;
      }
    }
  }
</style>
