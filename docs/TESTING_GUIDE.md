# BISIG Testing Guide

## Overview

This guide provides comprehensive information about the automated testing suite for the BISIG (Barangay Centralized Data Management System). The testing suite ensures production readiness and system reliability.

## Test Architecture

### Test Categories

1. **Unit Tests** - Test individual functions and components
2. **API Tests** - Test REST API endpoints and business logic
3. **Integration Tests** - Test complete workflows across modules
4. **End-to-End Tests** - Test user scenarios from UI to database

### Test Structure

```
src/__tests__/
├── helpers.ts              # Test utilities and factories
├── auth.test.ts            # Authentication system tests
├── residents.test.ts       # Resident management tests
├── certificates.test.ts    # Certificate system tests
├── households.test.ts      # Household management tests
├── blotter.test.ts         # Blotter/case management tests
├── integration.test.ts     # Cross-module integration tests
└── test-runner.ts          # Custom test runner with reporting
```

## Running Tests

### Quick Start

```bash
# Run all tests
npm run test:all

# Run specific test categories
npm run test:unit
npm run test:api
npm run test:integration

# Run with coverage report
npm run test:coverage

# Production readiness check
npm run test:production
```

### Individual Test Files

```bash
# Run specific test file
npm test src/__tests__/certificates.test.ts

# Run with watch mode
npm run test:watch

# Run with verbose output
npx jest --verbose
```

## Test Environment Setup

### Prerequisites

1. **Test Database**: PostgreSQL database for testing
2. **Node.js**: Version 18+ with npm/yarn
3. **Dependencies**: All dev dependencies installed

### Environment Variables

Create a `.env.test` file with:

```env
# Test Database
DATABASE_URL="postgresql://test_user:test_password@localhost:5432/bisig_test"
DIRECT_URL="postgresql://test_user:test_password@localhost:5432/bisig_test"

# NextAuth (Test)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="test-secret-key-for-testing-only"

# Test Settings
NODE_ENV="test"
TEST_MODE="true"
```

### Database Setup

```bash
# Create test database
createdb bisig_test

# Run migrations
npx prisma migrate deploy --preview-feature

# Seed test data (optional)
npx prisma db seed
```

## Test Coverage

### Current Coverage Targets

- **Overall Coverage**: ≥80%
- **Critical Modules**: ≥90%
  - Authentication
  - Certificate Management
  - Resident Management
  - Data Validation

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/lcov-report/index.html
```

## Test Modules

### 1. Authentication Tests (`auth.test.ts`)

**Coverage:**
- User registration and validation
- Password hashing and verification
- Role-based authorization
- Session management
- OAuth account linking

**Key Test Cases:**
- ✅ User creation with proper validation
- ✅ Duplicate email prevention
- ✅ Password strength requirements
- ✅ Role assignment and permissions
- ✅ Session lifecycle management

### 2. Resident Management Tests (`residents.test.ts`)

**Coverage:**
- CRUD operations for residents
- Data validation and sanitization
- Search and filtering functionality
- Household relationships
- Profile photo management

**Key Test Cases:**
- ✅ Resident registration with required fields
- ✅ Age calculation and demographics
- ✅ Search by name, address, contact
- ✅ Household assignment and statistics
- ✅ Data export functionality

### 3. Certificate System Tests (`certificates.test.ts`)

**Coverage:**
- Certificate creation and approval workflow
- Control number generation
- QR code generation and verification
- Template management
- Status tracking (PENDING → APPROVED → RELEASED)

**Key Test Cases:**
- ✅ Auto-generated control numbers
- ✅ Certificate type validation
- ✅ Approval workflow compliance
- ✅ QR code verification
- ✅ Statistics and reporting

### 4. Household Management Tests (`households.test.ts`)

**Coverage:**
- Household CRUD operations
- Address validation
- GPS coordinate handling
- Household statistics
- Member management

**Key Test Cases:**
- ✅ Complete address validation
- ✅ Household type classification
- ✅ Member statistics calculation
- ✅ Location data handling
- ✅ Household merging scenarios

### 5. Blotter System Tests (`blotter.test.ts`)

**Coverage:**
- Case filing and management
- Katarungang Pambarangay workflow
- Party management (complainant/respondent)
- Hearing scheduling
- Status tracking and reporting

**Key Test Cases:**
- ✅ Case number generation
- ✅ Complete KP workflow (FILED → RESOLVED)
- ✅ Party assignment and roles
- ✅ Filing fee management
- ✅ Hearing scheduling and outcomes

### 6. Integration Tests (`integration.test.ts`)

**Coverage:**
- Cross-module workflows
- Data integrity across relationships
- Complete user scenarios
- Performance and scalability
- System-wide statistics

**Key Test Cases:**
- ✅ Resident → Certificate → Release workflow
- ✅ Blotter case complete lifecycle
- ✅ Multi-user role interactions
- ✅ Bulk operations performance
- ✅ Data consistency validation

## Test Data Management

### Test Factories

The `helpers.ts` file provides factory functions for creating test data:

```typescript
// Create test residents
const resident = await createTestResident({
  firstName: 'Juan',
  lastName: 'Dela Cruz'
})

// Create test households
const household = await createTestHousehold({
  type: HouseholdType.SINGLE_FAMILY
})

// Create test certificates
const certificate = await createTestCertificate(resident.id)
```

### Database Cleanup

Each test suite automatically:
- Cleans up database before each test
- Isolates test data to prevent conflicts
- Maintains referential integrity
- Provides transaction rollback on failures

## Production Readiness Criteria

### Automated Checks

The test suite validates:

1. **Functionality**: All core features working correctly
2. **Data Integrity**: Proper relationships and constraints
3. **Security**: Authentication and authorization
4. **Performance**: Response times within acceptable limits
5. **Error Handling**: Graceful failure scenarios

### Success Criteria

For production deployment, the system must achieve:

- ✅ **100% Critical Test Pass Rate**
- ✅ **≥95% Overall Test Pass Rate**
- ✅ **≥80% Code Coverage**
- ✅ **All Security Tests Passing**
- ✅ **Performance Benchmarks Met**

### Production Readiness Report

The test runner generates a comprehensive report including:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "totalTests": 156,
  "totalPassed": 154,
  "totalFailed": 2,
  "overallSuccess": 98.7,
  "totalDuration": 45000,
  "isProductionReady": true,
  "suites": [
    {
      "suite": "Authentication Tests",
      "passed": 25,
      "failed": 0,
      "total": 25,
      "duration": 8500,
      "coverage": 92.5
    }
  ]
}
```

## Continuous Integration

### GitHub Actions Integration

```yaml
name: BISIG Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run test suite
        run: npm run test:production
      - name: Upload coverage
        uses: codecov/codecov-action@v1
```

### Pre-deployment Checks

Before any production deployment:

```bash
# Required: All tests must pass
npm run test:production

# Optional: Performance benchmarks
npm run test:performance

# Required: Security audit
npm audit --audit-level high
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check database status
   pg_isready -h localhost -p 5432
   
   # Restart database
   sudo service postgresql restart
   ```

2. **Test Timeout Issues**
   ```bash
   # Increase timeout in jest.config.js
   testTimeout: 30000
   ```

3. **Memory Issues**
   ```bash
   # Run with increased memory
   NODE_OPTIONS="--max_old_space_size=4096" npm test
   ```

### Debugging Tests

```bash
# Run specific test with debug output
npx jest --verbose --no-coverage src/__tests__/certificates.test.ts

# Debug with Node.js debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Run single test case
npx jest -t "should create certificate with auto-generated control number"
```

## Best Practices

### Writing Tests

1. **Use Descriptive Names**: Test names should clearly describe what is being tested
2. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and validation
3. **Test Edge Cases**: Include boundary conditions and error scenarios
4. **Mock External Dependencies**: Isolate units under test
5. **Clean Up Resources**: Ensure proper cleanup after each test

### Test Data

1. **Use Factories**: Leverage helper functions for consistent test data
2. **Minimize Test Data**: Create only what's needed for each test
3. **Avoid Hard-coded Values**: Use variables and constants
4. **Test Data Isolation**: Each test should have independent data

### Performance

1. **Parallel Execution**: Run tests in parallel when possible
2. **Database Transactions**: Use transactions for faster cleanup
3. **Selective Testing**: Run only affected tests during development
4. **Resource Management**: Monitor memory and database connections

## Reporting and Monitoring

### Test Reports

- **Console Output**: Real-time test results
- **JSON Report**: Detailed results in `test-report.json`
- **Coverage Report**: HTML coverage report in `coverage/`
- **CI/CD Integration**: Results sent to build systems

### Metrics Tracking

- Test execution time trends
- Coverage percentage over time
- Failure rate analysis
- Performance regression detection

---

## Support

For questions about testing:

1. **Documentation**: Check this guide and inline comments
2. **Code Review**: Discuss with team members
3. **Issues**: Create GitHub issues for test-related bugs
4. **Best Practices**: Follow established patterns in existing tests

---

**Last Updated**: January 2024  
**Version**: 1.0  
**Maintained By**: BISIG Development Team 