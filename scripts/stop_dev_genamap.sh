function hr {
    printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
}

g_name="genamap_development_server"
if docker ps --format "{{.Names}}" | grep -q ${g_name}; then
    hr
    echo -e "Stopping GenAMap development server container"
    hr
    docker stop ${g_name} 1>/dev/null
else
    hr
    echo -e "GenAMap development server container already exited"
    hr
fi

m_name="genamap_mongo"
if docker ps --format "{{.Names}}" | grep -q ${m_name}; then
    hr
    echo -e "Stopping MongoDB container"
    hr
    docker stop ${m_name} 1>/dev/null
else
    hr
    echo -e "MongoDB container already exited"
    hr
fi

p_name="genamap_postgres"
if docker ps --format "{{.Names}}" | grep -q ${p_name}; then
    hr
    echo -e "Stopping PostgreSQL container"
    hr
    docker stop ${p_name} 1>/dev/null
else
    hr
    echo -e "PostgreSQL container already exited"
    hr
fi
