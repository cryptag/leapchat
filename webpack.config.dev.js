const config = require('./webpack.config.base');

config.entry = './src';

config.module.rules = [
  ...config.module.rules,
  {
    test: /\.css$/,
    loader: ['style-loader',
      'css-loader?sourceMap&importLoaders=2&localIdentName=[name]__[local]___[hash:base64:5]']
  },

  {
    test: /\.scss$/,
    loaders: ['style-loader',
      'css-loader?sourceMap&importLoaders=2&localIdentName=[name]__[local]___[hash:base64:5]',
      'sass-loader?sourceMap']
  },
];

config.devtool = 'source-map';

module.exports = config;