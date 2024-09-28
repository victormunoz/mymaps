<template>
  <q-card flat bordered class="my-card" :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2'">
    <q-card-section>
      <div class="row items-center no-wrap">
        <div class="col">
          <div class="text-h6">Our Planet</div>
          <div class="text-subtitle2">by John Doe</div>
        </div>
        <div class="row">
          <q-select v-model="model1" :options="options1" label="auditor" style="margin-right: 15px" />
          <q-select v-model="model2" :options="options2" label="auditor-react" />
        </div>
      </div>
    </q-card-section>

    <q-card-section>
      <q-table
        title="Treats"
        :rows="rows"
        :columns="columns"
        row-key="name">
        <template #top-right>
          <q-input v-model="filter" borderless dense debounce="300" placeholder="Search">
            <template #append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
      </q-table>
    </q-card-section>
    <q-separator />
  </q-card>
</template>

<script>
import { useQuasar } from 'quasar'
import { ref } from 'vue'
import ApiRepository from "src/repositories/ApiRepository";



export default {
  setup () {
    const columns = [
      { name: 'identity', align: 'center', label: 'identity', field: 'identity', sortable: true },
      { name: 'address', label: 'Address', field: 'address', sortable: true },
      { name: 'adminMail', label: 'Admin Mail', field: 'adminMail' },
      { name: 'backendVersion', label: 'Backend Version', field: 'backendVersion' },
      { name: 'frontendVersion', label: 'Frontend Version', field: 'frontendVersion' },
      { name: 'organizerVersion', label: 'Organizer Version', field: 'organizerVersion', sortable: true, sort: (a, b) => parseInt(a, 10) - parseInt(b, 10) },
      { name: 'status', label: 'Status', field: 'status', sortable: true},
      { name: 'actions', label: 'Actions', field: 'actions', sortable: true}
    ]
    const rows = [
      {
        identity: 'Frozen Yogurt',
        address: 159,
        adminMail: 6.0,
        backendVersion	: 24,
        frontendVersion	: 4.0,
        organizerVersion	: 87,
        status: '14%',
        actions: '1%'
      },
      {
        identity: 'Frozen Yogurt',
        address: 159,
        adminMail: 6.0,
        backendVersion	: 24,
        frontendVersion	: 4.0,
        organizerVersion	: 87,
        status: '14%',
        actions: '1%'
      },
      {
        identity: 'Frozen Yogurt',
        address: 159,
        adminMail: 6.0,
        backendVersion	: 24,
        frontendVersion	: 4.0,
        organizerVersion	: 87,
        status: '14%',
        actions: '1%'
      },
      {
        identity: 'Frozen Yogurt',
        address: 159,
        adminMail: 6.0,
        backendVersion	: 24,
        frontendVersion	: 4.0,
        organizerVersion	: 87,
        status: '14%',
        actions: '1%'
      },
      {
        identity: 'Frozen Yogurt',
        address: 159,
        adminMail: 6.0,
        backendVersion	: 24,
        frontendVersion	: 4.0,
        organizerVersion	: 87,
        status: '14%',
        actions: '1%'
      },
      {
        identity: 'Frozen Yogurt',
        address: 159,
        adminMail: 6.0,
        backendVersion	: 24,
        frontendVersion	: 4.0,
        organizerVersion	: 87,
        status: '14%',
        actions: '1%'
      },
      {
        identity: 'Frozen Yogurt',
        address: 159,
        adminMail: 6.0,
        backendVersion	: 24,
        frontendVersion	: 4.0,
        organizerVersion	: 87,
        status: '14%',
        actions: '1%'
      },
      {
        identity: 'Frozen Yogurt',
        address: 159,
        adminMail: 6.0,
        backendVersion	: 24,
        frontendVersion	: 4.0,
        organizerVersion	: 87,
        status: '14%',
        actions: '1%'
      }
    ]
    const lorem = ref("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.")
    const $q = useQuasar()
    const entities= ref(null)
    const model1= ref(null)
    const model2= ref(null)
    const options1= ['a','b','c']
    const options2= ['D','E','F']

    function fetch () {

    }

    return {
      lorem,
      entities,
      model1,
      model2,
      options1,
      options2,
      columns,
      rows,
      filter: ref(''),
    }
  }
}
</script>
