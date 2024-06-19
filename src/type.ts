import { PackageAccess, RemoteUser } from '@verdaccio/types';

export type JWTmiddlewareHelpers = {
  createAnonymousRemoteUser: () => RemoteUser;
  createRemoteUser: (name: string, pluginGroups: string[]) => RemoteUser;
}


export type VerdaccioPackageAccess = PackageAccess & {
  name?: string;
  version?: string,
}
