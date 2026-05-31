const { handleApiRequest } = require('../../../lib/api-handler');

module.exports = (req, res) => {
  const id = req.query.id || '';
  handleApiRequest(req, res, `/api/admin/users/${encodeURIComponent(id)}`);
};
