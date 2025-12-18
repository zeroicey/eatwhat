const { success, error } = require('../utils/response')
const { generateOrderImage } = require('../utils/orderImage')

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

