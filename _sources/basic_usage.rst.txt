Basic Usage
===========

Once you've configured ``ablestar-cli`` with the API credentials for your store you can run the command without any arguments to enter interactive mode: ::

    $ ablestar-cli

This will take you through a wizard where you can select the store, objects (products, orders, customers, etc..) that you want to export. After you go through the wizard it will also give you a command-line equivalent so you can quickly re-run the task.

You can also use the arguments to tell the tool what you want to do. For example: ::

    ablestar-cli export

    ablestar-cli export products

    ablestar-cli export products example.myshopify.com

    ablestar-cli export products example.myshopify.com --format=CSV

    ablestar-cli export products example.myshopify.com --format=CSV --fields=products --fields=variants

