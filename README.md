<img src="https://static.ablestar.app/ablestar-cli/logo.png" width="150"/>


# ablestar-cli
<img src="https://img.shields.io/badge/License-AGPL-green.svg" />


`ablestar-cli` is a command tool for importing and exporting data from your Shopify store. Once you configure your store you can upload and download spreadsheets of your products, customers, orders and more.

## Quick Start


```
# Install the tool locally
npm i -g @ablestar/ablestar-cli    

# Configure your API keys
ablestar-cli init

# Run the tool to export your data
ablestar-cli
```

## Documentation

The [Ablestar CLI documentation website](https://cli.ablestar.com/) contains setup and usage instructions for `ablestar-cli`.

## Demo

This short recording shows how to configure `ablestar-cli` and export Shopify orders to a file in the Matrixify format:

[![asciicast](https://asciinema.org/a/589699.svg?t=0)](https://asciinema.org/a/589699)

The output file will look like this:

<img src="https://static.ablestar.app/ablestar-cli/Shopify Order Export.png" width="1258"/>

## Supported Objects

We're slowly adding support for additional Shopify record types. If you would like to see one added please submit an issue or PR.

| Object     | Export | Import/Update |
|-------------|:--------:|:--------:|
| Products   | ✅       | ❌       |
| Orders   | ✅       | ❌       |
| Pages | ✅     | ✅       |
| Blog Posts | ✅     | ✅       |
| Smart & Manual Collections | ✅     | ✅      |
| Metaobject Entries | ✅     | ❌      |
| Discount Codes | ✅     | ❌      |

## Contributing

All contributions are welcome, when opening a PR please follow our [contribution guide](https://github.com/ablestar/ablestar-cli/blob/main/CONTRIBUTING.md)

## About Ablestar

Ablestar is a trusted Shopify app developer, specializing in creating highly-rated apps since 2016. With tens of thousands of stores using their apps, Ablestar is known for their top-ranked [Bulk Product Editor](https://apps.shopify.com/bulk-product-editor?utm_source=ablestar-cli&utm_medium=readme&utm_campaign=ablestar-cli) app and their commitment to helping businesses save time, streamline operations, and increase sales.

Other Ablestar projects include:

- [AppNavigator](https://appnavigator.io/) - Historical data and review analysis for the Shopify App store
- [Spreadsheet Toolkit](https://spreadsheettoolkit.com) - Free tool for performing common tasks on spreadsheets

You can keep yourself informed on updates to ablestar-cli through our [mailing list](https://confirmsubscription.com/h/y/5C2D5BEBF1A3998F).