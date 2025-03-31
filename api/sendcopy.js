import axios from 'axios'

async function sendEmailCopy(
  /** @type {import('@vercel/node').VercelRequest} */
  req,
  /** @type {import('@vercel/node').VercelResponse} */
  res
) {
  console.log('Request body:', req.body)

  try {
    const emailCopy = req.body

    if (!emailCopy) {
      return res.status(400).json({ error: 'No email copy provided' })
    }

    await axios.post(
      `${process.env.API_DOMAIN}/api/v1/${process.env.API_WORKSPACE}/cms/spaces/${process.env.API_SPACE}/types/contacts/rows`,
      emailCopy,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: process.env.API_KEY,
        },
      }
    )

    return res.status(200).json({ error: '' })
  } catch (error) {
    console.error('Error:', error)
    return res
      .status(error.response?.status || 500)
      .json({ error: error.message })
  }
}

export default sendEmailCopy
