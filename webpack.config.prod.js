const webpack = require('webpack');
const config = require('./webpack.config.base');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

config.entry = {
  main: './src',
};

config.mode = "production";

config.module.rules = [
  ...config.module.rules,

  {
    test: /\.css$/,
    use: [
      MiniCssExtractPlugin.loader,
      {
        loader: 'css-loader',
        options: {
          importLoaders: 2
        }
      }
    ]
  },

  {
    test: /\.scss$/,
    use: [
      MiniCssExtractPlugin.loader,
      {
        loader: 'css-loader',
        options: {
          importLoaders: 2
        }
      },
      'sass-loader'
    ]
  },
];

config.optimization = {
  minimize: true,
  splitChunks: {
    name: 'manifest',
  },
};

config.plugins = [
  ...config.plugins,
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production')
    }
  }),
]

module.exports = config;
