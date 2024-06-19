# verdaccio-casdoor-auth

a verdaccio plugin for casdoor auth

## casdoor config
You must add `password` to the `Grant types` of the application, otherwise login will fail

[Casdoor OAuth2.0 document](https://casdoor.org/docs/how-to-connect/oauth/#resource-owner-password-credentials-grant)

## config.yaml
```yaml
auth:
  casdoor-auth:
    endpoint: ...
    clientId: ...
    clientSecret: ...
    orgName: ...
    appName: ...
    certificate: |
      -----BEGIN CERTIFICATE-----
      ... YOUR CERTIFICATE HERE ...
      -----END CERTIFICATE-----
```
