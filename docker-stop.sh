
echo "🛑 Deteniendo contenedor de Atlantis Town..."

if command -v docker &> /dev/null; then
    if docker compose version &> /dev/null; then
        docker compose down
    elif command -v docker-compose &> /dev/null; then
        docker-compose down
    else
        docker stop dawlloween-server 2>/dev/null || true
        docker rm dawlloween-server 2>/dev/null || true
    fi
elif command -v podman &> /dev/null; then
    podman stop dawlloween-server 2>/dev/null || true
    podman rm dawlloween-server 2>/dev/null || true
fi

echo "✅ Contenedor detenido correctamente."
