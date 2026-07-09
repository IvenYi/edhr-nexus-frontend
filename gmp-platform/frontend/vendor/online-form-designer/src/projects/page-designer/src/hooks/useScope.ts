import { computed, ref, toRef } from 'vue';
import { SCOPE } from '../enum';
import { useDesigner } from './useDesigner';
/**作用域:当前应当递归遍历的数据集合(页面数据或者模态框body/footer数据) */
const scope = ref<SCOPE>(SCOPE.PAGE);

export function useScope() {
  const { modalBody, modalFooter, modalBottomBtn, pageJson, modalInfo } = useDesigner();
  /**作用域数据:当前应当递归遍历的数据集合(页面数据或者模态框body/footer数据) */
  const scopeData = computed(() => {
    switch (scope.value) {
      case SCOPE.PAGE:
        return pageJson.widgets;
      case SCOPE.MODAL:
        let data = [...modalBody.value?.children];
        if (modalFooter.value?.children) {
          data = [...data, ...modalFooter.value?.children];
        }
        if (modalBottomBtn.value?.children) {
          data = [...data, ...modalBottomBtn.value?.children];
        }
        return data;
      default:
        return pageJson.widgets;
    }
  });

  const scopeId = toRef(() => {
    if (scope.value === SCOPE.PAGE) {
      return pageJson.id || 'id';
    } else {
      return modalInfo.value.id;
    }
  });

  /** 链路单独处理 */
  const navTagScopeData = computed(() => {
    if (scope.value === SCOPE.PAGE) {
      return pageJson.widgets;
    } else if (scope.value === SCOPE.MODAL) {
      return [modalInfo.value];
    }
    return pageJson.widgets;
  });

  /**作用域JS */
  const scopeJs = computed({
    get() {
      if (scope.value === SCOPE.PAGE) {
        return pageJson.js;
      } else {
        return modalInfo.value.js;
      }
    },
    set(val) {
      if (scope.value === SCOPE.PAGE) {
        pageJson.js = val;
      } else {
        modalInfo.value.js = val;
      }
    },
  });
  /**作用域Css */
  const scopeCss = computed({
    get() {
      if (scope.value === SCOPE.PAGE) {
        return pageJson.css;
      } else {
        return modalInfo.value.css;
      }
    },
    set(val) {
      if (scope.value === SCOPE.PAGE) {
        pageJson.css = val;
      } else {
        modalInfo.value.css = val;
      }
    },
  });
  /**设置作用域 */
  function setScope(scopeDef: SCOPE) {
    scope.value = scopeDef;
  }

  function getScope() {
    return scope.value;
  }
  return {
    scopeData,
    navTagScopeData,
    scopeJs,
    scopeCss,
    setScope,
    getScope,
    scopeId,
  };
}
