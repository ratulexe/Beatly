export const cloneRequestData = (req, res, next) => {
  if (req.query) {
    Object.defineProperty(req, 'query', { value: JSON.parse(JSON.stringify(req.query)), writable: true });
  }
  if (req.body) {
    Object.defineProperty(req, 'body', { value: JSON.parse(JSON.stringify(req.body)), writable: true });
  }
  if (req.params) {
    Object.defineProperty(req, 'params', { value: JSON.parse(JSON.stringify(req.params)), writable: true });
  }
  next();
};
