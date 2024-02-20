import { createLogger, transports } from "winston";
import LokiTransport from "winston-loki";


const options = {
    transports: [
      new LokiTransport({
      host:process.env.GRAFANA_LOKI_HOST as string,
      })
    ]
  };
  
export const logger = createLogger(options);