import { computed, defineComponent } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { t } from '@gct/runtime';
import { useUserOccupy } from '/@/components/UserOccupy/useUserOccupy';
import './design-view-lock.scss';

export const DesignViewLock = defineComponent({
  name: 'DesignViewLock',
  setup() {
    const ns = useNamespace('design-view-lock');

    const { lockInfo, lock, unlock, unlockAvailable } = useUserOccupy();

    const isLock = computed(() => {
      return !!lockInfo.value?.id;
    });

    function handleChange() {
      if (isLock.value) {
        if (unlockAvailable.value) {
          unlock();
        }
      } else {
        lock();
      }
    }

    return () => {
      return (
        <design-icon-button
          active={isLock.value}
          icon={<svg-icon src="/assets/design-view/icon_unlock.svg" />}
          activeIcon={<svg-icon src="/assets/design-view/icon_lock.svg" />}
          tip={t('sys.pageDesigner.lock')}
          activeTip={t('sys.pageDesigner.unlock')}
          hoverColor={
            isLock.value
              ? `var(${ns.cssVarName('color-warning')})`
              : `var(${ns.cssVarName('color-text-5')})`
          }
          activeColor={`var(${ns.cssVarName('color-warning')})`}
          activeBgColor={'none'}
          onChange={handleChange}
        />
      );
    };
  },
});
