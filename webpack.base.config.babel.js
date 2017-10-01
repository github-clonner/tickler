import path from 'path';
import webpack from 'webpack';
import ElectronConnectWebpackPlugin from 'electron-connect-webpack-plugin';
import ElectronPlugin from 'electron-webpack-plugin';

export default {
  context: path.resolve(__dirname, './client/backend'),
  entry: {
    main: ['./main.js']
  },
  output: {
    path: path.resolve('dist'),
    filename: '[name].js'
  },
  devtool: 'sourcemap',
  target: 'electron',
  node: {
    __dirname: false,
    __filename: false
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      BABEL_ENV: 'main'
    })
  ],
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }]
  }
};
