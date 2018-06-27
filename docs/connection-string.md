# Connection String URI Format

The following is the standard URI connection scheme:

> mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]

| Part | Description |
| --- | --- |
| mongodb:// | A required prefix to identify that this is a string in the standard connection format. |
| username:password@ | Optional. If specified, the client will attempt to log in to the specific database using these credentials after connecting to the [mongod](https://docs.mongodb.com/manual/reference/program/mongod/#bin.mongod) instance. |
| host1 | Required. It identifies a server address to connect to. It identifies either a hostname, IP address, or UNIX domain socket. <br><br> For a replica set, specify the hostname of the [mongod](https://docs.mongodb.com/manual/reference/program/mongod/#bin.mongod) instance as listed in the replica set configuration. <br><br> For a sharded cluster, specify the hostname of the [mongos](https://docs.mongodb.com/manual/reference/program/mongos/#bin.mongos) instance.
| :port1 | Optional. The default value is `:27017` if not specified. |
| hostN | Optional. You can specify as many hosts as necessary. You would specify multiple hosts, for example, for connections to replica sets. <br><br>For a replica set, specify the hostname of the [mongod](https://docs.mongodb.com/manual/reference/program/mongod/#bin.mongod) instance as listed in the replica set configuration. <br> <br>For a sharded cluster, specify the hostname of the [mongos](https://docs.mongodb.com/manual/reference/program/mongos/#bin.mongos) instance. |
| :portX | Optional. The default value is `:27017` if not specified.
| /database | Optional. The name of the database to authenticate if the connection string includes authentication credentials in the form of username:password@. If /database is not specified and the connection string includes credentials, the driver will authenticate to the admin database. |
| ?options | Connection specific options. See [Connection String Options](https://docs.mongodb.com/manual/reference/connection-string/#connections-connection-options) for a full description of these options. <br><br>If the connection string does not specify a database/ you must specify a slash (i.e. /) between the last hostN and the question mark that begins the string of options. |

Official documentation can be read [_here_](https://docs.mongodb.com/manual/reference/connection-string/).