const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

const moduleFederationPlugin = withModuleFederationPlugin({

  remotes: {},

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },

});

module.exports = (config, context) => {
  const configuration = moduleFederationPlugin(config, context);
  configuration.watchOptions = {
    ...(configuration.watchOptions || {}),
    ignored: [
      '**/.tailwind/**',   // Tailwind v4 cache
      '**/.angular/**',    // Angular build cache
      '**/dist/**',        // build outputs
      '**/tmp/**',
      '**/node_modules/**'
    ]
  }

  return configuration;
}
