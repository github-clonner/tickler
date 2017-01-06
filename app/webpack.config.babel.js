import path from 'path';
import fs from 'fs';
import webpack from 'webpack';
import HtmlwebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import ElectronConnectWebpackPlugin from 'electron-connect-webpack-plugin';
import WebpackCleanupPlugin from 'webpack-cleanup-plugin'

const babelSettings = JSON.parse(fs.readFileSync(".babelrc"));
const config = JSON.parse(fs.readFileSync("package.json"));

console.log(config);

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
};

export default {
  debug: true,
  entry: [
    //'webpack-dev-server/client?http://0.0.0.0:8080',
    //'webpack/hot/only-dev-server',
    './client/scripts/router',
  ],
  output: {
    path: path.join(__dirname, 'dist' ),
    filename: 'bundle.js'
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
  //target: 'node-webkit',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(env)
    }),
    new HtmlwebpackPlugin({
      template: 'node_modules/html-webpack-template/index.ejs',
      links: [
        'https://fonts.googleapis.com/css?family=Roboto',
        'http://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'
      ],
      title: 'App',
      appMountId: 'app',
      inject: false
    }),
    new ElectronConnectWebpackPlugin({
      path: path.join(__dirname, 'dist'),
      logLevel: 0
    }),
    new WebpackCleanupPlugin({
      exclude: ["package.json", "main.js", "index.html"],
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
        loaders: [ 'react-hot', 'babel-loader' ],
        //query: babelSettings
        /*loaders: [
          'react-hot-loader',
          'babel?presets[]=latest&presets[]=react&presets[]=stage-0',
        ]*/
      }
    ]
  },
  postcss: function (webpack) {
    return [
      require("postcss-import")({ addDependencyTo: webpack }),
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
