# My Screeps world controller

## Requirements

* Node + NPM
* Typescript
* Grunt

## Configuration

Create `env.json` file with your credentials in order to automate code uploads to screeps. 
You also need to create `beta` branch for your code. By default, code is uploaded to `beta` branch.

```json
{
  "email": "your@email.here",
  "password": "y0uR_p@ssw0rd",
  "branch": "default",
  "ptr": false
}
```

## Running

You can watch your files in order to automatically recompile them into working dist JS code. 
`grunt-screeps` task will upload it to the screeps server using your credentials. 
You can choose "Automatically apply new external code while" while in-game in order to automate your
game development process

```sh
npm run watch
```

## Releasing

To release the same code to `default` branch you should run `npm run deploy` or `npm run watch-main`. They do the
same things as `npm run build` and `npm run watch` but upload to `default` branch instead of `beta`

## Todo

* [ ] Labs management
* [ ] Dynamically modify harvester body if target source has a storage\link\container nearby
* [x] Trade excess minerals
