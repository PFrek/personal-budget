const express = require('express');
const envelopesRouter = express.Router();
const Envelope = require('../models/envelope');


// Return all envelopes
envelopesRouter.get('/', (req, res, next) => {
  const envelopes = Envelope.getAll();
  res.send({ envelopes: envelopes });
});


// Validate request body envelope
const validateBodyEnvelope = (req, res, next) => {
  const envelope = req.body.envelope;

  if(!envelope) {
    return next(new Error("Request body must contain valid envelope object."));
  }

  const title = envelope.title;
  if(!title || typeof(title) !== "string") {
    return next(new Error("Request envelope must contain a valid title."));
  }

  const budget = envelope.budget;
  if(!budget || typeof(budget) !== "number") {
    return next(new Error("Request envelope must contain a valid budget."));
  }

  next();
};

// Create a new envelope
envelopesRouter.post('/', validateBodyEnvelope, (req, res, next) => {
  const createdEnvelope = Envelope.createEnvelope(req.body.envelope);

  res.status(201).send({ envelope: createdEnvelope });
});

module.exports = { envelopesRouter };