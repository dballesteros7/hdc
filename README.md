healthbank
==========

Manage, organize, and leverage your health data.

Starting the application
------------------------

First, start MongoDB...

    mongod --dbpath data/db/ --config data/mongod.conf &> mongo.out &

... and ElasticSearch. Use the -f option for interactive mode.

    elasticsearch [-f]

Now you can start the application from the project's root directory.

    play run


Load a sample database
----------------------

From the project directory, issue the command:

    mongorestore --drop --db healthbank dump/healthbank

This drops your current healthbank database and loads a sample version.
