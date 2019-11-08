import Webpack from 'webpack'
import path from 'path'

export default {
  entry: './index.js',
  target: 'node',
  mode: 'production',
  output: {
    filename: 'index.js',
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.js$/u,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
        },
        exclude: [/node_modules/u, '/src/terraform/test/*.js'],
      },
    ],
  },
  plugins: [
    new Webpack.NoEmitOnErrorsPlugin(),
    new Webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    })
  ],
  resolve: {
    alias: {
      'pg-native': path.join(__dirname, 'aliases/pg-native.js'),
      'pgpass$': path.join(__dirname, 'aliases/pgpass.js')
    }
  }
}
