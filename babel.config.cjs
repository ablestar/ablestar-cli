module.exports = {
  env: {
      test: {
          presets: [
              [
                  '@babel/preset-env',
                  {
                      modules: 'commonjs',
                      debug: false
                  }
              ],
          ],
          plugins: [
              '@babel/plugin-syntax-dynamic-import',
              '@babel/plugin-proposal-class-properties',
              ["babel-plugin-transform-import-meta", { "module": "ES6" }]
          ]
      },
  }
};