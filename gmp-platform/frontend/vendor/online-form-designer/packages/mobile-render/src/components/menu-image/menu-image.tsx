import { defineComponent, computed } from 'vue';
import { useNamespace } from '@gct/runtime';
import Icon from '../icon/index.vue';
import { LogoTypeEnum } from '../../constant';
import { serverAddress } from '../../hooks';

export const MenuImage = defineComponent({
  name: 'MenuImage',
  props: {
    src: {
      type: String,
      required: true,
    },
    logoType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('menu-image');

    const pathsrc = computed(() => {
      return serverAddress.value || location.origin + `/minio/` + props.src;
    });

    return { ns, pathsrc };
  },
  render() {
    if (this.logoType === LogoTypeEnum.Icon) {
      return <Icon value={this.src} size={this.size} color="#fff" />;
    }
    return (
      <van-image
        fit="cover"
        src={this.pathsrc}
        show-error={false}
        v-else
        width={this.size}
        height={this.size}
      />
    );
  },
});
