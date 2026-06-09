FROM alpine
WORKDIR /app
COPY . .
RUN ls -la
