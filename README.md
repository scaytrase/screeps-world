# My Screeps world controller

## Requirements

* Node + NPM
* Typescript
* Grunt

## Configuration

Create `env.json` file with your credentials in order to automate code uploads to screeps

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
