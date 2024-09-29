<!-- src/components/LandmarkDialog.vue -->
<!-- src/components/LandmarkDialog.vue -->
<template>
  <q-dialog v-model="isOpen">
    <q-card style="width: 500px; max-width: 100%">
      <q-card-section>
        <div class="text-h6">{{ landmark ? 'Edit' : 'Add' }} Landmark</div>
      </q-card-section>

      <q-card-section>
        <!-- Autocomplete Input for Place Search -->
        <div style="position: relative;">
          <q-input
            ref="searchInput"
            v-model="searchQuery"
            label="Search for a location"
            @update:model-value="onSearchInput"
          ></q-input>

          <q-menu
            v-model="showSuggestions"
            anchor-origin="bottom left"
            self-origin="top left"
            fit
            :no-parent-event="true"
            max-height="200px"
            style="min-width: 100%;"
          >
            <q-list>
              <q-item
                v-for="(result, index) in searchResults"
                :key="index"
                clickable
                @click="selectResult(result)"
              >
                <q-item-section>
                  {{ result.display_name }}
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </div>

        <!-- Other Inputs -->
        <q-input v-model="form.place" label="Place"></q-input>
        <q-input v-model="form.country" label="Country"></q-input>
        <q-input v-model="form.date" label="Date" type="date"></q-input>
        <q-input v-model="form.year" label="Year" type="number"></q-input>
        <q-input v-model="form.tags" label="Tags (comma-separated)"></q-input>
        <q-input v-model="form.coordinates.lat" label="Latitude" type="number"></q-input>
        <q-input v-model="form.coordinates.lng" label="Longitude" type="number"></q-input>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" @click="close"></q-btn>
        <q-btn flat label="Save" color="primary" @click="save"></q-btn>
        <q-btn
          v-if="landmark"
          flat
          label="Delete"
          color="negative"
          @click="confirmDelete"
        ></q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, watch } from 'vue';
import ApiRepository from '../repositories/ApiRepository';
import axios from 'axios';

export default {
  props: {
    landmark: {
      type: Object,
      default: null,
    },
  },
  emits: ['close', 'save', 'delete'],
  setup(props, { emit }) {
    const isOpen = ref(true);
    const searchQuery = ref('');
    const searchResults = ref([]);
    const showSuggestions = ref(false);
    const searchInput = ref(null);
    const searchTimeout = ref(null);

    const form = ref({
      place: '',
      country: '',
      date: '',
      year: null,
      tags: '',
      coordinates: {
        lat: null,
        lng: null,
      },
    });

    watch(
      () => props.landmark,
      (newVal) => {
        if (newVal) {
          form.value = { ...newVal, tags: newVal.tags.join(', ') };
          searchQuery.value = newVal.place;
        } else {
          form.value = {
            place: '',
            country: '',
            date: '',
            year: null,
            tags: '',
            coordinates: {
              lat: null,
              lng: null,
            },
          };
          searchQuery.value = '';
        }
      },
      { immediate: true }
    );

    const close = () => {
      isOpen.value = false;
      emit('close');
    };

    const save = async () => {
      const data = {
        ...form.value,
        tags: form.value.tags.split(',').map((tag) => tag.trim()),
      };

      if (props.landmark) {
        await ApiRepository.updateLandmark(props.landmark._id, data);
      } else {
        await ApiRepository.createLandmark(data);
      }
      emit('save', data);
    };

    const confirmDelete = async () => {
      await ApiRepository.deleteLandmark(props.landmark._id);
      emit('delete', props.landmark._id);
    };

    const onSearchInput = () => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value);
      }
      searchTimeout.value = setTimeout(() => {
        fetchSearchResults();
      }, 300); // Debounce time
    };

    const fetchSearchResults = async () => {
      console.log("fetching")
      if (!searchQuery.value) {
        searchResults.value = [];
        return;
      }
      try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: {
            q: searchQuery.value,
            format: 'json',
            addressdetails: 1,
            limit: 5,
          },
        });
        searchResults.value = response.data;
        showSuggestions.value = true;
      } catch (error) {
        console.error('Error fetching search results:', error);
        searchResults.value = [];
        showSuggestions.value = false;
      }
    };

    const selectResult = (result) => {
      form.value.place = result.display_name;
      form.value.coordinates.lat = parseFloat(result.lat);
      form.value.coordinates.lng = parseFloat(result.lon);
      form.value.country = extractCountry(result.address);
      searchQuery.value = result.display_name;
      showSuggestions.value = false;
    };

    const extractCountry = (address) => {
      return address.country || '';
    };

    const onFocus = () => {
      if (searchResults.value.length > 0) {
        showSuggestions.value = true;
      }
    };

    const onBlur = () => {
      // Delay hiding suggestions to allow click event to register
      setTimeout(() => {
        showSuggestions.value = false;
      }, 200);
    };

    return {
      isOpen,
      form,
      close,
      save,
      confirmDelete,
      searchQuery,
      searchResults,
      showSuggestions,
      searchInput,
      onSearchInput,
      selectResult,
      onBlur,
      onFocus,
    };
  },
};
</script>

<style scoped>
/* Adjust the position and width of the suggestions menu */
.q-menu {
  min-width: 100%;
}
</style>
