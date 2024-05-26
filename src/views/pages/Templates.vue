§
<script setup lang="ts">
import { FilterMatchMode } from 'primevue/api';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { useLocalStorage } from '@vueuse/core';
import { useProductStore } from '@/store/product';
import { useTemplateStore } from '@/store/template';
import * as DayJS from 'dayjs';
import { useToast } from 'primevue/usetoast';
import { ref, onBeforeMount, computed, onMounted, watch } from 'vue';

const products = ref(null);
const filters = ref({});
const dt = ref(null);
const inputHeaders = ref([]);
const data = ref([]);
const columnIndex = ref(0);
const dataFile = ref(null);
const templates = ref([]);
const debug = ref(false);
const buildTemplate = ref(false);
const showTemplateList = ref(false);

const toast = useToast();

const store = useLocalStorage('templates', templates);
const productStore = useProductStore();
const templateStore = useTemplateStore();

const dataTemplateColumn = ref({
    name: 'Name',
    from: 'From',
    type: 'Type',
    format: 'Format',
    description: 'Decription',
    formula: 'Formula',
    delimiter: 'Delimiter'
});
const dataTemplateColumns = ref([]);
const dataTemplateName = ref('');
const typeItems = ref([
    { name: 'Decimal', value: 'decimal' },
    { name: 'String', value: 'string' },
    { name: 'Date', value: 'date' },
    { name: 'Time', value: 'time' },
    { name: 'DateTime', value: 'datetime' },
    { name: 'Boolean', value: 'boolean' }
]);

const formulaItems = ref([
    { name: 'Sum', value: 'sum' },
    { name: 'Concat', value: 'concat' },
    { name: 'Average', value: 'average' },
    { name: 'Count', value: 'count' },
    { name: 'Max', value: 'max' },
    { name: 'Min', value: 'min' },
    { name: 'None', value: 'none' }
]);

const formatStringItems = ref([
    { name: 'Uppercase', value: 'uppercase' },
    { name: 'Lowercase', value: 'lowercase' },
    { name: 'Titlecase', value: 'titlecase' },
    { name: 'Sentencecase', value: 'sentencecase' },
    { name: 'Camelcase', value: 'camelcase' },
    { name: 'Pascalcase', value: 'pascalcase' },
    { name: 'Snakecase', value: 'snakecase' },
    { name: 'Kebabcase', value: 'kebabcase' },
    { name: 'Dotcase', value: 'dotcase' },
    { name: 'Spacecase', value: 'spacecase' },
    { name: 'Constantcase', value: 'constantcase' },
    { name: 'Headercase', value: 'headercase' },
    { name: 'No Special Characters', value: 'nospecial' },
    { name: 'No Special Characters with Space', value: 'nospecialwithspace' },
    { name: 'None', value: 'none' }
]);

const formatDecimalItems = ref([
    { name: 'Currency', value: 'currency' },
    { name: 'Percent', value: 'percent' },
    { name: 'Dimension', value: 'dimension' },
    { name: 'Weight', value: 'weight' },
    { name: 'Round', value: 'round' },
    { name: 'Truncate', value: 'truncate' },
    { name: 'Floor', value: 'floor' },
    { name: 'Ceil', value: 'ceil' },
    { name: '0.00', value: '2' },
    { name: '0.0', value: '1' },
    { name: 'None', value: 'none' }
]);

const formatDateItems = ref([
    { name: 'Short Date', value: 'short' },
    { name: 'Medium Date', value: 'medium' },
    { name: 'Long Date', value: 'long' },
    { name: 'Full Date', value: 'full' },
    { name: 'None', value: 'none' }
]);

const formatTimeItems = ref([
    { name: 'Short Time', value: 'short' },
    { name: 'Medium Time', value: 'medium' },
    { name: 'Long Time', value: 'long' },
    { name: 'Full Time', value: 'full' },
    { name: 'None', value: 'none' }

]);
const formatDateTimeItems = ref([
    { name: 'Short DateTime', value: 'short' },
    { name: 'Medium DateTime', value: 'medium' },
    { name: 'Long DateTime', value: 'long' },
    { name: 'Full DateTime', value: 'full' },
    { name: 'None', value: 'none' }
]);

const formatBooleanItems = ref([
    { name: '1/0', value: '10' },
    { name: 'Yes/No', value: 'yesno' },
    { name: 'True/False', value: 'truefalse' },
    { name: 'Active/Inactive', value: 'activeinactive' },
    { name: 'On/Off', value: 'onoff' },
    { name: 'Enabled/Disabled', value: 'enableddisabled' },
    { name: 'Visible/Hidden', value: 'visiblehidden' },
    { name: 'Success/Error', value: 'successerror' },
    { name: 'Pass/Fail', value: 'passfail' },
    { name: 'Approved/Rejected', value: 'approvedrejected' },
    { name: 'Accepted/Declined', value: 'accepteddeclined' },
    { name: 'None', value: 'none' }
]);

const formulaStringItems = ref([
    { name: 'Concat', value: 'concat' },
    { name: 'None', value: 'none' }
]);

const formulaDecimalItems = ref([
    { name: 'Sum', value: 'sum' },
    { name: 'Multiply', value: 'multiply' },
    { name: 'Divide', value: 'divide' },
    { name: 'Average', value: 'average' },
    { name: 'Count', value: 'count' },
    { name: 'Max', value: 'max' },
    { name: 'Min', value: 'min' },
    { name: 'None', value: 'none' }
]);

const formulaDateItems = ref([
    { name: 'Days between', value: 'days_between' },
    { name: 'Weeks between', value: 'weeks_between' },
    { name: 'Months between', value: 'months_between' },
    { name: 'Years between', value: 'years_between' },
    { name: 'None', value: 'none' }
]);

const formulaBooleanItems = ref([
    { name: 'And (&&)', value: 'and' },
    { name: 'Or (||)', value: 'or' },
    { name: 'Not (!)', value: 'not' },
    { name: 'XOR', value: 'xor' },
    { name: 'None', value: 'none' }
]);

const formulaTimeItems = ref([
    { name: 'Hours between', value: 'hours_between' },
    { name: 'Minutes between', value: 'minutes_between' },
    { name: 'Seconds between', value: 'seconds_between' },
    { name: 'None', value: 'none' }
]);

const exportItems = ref([
    { label: 'CSV', icon: 'pi pi-file csv', command: exportDataCSV },
    { label: 'Excel', icon: 'pi pi-file-excel excel', command: exportDataExcel },
    { label: 'JSON', icon: 'pi pi-file json', command: exportDataJSON }
]);

const dataTemplate = computed(() => {
    return {
        columns: dataTemplateColumns.value
    };
});

const transformedData = computed(() => {
    return data.value.map((row) => {
        const newRow = {};
        dataTemplateColumns.value.forEach((col) => {
            if (col.from?.length <= 1) {
                newRow[col.name] = formatData(row[col.from[0]?.name], col.format?.value, col.type?.value);
            } else if (col.from?.length > 1) {
                const values = col.from.map((f) => row[f.name]);
                switch (col.formula.value) {
                    case 'sum':
                        newRow[col.name] = formatData(
                            values.reduce((acc, val) => Number(acc) + Number(val), 0),
                            col.format,
                            col.type
                        );
                        break;
                    case 'multiply':
                        newRow[col.name] = formatData(
                            values.reduce((acc, val) => Number(acc) * Number(val), 1),
                            col.format,
                            col.type
                        );
                        break;
                    case 'divide':
                        newRow[col.name] = formatData(
                            values.reduce((acc, val) => Number(acc) / Number(val) || 1, 1),
                            col.format,
                            col.type
                        );
                        break;
                    case 'concat':
                        newRow[col.name] = values.join(col.delimiter);
                        break;
                    case 'average':
                        newRow[col.name] = values.reduce((acc, val) => Number(acc) + Number(val), 0) / values.length || 1;
                        break;
                    case 'count':
                        newRow[col.name] = values.length;
                        break;
                    case 'max':
                        newRow[col.name] = Math.max(...values);
                        break;
                    case 'min':
                        newRow[col.name] = Math.min(...values);
                        break;
                    case 'days_between':
                        newRow[col.name] = DayJS(values[0]).diff(DayJS(values[1]), 'days');
                        break;
                    case 'weeks_between':
                        newRow[col.name] = DayJS(values[0]).diff(DayJS(values[1]), 'weeks');
                        break;
                    case 'months_between':
                        newRow[col.name] = DayJS(values[0]).diff(DayJS(values[1]), 'months');
                        break;
                    case 'years_between':
                        newRow[col.name] = DayJS(values[0]).diff(DayJS(values[1]), 'years');
                        break;
                    case 'hours_between':
                        newRow[col.name] = DayJS(values[0]).diff(DayJS(values[1]), 'hours');
                        break;
                    case 'minutes_between':
                        newRow[col.name] = DayJS(values[0]).diff(DayJS(values[1]), 'minutes');
                        break;
                    case 'seconds_between':
                        newRow[col.name] = DayJS(values[0]).diff(DayJS(values[1]), 'seconds');
                        break;
                    case 'and':
                        newRow[col.name] = values.every((v) => !!v === true);
                        break;
                    case 'or':
                        newRow[col.name] = values.some((v) => !!v === true) || values.every((v) => !!v === false);
                        break;
                    case 'not':
                        newRow[col.name] = !values[0];
                        break;
                    case 'xor':
                        newRow[col.name] = values.reduce((acc, val) => acc !== val);
                        break;
                    case 'none':
                    default:
                        newRow[col.name] = values;
                }

                newRow[col.name] = formatData(newRow[col.name], col.format?.value, col.type?.value);
            } else {
                newRow[col.name] = row[col.from?.name];
            }
        });
        return newRow;
    });
});

const hasTransformedData = computed(() => dataTemplate.value.columns.length > 0 && dataTemplate.value.columns.some((col) => col.from));

function formatData(value, format, type) {
    if (!value) return value;

    switch (type) {
        case 'decimal':
            return formatDecimal(value, format);
        case 'string':
            return formatString(value, format);
        case 'date':
            return formatDataDate(value, format);
        case 'time':
            return formatDataTime(value, format);
        case 'datetime':
            return formatDataDateTime(value, format);
        case 'boolean':
            return formatDataBoolean(value, format);
        default:
            return value;
    }
}

function formatDecimal(value, format) {
    if (!value) return value;

    switch (format) {
        case 'currency':
            return formatCurrency(value);
        case 'percent':
            return new Intl.NumberFormat(navigator.language, { style: 'percent' }).format(value);
        case 'dimension':
            return formatDimension(value);
        case 'weight':
            return formatWeight(value);
        case 'round':
            return new Intl.NumberFormat(navigator.language, { maximumFractionDigits: 0 }).format(value);
        case 'truncate':
            return new Intl.NumberFormat(navigator.language, { maximumFractionDigits: 0 }).format(value);
        case 'floor':
            return new Intl.NumberFormat(navigator.language, { maximumFractionDigits: 0 }).format(Math.floor(value));
        case 'ceil':
            return new Intl.NumberFormat(navigator.language, { maximumFractionDigits: 0 }).format(Math.ceil(value));
        case '3':
            return new Intl.NumberFormat(navigator.language, { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(Math.ceil(value));
        case '2':
            return new Intl.NumberFormat(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.ceil(value));
        case '1':
            return new Intl.NumberFormat(navigator.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(Math.ceil(value));
        case 'none':
        default:
            return value;
    }

    // const formatter = new Intl.NumberFormat('en-US', {
    //     minimumFractionDigits: fractionPart?.length,
    //     maximumFractionDigits: fractionPart?.length
    // });

    // return formatter.format(value);
}

const formatDataDate = (value, format) => {
    const date = new DayJS(value);
    if (!value || !date.isValid()) {
        return value;
    }

    return new Intl.DateTimeFormat(navigator.language, { dateStyle: format }).format(new Date(value));
};

const formatDataTime = (value, format) => {
    const date = new DayJS(value);
    if (!value || !date.isValid()) {
        return value;
    }

    return new Intl.DateTimeFormat(navigator.language, { timeStyle: format }).format(new Date(value));
};

const formatDataDateTime = (value, format) => {
    const date = new DayJS(value);
    if (!value || !date.isValid()) {
        return value;
    }

    return new Intl.DateTimeFormat(navigator.language, { dateStyle: format, timeStyle: format }).format(new Date(value));
};

const formatDataBoolean = (value, format) => {
    switch (format) {
        case '10':
            return value ? '1' : '0';
        case 'yesno':
            return value ? 'Yes' : 'No';
        case 'truefalse':
            return value ? 'True' : 'False';
        case 'activeinactive':
            return value ? 'Active' : 'Inactive';
        case 'onoff':
            return value ? 'On' : 'Off';
        case 'enableddisabled':
            return value ? 'Enabled' : 'Disabled';
        case 'visiblehidden':
            return value ? 'Visible' : 'Hidden';
        case 'successerror':
            return value ? 'Success' : 'Error';
        case 'passfail':
            return value ? 'Pass' : 'Fail';
        case 'approvedrejected':
            return value ? 'Approved' : 'Rejected';
        case 'accepteddeclined':
            return value ? 'Accepted' : 'Declined';
        default:
            return value;
    }
};

function formatString(value, format) {
    if (!value) return value;

    const isArray = Array.isArray(value);

    switch (format) {
        case 'uppercase':
            return !isArray ? value?.toUpperCase() : value.map((v) => v?.toUpperCase());
        case 'lowercase':
            return !isArray ? value.toLowerCase() : value.map((v) => v.toLowerCase());
        case 'titlecase':
            return !isArray ? value.replace(/\b\w/g, (c) => c.toUpperCase()) : value.map((v) => v.replace(/\b\w/g, (c) => c.toUpperCase()));
        case 'sentencecase':
            return !isArray ? value.charAt(0).toUpperCase() + value.slice(1) : value.map((v) => v.charAt(0).toUpperCase() + v.slice(1));
        case 'camelcase':
            return !isArray ? value.replace(/\W+(.)/g, (match, chr) => chr.toUpperCase()) : value.map((v) => v.replace(/\W+(.)/g, (match, chr) => chr.toUpperCase()));
        case 'pascalcase':
            return !isArray ? value.replace(/\W+(.)/g, (match, chr) => chr.toUpperCase()) : value.map((v) => v.replace(/\W+(.)/g, (match, chr) => chr.toUpperCase()));
        case 'snakecase':
            return !isArray ? value.replace(/\s+/g, '_') : value.map((v) => v.replace(/\s+/g, '_'));
        case 'kebabcase':
            return !isArray ? value.replace(/\s+/g, '-') : value.map((v) => v.replace(/\s+/g, '-'));
        case 'dotcase':
            return !isArray ? value.replace(/\s+/g, '.') : value.map((v) => v.replace(/\s+/g, '.'));
        case 'spacecase':
            return !isArray ? value.replace(/\s+/g, ' ') : value.map((v) => v.replace(/\s+/g, ' '));
        case 'constantcase':
            return !isArray ? value.replace(/\s+/g, '_').toUpperCase() : value.map((v) => v.replace(/\s+/g, '_').toUpperCase());
        case 'headercase':
            return !isArray ? value.replace(/\b\w/g, (c) => c.toUpperCase()) : value.map((v) => v.replace(/\b\w/g, (c) => c.toUpperCase()));
        case 'nospecial':
            return !isArray ? value.replace(/[^\w\s]/gi, '') : value.map((v) => v.replace(/[^\w\s]/gi, ''));
        case 'nospecialwithspace':
            return !isArray ? value.replace(/[^\w\s]/gi, ' ') : value.map((v) => v.replace(/[^\w\s]/gi, ' '));
        default:
            return value;
    }
}

function addColumn() {
    dataTemplateColumns.value.push({
        id: Math.random(),
        from: null,
        name: '',
        type: '',
        format: '',
        description: '',
        formula: '',
        delimiter: ''
    });

    columnIndex.value = dataTemplateColumns.value.length - 1;
}

function deleteColumn() {
    dataTemplateColumns.value.pop();
}

function loadData() {
    document.getElementById('fileInput').click();
}

async function parseExcel(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Get the first worksheet
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];

            // Convert the worksheet to CSV
            const csv = XLSX.utils.sheet_to_csv(worksheet);

            resolve(csv);
        };
        reader.onerror = function (ex) {
            reject(ex);
        };
        reader.readAsArrayBuffer(file);
    });
}

function saveTemplate() {
    templates.value.push({
        name: dataTemplateName.value,
        columns: dataTemplateColumns.value
    });
    store.value = templates.value;
    buildTemplate.value = false;

    toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Template saved successfully',
        life: 3000,
        group: 'br'
    });
}

function applyTemplate(e) {
    const name = e.data.name;
    dataTemplateColumns.value = templates.value.find((template) => template.name === name)?.columns;
    dataTemplateName.value = name;

    setTimeout(() => {
        showTemplateList.value = false;
    }, 100);
}

function removeTemplate(e) {
    const name = e.data.name;
    const index = templates.value.findIndex((template) => template.name === name);
    templates.value.splice(index, 1);
    store.value = templates.value;

    toast.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Template removed',
        life: 3000,
        group: 'br'
    });
}

function createTemplate() {
    buildTemplate.value = true;
    dataTemplateColumns.value = [];
}

function exportDataExcel() {
    const ws = XLSX.utils.json_to_sheet(transformedData.value);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'transformed_data.xlsx');
}

function exportDataJSON() {
    const dataStr = JSON.stringify(transformedData.value, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'transformed_data.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function exportDataCSV() {
    const csv = Papa.unparse(transformedData.value);
    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    const exportFileDefaultName = 'transformed_data.csv';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

const formatCurrency = (value) => {
    return new Intl.NumberFormat(navigator.language, { style: 'currency', currency: 'SEK' }).format(value);
};

const formatDimension = (value) => {
    return new Intl.NumberFormat(navigator.language, { style: 'unit', unit: 'centimeter' }).format(value);
};

const formatWeight = (value) => {
    return new Intl.NumberFormat(navigator.language, { style: 'unit', unit: 'kilogram' }).format(value);
};

const formatDate = (value) => {
    return new Intl.DateTimeFormat(navigator.language).format(new Date(value));
};

const formatActivity = (value) => {
    return value ? 'Active' : 'Inactive';
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

const onSelect = (e) => {
    console.log(e);
    dataFile.value = e.files[0];
    console.log(dataFile.value);
};

const toggleTemplateList = () => {
    showTemplateList.value = !showTemplateList.value;
};

onBeforeMount(async () => {
    initFilters();
    if (productStore.products?.value?.length < 1) await productStore.fetchProducts();
    products.value = productStore.products.value;
    const csv = await fetch('../../sample/CHAIR_MOCK_DATA.csv');
    const text = await csv.text();
    const result = Papa.parse(text, { header: true });
    data.value = result.data;
    console.log(result.data);

    inputHeaders.value = result.meta.fields.map((field) => ({ name: field, value: field }));
});
onMounted(() => {
    addColumn();
    templateStore.templates.value = store.value;
});

watch(dataFile, async (file) => {
    if (!file) return;
    console.log(file.type);
    if (file.type !== 'text/csv' && file.type !== 'application/json' && file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        alert('Invalid file type');
        return;
    }

    if (file.type === 'application/json') {
        const text = await file.text();
        data.value = JSON.parse(text);
        inputHeaders.value = Object.keys(data.value[0]).map((field) => ({ name: field, value: field }));

        return;
    }

    if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        const csv = await parseExcel(file);
        data.value = Papa.parse(csv, { header: true }).data;
        inputHeaders.value = Object.keys(data.value[0]).map((field) => ({ name: field, value: field }));
        return;
    }

    const text = await file.text();
    const result = Papa.parse(text, { header: true });
    data.value = result.data;
    console.log(result.data);

    inputHeaders.value = result.meta.fields.map((field) => ({ name: field, value: field }));
});
</script>
§
<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <FileUpload v-model="dataFile" :disabled="dataFile" mode="basic" :maxFileSize="1000000" label="Import" chooseLabel="Import" @select="onSelect" class="mr-2 inline-block" />
                        <SplitButton label="Export" severity="info" icon="pi pi-upload" :model="exportItems" @click="exportDataCSV" />
                    </template>
                    <template v-slot:center>
                        <span v-if="dataFile">
                            <Tag severity="warning" :value="`${dataFile.size} bytes`" class="mr-2" />
                            <Tag severity="info" :value="`${inputHeaders.length} columns`" class="mr-2" />
                            <Tag severity="info" :value="` ${data.length} rows`" />
                        </span>
                    </template>

                    <template v-slot:end>
                        <Button label="Template list" :badge="templates.length" icon="pi pi-arrow-left" @click="toggleTemplateList" />
                    </template>
                </Toolbar>
                <div><h5 class="mb-4">Manage Templates</h5></div>
                <div class="flex flex-column md:flex-row">
                    <div class="w-full md:w-12 flex flex-column align-items-center justify-content-center">
                        <Divider align="center" type="dotted" class="my-2">
                            <b>Template Editor</b>
                        </Divider>

                        <div class="w-full md:w-12 flex flex-wrap justify-content-between align-items-center gap-2">
                            <div class="flex flex-wrap justify-content-center align-items-center gap-2">
                                <label for="templateName">Template name</label>
                                <InputText v-model="dataTemplateName" label="Template name" />
                            </div>

                            <ButtonGroup>
                                <Button :disabled="!!!dataTemplateName" label="Add column" severity="info" icon="pi pi-plus" @click="addColumn"></Button>
                                <Button :disabled="!!!dataTemplateName" label="Delete column" class="mr-2" severity="danger" icon="pi pi-minus" @click="deleteColumn"></Button>
                                <Button :disabled="!!!dataTemplateName" label="Save template" severity="success" icon="pi pi-save" @click="saveTemplate"></Button>
                            </ButtonGroup>
                        </div>
                        <div v-if="dataTemplateName" class="w-full md:w-12 flex flex-wrap overflow-auto justify-content-start align-items-center">
                            <div class="template-editor">
                                <div class="fields" v-for="(col, i) in dataTemplate.columns" :key="i">
                                    <Fieldset :legend="`Column ${i + 1}`">
                                        <div class="field">
                                            <FloatLabel>
                                                <InputText id="header" v-model="col.name" />
                                                <label for="header">Header</label>
                                            </FloatLabel>
                                        </div>
                                        <div class="field">
                                            <FloatLabel>
                                                <InputText id="description" v-model="col.description" />
                                                <label for="description">Description</label>
                                            </FloatLabel>
                                        </div>
                                        <div v-if="col.name" class="field">
                                            <FloatLabel class="w-full md:w-20rem">
                                                <MultiSelect id="ms-from" v-model="col.from" :options="inputHeaders" optionLabel="name" :maxSelectedLabels="1" class="w-full" />
                                                <label for="ms-cities">From</label>
                                            </FloatLabel>
                                        </div>
                                        <div v-if="col.from" class="field">
                                            <FloatLabel class="w-full md:w-14rem">
                                                <Dropdown v-model="col.type" inputId="dd-type" :options="typeItems" optionLabel="name" class="w-full" />
                                                <label for="dd-type">Type</label>
                                            </FloatLabel>
                                        </div>
                                        <div v-if="col.type" class="field">
                                            <FloatLabel v-if="col.type.value === 'string'" class="w-full md:w-14rem" :key="col.type.value">
                                                <Dropdown v-model="col.format" inputId="dd-format" :options="formatStringItems" optionLabel="name" class="w-full" />
                                                <label for="dd-format">Format</label>
                                            </FloatLabel>
                                            <FloatLabel v-if="col.type.value === 'decimal'" class="w-full md:w-14rem" :key="col.type.value">
                                                <Dropdown v-model="col.format" inputId="dd-format" :options="formatDecimalItems" optionLabel="name" class="w-full" />
                                                <label for="dd-format">Format</label>
                                            </FloatLabel>
                                            <FloatLabel v-if="col.type.value === 'date'" class="w-full md:w-14rem" :key="col.type.value">
                                                <Dropdown v-model="col.format" inputId="dd-format" :options="formatDateItems" optionLabel="name" class="w-full" />
                                                <label for="dd-format">Format</label>
                                            </FloatLabel>
                                            <FloatLabel v-if="col.type.value === 'time'" class="w-full md:w-14rem" :key="col.type.value">
                                                <Dropdown v-model="col.format" inputId="dd-format" :options="formatTimeItems" optionLabel="name" class="w-full" />
                                                <label for="dd-format">Format</label>
                                            </FloatLabel>
                                            <FloatLabel v-if="col.type.value === 'datetime'" class="w-full md:w-14rem" :key="col.type.value">
                                                <Dropdown v-model="col.format" inputId="dd-format" :options="formatDateTimeItems" optionLabel="name" class="w-full" />
                                                <label for="dd-format">Format</label>
                                            </FloatLabel>
                                            <FloatLabel v-if="col.type.value === 'boolean'" class="w-full md:w-14rem" :key="col.type.value">
                                                <Dropdown v-model="col.format" inputId="dd-format" :options="formatBooleanItems" optionLabel="name" class="w-full" />
                                                <label for="dd-format">Format</label>
                                            </FloatLabel>
                                        </div>
                                        <div v-if="col.type" class="field">
                                            <FloatLabel v-if="col.type.value === 'string'" class="w-full md:w-14rem">
                                                <Dropdown v-model="col.formula" inputId="dd-formula" :options="formulaStringItems" optionLabel="name" class="w-full" />
                                                <label for="dd-formula">Formula</label>
                                            </FloatLabel>
                                            <FloatLabel v-if="col.type.value === 'decimal'" class="w-full md:w-14rem">
                                                <Dropdown v-model="col.formula" inputId="dd-formula" :options="formulaDecimalItems" optionLabel="name" class="w-full" />
                                                <label for="dd-formula">Formula</label>
                                            </FloatLabel>
                                            <FloatLabel v-if="col.type.value === 'date'" class="w-full md:w-14rem">
                                                <Dropdown v-model="col.formula" inputId="dd-formula" :options="formulaDateItems" optionLabel="name" class="w-full" />
                                                <label for="dd-formula">Formula</label>
                                            </FloatLabel>
                                            <FloatLabel v-if="col.type.value === 'time' || col.type.value === 'datetime'" class="w-full md:w-14rem">
                                                <Dropdown v-model="col.formula" inputId="dd-formula" :options="formulaTimeItems" optionLabel="name" class="w-full" />
                                                <label for="dd-formula">Formula</label>
                                            </FloatLabel>
                                            <FloatLabel v-if="col.type.value === 'boolean'" class="w-full md:w-14rem">
                                                <Dropdown v-model="col.formula" inputId="dd-formula" :options="formulaBooleanItems" optionLabel="name" class="w-full" />
                                                <label for="dd-formula">Formula</label>
                                            </FloatLabel>
                                        </div>
                                        <div v-if="col.formula.value === 'concat'" class="field">
                                            <FloatLabel>
                                                <InputText v-model="col.delimiter" />
                                                <label for="delimiter">Delimiter</label>
                                            </FloatLabel>
                                        </div>
                                    </Fieldset>
                                </div>
                            </div>
                        </div>
                        <div v-else class="w-full md:w-12 flex flex-wrap justify-content-center align-items-center py-6">
                            <h5>Enter a template name or select a saved template...</h5>
                        </div>
                    </div>
                </div>
                <Divider align="center" type="dotted" class="my-2">
                    <b>Preview</b>
                </Divider>
                <div v-if="hasTransformedData">
                    <DataTable
                        ref="dt"
                        :value="transformedData"
                        dataKey="id"
                        :paginator="true"
                        :rows="5"
                        :filters="filters"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        :rowsPerPageOptions="[5, 10, 25]"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} rows"
                    >
                        <Column v-for="(col, i) in dataTemplateColumns" :key="i" :field="col.name" :header="col.name" headerStyle="width:14%; min-width:9rem;">
                            <template #body="slotProps">
                                <span class="p-column-title">{{ col.name }}</span>
                                {{ slotProps.data[col.name] }}
                            </template>
                        </Column>
                    </DataTable>
                </div>
                <div v-else>
                    <div class="flex flex-column align-items-center justify-content-center gap-2 py-6">
                        <h5>No data to display</h5>
                    </div>
                </div>
                <Sidebar v-model:visible="showTemplateList" header="Templates" class="w-full md:w-30rem lg:w-40rem" position="right">
                    <div class="w-full md:w-12 flex flex-column align-items-center justify-content-center gap-3 py-5">
                        <div>
                            <DataTable
                                ref="dt"
                                :value="templates"
                                dataKey="id"
                                :paginator="true"
                                :rows="50"
                                :filters="filters"
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                :rowsPerPageOptions="[50, 100]"
                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} templates"
                            >
                                <Column field="name" header="Name" headerStyle="width:10%; min-width:6rem;">
                                    <template #body="slotProps">
                                        <span class="p-column-title">Name</span>
                                        {{ slotProps.data.name }}
                                    </template>
                                </Column>
                                <Column field="columns" header="Columns" headerStyle="width:10%; min-width:6rem;">
                                    <template #body="slotProps">
                                        <span class="p-column-title">Columns</span>
                                        {{ slotProps.data.columns.length }}
                                    </template>
                                </Column>
                                <Column headerStyle="width:14%; min-width:5rem;">
                                    <template #body="slotProps">
                                        <ButtonGroup>
                                            <Button icon="pi pi-check" :data-name="slotProps.name" @click="applyTemplate(slotProps)" />
                                            <Button icon="pi pi-trash" class="p-button-danger" @click="removeTemplate(slotProps)" />
                                        </ButtonGroup>
                                    </template>
                                </Column>
                                <template #footer> {{ templates ? templates.length : 0 }} templates in total. </template>
                            </DataTable>
                        </div>
                    </div>
                </Sidebar>
            </div>
        </div>

        <Toast position="bottom-right" group="br" />
    </div>
</template>
§
<style scoped>
div.fields {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 5px;
}

div.field {
    display: flex;
    gap: 10px;
    padding: 0.5rem 0;
    width: 200px;
}

div.template-editor {
    display: flex;
    flex-direction: row;
    gap: 10px;
    padding: 4rem 2rem 2rem 0;
}
</style>
