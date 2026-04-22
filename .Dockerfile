# ============================================================
# Stage 1: Build — Install dependencies & build production bundle
# ============================================================
FROM node:22-alpine AS builder

# Build-time arguments for environment variables
ARG VITE_API_BASE_URL=http://localhost:8080
ARG VITE_GOOGLE_CLIENT_ID

# Set working directory
WORKDIR /app

# Copy dependency manifests first (layer caching optimization)
COPY package.json package-lock.json ./

# Install dependencies (ci = clean install, faster & deterministic)
RUN npm ci --ignore-scripts

# Copy source code & config files
COPY . .

# Set environment variables for the build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Build production bundle
RUN npm run build

# ============================================================
# Stage 2: Serve — Lightweight Nginx to serve static files
# ============================================================
FROM nginx:1.27-alpine AS production

# Install openssl for self-signed certificates
RUN apk add --no-cache openssl

# Add non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Generate a self-signed certificate
RUN mkdir -p /etc/nginx/ssl && \
    openssl req -new -newkey rsa:2048 -days 365 -nodes -x509 \
      -keyout /etc/nginx/ssl/nginx-selfsigned.key \
      -out /etc/nginx/ssl/nginx-selfsigned.crt \
      -subj "/C=VN/ST=Hanoi/L=Hanoi/O=FirstDemo/CN=localhost"

# Remove default Nginx config and static files
RUN rm -rf /usr/share/nginx/html/* && \
    rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Fix permissions for non-root user
RUN chown -R appuser:appgroup /usr/share/nginx/html && \
    chown -R appuser:appgroup /var/cache/nginx && \
    chown -R appuser:appgroup /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appgroup /var/run/nginx.pid && \
    chown -R appuser:appgroup /etc/nginx/ssl

# Switch to non-root user
USER appuser

# Expose port 80 and 443
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider --no-check-certificate https://localhost:443/ || wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
