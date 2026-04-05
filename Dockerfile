FROM oven/bun:1.2-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1.2-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY scripts ./scripts
COPY package.json tsconfig.json ./
RUN bun run build

FROM alpine:3.21 AS runner
RUN addgroup -g 1001 -S civil && \
    adduser -u 1001 -S civil -G civil -h /app -s /sbin/nologin && \
    apk add --no-cache libstdc++ libgcc

WORKDIR /app
COPY --from=builder --chown=civil:civil /app/dist/civil2-db ./civil2-db
USER civil

ENV PORT=4000
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- "http://localhost:${PORT}/health" | grep -q "^ok$" || exit 1

CMD ["./civil2-db"]