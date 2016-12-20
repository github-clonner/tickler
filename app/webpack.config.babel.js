import path from 'path';
import fs from 'fs';
import webpack from 'webpack';

const babelSettings = JSON.parse(fs.readFileSync(".babelrc"));

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
};

console.log('PATH:', path.join(__dirname))
export default {
  debug: true,
  entry: [
    //'webpack-dev-server/client?http://0.0.0.0:8080',
    //'webpack/hot/only-dev-server',
    './client/scripts/router',
  ],
  output: {
    path: path.join( __dirname, 'dist' ),
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: './dist',
    hot: true,
    inline: true,
    colors: true,
    open: true,
    host: "localhost",
    port: 8080
  },
  //target: 'node-webkit',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(env)
    })
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
  }
}
