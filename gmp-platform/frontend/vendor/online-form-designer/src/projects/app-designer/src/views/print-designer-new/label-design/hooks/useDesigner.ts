import { computed, ref } from 'vue';
import { usePage } from './usePage';
import { removeElAlias, setElIdnAlias } from '../helper/recursiveMethods';

export enum PanelEnum {
  PAGE = 'page',
  HISTORY = 'history',
  WIDGET = 'widget',
}
const zoom = ref(1);
const selectedElements = ref([]);
const isModal = ref(false);
const hoveredElements = ref([]);
//对象捕捉(吸附)
const snapTracking = ref(true);
//右侧属性面板
export const currentPanel = ref<PanelEnum>(PanelEnum.WIDGET);

const { project } = usePage();
export function useDesigner() {
  const selectedPage = computed(() => {
    return project.value ? project.value.page : {};
  });
  ///////////////////Zoom相关//////////////////////////////////////////
  function updateEditorZoom(zoomVal) {
    zoom.value = zoomVal;
  }
  /////////////////element相关/////////////////////////////////////
  function moveElement(payload) {
    const egglement = selectedPage.value.find((d) => d.id === payload.elId);
    if (payload.left !== egglement.left || payload.top !== egglement.top) {
      updateEgglement({
        egglement,
        left: egglement.left !== 'auto' ? payload.left : null,
        top: egglement.top !== 'auto' ? payload.top : null,
        bottom: egglement.bottom !== 'auto' ? payload.bottom : null,
        right: egglement.right !== 'auto' ? payload.right : null,
      });
      // dispatch('updateComponentsByPage');
    }
  }

  function rebaseSelectedElements() {
    const freshElements = selectedElements.value.map((el) => {
      return selectedPage.value.find((d) => d.id === el.id);
    });
    console.log(freshElements);
    console.log('rebaseSelectedElements');
    clearSelectedElements();
    freshElements.map((el) => addSelectedElement(el));
  }

  function resizeElement(payload) {
    const egglement = selectedPage.value.find((d) => d.id === payload.elId);
    if (
      payload.left !== egglement.left ||
      payload.top !== egglement.top ||
      payload.right !== egglement.right ||
      payload.bottom !== egglement.bottom ||
      payload.height !== egglement.height ||
      payload.width !== egglement.width
    ) {
      updateEgglement({
        egglement,
        left: egglement.left !== 'auto' ? payload.left : null,
        top: egglement.top !== 'auto' ? payload.top : null,
        bottom: egglement.bottom !== 'auto' ? payload.bottom : null,
        right: egglement.right !== 'auto' ? payload.right : null,
        height: egglement.height !== 'auto' ? payload.height : null,
        width: egglement.width !== 'auto' ? payload.width : null,
      });
      // dispatch('updateComponentsByPage');
    }
  }

  function rotateElement(payload) {
    const egglement = selectedPage.value.find((d) => d.id === payload.elId);

    if (payload.rotate !== egglement.rotate) {
      updateEgglement({
        egglement,
        rotate: payload.rotate,
      });
    }
  }

  function removeElement(payload) {
    if (selectedElements.value[0]?.isEdit) {
      return;
    }
    clearSelectedElements();

    const parent = selectedPage.value;
    const eggIndex = parent.findIndex((egg) => egg.id === payload.elId);

    const element = parent[eggIndex];
    deleteEgglement({ parent, eggIndex });
    removeElAlias(element);
  }

  function addSelectedElement(elem) {
    selectedElements.value.push(elem);
    togglePanel(PanelEnum.WIDGET);
  }
  function addSelectedElements(elements) {
    selectedElements.value = elements;
    togglePanel(PanelEnum.WIDGET);
  }
  function updateEgglement(payload) {
    // 下面三个字段用来标明改的是哪个属性或者样式
    // payload.egglement.changedName = [];
    // payload.egglement.changedStyleName = '';
    // payload.egglement.changedAttrName = '';
    if (typeof payload.alias !== 'undefined' && payload.alias !== null) {
      payload.egglement.alias = payload.alias;
      // payload.egglement.changedName.push('alias');
    }
    if (typeof payload.left !== 'undefined' && payload.left !== null) {
      payload.egglement.left = payload.left;
      // payload.egglement.changedName.push('left');
    }

    if (typeof payload.top !== 'undefined' && payload.top !== null) {
      payload.egglement.top = payload.top;
      // payload.egglement.changedName.push('top');
    }
    if (typeof payload.right !== 'undefined' && payload.right !== null) {
      payload.egglement.right = payload.right;
      // payload.egglement.changedName.push('right');
    }
    if (typeof payload.bottom !== 'undefined' && payload.bottom !== null) {
      payload.egglement.bottom = payload.bottom;
      // payload.egglement.changedName.push('bottom');
    }
    if (typeof payload.zIndex !== 'undefined' && payload.zIndex !== null) {
      payload.egglement.zIndex = payload.zIndex;
      // payload.egglement.changedName.push('zIndex');
    }
    if (typeof payload.isEdit !== 'undefined' && payload.isEdit !== null) {
      payload.egglement.isEdit = payload.isEdit;
      // payload.egglement.changedName.push('zIndex');
    }
    if (typeof payload.height !== 'undefined' && payload.height !== null) {
      payload.egglement.height = payload.height;
      // payload.egglement.changedName.push('width');
    }
    if (typeof payload.width !== 'undefined' && payload.width !== null) {
      payload.egglement.width = payload.width;
      // payload.egglement.changedName.push('width');
    }
    if (typeof payload.heightMM !== 'undefined' && payload.heightMM !== null) {
      payload.egglement.heightMM = payload.heightMM;
      // payload.egglement.changedName.push('width');
    }
    if (typeof payload.widthMM !== 'undefined' && payload.widthMM !== null) {
      payload.egglement.widthMM = payload.widthMM;
      // payload.egglement.changedName.push('width');
    }
    if (typeof payload.rotate !== 'undefined' && payload.rotate !== null) {
      payload.egglement.rotate = payload.rotate;
      // payload.egglement.changedName.push('rotate');
    }
    if (typeof payload.text !== 'undefined' && payload.text !== null) {
      payload.egglement.text = payload.text;
      // payload.egglement.changedName.push('text');
    }
    if (typeof payload.events !== 'undefined' && payload.events !== null) {
      payload.egglement.events = payload.events;
    }
    if (payload.ownId) payload.egglement.ownId = payload.ownId;
    if (payload.classes) payload.egglement.classes = payload.classes;
    if (payload.styles) {
      payload.egglement.styles = payload.styles;
      // payload.egglement.changedStyleName = payload.prop;
    }
    if (payload.attrs) {
      payload.egglement.attrs = payload.attrs;
      // payload.egglement.changedAttrName = payload.prop;
    }

    //更新完会触发当前元素的重绘，需要重新调用接口刷新
  }

  function deleteEgglement(payload) {
    payload.parent.splice(payload.eggIndex, 1);
  }

  function createEgglement(payload) {
    payload.parent.push(payload.egglement);
  }

  function clearSelectedElements() {
    selectedElements.value = [];
  }
  function registerElement(payload) {
    const parent = selectedPage.value;
    const el = payload.el;
    const egglement = setElIdnAlias(el, payload.pageId);
    createEgglement({ parent, egglement });
    addSelectedElement(egglement);
  }
  ////////BarCode////////////////////////
  function resizeBarcodeWidth(payload) {
    const egglement = selectedPage.value.find((d) => d.id === payload.elId);
    if (egglement.rotate === 90) {
      console.log(payload.height, egglement.height);
      if (payload.height !== egglement.height) {
        updateEgglement({
          egglement,
          width: payload.rotateWidth,
          height: payload.width,
        });
      } else {
        console.log('高度不变');
      }
    } else {
      if (payload.width !== egglement.width) {
        updateEgglement({
          egglement,
          width: payload.width,
        });
      } else {
        console.log('长度不变');
      }
    }
  }
  /////panel/////////////////////////////////////
  function togglePanel(value: PanelEnum) {
    if (currentPanel.value === value) return;
    currentPanel.value = value;
  }

  return {
    zoom,
    togglePanel,
    currentPanel,
    updateEditorZoom,
    moveElement,
    resizeElement,
    rotateElement,
    removeElement,
    rebaseSelectedElements,
    addSelectedElements,
    addSelectedElement,
    updateEgglement,
    clearSelectedElements,
    selectedPage,
    selectedElements,
    snapTracking,
    registerElement,
    resizeBarcodeWidth,
    hoveredElements,
    isModal,
  };
}
