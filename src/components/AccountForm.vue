<template>
  <v-container>
    <v-row class="mb-2">
      <v-col>
        <v-toolbar>
          <v-toolbar-title>Account Management</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn @click="addAccount" color="primary">+</v-btn>
          <v-btn @click="logAccounts" color="secondary">Log Accounts</v-btn> <!-- Кнопка логирования всех пользователей, для просмотра данных -->
        </v-toolbar>
      </v-col>
    </v-row>

    <v-alert type="info" border="left" prominent class="mb-4">
      Для указания нескольких меток, необходимо писать их через ";". К примеру: "XXX;YYYY;ZZZZZ"
    </v-alert>

    <v-form ref="form">
      <v-row v-for="(account, index) in accounts" :key="index">
        <v-col>
          <v-text-field
            v-model="account.labels"
            label="Метки"
            persistent-hint
            @blur="updateLabel(index)"
            :rules="labelsRules"
            :error-messages="accountErrors[index]?.labels"
          />
          <v-select
            v-model="account.type"
            :items="['LDAP', 'Local']"
            label="Тип аккаунта"
            @change="handleTypeChange(index)"
            required
          />
          <v-text-field
            v-model="account.login"
            label="Логин"
            :rules="loginRules"
            required
            maxlength="100"
            @blur="validateLogin(index)"
            :error-messages="accountErrors[index]?.login"
          />
          <v-text-field
            v-if="account.type === 'Local'"
            v-model="account.password"
            label="Пароль"
            type="password"
            :rules="passwordRules"
            required
            maxlength="100"
            @blur="validatePassword(index)"
            :error-messages="accountErrors[index]?.password"
          />
          <v-btn @click="removeAccount(index)" color="red">Delete</v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from 'vue'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
const accounts = reactive(store.accounts)
const accountErrors = reactive<Record<number, { labels?: string[], login?: string[], password?: string[] }>>({})

//Добавление и удаление новых аккаунтов
const addAccount = () => {
  store.addAccount()
}

const removeAccount = (index: number) => {
  store.removeAccount(index)
}

//Смена типа аккаунта. Если тип LDAP, то пароль становится null
const handleTypeChange = (index: number) => {
  if (accounts[index].type === 'LDAP') {
    accounts[index].password = null
  }
}

//Обновление метки. Разбиение на массив через ;. Удаление всех отступов. Добавление в store.
const updateLabel = (index: number) => {
  const labelString = accounts[index].labels
    .split(';')
    .map(label => label.trim())
    .filter(label => label !== '')
  accounts[index].labels = labelString;
  store.updateAccount(index, { ...accounts[index], labels: labelString });
}

//Валидация формы
const validateLogin = (index: number) => {
  if (!accounts[index].login.trim()) {
    accountErrors[index] = { ...accountErrors[index], login: ['Login is required'] }
  } else {
    accountErrors[index] = { ...accountErrors[index], login: [] }
  }
  store.updateAccount(index, accounts[index])
}

const validatePassword = (index: number) => {
  if (accounts[index].type === 'Local' && !accounts[index].password?.trim()) {
    accountErrors[index] = { ...accountErrors[index], password: ['Password is required'] }
  } else {
    accountErrors[index] = { ...accountErrors[index], password: [] }
  }
  store.updateAccount(index, accounts[index])
}

const labelsRules = [(v: string) => v.length <= 50 || 'Label should be less than 50 characters']
const loginRules = [(v: string) => !!v || 'Login is required']
const passwordRules = [(v: string) => !!v || 'Password is required']

//Функция логирования всего store. Для дополнительной проверки данных.
const logAccounts = () => {
  console.log('All saved accounts:', store.accounts)
}

// доавбление данных в ls, для сохранения.
watch(() => store.accounts, (newAccounts) => {
  localStorage.setItem('accounts', JSON.stringify(newAccounts))
}, { deep: true })
</script>

<style scoped></style>
