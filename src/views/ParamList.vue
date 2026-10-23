<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1>Parameters</h1>
        <p>Each parameter is an atom. Products reference these definitions; they do not own the fields.</p>
      </div>
      <div class="actions">
        <button class="ghost" type="button" @click="reset">Reset</button>
        <button class="solid" type="button" data-testid="new-param" @click="create">New parameter</button>
      </div>
    </div>
    <div class="dictionary">
      <aside class="group-rail">
        <button type="button" :class="{on: group === ''}" @click="group = ''">
          <span>All</span><span>{{ catalog.params.length }}</span>
        </button>
        <button
          v-for="(label, key) in GROUP_LABEL"
          :key="key"
          type="button"
          :class="{on: group === key}"
          @click="group = key"
        >
          <span>{{ label }}</span><span>{{ countGroup(key) }}</span>
        </button>
      </aside>
      <div class="dict-main">
        <input v-model="keyword" class="search" placeholder="Search name or key" />
        <button
          v-for="row in rows"
          :key="row.id"
          type="button"
          class="entry"
          :class="{active: open && draft.id === row.id}"
          @click="edit(row)"
        >
          <span>
            <strong>{{ row.title }}</strong>
            <em>{{ GROUP_LABEL[row.group] }}</em>
          </span>
          <span class="key">{{ row.key }}</span>
          <span class="chip teal">{{ row.valueType }}<template v-if="row.suffix"> · {{ row.suffix }}</template></span>
          <span class="chips">
            <span v-for="option in row.options.slice(0, 4)" :key="option.value" class="chip">{{ option.label }}</span>
            <span v-if="row.options.length > 4" class="chip">+{{ row.options.length - 4 }}</span>
            <span v-if="row.custom" class="chip custom">Custom</span>
            <span v-if="!row.options.length && row.defaultValue" class="chip">Default {{ row.defaultValue }}</span>
          </span>
        </button>
        <div v-if="!rows.length" class="empty">No matching parameters</div>
      </div>
    </div>

    <div v-if="open" class="sheet-backdrop" @click="open = false"></div>
    <aside v-if="open" class="sheet">
      <h2>{{ draft.id ? 'Edit parameter' : 'New parameter' }}</h2>
      <label class="field"><span>Name</span><el-input v-model="draft.title" data-testid="param-title" /></label>
      <label class="field"><span>Key</span><el-input v-model="draft.key" data-testid="param-key" /></label>
      <label class="field"><span>Backend field</span><el-input v-model="draft.backendKey" /></label>
      <label class="field">
        <span>Group</span>
        <el-select v-model="draft.group" style="width: 100%">
          <el-option v-for="(label, key) in GROUP_LABEL" :key="key" :label="label" :value="key" />
        </el-select>
      </label>
      <label class="field">
        <span>Type</span>
        <el-select v-model="draft.valueType" style="width: 100%">
          <el-option v-for="item in valueTypes" :key="item" :label="item" :value="item" />
        </el-select>
      </label>
      <label class="field"><span>Unit</span><el-input v-model="draft.suffix" placeholder="% / m / bp" /></label>
      <label class="field">
        <span>Validation</span>
        <el-select v-model="draft.pattern" clearable placeholder="None" style="width: 100%">
          <el-option label="2 decimal places" value="float2" />
          <el-option label="Integer" value="int" />
          <el-option label="Date" value="date" />
        </el-select>
      </label>
      <label class="field"><span>Default</span><el-input v-model="draft.defaultValue" /></label>
      <div class="field">
        <span>Enum</span>
        <div v-for="(option, index) in draft.options" :key="index" class="enum-row">
          <el-input v-model="option.value" placeholder="Value" />
          <el-input v-model="option.label" placeholder="Label" />
          <button class="text-btn danger" type="button" @click="draft.options.splice(index, 1)">Remove</button>
        </div>
        <button class="ghost" type="button" data-testid="add-enum" @click="draft.options.push({value: '', label: ''})">Add option</button>
      </div>
      <div class="sheet-actions">
        <button v-if="draft.id" class="text-btn danger" type="button" @click="remove">Delete</button>
        <span v-else></span>
        <button class="solid" type="button" data-testid="save-param" @click="save">Save</button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import {computed, reactive, ref} from 'vue';
import {ElMessage} from 'element-plus';
import {useCatalog} from '@/store';
import {GROUP_LABEL, type ParamAtom, type ParamGroup, type ParamValueType} from '@/types';

const catalog = useCatalog();
const keyword = ref('');
const group = ref<ParamGroup | ''>('');
const open = ref(false);
const valueTypes: ParamValueType[] = ['string', 'number', 'date', 'array', 'boolean'];

const empty = (): ParamAtom => ({
  id: '',
  key: '',
  backendKey: '',
  title: '',
  group: 'price',
  valueType: 'string',
  options: [],
  suffix: '',
  pattern: '',
  defaultValue: '',
  custom: true,
});

const draft = reactive<ParamAtom>(empty());
let ignoreRowClick = false;
const rows = computed(() =>
  catalog.params.filter((item) => {
    const text = `${item.title} ${item.key}`.toLowerCase();
    const matchText = !keyword.value || text.includes(keyword.value.toLowerCase());
    const matchGroup = !group.value || item.group === group.value;
    return matchText && matchGroup;
  }),
);

function countGroup(key: ParamGroup) {
  return catalog.params.filter((item) => item.group === key).length;
}

function fill(source: ParamAtom) {
  Object.assign(draft, JSON.parse(JSON.stringify(source)));
}

function create() {
  fill(empty());
  open.value = true;
}

function edit(row: ParamAtom) {
  if (ignoreRowClick) return;
  fill(row);
  open.value = true;
}

function save() {
  if (!draft.title.trim() || !draft.key.trim()) {
    ElMessage.error('Name and key are required');
    return;
  }
  draft.options = draft.options.filter((item) => item.value && item.label);
  if (!draft.backendKey) draft.backendKey = draft.key;
  if (!draft.id) draft.id = `custom-${Date.now()}`;
  try {
    catalog.saveParam(JSON.parse(JSON.stringify(draft)));
    ignoreRowClick = true;
    open.value = false;
    window.setTimeout(() => {
      ignoreRowClick = false;
    }, 400);
    ElMessage.success('Saved');
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : 'Save failed');
  }
}

function remove() {
  catalog.removeParam(draft.id);
  open.value = false;
}

function reset() {
  catalog.reset();
  ElMessage.success('Catalog restored');
}
</script>
