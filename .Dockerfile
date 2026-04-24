# ================= BUILD =================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./

# Install deps
RUN npm ci --ignore-scripts

# Copy source
COPY . .

# Build production
RUN npm run build


# ================= SERVE =================
FROM nginx:1.27-alpine

# Xóa config mặc định
RUN rm /etc/nginx/conf.d/default.conf

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build từ builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 (Azure dùng port này)
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]