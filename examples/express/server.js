const express = require('express');
const { rownd } = require('../../');

const app = express();

const { authenticate } = rownd.express;

app.get('/', (req, res) => {
    res.send('This is an unauthenticated route.');
});

app.get('/dashboard', authenticate(), (req, res) => {
    res.send({
        message: 'You are authenticated!',
        tokenObj: req.tokenObj,
    });
});

app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).send({
        message: err.message,
        innerError: err.innerError || null,
    })
});

app.listen(3333, () => {
    console.log('Server is running on port 3333');
});
