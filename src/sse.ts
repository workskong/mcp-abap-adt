import { Request, Response } from 'express';

type Client = {
  id: string;
  res: Response;
  subs: Set<string>;
};

const clients = new Map<string, Client>();
let pingInterval: NodeJS.Timeout | null = null;

function startPing() {
  if (pingInterval) return;
  pingInterval = setInterval(() => {
    clients.forEach((client) => {
      try {
        client.res.write(': ping\n\n');
      } catch (e) {
        // ignore
      }
    });
  }, 20000);
}

function stopPing() {
  if (pingInterval) {
    clearInterval(pingInterval as NodeJS.Timeout);
    pingInterval = null;
  }
}

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

export function sseHandler(req: Request, res: Response) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // initial comment
  res.write(': connected\n\n');

  const id = makeId();
  const subsParam = req.query?.subscribe;
  const subs = new Set<string>();
  if (typeof subsParam === 'string') {
    subsParam.split(',').map(s => s.trim()).filter(Boolean).forEach(s => subs.add(s));
  }

  const client: Client = { id, res, subs };
  clients.set(id, client);
  startPing();

  const cleanup = () => {
    clients.delete(id);
    if (clients.size === 0) stopPing();
  };

  res.on('close', cleanup);
  res.on('finish', cleanup);
}

export function sendSseEvent(event: string, data: any, topic?: string) {
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  clients.forEach((client) => {
    try {
      if (client.subs.size > 0 && topic) {
        if (!client.subs.has(topic)) return;
      }
      client.res.write(`event: ${event}\n`);
      for (const line of payload.split('\n')) {
        client.res.write(`data: ${line}\n`);
      }
      client.res.write('\n');
    } catch (e) {
      // ignore
    }
  });
}

export function getConnectedCount() {
  return clients.size;
}
