<template>
  <label class="ticket-field" :class="{solved: disabled}">
    <span class="ticket-label">
      {{ label }}
      <i v-if="required && !disabled">Required</i>
      <i v-if="disabled" class="solve-mark">Issuer</i>
    </span>
    <el-select v-if="param.options.length" v-model="value" :disabled="disabled" class="ticket-control">
      <el-option v-for="option in param.options" :key="option.value" :label="option.label" :value="option.value" />
    </el-select>
    <el-switch v-else-if="param.valueType === 'boolean'" v-model="bool" :disabled="disabled" />
    <el-date-picker
      v-else-if="param.valueType === 'date'"
      v-model="value"
      :disabled="disabled"
      type="date"
      value-format="YYYY-MM-DD"
      class="ticket-control"
    />
    <el-input v-else v-model="value" :disabled="disabled" :placeholder="placeholder" class="ticket-control" />
    <small v-if="hint">{{ hint }}</small>
  </label>
</template>

<script setup lang="ts">
import type {ParamAtom} from '@/types';

defineProps<{
  param: ParamAtom;
  label: string;
  placeholder: string;
  hint: string;
  disabled: boolean;
  required: boolean;
}>();

const value = defineModel<string>({default: ''});
const bool = defineModel<boolean>('bool', {default: false});
</script>
