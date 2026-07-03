import { computed, defineComponent } from 'vue';
import { useNamespace } from '@gct/runtime';
import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
import './rang-number-editor.scss';

export const RangNumberEditor = defineComponent({
  // eslint-disable-next-line vue/component-definition-name-casing
  name: 'rang-number-editor',
  props,
  setup(defProps) {
    const t = window.$t;

    const ns = useNamespace('rang-number-editor');
    const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);

    const start = computed<number>(() => {
      if (propValue.value) {
        return propValue.value[0];
      }
      return undefined;
    });

    const end = computed<number>(() => {
      if (propValue.value) {
        return propValue.value[1];
      }
      return undefined;
    });

    const onChangeStart = (val: number) => {
      if (!propValue.value) {
        propValue.value = [val, null];
      } else {
        propValue.value[0] = val;
      }
    };

    const onChangeEnd = (val: number) => {
      if (!propValue.value) {
        propValue.value = [null, val];
      } else {
        propValue.value[1] = val;
      }
    };

    const isError = computed(() => {
      if (
        (start.value || start.value === 0) &&
        (end.value || end.value === 0) &&
        Number(start.value) > Number(end.value)
      ) {
        return true
      } else {
        return false
      }
    });

    return { t, ns, propValue, start, end, isError, onChangeStart, onChangeEnd };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.b('box')}>
          <a-input-number
            placeholder={this.t('sys.inputText')}
            size="small"
            onChange={this.onChangeStart}
            value={this.start}
            stringMode={this.propConfig.stringMode}
            class={this.ns.is('error', this.isError)}
          />
          <div class={this.ns.be('box', 'split')}>-</div>
          <a-input-number
            placeholder={this.t('sys.inputText')}
            size="small"
            onChange={this.onChangeEnd}
            value={this.end}
            stringMode={this.propConfig.stringMode}
            class={this.ns.is('error', this.isError)}
          />
        </div>
        {
          this.isError ? ( <p class={this.ns.b('error')}>{this.t('sys.model.numMaxGTMin')}</p>) : null
        }
      </div>
    );
  },
});

export default RangNumberEditor;
