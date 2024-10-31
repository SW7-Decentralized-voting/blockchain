const errorHandler = (err, req, res, _next) => {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: err.message });
  };
  
  export default errorHandler;