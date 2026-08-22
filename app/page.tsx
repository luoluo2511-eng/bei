'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type SaveData = {
  version: string
  savedAt: string
  started: boolean
  mode: string
  place: string
  log: string[]
  input: string
  age: number
  cash: number
  energy: string
  scene: string
  year: number
  day: number
  season: string
  time: string
}

const SAVE_PREFIX = 'ash-era-v2-save-'
const places = ['灰烬平原','白橡河谷','西境丘陵','黑松森林','南方海岸']
const actions = ['去市场看看','回家休息','找一份工作','去河边走走','拜访铁匠铺','打听城里的消息']

const initialState = {
  started: false,
  mode: '',
  place: '灰烬平原',
  log: [] as string[],
  input: '',
  age: 18,
  cash: 14,
  energy: '尚可',
  scene: '灰烬平原的边陲小镇',
  year: 1,
  day: 1,
  season: '初春',
  time: '上午',
}

function saveKey(slot: number) { return `${SAVE_PREFIX}${slot}` }

export default function Home() {
  const [state, setState] = useState(initialState)
  const [hydrated, setHydrated] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [slotInfo, setSlotInfo] = useState<Record<number, string>>({})
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setHydrated(true)
    refreshSlots()
    const raw = localStorage.getItem(saveKey(0))
    if (raw) {
      try {
        const save = JSON.parse(raw) as SaveData
        setState(s => ({ ...s, ...save }))
      } catch {}
    }
  }, [])

  const refreshSlots = () => {
    const next: Record<number, string> = {}
    for (let i = 0; i <= 3; i++) {
      const raw = localStorage.getItem(saveKey(i))
      if (raw) {
        try { next[i] = new Date((JSON.parse(raw) as SaveData).savedAt).toLocaleString('zh-CN') } catch {}
      }
    }
    setSlotInfo(next)
  }

  const saveGame = (slot = 0) => {
    const save: SaveData = { version: '2.0', savedAt: new Date().toISOString(), ...state }
    localStorage.setItem(saveKey(slot), JSON.stringify(save))
    refreshSlots()
    setNotice(slot === 0 ? '已自动保存' : `已保存到存档 ${slot}`)
    setTimeout(() => setNotice(''), 1800)
  }

  const loadGame = (slot: number) => {
    const raw = localStorage.getItem(saveKey(slot))
    if (!raw) return
    try {
      const save = JSON.parse(raw) as SaveData
      setState(s => ({ ...s, ...save, input: '' }))
      setSaveOpen(false)
      setNotice(`已读取存档 ${slot === 0 ? '自动存档' : slot}`)
      setTimeout(() => setNotice(''), 1800)
    } catch { setNotice('存档读取失败') }
  }

  const deleteSave = (slot: number) => {
    localStorage.removeItem(saveKey(slot))
    refreshSlots()
    setNotice(`已删除存档 ${slot}`)
    setTimeout(() => setNotice(''), 1800)
  }

  const advance = (text: string) => {
    setState(s => {
      let cash = s.cash
      let energy = '尚可'
      if (text.includes('工作')) { cash += 2; energy = '有些疲惫' }
      if (text.includes('休息')) energy = '精神很好'
      if (text.includes('市场')) cash = Math.max(0, cash - 1)
      const nextDay = s.day + 1
      const year = nextDay > 120 ? s.year + 1 : s.year
      const day = nextDay > 120 ? 1 : nextDay
      const season = day < 31 ? '初春' : day < 61 ? '暮春' : day < 91 ? '盛夏' : '深秋'
      const time = s.time === '上午' ? '下午' : s.time === '下午' ? '傍晚' : '夜晚'
      return { ...s, log: [text, ...s.log].slice(0, 10), cash, energy, year, day, season, time }
    })
  }

  const act = (text: string) => {
    if (!text.trim()) return
    advance(text.trim())
    setState(s => ({ ...s, input: '' }))
  }

  useEffect(() => {
    if (!hydrated || !state.started) return
    const timer = setTimeout(() => saveGame(0), 500)
    return () => clearTimeout(timer)
  }, [state, hydrated])

  const exportSave = () => {
    const save: SaveData = { version: '2.0', savedAt: new Date().toISOString(), ...state }
    const blob = new Blob([JSON.stringify(save, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `灰烬纪元-V2-${state.year}年-${state.day}日.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importSave = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const save = JSON.parse(String(reader.result)) as SaveData
        if (save.version !== '2.0') throw new Error('version')
        setState(s => ({ ...s, ...save, input: '' }))
        setSaveOpen(false)
        setNotice('外部存档读取成功')
        setTimeout(() => setNotice(''), 1800)
      } catch { setNotice('存档文件无效') }
    }
    reader.readAsText(file)
  }

  const dateLabel = useMemo(() => `第 ${state.year} 年 · ${state.season} · ${state.time}`, [state.year, state.season, state.time])

  if (!hydrated) return <main className="loading">正在唤醒世界……</main>

  if (!state.started) return <main className="landing"><div className="mist"/><div className="cover"><div className="eyebrow">V2 · OPEN WORLD LIFE SANDBOX</div><h1>灰烬纪元</h1><p>一个不会等待你的世界。<br/>没有天选之子，没有强制主线，只有一段真正属于你的生命。</p><div className="choices"><button onClick={()=>setState(s=>({...s,mode:'随机世界',started:true}))}>① 系统完全创建</button><button onClick={()=>setState(s=>({...s,mode:'半自定义',started:true}))}>② 半自定义</button><button onClick={()=>setState(s=>({...s,mode:'完全自定义',started:true}))}>③ 完全自定义</button></div><div className="landingSave">{slotInfo[0] ? <button className="continue" onClick={()=>loadGame(0)}>继续上次人生 · {slotInfo[0]}</button> : <small>自动存档将在进入世界后开启</small>}</div><small>V2 · 世界会继续运行，NPC会记住你</small></div></main>

  return <main className="app">
    <header><div><span className="brand">灰烬纪元</span><span className="sub">真实西幻人生模拟器 · V2</span></div><div className="headerRight"><span className="date">{dateLabel}</span><button className="saveBtn" onClick={()=>setSaveOpen(true)}>💾 存档</button></div></header>
    <div className="grid"><aside className="panel character"><h2>当前角色</h2><div className="portrait">🧑‍🌾</div><h3>未命名的年轻人</h3><p>{state.age}岁 · 人类</p><div className="stats"><b>出生地</b><span>{state.place}</span><b>身份</b><span>平民</span><b>职业</b><span>暂无职业</span><b>身体</b><span>{state.energy}</span><b>现金</b><span>{state.cash} 银币</span><b>住房</b><span>父母的旧屋</span></div><hr/><h3>技能</h3><p>农务 · 入门</p><p>基础读写 · 入门</p><p>野外生存 · 初学</p><div className="autosave">● 自动存档已开启</div></aside>
      <section className="story"><div className="scene"><div className="sceneText"><span>当前场景 · {state.mode}</span><h1>{state.scene}</h1><p>春天刚刚回来。晨雾贴着屋檐缓慢散开，远处的钟敲了三下。街上的石板还留着昨夜雨水的暗色，面包房已经开门，热气和麦香从半掩的木窗里飘出来。</p></div></div><div className="narrative"><p>你站在门口，手指下意识地摸了摸口袋里的硬币。</p><p>这点钱够吃几天，却远远不够让人安心。</p>{state.log.map((x,i)=><div className="event" key={`${x}-${i}`}>{x}</div>)}</div><div className="input"><input value={state.input} onChange={e=>setState(s=>({...s,input:e.target.value}))} onKeyDown={e=>{if(e.key==='Enter')act(state.input)}} placeholder="你想做什么？直接用自然语言告诉我……"/><button onClick={()=>act(state.input)}>行动</button></div></section>
      <aside className="right"><div className="panel"><h2>世界动态</h2><p><b>当地</b> · 南门的粮价比上月略高。</p><p><b>国家</b> · 王都正在征收新的道路税。</p><p><b>大陆</b> · 北方商队最近减少。</p><p className="muted">你目前不知道更远处发生了什么。</p></div><div className="panel map"><h2>当前世界地图</h2><div className="mapbox">{places.map(p=><button key={p} className={p===state.place?'active':''} onClick={()=>setState(s=>({...s,place:p,scene:p+' · 边陲聚落'}))}>{p}</button>)}</div><small>已知区域会随着探索逐步增加</small></div><div className="panel"><h2>你现在可以做什么</h2>{actions.map(a=><button className="action" key={a} onClick={()=>advance(a)}>{a}</button>)}<p className="muted">这些只是建议。你可以输入任何事情。</p></div></aside>
    </div>
    {saveOpen && <div className="modalBackdrop" onClick={()=>setSaveOpen(false)}><div className="saveModal" onClick={e=>e.stopPropagation()}><div className="modalHead"><h2>💾 人生存档</h2><button onClick={()=>setSaveOpen(false)}>×</button></div><p className="muted">存档保存在你的浏览器本地。自动存档会持续更新。</p><div className="slots">{[0,1,2,3].map(slot=><div className="slot" key={slot}><div><b>{slot===0?'自动存档':`存档 ${slot}`}</b><small>{slotInfo[slot] || '暂无存档'}</small></div><div className="slotActions">{slotInfo[slot] && <button onClick={()=>loadGame(slot)}>读取</button>}<button className="gold" onClick={()=>saveGame(slot)}>保存</button>{slotInfo[slot] && slot!==0 && <button className="danger" onClick={()=>deleteSave(slot)}>删除</button>}</div></div>)}</div><div className="fileActions"><button onClick={exportSave}>导出 JSON</button><button onClick={()=>fileRef.current?.click()}>导入 JSON</button><input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={e=>e.target.files?.[0]&&importSave(e.target.files[0])}/></div></div></div>}
    {notice && <div className="toast">{notice}</div>}
  </main>
}
