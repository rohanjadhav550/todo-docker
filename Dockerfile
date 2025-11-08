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

# Expose port 8083
EXPOSE 8083

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
