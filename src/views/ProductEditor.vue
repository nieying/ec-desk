<template>
  <div class="page">
    <div class="page-head">
      <div>
        <button class="text-btn" type="button" @click="router.push('/products')">← Products</button>
        <h1>{{ isNew ? 'New product' : form.name || 'Untitled' }}</h1>
        <p>Pick parameters on the left, drag to set clause order, then mark each field as standard, advanced, or off the quote.</p>
      </div>
      <div class="actions">
        <button v-if="!isNew" class="text-btn danger" type="button" @click="remove">Delete</button>
        <button class="solid" type="button" data-testid="save-product" @click="save">Save</button>
      </div>
    </div>
    <div class="identity">
      <label class="field"><span>Code</span><el-input v-model="form.code" data-testid="product-code" /></label>
      <label class="field"><span>Name</span><el-input v-model="form.name" data-testid="product-name" /></label>
      <label class="field">
        <span>Category</span>
        <el-select v-model="form.category" style="width: 100%">
          <el-option v-for="item in CATEGORIES" :key="item" :label="item" :value="item" />
        </el-select>
      </label>
    </div>
    <div class="studio">
      <aside class="palette">
        <h3>Library</h3>
        <p class="hint">Click to add. Click again to remove.</p>
        <input v-model="keyword" class="search" placeholder="Search parameters" />
        <div v-for="(label, key) in GROUP_LABEL" :key="key">
          <template v-if="grouped(key).length">
            <div class="group-label">{{ label }}</div>
            <div class="atom-cloud">
              <button
                v-for="param in grouped(key)"
                :key="param.id"
                type="button"
                class="atom"
                :class="{on: form.paramIds.includes(param.id)}"
                @click="toggle(param.id, !form.paramIds.includes(param.id))"
              >
                {{ param.title }}
              </button>
            </div>
          </template>
        </div>
      </aside>
      <section class="canvas">
        <h3>Clauses</h3>
        <p class="hint">{{ selected.length }} parameters · Standard {{ commonParams.length }} · Advanced {{ advancedParams.length }}</p>
        <div
          v-for="(param, index) in selected"
          :key="param.id"
          class="clause"
          :class="{dragging: dragFrom === index, 'drop-target': dragOver === index && dragFrom !== index}"
          :data-testid="`clause-${param.key}`"
          @dragover.prevent="onDragOver(index)"
          @drop="onDrop(index)"
        >
          <span
            class="drag-handle"
            role="button"
            tabindex="0"
            draggable="true"
            :aria-label="`Drag ${param.title}`"
            @dragstart="onDragStart(index, $event)"
            @dragend="onDragEnd"
          >⋮⋮</span>
          <div>
            <div class="clause-top">
              <div>
                <strong>{{ param.title }}</strong>
                <div class="key">{{ param.key }}<template v-if="param.suffix"> · {{ param.suffix }}</template></div>
              </div>
              <button
                type="button"
                class="solve-pill"
                :class="{on: form.quote.solveFor.includes(param.id)}"
                @click="toggleSolve(param.id, !form.quote.solveFor.includes(param.id))"
              >
                Solve
              </button>
            </div>
            <div class="role-switch">
              <button type="button" :class="{on: roleOf(param.id) === 'common'}" @click="setRole(param.id, 'common')">Standard</button>
              <button type="button" :class="{on: roleOf(param.id) === 'advanced'}" @click="setRole(param.id, 'advanced')">Advanced</button>
              <button type="button" :class="{on: roleOf(param.id) === 'none'}" @click="setRole(param.id, 'none')">Off quote</button>
            </div>
          </div>
        </div>
        <div v-if="!selected.length" class="empty">No parameters selected.</div>
      </section>
      <aside class="ticket" data-testid="quote-preview">
        <h2>Quote</h2>
        <p class="hint">A quote solves one field. The issuer returns that value.</p>
        <div class="solve-row">
          <button
            v-for="param in solveParams"
            :key="param.id"
            type="button"
            :class="{on: solvePick === param.id}"
            :data-testid="param.id === solveParams[0]?.id ? 'solve-for' : undefined"
            @click="solvePick = param.id"
          >
            {{ labelOf(param) }}
          </button>
        </div>
        <QuoteField
          v-for="param in commonParams"
          :key="param.id"
          :param="param"
          :label="labelOf(param)"
          :placeholder="placeholderOf(param)"
          :hint="hintOf(param)"
          :disabled="param.id === solvePick"
          :required="param.id !== solvePick"
          v-model="preview[param.id]"
          v-model:bool="boolPreview[param.id]"
        />
        <details v-if="advancedParams.length" class="advanced-block">
          <summary>Advanced {{ advancedParams.length }}</summary>
          <QuoteField
            v-for="param in advancedParams"
            :key="param.id"
            :param="param"
            :label="labelOf(param)"
            :placeholder="placeholderOf(param)"
            :hint="hintOf(param)"
            :disabled="param.id === solvePick"
            :required="false"
            v-model="preview[param.id]"
            v-model:bool="boolPreview[param.id]"
          />
        </details>
        <div v-if="!commonParams.length && !solveParams.length" class="empty">No quote fields yet.</div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, reactive, ref, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {ElMessage} from 'element-plus';
import QuoteField from '@/components/QuoteField.vue';
import {useCatalog} from '@/store';
import {CATEGORIES, emptyQuote, GROUP_LABEL, type ParamAtom, type ParamGroup, type ProductDef} from '@/types';

const route = useRoute();
const router = useRouter();
const catalog = useCatalog();
const keyword = ref('');
const solvePick = ref('');
const dragFrom = ref<number | null>(null);
const dragOver = ref<number | null>(null);
const preview = reactive<Record<string, string>>({});
const boolPreview = reactive<Record<string, boolean>>({});

const isNew = computed(() => route.params.id === 'new');
const form = reactive<ProductDef>({
  id: '',
  code: '',
  name: '',
  category: 'Notes',
  paramIds: [],
  quote: emptyQuote(),
  custom: true,
});

const selected = computed(() =>
  form.paramIds
    .map((id) => catalog.params.find((item) => item.id === id))
    .filter((item): item is ParamAtom => !!item),
);

function paramsOf(ids: string[]) {
  return selected.value.filter((item) => ids.includes(item.id));
}

const commonParams = computed(() => paramsOf(form.quote.common));
const advancedParams = computed(() => paramsOf(form.quote.advanced));
const solveParams = computed(() => paramsOf(form.quote.solveFor));

function roleOf(id: string) {
  if (form.quote.common.includes(id)) return 'common';
  if (form.quote.advanced.includes(id)) return 'advanced';
  return 'none';
}

function setRole(id: string, role: string | number | boolean | undefined) {
  form.quote.common = form.quote.common.filter((item) => item !== id);
  form.quote.advanced = form.quote.advanced.filter((item) => item !== id);
  if (role === 'common') form.quote.common.push(id);
  if (role === 'advanced') form.quote.advanced.push(id);
  if (role === 'none') form.quote.solveFor = form.quote.solveFor.filter((item) => item !== id);
}

function toggleSolve(id: string, checked: boolean) {
  if (checked) {
    if (!form.quote.solveFor.includes(id)) form.quote.solveFor.push(id);
    if (roleOf(id) === 'none') setRole(id, 'common');
  } else {
    form.quote.solveFor = form.quote.solveFor.filter((item) => item !== id);
  }
}

function grouped(group: ParamGroup) {
  return catalog.params.filter((item) => {
    if (item.group !== group) return false;
    const text = `${item.title} ${item.key}`.toLowerCase();
    return !keyword.value || text.includes(keyword.value.toLowerCase());
  });
}

function toggle(id: string, checked: boolean | string | number) {
  if (checked) {
    if (!form.paramIds.includes(id)) form.paramIds.push(id);
  } else {
    form.paramIds = form.paramIds.filter((item) => item !== id);
    setRole(id, 'none');
  }
}

function onDragStart(index: number, event: DragEvent) {
  dragFrom.value = index;
  event.dataTransfer?.setData('text/plain', String(index));
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
}

function onDragOver(index: number) {
  if (dragFrom.value === null) return;
  dragOver.value = index;
}

function onDrop(index: number) {
  const from = dragFrom.value;
  if (from === null || from === index) {
    onDragEnd();
    return;
  }
  const [item] = form.paramIds.splice(from, 1);
  if (item) form.paramIds.splice(index, 0, item);
  onDragEnd();
}

function onDragEnd() {
  dragFrom.value = null;
  dragOver.value = null;
}

function labelOf(param: ParamAtom) {
  return param.suffix ? `${param.title} (${param.suffix})` : param.title;
}

function placeholderOf(param: ParamAtom) {
  if (param.id === solvePick.value) return 'Issuer to reply';
  if (param.valueType === 'array') return 'Separate underlyings with commas';
  return '';
}

function hintOf(param: ParamAtom) {
  if (param.key === 'ki') return 'Required when KI Type is AKI or EKI.';
  if (param.key === 'leverage') return 'Omit when Normal / Leveraged is Normal.';
  if (param.key === 'upperBarrier') return 'For Bullish and TwinWin.';
  if (param.key === 'lowerBarrier') return 'For Bearish and TwinWin.';
  if (param.key === 'floorCoupon') return 'When Minimum Return is Yes.';
  if (param.key === 'fixedRatePA') return 'When Rate Condition is Fixed Rate.';
  if (param.key === 'spreadPA') return 'For floating rates. Omit on a fixed rate.';
  return '';
}

function blankProduct(): ProductDef {
  return {id: '', code: '', name: '', category: 'Notes', paramIds: [], quote: emptyQuote(), custom: true};
}

function load() {
  solvePick.value = '';
  if (isNew.value) {
    Object.assign(form, blankProduct());
    return;
  }
  const current = catalog.products.find((item) => item.id === route.params.id);
  if (!current) {
    router.replace('/products');
    return;
  }
  const copy = JSON.parse(JSON.stringify(current)) as ProductDef;
  if (!copy.quote) copy.quote = emptyQuote();
  Object.assign(form, copy);
  selected.value.forEach((param) => {
    preview[param.id] = param.defaultValue;
    boolPreview[param.id] = param.defaultValue === 'yes';
  });
  solvePick.value = form.quote.solveFor[0] ?? '';
}

function save() {
  if (!form.code.trim() || !form.name.trim()) {
    ElMessage.error('Code and name are required');
    return;
  }
  if (!form.paramIds.length) {
    ElMessage.error('Select at least one parameter');
    return;
  }
  if (!form.id) form.id = `custom-prod-${Date.now()}`;
  try {
    catalog.saveProduct(JSON.parse(JSON.stringify(form)));
    ElMessage.success('Saved');
    router.push(`/products/${form.id}`);
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : 'Save failed');
  }
}

function remove() {
  catalog.removeProduct(form.id);
  router.push('/products');
}

watch(() => route.params.id, load, {immediate: true});
watch(
  () => form.quote.solveFor.join(','),
  () => {
    if (!form.quote.solveFor.includes(solvePick.value)) solvePick.value = form.quote.solveFor[0] ?? '';
  },
);
</script>
