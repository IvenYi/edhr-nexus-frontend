import { ref, watch } from 'vue';

const categoryList = ref<any[]>([]);
const appList = ref<any[]>([]);
const brandList = ref<any[]>([]);
const versionList = ref<any[]>([]);

const categoryId = ref<string>('');
const appId = ref<string>('');
const brandId = ref<string>('');
const versionId = ref<string>('');
async function loadCats() {
  categoryList.value = Array(16)
    .fill('')
    .map(() => {
      return {
        id: Math.random().toString(36).substring(2),
      };
    });

  categoryId.value = categoryList.value[0]?.id;
}

watch(categoryId, async () => {
  console.log(111111);
});

async function setCat(id: string) {
  categoryId.value = id;
}

async function loadBrands() {
  brandList.value = Array(16)
    .fill('')
    .map(() => {
      return {
        id: Math.random().toString(36).substring(2),
      };
    });

  brandId.value = brandList.value[0]?.id;
}

async function loadApps() {
  appList.value = Array(16)
    .fill('')
    .map(() => {
      return {
        id: Math.random().toString(36).substring(2),
      };
    });

  appId.value = appList.value[0]?.id;
}

async function loadVersion() {
  versionList.value = Array(16)
    .fill('')
    .map(() => {
      return {
        id: Math.random().toString(36).substring(2),
      };
    });

  versionId.value = versionList.value[0]?.id;
}

export function useKnowledge() {
  return {
    loadCats,
    setCat,
    loadApps,
    loadVersion,
    loadBrands,
    categoryList,
    appList,
    brandList,
    versionList,
    categoryId,
    appId,
    brandId,
    versionId,
  };
}
