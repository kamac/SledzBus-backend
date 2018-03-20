let isDebug = process.env.NODE_ENV !== 'production'; 

let settings = {
    isDebug: isDebug,
    port : process.env.NODE_PORT || 3000,
    database: {
        protocol: isDebug ? 'sqlite' : 'mysql',
        query: { pool: true },
        host: process.env.DB_HOST,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASS
    }
};

module.exports = settings;