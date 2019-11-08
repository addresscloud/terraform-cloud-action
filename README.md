# terraform-cloud-action

[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
TODO: Put more badges here.

> An action to run Terraform Cloud workspaces

This action submits a run to a Terraform Cloud workspace which performs a plan and then apply. Once the plan is complete the action returns a success, leaving the apply to continue to run in Terraform Cloud. Variables and settings should be configured using the Terraform Cloud UI.

## Table of Contents

- [Usage](#usage)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Usage

Terraform Cloud requires a .tar.gz file containing Terraform configuration and build artifacts if required. This example GitHub workflow demonstrates building Lambda functions (output in the `build` directory), and then archiving along with Terraform configuration (in the `infrastructure` directory) for deployment. 

```
@actions/terraform-cloud-usage

# npm run build
```

### Inputs

- token
- organization
- workspace
- artifacts

### Outpus

- run Id - the identfier of the run in Terraform Cloud.

### Notes

If your repository contains multiple modules, upload the top-level directory and configure the root workspace path in the Terraform Cloud UI. For example, to deploy 
`infrastructure/dev/services/lambda/main.tf` which has references to modules in `infrastructure/modules/services/lambda/module.tf` upload the entire `infrastructure` directory and configure `infrastructure/dev/services/lambda/` as the root of the module.

## Maintainers

[@talltom](https://github.com/talltom)

## Contributing

PRs accepted.

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

This Action was based on the example Terraform Enterprise script at: 

## License

MPL-2.0 © 2019 Addresscloud Limited
