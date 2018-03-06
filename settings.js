let settings = {
    isDebug: process.env.NODE_ENV !== 'production',
    port : process.env.NODE_PORT || 3000,
    database: {
        protocol: 'mysql',
        query: { pool: true },
        host: process.env.DB_HOST,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASS
    }
};

module.exports = settings;