import { defineComponent, computed } from 'vue';
import { DefaultDateTypeConst, FIELD_TYPE, useNamespace } from '@gct/runtime';
import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
import './date-default-value-editor.scss';

export const DateDefaultValueEditor = defineComponent({
  // eslint-disable-next-line vue/component-definition-name-casing
  name: 'date-default-value-editor',
  props,
  setup(defProps) {
    const t = window.$t;
    const ns = useNamespace('date-default-value-editor');

    const [name, name2] = (defProps.propName as IData).list?.split(';') || [];

    const { propValue: value } = usePropEditor(name, defProps.changeCallback);
    const { propValue: value2 } = usePropEditor(name2, defProps.changeCallback);

    const val = computed<string>({
      get() {
        return value.value;
      },
      set(val) {
        value2.value = 0;
        value.value = val;
      },
    });

    const val2 = computed<number>({
      get() {
        return value2.value;
      },
      set(val) {
        value2.value = val;
      },
    });

    const isFull = computed(() => {
      if (val.value == null || val.value == '') {
        return true;
      }
      switch (val.value) {
        case DefaultDateTypeConst.PastDays:
        case DefaultDateTypeConst.PastWeeks:
        case DefaultDateTypeConst.PastMonths:
        case DefaultDateTypeConst.PastYears:
          return false;
        default:
          return true;
      }
    });

    const opts: any[] = [
      {
        label: t('sys.pageDesigner.dateDefaultValue.yesterday'),
        value: DefaultDateTypeConst.Yesterday,
      },
      {
        label: t('sys.pageDesigner.dateDefaultValue.past7days'),
        value: DefaultDateTypeConst.Past7Days,
      },
      {
        label: t('sys.pageDesigner.dateDefaultValue.past30days'),
        value: DefaultDateTypeConst.Past30Days,
      },
      {
        label: t('sys.pageDesigner.dateDefaultValue.pastDays'),
        value: DefaultDateTypeConst.PastDays,
      },
      {
        label: t('sys.pageDesigner.dateDefaultValue.thisWeek'),
        value: DefaultDateTypeConst.ThisWeek,
      },
      {
        label: t('sys.pageDesigner.dateDefaultValue.lastWeek'),
        value: DefaultDateTypeConst.LastWeek,
      },
      {
        label: t('sys.pageDesigner.dateDefaultValue.pastWeek'),
        value: DefaultDateTypeConst.PastWeeks,
      },
      {
        label: t('sys.pageDesigner.dateDefaultValue.thisMonth'),
        value: DefaultDateTypeConst.ThisMonth,
      },
      {
        label: t('sys.pageDesigner.dateDefaultValue.lastMonth'),
        value: DefaultDateTypeConst.LastMonth,
      },
      {
        label: t('sys.pageDesigner.dateDefaultValue.pastMonth'),
        value: DefaultDateTypeConst.PastMonths,
      },
      {
        label: t('sys.pageDesigner.dateDefaultValue.thisYear'),
        value: DefaultDateTypeConst.ThisYear,
      },
      {
        label: t('sys.pageDesigner.dateDefaultValue.lastYear'),
        value: DefaultDateTypeConst.LastYear,
      },
      {
        label: t('sys.pageDesigner.dateDefaultValue.pastYear'),
        value: DefaultDateTypeConst.PastYears,
      },
    ];

    if (defProps.widget?.props.fieldType === FIELD_TYPE.DATE) {
      opts.unshift({
        label: t('sys.pageDesigner.dateDefaultValue.systemDate'),
        value: DefaultDateTypeConst.SystemDate,
      });
    }

    const options = computed(() => {
      if (defProps.widget?.props.isRang) {
        return opts;
      }
      return [
        {
          label: t('sys.pageDesigner.dateDefaultValue.systemDate'),
          value: DefaultDateTypeConst.SystemDate,
        },
      ];
    });

    if (value2.value == null) {
      value2.value = 0;
    }

    return { t, ns, val, val2, isFull, options };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <a-input-group class={[this.ns.e('group'), this.ns.is('full', this.isFull)]} compact>
          <a-select
            size="small"
            placeholder={this.t('sys.chooseText')}
            options={this.options}
            v-model:value={this.val}
            allowClear
            getPopupContainer={(element) => element.parentNode}
          />
          <a-input-number
            size="small"
            min={0}
            precision={0}
            placeholder={this.t('sys.inputText')}
            onBlur={() => {
              if (this.val2 == null) {
                this.val2 = 0;
              }
            }}
            v-model:value={this.val2}
          />
        </a-input-group>
      </div>
    );
  },
});

export default DateDefaultValueEditor;
