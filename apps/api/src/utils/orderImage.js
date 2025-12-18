const path = require('path')
const { createCanvas, loadImage } = require('canvas')

function nowText() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function computeGroupsFromCart(cart) {
  const storeIds = Object.keys(cart || {})
  const groups = []
  for (const sid of storeIds) {
    const s = cart[sid]
    if (!s || !Array.isArray(s.items) || s.items.length === 0) continue
    const cleanItems = s.items
      .filter((it) => it && typeof it.price === 'number' && it.price > 0 && typeof it.quantity === 'number' && it.quantity >= 1)
      .map((it) => ({
        name: String(it.name || '未知菜品'),
        price: Number(it.price || 0),
        quantity: Number(it.quantity || 1),
        note: it.note ? String(it.note) : ''
      }))
    if (cleanItems.length === 0) continue
    const subtotal = cleanItems.reduce((acc, it) => acc + it.price * it.quantity, 0)
    groups.push({
      store: { name: (s.storeInfo && s.storeInfo.name) ? String(s.storeInfo.name) : '店铺' },
      items: cleanItems,
      subtotal
    })
  }
  return groups
}

async function generateOrderImage(input) {
  const title = (input && input.title) ? String(input.title) : '今天吃什么 · 清单'
  const cart = (input && input.cart) ? input.cart : {}
  const style = (input && input.style) ? input.style : {}
  const theme = style.theme === 'dark' ? 'dark' : 'light'

  const groups = computeGroupsFromCart(cart)
  const overallTotal = groups.reduce((t, g) => t + g.subtotal, 0)

  const margin = 24
  const itemLine = 30
  const headerLine = 36
  const titleHeight = 64
  const logoSize = 0
  const width = 420
  const titleBlockBottom = margin + Math.max(logoSize, titleHeight) + 26
  let ySim = titleBlockBottom

  const maxLines = 200
  let lineCount = 0
  for (const g of groups) {
    ySim += headerLine + 6
    for (const it of g.items) {
      ySim += itemLine
      lineCount++
      if (it.note) {
        ySim += 18
        lineCount++
      }
      if (lineCount >= maxLines) break
    }
    ySim += 4
    if (lineCount >= maxLines) break
  }
  const totalBlock = 40
  const footerBlock = 40
  const height = ySim + totalBlock + footerBlock

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  const colors = theme === 'dark'
    ? {
        bg: '#1F1F1F',
        border: '#2A2A2A',
        sectionBg: '#2B2B2B',
        title: '#FAFAFA',
        sub: '#A0A0A0',
        text: '#EAEAEA',
        accent: '#FF6B6B'
      }
    : {
        bg: '#FFFDF8',
        border: '#E9E4D8',
        sectionBg: '#FFF3E8',
        title: '#2C2C2C',
        sub: '#9A9A9A',
        text: '#2C2C2C',
        accent: '#FF6B6B'
      }

  ctx.fillStyle = colors.bg
  ctx.fillRect(0, 0, width, height)
  ctx.strokeStyle = colors.border
  ctx.lineWidth = 2
  ctx.strokeRect(1, 1, width - 2, height - 2)

  let moneyIcon = null
  let heartIcon = null
  try {
    moneyIcon = await loadImage(path.resolve(__dirname, 'images', 'money.png'))
  } catch {}
  try {
    heartIcon = await loadImage(path.resolve(__dirname, 'images', 'heart.png'))
  } catch {}

  ctx.fillStyle = colors.title
  ctx.font = 'bold 24px sans-serif'
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'
  ctx.fillText(title, margin, margin + 2)

  ctx.fillStyle = colors.sub
  ctx.font = '14px sans-serif'
  ctx.fillText(`生成时间：${nowText()}`, margin, margin + 38)

  ctx.strokeStyle = theme === 'dark' ? '#303030' : '#EEE7D9'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(margin, margin + Math.max(logoSize, titleHeight) - 20)
  ctx.lineTo(width - margin, margin + Math.max(logoSize, titleHeight) - 20)
  ctx.stroke()

  let y = titleBlockBottom
  const priceRight = width - margin - 12
  let printedLines = 0

  for (const g of groups) {
    if (printedLines >= maxLines) break
    ctx.fillStyle = colors.sectionBg
    ctx.fillRect(margin, y, width - margin * 2, headerLine)
    ctx.fillStyle = colors.text
    ctx.font = 'bold 18px sans-serif'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    ctx.fillText(g.store.name, margin + 14, y + headerLine / 2)

    ctx.textAlign = 'right'
    const subtotalText = `${g.subtotal}`
    const iconSize = 22
    const gap = 8
    const priceIconRight = priceRight
    const priceTextRight = priceIconRight - iconSize - gap
    ctx.fillStyle = colors.text
    ctx.font = '18px sans-serif'
    ctx.fillText(subtotalText, priceTextRight, y + headerLine / 2)
    if (moneyIcon) {
      ctx.drawImage(moneyIcon, priceIconRight - iconSize, y + headerLine / 2 - iconSize / 2, iconSize, iconSize)
    } else {
      ctx.fillText('￥', priceIconRight, y + headerLine / 2)
    }

    y += headerLine + 6
    for (const it of g.items) {
      if (printedLines >= maxLines) break
      const rowY = y + itemLine / 2
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = colors.text
      ctx.font = '16px sans-serif'
      if (heartIcon) {
        const iconSize2 = 16
        ctx.drawImage(heartIcon, margin + 6, rowY - iconSize2 / 2, iconSize2, iconSize2)
      } else {
        ctx.fillStyle = colors.accent
        ctx.beginPath()
        ctx.arc(margin + 12, rowY, 4, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.fillStyle = colors.text
      ctx.font = '16px sans-serif'
      const leftText = `${it.name} x${it.quantity}`
      ctx.fillText(leftText, margin + 28, rowY)

      ctx.textAlign = 'right'
      ctx.fillStyle = colors.text
      ctx.font = '16px sans-serif'
      const priceText = `${it.price * it.quantity}`
      const iconSize3 = 18
      const gap3 = 8
      const priceIconRight2 = priceRight
      const priceTextRight2 = priceIconRight2 - iconSize3 - gap3
      ctx.fillText(priceText, priceTextRight2, rowY)
      if (moneyIcon) {
        ctx.drawImage(moneyIcon, priceIconRight2 - iconSize3, rowY - iconSize3 / 2, iconSize3, iconSize3)
      } else {
        ctx.fillText('￥', priceIconRight2, rowY)
      }
      y += itemLine
      printedLines++
      if (it.note && printedLines < maxLines) {
        ctx.textAlign = 'left'
        ctx.fillStyle = colors.sub
        ctx.font = '12px sans-serif'
        ctx.fillText(`备注：${it.note}`, margin + 28, y - 4)
        y += 18
        printedLines++
      }
    }
    y += 4
  }

  ctx.textAlign = 'right'
  ctx.fillStyle = colors.text
  ctx.font = 'bold 18px sans-serif'
  ctx.fillText(`总计 ￥${overallTotal}`, width - margin - 14, y + 8)
  ctx.save()
  ctx.globalAlpha = 0.18
  ctx.textAlign = 'right'
  ctx.fillStyle = theme === 'dark' ? '#AAA' : '#666'
  ctx.font = '12px sans-serif'
  ctx.fillText('EatWhat · Generated by API', width - margin, height - margin - 8)
  ctx.restore()

  if (printedLines >= maxLines) {
    ctx.textAlign = 'left'
    ctx.fillStyle = colors.sub
    ctx.font = '12px sans-serif'
    ctx.fillText(`注：超出最大行数 ${maxLines}，列表已截断`, margin, height - footerBlock)
  }

  const buffer = canvas.toBuffer('image/png')
  const dataUrl = canvas.toDataURL('image/png')
  return {
    buffer,
    width,
    height,
    mimeType: 'image/png',
    dataUrl
  }
}

module.exports = {
  generateOrderImage
}

