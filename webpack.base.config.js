module.exports = {
  entry: ['babel-polyfill', './dist/main.js'],
  output: {
    filename: './dist/window.js'
  },
  devtool: 'sourcemap',
  target: 'electron',
  module: {
    loaders: [{
      test: /\.js?$/,
      exclude: /(node_modules)/,
      loader: 'babel'
    }]
  }
}
