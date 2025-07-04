<!-- src/components/LandmarkTable.vue -->
<template>
  <div class="landmark-table-container">
    <!-- Search and Filter Header -->
    <div class="table-header">
      <div class="search-section">
        <q-input
          v-model="searchText"
          filled
          placeholder="Buscar landmarks..."
          class="search-input"
          dense
        >
          <template #prepend>
            <q-icon name="search" class="text-primary" />
          </template>
          <template #append>
            <q-btn
              v-if="searchText"
              flat
              round
              dense
              icon="clear"
              @click="searchText = ''"
            />
          </template>
        </q-input>
      </div>
      
      <div class="filter-section">
        <q-select
          v-model="selectedCountry"
          :options="countryOptions"
          emit-value
          map-options
          label="País"
          filled
          dense
          clearable
          class="country-filter"
        >
          <template #prepend>
            <q-icon name="public" class="text-secondary" />
          </template>
        </q-select>
        
        <q-select
          v-model="selectedTag"
          :options="tagOptions"
          emit-value
          map-options
          label="Tag"
          filled
          dense
          clearable
          class="tag-filter"
        >
          <template #prepend>
            <q-icon name="local_offer" class="text-accent" />
          </template>
        </q-select>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-section">
      <q-card class="stat-card">
        <q-card-section class="stat-content">
          <div class="stat-icon">
            <q-icon name="place" size="sm" color="primary" />
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ filteredLandmarks.length }}</div>
            <div class="stat-label">Landmarks</div>
          </div>
        </q-card-section>
      </q-card>
      
      <q-card class="stat-card">
        <q-card-section class="stat-content">
          <div class="stat-icon">
            <q-icon name="public" size="sm" color="secondary" />
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ uniqueCountries.length }}</div>
            <div class="stat-label">Països</div>
          </div>
        </q-card-section>
      </q-card>
      
      <q-card class="stat-card">
        <q-card-section class="stat-content">
          <div class="stat-icon">
            <q-icon name="local_offer" size="sm" color="accent" />
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ uniqueTags.length }}</div>
            <div class="stat-label">Tags</div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Enhanced Table -->
    <div class="table-wrapper">
      <q-table
        :columns="columns"
        :rows="filteredLandmarks"
        row-key="_id"
        :pagination="pagination"
        :rows-per-page-options="[10, 20, 50, 100]"
        :loading="loading"
        class="landmark-table"
        flat
        bordered
      >
        <!-- Header customization -->
        <template #header="props">
          <q-tr :props="props" class="table-header-row">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              class="table-header-cell"
            >
              <div class="header-content">
                <q-icon
                  v-if="getHeaderIcon(col.name)"
                  :name="getHeaderIcon(col.name)"
                  size="xs"
                  class="q-mr-xs"
                />
                {{ col.label }}
              </div>
            </q-th>
          </q-tr>
        </template>

        <!-- Custom body cells -->
        <template #body-cell-place="props">
          <q-td :props="props" class="place-cell">
            <div class="place-content">
              <q-icon name="location_on" size="xs" class="text-primary q-mr-xs" />
              <span class="place-name">{{ props.value }}</span>
            </div>
          </q-td>
        </template>

        <template #body-cell-country="props">
          <q-td :props="props">
            <q-chip
              :label="props.value"
              color="secondary"
              text-color="white"
              size="sm"
              class="country-chip"
            >
              <template #avatar>
                <q-icon name="flag" />
              </template>
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-date="props">
          <q-td :props="props">
            <div class="date-content">
              <q-icon name="event" size="xs" class="text-info q-mr-xs" />
              <span>{{ formatDate(props.value) }}</span>
            </div>
          </q-td>
        </template>

        <template #body-cell-year="props">
          <q-td :props="props">
            <q-badge
              :label="props.value || 'N/A'"
              :color="props.value ? 'positive' : 'grey'"
              class="year-badge"
            />
          </q-td>
        </template>

        <template #body-cell-tags="props">
          <q-td :props="props">
            <div class="tags-container">
              <q-chip
                v-for="tag in props.value"
                :key="tag"
                :label="tag"
                text-color="white"
                size="sm"
                class="tag-chip"
                :style="{ backgroundColor: getTagColor(tag) }"
              >
                <template #avatar>
                  <q-icon name="local_offer" />
                </template>
              </q-chip>

              <span v-if="!props.value || props.value.length === 0" class="no-tags">
                Sense categories
              </span>
            </div>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props">
            <div class="action-buttons">
              <q-btn
                v-if="false"
                round
                flat
                icon="visibility"
                size="sm"
                class="action-btn view-btn"
                @click="viewLandmark(props.row)"
              >
                <q-tooltip>Veure detalls</q-tooltip>
              </q-btn>
              
              <q-btn
                round
                flat
                icon="edit"
                size="sm"
                class="action-btn edit-btn"
                @click="editLandmark(props.row)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              
              <q-btn
                round
                flat
                icon="delete"
                size="sm"
                class="action-btn delete-btn"
                @click="confirmDelete(props.row)"
              >
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <!-- Loading template -->
        <template #loading>
          <q-inner-loading showing color="primary">
            <div class="loading-content">
              <q-spinner-dots size="50px" />
              <div class="loading-text">Carregant landmarks...</div>
            </div>
          </q-inner-loading>
        </template>

        <!-- No data template -->
        <template #no-data>
          <div class="no-data-container">
            <q-icon name="explore_off" size="4rem" class="text-grey-5" />
            <div class="no-data-text">No s'han trobat landmarks</div>
            <div class="no-data-subtitle">
              {{ searchText || selectedCountry || selectedTag 
                ? 'Prova a canviar els filtres de cerca' 
                : 'Comença afegint el teu primer landmark' }}
            </div>
          </div>
        </template>
      </q-table>
    </div>

    <!-- View Dialog -->
    <q-dialog v-model="showViewDialog" class="view-dialog">
      <q-card class="view-card">
        <q-card-section class="view-header">
          <div class="view-title">
            <q-icon name="place" class="q-mr-sm" />
            {{ selectedLandmark?.place }}
          </div>
          <q-btn flat round dense icon="close" @click="showViewDialog = false" />
        </q-card-section>
        
        <q-separator />
        
        <q-card-section class="view-content">
          <div class="landmark-details">
            <div class="detail-item">
              <q-icon name="public" class="detail-icon" />
              <span class="detail-label">País:</span>
              <span class="detail-value">{{ selectedLandmark?.country }}</span>
            </div>
            
            <div class="detail-item">
              <q-icon name="event" class="detail-icon" />
              <span class="detail-label">Data:</span>
              <span class="detail-value">{{ formatDate(selectedLandmark?.date) }}</span>
            </div>
            
            <div class="detail-item">
              <q-icon name="calendar_today" class="detail-icon" />
              <span class="detail-label">Any:</span>
              <span class="detail-value">{{ selectedLandmark?.year || 'N/A' }}</span>
            </div>
            
            <div v-if="selectedLandmark?.tags?.length" class="detail-item">
              <q-icon name="local_offer" class="detail-icon" />
              <span class="detail-label">Tags:</span>
              <div class="detail-tags">
                <q-chip
                  v-for="tag in selectedLandmark.tags"
                  :key="tag"
                  :label="tag"
                  color="accent"
                  text-color="white"
                  size="sm"
                />
              </div>
            </div>
            
            <div v-if="selectedLandmark?.description" class="detail-item">
              <q-icon name="description" class="detail-icon" />
              <span class="detail-label">Descripció:</span>
              <p class="detail-description">{{ selectedLandmark.description }}</p>
            </div>
            
            <div v-if="selectedLandmark?.coordinates" class="detail-item">
              <q-icon name="my_location" class="detail-icon" />
              <span class="detail-label">Coordenades:</span>
              <span class="detail-value">
                {{ selectedLandmark.coordinates.lat?.toFixed(6) }}, 
                {{ selectedLandmark.coordinates.lng?.toFixed(6) }}
              </span>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import ApiRepository from '../repositories/ApiRepository';

export default {
  name: 'LandmarkTable',
  setup() {
    const $q = useQuasar();
    const landmarks = ref([]);
    const loading = ref(true);
    const searchText = ref('');
    const selectedCountry = ref('');
    const selectedTag = ref('');
    const showViewDialog = ref(false);
    const selectedLandmark = ref(null);

    const columns = [
      { 
        name: 'place', 
        label: 'Lloc', 
        field: 'place', 
        align: 'left',
        sortable: true 
      },
      { 
        name: 'country', 
        label: 'País', 
        field: 'country', 
        align: 'center',
        sortable: true 
      },
      { 
        name: 'date', 
        label: 'Data', 
        field: 'date', 
        align: 'center',
        sortable: true 
      },
      { 
        name: 'year', 
        label: 'Any', 
        field: 'year', 
        align: 'center',
        sortable: true 
      },
      { 
        name: 'tags', 
        label: 'Tags', 
        field: 'tags', 
        align: 'left' 
      },
      { 
        name: 'actions', 
        label: 'Accions', 
        field: 'actions', 
        align: 'center' 
      },
    ];

    const pagination = ref({ 
      sortBy: 'date', 
      descending: true, 
      page: 1, 
      rowsPerPage: 1000 
    });

    const tagColors = {
      Nenes: '#e91e63',
      Jo: '#03a9f4',
      Tania: '#9c27b0'
    };

    const getTagColor = (tag) => {
      return tagColors[tag] || 'accent';
    };


    // Computed properties
    const filteredLandmarks = computed(() => {
      let filtered = landmarks.value;

      // Text search
      if (searchText.value) {
        const search = searchText.value.toLowerCase();
        filtered = filtered.filter(landmark => 
          landmark.place?.toLowerCase().includes(search) ||
          landmark.country?.toLowerCase().includes(search) ||
          landmark.tags?.some(tag => tag.toLowerCase().includes(search)) ||
          landmark.description?.toLowerCase().includes(search)
        );
      }

      // Country filter
      if (selectedCountry.value) {
        filtered = filtered.filter(landmark => 
          landmark.country === selectedCountry.value
        );
      }

      // Tag filter
      if (selectedTag.value) {
        filtered = filtered.filter(landmark => 
          landmark.tags?.includes(selectedTag.value)
        );
      }

      return filtered;
    });

    const uniqueCountries = computed(() => {
      const countries = landmarks.value
        .map(l => l.country)
        .filter(Boolean);
      return [...new Set(countries)].sort();
    });

    const uniqueTags = computed(() => {
      const tags = landmarks.value
        .flatMap(l => l.tags || [])
        .filter(Boolean);
      return [...new Set(tags)].sort();
    });

    const countryOptions = computed(() => 
      uniqueCountries.value.map(country => ({
        label: country,
        value: country
      }))
    );

    const tagOptions = computed(() => 
      uniqueTags.value.map(tag => ({
        label: tag,
        value: tag
      }))
    );

    // Methods
    const loadLandmarks = async () => {
      try {
        loading.value = true;
        const response = await ApiRepository.getLandmarks();
        landmarks.value = response.data || [];
      } catch (error) {
        console.error('Error loading landmarks:', error);
        $q.notify({
          type: 'negative',
          message: 'Error al carregar els landmarks',
          icon: 'error'
        });
      } finally {
        loading.value = false;
      }
    };

    const formatDate = (date) => {
      if (!date) return 'N/A';
      try {
        return new Date(date).toLocaleDateString('ca-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch {
        return 'Data invàlida';
      }
    };

    const getHeaderIcon = (columnName) => {
      const icons = {
        place: 'place',
        country: 'public',
        date: 'event',
        year: 'calendar_today',
        tags: 'local_offer',
        actions: 'settings'
      };
      return icons[columnName];
    };

    const viewLandmark = (landmark) => {
      selectedLandmark.value = landmark;
      showViewDialog.value = true;
    };

    const editLandmark = (landmark) => {
      $q.notify({
        type: 'info',
        message: 'Funcionalitat d\'edició en desenvolupament',
        icon: 'construction'
      });
    };

    const confirmDelete = (landmark) => {
      $q.dialog({
        title: 'Confirmar eliminació',
        message: `Estàs segur que vols eliminar "${landmark.place}"? Aquesta acció no es pot desfer.`,
        cancel: true,
        persistent: true,
        color: 'negative',
        ok: {
          label: 'Eliminar',
          color: 'negative'
        },
        cancel: {
          label: 'Cancel·lar',
          color: 'grey'
        }
      }).onOk(async () => {
        await deleteLandmark(landmark._id);
      });
    };

    const deleteLandmark = async (id) => {
      try {
        await ApiRepository.deleteLandmark(id);
        $q.notify({
          type: 'positive',
          message: 'Landmark eliminat correctament',
          icon: 'delete_sweep'
        });
        await loadLandmarks(); // Reload data instead of page refresh
      } catch (error) {
        console.error('Error deleting landmark:', error);
        $q.notify({
          type: 'negative',
          message: 'Error al eliminar el landmark',
          icon: 'error'
        });
      }
    };

    // Lifecycle
    onMounted(loadLandmarks);

    return {
      landmarks,
      filteredLandmarks,
      columns,
      pagination,
      loading,
      searchText,
      selectedCountry,
      selectedTag,
      countryOptions,
      tagOptions,
      uniqueCountries,
      uniqueTags,
      showViewDialog,
      selectedLandmark,
      formatDate,
      getHeaderIcon,
      viewLandmark,
      editLandmark,
      confirmDelete,
      deleteLandmark,
      getTagColor
    };
  },
};
</script>

<style scoped>
.landmark-table-container {
  padding: 16px;
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  border-radius: 16px;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Header Section */
.table-header {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-section {
  flex: 2;
  min-width: 250px;
}

.search-input {
  background: white;
  border-radius: 12px;
}

.filter-section {
  flex: 1;
  display: flex;
  gap: 12px;
  min-width: 300px;
}

.country-filter,
.tag-filter {
  background: white;
  border-radius: 12px;
  min-width: 140px;
}

/* Stats Section */
.stats-section {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.stat-card {
  flex: 1;
  min-width: 140px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 12px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(102, 126, 234, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
}

.stat-label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

/* Table Wrapper */
.table-wrapper {
  flex: 1;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.05);
}

.landmark-table {
  height: 100%;
}

/* Table Header */
.table-header-row {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.table-header-cell {
  color: white !important;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 16px 12px;
}

.header-content {
  display: flex;
  align-items: center;
}

/* Custom Cells */
.place-cell {
  font-weight: 600;
}

.place-content {
  display: flex;
  align-items: center;
}

.place-name {
  color: #2c3e50;
}

.country-chip {
  font-weight: 500;
}

.date-content {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.year-badge {
  font-weight: 600;
}

.tags-container {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  align-items: center;
}

.tag-chip {
  font-weight: 500;
}

.no-tags {
  color: #94a3b8;
  font-style: italic;
  font-size: 0.85rem;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.action-btn {
  transition: all 0.2s ease;
}

.view-btn:hover {
  background: rgba(33, 150, 243, 0.1);
  color: #2196f3;
}

.edit-btn:hover {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.delete-btn:hover {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

/* Loading and No Data */
.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-text {
  font-size: 1.1rem;
  color: #667eea;
  font-weight: 500;
}

.no-data-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  text-align: center;
}

.no-data-text {
  font-size: 1.3rem;
  font-weight: 600;
  color: #64748b;
  margin: 16px 0 8px;
}

.no-data-subtitle {
  color: #94a3b8;
  font-size: 0.95rem;
}

/* View Dialog */
.view-dialog .q-dialog__inner {
  padding: 16px;
}

.view-card {
  max-width: 500px;
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
}

.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
}

.view-title {
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.view-content {
  padding: 24px;
}

.landmark-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.detail-icon {
  color: #667eea;
  margin-top: 2px;
}

.detail-label {
  font-weight: 600;
  color: #374151;
  min-width: 80px;
}

.detail-value {
  color: #64748b;
  flex: 1;
}

.detail-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  flex: 1;
}

.detail-description {
  color: #64748b;
  line-height: 1.5;
  margin: 0;
  flex: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
  }
  
  .filter-section {
    flex-direction: column;
    min-width: auto;
  }
  
  .stats-section {
    gap: 12px;
  }
  
  .stat-card {
    min-width: 120px;
  }
  
  .stat-content {
    padding: 12px;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .landmark-table-container {
    padding: 12px;
  }
  
  .view-header {
    padding: 16px 20px;
  }
  
  .view-content {
    padding: 20px;
  }
  
  .detail-item {
    flex-direction: column;
    gap: 6px;
  }
  
  .detail-label {
    min-width: auto;
  }
}

/* Custom scrollbar */
.table-wrapper ::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-wrapper ::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.table-wrapper ::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 4px;
}

.table-wrapper ::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.5);
}
</style>