<!-- src/pages/LandmarksPage.vue -->
<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header -->
    <q-header>
      <q-toolbar>
        <q-toolbar-title>Landmarks</q-toolbar-title>
        <q-space />
        <!-- Add Landmark Button -->
        <q-btn
          flat
          dense
          icon="add"
          aria-label="Add Landmark"
          class="q-mr-sm"
          @click="addLandmark"
        />
        <q-btn
          flat
          dense
          icon="delete"
          class="q-mr-sm"
          aria-label="Delete All"
          @click="deleteAll"
        />
        <!-- Import CSV Button -->
        <q-btn
          flat
          dense
          icon="upload_file"
          aria-label="Import CSV"
          @click="triggerFileInput"
        />
        <!-- Hidden File Input for CSV Import -->
        <input
          ref="fileInput"
          type="file"
          accept=".csv"
          style="display: none"
          @change="handleFileUpload"
        />
      </q-toolbar>
    </q-header>

    <!-- Drawer for Locations List -->
    <q-drawer
      v-model="drawerOpen"
      side="left"
      :width="500"
      bordered
      class="bg-grey-1"
      overlay-if-above
    >
      <q-toolbar>
        <q-toolbar-title>Locations</q-toolbar-title>
        <q-btn
          flat
          dense
          :icon="drawerOpen ? 'chevron_left' : 'chevron_right'"
          aria-label="Toggle Drawer"
          @click="toggleDrawer"
        />
      </q-toolbar>
      <landmark-table />
    </q-drawer>

    <!-- Main Page Container -->
    <q-page-container class="bg-grey-2">
      <q-page class="flex flex-col">
        <div class="map-container">
          <landmark-map ref="landmarkMapRef" />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref } from 'vue';
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
    const $q = useQuasar();
    const landmarkMapRef = ref(null); // Reference to the LandmarkMap component

    // Trigger the hidden file input
    const triggerFileInput = () => {
      fileInput.value.click();
    };

    // Handle CSV file upload
    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        processCSVFile(file);
        // Reset the input value to allow re-uploading the same file if needed
        event.target.value = '';
      }
    };

    // Process the CSV file using PapaParse
    const processCSVFile = (file) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const landmarksData = results.data.map((row) => ({
            // Map CSV columns to landmark fields
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

          try {
            await ApiRepository.importLandmarks(landmarksData);
            // Optionally, refresh the landmarks displayed in the table and map
            $q.notify({
              type: 'positive',
              message: 'Landmarks imported successfully!',
            });
            window.location.reload();
          } catch (error) {
            console.error('Error importing landmarks:', error);
            $q.notify({
              type: 'negative',
              message: 'Failed to import landmarks.',
            });
          }
        },
        error: (error) => {
          console.error('Error parsing CSV file:', error);
          $q.notify({
            type: 'negative',
            message: 'Error parsing CSV file.',
          });
        },
      });
    };

    // Simple function to extract country from the address string
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

    // Toggle the drawer open/closed state
    const toggleDrawer = () => {
      drawerOpen.value = !drawerOpen.value;
    };

    // Function to handle adding a new landmark
    const addLandmark = () => {
      if (landmarkMapRef.value && typeof landmarkMapRef.value.openAddDialog === 'function') {
        landmarkMapRef.value.openAddDialog();
      } else {
        $q.notify({
          type: 'warning',
          message: 'Unable to open Add Landmark dialog.',
        });
      }
    };

    const deleteAll = async () => {
      try {
        await ApiRepository.deleteLandmarks();
        $q.notify({
          type: 'positive',
          message: 'Landmarks deleted successfully!',
        });
        window.location.reload();
      } catch (error) {
        console.error('Error deleting landmarks:', error);
        $q.notify({
          type: 'negative',
          message: 'Failed to delete landmarks.',
        });
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
      landmarkMapRef
    };
  },
};
</script>

<style scoped>
.map-container {
  flex: 1;
  height: 100%;
  width: 100%;
}
.q-page-container,
.q-page {
  height: 100%;
}
</style>
