const route = {
    path: '/health',
    method: 'GET',
    options: {
        tags: ['api']
    },
    handler: () => {
        return 'ok';
    }
};
export default route;
