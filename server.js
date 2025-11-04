import express from 'express';
import cors from 'cors';

const app = express();

// allow any origin (for demo)
app.use(cors());

app.get('/api/hello', (req, res) => {
  res.json({
    message: 'Hello from backend 👋',
    time: new Date().toISOString(),
  });
});

app.get('/api', (req, res) => {
  res.send('Backend is running');
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Backend listening on ${port}`);
});
