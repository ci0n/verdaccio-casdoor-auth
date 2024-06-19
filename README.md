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
      MIIE3TCCAsWgAwIBAgIDAeJAMA0GCSqGSIb3DQEBCwUAMCgxDjAMBgNVBAoTBWFk
      ... YOUR CERTIFICATE HERE ...
      NBEp2SysZilZ8SY/1+hpoDqJV2JGv0rSGWhPtfMd/0qlHH+JdC7MHSeQRW0jfm/0
      Hw==
      -----END CERTIFICATE-----
```
