const path = require('path');
const Css = require('mini-css-extract-plugin');
const ThreadsPlugin = require('threads-plugin');

module.exports = {
  entry: {
    main: './workers/diffWorker.ts',
  },
  mode: 'production',
  resolve: {
    extensions: ['.jsx', '.tsx', '.ts', '.scss', '.css', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'build/dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.json',
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.s?css$/,
        use: [Css.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.xml|.rjs|.java/,
        use: 'raw-loader',
      },
    ],
  },
  plugins: [
    new Css({
      filename: 'main.css',
    }),
    new ThreadsPlugin(),
  ],
};
