import unittest
import os
import sys

def run_tests():
    """
    Discover and run all tests in the tests package
    """
    # Get the current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Add parent directory (backend) to sys.path
    parent_dir = os.path.dirname(current_dir)
    if parent_dir not in sys.path:
        sys.path.insert(0, parent_dir)
    
    # Add grandparent directory (project root) to sys.path to make 'backend' imports work
    grandparent_dir = os.path.dirname(parent_dir)
    if grandparent_dir not in sys.path:
        sys.path.insert(0, grandparent_dir)
    
    # Setup test loader
    loader = unittest.TestLoader()
    
    # Discover all tests in the current directory
    test_suite = loader.discover(current_dir, pattern="test_*.py")
    
    # Setup the test runner
    runner = unittest.TextTestRunner(verbosity=2)
    
    # Run the tests
    result = runner.run(test_suite)
    
    # Return appropriate exit code
    return 0 if result.wasSuccessful() else 1

if __name__ == "__main__":
    print("Running all tests for backend blueprints...")
    exit_code = run_tests()
    print("Tests completed.")
    sys.exit(exit_code) 