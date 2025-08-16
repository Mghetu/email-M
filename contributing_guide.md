# 🤝 Contributing to Email Editor

Thank you for your interest in contributing to the GrapesJS MJML Email Editor! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Release Process](#release-process)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

## 🚀 Getting Started

### Ways to Contribute

- **Bug Reports**: Help us identify and fix issues
- **Feature Requests**: Suggest new features or improvements
- **Code Contributions**: Submit bug fixes or new features
- **Documentation**: Improve or add documentation
- **Testing**: Help test new features and report issues
- **Design**: Contribute UI/UX improvements

### Before You Start

1. Check existing [issues](https://github.com/your-username/email-editor-grapesjs/issues) and [pull requests](https://github.com/your-username/email-editor-grapesjs/pulls)
2. For major changes, open an issue first to discuss the proposed changes
3. Read through this contributing guide
4. Ensure you understand our coding standards

## 🛠️ Development Setup

### Prerequisites

- Node.js 16 or higher
- npm 7 or higher
- Git

### Setup Instructions

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork locally
git clone https://github.com/your-username/email-editor-grapesjs.git
cd email-editor-grapesjs

# 3. Add the original repository as upstream
git remote add upstream https://github.com/original-username/email-editor-grapesjs.git

# 4. Install dependencies
npm install

# 5. Start development server
npm run dev

# 6. Run tests to ensure everything works
npm test
```

### Project Structure

```
src/
├── components/          # React components
├── plugins/            # GrapesJS plugins
├── store/              # State management
├── utils/              # Utility functions
├── styles/             # CSS/SCSS files
└── templates/          # Email templates

tests/
├── unit/               # Unit tests
├── integration/        # Integration tests
└── fixtures/           # Test data

docs/                   # Documentation
config/                 # Build configuration
scripts/                # Build and deployment scripts
```

## 📝 Contributing Guidelines

### Issue Guidelines

#### Bug Reports

When reporting bugs, please include:

```markdown
**Bug Description**
A clear and concise description of what the bug is.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
A clear description of what you expected to happen.

**Actual Behavior**
A clear description of what actually happened.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment**
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 22]
- Device: [e.g. iPhone6, Desktop]

**Additional Context**
Add any other context about the problem here.
```

#### Feature Requests

When requesting features, please include:

```markdown
**Feature Description**
A clear and concise description of what you want to happen.

**Problem/Use Case**
Describe the problem this feature would solve or the use case it addresses.

**Proposed Solution**
Describe the solution you'd like to see implemented.

**Alternatives Considered**
Describe any alternative solutions or features you've considered.

**Additional Context**
Add any other context, mockups, or examples about the feature request.
```

### Commit Message Format

We follow the [Conventional Commits](https://conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

#### Examples

```bash
feat(editor): add auto-save functionality
fix(validation): resolve MJML component validation error
docs(readme): update installation instructions
style(components): fix eslint warnings
refactor(utils): simplify storage manager implementation
perf(worker): optimize MJML compilation performance
test(editor): add unit tests for template management
chore(deps): update dependencies to latest versions
```

### Branch Naming

Use descriptive branch names:

```bash
# Feature branches
feature/auto-save-templates
feature/mobile-responsive-editor

# Bug fix branches
fix/validation-error-handling
fix/memory-leak-in-worker

# Documentation branches
docs/contributing-guide
docs/api-documentation

# Chore branches
chore/update-dependencies
chore/improve-build-process
```

## 🔄 Pull Request Process

### Before Submitting

1. **Ensure your code follows our coding standards**
2. **Add or update tests** for your changes
3. **Update documentation** if necessary
4. **Run the full test suite** and ensure all tests pass
5. **Test your changes** in different browsers and devices
6. **Keep your pull request focused** on a single feature or fix

### Pull Request Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] This change requires a documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing completed

## Screenshots (if applicable)
Add screenshots of UI changes.

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

### Review Process

1. **Automated Checks**: All PRs must pass automated tests and linting
2. **Code Review**: At least one maintainer will review your PR
3. **Testing**: Changes will be tested across different environments
4. **Documentation**: Documentation updates will be reviewed
5. **Merge**: Once approved, your PR will be merged

## 🎨 Coding Standards

### JavaScript

We use ESLint and Prettier for code formatting:

```bash
# Run linting
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Format code
npm run format
```

#### Key Standards

- Use modern ES6+ syntax
- Prefer `const` over `let`, avoid `var`
- Use arrow functions for callbacks
- Use template literals for string interpolation
- Use destructuring when appropriate
- Keep functions small and focused
- Use meaningful variable names
- Add JSDoc comments for complex functions

#### Example

```javascript
/**
 * Validates MJML template content
 * @param {string} mjmlContent - The MJML content to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result with errors and warnings
 */
const validateTemplate = (mjmlContent, options = {}) => {
  const { strict = false, maxSize = 1000000 } = options;
  const errors = [];
  const warnings = [];

  // Validation logic here
  if (!mjmlContent || typeof mjmlContent !== 'string') {
    errors.push('MJML content must be a non-empty string');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};
```

### CSS

- Use CSS custom properties (variables) for theming
- Follow BEM methodology for class naming
- Use semantic class names
- Avoid deeply nested selectors
- Use Flexbox and Grid for layouts
- Ensure responsive design

#### Example

```css
/* Component: Button */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2) var(--spacing-4);
  border: 1px solid transparent;
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn--primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: var(--white);
}

.btn--primary:hover {
  background-color: var(--primary-dark);
  border-color: var(--primary-dark);
}
```

## 🧪 Testing Guidelines

### Test Structure

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test component interactions
- **Performance Tests**: Test performance metrics
- **End-to-End Tests**: Test complete user workflows

### Writing Tests

```javascript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { EmailEditor } from '../src/components/EmailEditor';

describe('EmailEditor', () => {
  let editor;

  beforeEach(() => {
    editor = new EmailEditor('#test-container');
  });

  afterEach(() => {
    editor.destroy();
  });

  describe('Template Management', () => {
    it('should save template successfully', async () => {
      const templateData = {
        name: 'Test Template',
        mjml: '<mjml><mj-body></mj-body></mjml>'
      };

      const result = await editor.saveTemplate(templateData);

      expect(result.success).toBe(true);
      expect(result.template.id).toBeDefined();
    });

    it('should validate template before saving', async () => {
      const invalidTemplate = {
        name: 'Invalid Template',
        mjml: '<invalid>content</invalid>'
      };

      const result = await editor.saveTemplate(invalidTemplate);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
    });
  });
});
```

### Test Coverage

- Maintain **>90% test coverage**
- Cover edge cases and error conditions
- Test both happy path and error scenarios
- Include performance tests for critical paths

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- editor.test.js
```

## 📚 Documentation

### Code Documentation

- Use JSDoc comments for all public functions
- Include parameter types and return values
- Provide examples for complex functions
- Document any side effects or dependencies

### API Documentation

- Update API documentation for any changes
- Include request/response examples
- Document error codes and messages
- Provide SDK examples in multiple languages

### User Documentation

- Update user guides for new features
- Include screenshots and step-by-step instructions
- Provide troubleshooting information
- Keep examples up to date

## 🚢 Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

### Release Checklist

1. **Update version** in `package.json`
2. **Update CHANGELOG.md** with release notes
3. **Run full test suite** and ensure all tests pass
4. **Create release tag** following format `v2.1.0`
5. **Build and test** production build
6. **Create GitHub release** with release notes
7. **Deploy to production** environment

### Changelog Format

```markdown
## [2.1.0] - 2024-03-15

### Added
- Auto-save functionality for templates
- Mobile responsive editor interface
- New MJML component blocks

### Changed
- Improved performance of MJML compilation
- Updated UI design for better user experience

### Fixed
- Memory leak in Web Worker
- Validation error handling
- Cross-browser compatibility issues

### Deprecated
- Legacy template format (will be removed in v3.0.0)

### Security
- Updated dependencies to fix security vulnerabilities
```

## ❓ Getting Help

### Channels

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For general questions and discussions
- **Email**: technical-support@your-domain.com
- **Documentation**: [docs.your-domain.com](https://docs.your-domain.com)

### Response Times

- **Bug Reports**: 2-3 business days
- **Feature Requests**: 1 week
- **Pull Reviews**: 3-5 business days
- **Security Issues**: 24 hours

## 🏆 Recognition

Contributors will be recognized in:

- **README.md** contributors section
- **CHANGELOG.md** for significant contributions
- **GitHub releases** for major contributions
- **Project website** hall of fame

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

**Thank you for contributing to the Email Editor project! 🎉**

Every contribution, no matter how small, helps make this project better for everyone.