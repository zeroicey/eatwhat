const { success, error } = require('../utils/response')
const { generateOrderImage } = require('../utils/orderImage')
const axios = require('axios')

function validateCart(cart) {
  if (!cart || typeof cart !== 'object') return false
  const keys = Object.keys(cart)
  if (keys.length === 0) return false
  return true
}

exports.postOrderImage = async (req, res) => {
  try {
    const { title, cart, style } = req.body || {}
    if (!validateCart(cart)) {
      return error(res, '购物车数据为空或格式不正确', 400)
    }
    const result = await generateOrderImage({ title, cart, style })
    return success(res, {
      mimeType: result.mimeType,
      width: result.width,
      height: result.height,
      dataUrl: result.dataUrl
    })
  } catch (err) {
    return error(res, '生成订单图片失败', 500, { detail: err.message })
  }
}

exports.postAiChat = async (req, res) => {
  try {
    const { messages = [], model = 'openai/gpt-4o' } = req.body || {}
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return error(res, '缺少 OPENROUTER_API_KEY', 500)
    }
    const referer = process.env.OPENROUTER_REFERER || 'https://eatwhat.example.com'
    const title = process.env.OPENROUTER_TITLE || 'EatWhat'

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      { model, messages },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': referer,
          'X-Title': title,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    )
    const content =
      response?.data?.choices?.[0]?.message?.content ||
      response?.data?.choices?.[0]?.delta?.content ||
      ''
    return success(res, { content })
  } catch (err) {
    return error(res, 'AI聊天生成失败', 500, { detail: err.message })
  }
}

