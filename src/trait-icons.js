export const traitIconMap = {
  // 特质 (Classes)
  护卫: 'https://game.gtimg.cn/images/lol/act/img/tft/classes/10204.png',
  裁决使者: 'https://game.gtimg.cn/images/lol/act/img/tft/classes/10205.png',
  决斗大师: 'https://game.gtimg.cn/images/lol/act/img/tft/classes/10206.png',
  刀锋领主: 'https://game.gtimg.cn/images/lol/act/img/tft/classes/10207.png',
  重量级斗士: 'https://game.gtimg.cn/images/lol/act/img/tft/classes/10208.png',
  主宰: 'https://game.gtimg.cn/images/lol/act/img/tft/classes/10209.png',
  天才: 'https://game.gtimg.cn/images/lol/act/img/tft/classes/10210.png',
  圣盾使: 'https://game.gtimg.cn/images/lol/act/img/tft/classes/10211.png',
  狙神: 'https://game.gtimg.cn/images/lol/act/img/tft/classes/10212.png',
  法师: 'https://game.gtimg.cn/images/lol/act/img/tft/classes/10213.png',
  司令: 'https://game.gtimg.cn/images/lol/act/img/tft/classes/10214.png',

  // 种族 (Origins)
  战斗学院: 'https://game.gtimg.cn/images/lol/act/img/tft/origins/10188.png',
  卡牌大师: 'https://game.gtimg.cn/images/lol/act/img/tft/origins/10189.png',
  龙的传人: 'https://game.gtimg.cn/images/lol/act/img/tft/origins/10190.png',
  魄罗之心: 'https://game.gtimg.cn/images/lol/act/img/tft/origins/10191.png',
  至高天: 'https://game.gtimg.cn/images/lol/act/img/tft/origins/10192.png',
  水晶玫瑰: 'https://game.gtimg.cn/images/lol/act/img/tft/origins/10193.png',
  假面摔角手: 'https://game.gtimg.cn/images/lol/act/img/tft/origins/10194.png',
  小怪兽训练师: 'https://game.gtimg.cn/images/lol/act/img/tft/origins/10195.png',
  大宗师: 'https://game.gtimg.cn/images/lol/act/img/tft/origins/10196.png',
  荆棘之兴: 'https://game.gtimg.cn/images/lol/act/img/tft/origins/10197.png',
  超级战队: 'https://game.gtimg.cn/images/lol/act/img/tft/origins/10198.png',
  斗魂战士: 'https://game.gtimg.cn/images/lol/act/img/tft/origins/10199.png',
  星之守护者: 'https://game.gtimg.cn/images/lol/act/img/tft/origins/10200.png',
  兵王: 'https://game.gtimg.cn/images/lol/act/img/tft/origins/10201.png',
  奥德赛: 'https://game.gtimg.cn/images/lol/act/img/tft/origins/10202.png'
}

export const getTraitIcon = (traitName) => {
  return traitIconMap[traitName] || '' // 如果找不到，返回空字符串
}

export const getChampionAvatarUrl = (champion) => {
  if (!champion || !champion.image_url) return ''
  // 检查是否已经是正确的 .png 头像格式
  if (champion.image_url.endsWith('.png')) {
    return champion.image_url
  }
  // 否则，从 .jpg 推断
  const parts = champion.image_url.split('/')
  const jpgFile = parts.pop()
  const championId = jpgFile.split('.')[0]
  if (championId && /^\d+$/.test(championId)) {
    return `https://game.gtimg.cn/images/lol/act/img/tft/champions/${championId}.png`
  }
  return champion.image_url // Fallback
}
