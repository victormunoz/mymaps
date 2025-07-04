<!-- src/pages/LandmarksPage.vue -->
<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header amb gradient i animacions -->
    <q-header class="bg-gradient-header">
      <q-toolbar class="toolbar-enhanced">
        <div class="flex items-center">
          <q-icon name="place" size="md" class="text-white q-mr-sm" />
          <q-toolbar-title class="title-enhanced">
            <span class="title-main">Landmarks</span>
            <span class="title-subtitle">Explora el món</span>
          </q-toolbar-title>
        </div>
        
        <q-space />
        
        <!-- Botons d'acció amb hover effects -->
        <div class="action-buttons">
          <q-btn
            flat
            round
            icon="add_location"
            aria-label="Add Landmark"
            class="action-btn add-btn"
            size="md"
            @click="addLandmark"
          >
            <q-tooltip class="bg-primary">Afegir Landmark</q-tooltip>
          </q-btn>
          
          <q-btn
            flat
            round
            icon="delete_sweep"
            class="action-btn delete-btn q-mx-sm"
            size="md"
            aria-label="Delete All"
            @click="deleteAll"
          >
            <q-tooltip class="bg-negative">Eliminar Tots</q-tooltip>
          </q-btn>
          
          <q-btn
            flat
            round
            icon="cloud_upload"
            aria-label="Import CSV"
            class="action-btn upload-btn"
            size="md"
            @click="triggerFileInput"
          >
            <q-tooltip class="bg-secondary">Importar CSV</q-tooltip>
          </q-btn>
          
          <!-- Toggle drawer button -->
          <q-btn
            flat
            round
            :icon="drawerOpen ? 'menu_open' : 'menu'"
            aria-label="Toggle Menu"
            class="action-btn menu-btn q-ml-sm"
            size="md"
            @click="toggleDrawer"
          >
            <q-tooltip class="bg-info">{{ drawerOpen ? 'Tancar' : 'Obrir' }} Menú</q-tooltip>
          </q-btn>
        </div>
        
        <!-- Hidden File Input -->
        <input
          ref="fileInput"
          type="file"
          accept=".csv"
          style="display: none"
          @change="handleFileUpload"
        />
      </q-toolbar>
    </q-header>

    <!-- Drawer millorat amb efectes -->
    <q-drawer
      v-model="drawerOpen"
      side="left"
      :width="770"
      bordered
      class="drawer-enhanced"
      overlay-if-above
    >
      <div class="drawer-header">
        <div class="flex items-center">
          <q-icon name="list_alt" size="sm" class="text-primary q-mr-sm" />
          <div class="drawer-title">
            <div class="drawer-title-main">Ubicacions</div>
            <div class="drawer-title-sub">Gestiona els teus landmarks</div>
          </div>
        </div>
      </div>
      
      <q-separator class="separator-gradient" />
      
      <div class="drawer-content">
        <landmark-table />
      </div>
    </q-drawer>

    <!-- Main Container amb fons millorat -->
    <q-page-container class="page-container-enhanced">
      <q-page class="page-enhanced">
        <!-- Floating Stats Cards -->
        <div v-if="!drawerOpen" class="floating-stats">
          <q-card class="stats-card">
            <q-card-section class="text-center">
              <q-icon name="place" size="sm" class="text-primary" />
              <div class="stats-number">{{ totalLandmarks }}</div>
              <div class="stats-label">Landmarks</div>
            </q-card-section>
          </q-card>
        </div>
        
        <!-- Map Container -->
        <div class="map-container-enhanced">
          <div class="map-overlay-top">
            <div class="map-controls">
              <q-btn
                fab-mini
                icon="my_location"
                class="map-control-btn"
                color="white"
                text-color="primary"
                @click="centerMap"
              >
                <q-tooltip>Centrar Mapa</q-tooltip>
              </q-btn>
            </div>
          </div>
          
          <landmark-map ref="landmarkMapRef" class="map-component" />
          
          <!-- Loading overlay -->
          <div v-if="loading" class="loading-overlay">
            <q-spinner-dots size="60px" color="primary" />
            <div class="loading-text">Carregant landmarks...</div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import LandmarkMap from '../components/LandmarkMap.vue';
import LandmarkTable from '../components/LandmarkTable.vue';
import Papa from 'papaparse';
import ApiRepository from '../repositories/ApiRepository';

export default {
  name: 'LandmarksPage',
  components: {
    LandmarkMap,
    LandmarkTable,
  },
  setup() {
    const fileInput = ref(null);
    const drawerOpen = ref(true);
    const loading = ref(false);
    const totalLandmarks = ref(0);
    const $q = useQuasar();
    const landmarkMapRef = ref(null);

    // Computed per stats
    const stats = computed(() => ({
      total: totalLandmarks.value
    }));

    // Trigger the hidden file input
    const triggerFileInput = () => {
      fileInput.value.click();
    };

    // Handle CSV file upload
    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        processCSVFile(file);
        event.target.value = '';
      }
    };

    // Process CSV with loading state
    const processCSVFile = (file) => {
      loading.value = true;
      
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const landmarksData = results.data.map((row) => ({
              place: row.Name || extractPlaceFromAddress(row.Address),
              country: extractCountryFromAddress(row.Address),
              date: row.Created ? new Date(row.Created) : null,
              year: row.Created ? parseInt(row.Created) : null,
              tags: [row['Category Name']].filter(Boolean),
              coordinates: {
                lat: parseFloat(row.Latitude),
                lng: parseFloat(row.Longitude),
              },
              description: row.Description || '',
            }));

            await ApiRepository.importLandmarks(landmarksData);
            
            $q.notify({
              type: 'positive',
              message: `${landmarksData.length} landmarks importats correctament!`,
              icon: 'cloud_done',
              position: 'top',
              timeout: 3000,
              actions: [{ icon: 'close', color: 'white' }]
            });
            
            setTimeout(() => window.location.reload(), 1000);
          } catch (error) {
            console.error('Error importing landmarks:', error);
            $q.notify({
              type: 'negative',
              message: 'Error al importar landmarks.',
              icon: 'error',
              position: 'top'
            });
          } finally {
            loading.value = false;
          }
        },
        error: (error) => {
          loading.value = false;
          console.error('Error parsing CSV file:', error);
          $q.notify({
            type: 'negative',
            message: 'Error al processar el fitxer CSV.',
            icon: 'error'
          });
        },
      });
    };

    const extractCountryFromAddress = (address) => {
      if (!address) return '';
      const parts = address.split(',');
      return parts[parts.length - 1].trim();
    };

    const extractPlaceFromAddress = (address) => {
      if (!address) return '';
      const parts = address.split(',');
      return parts[0].trim();
    };

    const toggleDrawer = () => {
      drawerOpen.value = !drawerOpen.value;
    };

    const addLandmark = () => {
      if (landmarkMapRef.value && typeof landmarkMapRef.value.openAddDialog === 'function') {
        landmarkMapRef.value.openAddDialog();
      } else {
        $q.notify({
          type: 'warning',
          message: 'No es pot obrir el diàleg per afegir landmarks.',
          icon: 'warning'
        });
      }
    };

    const deleteAll = async () => {
      $q.dialog({
        title: 'Confirmar eliminació',
        message: 'Estàs segur que vols eliminar tots els landmarks? Aquesta acció no es pot desfer.',
        cancel: true,
        persistent: true,
        color: 'negative'
      }).onOk(async () => {
        loading.value = true;
        try {
          await ApiRepository.deleteLandmarks();
          $q.notify({
            type: 'positive',
            message: 'Tots els landmarks han estat eliminats!',
            icon: 'delete_sweep',
            position: 'top'
          });
          setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
          console.error('Error deleting landmarks:', error);
          $q.notify({
            type: 'negative',
            message: 'Error al eliminar landmarks.',
            icon: 'error'
          });
        } finally {
          loading.value = false;
        }
      });
    };

    const centerMap = () => {
      if (landmarkMapRef.value && typeof landmarkMapRef.value.centerMap === 'function') {
        landmarkMapRef.value.centerMap();
      }
    };

    return {
      fileInput,
      triggerFileInput,
      handleFileUpload,
      drawerOpen,
      toggleDrawer,
      addLandmark,
      deleteAll,
      landmarkMapRef,
      loading,
      totalLandmarks,
      centerMap
    };
  },
};
</script>

<style scoped>
/* Header enhancements */
.bg-gradient-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.toolbar-enhanced {
  padding: 0 24px;
  min-height: 64px;
}

.title-enhanced {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.title-main {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.title-subtitle {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.8);
  font-weight: 300;
  margin-top: -2px;
}

/* Action buttons */
.action-buttons {
  display: flex;
  align-items: center;
}

.action-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: rgba(255,255,255,0.9);
  border-radius: 50%;
  position: relative;
  overflow: hidden;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.2);
}

.action-btn:before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  transition: all 0.3s ease;
  transform: translate(-50%, -50%);
}

.action-btn:hover:before {
  width: 100%;
  height: 100%;
}

.add-btn:hover {
  background: rgba(76, 175, 80, 0.2);
}

.delete-btn:hover {
  background: rgba(244, 67, 54, 0.2);
}

.upload-btn:hover {
  background: rgba(63, 81, 181, 0.2);
}

.menu-btn:hover {
  background: rgba(255, 193, 7, 0.2);
}

/* Drawer enhancements */
.drawer-enhanced {
  background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
  box-shadow: 4px 0 20px rgba(0,0,0,0.1);
}

.drawer-header {
  padding: 24px 20px 16px;
  background: white;
}

.drawer-title-main {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
}

.drawer-title-sub {
  font-size: 0.85rem;
  color: #7f8c8d;
  margin-top: 2px;
}

.separator-gradient {
  height: 3px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border: none;
}

.drawer-content {
  padding: 16px 0;
  height: calc(100% - 120px);
  overflow-y: auto;
}

/* Page container */
.page-container-enhanced {
  background: linear-gradient(45deg, #f0f2f5 0%, #e8ecf0 100%);
}

.page-enhanced {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

/* Floating stats */
.floating-stats {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.stats-card {
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  min-width: 120px;
}

.stats-number {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  line-height: 1;
}

.stats-label {
  font-size: 0.8rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
}

/* Map container */
.map-container-enhanced {
  position: relative;
  height: 100%;
  overflow: hidden;
}

.map-overlay-top {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1000;
}

.map-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.map-control-btn {
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  transition: all 0.3s ease;
}

.map-control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
}

.map-component {
  height: 100%;
  width: 100%;
  border-radius: 24px 24px 0 0;
}

/* Loading overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(5px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.loading-text {
  margin-top: 16px;
  font-size: 1.1rem;
  color: #667eea;
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .toolbar-enhanced {
    padding: 0 16px;
    min-height: 56px;
  }
  
  .title-main {
    font-size: 1.3rem;
  }
  
  .action-buttons .action-btn {
    margin: 0 2px;
  }
  
  .map-container-enhanced {
    margin: 8px;
    border-radius: 16px 16px 0 0;
  }
  
  .floating-stats {
    top: 12px;
    right: 12px;
  }
  
  .stats-card {
    min-width: 100px;
  }
  
  .stats-number {
    font-size: 1.5rem;
  }
}

/* Smooth transitions */
* {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Custom scrollbar */
.drawer-content::-webkit-scrollbar {
  width: 6px;
}

.drawer-content::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.05);
  border-radius: 3px;
}

.drawer-content::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 3px;
}

.drawer-content::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.5);
}
</style>