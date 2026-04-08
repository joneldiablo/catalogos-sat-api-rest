const { createApp, ref, computed, onMounted } = Vue;

const API_BASE = '/api';

createApp({
  setup() {
    const tables = ref([]);
    const selectedTable = ref('');
    const tableData = ref([]);
    const totalRecords = ref(0);
    const rawJsonData = ref(null);
    const currentPage = ref(0);
    const pageSize = ref(50);
    const searchQuery = ref('');
    const orderByColumn = ref('');
    const orderDirection = ref('asc');
    const filterColumn = ref('');
    const filterValue = ref('');
    const activeFilters = ref([]);
    const showRawJson = ref(false);
    const apiStatus = ref('Conectando...');
    const columns = ref([]);
    const tableMeta = ref([]);
    
    let tableInstance = null;
    const tableRef = ref(null);
    
    const groupedTables = computed(() => {
      const groups = {};
      tables.value.forEach(table => {
        const normalized = table.replace(/-/g, '_');
        const prefix = normalized.split('_')[0];
        let groupName = prefix.toUpperCase();
        if (prefix === 'cfdi40') groupName = 'CFDI 4.0';
        else if (prefix === 'cfdi') groupName = 'CFDI 3.3';
        else if (prefix === 'ret') groupName = 'Retenciones 2.0';
        else if (prefix === 'nomina') groupName = 'Nóminas';
        else if (prefix === 'pagos') groupName = 'Pagos';
        else if (prefix.startsWith('cce')) groupName = 'Comercio Exterior';
        else if (prefix.startsWith('ccp')) groupName = 'Carta Porte';
        else if (prefix === 'hyp') groupName = 'Hidrocarburos';
        
        if (!groups[groupName]) groups[groupName] = [];
        groups[groupName].push(table);
      });
      return groups;
    });
    
    const apiEndpoint = computed(() => selectedTable.value ? `/${selectedTable.value}/` : '');
    
    const highlightedJson = computed(() => {
      if (!rawJsonData.value) return '';
      return hljs.highlightAuto(JSON.stringify(rawJsonData.value, null, 2), ['json']).value;
    });
    
    const displayPage = computed(() => currentPage.value + 1);
    
    const totalPages = computed(() => {
      if (!totalRecords.value) return 0;
      return Math.ceil(totalRecords.value / pageSize.value);
    });
    
    const currentRequestUrl = computed(() => {
      if (!selectedTable.value) return '';
      const params = new URLSearchParams();
      params.append('limit', pageSize.value);
      params.append('page', currentPage.value);
      if (searchQuery.value) params.append('q', searchQuery.value);
      if (orderByColumn.value) params.append(`orderBy.${orderByColumn.value}`, orderDirection.value);
      activeFilters.value.forEach(f => {
        params.append(`filters[${f.column}]`, f.value);
      });
      return `${window.location.origin}${API_BASE}/${selectedTable.value}/?${params.toString()}`;
    });
    
    function onPageInput(event) {
      const val = parseInt(event.target.value) - 1;
      currentPage.value = isNaN(val) ? 0 : Math.max(0, val);
      loadData();
    }
    
    async function fetchTables() {
      try {
        const response = await axios.get(API_BASE + '/');
        const data = response.data.data || response.data;
        if (data && data.endpoints) {
          tables.value = [...new Set(
            data.endpoints
              .filter(k => k.startsWith('GET /') && k.endsWith('/') && !k.includes('/meta'))
              .map(k => k.replace('GET /', '').replace(/\/$/, ''))
          )].sort();
        }
        apiStatus.value = 'Conectado';
        document.getElementById('api-status').className = 'badge bg-success';
        document.getElementById('api-status').textContent = 'Conectado';
      } catch (error) {
        apiStatus.value = 'Error';
        document.getElementById('api-status').className = 'badge bg-danger';
        document.getElementById('api-status').textContent = 'Error';
      }
    }
    
    async function fetchMeta() {
      try {
        const response = await axios.get(`${API_BASE}/${selectedTable.value}/meta`);
        if (response.data.success || response.data.status === 200) {
          tableMeta.value = response.data.data || [];
          columns.value = tableMeta.value.map(col => col.name);
        }
      } catch (error) {
        tableMeta.value = [];
        columns.value = [];
      }
    }
    
    async function loadData() {
      if (!selectedTable.value) return;
      
      const params = new URLSearchParams();
      params.append('limit', pageSize.value);
      params.append('page', currentPage.value);
      
      if (searchQuery.value) params.append('q', searchQuery.value);
      if (orderByColumn.value) params.append(`orderBy.${orderByColumn.value}`, orderDirection.value);
      
      activeFilters.value.forEach(f => {
        params.append(`filters[${f.column}]`, f.value);
      });
      
      const response = await axios.get(`${API_BASE}/${selectedTable.value}/?${params.toString()}`);
      
      if (response.data.success || response.data.status === 200) {
        tableData.value = response.data.data || [];
        totalRecords.value = response.data.total || tableData.value.length;
        rawJsonData.value = response.data;
        
        if (tableMeta.value.length === 0 && tableData.value.length > 0) {
          columns.value = Object.keys(tableData.value[0]);
          tableMeta.value = columns.value.map(n => ({ name: n, type: 'text' }));
        }
        
        renderTable();
      }
    }
    
    function renderTable() {
      if (tableInstance) {
        tableInstance.destroy();
        tableInstance = null;
      }
      
      if (!tableRef.value || tableData.value.length === 0) return;
      
      const cols = [
        { 
          title: '', 
          field: '_rowNum', 
          width: 60, 
          hozAlign: 'center', 
          headerSort: false, 
          headerSortStartingDir: 'desc'
        }
      ].concat(tableMeta.value.map(col => ({
        title: col.name,
        field: col.name,
        minWidth: 100,
        headerSort: false
      })));
      
      let rowNum = currentPage.value * pageSize.value + 1;
      const dataWithRowNum = tableData.value.map(row => ({ ...row, _rowNum: rowNum++ }));
      
      tableInstance = new Tabulator(tableRef.value, {
        data: dataWithRowNum,
        columns: cols,
        layout: 'fitData',
        responsiveLayout: false,
        movableColumns: true,
        virtualDom: true
      });
    }
    
    function onTableChange() {
      if (selectedTable.value) {
        currentPage.value = 0;
        activeFilters.value = [];
        tableMeta.value = [];
        columns.value = [];
        tableData.value = [];
        totalRecords.value = 0;
        fetchMeta().then(loadData);
      }
    }
    
    function toggleOrder() {
      orderDirection.value = orderDirection.value === 'asc' ? 'desc' : 'asc';
      loadData();
    }
    
    function changeOrderBy() {
      loadData();
    }
    
    function prevPage() {
      if (currentPage.value > 0) {
        currentPage.value--;
        loadData();
      }
    }
    
    function nextPage() {
      currentPage.value++;
      loadData();
    }
    
    function changePageSize() {
      currentPage.value = 0;
      loadData();
    }
    
    let searchTimeout = null;
    function debouncedSearch() {
      if (searchTimeout) clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentPage.value = 0;
        loadData();
      }, 300);
    }
    
    function applyFilter() {
      if (!filterColumn.value || !filterValue.value) return;
      activeFilters.value.push({ column: filterColumn.value, operator: '=', value: filterValue.value });
      filterColumn.value = '';
      filterValue.value = '';
      currentPage.value = 0;
      loadData();
    }
    
    function removeFilter(index) {
      activeFilters.value.splice(index, 1);
      loadData();
    }
    
    function clearFilters() {
      activeFilters.value = [];
      loadData();
    }
    
    function refreshData() {
      loadData();
    }
    
    function copyTsv() {
      if (!tableData.value.length) return;
      
      const headers = Object.keys(tableData.value[0]);
      const rows = tableData.value.map(row => 
        headers.map(h => {
          const val = row[h];
          if (val === null || val === undefined) return '';
          const str = String(val);
          return str.includes('\t') || str.includes('\n') || str.includes('"') 
            ? `"${str.replace(/"/g, '""')}"` 
            : str;
        }).join('\t')
      );
      
      const tsv = [headers.join('\t'), ...rows].join('\n');
      navigator.clipboard.writeText(tsv);
    }
    
    function copyJson() {
      if (rawJsonData.value) {
        navigator.clipboard.writeText(JSON.stringify(rawJsonData.value, null, 2));
      }
    }
    
    function copyRequest() {
      navigator.clipboard.writeText(currentRequestUrl.value);
    }
    
    onMounted(() => {
      fetchTables();
    });
    
    return {
      tables, groupedTables, selectedTable, tableData, totalRecords, rawJsonData,
      currentPage, pageSize, searchQuery, orderByColumn, orderDirection,
      filterColumn, filterValue,       activeFilters, showRawJson,
      apiStatus, columns, tableMeta, tableRef,       apiEndpoint, highlightedJson, displayPage, totalPages, currentRequestUrl,
      onTableChange, toggleOrder, changeOrderBy, prevPage, nextPage, changePageSize, onPageInput, debouncedSearch, applyFilter, removeFilter, clearFilters, refreshData, copyTsv, copyJson, copyRequest
    };
  }
}).mount('#app');
