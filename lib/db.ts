import mysql from 'mysql2/promise';

// Create a connection pool instead of a single connection
// This handles reconnection automatically and allows multiple concurrent queries
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'personal_web',
    waitForConnections: true,
    connectionLimit: 10, // Max 10 concurrent connections
    queueLimit: 0, // Unlimited queue
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 10000, // 10 seconds
    acquireTimeout: 10000, // 10 seconds
    timeout: 10000, // 10 seconds
});

// Helper to get a connection from the pool if needed explicitly
// Usually not needed as pool.execute handles it
export async function getConnection() {
    return pool.getConnection();
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    try {
        // pool.execute will automatically get a connection from the pool,
        // execute the query, and release the connection back to the pool.
        const [rows] = await pool.execute(sql, params);
        return rows as T[];
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

// Gracefully close the pool when the app shuts down
export async function closeConnection() {
    await pool.end();
}
