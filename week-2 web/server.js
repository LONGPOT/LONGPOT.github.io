const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

app.use(express.static(__dirname + '/public'));
app.use('/build', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use('/json', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));
app.use('/Assets', express.static(path.join(__dirname, 'Assets')));
app.use(express.json());


app.listen(80, () => {
    console.log("Visit 134.209.107.226");
})

