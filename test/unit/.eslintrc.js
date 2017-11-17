module.exports = {
  plugins: ['jest'],
  extends: ['plugin:jest/recommended', 'jwalker'],
  rules: {
    'no-console': 0
  },
  env: {
    'jest/globals': true
  }
};
