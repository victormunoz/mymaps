const compression = require('compression');
const express = require('express');
const morgan = require('morgan');
const bodyParser   = require('body-parser');
const fileUpload = require('express-fileupload');
const formData = require('express-form-data')
const cors = require('cors');
const history = require("connect-history-api-fallback");
const path = require('path');

module.exports = function (config) {

    // Create App
    const port = process.port || config.defaultPort;
    const app = express();

    app.use(compression());
    
    const staticPath = path.join(__dirname, '../Client/dist/pwa');

    console.log('✅ Servint Quasar PWA des de:', staticPath);

    // Serveix fitxers directament abans de passar per history
    app.use(express.static(staticPath));

    // Només redirigeix rutes que no siguin fitxers
    app.use(history({
        disableDotRule: true,
        verbose: true
    }));

    // Torna a servir els fitxers després del fallback
    app.use(express.static(staticPath));

    // Port
    app.set('port', port);

    app.use(fileUpload({ createParentPath: true }));
    // Parsers
    if (!config.production) {
        app.use(cors());
    }
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(morgan('dev'));

    // Routes
    require('./routes/routes')(app);

    // Listen HTTP
    const server = app.listen(app.get('port'), () => {
        console.log("");
        console.log('Express server listening on port ' + app.get('port') + '.');
        console.log("");
    });

};
