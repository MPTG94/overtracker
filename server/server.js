const express = require('express');

let app = express();

app.get('/api/test', (req, res) => {
  res.json({ message: 'NEW TEXTR' });
});

// Setting app listen on port 3001
app.listen(3001, function() {
  console.log('Example app listening on port 3001!');
});
