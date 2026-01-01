const path = require('path');

module.exports = {
  entry: {
    index: './src/main/index.ts',
    preload: './src/main/preload.ts'
  },
  target: 'electron-main',
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: /src/,
        use: [{ loader: 'ts-loader' }]
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist/main'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  node: {
    __dirname: false,
    __filename: false
  }
};
