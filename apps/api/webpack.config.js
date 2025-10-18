const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './src/main.ts',
  target: 'node',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  externals: [
    nodeExternals({
      allowlist: [
        /^@nestjs\/core/,
        /^@nestjs\/common/,
        /^@nestjs\/platform-express/,
        /^@nestjs\/typeorm/,
        /^@nestjs\/jwt/,
        /^@nestjs\/passport/,
        /^@nestjs\/throttler/,
        /^@nestjs\/config/
      ]
    })
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@libs/data': path.resolve(__dirname, '../../libs/data/src'),
      '@libs/auth': path.resolve(__dirname, '../../libs/auth/src')
    },
    fallback: {
      // Database drivers
      'pg-native': false,
      'react-native-sqlite-storage': false,
      '@google-cloud/spanner': false,
      'mongodb': false,
      '@sap/hana-client': false,
      'mysql': false,
      'mysql2': false,
      'oracledb': false,
      'pg-query-stream': false,
      'typeorm-aurora-data-api-driver': false,
      'redis': false,
      'ioredis': false,
      'better-sqlite3': false,
      'sqlite3': false,
      'sql.js': false,
      'mssql': false,
      // Microservices dependencies
      '@grpc/grpc-js': false,
      '@grpc/proto-loader': false,
      'kafkajs': false,
      'mqtt': false,
      'nats': false,
      'amqplib': false,
      'amqp-connection-manager': false,
      // WebSockets dependencies
      '@nestjs/platform-socket.io': false,
      'socket.io': false,
      'ws': false
    }
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  optimization: {
    minimize: false
  },
  ignoreWarnings: [
    /Critical dependency: the request of a dependency is an expression/,
    /Module not found: Error: Can't resolve/
  ]
};