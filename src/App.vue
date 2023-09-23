<script lang="ts">
import Papa, { type ParseResult } from 'papaparse'
import axios from 'axios'
type Response = {
  count: number,
  items: Contact[]
}
type Contact = {
  name: string
  email: string
  phone: string
}

export default {
  data() {
    return {
      file: null as File | null,
      content: [] as Contact[],
      parsed: false,
      loading: false,
      downloadedData: [] as Contact[]
    }
  },

  methods: {
    parseFile() {
      if (this.file) {
        Papa.parse(this.file, {
          complete: (results: ParseResult<any>) => {
            this.content = results.data

            this.parsed = true
          },
          error: (error) => {
            console.error('Error al analizar el archivo CSV:', error)
          }
        })
      }
    },

    handleFileUpload(event: Event) {
      const input = event.target as HTMLInputElement
      if (input.files && input.files.length > 0) {
        this.file = input.files[0]
      }
      this.parseFile()
      this.loading = true
    },
    async downloadData() {
      const localCsvData = localStorage.getItem('latestCsvData');
      if (localCsvData) {
        this.downloadedData = JSON.parse(localCsvData);
      } else {
        try {
          const response = await axios.get(
            'https://8j5baasof2.execute-api.us-west-2.amazonaws.com/production/tests/trucode/items'
          );
          const responseData: Response = response.data;

          this.downloadedData = responseData.items as Contact[]

        } catch (error) {
          console.error('Error al descargar los datos:', error)
        }
      }

    },
    async cleanData(){
      try {
        const parsedContent = await Promise.all(
          this.content.map(async (element: any) => {
            if (element[0] && element[1] && element[2]) {
              let phone = element[1]
              const cleanedPhone = phone.replace(/\D/g, '')
              const first10Digits = cleanedPhone.slice(0, 10)
              const normalizedPhone = first10Digits.padStart(10, '0')
              const formattedPhone = normalizedPhone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')

              return { name: element[0], email: element[2], phone: formattedPhone }
            }

            return {
              name: 'empty',
              email: 'empty@tillman.com',
              phone: '123-456-7890'
            }
          })
        )

        this.parsed = true
        this.content = parsedContent

      } catch (error) {
        console.error('Error al analizar el archivo CSV:', error)
      }
    },
    async submitFile() {
      this.loading = false;
      try {
        const parsedContent = await Promise.all(
          this.content.map(async (element: any) => {
            if (element[0] && element[1] && element[2]) {
              let phone = element[1]
              const cleanedPhone = phone.replace(/\D/g, '')
              const first10Digits = cleanedPhone.slice(0, 10)
              const normalizedPhone = first10Digits.padStart(10, '0')
              const formattedPhone = normalizedPhone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')

              return { name: element[0], email: element[2], phone: formattedPhone }
            }

            return {
              name: 'empty',
              email: 'empty@tillman.com',
              phone: '123-456-7890'
            }
          })
        )

        this.parsed = true
        this.content = parsedContent

      } catch (error) {
        console.error('Error al analizar el archivo CSV:', error)
      }
      console.log(this.content);
      try {
       
        let csvData: Contact[] = [];
        await Promise.all(
          this.content.map(async (e) => {
            let variable = Object.assign({}, e);
            if (e.name !== 'empty')
              csvData.push(variable);
            let success = false; // Variable para controlar la condición del bucle

            while (!success && e.name !== 'empty') {
              try {
                console.log(variable);
                const response = await axios.post(
                  'https://8j5baasof2.execute-api.us-west-2.amazonaws.com/production/tests/trucode/items',
                  variable
                );
                if (response.data.message === "item stored") {

                  console.log('SUCCESS!!');
                  break; 
                } else {
                  console.log('Retrying...');
                  await new Promise(resolve => setTimeout(resolve, 1000));
                }
              } catch (error) {
                console.error('FAILURE!!');
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
          })
        );

        localStorage.setItem('latestCsvData', JSON.stringify(csvData)); 

        console.log('All requests completed successfully.');
        this.loading = true;
      } catch (error) {
        console.error('An error occurred:', error);
      }
    }
  }
}
</script>

<template>
  <div class="relative isolate overflow-hidden bg-white lg:overflow-visible lg:px-0">
    <div class="absolute inset-0 -z-10 overflow-hidden">
      <svg
        class="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-gray-200 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="e813992c-7d03-4cc4-a2bd-151760b470a0"
            width="200"
            height="200"
            x="50%"
            y="-1"
            patternUnits="userSpaceOnUse"
          >
            <path d="M100 200V.5M.5 .5H200" fill="none" />
          </pattern>
        </defs>
        <svg x="50%" y="-1" class="overflow-visible fill-gray-50">
          <path
            d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z"
            stroke-width="0"
          />
        </svg>
        <rect
          width="100%"
          height="100%"
          stroke-width="0"
          fill="url(#e813992c-7d03-4cc4-a2bd-151760b470a0)"
        />
      </svg>
    </div>
    <div
      class="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 px-4 py-24 sm:px-6 sm:py-12 lg:max-w-7xl lg:grid-cols-2 lg:px-8"
    >
      <div>
        <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Lista de contactos
        </h2>
        <p class="mt-4 py-6 text-gray-500">
          Presione el siguiente boton para obtener los datos del archivo que acaba de cargar: 
        </p>
        <button @click="downloadData" class="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ">Descargar Datos</button>
        <dl class="mt-16 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-y-16 lg:gap-x-8">
          <div
            v-for="feature in downloadedData"
            :key="feature.name"
            class="border-t border-gray-200 pt-4"
          >
            <dt class="font-medium text-gray-900">{{ feature.name }}</dt>
            <dd class="mt-2 text-sm text-gray-500">{{ feature.email }}</dd>
            <dd class="mt-2 text-sm text-gray-500">{{ feature.phone }}</dd>
          </div>
        </dl>
      </div>
      <div
        class="-ml-12 p-12  lg:top-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:overflow-hidden"
      >

  <label class="block">
    <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <img class="mx-auto h-10 w-auto" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" alt="Your Company" />
      <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Cargue su archivo CSV</h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <div class="space-y-6" action="#" method="POST">

<div>
  <span class="sr-only">Elige un archivo csv</span>
    <input type="file" class="block w-full text-sm text-slate-500
      file:mr-4 file:py-2 file:px-4
      file:rounded-full file:border-0
      file:text-sm file:font-semibold
      file:bg-violet-50 file:text-violet-700
      hover:file:bg-violet-100
    "  @change="handleFileUpload($event)"/>
</div>
        <div>
          <button @click="submitFile" v-bind:disabled="!loading" 
          :class="{ 'flex w-full justify-center rounded-md px-8 py-3 text-white bg-gray-300 rounded focus:outline-none':!loading, 'flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600':loading}">Guardar</button>
        
          <span>*Cuando el boton este desabilitado, indica dos cosas: usted debe subir un archivo o esperar a que se termine de cargar el archivo que subio</span>
        
        </div>
      </div>

  
    </div>
  </div>

  </label>
  <br />

      </div>
    </div>
  </div>
</template>
