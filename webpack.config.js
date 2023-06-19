const path = require('path');

module.exports = {
  entry: './index.js',
  output: {
    filename: 'core.retusa.min.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: "umd" || 'commonjs',
    globalObject: "this"
  },
  devtool: "source-map",
  mode: "production" || "development"
};
