import * as core from '@actions/core'
import * as github from '@actions/github'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run() {
  try {
    // Fetch SXT auth using shared secret
    const sharedSecret = core.getInput('sxt_auth_secret', { required: true })
    if (!sharedSecret) {
      core.setFailed('sxt_auth_secret must be a non-empty string')
      return
    }
    const endpointUrl = core.getInput('sxt_endpoint_url', { required: true })
    if (!endpointUrl) {
      core.setFailed('sxt_endpoint_url must be a non-empty string')
      return
    }
    core.info(`Fetching SXT auth from: ${endpointUrl}`)
    const response = await fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'x-shared-secret': sharedSecret
      }
    })
    core.info(`Response status: ${response.status} ${response.statusText}`)
    const rawBody = await response.text()
    core.info(`Response body: ${rawBody}`)

    let data
    try {
      data = JSON.parse(rawBody)
    } catch (parseError) {
      core.setFailed(`Failed to parse response as JSON: ${parseError.message}`)
      return
    }
    core.setOutput('sxt-auth', JSON.stringify(data))
  } catch (error) {
    // Fail the workflow step if an error occurs
    core.error(error.stack || error.toString())
    core.setFailed(error.message)
  }
}
