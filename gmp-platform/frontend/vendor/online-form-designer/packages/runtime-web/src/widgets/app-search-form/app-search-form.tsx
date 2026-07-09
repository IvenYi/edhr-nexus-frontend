import { defineComponent, PropType, ref, computed } from 'vue';
import { useNamespace, IForm } from '@gct/runtime';
import { FormController } from '../form/form.controller';
import './app-search-form.scss';

export const AppSearchForm = defineComponent({
  name: 'AppSearchForm',
  props: {
    model: {
      type: Object as PropType<IForm>,
      required: true,
    },
    // 查询和重置按钮是漂浮在右侧底部，默认不漂浮。在表单下另起一行
    isFixed: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['search', 'reset'],
  setup(_, { emit }) {
    const ns = useNamespace('app-search-form');

    const formRef = ref<any>(null);

    const c = computed<FormController>(() => formRef.value.c);

    const getData = () => {
      return c.value.getData();
    };

    const resetData = () => {
      c.value.resetData();
      emit('reset', {});
    };

    const onSearch = () => {
      const data = getData();
      emit('search', data);
    };

    return { ns, formRef, getData, resetData, onSearch };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.b('wrapper')}>
          <app-form ref="formRef" model={this.model} />
        </div>
        <div class={[this.ns.b('actions'), this.ns.is('fixed', this.isFixed)]}>
          <a-button class={this.ns.e('reset')} onClick={this.resetData}>
            重置
          </a-button>
          <a-button class={this.ns.e('query')} type="primary" onClick={this.onSearch}>
            查询
          </a-button>
        </div>
      </div>
    );
  },
});

export default AppSearchForm;
