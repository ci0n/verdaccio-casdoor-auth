import { SDK } from 'casdoor-nodejs-sdk';
import { AxiosResponse } from 'axios'

export type CasdoorSDKConfig = ConstructorParameters<typeof SDK>[0];

export class Casdoor extends SDK {


  public async getAuthTokenByPassword(username: string, password: string) {
    const { request, config } = this;
    
    if (!request) {
      throw new Error('request init failed')
    }

    const {
      data: { access_token, refresh_token },
    } = (await request.post('login/oauth/access_token', {
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'password',
      username,
      password,
    })) as unknown as AxiosResponse<{
      access_token: string
      refresh_token: string
    }>

    return {
      access_token,
      refresh_token,
    }

  }


}
