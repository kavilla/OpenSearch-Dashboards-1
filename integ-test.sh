#!/bin/bash

set -e

VERSION=1.2
PLUGIN_VERSION=1.2.0.0
OSD=https://artifacts.opensearch.org/releases/bundle/opensearch-dashboards/1.2.0/opensearch-dashboards-1.2.0-linux-x64.tar.gz
OS=https://ci.opensearch.org/ci/dbc/distribution-build-opensearch/1.2.4/644/linux/x64/dist/opensearch/opensearch-1.2.4-linux-x64.tar.gz

git checkout $VERSION
rm -rf integ_tmp
mkdir integ_tmp
(
    cd integ_tmp
    mkdir opensearch
    (
        cd opensearch && wget -c $OS -O - | tar -xz --strip-components=1
        echo "Starting OpenSearch and waiting to start..."
        ./bin/opensearch-tar-install.sh >> /dev/null 2>&1 &
        sleep 45
    )

    mkdir opensearch-dashboards
    (
        cd opensearch-dashboards && wget -c $OSD -O - | tar -xz --strip-components=1
        echo "Starting OpenSearch Dashboards..."
        ./bin/opensearch-dashboards >> /dev/null 2>&1 &
    )    
)

SECURITY_ENABLED="true"
BIND_ADDRESS="localhost"
BIND_PORT="5601"
(
    PLUGIN_NAME=alerting-dashboards-plugin
    mkdir -p integ_tmp/results/$PLUGIN_NAME
    touch integ_tmp/results/$PLUGIN_NAME/security.txt
    cd plugins
    rm -rf $PLUGIN_NAME
    git clone https://github.com/opensearch-project/$PLUGIN_NAME --branch=$PLUGIN_VERSION
    cd ..
    yarn osd bootstrap
    cd plugins/$PLUGIN_NAME
    cypress run --env security_enabled=$SECURITY_ENABLED opensearch_dashboards=${BIND_ADDRESS}:${BIND_PORT} #>../../integ_tmp/results/$PLUGIN_NAME/security.txt
    cd ..
    rm -rf $PLUGIN_NAME
)

  echo "Closing the running OpenSearch"
  process=($(ps -ef | grep "Dopensearch" | awk '{print $2}'))
  kill ${process[0]}
  echo "Closing any usage on port $BIND_PORT"
  process=($(lsof -i -P -n | grep $BIND_PORT | awk '{print $2}'))
  kill ${process[0]}