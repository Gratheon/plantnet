# gratheon / plantnet
Serves [plantnet](https://plantnet.org/en/) data around apiary

Raw data source taken from https://www.gbif.org/dataset/7a3679ef-5582-4aaa-81f0-8c2545cafc81
(and then processed it into mysql DB)

![Screenshot_20221216_204014](https://user-images.githubusercontent.com/445122/208166785-60b9d14a-4869-457e-9300-31a1d980e47d.png)

## Architecture
```mermaid
flowchart LR
    web-app("<a href='https://github.com/Gratheon/web-app'>web-app</a>") --> graphql-router
    graphql-router --> plantnet("<a href='https://github.com/Gratheon/plantnet'>plantnet</a>") --> mysql
    plantnet --"register schema"-->graphql-schema-registry
    graphql-router --> graphql-schema-registry
```

## Development
```bash
just start
```