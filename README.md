# terraform-cloud-action

[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme) [![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Faddresscloud%2Fterraform-cloud-action%2Fbadge%3Fref%3Dmaster&style=flat-square)](https://actions-badge.atrox.dev/addresscloud/terraform-cloud-action/goto?ref=master) [![codecov](https://codecov.io/gh/addresscloud/terraform-cloud-action/branch/master/graph/badge.svg)](https://codecov.io/gh/addresscloud/terraform-cloud-action)

> An action to run Terraform Cloud workspaces

This action submits a run to a Terraform Cloud workspace which performs a plan and apply. Once the run is succesfully submitted the action returns a success, leaving the plan and apply to continue to run in Terraform Cloud.

## Table of Contents

- [Usage](#usage)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Usage

Terraform Cloud requires a .tar.gz archive containing the Terraform configuration, and build artifacts if required. The example shows a GitHub workflow archiving Lambda functions (in the `build` directory) alongside a Terraform configuration (in the `infrastructure` directory) for deployment. The archive is then passed to the action for deployment by Terraform Cloud.

```yml
- name: Create tar gz file
  run: tar --exclude *.terraform* -zcvf build.tar.gz build infrastructure

- name: Terraform Cloud
  uses: addresscloud/terraform-cloud-action@master
  with:
    tfToken: ${{ secrets.TERRAFORM_TOKEN }}
    tfOrg: '<ORGANISATION>'
    tfWorkspace: 'my-lambda-service'
    filePath: './build.tar.gz'
    identifier: ${{ github.sha }}
```

![Example workflow](example.png)

### Inputs

The inputs below are required by the action to submit the run to Terraform Cloud. Additional workspace variables and settings should be configured using the Terraform Cloud UI. 

#### `tfToken`
 
**Required** - Terraform Cloud access token.

#### `tfOrganization`

**Required** - Terraform Cloud organization.

#### `tfWorkspace`

**Required** - Name of existing Terraform Cloud workspace.

#### `filePath`

**Required** - Path to .tar.gz archive with Terraform configuration.

#### `identifier`

**Required** - Unique identifier for the run (e.g. git commit sha). Reduced to 7 characters for brevity.

### Outputs

#### `runId` 

The identfier of the run in Terraform Cloud.

### Notes

If your repository contains multiple modules, upload the top-level directory and configure the root workspace path in the Terraform Cloud UI. For example, to deploy 
`infrastructure/dev/services/lambda/main.tf` which has references to modules in `infrastructure/modules/services/lambda/module.tf` upload the entire `infrastructure` directory and configure `infrastructure/dev/services/lambda/` as the root of the workspace in the Terraform Cloud UI.

## Maintainers

[@talltom](https://github.com/talltom)

## Contributing

PRs accepted with unit tests.

To run tests:

```sh
npm run test
```

To check code lint:

```sh
npm run lint
```

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

This Action was based on the example Terraform Enterprise script at: https://github.com/hashicorp/terraform-guides/tree/master/operations/automation-script

## License

MPL-2.0 © 2019 Addresscloud Limited
