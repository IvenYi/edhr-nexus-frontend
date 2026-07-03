import { defineAsyncComponent } from 'vue';
import type { Component } from 'vue';

type componentMap = Record<string, () => Promise<Component>>;
const designModules: componentMap = import.meta.glob(`../field/**/*-design.{vue,tsx}`);
const designTableModules: componentMap = import.meta.glob(`../field/**/*-design-table.{vue,tsx}`);

const designMap = new Map();
const designTableMap = new Map();

init(designModules, designMap, '-design');

init(designTableModules, designTableMap, '-design-table');
function init(m: componentMap, map, design) {
  Object.entries(m).forEach(([path, value]) => {
    const fileNameWithExtension = path.split('/').pop()!;
    const fileNameWithoutExtension = fileNameWithExtension.split(design).slice(0, -1).join('.');
    fileNameWithoutExtension &&
      map.set('gct-' + fileNameWithoutExtension, defineAsyncComponent(value));
  });
}

export function getDesignComponentByType(type: string) {
  const key = 'gct-' + type;
  return designTableMap.get(key) || designMap.get(key);
}
