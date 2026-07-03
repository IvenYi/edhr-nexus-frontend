<template>
  <div :class="[ns.b()]">
    <div :class="[ns.e('title')]">{{ $t('sys.edhr.mySeleted') }}{{ title }}</div>
    <div :class="[ns.e('list')]">
      <div :class="[ns.e('item')]" v-for="item in items" :key="item.id">
        <FormTypeTag
          :class="[ns.e('form-type')]"
          v-if="item.formType"
          :value="item.formType"
          style-type="text-only"
        />
        <div :class="[ns.e('item-text')]" :title="getItemText(item)">{{ getItemText(item) }}</div>
        <CloseOutlined :class="[ns.e('item-icon')]" @click="emit('delete', item)" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup name="right-list">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { CategoryModuleEnum } from '/@online-form/views/web-render/constant';
  import { computed } from 'vue';
  import { CloseOutlined } from '@ant-design/icons-vue';
  import FormTypeTag from '/@/projects/online-form/src/views/web-render/form/form-type-tag.vue';

  const { t } = useI18n();
  const ns = useNamespace('right-list');

  const props = withDefaults(
    defineProps<{
      items?: IData[];
      moduleType: string;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'delete', value: IData): void;
  }>();

  const title = computed(() => {
    return props.moduleType === CategoryModuleEnum.ONLINE_FORM ? t('sys.expression.form') : 'DHR';
  });

  const getItemText = (item) => {
    return item.name + (item.version ? ` :${item.version}` : '');
  };
</script>

<style lang="scss" scoped>
  $right-list: ();

  @include b(right-list) {
    @include set-component-css-var(right-list, $right-list);

    @include e(title) {
      height: 30px;
      font-weight: bold;
      line-height: 30px;
    }

    @include e(list) {
      height: calc(100% - 30px);
      padding-right: 4px;
      overflow: auto;
    }

    @include e(item) {
      display: flex;
      align-items: center;
      width: 100%;
      padding-top: 4px;
      padding-right: 8px;
      padding-bottom: 4px;

      &:hover {
        background-color: #f5f7fa;
      }
    }

    @include e(item-text) {
      flex-grow: 1;
      flex-shrink: 1;
      width: 1px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    @include e(form-type) {
      margin-right: 4px;
      margin-left: 4px;
    }

    width: 300px;
    padding-left: 20px;
  }
</style>
