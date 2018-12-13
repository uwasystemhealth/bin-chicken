var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin')
var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
var VueLoader = require('vue-loader');

function resolve (dir) {
  return path.join(__dirname, dir)
}
console.log(resolve('src/client'));

module.exports = {
  mode: 'development',
  entry: {
    app: './src/client/main.js',
  },
  output: {
    path: resolve('/'),
    filename: '[name].js',
    publicPath: '/js/',
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src/client'),
    }
  },
  // cheap-module-eval-source-map is faster for development
  devtool: '#cheap-module-eval-source-map',
  plugins: [
    // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: './src/common/index.html',
      template: './src/common/index.html',
      inject: true
    }),
    new FriendlyErrorsPlugin(),
    new VueLoader.VueLoaderPlugin(),
  ],
  module: {
    rules: [
      /*{
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
      },*/
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {}
      },
      {
        test: /\.css$/,
        loader: 'css-loader',
        options: {}
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
        }
      }
    ]
  },
};
