const bcrypt = require('bcryptjs');

exports.checkPassword = function (password, user_password) {
    return bcrypt.compareSync(password, user_password);
};

exports.encryptPassword = function (password) {
    return bcrypt.hashSync(password, 10);
};

