#!/bin/bash

# Simple Shell Script Test Suite for API Proxy
# Run this script to test the API proxy manually

echo "🔬 API Proxy Test Suite"
echo "======================="

# Configuration
PORT=${PORT:-5000}
API_BASE="http://localhost:$PORT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_test() {
    echo -e "\n🧪 ${YELLOW}Testing: $1${NC}"
}

log_success() {
    echo -e "   ✅ ${GREEN}$1${NC}"
}

log_error() {
    echo -e "   ❌ ${RED}$1${NC}"
}

log_info() {
    echo -e "   ℹ️  $1"
}

log_debug() {
    echo -e "   🐞 ${YELLOW}[DEBUG] $1${NC}"
}

# Test functions
test_server_running() {
    log_test "Server Health Check"
    log_debug "Sending GET request to $API_BASE/"
    if curl -s -f "$API_BASE/" >/dev/null 2>&1; then
        log_success "Server is responding"
        return 0
    else
        log_error "Server is not responding at $API_BASE"
        return 1
    fi
}

test_api_proxy_get() {
    log_test "API Proxy - GET Request"
    log_debug "Sending GET request to $API_BASE/api/health"
    response=$(curl -s -w "%{http_code}" "$API_BASE/api/health" 2>/dev/null || echo "000")
    status_code="${response: -3}"
    body="${response%???}"
    log_debug "Status code: $status_code"
    log_debug "Response body: ${body:0:200}"
    if [[ "$status_code" =~ ^[2-5][0-9][0-9]$ ]]; then
        log_success "GET request proxied (Status: $status_code)"
        if [[ ${#body} -gt 0 ]]; then
            log_info "Response: ${body:0:50}..."
        fi
        return 0
    else
        log_error "GET request failed (Status: $status_code)"
        return 1
    fi
}

test_api_proxy_post() {
    log_test "API Proxy - POST Request"
    log_debug "Sending POST request to $API_BASE/api/inpaint with payload: {\"prompt\": \"test\", \"image\": \"data:image/png;base64,test\"}"
    response=$(curl -s -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d '{"prompt": "test", "image": "data:image/png;base64,test"}' \
        "$API_BASE/api/inpaint" 2>/dev/null || echo "000")
    status_code="${response: -3}"
    body="${response%???}"
    log_debug "Status code: $status_code"
    log_debug "Response body: ${body:0:200}"
    if [[ "$status_code" =~ ^[2-5][0-9][0-9]$ ]]; then
        log_success "POST request proxied (Status: $status_code)"
        if [[ ${#body} -gt 0 ]]; then
            log_info "Response: ${body:0:100}..."
        fi
        return 0
    else
        log_error "POST request failed (Status: $status_code)"
        return 1
    fi
}

test_non_api_route() {
    log_test "Non-API Route"
    log_debug "Sending GET request to $API_BASE/some-other-route"
    response=$(curl -s -w "%{http_code}" "$API_BASE/some-other-route" || echo "000")
    status_code="${response: -3}"
    log_debug "Status code: $status_code"
    if [[ "$status_code" == "200" ]]; then
        log_success "Non-API route handled correctly"
        return 0
    else
        log_error "Non-API route failed (Status: $status_code)"
        return 1
    fi
}

test_large_payload() {
    log_test "Large Payload Test"
    log_debug "Generating 1MB JSON payload"
    large_data=$(printf '{"data": "%*s"}' 1048576 "" | tr ' ' 'x')
    log_debug "Sending POST request to $API_BASE/api/test with 1MB payload"
    response=$(curl -s -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$large_data" \
        "$API_BASE/api/test" || echo "000")
    status_code="${response: -3}"
    log_debug "Status code: $status_code"
    if [[ "$status_code" =~ ^[2-5][0-9][0-9]$ ]]; then
        log_success "Large payload handled (Status: $status_code)"
        return 0
    else
        log_error "Large payload failed (Status: $status_code)"
        return 1
    fi
}

test_api_key_security() {
    log_test "API Key Security Check"
    log_debug "Sending HEAD request to $API_BASE/api/health"
    response=$(curl -s -I "$API_BASE/api/health" || echo "")
    log_debug "Response headers:\n$response"
    if echo "$response" | grep -i "x-api-key" > /dev/null; then
        log_error "API key found in response headers (security issue!)"
        return 1
    else
        log_success "API key not exposed in response headers"
        return 0
    fi
}

# Performance tests
test_performance() {
    log_test "Performance Test (10 concurrent requests)"
    log_debug "Sending 10 concurrent GET requests to $API_BASE/api/health"
    for i in {1..10}; do
        curl -s "$API_BASE/api/health" > /dev/null &
        log_debug "Started request $i"
    done
    wait
    log_success "Concurrent requests completed"
}

# Main test execution
main() {
    echo "Starting tests against: $API_BASE"
    echo "Make sure your server is running with: npm run dev:api"
    echo ""
    log_debug "PORT=$PORT"
    log_debug "API_BASE=$API_BASE"
    # Check if server is running
    if ! test_server_running; then
        echo ""
        echo "❌ Server is not running. Please start it first:"
        echo "   npm run dev:api"
        exit 1
    fi

    # Run all tests
    tests_passed=0
    total_tests=0

    for test_func in test_api_proxy_get test_api_proxy_post test_non_api_route test_large_payload test_api_key_security test_performance; do
        ((total_tests++))
        log_debug "Running $test_func"
        if $test_func; then
            ((tests_passed++))
        fi
    done

    # Summary
    echo ""
    echo "📊 Test Results Summary"
    echo "======================"
    echo "✅ Passed: $tests_passed/$total_tests"
    echo "❌ Failed: $((total_tests - tests_passed))/$total_tests"

    if [[ $tests_passed -eq $total_tests ]]; then
        echo -e "\n🎉 ${GREEN}All tests passed!${NC}"
        exit 0
    else
        echo -e "\n💥 ${RED}Some tests failed!${NC}"
        exit 1
    fi
}

# Help function
show_help() {
    echo "API Proxy Test Suite"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -p, --port     Set custom port (default: 5000)"
    echo ""
    echo "Examples:"
    echo "  $0                 # Run all tests on default port"
    echo "  $0 -p 3000         # Run tests on port 3000"
    echo ""
    echo "Make sure to start your server first:"
    echo "  npm run dev:api"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -p|--port)
            PORT="$2"
            API_BASE="http://localhost:$PORT"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Run main function
main
