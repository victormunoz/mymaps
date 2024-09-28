const Constants = require( "../config/constants");
const config = require( "../config/config");
const axios = require('axios');
const FormData = require("form-data");
const UserCore = require("../core/UserCore");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const Entity = require("../models/entity");
const EntityCore = require("../core/Entitycore");

exports.methodNotFound = function (_req, res) {
    return res.json({msg: "Method not found"});
};

exports.sayHello = function (_req, res) {
    return res.status(200).json({message: "Hello"});
};

exports.sayHelloAuth = function (_req, res) {
    return res.status(200).json({message: "Hello Auth"});
};

exports.sayHelloAdmin = function (_req, res) {
    return res.status(200).json({message: "Hello Admin"});
};

exports.checkAuth = function (req, res) {
    return res.status(200).json({user: req.user});
};

exports.addEntity = async function (req, res) {

    try{
        const params = req.body;
        const entity = await EntityCore.getEntityByMail(params.mail);
        if(!entity){
            const entity = await EntityCore.createEntity(params);
            return res.status(200).json({entity: entity});
        }else{
            // entitat ja creada
            return  res.status(404).json({errorCode : Constants});
        }
    }
    catch (e) {
        console.log(e)
        return res.status(500).json({errorCode:  Constants.ERRORS.ERROR_GENERIC});
    }
};


exports.getEntityByMail = async function (req, res) {
    try{
        const params = req.query;
        const entity = await EntityCore.getEntityByMail(params.mail);
        if (entity)
            return res.status(200).json({entity: entity});
        else
            return  res.status(404).json({errorCode : Constants});
    }
    catch (e) {
        console.log(e)
        return res.status(500).json({errorCode: Constants.ERRORS.ERROR_GENERIC});
    }
};
exports.getEntityById = async function (req, res) {
    try{
        const params = req.query;
        const entity = await EntityCore.getEntityById(params.id);
        if (entity)
            return res.status(200).json({entity: entity});
        else
            return  res.status(404).json({errorCode : Constants});
    }
    catch (e) {
        console.log(e)
        return res.status(500).json({errorCode: Constants.ERRORS.ERROR_GENERIC});
    }
};

exports.getEntities = async function (req, res) {
    try{
        const params = req.query;
        const entity = await EntityCore.getEntityById(params.id);
        if (entity)
            return res.status(200).json({entity: entity});
        else
            return  res.status(404).json({errorCode : Constants});
    }
    catch (e) {
        console.log(e)
        return res.status(500).json({errorCode: Constants.ERRORS.ERROR_GENERIC});
    }
};
