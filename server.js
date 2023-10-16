// подключение всех библиотек
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const PORT = process.env.PORT || 3000 //назначение порта
server.listen(PORT, () => {
  console.log(`Server ready. Port: ${PORT}`)
})

app.set('view engine', 'html') // сама html страница 

app.use(express.static(__dirname))
app.use(express.static("pages"));


let users = 0

io.on('connection', (S) => { //
  let user = false

  S.on('new message', (message) => {
    S.broadcast.emit('new message', { //broadcast это обмен данными 
      username: S.username,
      message
    })
  })

  S.on('add user', (username) => { // если юзер есть, то функция ниже с добавлением пользователя не будет добавлять нового пользователя( если нет то наоборот)
    if (user) return

    S.username = username
    ++users
    user = true
    S.emit('login', {
      users
    })
   // функция подключения какого либо пользователя
    S.broadcast.emit('user joined', {
      username: S.username,
      users
    })
  })
  // печатает 
  S.on('typing', () => {
    S.broadcast.emit('typing', {
      username: S.username
    })
  })
  //конкретно этот пользователь перестал печатать 
  S.on('stop typing', () => {
    S.broadcast.emit('stop typing', {
      username: S.username
    })
  })
 // передать что пользователь ушел и какой именно ушел
  S.on('disconnect', () => {
    if (user) {
      --users

      S.broadcast.emit('user left', {
        username: S.username,
        users
      })
    }
  })
})