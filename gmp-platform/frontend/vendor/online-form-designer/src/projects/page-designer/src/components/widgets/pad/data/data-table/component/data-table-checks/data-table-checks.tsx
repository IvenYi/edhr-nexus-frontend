import { defineComponent, PropType, toRef, unref } from 'vue';
import { IModal, useNamespace } from '@gct/runtime';
import { clone } from 'lodash-es';
import { useI18n } from 'vue-i18n';
import './data-table-checks.scss';

export const DataTableChecks = defineComponent({
  name: 'DataTableChecks',
  props: {
    modal: {
      type: Object as PropType<IModal>,
      required: true,
    },
    // 选中的数据
    items: {
      type: Array<any>,
      default: () => [],
    },
    // 呈现列标识
    widget: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n() as any;

    const ns = useNamespace('data-table-checks');

    const rows = toRef(clone(props.items));

    const cancelSelect = (e: MouseEvent, i) => {
      e.stopPropagation();
      if (i !== -1) {
        rows.value.splice(i, 1);
      }
    };

    // eslint-disable-next-line vue/no-mutating-props
    props.modal.cancel = async () => {
      cancel();
      return false;
    };

    const cancel = async () => {
      if (rows.value.length < props.items.length) {
        props.modal.dismiss({ ok: true, data: unref(rows) });
      } else {
        props.modal.dismiss({ ok: false });
      }
    };

    const clearAll = () => {
      props.modal.dismiss({ ok: true, data: [] });
    };

    const getdictValue = (formData) => {
      const { field, isFieldModel, bindFieldLink } = props.widget.props;
      const value = formData[field];
      const fieldKey = isFieldModel ? bindFieldLink?.join('.') : field;
      if (fieldKey) {
        const val = formData?._DICT?.[fieldKey]?.[value] ?? '';
        const _val_ = Array.isArray(val) ? val.join() : val;
        return !_val_ ? value : _val_;
      }
      return '';
    };
    return { t, ns, rows, cancelSelect, cancel, clearAll, getdictValue };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.b('header')}>
          {this.t('sys.pageDesigner.selected')} {this.rows.length} {this.t('sys.pageDesigner.row')}
        </div>
        <div class={this.ns.b('content')}>
          {this.rows.map((row, i) => {
            return (
              <div class={this.ns.b('item')}>
                <div class={this.ns.be('item', 'count')}>{i + 1}.</div>
                <div class={this.ns.be('item', 'content')}>{this.getdictValue(row)}</div>
                <div class={this.ns.be('item', 'action')} onClick={(e) => this.cancelSelect(e, i)}>
                  {/* <a-tooltip class={this.ns.bem('item', 'action', 'tooltip')} placement="top">
                    {{
                      title: () => {
                        return <span>{this.t('sys.pageDesigner.delete')}</span>;
                      },
                      default: () => {
                        return (
                          <span>
                            <i class="iconfont icon-shanchu" />
                          </span>
                        );
                      },
                    }}
                  </a-tooltip> */}
                </div>
              </div>
            );
          })}
        </div>
        <div class={this.ns.b('footer')}>
          <van-button onClick={this.cancel}>{this.t('sys.pageDesigner.cancel')}</van-button>
          <van-button onClick={this.clearAll}>
            {this.t('sys.pageDesigner.clearSelectedRows')}
          </van-button>
        </div>
      </div>
    );
  },
});
