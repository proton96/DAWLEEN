FROM php:8.2-apache

# Habilitar módulos esenciales de Apache
RUN a2enmod rewrite headers expires

# Instalar msmtp y ca-certificates para permitir envío SMTP real con Gmail desde mail() de PHP
RUN apt-get update && \
    apt-get install -y --no-install-recommends msmtp msmtp-mta ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Configurar msmtp para Gmail SMTP (protonstoreoficial@gmail.com)
RUN printf 'defaults\n\
auth on\n\
tls on\n\
tls_trust_file /etc/ssl/certs/ca-certificates.crt\n\
logfile /var/log/msmtp.log\n\
\n\
account gmail\n\
host smtp.gmail.com\n\
port 587\n\
from protonstoreoficial@gmail.com\n\
user protonstoreoficial@gmail.com\n\
password aomywugitdfqahml\n\
\n\
account default : gmail\n' > /etc/msmtprc && \
    chown root:www-data /etc/msmtprc && \
    chmod 640 /etc/msmtprc && \
    touch /var/log/msmtp.log && \
    chown www-data:www-data /var/log/msmtp.log && \
    chmod 660 /var/log/msmtp.log

# Configuración de Apache para permitir FollowSymLinks, .htaccess y DirectoryIndex
RUN printf '<Directory /var/www/html>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
    DirectoryIndex index.php back/login.php index.html\n\
</Directory>\n' > /etc/apache2/conf-available/dawlloween.conf && \
    a2enconf dawlloween

# Configurar php.ini para sesiones, entorno web y ruta de envío sendmail a msmtp
RUN cp "$PHP_INI_DIR/php.ini-development" "$PHP_INI_DIR/php.ini" && \
    sed -i 's/session.cookie_httponly =/session.cookie_httponly = 1/' "$PHP_INI_DIR/php.ini" && \
    echo 'sendmail_path = "/usr/bin/msmtp -t -i"' > "$PHP_INI_DIR/conf.d/mail.ini"

# Directorio de trabajo
WORKDIR /var/www/html

# Copiar archivos del proyecto
COPY . /var/www/html/

# Asegurar que los enlaces simbólicos de img y music para front y back existan dentro del contenedor
RUN ln -sfn ../img /var/www/html/front/img && \
    ln -sfn ../img /var/www/html/back/img && \
    ln -sfn ../music /var/www/html/front/music && \
    ln -sfn ../music /var/www/html/back/music && \
    chown -R www-data:www-data /var/www/html

EXPOSE 80

CMD ["apache2-foreground"]
