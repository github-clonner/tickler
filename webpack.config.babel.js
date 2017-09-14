import path from 'path';
import fs from 'fs';
import webpack from 'webpack';
import HtmlwebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import ElectronConnectWebpackPlugin from 'electron-connect-webpack-plugin';
import ElectronPlugin from 'electron-webpack-plugin';
import WebpackCleanupPlugin from 'webpack-cleanup-plugin'

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
};

export default {
  context: path.resolve(__dirname, './client/scripts'),
  entry: {
    bundle: ['./index.jsx'],
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
  resolveLoader: {
    modules: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, 'loaders')
    ],
    extensions: ['.js', '.jsx', '.json']
  },
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
      {
        test: /\.txt$/,
        exclude: /node_modules/,
        use: { loader: 'raw-loader' }
      },
      {
        test: /\.(types)$/i,
        include: /node_modules\/mimer/,
        use: [
          { loader: 'file-loader', options: { name: '[name].[ext]', context: 'data', outputPath(filename) {
              const { name, context } = this;
              const outputpath = path.join(context, filename);
              console.log(context, filename, outputpath);
              return outputpath;
            }
          }
        }
        ]
      },
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
}
