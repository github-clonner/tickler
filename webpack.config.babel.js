import path from 'path';
import fs from 'fs';
import webpack from 'webpack';
import HtmlwebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import ElectronConnectWebpackPlugin from 'electron-connect-webpack-plugin';
import ElectronPlugin from 'electron-webpack-plugin';
import WebpackCleanupPlugin from 'webpack-cleanup-plugin'

//import packme from './bootstrapper';

const babelSettings = JSON.parse(fs.readFileSync(".babelrc"));

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
};

export default {
  debug: true,
  entry: {
    //'webpack-dev-server/client?http://0.0.0.0:8080',
    //'webpack/hot/only-dev-server',
    'bundle': ['babel-polyfill', './client/scripts/router'],
    //'electron': './main'
  },
  output: {
    path: path.resolve('dist'),
    filename: '[name].js'
  },
  devServer: {
    contentBase: './dist',
    hot: true,
    inline: true,
    colors: true,
    open: false,
    host: "localhost",
    port: 7070
  },
  devtool: 'inline-source-map',
  target: 'electron',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(env)
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
      // if a file in this path is modified/emitted, electron will be restarted
      // *required*
      relaunchPathMatch: "./main",
      // the path to launch electron with
      // *required*
      path: path.resolve('dist'),
      // the command line arguments to launch electron with
      // optional
      args: ["--enable-logging"],
      // the options to pass to child_process.spawn
      // see: https://nodejs.org/api/child_process.html#child_process_child_process_spawnsync_command_args_options
      // optional
      options: {
        env: {NODE_ENV: "development"}
      }
    }),
    new WebpackCleanupPlugin({
      exclude: ["package.json", "main.js", "index.html", 'bootstrapper.js'],
    })
    //new ExtractTextPlugin('style.css', { allChunks: true })
  ],
  resolve: {
    extensions: [ '', '.js', '.jsx', '.coffee', '.less', '.ttf', '.eot', '.woff' ],
    moduleDirectories: [
      'node_modules'
    ]
  },
  resolveLoader: {
    moduleDirectories: [ 'node_modules' ]
  },
  module: {
    loaders: [
      {
        test: /\.html$/,
        loader: "file?name=[name].[ext]",
      },
      {
        test: /\.json$/,
        loader: "json-loader"
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: 'file?hash=sha512&digest=hex&name=[hash].[ext]'
      },
      {
        test: /\.css$/,
        loaders: [
          'style-loader',
          'css-loader?importLoaders=1',
          //'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader',
          //'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]',
          'postcss-loader'
        ]
      },
      {
        test: /\.mp3$/,
        loader: "file?name=[name].[ext]",
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: [ 'react-hot-loader', 'babel-loader' ],
      }
    ]
  },
  postcss: function (webpack) {
    return [
      require("postcss-import")({
        root: process.cwd()
      }),
      require("postcss-url")(),
      require("postcss-cssnext")({
        browsers: [
          'ie >= 10',
          'Safari >= 7',
          'ff >= 28',
          'Chrome >= 34'
        ]
      }),
      // add your "plugins" here
      // ...
      // and if you want to compress,
      // just use css-loader option that already use cssnano under the hood
      //require("postcss-browser-reporter")(),
      //require("postcss-reporter")(),
    ]
  }
}
