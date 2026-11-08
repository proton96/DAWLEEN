
echo "🎃 Iniciando Atlantis Town / DAWlloween..."

# Detectar si se dispone de Docker o Podman
if command -v docker &> /dev/null; then
    if docker compose version &> /dev/null; then
        echo "🐳 Usando Docker Compose..."
        docker compose up -d --build
    elif command -v docker-compose &> /dev/null; then
        echo "🐳 Usando docker-compose..."
        docker-compose up -d --build
    else
        echo "🐳 Usando Docker CLI..."
        docker build -t dawlloween:latest .
        docker stop dawlloween-server 2>/dev/null || true
        docker rm dawlloween-server 2>/dev/null || true
        docker run -d --name dawlloween-server -p 8080:80 -v "$(pwd):/var/www/html" dawlloween:latest
    fi
elif command -v podman &> /dev/null; then
    echo "🦭 Usando Podman..."
    podman build -t dawlloween:latest .
    podman stop dawlloween-server 2>/dev/null || true
    podman rm dawlloween-server 2>/dev/null || true
    podman run -d --name dawlloween-server -p 8080:80 -v "$(pwd):/var/www/html:Z" dawlloween:latest
else
    echo "❌ Error: No se encontró 'docker' ni 'podman' instalado en el sistema."
    echo "👉 Para instalar Docker en Fedora: sudo dnf install docker docker-compose"
    echo "👉 O para usar Podman: sudo dnf install podman"
    exit 1
fi

echo ""
echo "✅ Servidor activo ya puedes arrancarlo maquina!"
echo "🌐 Abre tu navegador en: http://localhost:8080"
echo "🔑 Credenciales de prueba: rock / detective123  |  bea / instituto123"
echo "🛑 Para detener el servidor ejecuta: ./docker-stop.sh"
