<template>
  <q-dialog v-model="isOpen">
    <q-card style="width: 500px; max-width: 100%">
      <q-card-section class="bg-gradient text-white q-pb-none">
        <div class="text-h6">{{ landmark ? 'Editar' : 'Afegir' }} Landmark</div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <!-- Autocomplete Input for Place Search -->
        <div style="position: relative;">
          <q-input
            ref="searchInput"
            v-model="searchQuery"
            label="Cerca ubicació"
            filled
            dense
            @update:model-value="onSearchInput"
          />

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
                <q-item-section>{{ result.display_name }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </div>

        <!-- Other Inputs -->
        <q-input v-model="form.place" label="Lloc" filled dense />
        <q-input v-model="form.country" label="País" filled dense />
        <q-input v-model="form.date" label="Data" type="date" filled dense />
        <q-input v-model="form.year" label="Any" type="number" filled dense />
        <q-input v-model="form.tags" label="Tags (separats per comes)" filled dense />

        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-input v-model="form.coordinates.lat" label="Latitud" type="number" filled dense />
          </div>
          <div class="col-6">
            <q-input v-model="form.coordinates.lng" label="Longitud" type="number" filled dense />
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancel·lar" @click="close" />
        <q-btn flat label="Desar" color="primary" @click="save" />
        <q-btn v-if="landmark" flat label="Eliminar" color="negative" @click="confirmDelete" />
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
      }, 300);
    };

    const fetchSearchResults = async () => {
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
.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px 24px;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}
</style>