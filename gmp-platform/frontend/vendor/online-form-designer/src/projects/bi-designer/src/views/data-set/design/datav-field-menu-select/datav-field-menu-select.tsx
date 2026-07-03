import { computed, defineComponent, PropType } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { IFieldContextItem, IReportField } from '../../interface';
import './datav-field-menu-select.scss';

export const DatavFieldMenuSelect = defineComponent({
  name: 'DatavFieldMenuSelect',
  props: {
    action: {
      type: Object as PropType<IFieldContextItem>,
      required: true,
    },
    data: {
      type: Object as PropType<IReportField>,
      required: true,
    },
    disabled: {
      type: Boolean,
    },
  },
  setup(props) {
    const ns = useNamespace('datav-field-menu-select');

    const val = computed({
      get() {
        return props.data[props.action.fieldKey!];
      },
      set(val) {
        if (props.data[props.action.fieldKey!] !== val) {
          props.data[props.action.fieldKey!] = val;
          // reportView.updateSchema({});
        }
      },
    });

    function onClick(e: MouseEvent, action: IFieldContextItem): void {
      console.log('onClick', e, props.action, props.data, action);
      e.stopPropagation();
      val.value = action.value;
      if (props.action.click) {
        props.action.click(action, props.data);
      }
      if (action.click) {
        action.click(action, props.data);
      }
    }

    return { ns, val, onClick };
  },
  render() {
    return (
      <a-sub-menu disabled={this.disabled}>
        {{
          title: () => {
            return <span class={this.ns.e('label')}>{this.action.label}</span>;
          },
          default: () => {
            return this.action.children?.map((child: IFieldContextItem) => {
              return (
                <a-menu-item
                  key={child.name}
                  // onClick={(e: MouseEvent) => this.onClick(e, child)}
                  class={[
                    this.ns.e(this.action.mode),
                    this.ns.is('active', this.val && child.value === this.val),
                  ]}
                >
                  <span class={this.ns.e('label')}>{child.label}</span>
                </a-menu-item>
              );
            });
          },
        }}
      </a-sub-menu>
    );
  },
});
