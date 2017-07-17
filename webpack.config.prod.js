const webpack = require('webpack');
const config = require('./webpack.config.base');

config.entry = {
  main: './src',
  vendor: [
    'jquery',
    'react',
    'react-dom',
    'react-redux',
    'redux'
  ]
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
  new webpack.optimize.CommonsChunkPlugin({
    names: ['vendor', 'manifest']
  }),
]

module.exports = config;