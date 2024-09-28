// First load base configuration file
const baseConfiguration = require('./config.base');

// now load the dynamic config file
let dynamicConfiguration = null;
try {
    // eslint-disable-next-line global-require
    dynamicConfiguration = require('./config.local');
} catch (ignored) {
    dynamicConfiguration = {};
}

// Merge the two configurations
const mergeObjects = function (object1, object2) {
    for (const key of Object.keys(object2)) {
        if (object2[key] instanceof Object) {
            object1[key] = mergeObjects(object1[key], object2[key]);
        } else {
            object1[key] = object2[key];
        }
    }
    return object1;
};

const configuration = mergeObjects(baseConfiguration, dynamicConfiguration);

module.exports = configuration;
