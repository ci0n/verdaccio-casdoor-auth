import {
  PluginOptions,
  AuthAccessCallback,
  AuthCallback,
  IPluginAuth,
  RemoteUser,
  Logger,
  Config
} from '@verdaccio/types';
import { getForbidden, getUnauthorized } from '@verdaccio/commons-api';
import { VerdaccioPackageAccess } from './type';
import { AuthenticateStore } from './authenticate-store';
import { Casdoor, CasdoorSDKConfig } from './casdoor';
import { AxiosError } from 'axios';
import { version as PKG_VERSION } from '../package.json';

export interface PluginConfig extends CasdoorSDKConfig, Config {}

export default class AuthCasdoorPlugin implements IPluginAuth<PluginConfig> {
  public logger: Logger;
  protected readonly casdoor: Casdoor;
  protected readonly store: AuthenticateStore;
  version = PKG_VERSION;

  public constructor(
    public readonly config: PluginConfig,
    options: PluginOptions<PluginConfig>
  ) {
    this.logger = options.logger;

    this.store = new AuthenticateStore();

    const casdoorConfig: CasdoorSDKConfig = {
      certificate: config.certificate,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      endpoint: config.endpoint,
      orgName: config.orgName,
      appName: config.appName
    };
    this.casdoor = new Casdoor(casdoorConfig);
  }

  /**
   * Authenticate an user.
   * @param user user to log
   * @param password provided password
   * @param cb callback function
   */
  public authenticate(user: string, password: string, cb: AuthCallback): void {
    const storeUser = this.store.findUser(user, password);
    if (storeUser) {
      this.logger.trace(
        { user: storeUser },
        `[casdoor authenticate] user: ${user} found in cache, authenticated with groups: @{user.groups}`
      );
      return cb(null, storeUser.groups);
    }

    this.logger.trace(`[casdoor authenticate] user: ${user} not found in cache`);

    this.casdoor
      .getAuthTokenByPassword(user, password)
      .then(({ access_token, refresh_token }) => {
        return this.casdoor.getUser(user).then((response) => {
          const isAdmin = !!(response.data.data.isAdmin || response.data.data.isGlobalAdmin);
          const groups = [isAdmin ? 'admin' : 'user'];

          this.logger.trace(
            { user, groups },
            `[casdoor authenticate] user: ${user} authenticated with groups: @{user.groups}`
          );

          this.store.storeUser(user, password, {
            access_token,
            refresh_token,
            isAdmin,
            groups
          });
          cb(null, groups);
        });
      })
      .catch((err: AxiosError) => {
        this.logger.error({ err }, `[casdoor authenticate] getToken fail user: ${user} @{err.message}`);
        cb(getUnauthorized('unauthorized getToken fail'), false);
      });
  }

  /**
   * Triggered on each access request
   * @param user
   * @param pkg
   * @param cb
   */
  public allow_access(user: RemoteUser, pkg: VerdaccioPackageAccess, cb: AuthAccessCallback): void {
    if (user.name) {
      this.logger.debug(`[casdoor allow_access] allow user: ${user.name} authenticated access to package: ${pkg.name}`);
      return cb(null, true);
    } else {
      this.logger.debug(
        `[casdoor allow_access] deny user: ${user.name} not authenticated access to package: ${pkg.name}`
      );
      return cb(getUnauthorized('unauthorized'), false);
    }
  }

  /**
   * Triggered on each publish request
   * @param user
   * @param pkg
   * @param cb
   */
  public allow_publish(user: RemoteUser, pkg: VerdaccioPackageAccess, cb: AuthAccessCallback): void {
    if (!user.name) {
      return cb(null, false);
    }

    if (user.groups.includes('admin')) {
      this.logger.debug(
        { name: user.name },
        '[casdoor allow_publish] user: @{name} is admin, has been granted to publish'
      );
      return cb(null, true);
    }

    // scope package
    if (pkg.name?.includes('@')) {
      const [scope] = pkg.name.substring(1).split('/');

      // User own package
      if (scope === user.name) {
        this.logger.debug({ name: user.name }, '[casdoor allow_publish] user: @{name} has been granted to publish');
        return cb(null, true);
      }
      this.logger.trace({ name: user.name }, '[casdoor allow_publish] user: @{name} has not been granted to publish');
    }

    cb(null, false);
  }

  public allow_unpublish(user: RemoteUser, pkg: VerdaccioPackageAccess, cb: AuthAccessCallback): void {
    if (!user.name) {
      return cb(null, false);
    }

    if (user.groups.includes('admin')) {
      this.logger.debug(
        { name: user.name },
        '[casdoor allow_unpublish] user: @{name} is admin, has been granted to unpublish'
      );
      return cb(null, true);
    }

    // scope package
    if (pkg.name?.includes('@')) {
      const [scope] = pkg.name.substring(1).split('/');

      // User own package
      if (scope === user.name) {
        this.logger.debug({ name: user.name }, '[casdoor allow_unpublish] user: @{name} has been granted to unpublish');
        return cb(null, true);
      }
      this.logger.trace(
        { name: user.name },
        '[casdoor allow_unpublish] user: @{name} has not been granted to unpublish'
      );
    }

    cb(null, false);
  }

  adduser(user: string, password: string, cb: AuthCallback): void {
    cb(getForbidden('Forbidden, Manage users using casdoor'), false);
    this.logger.error(`[casdoor adduser] can't not add user: ${user}`);
  }

  changePassword(user: string, password: string, newPassword: string, cb: AuthCallback): void {
    cb(getForbidden('Forbidden, Manage users using casdoor'), false);
    this.logger.error(`[casdoor changePassword] can't not change password for user: ${user}`);
  }
}
