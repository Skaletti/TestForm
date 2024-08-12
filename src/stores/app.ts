import { defineStore } from 'pinia'

//Хранилище всех аккаунтов.


//Интерфейс аккаунта
interface Account {
  labels: { text: string }[]
  type: 'LDAP' | 'Local'
  login: string
  password: string | null
}

export const useAppStore = defineStore('app', {
  state: () => ({
    //изъятие данных из хранилища ls
    accounts: JSON.parse(localStorage.getItem('accounts') || '[]') as Account[]
  }),
  actions: {

    //Добавление нового аккаунта
    addAccount() {
      this.accounts.push({
        labels: [],
        type: 'LDAP',
        login: '',
        password: null
      })
      this.saveAccounts()
    },
    removeAccount(index: number) {
      //удаление аккаунта
      this.accounts.splice(index, 1)
      this.saveAccounts()
    },
    updateAccount(index: number, account: Account) {
      //Обновление аккаунта при изменении
      this.accounts[index] = account
      this.saveAccounts()
    },
    saveAccounts() {
      //Сохраниение аккаунта в ls
      localStorage.setItem('accounts', JSON.stringify(this.accounts))
    }
  }
})
