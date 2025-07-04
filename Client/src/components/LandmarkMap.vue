<template>
  <div>
    <l-map
      ref="mapRef"
      :zoom="zoom"
      :center="center"
      style="height: 800px"
    >
      <l-tile-layer :url="tileLayerUrl" />

      <l-marker
        v-for="landmark in landmarks"
        :key="landmark._id"
        :lat-lng="[landmark.coordinates.lat, landmark.coordinates.lng]"
        :icon="getIconForTag(landmark.tags?.[0])"
        @click="selectLandmark(landmark)"
      >
        <l-popup>{{ landmark.place }}</l-popup>
      </l-marker>
    </l-map>

    <!-- Diàleg -->
    <landmark-dialog
      v-if="showDialog"
      :landmark="selectedLandmark"
      @close="closeDialog"
      @save="saveLandmark"
      @delete="deleteLandmark"
    />
  </div>
</template>

<script>
import { ref, onMounted, watch, nextTick } from 'vue';
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ApiRepository from '../repositories/ApiRepository';
import LandmarkDialog from './LandmarkDialog.vue';

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LandmarkDialog,
  },
  setup() {
    const landmarks = ref([]);
    const selectedLandmark = ref(null);
    const showDialog = ref(false);
    const mapRef = ref(null);
    const tileLayerUrl = ref('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    const center = ref([35, -41]);
    const zoom = ref(3);

    const tagColors = {
      Nenes: '#e91e63',
      Jo: '#03a9f4',
      Tania: '#9c27b0',
    };

    const getIconForTag = (tag) => {
      const color = tagColors[tag] || '#e91e63';
      return L.divIcon({
        html: `
          <div style="
            width: 18px;
            height: 18px;
            background-color: ${color};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 0 4px rgba(0,0,0,0.3);
          "></div>
        `,
        className: '',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        popupAnchor: [0, -9]
      });
    };

    const updateMapView = () => {
      nextTick(() => {
        if (mapRef.value && mapRef.value.mapObject && landmarks.value.length) {
          const latLngs = landmarks.value.map(l => [l.coordinates.lat, l.coordinates.lng]);
          const bounds = L.latLngBounds(latLngs);
          mapRef.value.mapObject.fitBounds(bounds, { padding: [50, 50] });
        }
      });
    };

    onMounted(async () => {
      const response = await ApiRepository.getLandmarks();
      landmarks.value = response.data;
      updateMapView();
    });

    watch(landmarks, () => updateMapView());

    const selectLandmark = (landmark) => {
      selectedLandmark.value = landmark;
      showDialog.value = true;
    };

    const closeDialog = () => showDialog.value = false;

    const saveLandmark = async () => {
      const response = await ApiRepository.getLandmarks();
      landmarks.value = response.data;
      closeDialog();
    };

    const deleteLandmark = async () => {
      const response = await ApiRepository.getLandmarks();
      landmarks.value = response.data;
      closeDialog();
    };

    return {
      landmarks,
      selectedLandmark,
      showDialog,
      tileLayerUrl,
      center,
      zoom,
      mapRef,
      getIconForTag,
      selectLandmark,
      closeDialog,
      saveLandmark,
      deleteLandmark,
    };
  },
};
</script>

<style scoped>
/* No cal res extra per ara */
</style>
