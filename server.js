const express = require('express');
var bodyParser = require('body-parser');
const app = express();

app.set('port', (process.env.PORT || 3000));
app.use('/', express.static(path.join(__dirname, 'dist')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.listen(app.get('port'), () => console.log(`Example app listening on port ${port}!`))
