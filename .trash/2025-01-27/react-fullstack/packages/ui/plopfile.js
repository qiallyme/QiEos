const promptDirectory = require('inquirer-directory');

module.exports = function (plop) {
  plop.setPrompt('directory', promptDirectory);
  plop.setHelper('append', (text) => text);

  [
    require('./plop/reactComponent'),
    require('./plop/crud'),
    require('./plop/email'),
  ].forEach((generator) => generator(plop));
};
