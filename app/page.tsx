'use client'

import { useState } from 'react'

const places = ['灰烬平原','白橡河谷','西境丘陵','黑松森林','南方海岸']
const actions = ['去市场看看','回家休息','找一份工作','去河边走走','拜访铁匠铺','打听城里的消息']

export default function Home(){
 const [started,setStarted]=useState(false)
 const [mode,setMode]=useState('')
 const [place,setPlace]=useState('灰烬平原')
 const [log,setLog]=useState<string[]>([])
 const [input,setInput]=useState('')
 const [age,setAge]=useState(18)
 const [cash,setCash]=useState(14)
 const [energy,setEnergy]=useState('尚可')
 const [scene,setScene]=useState('灰烬平原的边陲小镇')
 const act=(text:string)=>{setLog(v=>[text,...v].slice(0,8));setEnergy(text.includes('休息')?'精神好了些':text.includes('工作')?'有些疲惫':'尚可');if(text.includes('工作'))setCash(c=>c+2);if(text.includes('休息'))setAge(a=>a);}
 if(!started)return <main className="landing"><div className="mist"/><div className="cover"><div className="eyebrow">V2 · OPEN WORLD LIFE SANDBOX</div><h1>灰烬纪元</h1><p>一个不会等待你的世界。<br/>没有天选之子，没有强制主线，只有一段真正属于你的生命。</p><div className="choices"><button onClick={()=>{setMode('随机世界');setStarted(true)}}>① 系统完全创建</button><button onClick={()=>{setMode('半自定义');setStarted(true)}}>② 半自定义</button><button onClick={()=>{setMode('完全自定义');setStarted(true)}}>③ 完全自定义</button></div><small>V2 原型 · 世界会继续运行，NPC会记住你</small></div></main>
 return <main className="app"><header><div><span className="brand">灰烬纪元</span><span className="sub">真实西幻人生模拟器 · V2</span></div><div className="date">第 1 年 · 初春 · 上午</div></header><div className="grid"><aside className="panel character"><h2>当前角色</h2><div className="portrait">🧑‍🌾</div><h3>未命名的年轻人</h3><p>18岁 · 人类</p><div className="stats"><b>出生地</b><span>{place}</span><b>身份</b><span>平民</span><b>职业</b><span>暂无职业</span><b>身体</b><span>{energy}</span><b>现金</b><span>{cash} 银币</span><b>住房</b><span>父母的旧屋</span></div><hr/><h3>技能</h3><p>农务 · 入门</p><p>基础读写 · 入门</p><p>野外生存 · 初学</p></aside><section className="story"><div className="scene"><div className="sceneText"><span>当前场景</span><h1>{scene}</h1><p>春天刚刚回来。晨雾贴着屋檐缓慢散开，远处的钟敲了三下。街上的石板还留着昨夜雨水的暗色，面包房已经开门，热气和麦香从半掩的木窗里飘出来。</p></div></div><div className="narrative"><p>你站在门口，手指下意识地摸了摸口袋里的硬币。</p><p>这点钱够吃几天，却远远不够让人安心。</p>{log.map((x,i)=><div className="event" key={i}>{x}</div>)}</div><div className="input"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&input.trim()){act(input);setInput('')}}} placeholder="你想做什么？直接用自然语言告诉我……"/><button onClick={()=>{if(input.trim()){act(input);setInput('')}}}>行动</button></div></section><aside className="right"><div className="panel"><h2>世界动态</h2><p><b>当地</b> · 南门的粮价比上月略高。</p><p><b>国家</b> · 王都正在征收新的道路税。</p><p><b>大陆</b> · 北方商队最近减少。</p><p className="muted">你目前不知道更远处发生了什么。</p></div><div className="panel map"><h2>当前世界地图</h2><div className="mapbox">{places.map((p,i)=><button key={p} className={p===place?'active':''} onClick={()=>{setPlace(p);setScene(p+' · 边陲聚落')}}>{p}</button>)}</div><small>已知区域会随着探索逐步增加</small></div><div className="panel"><h2>你现在可以做什么</h2>{actions.map(a=><button className="action" key={a} onClick={()=>act(a)}>{a}</button>)}<p className="muted">这些只是建议。你可以输入任何事情。</p></div></aside></div></main>
}