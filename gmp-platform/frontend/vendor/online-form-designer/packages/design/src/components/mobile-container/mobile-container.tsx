import { defineComponent, ref } from 'vue';
import { Namespace } from '@qx-chitanda/scss-utils';
import dayjs from 'dayjs';
import { CloseOutlined } from '@ant-design/icons-vue';
import './mobile-container.scss';

export const MobileContainer = defineComponent({
  name: 'MobileContainer',
  props: {
    headerBgColor: {
      type: Boolean,
      default: false,
    },
    showTitleBar: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      default: () => gct.appInfo.name,
    },
  },
  setup() {
    const ns = new Namespace('mobile-container', 'gct');

    const time = ref<string>(dayjs().format('HH:mm'));

    return { ns, time };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.b('phone')}>
          <div class={this.ns.b('phone-header')}>
            <div class={this.ns.be('phone-header', 'left')}>
              <span class={this.ns.be('phone-header', 'time')}>{this.time}</span>
            </div>
            <div class={this.ns.be('phone-header', 'right')}>
              <span class={this.ns.be('phone-header', 'signal')}>
                <i class="iconfont icon-xinhao_signal" />
              </span>
              <span class={this.ns.be('phone-header', 'wifi')}>
                <i class="iconfont icon-wuxianwangluo_wifi" />
              </span>
              <span class={this.ns.be('phone-header', 'battery')}>
                <i class="iconfont icon-dianchi" />
              </span>
            </div>
          </div>
          <div class={[this.ns.b('phone-content')]}>
            {this.showTitleBar !== false ? (
              <div
                class={[this.ns.b('phone-app-header'), this.ns.is('bg-color', this.headerBgColor)]}
              >
                <div class={this.ns.be('phone-app-header', 'right')}>
                  <span class={this.ns.be('phone-app-header', 'back')}>
                    <i class="iconfont icon-a-Leftarrow" />
                  </span>
                </div>
                <div class={this.ns.be('phone-app-header', 'center')}>
                  <span class={this.ns.be('phone-app-header', 'text')}>{this.title}</span>
                </div>
                <div class={this.ns.be('phone-app-header', 'right')}>
                  <span class={this.ns.be('phone-app-header', 'close')}>
                    <CloseOutlined />
                  </span>
                </div>
              </div>
            ) : null}
            <div
              class={[
                this.ns.b('phone-app-content'),
                this.ns.is('hidden-title-bar', !(this.showTitleBar !== false)),
              ]}
            >
              {this.$slots.default?.()}
            </div>
          </div>
        </div>
      </div>
    );
  },
});
