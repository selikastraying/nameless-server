const fs = require('fs');

exports.login = (id, pass) => {
  const fd = fs.readFileSync('users.json');
  const users = JSON.parse(fd);
  const user = users.users.find((userdata) => userdata.id === id);
  if (user) {
    if (pass === user.pass) {
      return true;
    }
  }
  return false;
};

exports.register = (id, pass) => {
  const fd = fs.readFileSync('users.json');
  const users = JSON.parse(fd);
  const user = users.users.find((userdata) => userdata.id === id);
  if (!user) {
    users.users.push(JSON.parse(`{"id":"${id}","pass":"${pass}"}`));
    fs.writeFileSync('users.json', JSON.stringify(users), () => {
      // console.log('The file has been saved!');
    });
    const data = '{"chats":[{"id":"00000001","name":"Hello World"}]}';
    fs.writeFileSync(`users/${id}.json`, data, () => {
      // console.log('The file has been saved!');
    });
    return true;
  }
  return false;
};

exports.addChat = (id, chatid, chatname) => {
  const fd = fs.readFileSync(`users/${id}.json`);
  const user = JSON.parse(fd);
  const exist = user.chats.find((chat) => chat.id === chatid);
  if (!exist) {
    const chat = JSON.parse(`{"id":"${chatid}","name":"${chatname}"}`);
    user.chats.push(chat);
    fs.writeFileSync(`users/${id}.json`, JSON.stringify(user), () => {
      // console.log('The file has been saved!');
    });
  }
  return true;
};
