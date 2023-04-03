const envelopes = [
  {
    id: 1,
    title: "example envelope",
    budget: 100,
  }
];
let nextId = envelopes[envelopes.length-1].id+1;

const getAll = () => {
  return envelopes;
};

const findId = (id) => {
  const envelope = envelopes.find((elem) => {
    return elem.id == id;
  });

  return envelope;
};

const createEnvelope = (envelope) => {
  if(!envelope) {
    throw new Error("Envelope must not be empty.");
  }

  const title = envelope.title;
  if(!title || typeof(title) !== "string") {
    throw new Error("Title of envelope must be a valid string.");
  }

  const budget = envelope.budget;
  if(!budget || typeof(budget) !== "number") {
    throw new Error("Budget of envelope must be a valid number.");
  }

  envelope.id = nextId++;

  envelopes.push(envelope);

  return findId(envelope.id);
};

const update = (id, newEnvelope) => {
  const envelopeIndex = envelopes.findIndex((elem) => {
    return elem.id == id;
  });

  if(envelopeIndex === -1) {
    throw new Error("Envelope id not found.");
  }

  envelopes[envelopeIndex] = newEnvelope;
};

const remove = (id) => {
  const envelopeIndex = envelopes.findIndex((elem) => {
    return elem.id == id;
  });

  if(envelopeIndex === -1) {
    throw new Error("Envelope id not found.");
  }

  envelopes.splice(envelopeIndex, 1);
}


module.exports = {
  getAll,
  createEnvelope,
  findId,
  update,
  remove
};