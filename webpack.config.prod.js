const webpack = require('webpack');
const config = require('./webpack.config.base');

config.entry = {
  main: './src',
};

config.module.rules = [
  ...config.module.rules,
  {
    test: /\.css$/,
    loader: ['style-loader',
      'css-loader?minimize&importLoaders=2&localIdentName=[name]__[local]___[hash:base64:5]']
  },

  {
    test: /\.scss$/,
    loaders: ['style-loader',
      'css-loader?minimize&importLoaders=2&localIdentName=[name]__[local]___[hash:base64:5]',
      'sass-loader']
  },
];

config.plugins = [
  ...config.plugins,
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production')
    }
  }),
  new webpack.optimize.UglifyJsPlugin({
    minimize: true,
    compress: true
  }),
  new webpack.optimize.CommonsChunkPlugin({
    names: ['manifest']
  }),
]

module.exports = config;