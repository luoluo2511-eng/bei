'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type Mode = '随机世界' | '半自定义' | '完全自定义'
type Season = '初春' | '暮春' | '盛夏' | '深秋' | '寒冬'
type Trait = { name: string; desc: string }
type NPC = { id: string; name: string; age: number; job: string; trait: string; relation: number; memory: string[] }
type Player = { name: string; gender: string; race: string; origin: string; trait: Trait; skill: string; age: number; cash: number; energy: number; health: number; hunger: number }
type World = { continent: string; kingdom: string; town: string; place: string; season: Season; year: number; day: number; time: string; weather: string; rumor: string; danger: number; known: string[]; npcs: NPC[] }
type SaveData = { version: string; savedAt: string; mode: Mode; player: Player; world: World; log: string[] }

const SAVE_PREFIX = 'ash-era-v2-save-'
const races = ['人类','半精灵','矮人','精灵','兽人']
const origins = ['猎人家庭','农民家庭','铁匠家庭','商人家庭','没落贵族']
const traits: Trait[] = [
  { name: '谨慎', desc: '更容易察觉危险，谈判时更稳。' },
  { name: '坚韧', desc: '劳作和旅行消耗更少体力。' },
  { name: '机敏', desc: '更容易在探索中发现线索。' },
  { name: '亲和', desc: '与陌生人建立关系更容易。' },
  { name: '野心', desc: '赚钱和建立势力时更有优势。' },
]

const worldNames = [
  ['阿斯特拉大陆','埃兰王国','灰烬城'],
  ['诺德瑞尔大陆','西境王国','白橡城'],
  ['伊瑟兰大陆','晨星王国','银月港'],
  ['卡尔德拉大陆','赤岭公国','黑石镇'],
]
const places = ['灰烬平原','白橡河谷','西境丘陵','黑松森林','南方海岸']
const jobs = ['铁匠','面包师','药草师','守门人','商旅','猎人']
const weather = ['薄雾','晴朗','细雨','阴云','大风']
const defaultActions = ['去市场看看','找一份工作','去河边走走','拜访铁匠铺','打听城里的消息','回家休息']

function makeWorld(): World {
  const w = worldNames[Math.floor(Math.random() * worldNames.length)]
  const town = w[2]
  const npcNames = ['艾德蒙','莉娅','托宾','玛拉','塞德里克','伊芙']
  const npcs = npcNames.slice(0, 4 + Math.floor(Math.random() * 2)).map((name, i) => ({
    id: `${name}-${i}`, name, age: 19 + Math.floor(Math.random() * 42), job: jobs[Math.floor(Math.random() * jobs.length)],
    trait: traits[Math.floor(Math.random() * traits.length)].name, relation: 0, memory: [],
  }))
  return { continent: w[0], kingdom: w[1], town, place: town, season: '初春', year: 1, day: 1, time: '上午', weather: weather[Math.floor(Math.random() * weather.length)], rumor: '北方商队最近减少，没人知道原因。', danger: 1, known: [town], npcs }
}

function makePlayer(name: string, race: string, origin: string, trait: Trait, gender: string): Player {
  const cash = origin === '商人家庭' ? 35 : origin === '没落贵族' ? 22 : 14
  return { name: name || '无名者', gender, race, origin, trait, skill: origin === '猎人家庭' ? '野外生存' : origin === '铁匠家庭' ? '锻造' : '基础读写', age: 18, cash, energy: 85, health: 100, hunger: 15 }
}

function saveKey(slot: number) { return `${SAVE_PREFIX}${slot}` }

export default function Home() {
  const [started, setStarted] = useState(false)
  const [setup, setSetup] = useState(true)
  const [mode, setMode] = useState<Mode>('随机世界')
  const [name, setName] = useState('')
  const [gender, setGender] = useState('男')
  const [race, setRace] = useState('人类')
  const [origin, setOrigin] = useState('猎人家庭')
  const [trait, setTrait] = useState(traits[0])
  const [player, setPlayer] = useState<Player>(() => makePlayer('', '人类', '猎人家庭', traits[0], '男'))
  const [world, setWorld] = useState<World>(() => makeWorld())
  const [log, setLog] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [saveOpen, setSaveOpen] = useState(false)
  const [slotInfo, setSlotInfo] = useState<Record<number, string>>({})
  const [notice, setNotice] = useState('')
  const [tab, setTab] = useState<'world' | 'people'>('world')
  const fileRef = useRef<HTMLInputElement>(null)

  const refreshSlots = () => {
    const next: Record<number, string> = {}
    for (let i = 0; i <= 3; i++) {
      const raw = localStorage.getItem(saveKey(i))
      if (raw) { try { next[i] = new Date((JSON.parse(raw) as SaveData).savedAt).toLocaleString('zh-CN') } catch {} }
    }
    setSlotInfo(next)
  }

  useEffect(() => {
    refreshSlots()
    const raw = localStorage.getItem(saveKey(0))
    if (raw) { try { const s = JSON.parse(raw) as SaveData; setMode(s.mode); setPlayer(s.player); setWorld(s.world); setLog(s.log); setStarted(true); setSetup(false) } catch {} }
  }, [])

  const notify = (text: string) => { setNotice(text); window.setTimeout(() => setNotice(''), 1800) }

  const saveGame = (slot = 0) => {
    const save: SaveData = { version: '2.0', savedAt: new Date().toISOString(), mode, player, world, log }
    localStorage.setItem(saveKey(slot), JSON.stringify(save)); refreshSlots(); notify(slot === 0 ? '自动存档完成' : `已保存到存档 ${slot}`)
  }

  const loadGame = (slot: number) => {
    const raw = localStorage.getItem(saveKey(slot)); if (!raw) return
    try { const s = JSON.parse(raw) as SaveData; setMode(s.mode); setPlayer(s.player); setWorld(s.world); setLog(s.log); setStarted(true); setSetup(false); setSaveOpen(false); notify('人生已恢复') } catch { notify('存档读取失败') }
  }

  const deleteSave = (slot: number) => { localStorage.removeItem(saveKey(slot)); refreshSlots(); notify(`已删除存档 ${slot}`) }

  const advanceTime = (hours = 3) => {
    setWorld(w => {
      const total = (w.time === '上午' ? 9 : w.time === '下午' ? 14 : w.time === '傍晚' ? 18 : 22) + hours
      const nextDay = total >= 24 ? w.day + 1 : w.day
      const day = nextDay > 120 ? 1 : nextDay
      const year = nextDay > 120 ? w.year + 1 : w.year
      const season: Season = day <= 24 ? '初春' : day <= 48 ? '暮春' : day <= 72 ? '盛夏' : day <= 96 ? '深秋' : '寒冬'
      const time = total < 12 ? '上午' : total < 17 ? '下午' : total < 21 ? '傍晚' : '夜晚'
      return { ...w, day, year, season, time, weather: Math.random() > .65 ? weather[Math.floor(Math.random() * weather.length)] : w.weather, danger: Math.min(10, w.danger + (Math.random() > .82 ? 1 : 0)) }
    })
    setPlayer(p => ({ ...p, hunger: Math.min(100, p.hunger + 6), energy: Math.max(0, p.energy - 8), age: p.age + (world.day === 120 ? 1 : 0) }))
  }

  const findNpc = (text: string) => {
    const found = world.npcs.find(n => text.includes(n.name))
    return found || world.npcs[Math.floor(Math.random() * world.npcs.length)]
  }

  const act = (raw: string) => {
    const text = raw.trim(); if (!text || !started) return
    let result = ''
    const p = player
    const lower = text.toLowerCase()
    if (text.includes('休息') || text.includes('睡')) {
      setPlayer(x => ({ ...x, energy: Math.min(100, x.energy + 38), hunger: Math.min(100, x.hunger + 3) }))
      result = `你回到${world.town}的小屋，关上门休息。窗外的风声渐渐远去。`
      advanceTime(8)
    } else if (text.includes('工作') || text.includes('赚钱') || text.includes('打工')) {
      const gain = p.trait.name === '野心' ? 5 : 3
      setPlayer(x => ({ ...x, cash: x.cash + gain, energy: Math.max(0, x.energy - 18) }))
      result = `你找到了一份临时活计，忙了几个时辰，得到 ${gain} 银币。老板记住了你的脸。`
      advanceTime(5)
    } else if (text.includes('市场') || text.includes('买')) {
      if (p.cash < 2) result = '你摸了摸空荡的钱袋，只能看看摊位。'
      else { setPlayer(x => ({ ...x, cash: x.cash - 2, hunger: Math.max(0, x.hunger - 15) })); result = '市场里买了一份热食。你听见商人们在谈论北方商路的异常。' }
      advanceTime(2)
    } else if (text.includes('森林') || text.includes('探险') || text.includes('探索') || text.includes('北方')) {
      const success = Math.random() < (p.trait.name === '机敏' ? .78 : .58)
      const gain = success ? 7 : 0
      setPlayer(x => ({ ...x, cash: x.cash + gain, health: Math.max(1, x.health - (success ? 0 : 12)), energy: Math.max(0, x.energy - 20) }))
      result = success ? `你在${world.place}附近发现一条废弃小路，捡到 ${gain} 银币和一枚陌生徽章。` : `探索途中出了意外，你擦伤了手臂。这里似乎比传闻中危险。`
      setWorld(w => ({ ...w, danger: Math.min(10, w.danger + 1), known: w.known.includes('黑松森林') ? w.known : [...w.known, '黑松森林'] }))
      advanceTime(5)
    } else if (text.includes('认识') || text.includes('拜访') || text.includes('聊天') || world.npcs.some(n => text.includes(n.name))) {
      const npc = findNpc(text)
      const delta = p.trait.name === '亲和' ? 12 : 7
      setWorld(w => ({ ...w, npcs: w.npcs.map(n => n.id === npc.id ? { ...n, relation: Math.min(100, n.relation + delta), memory: [...n.memory, text].slice(-3) } : n) }))
      result = `${npc.name}是${npc.job}。你和他聊了很久。他的态度比第一次见面时亲近了一些。`
      advanceTime(2)
    } else if (text.includes('离开') || text.includes('旅行') || text.includes('去')) {
      const destination = places.find(x => text.includes(x)) || places[Math.floor(Math.random() * places.length)]
      setWorld(w => ({ ...w, place: destination, known: w.known.includes(destination) ? w.known : [...w.known, destination] }))
      result = `你决定离开${world.town}。一路走到${destination}，这里和你想象的不太一样。`
      advanceTime(7)
    } else if (text.includes('吃') || text.includes('食物')) {
      if (p.cash >= 1) { setPlayer(x => ({ ...x, cash: x.cash - 1, hunger: Math.max(0, x.hunger - 25) })); result = '你花一枚银币吃了顿热饭，身体舒服了不少。' } else result = '你没有足够的钱买食物。'
      advanceTime(1)
    } else {
      result = `你尝试了“${text}”。这个世界暂时没有为你准备固定答案，但你的行为留下了痕迹。`
      advanceTime(2)
    }
    setLog(l => [result, ...l].slice(0, 14))
    setInput('')
  }

  useEffect(() => {
    if (!started || setup) return
    const timer = window.setTimeout(() => saveGame(0), 700)
    return () => window.clearTimeout(timer)
  }, [player, world, log, started, setup])

  const startGame = () => {
    const w = makeWorld()
    const p = makePlayer(name, race, origin, trait, gender)
    setPlayer(p); setWorld(w); setMode(mode); setLog([`你来到${w.town}。没有预言，也没有任务标记。你的故事从今天开始。`]); setStarted(true); setSetup(false)
  }

  const exportSave = () => {
    const save: SaveData = { version: '2.0', savedAt: new Date().toISOString(), mode, player, world, log }
    const blob = new Blob([JSON.stringify(save, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `灰烬纪元-V2-${player.name}-${world.year}年${world.day}日.json`; a.click(); URL.revokeObjectURL(url)
  }

  const importSave = (file: File) => {
    const reader = new FileReader(); reader.onload = () => { try { const s = JSON.parse(String(reader.result)) as SaveData; if (s.version !== '2.0') throw new Error(); setMode(s.mode); setPlayer(s.player); setWorld(s.world); setLog(s.log); setStarted(true); setSetup(false); setSaveOpen(false); notify('外部存档读取成功') } catch { notify('存档文件无效') } }; reader.readAsText(file)
  }

  const dateLabel = useMemo(() => `第 ${world.year} 年 · ${world.season} · ${world.time}`, [world.year, world.season, world.time])

  if (setup) return <main className="setup"><div className="setupCard"><div className="eyebrow">V2.0 · TRUE WESTERN FANTASY LIFE SIM</div><h1>灰烬纪元</h1><p className="lead">先创造一个人，再让世界自己运行。你不是英雄，世界也不会等你。</p><div className="modeTabs">{(['随机世界','半自定义','完全自定义'] as Mode[]).map(m => <button key={m} className={mode === m ? 'selected' : ''} onClick={() => setMode(m)}>{m}<small>{m === '随机世界' ? '系统决定大部分人生' : m === '半自定义' ? '你决定身份，世界随机' : '自己决定角色核心'}</small></button>)}</div><div className="creator"><div><label>姓名<input value={name} onChange={e => setName(e.target.value)} placeholder="例如：罗恩" /></label><label>性别<select value={gender} onChange={e => setGender(e.target.value)}><option>男</option><option>女</option><option>其他</option></select></label><label>种族<select value={race} onChange={e => setRace(e.target.value)}>{races.map(x => <option key={x}>{x}</option>)}</select></label></div><div><label>出身<select value={origin} onChange={e => setOrigin(e.target.value)}>{origins.map(x => <option key={x}>{x}</option>)}</select></label><label>性格天赋<select value={trait.name} onChange={e => setTrait(traits.find(t => t.name === e.target.value) || traits[0])}>{traits.map(x => <option key={x.name}>{x.name}</option>)}</select></label><div className="traitHint">{trait.desc}</div></div></div><button className="start" onClick={startGame}>进入世界 →</button>{slotInfo[0] && <button className="continue" onClick={() => loadGame(0)}>继续上次人生 · {slotInfo[0]}</button>}<div className="setupFoot">世界会生成国家、城市、NPC、传闻与危险。你做的事会改变关系和后续事件。</div></div></main>

  return <main className="app"><header><div><span className="brand">灰烬纪元</span><span className="sub">真正可玩的西幻人生模拟器 · V2.0</span></div><div className="headerRight"><span className="date">{dateLabel}</span><button className="saveBtn" onClick={() => setSaveOpen(true)}>💾 存档</button></div></header><div className="hud"><span>🧭 {world.continent}</span><span>🏰 {world.kingdom}</span><span>📍 {world.place}</span><span>🌤 {world.weather}</span><span>⚠ 危险 {world.danger}/10</span></div><div className="grid"><aside className="panel character"><div className="portrait">{player.race === '矮人' ? '🧔' : player.race === '精灵' || player.race === '半精灵' ? '🧝' : player.race === '兽人' ? '👹' : '🧑'}</div><h2>{player.name}</h2><p>{player.age}岁 · {player.gender} · {player.race}</p><p className="muted">{player.origin}</p><div className="bars"><div><span>生命</span><b>{player.health}</b><i><em style={{ width: `${player.health}%` }} /></i></div><div><span>精力</span><b>{player.energy}</b><i><em style={{ width: `${player.energy}%` }} /></i></div><div><span>饥饿</span><b>{player.hunger}</b><i><em style={{ width: `${player.hunger}%` }} /></i></div></div><div className="stats"><b>现金</b><span>{player.cash} 银币</span><b>专长</b><span>{player.skill}</span><b>性格</b><span>{player.trait.name}</span><b>住所</b><span>临时住处</span></div><div className="autosave">● 自动存档已开启</div></aside><section className="story"><div className="scene"><div className="sceneSky" /><div className="sceneText"><span>当前场景 · {world.place}</span><h1>{world.town}</h1><p>{world.weather}笼罩着街道。钟声从远处传来。没有人知道你是谁，也没有任何任务箭头告诉你下一步应该做什么。</p></div></div><div className="narrative"><div className="worldLine">{world.rumor}</div>{log.map((x, i) => <div className={`event ${i === 0 ? 'new' : ''}`} key={`${x}-${i}`}>{x}</div>)}</div><div className="input"><input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && act(input)} placeholder="你想做什么？例如：去黑松森林调查脚印……"/><button onClick={() => act(input)}>行动</button></div></section><aside className="right"><div className="panel"><div className="sideTabs"><button className={tab === 'world' ? 'active' : ''} onClick={() => setTab('world')}>世界</button><button className={tab === 'people' ? 'active' : ''} onClick={() => setTab('people')}>人物</button></div>{tab === 'world' ? <><h2>世界动态</h2><p>国家 · {world.kingdom}正在征收新的道路税。</p><p>大陆 · {world.continent}北方商路出现异常。</p><p>传闻 · {world.rumor}</p><p className="muted">你目前只知道自己探索过的区域。</p></> : <><h2>你遇见的人</h2>{world.npcs.map(n => <div className="npc" key={n.id}><div><b>{n.name}</b><small>{n.age}岁 · {n.job} · {n.trait}</small></div><span>关系 {n.relation}</span></div>)}</>}</div><div className="panel map"><h2>已知地图</h2><div className="mapbox">{world.known.map(p => <button key={p} className={p === world.place ? 'active' : ''} onClick={() => setWorld(w => ({ ...w, place: p }))}>◈ {p}</button>)}</div><small>探索会逐步扩大你的已知世界。</small></div><div className="panel"><h2>行动建议</h2>{defaultActions.map(a => <button className="action" key={a} onClick={() => act(a)}>{a}</button>)}<p className="muted">建议不是任务。你可以无视它们，输入任何行为。</p></div></aside></div>{saveOpen && <div className="modalBackdrop" onClick={() => setSaveOpen(false)}><div className="saveModal" onClick={e => e.stopPropagation()}><div className="modalHead"><h2>💾 人生存档</h2><button onClick={() => setSaveOpen(false)}>×</button></div><p className="muted">本地存档 + JSON导入导出。GitHub也保留了V1.3备份分支。</p><div className="slots">{[0,1,2,3].map(slot => <div className="slot" key={slot}><div><b>{slot === 0 ? '自动存档' : `存档 ${slot}`}</b><small>{slotInfo[slot] || '暂无存档'}</small></div><div className="slotActions">{slotInfo[slot] && <button onClick={() => loadGame(slot)}>读取</button>}<button className="gold" onClick={() => saveGame(slot)}>保存</button>{slotInfo[slot] && slot !== 0 && <button className="danger" onClick={() => deleteSave(slot)}>删除</button>}</div></div>)}</div><div className="fileActions"><button onClick={exportSave}>导出 JSON</button><button onClick={() => fileRef.current?.click()}>导入 JSON</button><input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={e => e.target.files?.[0] && importSave(e.target.files[0])}/></div></div></div>}{notice && <div className="toast">{notice}</div>}</main>
}
