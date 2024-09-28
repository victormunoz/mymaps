const User = require('../models/user');
const Encrypt = require('../controllers/EncryptController')


exports.getUserbyMail = async function (mail) {
    return User.findOne({email: mail.toLowerCase()});
};

exports.createUser = async function (params){
    const user = new User();
    user.email= params.email;
    user.password = Encrypt.encryptPassword(params.password);
    user.role = params.role;
    await user.save();
}

exports.saveUser = async function (params) {
    const user = await User.findOne({_id: params.id});
    return await exports.updateUser(user, params);
};

exports.updateUser = async function (user, params) {
    user.name = params.name;
    user.password = params.password;
    user.role = params.role;
    user = await user.save();
    return user;
};