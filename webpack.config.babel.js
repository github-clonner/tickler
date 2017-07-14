import path from 'path';
import fs from 'fs';
import webpack from 'webpack';
import HtmlwebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import ElectronConnectWebpackPlugin from 'electron-connect-webpack-plugin';
import ElectronPlugin from 'electron-webpack-plugin';
import WebpackCleanupPlugin from 'webpack-cleanup-plugin'

//import packme from './bootstrapper';

const babelSettings = JSON.parse(fs.readFileSync('.babelrc'));

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
};

export default {
  context: path.resolve(__dirname, './client/scripts'),
  entry: {
    'bundle': ['babel-polyfill', './index.jsx'],
    'vendor': ['react']
  },
  output: {
    path: path.resolve('dist'),
    filename: '[name].js'
  },
  devtool: 'eval-source-map',
  target: 'electron-renderer',
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity,
      filename: 'vendor.bundle.js'
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development'
    }),
    new HtmlwebpackPlugin({
      //template: 'index.js',
      template: require('html-webpack-template'),
      title: 'App',
      appMountId: 'app',
      inject: false
    }),
    new ElectronConnectWebpackPlugin({
      path: path.resolve('dist'),
      logLevel: 0
    }),
    new ElectronPlugin({
      // if a module ID matches this regex and that module has changed, electron will be restarted
      // *required*
      test: /^.\/main/,
      // the path to launch electron with
      // *required*
      path: path.resolve('dist'),
      // the command line arguments to launch electron with
      // optional
      args: ['--enable-logging'],
      // the options to pass to child_process.spawn
      // see: https://nodejs.org/api/child_process.html#child_process_child_process_spawnsync_command_args_options
      // optional
      options: {
        env: {
          NODE_ENV: 'development'
        }
      }
    }),
    new WebpackCleanupPlugin({
      exclude: ['package.json', 'main.js', 'index.html', 'bootstrapper.js', 'window.js'],
    })
    //new ExtractTextPlugin('style.css', { allChunks: true })
  ],
  resolve: {
    extensions: [ '*', '.js', '.jsx' ],
    modules: [
      path.resolve(__dirname, 'node_modules')
    ],
    alias: {
      lib: path.resolve(__dirname, './client/scripts/lib'),
      actions: path.resolve(__dirname, './client/scripts/actions'),
      styles: path.resolve(__dirname, './client/styles')
    }
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: 'file?name=[name].[ext]',
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 30000,
            name: '[name]-[hash].[ext]'
          }
        }]
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: [ 'react-hot-loader', 'babel-loader' ],
      }
    ]
  }
}
