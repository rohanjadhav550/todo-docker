# Use Nginx Alpine for a lightweight image
FROM nginx:alpine

# Remove default Nginx configuration and website
RUN rm -rf /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy application files to Nginx html directory
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh

# Convert Windows line endings to Unix and make executable
RUN sed -i 's/\r$//' /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

# Expose port 8083
EXPOSE 8083

# Use entrypoint script to inject pod name and start Nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
