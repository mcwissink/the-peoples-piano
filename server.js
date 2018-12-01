const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const APP_PATH = path.join(__dirname, 'dist');
console.log(APP_PATH);
app.set('port', (process.env.PORT || 3000));
app.use('/', express.static(APP_PATH));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('*', express.static(APP_PATH));

app.listen(app.get('port'), () => console.log(`Listening on port  ${app.get('port')}!`));
