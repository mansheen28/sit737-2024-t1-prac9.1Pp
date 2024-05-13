const express = require('express');
const app = express();
const { MongoClient, ObjectId } = require('mongodb');
const winston = require('winston');
app.use(express.json());

app.use((req, res, next) => {
    logger.log({
        level: 'info',
        message: `New ${req.method} request: ${req.url}`,
       
    });
    next();
});

const client = new MongoClient(`mongodb://${process.env.USERNAME}:${process.env.PASSWORD}@mongo:27017/admin`);
let mongoDb;

async function connectToMongoDB() {
    try {
        await client.connect();
        mongoDb = client.db();
        console.log('Connected');
    } catch (err) {
        console.error(err);
    }
}

connectToMongoDB();

// Logger function
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'calculator-microservice' },
    transports: [
    new winston.transports.Console({
    format: winston.format.simple(),
    }),
    new winston.transports.File({ filename: 'logs/error.log', level:
   'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
   });

app.get("/check-health", (req, res) => {
    res.send({ success: true, message: "Application staus: working" });
});

app.post('/users', async (req, res) => {
  try {
      const { name, email, age } = req.body;
      const dbres = await mongoDb.collection('users').insertOne({ name, email, age });
      const result = `User created, id: ${dbres.insertedId}`;
      res.json({ result });
  } catch (err) {
      console.error('Error creating user:', err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/users/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const uid = new ObjectId(id);
      const user = await mongoDb.collection('users').findOne({ _id: uid });
      res.json(user);
  } catch (err) {
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/users/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const uid = new ObjectId(id);
      const { name, email, age } = req.body;
      const result = await mongoDb.collection('users').updateOne({ _id: uid }, { $set: { name, email, age } });
      res.json({ message: 'User updated successfully' });
  } catch (err) {
      console.error('Error updating user:', err);
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const uid = new ObjectId(id);
      const result = await mongoDb.collection('users').deleteOne({ _id: uid });
      res.json({ message: 'User deleted successfully' });
  } catch (err) {
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Addition endpoint
app.get('/add', (req, res) => {
  const num1 = parseFloat(req.query.num1);
  const num2 = parseFloat(req.query.num2);
  const result = num1 + num2;
  res.send({ result });
});

// Subtraction endpoint
app.get('/subtract', (req, res) => {
  const num1 = parseFloat(req.query.num1);
  const num2 = parseFloat(req.query.num2);
  const result = num1 - num2;
  res.send({ result });
});

// Multiplication endpoint
app.get('/multiply', (req, res) => {
  const num1 = parseFloat(req.query.num1);
  const num2 = parseFloat(req.query.num2);
  const result = num1 * num2;
  res.send({ result });
});

// Division endpoint
app.get('/divide', (req, res) => {
  const num1 = parseFloat(req.query.num1);
  const num2 = parseFloat(req.query.num2);
  if (num2 === 0) {
    res.status(400).send({ error: 'Division by zero is not allowed' });
  } else {
    const result = num1 / num2;
    res.send({ result });
  }
});

// Exponential endpoint
app.get('/exponential', (req, res) => {
  const num1 = parseFloat(req.query.num1);
  const num2 = parseFloat(req.query.num2);
  const result = Math.pow(num1, num2);
  res.send({ result });
});

// Modulo endpoint
app.get('/modulo', (req, res) => {
  const num1 = parseFloat(req.query.num1);
  const num2 = parseFloat(req.query.num2);
  const result = num1 % num2;
  res.send({ result });
});

// Square root endpoint
app.get('/sqrt', (req, res) => {
  const num = parseFloat(req.query.num);
  if (num < 0) {
      res.status(400).send({ error: 'Square root of a negative number is not allowed' });
  } else {
      const result = Math.sqrt(num);
      res.send({ result });
  }
});

// Listening on port 3000 by default
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


