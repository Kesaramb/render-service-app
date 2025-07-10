export const developmentConfig = {
  port: 8081,
  nodeEnv: 'development',
  allowedOrigins: ['http://localhost:9002', 'http://localhost:3000', 'http://localhost:3001'],
  firebase: {
    projectId: 'dev-project-id',
    clientEmail: 'dev@example.com',
    privateKey: 'dev-key',
    storageBucket: 'dev-bucket.appspot.com'
  }
}; 