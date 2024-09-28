<!-- src/pages/LandmarksPage.vue -->
<template>
  <div>
    <landmark-map></landmark-map>
    <landmark-table></landmark-table>

    <!-- Import CSV Button -->
    <q-btn label="Import CSV" @click="triggerFileInput"></q-btn>
    <input
      ref="fileInput"
      type="file"
      accept=".csv"
      style="display: none"
      @change="handleFileUpload"
    />
  </div>
</template>

<script>
import { ref } from 'vue';
import LandmarkMap from '../components/LandmarkMap.vue';
import LandmarkTable from '../components/LandmarkTable.vue';
import Papa from 'papaparse';
import ApiRepository from '../repositories/ApiRepository';

export default {
  components: {
    LandmarkMap,
    LandmarkTable,
  },
  setup() {
    const fileInput = ref(null);

    const triggerFileInput = () => {
      fileInput.value.click();
    };

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        // Process the file
        processCSVFile(file);
      }
    };

    const processCSVFile = (file) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const landmarksData = results.data.map((row) => ({
            // Map CSV columns to landmark fields
            place: row.Name ? row.Name : row.Address,
            country: extractCountryFromAddress(row.Address),
            date: row.Created ? new Date(row.Created) : null,
            year: row.Start ? parseInt(row.Start) : null,
            tags: [row['Category Name']].filter(Boolean),
            coordinates: {
              lat: parseFloat(row.Latitude),
              lng: parseFloat(row.Longitude),
            },
            description: row.Description || '',
          }));

          // Send data to the server
          try {
            await ApiRepository.importLandmarks(landmarksData);
            // Optionally refresh the landmarks displayed
          } catch (error) {
            console.error('Error importing landmarks:', error);
          }
        },
        error: (error) => {
          console.error('Error parsing CSV file:', error);
        },
      });
    };

    const extractCountryFromAddress = (address) => {
      // Simple example to extract the country from the address string
      if (!address) return '';
      const parts = address.split(',');
      return parts[parts.length - 1].trim();
    };

    return {
      fileInput,
      triggerFileInput,
      handleFileUpload,
    };
  },
};
</script>
