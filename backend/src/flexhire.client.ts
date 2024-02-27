import {ClientError, gql, GraphQLClient} from "graphql-request";

export class FlexhireClient {
  private static instance: FlexhireClient;

  static getInstance(): FlexhireClient {
    if (!this.instance) {
      this.instance = new this();
    }

    return this.instance;
  }

  public async getProfile(apiKey: string) {
    const client = new GraphQLClient('https://flexhire.com/api/v2', {
      headers: () => ({'FLEXHIRE-API-KEY': apiKey}),
    });

    const query = gql`
      {
        currentUser {
          profile {
            freelancerType {
              name
            }
          }
          name
          avatarUrl
          userSkills {
            id
            experience
            skill {
              id
              name
            }
          }
        }
      }
    `

    return await client.request(query);
  }

  public async registerWebhook(apiKey: string, clientMutationId: string) {
    const client = new GraphQLClient('https://flexhire.com/api/v2', {
      headers: () => ({'FLEXHIRE-API-KEY': apiKey}),
    });

    const query = gql`
      mutation ($clientMutationId: String!, $url: String!){
        create_webhook: createWebhook(
          input: {clientMutationId: $clientMutationId, url: $url, enabled: true}
        ) {
        errors {
          message
        }
        clientMutationId
        webhook {
          authenticationHeaderName
          authenticationHeaderValue
          enabled
          id
          url
        }
      }
    }
    `

    const variables = {
      clientMutationId: clientMutationId,
      enabled: true,
      url: `${process.env.NGROK_HOST ?? 'localhost:3001'}=${clientMutationId}`
    }

    try {
      return await client.request(query, variables);
    } catch (e) {
      if (e instanceof ClientError && e.message.includes("Url has already been taken")) {
        return null;
      }

      if (e instanceof ClientError && e.message.includes("API Access required")) {
        console.log('invalid api access');
        return null;
      }

      throw e;
    }
  }
}
