const config = require('./webpack.config.base');

config.entry = './src';

<<<<<<< 4372eb4e32c3652a456e6b37f77644a5c21cb812
config.watch = true;

config.watchOptions = {
  aggregateTimeout: 300,
  poll: 1000
};

=======
>>>>>>> Webpack dev and production configurations
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