# Backend Test Suite

This directory contains unit tests for all backend blueprints in the Asadel Technologies CCTV System.

## Test Structure

The test suite is organized by blueprint, with each blueprint having its own test file:

- `test_areas.py` - Tests for the areas/regions blueprint
- `test_auth.py` - Tests for authentication endpoints
- `test_cameras.py` - Tests for camera management endpoints
- `test_dashboard.py` - Tests for dashboard and monitoring features
- `test_settings.py` - Tests for user and system settings
- `test_users.py` - Tests for user management endpoints

## Running Tests

To run all tests:

```
cd backend
python tests/run_tests.py
```

To run a specific test file:

```
cd backend
python -m unittest tests/test_areas.py
```

To run a specific test case:

```
cd backend
python -m unittest tests.test_areas.TestAreasBlueprint.test_get_regions
```

## Dependencies

The tests require the following dependencies:

- Flask
- PyJWT
- bcrypt
- flask-cors

For `test_dashboard.py`, additional dependencies are mocked:
- ultralytics
- yt_dlp

## Common Issues and Fixes

### Module Not Found Errors

If you encounter "ModuleNotFoundError: No module named 'backend'", make sure you're running the tests from the correct directory (the parent directory of 'backend'). The test runner adds the project root to the Python path.

### Authentication Issues

Most blueprints use the `token_required` decorator for authentication. In tests, this is mocked to bypass actual token validation. The `AuthenticatedClient` class is used to automatically add auth headers to requests.

### Request Context Issues

For tests that need to access Flask's `request` object, use `app.test_request_context()` to create a request context. Example:

```python
with self.app.test_request_context('/api/some-endpoint'):
    # Test code here
```

### JSON Serialization Errors

When mocking database responses, make sure datetime objects are properly formatted for JSON serialization:

```python
# Bad - will cause serialization error
created_at = datetime.now()

# Good - properly formatted for serialization
created_at = datetime.now().strftime('%Y-%m-%d')
```

### Form vs JSON Data

Some endpoints expect form data while others expect JSON. Make sure to use the correct format in tests:

```python
# For JSON endpoints
response = self.client.post('/api/endpoint', json=data)

# For form data endpoints
response = self.client.post('/api/endpoint', data=data)
```

## Mocking Strategy

The tests use unittest.mock to mock:

1. Database connections
2. External services
3. Authentication decorators
4. Modules with complex dependencies

## Adding New Tests

When adding new tests, follow these patterns:

1. Use the same class structure as existing tests
2. Mock the database connection with `@patch('backend.blueprints.*.routes.get_db_connection')`
3. Include appropriate assertions for both success and error cases
4. Handle date/time objects properly
5. Clean up resources in tearDown methods

## Testing Strategy

These tests focus on API contracts and response formats rather than database interactions. All database calls are mocked to ensure fast, reliable tests without actual database dependencies. 