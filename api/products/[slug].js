const { handleApiRequest } = require('../../lib/api-handler');

module.exports = (req, res) => {
  const slug = req.query.slug || '';
  handleApiRequest(req, res, `/api/products/${encodeURIComponent(slug)}`);
};
