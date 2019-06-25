'use strict'

const Glue = require('glue')
const Manifest = require('./manifest')

exports.deployment = async start => {
  const manifest = Manifest.get('/')
  const server = await Glue.compose(
    manifest,
    { relativeTo: __dirname }
  )

  await server.initialize()

  // let's not include code coverage utility code in our coverage report
  // https://github.com/gotwarlost/istanbul/blob/master/ignoring-code-for-coverage.md
  /* istanbul ignore next */
  if (global.__coverage__) {
    console.log('registering coverage middleware')
    // https://hapijs.com/tutorials/routing?lang=en_US
    server.route({
      method: 'GET',
      path: '/__coverage__',
      handler () {
        return { coverage: global.__coverage__ }
      }
    })
  }

  if (!start) {
    return server
  }

  await server.start()

  console.log(`Server started at ${server.info.uri}`)

  return server
}

if (!module.parent) {
  exports.deployment(true)

  process.on('unhandledRejection', err => {
    throw err
  })
}
