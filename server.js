const express = require('express');
const app = express();
app.use(express.json());

const morgan = require('morgan');
app.use(morgan('dev'));

const PORT = 3000;

const { envelopesRouter } = require('./routes/envelopes');
app.use('/envelopes', envelopesRouter);

app.get('/', (req, res, next) => {
  res.send("<h1>Hello, World</h1>");
});


app.listen(PORT, (err) => {
  if(err) {
    return console.log('Error: ' + err);
  }

  console.log(`Server listening on port ${PORT}`);
})
