const HtmlWebpackPlugin = require("html-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const path = require('path');

module.exports = {
  entry: [
    __dirname + '/src/scripts/index.js'
  ],
  optimization: {
    minimizer: [new UglifyJsPlugin()]
  },
  output: {
    path: path.resolve('dist'),
    filename: 'bundle.js'
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test:/\.css$/,
        use:[
          'style-loader',
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new CompressionPlugin({
      test: /\.js(\?.*)?$/i
    }),
    new HtmlWebpackPlugin({template: __dirname + "/src/index.html"})
  ]
};
