module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        // Target browsers for production
        targets: {
          browsers: [
            '> 1%',
            'last 2 versions',
            'not dead',
            'not ie 11'
          ]
        },
        
        // Use built-ins for polyfills
        useBuiltIns: 'usage',
        corejs: {
          version: 3,
          proposals: true
        },
        
        // Module transformation
        modules: false, // Let webpack handle modules
        
        // Debug output
        debug: process.env.NODE_ENV === 'development',
        
        // Loose mode for smaller output
        loose: true,
        
        // Exclude transforms that are already handled by modern browsers
        exclude: [
          'transform-typeof-symbol'
        ]
      }
    ]
  ],
  
  plugins: [
    // Syntax plugins
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    
    // Transform plugins
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-private-methods',
    '@babel/plugin-proposal-private-property-in-object',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-logical-assignment-operators',
    
    // Object and array optimizations
    '@babel/plugin-transform-object-assign',
    
    // Runtime helpers
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: false,
        helpers: true,
        regenerator: true,
        useESModules: false,
        absoluteRuntime: false
      }
    ]
  ],
  
  // Environment-specific configuration
  env: {
    development: {
      plugins: [
        // Development-only plugins
      ],
      
      // Source maps
      sourceMaps: true,
      retainLines: true
    },
    
    production: {
      plugins: [
        // Production optimizations
        '@babel/plugin-transform-react-constant-elements',
        '@babel/plugin-transform-react-inline-elements',
        
        // Remove development code
        [
          'babel-plugin-transform-remove-console',
          {
            exclude: ['error', 'warn']
          }
        ]
      ],
      
      // Minification helpers
      minified: false, // Let webpack handle minification
      comments: false
    },
    
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current'
            },
            modules: 'commonjs'
          }
        ]
      ],
      
      plugins: [
        // Test-specific plugins
        '@babel/plugin-transform-modules-commonjs'
      ]
    }
  },
  
  // Ignore patterns
  ignore: [
    'node_modules/**',
    'dist/**',
    'coverage/**'
  ],
  
  // Source type
  sourceType: 'module',
  
  // Parser options
  parserOpts: {
    strictMode: true,
    allowImportExportEverywhere: false,
    allowReturnOutsideFunction: false
  },
  
  // Generator options
  generatorOpts: {
    minified: false,
    comments: true,
    compact: 'auto'
  }
};