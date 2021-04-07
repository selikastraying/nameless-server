const fs = require('fs');

exports.getAllChatList = () => JSON.stringify(fs.readdirSync('./chats/'));

exports.getChatList = (id) => {
  const fd = fs.readFileSync(`users/${id}.json`);
  return JSON.stringify(JSON.parse(fd).chats);
};

exports.getChatContent = (chatid) => {
  const fd = fs.readFileSync(`chats/${chatid}.json`);
  return fd;
};

exports.sentChat = (id, chatid, newchat, time) => {
  const fd = fs.readFileSync(`chats/${chatid}.json`);
  const chat = JSON.parse(fd);
  chat.chat.push(JSON.parse(`{"id":${chat.chat[chat.chat.length - 1].id + 1},"name":"${id}","content":"${newchat}","time":${time}}`));
  fs.writeFileSync(`chats/${chatid}.json`, JSON.stringify(chat));
  return 'success';
};

exports.sentPic = (id, chatid, picpath, time) => {
  const fd = fs.readFileSync(`chats/${chatid}.json`);
  const chat = JSON.parse(fd);
  chat.chat.push(JSON.parse(`{"id":${chat.chat[chat.chat.length - 1].id + 1},"name":"${id}","pic":"${picpath}","time":${time}}`));
  fs.writeFileSync(`chats/${chatid}.json`, JSON.stringify(chat));
  return 'success';
};

exports.createChat = (id, time) => {
  const chatid = id + time;
  const chat = '{"chat":[{"id":0}]}';
  fs.writeFileSync(`chats/${chatid}.json`, chat, () => {
    // console.log('The file has been saved!');
  });
  return chatid;
};
