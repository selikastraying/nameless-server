const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');

const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const users = require('./modules/users');
const chats = require('./modules/chats');
const tokens = require('./modules/tokens');
const time = require('./modules/time');

const rooms = { 'Hello World': [{ name: 'selika', content: 'Hello World' }], 'Hello World2': [{ name: 'selika', content: 'Hello World2' }] };


io.on('connection', (socket) => {
  socket.on('join', (m) => {
    socket.join(m.room);
    io.to(socket.id).emit('allMessage', rooms[m.room]);
  });
  socket.on('leave', (m) => {
    socket.leave(m.room);
  });
  socket.on('sentMessage', (m) => {
    rooms[m.room].push(m.message);
    io.to(m.room).emit('newMessage', m.message);
  });
  socket.on('AllChatList', () => {
    io.to(socket.id).emit('AllChatList', Object.keys(rooms));
  });
  socket.on('createChat', (m) => {
    if (!Object.keys(rooms).includes(m.chatname)) {
      rooms[m.chatname] = [];
    } else {
      io.to(socket.id).emit('Alert', 'chatname already used');
    }
  });
});

app.use(fileUpload({
  createParentPath: true,
}));

app.use('/img', express.static('uploads'));
app.use(cors());

app.post('/upload', async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: 'No file uploaded',
      });
    } else {
      const { file } = req.files;
      const { id } = tokens.checkToken(req.body.token);
      const filename = `${id}${time.getTime()}.${file.name.split('.')[file.name.split('.').length - 1]}`;
      file.mv(`./uploads/${filename}`);
      res.send(filename);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/getToken', (req, res) => {
  res.end(tokens.getToken(req.query.id));
});

app.get('/getAllChatList', (req, res) => {
  res.end(chats.getChatList('admin'));
});

app.get('/getChatList', (req, res) => {
  res.end(chats.getChatList(tokens.checkToken(req.query.token).id));
});

app.get('/getChatContent', (req, res) => {
  res.end(chats.getChatContent(req.query.chatid));
});

app.get('/sentChat', (req, res) => {
  res.end(chats.sentChat(
    tokens.checkToken(req.query.token).id,
    req.query.chatid,
    req.query.newchat,
    time.getTime(),
  ));
});

app.get('/createChat', (req, res) => {
  const chatid = chats.createChat(tokens.checkToken(req.query.token).id, time.getTime());
  users.addChat(
    'admin',
    chatid,
    req.query.chatname,
  );
  users.addChat(
    tokens.checkToken(req.query.token).id,
    chatid,
    req.query.chatname,
  );
  res.end(chatid);
});

app.get('/joinChat', (req, res) => {
  users.addChat(
    tokens.checkToken(req.query.token).id,
    req.query.chatid,
  );
  res.end('success');
});

app.get('/login', (req, res) => {
  if (users.login(req.query.id, req.query.pass)) {
    res.end(tokens.getToken(req.query.id));
  } else res.status(500).send({ error: 'Something failed!' });
});

app.get('/register', (req, res) => {
  if (users.register(req.query.id, req.query.pass)) res.end(tokens.getToken(req.query.id));
  else res.status(500).send({ error: 'Something failed!' });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
