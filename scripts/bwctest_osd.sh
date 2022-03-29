#!/bin/bash

# Copyright OpenSearch Contributors
# SPDX-License-Identifier: Apache-2.0

set -e

# For every release, add sample data and new version below:
DEFAULT_VERSIONS=(
  "odfe-0.10.0"
  "odfe-1.0.2"
  "odfe-1.1.0"
  "odfe-1.2.1"
  "odfe-1.3.0"
  "odfe-1.4.0"
  "odfe-1.7.0"
  "odfe-1.8.0"
  "odfe-1.9.0"
  "odfe-1.11.0"
  "odfe-1.13.2"
  "osd-1.0.0"
  "osd-1.1.0"
)

# Define test groups
TEST_GROUP_1="check_loaded_data,check_timeline"
TEST_GROUP_2="$TEST_GROUP_1,check_advanced_settings"
TEST_GROUP_3="$TEST_GROUP_2,check_filter_and_query"
TEST_GROUP_4="$TEST_GROUP_3,check_default_page"
# If not defining test suite for a specific version, it will default to this group of tests
TEST_GROUP_DEFAULT="$TEST_GROUP_4"

function usage() {
    echo ""
    echo "This script is used to run backwards compatibility tests for OpenSearch Dashboards"
    echo "--------------------------------------------------------------------------"
    echo "Usage: $0 [args]"
    echo ""
    echo "Required arguments:"
    echo -e "-o OPENSEARCH\t, Specify the tested OpenSearch."
    echo -e "-d DASHBOARDS\t, Specify the tested OpenSearch Dashboards."
    echo ""
    echo "Optional arguments:"
    echo -e "-b BIND_ADDRESS\t, defaults to localhost | 127.0.0.1, can be changed to any IP or domain name for the cluster location."
    echo -e "-p BIND_PORT\t, defaults to 5601 depends on OpenSearch or Dashboards, can be changed to any port for the cluster location."
    echo -e "-s SECURITY_ENABLED\t(true | false), defaults to true. Specify the OpenSearch/Dashboards have security enabled or not."
    echo -e "-c CREDENTIAL\t(usename:password), no defaults, effective when SECURITY_ENABLED=true."
    echo -e "-v VERSIONS\t, Specify versions as a CSV to execute tests with data from specific version of OpenSearch Dashboards."
    echo -e "-r RELEASES\t, Specify versions as a CSV to execute tests for released versions of OpenSearch."
    echo -e "-h\tPrint this message."
    echo "--------------------------------------------------------------------------"
}

while getopts ":h:b:p:s:c:v:r:o:d:" arg; do
    case $arg in
        h)
            usage
            exit 1
            ;;
        b)
            BIND_ADDRESS=$OPTARG
            ;;
        p)
            BIND_PORT=$OPTARG
            ;;    
        s)
            SECURITY_ENABLED=$OPTARG
            ;;
        c)
            CREDENTIAL=$OPTARG
            ;;
        v)
            VERSIONS=$OPTARG
            ;;
        r)
            RELEASES=$OPTARG
            ;;
        o)
            OPENSEARCH=$OPTARG
            ;;    
        d)
            DASHBOARDS=$OPTARG
            ;;     
        :)
            echo "-${OPTARG} requires an argument"
            usage
            exit 1
            ;;
        ?)
            echo "Invalid option: -${OPTARG}"
            exit 1
            ;;
    esac
done

[ -z "$BIND_ADDRESS" ] && BIND_ADDRESS="localhost"
[ -z "$BIND_PORT" ] && BIND_PORT="5601"
[ -z "$VERSIONS" ] && test_array=("${DEFAULT_VERSIONS[@]}") || IFS=',' read -r -a test_array <<<"$VERSIONS"
[ -z "$SECURITY_ENABLED" ] && SECURITY_ENABLED="false"
[ $SECURITY_ENABLED == "false" ] && dashboards_type="without-security" || dashboards_type="with-security"
[ $SECURITY_ENABLED == "false" ] && releases_array=() || IFS=',' read -r -a releases_array <<<"$RELEASES"
[ -z "$CREDENTIAL" ] && CREDENTIAL="admin:admin"

TOTAL_TEST_FAILURES=0
# OpenSearch and OpenSearch Dashboards Process IDs
PARENT_PID_LIST=()
# define test path
CWD=$(pwd)
DIR="$CWD/bwc_tmp"
TEST_DIR="$DIR/test"
LOGS_DIR="$TEST_DIR/cypress/results/local-cluster-logs"
OPENSEARCH_DIR="$DIR/opensearch"
DASHBOARDS_DIR="$DIR/opensearch-dashboards"
[ ! -d "$DIR" ] && mkdir "$DIR"
[ ! -d "$TEST_DIR" ] && mkdir "$TEST_DIR"
[ -d "$OPENSEARCH_DIR" ] && rm -rf "$OPENSEARCH_DIR"
mkdir "$OPENSEARCH_DIR"
[ -d "$DASHBOARDS_DIR" ] && rm -rf "$DASHBOARDS_DIR"
mkdir "$DASHBOARDS_DIR"

function open_artifact {
  artifact_dir=$1
  artifact=$2
  cd $artifact_dir
  
  # check if artifact provided is URL or attempt if passing by absolute path
  if curl -I -L $artifact; then
    curl -L $artifact | tar -xz --strip-components=1
  else
    tar -xf $artifact --strip-components=1
  fi

}

# un-tar OpenSearch and OpenSearch Dashboards
echo "[ unzip OpenSearch and OpenSearch Dashboards ]"
echo $OPENSEARCH
open_artifact $OPENSEARCH_DIR $OPENSEARCH
open_artifact $DASHBOARDS_DIR $DASHBOARDS

# define other paths and tmp files
OPENSEARCH_FILE='opensearch.txt'
DASHBOARDS_FILE='dashboards.txt'
OPENSEARCH_PATH="$DIR/$OPENSEARCH_FILE"
DASHBOARDS_PATH="$DIR/$DASHBOARDS_FILE"
DASHBOARDS_MSG="\"state\":\"green\",\"title\":\"Green\",\"nickname\":\"Looking good\",\"icon\":\"success\""
DASHBOARDS_URL="http://$BIND_ADDRESS:$BIND_PORT/api/status"
if [ $SECURITY_ENABLED == "false" ]; 
then 
  OPENSEARCH_MSG="\"status\":\"green\""
  OPENSEARCH_URL="http://$BIND_ADDRESS:9200/_cluster/health"
  OPENSEARCH_ARGS=""
else 
  OPENSEARCH_MSG="\"status\":\"yellow\""
  OPENSEARCH_URL="https://$BIND_ADDRESS:9200/_cluster/health"
  OPENSEARCH_ARGS="-u $CREDENTIAL --insecure"
fi

# define test groups to test suites
declare -A TEST_SUITES
TEST_SUITES=(
  ["odfe-0.10.0"]=$TEST_GROUP_1 
  ["odfe-1.0.2"]=$TEST_GROUP_2 
  ["odfe-1.1.0"]=$TEST_GROUP_2
  ["odfe-1.2.1"]=$TEST_GROUP_2
  ["odfe-1.3.0"]=$TEST_GROUP_2
  ["odfe-1.4.0"]=$TEST_GROUP_3
  ["odfe-1.7.0"]=$TEST_GROUP_3
  ["odfe-1.8.0"]=$TEST_GROUP_3
  ["odfe-1.9.0"]=$TEST_GROUP_3
  ["odfe-1.11.0"]=$TEST_GROUP_3
  ["odfe-1.13.2"]=$TEST_GROUP_4
  ["osd-1.0.0"]=$TEST_GROUP_4
  ["osd-1.1.0"]=$TEST_GROUP_4
)

# remove the running opensearch process
function clean {
  echo "Attempt to Terminate Process with PID: ${PARENT_PID_LIST[*]}"
  for pid_kill in "${PARENT_PID_LIST[@]}"
  do
    echo "Closing PID $pid_kill"
    kill $pid_kill || true
  done
  PARENT_PID_LIST=()
}

function spawn_process_and_save_PID {
    echo "Spawn '$@'"
    eval $@
    curr_pid=$!
    echo "PID: $curr_pid"
    PARENT_PID_LIST+=( $curr_pid )
}

# Print out a textfile line by line
function print_txt {
  while IFS= read -r line; do
    echo "text read from $1: $line"
  done < $1
}

# this function is used to check the running status of OpenSearch or OpenSearch Dashboards
# $1 is the path to the tmp file which saves the running status 
# $2 is the error msg to check
# $3 is the url to curl
# $4 contains arguments that need to be passed to the curl command
function check_status {
  while [ ! -f $1 ] || ! grep -q "$2" $1; do 
     if [ -f $1 ]; then rm $1; fi  
     curl $3 $4 > $1 || true
  done
  rm $1
}

# this function sets up the cypress env
# it first clones the opensearch-dashboards-functional-test library
# then it removes the tests into the cypress integration folder 
# and copies the backwards compatibility tests into the folder
function setup_cypress {
  echo "[ Setup the cypress test environment ]"
  git clone --depth=1 https://github.com/opensearch-project/opensearch-dashboards-functional-test "$TEST_DIR"
  rm -rf "$TEST_DIR/cypress/integration"
  cp -r "$CWD/cypress/integration" "$TEST_DIR/cypress"
  [ ! -d "$LOGS_DIR" ] && mkdir -p "$LOGS_DIR"
  cd "$TEST_DIR"
  npm install
  echo "Cypress is ready!"
}

function run_cypress {
    [ $1 == "core" ] && is_core=true || is_core=false
    TEST_ARRAY=("$@")
    SPEC_FILES=""
    for test in "${TEST_ARRAY[@]}"
    do
      SPEC_FILES+="$TEST_DIR/cypress/integration/$dashboards_type/*$test.js,"
    done
    [ ! $is_core ] && echo "Running tests from plugins"
    [ $is_core ] && spec="$SPEC_FILES" || "$TEST_DIR/cypress/integration/$dashboards_type/plugins/*.js"
    [ $is_core ] && success_msg="BWC tests for core passed ($spec)" || success_msg="BWC tests for plugin passed ($spec)"
    [ $is_core ] && error_msg="BWC tests for core failed ($spec)" || error_msg="BWC tests for plugin failed ($spec)"
    [[ ! -z $CI ]] && cypress_args="--browser chromium --config numTestsKeptInMemory=0" || cypress_args=""
    env NO_COLOR=1 npx cypress run $cypress_args --headless --spec $spec || test_failures=$?
    [ -z $test_failures ] && test_failures=0
    [ $test_failures == 0 ] && echo $success_msg || echo "$error_msg::TEST_FAILURES: $test_failures"
    TOTAL_TEST_FAILURES=$(( $TOTAL_TEST_FAILURES + $test_failures ))
}

# this function copies the tested data for the required version to the opensearch data folder
# $1 is the required version
function upload_data {
  rm -rf "$OPENSEARCH_DIR/data"
  cd $OPENSEARCH_DIR
  cp "$CWD/cypress/test-data/$dashboards_type/$1.tar.gz" . 
  tar -xvf "$OPENSEARCH_DIR/$1.tar.gz" >> /dev/null 2>&1
  rm "$1.tar.gz"
  echo "Data has been uploaded and ready to test"
}

function setup_opensearch {
  cd "$OPENSEARCH_DIR"
  # Required for IM
  [ -d "plugins/opensearch-index-management" ] && echo "path.repo: [/tmp]" >> config/opensearch.yml
  # Required for Alerting
  [ -d "plugins/opensearch-alerting" ] && echo "plugins.destination.host.deny_list: [\"10.0.0.0/8\", \"127.0.0.1\"]" >> config/opensearch.yml
  # Required for SQL
  [ -d "plugins/opensearch-sql" ] && echo "script.context.field.max_compilations_rate: 1000/1m" >> config/opensearch.yml
  # Required for PA
  [ -d "plugins/opensearch-performance-analyzer" ] && echo "webservice-bind-host = 0.0.0.0" >> plugins/opensearch-performance-analyzer/pa_config/performance-analyzer.properties
  echo "network.host: 0.0.0.0" >> config/opensearch.yml
  echo "discovery.type: single-node" >> config/opensearch.yml
  [ $SECURITY_ENABLED == "false" ] && [ -d "plugins/opensearch-security" ] && echo "plugins.security.disabled: true" >> config/opensearch.yml
}

# Starts OpenSearch, if verifying a distribution it will install the certs then start.
function run_opensearch {
  echo "[ Attempting to start OpenSearch... ]"
  cd "$OPENSEARCH_DIR"
  spawn_process_and_save_PID "./opensearch-tar-install.sh > ${LOGS_DIR}/opensearch.log 2>&1 &"
}

function setup_dashboards {
  cd "$DASHBOARDS_DIR"
  [ $SECURITY_ENABLED == "false" ] && [ -d "plugins/securityDashboards" ] && ./bin/opensearch-dashboards-plugin remove securityDashboards
  [ $SECURITY_ENABLED == "false" ] && rm config/opensearch_dashboards.yml && touch config/opensearch_dashboards.yml
  [ $SECURITY_ENABLED == "false" ] && echo "server.host: 0.0.0.0" >> config/opensearch_dashboards.yml
  echo "csp.warnLegacyBrowsers: false" >> config/opensearch_dashboards.yml
  echo "--max-old-space-size=5120" >> config/node.options
}

# Starts OpenSearch Dashboards
function run_dashboards {
  echo "[ Attempting to start OpenSearch Dashboards... ]"
  cd "$DASHBOARDS_DIR"
  spawn_process_and_save_PID "./bin/opensearch-dashboards > ${LOGS_DIR}/opensearch_dashboards.log 2>&1 &"
}

# Checks the running status of OpenSearch
# it calls check_status and passes the OpenSearch tmp file path, error msg, url, and arguments
# if success, the while loop in the check_status will end and it prints out "OpenSearch is up!"
function check_opensearch_status {
  echo "Checking the status OpenSearch..."
  cd "$DIR"
  check_status $OPENSEARCH_PATH "$OPENSEARCH_MSG" $OPENSEARCH_URL "$OPENSEARCH_ARGS" >> /dev/null 2>&1  &
  echo "OpenSearch is up!" 
} 

# Checks the running status of OpenSearch Dashboards
# it calls check_status and passes the OpenSearch Dashboards tmp file path, error msg, url, and arguments
# if success, the while loop in the check_status will end and it prints out "OpenSearch Dashboards is up!"
function check_dashboards_status {
  echo "Checking the OpenSearch Dashboards..."
  cd "$DIR"
  check_status $DASHBOARDS_PATH "$DASHBOARDS_MSG" $DASHBOARDS_URL "" >> /dev/null 2>&1
  echo "OpenSearch Dashboards is up!"
} 

# Runs the backwards compatibility test using cypress for the required version
# $1 is the requested version 
function run_bwc {
  cd "$TEST_DIR"
  [ -z "${TEST_SUITES[$1]}" ] && test_suite=$TEST_GROUP_DEFAULT || test_suite="${TEST_SUITES[$1]}"
  IFS=',' read -r -a tests <<<"$test_suite"
  run_cypress "core" "${tests[@]}"
  # Check if $dashboards_type/plugins has tests in them to execute
  if [ "$(ls -A $TEST_DIR/cypress/integration/$dashboards_type/plugins | wc -l)" -gt 1 ]; then
    run_cypress "plugins"
  fi
}

# Main function
function execute_tests {
  setup_opensearch >> /dev/null 2>&1  &
  setup_dashboards >> /dev/null 2>&1  &

  # for each required testing version, do the following
  # first run opensearch and check the status
  # second run dashboards and check the status
  # run the backwards compatibility tests
  for version in "${test_array[@]}"
  do
    # copy and un-tar data into the OpenSearch data folder
    echo "[ Setting up the OpenSearch environment for $version ]"
    upload_data $version
    
    run_opensearch
    check_opensearch_status
    run_dashboards
    check_dashboards_status
    
    echo "[ Run the backwards compatibility tests for $version ]"
    run_bwc $version
  
    # kill the running OpenSearch process
    clean
  done  
}

# Executes the main function with different versions of OpenSearch downloaded
function execute_mismatch_tests {
  PACKAGE_VERSION=$(cat $DASHBOARDS_DIR/package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d [:space:])

  for release in "${releases_array[@]}"
  do
    echo "Running tests with OpenSearch Dashboards $PACKAGE_VERSION and OpenSearch $release"
    (
      rm -rf $OPENSEARCH_DIR && mkdir "$OPENSEARCH_DIR"
      # TODO: support multiple platforms and architectures
      cd $OPENSEARCH_DIR && curl https://artifacts.opensearch.org/releases/bundle/opensearch/$release/opensearch-$release-linux-x64.tar.gz | tar -xz --strip-components=1
    )
    execute_tests
  done
}
 
# setup the cypress test env
[ ! -d "$TEST_DIR/cypress" ] && setup_cypress
execute_tests
(( ${#releases_array[@]} )) && execute_mismatch_tests
echo "Completed BWC tests for $test_array [$dashboards_type]"
echo "Total test failures: $TOTAL_TEST_FAILURES"
exit $TOTAL_TEST_FAILURES