// MJML Web Worker for background compilation
// This runs in a separate thread to avoid blocking the main UI

// Import MJML browser library
importScripts('https://cdn.jsdelivr.net/npm/mjml-browser@4.15.3/lib/mjml-browser.min.js');

// Performance tracking
const performanceMetrics = {
  compilationsCount: 0,
  totalCompileTime: 0,
  averageCompileTime: 0,
  errors: 0
};

// Compilation options
const defaultOptions = {
  validationLevel: 'soft',
  minify: true,
  beautify: false,
  fonts: {
    'Open Sans': 'https://fonts.googleapis.com/css?family=Open+Sans:300,400,500,700',
    'Roboto': 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700'
  }
};

// Main message handler
self.onmessage = function(event) {
  const { type, data, id } = event.data;
  
  try {
    switch (type) {
      case 'COMPILE_MJML':
        handleMjmlCompilation(data, id);
        break;
        
      case 'VALIDATE_MJML':
        handleMjmlValidation(data, id);
        break;
        
      case 'GET_METRICS':
        self.postMessage({
          type: 'METRICS_RESPONSE',
          data: performanceMetrics,
          id
        });
        break;
        
      case 'RESET_METRICS':
        resetMetrics();
        self.postMessage({
          type: 'METRICS_RESET',
          id
        });
        break;
        
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: {
        message: error.message,
        stack: error.stack
      },
      id
    });
  }
};

// Handle MJML compilation
function handleMjmlCompilation(data, id) {
  const startTime = performance.now();
  const { mjml, options = {} } = data;
  
  if (!mjml || typeof mjml !== 'string') {
    throw new Error('Invalid MJML content provided');
  }
  
  try {
    // Validate MJML structure before compilation
    const validation = validateMjmlStructure(mjml);
    if (!validation.isValid) {
      self.postMessage({
        type: 'COMPILATION_ERROR',
        error: {
          message: 'MJML validation failed',
          details: validation.errors
        },
        id
      });
      return;
    }
    
    // Compile MJML to HTML
    const compilationOptions = { ...defaultOptions, ...options };
    const result = mjml2html(mjml, compilationOptions);
    
    const endTime = performance.now();
    const compileTime = endTime - startTime;
    
    // Update performance metrics
    updatePerformanceMetrics(compileTime, result.errors.length > 0);
    
    // Send successful compilation result
    self.postMessage({
      type: 'COMPILATION_SUCCESS',
      data: {
        html: result.html,
        errors: result.errors,
        warnings: result.warnings || [],
        compileTime,
        mjmlSize: mjml.length,
        htmlSize: result.html.length
      },
      id
    });
    
  } catch (error) {
    const endTime = performance.now();
    const compileTime = endTime - startTime;
    
    updatePerformanceMetrics(compileTime, true);
    
    self.postMessage({
      type: 'COMPILATION_ERROR',
      error: {
        message: error.message,
        stack: error.stack,
        compileTime
      },
      id
    });
  }
}

// Handle MJML validation only
function handleMjmlValidation(data, id) {
  const { mjml } = data;
  
  if (!mjml || typeof mjml !== 'string') {
    throw new Error('Invalid MJML content provided for validation');
  }
  
  try {
    const validation = validateMjmlStructure(mjml);
    
    // Additional MJML-specific validation
    const mjmlValidation = mjml2html(mjml, { 
      validationLevel: 'strict',
      minify: false 
    });
    
    self.postMessage({
      type: 'VALIDATION_RESULT',
      data: {
        isValid: validation.isValid && mjmlValidation.errors.length === 0,
        errors: [...validation.errors, ...mjmlValidation.errors],
        warnings: mjmlValidation.warnings || [],
        structure: validation.structure
      },
      id
    });
    
  } catch (error) {
    self.postMessage({
      type: 'VALIDATION_ERROR',
      error: {
        message: error.message,
        stack: error.stack
      },
      id
    });
  }
}

// Basic MJML structure validation
function validateMjmlStructure(mjml) {
  const errors = [];
  const warnings = [];
  const structure = {
    hasHead: false,
    hasBody: false,
    componentCount: 0
  };
  
  // Check for required MJML wrapper
  if (!mjml.includes('<mjml>') || !mjml.includes('</mjml>')) {
    errors.push('Missing required <mjml> wrapper element');
  }
  
  // Check for mj-head
  structure.hasHead = mjml.includes('<mj-head>');
  
  // Check for required mj-body
  if (!mjml.includes('<mj-body>') || !mjml.includes('</mj-body>')) {
    errors.push('Missing required <mj-body> element');
  } else {
    structure.hasBody = true;
  }
  
  // Count components
  const componentMatches = mjml.match(/<mj-[^>]+>/g);
  structure.componentCount = componentMatches ? componentMatches.length : 0;
  
  // Check for common issues
  if (mjml.includes('<div>') || mjml.includes('<span>')) {
    warnings.push('HTML elements detected - consider using MJML components for better email compatibility');
  }
  
  if (structure.componentCount === 0) {
    warnings.push('No MJML components found - template may be empty');
  }
  
  // Check for nested structure
  if (structure.hasBody && !mjml.includes('<mj-section>')) {
    warnings.push('No mj-section found - consider adding sections for better layout structure');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    structure
  };
}

// Update performance metrics
function updatePerformanceMetrics(compileTime, hasErrors) {
  performanceMetrics.compilationsCount++;
  performanceMetrics.totalCompileTime += compileTime;
  performanceMetrics.averageCompileTime = performanceMetrics.totalCompileTime / performanceMetrics.compilationsCount;
  
  if (hasErrors) {
    performanceMetrics.errors++;
  }
}

// Reset performance metrics
function resetMetrics() {
  performanceMetrics.compilationsCount = 0;
  performanceMetrics.totalCompileTime = 0;
  performanceMetrics.averageCompileTime = 0;
  performanceMetrics.errors = 0;
}

// Log worker initialization
console.log('MJML Worker initialized successfully');

// Send ready signal
self.postMessage({
  type: 'WORKER_READY',
  data: {
    timestamp: Date.now(),
    capabilities: ['compile', 'validate', 'metrics']
  }
});