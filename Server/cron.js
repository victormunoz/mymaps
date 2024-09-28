
const mongoose = require('mongoose');

module.exports = function (config) {

    const requriedCron = "./crons/" + process.cron;

    const cron = require(requriedCron);

    cron(config).then(() => {
        mongoose.disconnect();
        process.exit();
    });
};
