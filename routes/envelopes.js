const express = require('express');
const envelopesRouter = express.Router();
const Envelope = require('../models/envelope');


// Return all envelopes
envelopesRouter.get('/', (req, res, next) => {
  const envelopes = Envelope.getAll();
  res.send({ envelopes: envelopes });
});


module.exports = { envelopesRouter };