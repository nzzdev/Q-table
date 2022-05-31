module.exports = {
    path: '/health',
    method: 'GET',
    options: {
        tags: ['api']
    },
    handler: function (request, h) {
        return 'ok';
    }
};
