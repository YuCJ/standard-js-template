const isTest = process.env.NODE_ENV === 'test'

module.exports = {
  ignore: isTest ? [] : ['**/__test__/**/*'],
  presets: ['@babel/env'],
  plugins: ['@babel/plugin-proposal-class-properties'],
}
