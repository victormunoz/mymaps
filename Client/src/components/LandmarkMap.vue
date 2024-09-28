<!-- src/components/LandmarkMap.vue -->
<template>
  <div>
    <l-map
      ref="mapRef"
      :zoom="zoom"
      :center="center"
      style="height: 500px;"
    >
      <l-tile-layer :url="tileLayerUrl"></l-tile-layer>
      <l-marker
        v-for="landmark in landmarks"
        :key="landmark._id"
        :lat-lng="[landmark.coordinates.lat, landmark.coordinates.lng]"
        @click="selectLandmark(landmark)"
      ></l-marker>
    </l-map>

    <q-btn label="Add Landmark" @click="openAddDialog"></q-btn>

    <!-- Landmark Dialog -->
    <landmark-dialog
      v-if="showDialog"
      :landmark="selectedLandmark"
      @close="closeDialog"
      @save="saveLandmark"
      @delete="deleteLandmark"
    ></landmark-dialog>
  </div>
</template>

<script>
import { ref, onMounted, watch, nextTick } from 'vue';
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet';
import 'leaflet/dist/leaflet.css';
import ApiRepository from '../repositories/ApiRepository';
import LandmarkDialog from './LandmarkDialog.vue';
import L from 'leaflet';

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LandmarkDialog,
  },
  setup() {
    const landmarks = ref([]);
    const selectedLandmark = ref(null);
    const showDialog = ref(false);
    const tileLayerUrl = ref('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    const center = ref([0, 0]); // Default center
    const zoom = ref(2); // Default zoom to show the full Earth
    const mapRef = ref(null);

    const updateMapView = () => {
      nextTick(() => {
        if (mapRef.value && mapRef.value.mapObject) {
          const map = mapRef.value.mapObject;
          if (landmarks.value.length > 0) {
            const latLngs = landmarks.value.map((lm) => [lm.coordinates.lat, lm.coordinates.lng]);
            const bounds = L.latLngBounds(latLngs);
            map.fitBounds(bounds, { padding: [50, 50] });
          } else {
            // No landmarks, show the full Earth
            map.setView([0, 0], 2);
          }
        }
      });
    };

    onMounted(async () => {
      const response = await ApiRepository.getLandmarks();
      landmarks.value = response.data;
      updateMapView();
    });

    watch(landmarks, () => {
      updateMapView();
    });

    const selectLandmark = (landmark) => {
      selectedLandmark.value = landmark;
      showDialog.value = true;
    };

    const openAddDialog = () => {
      selectedLandmark.value = null;
      showDialog.value = true;
    };

    const closeDialog = () => {
      showDialog.value = false;
    };

    const saveLandmark = async () => {
      // Refresh the landmarks after saving
      const response = await ApiRepository.getLandmarks();
      landmarks.value = response.data;
      closeDialog();
      // No need to call updateMapView() here since the watcher on landmarks will handle it
    };

    const deleteLandmark = async () => {
      // Refresh the landmarks after deletion
      const response = await ApiRepository.getLandmarks();
      landmarks.value = response.data;
      closeDialog();
      // No need to call updateMapView() here since the watcher on landmarks will handle it
    };

    return {
      landmarks,
      selectedLandmark,
      showDialog,
      tileLayerUrl,
      center,
      zoom,
      mapRef,
      selectLandmark,
      openAddDialog,
      closeDialog,
      saveLandmark,
      deleteLandmark,
    };
  },
};
</script>

<style>
/* Add any necessary styles */
</style>
