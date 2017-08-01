function hr {
    printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
}

g_name="genamap_production_server"
if docker ps --format "{{.Names}}" | grep -q ${g_name}; then
    hr
    echo -e "Stopping GenAMap production server container"
    hr
    docker stop ${g_name} 1>/dev/null
else
    hr
    echo -e "GenAMap production server container already exited"
    hr
fi

m_name="genamap_production_mongo"
if docker ps --format "{{.Names}}" | grep -q ${m_name}; then
    hr
    echo -e "Stopping MongoDB production container"
    hr
    docker stop ${m_name} 1>/dev/null
else
    hr
    echo -e "MongoDB production container already exited"
    hr
fi

p_name="genamap_production_postgres"
if docker ps --format "{{.Names}}" | grep -q ${p_name}; then
    hr
    echo -e "Stopping PostgreSQL production container"
    hr
    docker stop ${p_name} 1>/dev/null
else
    hr
    echo -e "PostgreSQL production container already exited"
    hr
fi
