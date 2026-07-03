<template>
  <mr-container
    ref="mrContainerRef"
    :id="project?.id"
    :zoom="zoom"
    :style="pageStyles"
    :class="[{ stage: true }]"
    :isDesign="true"
    :activeElements="selectedElements"
    :snapTracking="snapTracking"
    @arrows="arrowsHandler"
    @moving="movingHandler"
    @movingItem="movingItem"
    @movestop="moveStopHandler"
    @resizestop="resizeStopHandler"
    @rotatestop="rotateStopHandler"
    @selectstop="selectStopHandler"
    @clearselection="clearSelectionHandler"
    @delete="deleteHandler"
    @copy="copyHandler"
    @cut="cutHandler"
    @paste="pasteHandler"
    @drop="dropHandler"
    @undo="$root.$emit('undo')"
    @redo="$root.$emit('redo')"
  >
    <stage-el
      v-for="element in selectSchema"
      :key="element.id"
      :elem="element"
      @updatePBarcodeWidth="updatePBarcodeWidth"
    />
  </mr-container>
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue';
  import { useDesigner } from '../hooks/useDesigner';
  import { usePage } from '../hooks/usePage';
  import { cloneDeep } from 'lodash-es';
  import { getComputedProp, fixElementToParentBounds } from '../helper/positionDimension';
  import MrContainer from '../components/mr-vue/MrContainer.vue';
  import StageEl from './StageEl.vue';

  const emit = defineEmits(['movingItem', 'updatePBarcodeWidth']);
  const defProps = defineProps<{
    schema?: any;
  }>();
  const DROP_BORDER = {
    width: '2px',
    style: 'solid',
    color: '#f1867f',
  };
  const {
    selectedElements,
    snapTracking,
    selectedPage,
    zoom,
    moveElement,
    rebaseSelectedElements,
    resizeElement,
    rotateElement,
    addSelectedElements,
    clearSelectedElements,
    removeElement,
    registerElement,
    resizeBarcodeWidth,
    isModal,
  } = useDesigner();
  const { project } = usePage();
  const mrContainerRef = ref();
  const dropContainer = ref();
  const clipboard = ref([]);
  const defaultBorder = ref({
    width: '',
    style: '',
    color: '',
  });
  watch(dropContainer, (newVal, oldVal) => {
    if (oldVal) {
      oldVal.style.borderWidth = defaultBorder.value.width;
      oldVal.style.borderStyle = defaultBorder.value.style;
      oldVal.style.borderColor = defaultBorder.value.color;
    }

    if (newVal) {
      defaultBorder.value.width = newVal.style.borderWidth;
      defaultBorder.value.style = newVal.style.borderStyle;
      defaultBorder.value.color = newVal.style.borderColor;
      newVal.style.borderWidth = DROP_BORDER.width;
      newVal.style.borderStyle = DROP_BORDER.style;
      newVal.style.borderColor = DROP_BORDER.color;
    }
  });
  // watch(selectedElements, (newVal, oldVal) => {
  //   if (newVal.length === 1) {
  //     const siblingElems = findSiblingElements(newVal[0].id);
  //     updateSnaps(siblingElems);
  //   }
  // });
  const selectSchema = computed(() => {
    return isModal.value ? defProps.schema : selectedPage.value;
  });
  const focusCanvas = () => {
    mrContainerRef.value.$el.focus();
  };
  const pageStyles = computed(() => {
    return {
      height: isNaN(project.value.height) ? project.value.height : project.value.height + 'px',
      width: isNaN(project.value.width) ? project.value.width : project.value.width + 'px',
      // transform: 'scale(' + this.zoom + ')',
      // transformOrigin: 'center'
      // background: this.page['background-color'],
      overflow: 'hidden',
    };
  });
  ///methods
  const arrowsHandler = ({ direction, shiftKey }) => {
    if (selectedElements.value.length > 0) {
      let diff = shiftKey ? 10 : 1;

      let addedTop = 0;
      let addedBottom = 0;
      let addedLeft = 0;
      let addedRight = 0;

      switch (direction) {
        case 'up':
          addedTop -= diff;
          addedBottom += diff;
          addedLeft = addedRight = 0;
          break;
        case 'down':
          addedBottom -= diff;
          addedTop += diff;
          addedLeft = addedRight = 0;
          break;
        case 'left':
          addedLeft -= diff;
          addedRight += diff;
          addedTop = addedBottom = 0;
          break;
        case 'right':
          addedRight -= diff;
          addedLeft += diff;
          addedTop = addedBottom = 0;
          break;
      }
      const parentH = parseInt(window.getComputedStyle(mrContainerRef.value.$el).height);
      const parentW = parseInt(window.getComputedStyle(mrContainerRef.value.$el).width);
      selectedElements.value.map((el) => {
        let compTop = getComputedProp('top', el);
        let compBottom = getComputedProp('bottom', el);
        let compLeft = getComputedProp('left', el);
        let compRight = getComputedProp('right', el);

        let top =
          addedTop && compTop + addedTop >= 0 && compBottom + addedBottom >= 0
            ? compTop + addedTop
            : null;
        let bottom =
          addedBottom && compBottom + addedBottom >= 0 && compTop + addedTop >= 0
            ? compBottom + addedBottom
            : null;
        let left =
          addedLeft && compLeft + addedLeft >= 0 && compRight + addedRight >= 0
            ? compLeft + addedLeft
            : null;
        let right =
          addedRight && compRight + addedRight >= 0 && compLeft + addedLeft >= 0
            ? compRight + addedRight
            : null;

        if (top || bottom || left || right) {
          moveElement({
            elId: el.id,
            pageId: project.value.id,
            //修改百分比
            top: top
              ? typeof el.top === 'string' && el.top.indexOf('%') > -1
                ? (top / parentH) * 100 + '%'
                : top
              : top,
            bottom: bottom
              ? typeof el.bottom === 'string' && el.bottom.indexOf('%') > -1
                ? (bottom / parentH) * 100 + '%'
                : bottom
              : bottom,
            left: left
              ? typeof el.left === 'string' && el.left.indexOf('%') > -1
                ? (left / parentW) * 100 + '%'
                : left
              : left,
            right: right
              ? typeof el.right === 'string' && el.right.indexOf('%') > -1
                ? (right / parentW) * 100 + '%'
                : right
              : right,
          });
        }
      });
      rebaseSelectedElements();
    }
  };

  const movingHandler = (absMouseX, absMouseY) => {
    // this.dropContainer = this.getContaineggOnPoint(absMouseX, absMouseY);
    // this.toggleDroppableCursor(!!this.dropContainer);
  };
  const moveStopHandler = (moveStopData) => {
    // const containegg = this.getContaineggOnPoint(
    //   moveStopData.absMouseX,
    //   moveStopData.absMouseY
    // );
    // const parentId = containegg ? containegg.id : null;
    moveStopData.moveElData.map((moveData) => {
      moveElement({
        ...moveData,
        pageId: project.value.id,
        parentId: null,
        mouseX: moveStopData.relMouseX,
        mouseY: moveStopData.relMouseY,
      });
    });

    rebaseSelectedElements();
    dropContainer.value = null;
  };

  const resizeStopHandler = (resStopData) => {
    resStopData.map((resElData) => resizeElement({ ...resElData, pageId: project.value.id }));
    rebaseSelectedElements();
  };

  const rotateStopHandler = (rotStopData) => {
    rotStopData.map((rotElData) => rotateElement({ ...rotElData, pageId: project.value.id }));
    rebaseSelectedElements();
  };

  const selectStopHandler = (selectionBox) => {
    if (
      (selectionBox.top === selectionBox.bottom && selectionBox.left === selectionBox.right) ||
      selectedPage.value.length === 0
    )
      return;

    let selectedElements = [];
    selectedPage.value.forEach((childEl) => {
      const child = childEl;

      let childTop = getComputedProp('top', child);
      let childLeft = getComputedProp('left', child);
      let childBottom = getComputedProp('height', child, project.value) + childTop;
      let childRight = getComputedProp('width', child, project.value) + childLeft;
      if (
        childTop >= selectionBox.top &&
        childLeft >= selectionBox.left &&
        childBottom <= selectionBox.bottom &&
        childRight <= selectionBox.right
      ) {
        selectedElements.push(child);
      }
    });

    if (selectedElements.length > 0) {
      addSelectedElements(selectedElements);
    }
  };
  const clearSelectionHandler = () => {
    console.log('clearSelectionHandler');
    if (selectedElements.value.length > 0) clearSelectedElements();
  };
  const deleteHandler = () => {
    if (selectedElements.value.length > 0) {
      let comps: any[] = [];
      selectedElements.value.forEach((el) => {
        removeElement({ page: project.value, elId: el.id });
      });
    }
  };

  const copyHandler = () => {
    if (selectedElements.value.length > 0) {
      clipboard.value = [];
      selectedElements.value.map((el) => clipboard.value.push(cloneDeep(el)));
    }
  };

  const cutHandler = () => {
    if (selectedElements.value.length > 0) {
      clipboard.value = [];
      selectedElements.value.map((el) => {
        clipboard.value.push(cloneDeep(el));
        removeElement({ page: project.value, elId: el.id });
      });
    }
  };

  const pasteHandler = () => {
    if (clipboard.value.length > 0) {
      console.log('pasteHandler');
      clearSelectedElements();
      clipboard.value.map((el) => {
        el.left += 10;
        el.top += 10;
        for (let key in el.attrs) {
          if (el.attrs[key].tag) {
            el.attrs[key].tag = '';
          }
          if (el.attrs[key].tagValueArray) {
            el.attrs[key].tagValueArray = [];
          }
          if (key === 'alarmGroupId') {
            el.attrs[key].value = '';
          }
        }
        registerElement({ pageId: project.value.id, el });
      });
    }
  };
  const dropHandler = (e) => {
    if (window.DragTreeTableOutDropData) {
      //从元素属性那边拖过来，直接禁用后续逻辑
      return false;
    }
    const maineggRect = mrContainerRef.value.$el.getBoundingClientRect();
    let element = JSON.parse(e.dataTransfer.getData('text/plain'));
    let height = getComputedProp('height', element, project.value);
    let width = getComputedProp('width', element, project.value);
    let top = e.pageY - maineggRect.top - (height / 2) * zoom.value;
    let left = e.pageX - maineggRect.left - (width / 2) * zoom.value;
    top = Math.round(top / zoom.value);
    left = Math.round(left / zoom.value);
    const fixedElement = fixElementToParentBounds({ top, left, height, width }, project.value);
    element = { ...element, ...fixedElement };
    clearSelectedElements();
    registerElement({
      pageId: project.value.id,
      el: element,
    });
    focusCanvas();
  };
  //动态修改条形码宽度
  const updatePBarcodeWidth = ({ width, rotateWidth, height, elId }) => {
    resizeBarcodeWidth({
      width,
      rotateWidth,
      height,
      elId,
      pageId: project.value.id,
    });
    emit('updatePBarcodeWidth', {
      width,
      rotateWidth,
      height,
      elId,
      pageId: project.value.id,
    });
    rebaseSelectedElements();
  };

  function movingItem(x, y, w, h): void {
    emit('movingItem', x, y, w, h);
  }
</script>

<style>
  html.droppable,
  html.droppable * {
    cursor: copy !important;
  }
</style>
