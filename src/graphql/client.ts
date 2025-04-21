// src/graphql/client.ts
import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
// 1️⃣ import the new link and factory
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

// Get environment variables or use hardcoded values as fallback
const GRAPHQL_HTTP = process.env.REACT_APP_GRAPHQL_HTTP || 'https://qzdu2mazrzfr3pvzuv6z5txkji.appsync-api.us-east-1.amazonaws.com/graphql';
const GRAPHQL_WS = process.env.REACT_APP_GRAPHQL_WS || 'wss://qzdu2mazrzfr3pvzuv6z5txkji.appsync-realtime-api.us-east-1.amazonaws.com/graphql';
const API_KEY = process.env.REACT_APP_API_KEY || 'da2-rfoyixwcavdyxoivvmgh4h2qfu';

console.log('GraphQL HTTP URL:', GRAPHQL_HTTP);
console.log('GraphQL WS URL:', GRAPHQL_WS);
console.log('API Key:', API_KEY);

const httpLink = new HttpLink({
  uri: GRAPHQL_HTTP,
  headers: { 'x-api-key': API_KEY },
});

// 2️⃣ construct the WS link with graphql‑ws
const wsLink = new GraphQLWsLink(
  createClient({
    url: GRAPHQL_WS,
    connectionParams: {
      'x-api-key': API_KEY,
    },
    // optional: reconnect logic
    webSocketImpl: WebSocket,
  })
);

// 3️⃣ split between queries/mutations (http) and subscriptions (ws)
const splitLink = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return def.kind === 'OperationDefinition' && def.operation === 'subscription';
  },
  wsLink,
  httpLink
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});