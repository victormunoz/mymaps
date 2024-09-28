<!-- src/components/LandmarkTable.vue -->
<template>
  <q-table
    :columns="columns"
    :rows="landmarks"
    row-key="_id"
  >
    <template #body-cell-actions="props">
      <q-btn flat icon="edit" @click="editLandmark(props.row)"></q-btn>
      <q-btn flat icon="delete" @click="deleteLandmark(props.row._id)"></q-btn>
    </template>
  </q-table>
</template>

<script>
import { ref, onMounted } from 'vue';
import ApiRepository from '../repositories/ApiRepository';

export default {
  setup() {
    const landmarks = ref([]);
    const columns = [
      { name: 'place', label: 'Place', field: 'place' },
      { name: 'country', label: 'Country', field: 'country' },
      { name: 'date', label: 'Date', field: 'date', format: (val) => new Date(val).toLocaleDateString() },
      { name: 'year', label: 'Year', field: 'year' },
      { name: 'tags', label: 'Tags', field: 'tags', format: (val) => val.join(', ') },
      { name: 'actions', label: 'Actions', field: 'actions' },
    ];
    const pagination = ref({ sortBy: 'date', descending: true, page: 1, rowsPerPage: 10 });

    onMounted(async () => {
      const response = await ApiRepository.getLandmarks();
      landmarks.value = response.data;
    });

    const editLandmark = (landmark) => {
      // Implement edit functionality
    };

    const deleteLandmarkById = async (id) => {
      await ApiRepository.deleteLandmark(id);
      const response = await ApiRepository.getLandmarks();
      landmarks.value = response.data;
    };

    return {
      landmarks,
      columns,
      pagination,
      editLandmark,
      deleteLandmark: deleteLandmarkById,
    };
  },
};
</script>
