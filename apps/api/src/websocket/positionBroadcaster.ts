import { WebSocketServer, WebSocket } from 'ws';
import { query } from '../db/client.js';
import { logger } from '../utils/logger.js';
// We would import satellite.js and propagate here
import * as satellite from 'satellite.js';

export const startWebSocketServer = (port: number) => {
  const wss = new WebSocketServer({ port });
  
  wss.on('connection', (ws: WebSocket) => {
    logger.info('New WebSocket client connected');
    
    ws.on('message', (message: string) => {
      // Handle subscriptions etc
    });

    ws.on('close', () => {
      logger.info('WebSocket client disconnected');
    });
  });

  // Broadcast loop
  setInterval(async () => {
    if (wss.clients.size === 0) return;
    
    try {
      // Simplified for now - fetch all TLEs and propagate
      const res = await query('SELECT norad_id, line1, line2 FROM tle_current LIMIT 1000'); // limit to avoid overload
      
      const positions = res.rows.map(row => {
        try {
          const satrec = satellite.twoline2satrec(row.line1, row.line2);
          const positionAndVelocity = satellite.propagate(satrec, new Date());
          const positionEci = positionAndVelocity.position;
          
          if (typeof positionEci !== 'boolean' && positionEci) {
            const gmst = satellite.gstime(new Date());
            const positionGd = satellite.eciToGeodetic(positionEci, gmst);
            
            return {
              id: row.norad_id,
              lat: satellite.degreesLat(positionGd.latitude),
              lon: satellite.degreesLong(positionGd.longitude),
              alt: positionGd.height
            };
          }
        } catch (e) {
          // ignore parsing/propagation errors
        }
        return null;
      }).filter(p => p !== null);

      const payload = JSON.stringify({
        type: 'positions',
        payload: { positions }
      });

      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      });
    } catch (error) {
      logger.error('Error in WS broadcast loop:', error);
    }
  }, 1000);
  
  logger.info(`WebSocket server listening on port ${port}`);
};
