const { handleApiRequest } = require('../../lib/api-handler');

module.exports = (req, res) => handleApiRequest(req, res, '/api/admin/upload');
