const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const users = require('./modules/users');
const chats = require('./modules/chats');
const tokens = require('./modules/tokens');
const time = require('./modules/time');

const app = express();

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
      chats.sentPic(
        tokens.checkToken(req.body.token).id,
        req.body.chatid,
        filename,
        time.getTime(),
      );
      res.send({
        status: true,
        message: 'File is uploaded',
        data: {
          name: file.name,
          mimetype: file.mimetype,
          size: file.size,
        },
      });
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
    req.query.chatname,
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

app.listen(3000);
