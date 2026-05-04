module.exports = {
  apps: [
    {
      // 应用名称，在 pm2 列表中显示
      name: 'institution-learning-backend',

      // 入口脚本，指向 TypeScript 编译后的主文件
      // 必须先执行 npm run build 生成 dist 目录
      script: './dist/index.js',

      // 工作目录，确保相对路径（如日志文件）基于此目录解析
      cwd: '/home/ubuntu/vibe-coding/promulgate/backend',

      // 启动实例数量：1 为单实例；可改为 'max' 以利用全部 CPU 核心
      instances: 1,

      // 执行模式：fork 适用于单实例；cluster 用于多实例负载均衡
      exec_mode: 'fork',

      // 默认环境变量（生产环境）
      // 启动命令：pm2 start ecosystem.config.js --env production
      env: {
        NODE_ENV: 'production',
      },

      // 开发环境变量
      // 启动时加 --env development 可切换至此环境
      env_development: {
        NODE_ENV: 'development',
      },

      // 日志时间戳格式
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // 错误日志输出路径
      error_log: './logs/err.log',

      // 标准输出日志路径
      out_log: './logs/out.log',

      // 合并所有实例的日志到单个文件（instances > 1 时有效）
      merge_logs: true,

      // 内存上限，超过后 PM2 会自动重启应用
      max_memory_restart: '500M',

      // 崩溃后重启的延迟时间（毫秒），防止过快反复重启
      restart_delay: 3000,

      // 最大连续重启次数，超过后 PM2 将停止重启并标记为 errored
      max_restarts: 5,

      // 应用最少稳定运行时间，低于此时间崩溃会加大重启间隔
      min_uptime: '10s',

      // 是否监听文件变化自动重启；生产环境建议关闭，避免意外重启
      watch: false,
    },
  ],
};
