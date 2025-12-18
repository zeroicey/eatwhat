const fs = require('fs')
const path = require('path')
const { createCanvas, loadImage } = require('canvas')

function nowText() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

function buildMock() {
  const user = {
    _id: makeId(),
    username: 'student001',
    nickName: '小馋猫',
    avatarUrl: ''
  }

  const stores = [
    {
      _id: makeId(),
      name: '川味小馆',
      description: '正宗川菜，辣而不燥',
      coverImage: '',
      menuImages: [],
      location: { type: 'Point', coordinates: [108.95, 34.23], address: '南校区食堂一层' },
      creator: user._id
    },
    {
      _id: makeId(),
      name: '牛肉面馆',
      description: '汤浓面劲',
      coverImage: '',
      menuImages: [],
      location: { type: 'Point', coordinates: [108.96, 34.24], address: '北校区美食城' },
      creator: user._id
    },
    {
      _id: makeId(),
      name: '便当屋',
      description: '每日现做，营养均衡',
      coverImage: '',
      menuImages: [],
      location: { type: 'Point', coordinates: [108.97, 34.22], address: '东门外步行街' },
      creator: user._id
    },
    {
      _id: makeId(),
      name: '拌饭社',
      description: '韩式拌饭与石锅拌饭',
      coverImage: '',
      menuImages: [],
      location: { type: 'Point', coordinates: [108.98, 34.21], address: '西门商圈' },
      creator: user._id
    },
    {
      _id: makeId(),
      name: '烧烤铺',
      description: '深夜食堂 现烤新鲜',
      coverImage: '',
      menuImages: [],
      location: { type: 'Point', coordinates: [108.99, 34.23], address: '南门夜市' },
      creator: user._id
    },
    {
      _id: makeId(),
      name: '砂锅馆',
      description: '砂锅土豆粉 砂锅米线',
      coverImage: '',
      menuImages: [],
      location: { type: 'Point', coordinates: [108.93, 34.25], address: '北门小吃街' },
      creator: user._id
    }
  ]

  const menuItems = [
    { _id: makeId(), storeId: stores[0]._id, name: '水煮牛肉', price: 32, creator: user._id, likeCount: 128, reportCount: 1, status: 'active' },
    { _id: makeId(), storeId: stores[0]._id, name: '宫保鸡丁', price: 24, creator: user._id, likeCount: 89, reportCount: 0, status: 'active' },
    { _id: makeId(), storeId: stores[0]._id, name: '麻婆豆腐', price: 18, creator: user._id, likeCount: 76, reportCount: 0, status: 'active' },
    { _id: makeId(), storeId: stores[1]._id, name: '红烧牛肉面', price: 22, creator: user._id, likeCount: 144, reportCount: 0, status: 'active' },
    { _id: makeId(), storeId: stores[1]._id, name: '番茄牛肉面', price: 20, creator: user._id, likeCount: 96, reportCount: 0, status: 'active' },
    { _id: makeId(), storeId: stores[1]._id, name: '酸菜牛肉面', price: 21, creator: user._id, likeCount: 61, reportCount: 0, status: 'active' },
    { _id: makeId(), storeId: stores[2]._id, name: '照烧鸡腿饭', price: 26, creator: user._id, likeCount: 102, reportCount: 0, status: 'active' },
    { _id: makeId(), storeId: stores[2]._id, name: '黑椒牛排饭', price: 36, creator: user._id, likeCount: 58, reportCount: 0, status: 'active' },
    { _id: makeId(), storeId: stores[2]._id, name: '咖喱猪排饭', price: 28, creator: user._id, likeCount: 73, reportCount: 0, status: 'active' },
    // 拌饭社
    { _id: makeId(), storeId: stores[3]._id, name: '石锅拌饭', price: 25, creator: user._id, likeCount: 88, reportCount: 0, status: 'active' },
    { _id: makeId(), storeId: stores[3]._id, name: '辣牛拌饭', price: 27, creator: user._id, likeCount: 64, reportCount: 0, status: 'active' },
    { _id: makeId(), storeId: stores[3]._id, name: '泡菜拌饭', price: 22, creator: user._id, likeCount: 71, reportCount: 0, status: 'active' },
    // 烧烤铺
    { _id: makeId(), storeId: stores[4]._id, name: '孜然羊肉串', price: 5, creator: user._id, likeCount: 210, reportCount: 0, status: 'active' },
    { _id: makeId(), storeId: stores[4]._id, name: '烤鸡翅', price: 8, creator: user._id, likeCount: 166, reportCount: 0, status: 'active' },
    { _id: makeId(), storeId: stores[4]._id, name: '烤土豆片', price: 4, creator: user._id, likeCount: 93, reportCount: 0, status: 'active' },
    // 砂锅馆
    { _id: makeId(), storeId: stores[5]._id, name: '砂锅土豆粉', price: 18, creator: user._id, likeCount: 132, reportCount: 0, status: 'active' },
    { _id: makeId(), storeId: stores[5]._id, name: '砂锅米线', price: 16, creator: user._id, likeCount: 97, reportCount: 0, status: 'active' },
    { _id: makeId(), storeId: stores[5]._id, name: '酸辣粉', price: 15, creator: user._id, likeCount: 85, reportCount: 0, status: 'active' }
  ]

  return { user, stores, menuItems }
}

function composeCombos(stores, menuItems) {
  const sMap = new Map(stores.map((s) => [s._id, s]))
  const items = menuItems.filter((m) => m.status === 'active')
  const combos = items.map((m) => {
    const s = sMap.get(m.storeId)
    return {
      text: `${s.name} · ${m.name}  ￥${m.price}  ❤${m.likeCount}`,
      storeName: s.name,
      itemName: m.name,
      price: m.price,
      likes: m.likeCount
    }
  })
  for (let i = combos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[combos[i], combos[j]] = [combos[j], combos[i]]
  }
  return combos
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function buildOrderGroups(stores, menuItems) {
  const active = menuItems.filter((m) => m.status === 'active')
  const byStore = new Map()
  for (const m of active) {
    if (!byStore.has(m.storeId)) byStore.set(m.storeId, [])
    byStore.get(m.storeId).push(m)
  }
  const groups = []
  for (const s of stores) {
    const candidates = (byStore.get(s._id) || []).slice()
    if (candidates.length === 0) continue
    const pickCount = Math.min(candidates.length, randInt(1, 3))
    const chosen = []
    for (let i = 0; i < pickCount; i++) {
      const idx = randInt(0, candidates.length - 1)
      chosen.push(candidates[idx])
      candidates.splice(idx, 1)
    }
    const subtotal = chosen.reduce((acc, it) => acc + it.price, 0)
    groups.push({
      store: s,
      items: chosen,
      subtotal
    })
  }
  for (let i = groups.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[groups[i], groups[j]] = [groups[j], groups[i]]
  }
  return groups
}

async function generateListImage() {
  const { stores, menuItems } = buildMock()
  const groups = buildOrderGroups(stores, menuItems)
  const overallTotal = groups.reduce((t, g) => t + g.subtotal, 0)

  const margin = 24
  const itemLine = 28
  const headerLine = 34
  const titleHeight = 60
  const logoSize = 40
  const width = 420
  const titleBlockBottom = margin + Math.max(logoSize, titleHeight) + 30
  let ySim = titleBlockBottom
  for (const g of groups) {
    ySim += headerLine + 6
    ySim += g.items.length * itemLine
    ySim += 4
  }
  const totalBlock = 36
  const footerBlock = 40
  const height = ySim + totalBlock + footerBlock

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#FFFDF8'
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = '#E9E4D8'
  ctx.lineWidth = 2
  ctx.strokeRect(1, 1, width - 2, height - 2)

  const logoPath = path.resolve(__dirname, 'images', 'logo.png')
  let moneyIcon = null
  let heartIcon = null
  try {
    const logo = await loadImage(logoPath)
    ctx.save()
    ctx.beginPath()
    ctx.arc(margin + logoSize / 2, margin + logoSize / 2, logoSize / 2, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(logo, margin, margin, logoSize, logoSize)
    ctx.restore()
  } catch {}
  try {
    moneyIcon = await loadImage(path.resolve(__dirname, 'images', 'money.png'))
    heartIcon = await loadImage(path.resolve(__dirname, 'images', 'heart.png'))
  } catch {}

  ctx.fillStyle = '#2C2C2C'
  ctx.font = 'bold 24px sans-serif'
  ctx.textBaseline = 'top'
  ctx.fillText('今天吃什么 · 清单', margin + logoSize + 20, margin + 2)

  ctx.fillStyle = '#9A9A9A'
  ctx.font = '14px sans-serif'
  ctx.fillText(`生成时间：${nowText()}`, margin + logoSize + 20, margin + 44)

  ctx.strokeStyle = '#EEE7D9'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(margin, margin + Math.max(logoSize, titleHeight) - 20)
  ctx.lineTo(width - margin, margin + Math.max(logoSize, titleHeight) - 20)
  ctx.stroke()

  let y = titleBlockBottom
  const priceRight = width - margin - 12
  for (const g of groups) {
    ctx.fillStyle = '#FFF3E8'
    ctx.fillRect(margin, y, width - margin * 2, headerLine)
    ctx.fillStyle = '#2C2C2C'
    ctx.font = 'bold 18px sans-serif'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    ctx.fillText(g.store.name, margin + 14, y + headerLine / 2)
    ctx.textAlign = 'right'
    const subtotalText = `${g.subtotal}`
    const iconSize = 22
    const gap = 8
    ctx.fillStyle = '#2C2C2C'
    // 固定列：图标在列最右，数字在其左侧留出间距
    const priceIconRight = priceRight
    const priceTextRight = priceIconRight - iconSize - gap
    ctx.fillText(subtotalText, priceTextRight, y + headerLine / 2)
    if (moneyIcon) {
      ctx.drawImage(moneyIcon, priceIconRight - iconSize, y + headerLine / 2 - iconSize / 2, iconSize, iconSize)
    } else {
      ctx.fillText('￥', priceIconRight, y + headerLine / 2)
    }
    y += headerLine + 6
    for (const it of g.items) {
      const bulletX = margin + 8
      const rowY = y + itemLine / 2
      ctx.fillStyle = '#FF6B6B'
      ctx.beginPath()
      ctx.arc(bulletX, rowY, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#333'
      ctx.font = '16px sans-serif'
      ctx.fillText(`${it.name}`, margin + 26, rowY)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#333'
      ctx.font = '16px sans-serif'
      const priceText = `${it.price}`
      const iconSize2 = 18
      const gap2 = 8
      const priceIconRight2 = priceRight
      const priceTextRight2 = priceIconRight2 - iconSize2 - gap2
      ctx.fillText(priceText, priceTextRight2, rowY)
      if (moneyIcon) {
        ctx.drawImage(moneyIcon, priceIconRight2 - iconSize2, rowY - iconSize2 / 2, iconSize2, iconSize2)
      } else {
        ctx.fillText('￥', priceIconRight2, rowY)
      }
      y += itemLine
    }
    y += 4
  }

  ctx.textAlign = 'right'
  ctx.fillStyle = '#2C2C2C'
  ctx.font = 'bold 18px sans-serif'
  ctx.fillText(`总计 ￥${overallTotal}`, width - margin - 14, y + 8)
  ctx.save()
  ctx.globalAlpha = 0.18
  ctx.textAlign = 'right'
  ctx.fillStyle = '#666'
  ctx.font = '12px sans-serif'
  ctx.fillText('EatWhat · Generated with Canvas', width - margin, height - margin - 8)
  ctx.restore()

  const outDir = path.resolve(__dirname, 'output')
  const outPath = path.join(outDir, 'eat-list.png')
  fs.mkdirSync(outDir, { recursive: true })
  const stream = fs.createWriteStream(outPath)
  const pngStream = canvas.createPNGStream()
  pngStream.pipe(stream)
  stream.on('finish', () => {
    console.log('生成完成：', outPath)
    console.log(canvas.toDataURL('image/png'))
  })
}

generateListImage().catch((err) => {
  console.error('生成失败：', err)
})
