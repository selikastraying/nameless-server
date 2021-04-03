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
      file.mv(`./uploads/${file.name}`);
      chats.sentPic(
        tokens.checkToken(req.body.token).id,
        req.body.chatid,
        file.name,
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
  res.end(chats.sentChat(
    tokens.checkToken(req.query.token).id,
    req.query.newchat,
    time.getTime(),
  ));
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

// app.get('/checkToken', (req, res) => {
//   res.end(tokens.checkToken(req.query.token).id);
// });

// app.get('/getChats', (req, res) => {
//   res.end(chats.getChats(tokens.checkToken(req.query.token).id));
// });

// app.get('/getChat', (req, res) => {
//   res.end(chats.getChat(req.query.chatid));
// });


// app.get('/sentChat', (req, res) => {
//   if (chats.sentChat(tokens.checkToken(req.query.token).id,
//     req.query.chatid,
//     req.query.newchat,
//     time.getTime())) res.end();
//   else res.status(500).send({ error: 'Something failed!' });
// });

// app.get('/createChat', (req, res) => {
//   const { id } = tokens.checkToken(req.query.token);
//   const chatid = chats.createChat(id, req.query.member, req.query.newchat, time.getTime());
//   req.query.member.forEach((m) => {
//     let { chatname } = req.query;
//     if (chatname === '') { chatname = req.query.member.filter((self) => self !== m).join('"'); }
//     users.addChat(m, chatid, chatname);
//   });
//   let { chatname } = req.query;
//   if (chatname === '') { chatname = req.query.member.filter((m) => m !== id).join('"'); }
//   users.addChat(id, chatid, chatname);
//   const chat = JSON.stringify({ id: chatid, name: chatname });
//   res.end(chat);
// });

app.listen(3000);
