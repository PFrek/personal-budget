const express = require('express');
const app = express();
const PORT = 3000;

// Setup .env db configurations
require('dotenv').config();

// Middleware
app.use(express.json());

const morgan = require('morgan');
app.use(morgan('dev'));

// Envelopes Route
const { envelopeRouter } = require('./routes/envelopeRoute');
app.use('/envelopes', envelopeRouter);

// Transactions Route
const { transactionRouter } = require('./routes/transactionRoute');
app.use('/transactions', transactionRouter);

app.get('/', (req, res, next) => {
  res.send(`
    <h1>Personal Budget</h1>
    <h2>Endpoints</h2>

    <p><strong>/envelopes</strong> : Budget Envelopes resource</p>
    <p><strong>/transactions</strong> : Transactions between envelopes</p>  
  `);
});


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
})
