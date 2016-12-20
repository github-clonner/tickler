import path from 'path' ;
import webpack from 'webpack';

console.log('PATH:', path.join(__dirname))
export default {
  debug: true,
  entry: [
    './client/scripts/router'
  ],
  resolve: {
    root: [ path.join(__dirname, 'app') ]
  },
  output: {
    path: path.join( __dirname, 'dist' ),
    filename: 'bundle.js'
  },
  target: 'node-webkit',
  plugins: [
    new webpack.NoErrorsPlugin()
  ],
  resolve: {
    extensions: [ '', '.js', '.jsx', '.coffee', '.less', '.ttf', '.eot', '.woff' ],
    moduleDirectories: [
      'node_modules'
    ]
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        include: __dirname,
        query: {
          presets: ['es2015', 'stage-0', 'react'],
          compact: false
        }
        /*loaders: [
          'react-hot-loader',
          'babel?presets[]=latest&presets[]=react&presets[]=stage-0',
        ]*/
      }
    ]
  }
}
