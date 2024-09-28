const Entity = require('../models/entity');

exports.getEntityByMail = async function (mail) {
    return await Entity.findOne({email: mail.toLowerCase()});
};

exports.getEntityById = async function (id) {
    return Entity.findOne({_id: id});
};

exports.getEntities =  async function(){
    return Entity.find();
}

exports.createEntity = async function(params){
    const entity = new Entity();
    entity.name = params.name;
    entity.password = "";
    entity.role = "ADMIN";
    entity.address = "www."+params.name+".ekratos.org";
    entity.adminMail = params.email;
    entity.version = "versionX";
    entity.status = "Processing";
}

exports.saveEntity = async function (params) {
    const entity = await Entity.findOne({_id: params.id});
    return await exports.updateEntity(entity, params);
};

exports.deleteEntity= async function (params) {
    const entity = await Entity.findOne({_id: params.id});
    return await exports.updateEntity(entity, params);
};

exports.updateEntity = async function (user, params) {
    user.name = params.name;
    user.password = params.password;
    user.role = params.role;
    user = await user.save();
    return user;
};