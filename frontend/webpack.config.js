const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Adiciona configuração para o sql.js
  config.resolve.alias = {
    ...config.resolve.alias,
    'sql.js': 'sql.js/dist/sql-wasm.js'
  };

  return config;
}; 