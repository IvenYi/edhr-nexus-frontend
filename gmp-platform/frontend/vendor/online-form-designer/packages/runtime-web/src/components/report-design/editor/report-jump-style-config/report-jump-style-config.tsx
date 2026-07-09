import { computed, defineComponent, PropType } from 'vue';
import { useGctFormValue, useNamespace } from '@gct-paas/core';
import { TextDecoration } from '@gct/runtime';
import { IReportLinkStyle } from '../../interface';
import './report-jump-style-config.scss';

export const ReportJumpStyleConfig = defineComponent({
  name: 'ReportJumpStyleConfig',
  props: {
    value: {
      type: Object as PropType<IReportLinkStyle>,
      default: () => ({ color: '#026AC8', theme: 1 }),
    },
  },
  setup() {
    const ns = useNamespace('report-jump-style-config');

    const val = useGctFormValue<IReportLinkStyle>();

    function onChange(e: MouseEvent, key: keyof IReportLinkStyle) {
      e.stopPropagation();
      if (key === 'bold') {
        val.value.bold = !val.value.bold;
      }
      if (key === 'italic') {
        val.value.italic = !val.value.italic;
      }
      if (key === 'underline') {
        val.value.underline = !val.value.underline;
      }
      val.value = val.value;
    }

    const themeMode = computed<0 | 1>({
      get() {
        return val.value.theme;
      },
      set(_) {
        val.value.theme = _;
        val.value = val.value;
      }
    });

    const themeColor = computed({
      get() {
        return val.value.color;
      },
      set(_) {
        val.value.color = _;
        val.value = val.value;
      }
    });

    return { ns, val, onChange, themeMode, themeColor };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('label')}>文字</div>
        <div class={this.ns.e('font-config')}>
          <div class={this.ns.b('font-box')}>
            <div
              class={[this.ns.be('font-box', 'item'), this.ns.is('active', this.val.bold)]}
              onClick={(e) => this.onChange(e, 'bold')}
            >
              <bold-outlined />
            </div>
            <div
              class={[this.ns.be('font-box', 'item'), this.ns.is('active', this.val.italic)]}
              onClick={(e) => this.onChange(e, 'italic')}
            >
              <italic-outlined />
            </div>
            <div
              class={[
                this.ns.be('font-box', 'item'),
                this.ns.is('active', this.val.underline),
              ]}
              onClick={(e) => this.onChange(e, 'underline')}
            >
              <underline-outlined />
            </div>
          </div>
        </div>
        <div class={this.ns.e('color-mode')}>
          <a-radio-group v-model:value={this.themeMode}>
            <a-radio value={0}>
              <span>固定颜色</span>
              {this.themeMode == 0 ? (
                <color-editor class={this.ns.e('color')} v-model:value={this.themeColor} />
              ) : null}
            </a-radio>
            <a-radio value={1}>按主题色着色</a-radio>
          </a-radio-group>
        </div>
      </div>
    );
  },
});
