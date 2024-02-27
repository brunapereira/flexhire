import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import {FlexhireClient} from "./flexhire.client";
import {NextFunction, Response, Request} from "express";
import {v4 as uuidv4} from "uuid";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

type WatchQueryParams = {
  apiKey: string,
}

app.get('/events/watch', async (request: Request, response: Response, next: NextFunction) => {
  const clientMutationId = uuidv4();
  console.log(`${clientMutationId} Connection started`);

  const queryParams = request.query as WatchQueryParams;
  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  });

  const newClient = {
    apiKey: queryParams.apiKey,
    clientMutationId,
    response
  };
  clients.push(newClient);

  const flexhireClient = FlexhireClient.getInstance();
  await flexhireClient.registerWebhook(queryParams.apiKey, clientMutationId);
  const profile = await flexhireClient.getProfile(queryParams.apiKey);

  response.write(`data: ${JSON.stringify(profile)}\n\n`);

  request.on('close', () => {
    console.log(`${clientMutationId} Connection closed`);
    clients = clients.filter(client => client.id !== clientMutationId);
  });
});

type WebhookQueryParams = {
  channel: string,
}

app.post('/events/webhook', async (req: any, res: any) => {
  const channel = (req.query as WebhookQueryParams).channel;

  const client = clients
    .find((client) => client.clientMutationId === channel);

  if (client) {
    const flexhireClient = FlexhireClient.getInstance();
    const profile = await flexhireClient.getProfile(client.apiKey);

    client.response.write(`data: ${JSON.stringify(profile)}\n\n`);
  }

  res.send("OK");
});


const PORT = 3001;
let clients: any[] = [];
app.listen(PORT, () => {
  console.log(`Flexhire backend started at http://localhost:${PORT}`);
});
