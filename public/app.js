new Vue({
  el: '#app',
  vuetify: new Vuetify(),
  data() {
    return {
      isDark: true,
      show: true,
      todoTitle: '',
      todos: [] //весь массив задачек
    }
  },
  created() {
    const query = `
    query{
      getTodos {
        id title done createdAt updatedAt
      }
    }
    `

    fetch('/graphql', {
      method: 'post', // всегда post запрос для graphql
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ query: query })
    })
      .then(res => res.json())
      .then(response => {
        this.todos = response.data.getTodos
      })
  },
  methods: {
    addTodo() {
      const title = this.todoTitle.trim()
      if (!title) {
        return
      }
      const query = `
        mutation {
          createTodo(todo: {title: "${title}"}) {
            id title done createdAt updatedAt
          }
        }
      `
      fetch('/graphql', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ query })
      })
        .then(res => res.json())
        .then(response => { //параметр response содержит объект, который является ответом от сервера
          const todo = response.data.createTodo //здесь содержится созданная задача в виде объекта
          this.todos.push(todo) // добавляем эту задачу в список
          this.todoTitle = '' // очищаем поле ввода
        })
        .catch(e => console.log(e))
    },
    removeTodo(id) { // в прошлый раз там была прям прогрузка всей страницы, здесь за счет Vue динамическое изменение страницы?
      fetch('/api/todo/' + id, {
        method: 'delete'
      })
        .then(() => {
          this.todos = this.todos.filter(t => t.id !== id) // отфильтруем массив todos, где не будет того элемента
        })
        .catch(e => console.log(e))
    },
    completeTodo(id) {
      const query = `
        mutation {
          completeTodo(id: "${id}") {
            updatedAt
          }
        }
      `

      fetch('/graphql', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }, //хэдеры мы описываем в том случае, когда передаем что-то на сервер
        body: JSON.stringify({ query })
      })
        .then(res => res.json())
        .then(response => { //получаем объект todo из ответа в формате json 
          const idx = this.todos.findIndex(t => t.id === id) //находим индекс элемента в массиве todos 
          this.todos[idx].updatedAt = response.data.completeTodo.updatedAt //обновляем св-во этого элемента
        })
        .catch(e => console.log(e))
    }
  },
  filters: {
    capitalize(value) {
      return value.toString().charAt(0).toUpperCase() + value.slice(1)
    },
    date(value, withTime) {
      const options = {
        year: 'numeric',
        month: 'long',
        day: '2-digit'
      }

      if (withTime) {
        options.hour = '2-digit'
        options.minute = '2-digit'
        options.second = '2-digit'
      }
      return new Intl.DateTimeFormat('ru-RU', options).format(new Date(+value))
    }
  }
})