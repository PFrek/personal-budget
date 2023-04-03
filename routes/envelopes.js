const express = require('express');
const envelopesRouter = express.Router();
const Envelope = require('../models/envelope');


// Return all envelopes
envelopesRouter.get('/', (req, res, next) => {
  const envelopes = Envelope.getAll();
  res.send({ envelopes: envelopes });
});

// Id Param
envelopesRouter.param('id', (req, res, next, id) => {
  const foundEnvelope = Envelope.findId(id);

  if(!foundEnvelope) {
    return res.sendStatus(404);
  }

  req.foundEnvelope = foundEnvelope;
  next();
});

// Return specific envelope
envelopesRouter.get('/:id', (req, res, next) => {
  res.send({ envelope: req.foundEnvelope });
});

// Validate request body envelope
const validateBodyEnvelope = (req, res, next) => {
  const envelope = req.body.envelope;

  if(!envelope) {
    res.status(400).send({ message: "Request body must contain valid envelope object." });
  }

  const title = envelope.title;
  if(!title || typeof(title) !== "string") {
    res.status(400).send({ message: "Request envelope must contain a valid title." });
  }

  const budget = envelope.budget;
  if(!budget || typeof(budget) !== "number") {
    res.status(400).send({ message: "Request envelope must contain a valid budget." });
  }

  next();
};

// Create a new envelope
envelopesRouter.post('/', validateBodyEnvelope, (req, res, next) => {
  const createdEnvelope = Envelope.createEnvelope(req.body.envelope);

  res.status(201).send({ envelope: createdEnvelope });
});

// Update an envelope
envelopesRouter.put('/:id', (req, res, next) => {  
  const title = req.body.title;

  if(title && typeof(title) === "string") {
    req.foundEnvelope.title = title;
  }
  
  const spendingQuery = req.query.spending;
  let spendingAmount = 0;
  if(spendingQuery) {
    spendingAmount = Number.parseFloat(spendingQuery);
  }

  const newBudget = req.foundEnvelope.budget - spendingAmount;
  if(newBudget < 0) {
    return res.status(400).send({ message: "Spending cannot exceed envelope budget." });
  }

  req.foundEnvelope.budget = newBudget;

  Envelope.update(req.foundEnvelope.id, req.foundEnvelope);
  
  const newEnvelope = Envelope.findId(req.foundEnvelope.id);
  res.send({ envelope: newEnvelope });
});

// Delete an envelope
envelopesRouter.delete('/:id', (req, res, next) => {
  Envelope.remove(req.foundEnvelope.id);

  res.sendStatus(204);
});

// From Param
envelopesRouter.param('from', (req, res, next, fromId) => {
  const foundEnvelope = Envelope.findId(fromId);

  if(!foundEnvelope) {
    return res.sendStatus(404);
  }

  req.fromEnvelope = foundEnvelope;
  next();
});

// To Param
envelopesRouter.param('to', (req, res, next, toId) => {
  const foundEnvelope = Envelope.findId(toId);

  if(!foundEnvelope) {
    return res.sendStatus(404);
  }

  req.toEnvelope = foundEnvelope;
  next();
});


// Transfer
envelopesRouter.post('/transfer/:from/:to', (req, res, next) => {
  if(req.fromEnvelope.id === req.toEnvelope.id) {
    return res.status(400).send({ message: "Cannot transfer to the same envelope." });
  }

  const valueQuery = req.query.value;
  
  if(!valueQuery) {
    return res.status(400).send({ message: "Must inform value to be transfered." });
  }

  const value = Number.parseFloat(valueQuery);
  
  if(value > req.fromEnvelope.budget) {
    return res.status(400).send({ message: "Insuficient budget to conclude transfer." });
  }

  req.fromEnvelope.budget -= value;
  req.toEnvelope.budget += value;

  Envelope.update(req.fromEnvelope.id, req.fromEnvelope);
  Envelope.update(req.toEnvelope.id, req.toEnvelope);

  res.send({ message: `Successfully transfered ${value} from envelope #${req.fromEnvelope.id} to envelope #${req.toEnvelope.id}`,
    from: req.fromEnvelope,
    to: req.toEnvelope
  });
});

module.exports = { envelopesRouter };