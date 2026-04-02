/* eslint-disable @typescript-eslint/no-require-imports */
// 检测是否使用 standalone 模式
const fs = require('fs');
const path = require('path');

const isStandalone = fs.existsSync(path.join(__dirname, '.next/standalone/server.js'));

function loadEnvFile(filePath) {
    if (!fs.existsSync(filePath)) {
        return {};
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};

    for (const rawLine of content.split('\n')) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) {
            continue;
        }

        const separatorIndex = line.indexOf('=');
        if (separatorIndex === -1) {
            continue;
        }

        const key = line.slice(0, separatorIndex).trim();
        let value = line.slice(separatorIndex + 1).trim();

        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }

        env[key] = value;
    }

    return env;
}

const envFromFile = {
    ...loadEnvFile(path.join(__dirname, '.env.production')),
    ...loadEnvFile(path.join(__dirname, '.env.local')),
};

module.exports = {
    apps: [{
        name: 'dabo-personal',
        // standalone 模式：使用 standalone/server.js
        // 标准模式：使用 node_modules/next/dist/bin/next
        script: isStandalone 
            ? '.next/standalone/server.js'
            : 'node_modules/next/dist/bin/next',
        args: isStandalone ? '' : 'start',
        cwd: '/var/www/dabo_personal',
        instances: 1,
        exec_mode: 'fork', // 使用 fork 模式而不是 cluster（单实例）
        autorestart: true,
        watch: false,
        max_memory_restart: '1G', // 增加内存限制到1G，减少GC频率
        min_uptime: '10s', // 至少运行10秒才认为是正常启动
        max_restarts: 10, // 最多重启10次，避免无限重启
        restart_delay: 4000, // 重启延迟4秒
        kill_timeout: 5000, // 5秒超时
        wait_ready: true, // 等待应用就绪
        listen_timeout: 10000, // 10秒超时
        env: {
            ...envFromFile,
            NODE_ENV: 'production',
            PORT: 3000,
            NEXT_PUBLIC_BASE_URL: 'http://47.110.87.81',
            // 增加 Node.js 内存使用限制到1G
            NODE_OPTIONS: '--max-old-space-size=1024',
            // Volcano Engine AI Translation
            VOLCANO_API_KEY: '226c19f8-17b0-4088-9847-ee7fd41134f4',
            VOLCANO_ENDPOINT: 'https://ark.cn-beijing.volces.com/api/v3/responses',
            VOLCANO_MODEL_ID: 'glm-4-7-251222'
        },
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        log_file: './logs/combined.log',
        time: true,
        merge_logs: true, // 合并日志
    }]
}
