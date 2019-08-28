const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const path = require('path');
const app = express();


app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

app.listen(process.env.PORT || 9000);
