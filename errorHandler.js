module.exports = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Daxili server xətası baş verdi.',
    details: err.message
  });
};