import path from 'path';
import webpack from 'webpack';
import HtmlwebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import ElectronConnectWebpackPlugin from 'electron-connect-webpack-plugin';
import ElectronPlugin from 'electron-webpack-plugin';
import WebpackCleanupPlugin from 'webpack-cleanup-plugin';
import WebpackNotifierPlugin from 'webpack-notifier';

console.log('root:', path.resolve(__dirname, 'node_modules'));

export default {
  context: path.resolve(__dirname, './client/scripts'),
  entry: {
    bundle: ['babel-polyfill', './index.jsx'],
    vendor: ['react', 'redux', 'axios', 'ytdl-core', 'immutable']
  },
  output: {
    path: path.resolve('dist'),
    filename: '[name].js'
  },
  node: {
    console: true,
    process: true,
    Buffer: true,
    __filename: true,
    __dirname: false,
  },
  cache: true,
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
      NODE_ENV: 'development',
      BABEL_ENV: 'development'
    }),
    new HtmlwebpackPlugin({
      inject: false,
      template: require('html-webpack-template'),
      title: 'Tickler',
      appMountId: 'app',
      // links: [
      //   'https://unpkg.com/codemirror@5.30.0/lib/codemirror.css',
      //   'https://unpkg.com/codemirror@5.30.0/theme/material.css',
      //   'https://unpkg.com/codemirror@5.30.0/theme/monokai.css'
      // ],
      window: {
        env: {
          build: new Date(),
          NODE_ENV: 'development',
          BABEL_ENV: 'development'
        }
      }
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
          NODE_ENV: 'development',
          BABEL_ENV: 'development'
        }
      }
    }),
    new WebpackCleanupPlugin({
      exclude: ['package.json', 'main.js', 'index.html', 'bootstrapper.js', 'window.js'],
    }),
    new WebpackNotifierPlugin({
      title: 'Webpack',
      skipFirstNotification: true
    }),
    //new ExtractTextPlugin('style.css', { allChunks: true })
  ],
  // resolveLoader: {
  //   modules: [
  //     path.resolve(__dirname, 'node_modules'),
  //     path.resolve(__dirname, 'loaders')
  //   ],
  //   extensions: ['.js', '.jsx', '.json']
  // },
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
      // {
      //   test: /codemirror\/.*\.css$/,
      //   use: [
      //     {
      //       loader: 'style-loader'
      //     },
      //     {
      //       loader: 'css-loader',
      //       options: {
      //         modules: false,
      //         importLoaders: 0
      //       }
      //     }
      //   ]
      // },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
            options: { sourceMap: true }
          },
          {
            loader: 'css-loader',
            options: {
              url: false,
              import: false,
              modules: true,
              importLoaders: 1,
              camelCase: 'dashesOnly',
              sourceMap: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              plugins: (loader) => [
                require('postcss-import')({
                  root: path.resolve(__dirname, 'node_modules'),
                  path: [ path.resolve(__dirname, './client'), path.resolve(__dirname, 'node_modules')],
                }),
                require('postcss-url')(),
                require('postcss-cssnext')(),
                require('postcss-reporter')()
              ]
            }
          }
        ]
      },
      // {
      //   test: /\.jsx?$/,
      //   include: [ /node_modules\/datauri/ ],
      //   use: [
      //     { loader: 'remove-hashbag-loader' },
      //     {
      //       loader: 'babel-loader',
      //       options: {
      //         presets: [[ 'env', { targets: { 'node': 7 }, useBuiltIns: true }], 'stage-0' ],
      //         plugins: []
      //       }
      //     }
      //   ]
      // },
      // {
      //   test: /\.txt$/,
      //   exclude: /node_modules/,
      //   use: { loader: 'raw-loader' }
      // },
      // {
      //   test: /\.(types)$/i,
      //   include: /node_modules\/mimer/,
      //   use: [
      //     { loader: 'file-loader', options: { name: '[name].[ext]', context: 'data', outputPath(filename) {
      //         const { name, context } = this;
      //         const outputpath = path.join(context, filename);
      //         console.log(context, filename, outputpath);
      //         return outputpath;
      //       }
      //     }
      //   }
      //   ]
      // },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          { loader: 'react-hot-loader' },
          { loader: 'babel-loader' }
        ],
      }
    ]
  }
};
