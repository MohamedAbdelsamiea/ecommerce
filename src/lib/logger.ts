type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

function sanitize(data: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = ["phone", "address", "email", "password", "token"];
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      sensitiveKeys.includes(key) ? "[REDACTED]" : value,
    ])
  );
}

function write(level: LogLevel, message: string, data?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(data ? { data: sanitize(data) } : {}),
  };

  const output = JSON.stringify(entry);

  switch (level) {
    case "error":
      console.error(output);
      break;
    case "warn":
      console.warn(output);
      break;
    default:
      console.log(output);
  }
}

export const logger = {
  info: (message: string, data?: Record<string, unknown>) => write("info", message, data),
  warn: (message: string, data?: Record<string, unknown>) => write("warn", message, data),
  error: (message: string, data?: Record<string, unknown>) => write("error", message, data),
};
