const express = require('express');
const router = express.Router({ mergeParams: true });

router.get('/:lid', (req, res) => {
  res.send(`Get loyalty program ${req.params.lid} for store ${req.params.id}`);
});

router.post('/', (req, res) => {
  res.send(`Create loyalty program for store ${req.params.id}`);
});

router.put('/:lid', (req, res) => {
  res.send(`Update loyalty program ${req.params.lid} for store ${req.params.id}`);
});

router.delete('/:lid', (req, res) => {
  res.send(`Delete loyalty program ${req.params.lid} for store ${req.params.id}`);
});

module.exports = router;