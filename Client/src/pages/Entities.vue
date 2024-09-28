<template>
  <q-page style=" display: flex;flex-direction: column;background: #fafafa;padding:20px" >
    <div >
      {{$t('cat')}}
      <h3 style="font-size:1.5rem;font-weight: 400;line-height: 1.334"> Add new Entity</h3>
      <q-form @submit="submitForm">
        <q-input  v-model="name" label="Entity name"  :rules="[validateName]" />
        <q-input  v-model="email" type="email" label="Entity Admin email" :rules="[validateEmail]" />
        <div class="row justify-center q-mt-md">
          <q-btn color="primary" label="ADD ENTITY" type="submit"/>
        </div>
      </q-form>
    </div>
    <div style="background: red">
      bbbbbbb
    </div>
    <DatabaseEntities style="margin-top: 10px;"/>
  </q-page >
</template>

<script>
import { ref } from 'vue'
import ApiRepository from "src/repositories/ApiRepository";
import {useQuasar} from "quasar";
import DatabaseEntities from "components/DatabaseEntities .vue";
export default {
  name: 'UserLogin',
  components:{
    DatabaseEntities
  },
  setup () {
    const $q = useQuasar()
    const name = ref(null)

    const email = ref(null)

    function addEntity(){
      $q.notify({
        color: 'green-4',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Submitted'
      })
    }

    function validateEmail (val) {
      const pattern = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/
      if (pattern.test(val)) {
        return true
      }
      return 'Correo electrónico inválido'
    }

    function validateName (val) {
      if (val.length >= 1) {
        return true
      }
      return 'La contraseña debe tener al menos 8 caracteres'
    }
    function submitForm () {
      console.log('SubmitForm')
      addEntity();
    }

    return {

      name,
      email,
      validateEmail,
      validateName,
      submitForm,
    }
  },
  data(){
    const title =  this.$t('Cat');
    console.log(title)
  }
}

</script>
