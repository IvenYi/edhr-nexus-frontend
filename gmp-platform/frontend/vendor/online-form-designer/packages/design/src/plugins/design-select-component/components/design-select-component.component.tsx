import { computed, defineComponent } from 'vue';
import { useNamespace } from '@gct/runtime';
import { nodeContainerProps as props } from '../../../props';
import { IDesignSelectComponentNodeData } from '../design-select-component.data';
import './design-select-component.component.scss';

export const DesignSelectComponentComponent = defineComponent({
  name: 'DesignSelectComponentComponent',
  props,
  setup(defProps) {
    const t = window.$t;
    const ns = useNamespace('design-select-component');

    const model = computed<IDesignSelectComponentNodeData>(
      () => defProps.data.data as IDesignSelectComponentNodeData,
    );

    const renderSimple = () => {
      return (
        <>
          <span>{t('sys.appDesigner.designView.components.select.sampleText')}</span>
          <span>
            <i class="iconfont icon-a-Rightarrow" />
          </span>
        </>
      );
    };

    const renderStandard = () => {
      return (
        <>
          <span class={ns.e('icon')}>
            <svg
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
            >
              <path
                d="M20.48 20.48m163.84 0l655.36 0q163.84 0 163.84 163.84l0 655.36q0 163.84-163.84 163.84l-655.36 0q-163.84 0-163.84-163.84l0-655.36q0-163.84 163.84-163.84Z"
                fill="#3168EC"
                p-id="16585"
              ></path>
              <path
                d="M245.76 303.63648a26.13248 26.13248 0 0 1 30.96576-25.72288H747.27424a26.13248 26.13248 0 0 1 30.96576 25.68192V730.3168c0 6.02112-2.048 11.55072-5.48864 15.9744a26.17344 26.17344 0 0 1-25.55904 20.72576H276.56192c-8.6016 0-16.1792-4.13696-20.97152-10.52672a26.09152 26.09152 0 0 1-9.8304-20.48V303.67744z m52.30592 411.07456h427.86816V330.21952H298.06592v384.49152z m284.22144-347.99616l90.9312 58.49088-90.9312 59.8016v-37.02784l-183.00928-0.04096v23.7568a22.7328 22.7328 0 0 1-18.6368 22.40512l-4.096 0.32768a22.7328 22.7328 0 0 1-22.36416-18.6368l-0.36864-4.096v-46.4896a22.7328 22.7328 0 0 1 18.67776-22.36416l4.096-0.36864h205.70112v-35.75808z m67.1744 173.75232a22.7328 22.7328 0 0 1 22.36416 18.6368l0.4096 4.096v43.99104a22.7328 22.7328 0 0 1-18.71872 22.3232l-4.05504 0.4096h-203.65312v36.98688l-90.9312-59.76064 90.9312-58.49088v35.75808H626.688v-21.21728a22.7328 22.7328 0 0 1 18.67776-22.36416l4.096-0.36864z"
                fill="#FFFFFF"
                p-id="16586"
              ></path>
            </svg>
          </span>
          <span class={ns.e('label')}>
            {t('sys.appDesigner.designView.components.select.selectCom')}：
            {t('sys.appDesigner.designView.components.select.sampleText')}
          </span>
          <span class={ns.e('action')}>
            {t('sys.appDesigner.designView.components.select.switch')}
            <i class="iconfont icon-qiehuan" />
          </span>
        </>
      );
    };

    return { ns, model, renderSimple, renderStandard };
  },
  render() {
    return (
      <div class={[this.ns.b(), this.ns.m(this.model.switchStyle)]}>
        {this.model.switchStyle === 'simple' ? this.renderSimple() : this.renderStandard()}
      </div>
    );
  },
});
