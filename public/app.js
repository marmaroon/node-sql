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
      body: JSON.stringify({query: query})
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
      fetch('/api/todo', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      })
        .then(res => res.json())
        .then(({ todo }) => {
          this.todos.push(todo)
          this.todoTitle = ''
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
      fetch('/api/todo/' + id, {
        method: 'put',
        headers: { 'Content-Type': 'application/json' }, //хэдеры мы описываем в том случае, когда передаем что-то на сервер
        body: JSON.stringify({ done: true })
      })
        .then(res => res.json())
        .then(({ todo }) => { //получаем объект todo из ответа в формате json 
          const idx = this.todos.findIndex(t => t.id === todo.id) //находим индекс элемента в массиве todos 
          this.todos[idx].updatedAt = todo.updatedAt //обновляем св-во этого элемента
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