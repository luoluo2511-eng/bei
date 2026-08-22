import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const SYSTEM = `你是《灰烬纪元》西幻人生模拟器的世界引擎。你不是任务助手，而是一个持续运行的、偏写实的奇幻世界。
玩家可以输入任何自然语言行为，例如：去酒馆打听消息、向国王求职、开一家面包店、偷窃、学习魔法、追求某个NPC、买房、旅行、组建军队、隐居、经商、结婚、逃亡等。不要把玩家限制在预设选项里。

规则：
1. 尊重世界状态，不凭空重置人物、金钱、地点或关系。
2. 行为可以成功、失败、产生代价，也可以触发意外；不要为了讨好玩家而保证成功。
3. 世界必须有因果：危险、资源、身份、天气、地点、NPC关系会影响结果。
4. 玩家输入只决定“想做什么”，你负责判断合理结果；不要替玩家决定长期人生目标。
5. 输出必须是严格 JSON，不要 Markdown，不要代码围栏。
6. narrative 用中文，150~300字，像小说一样描述这一次行动的结果。
7. timeHours 为本次行动经过的小时数，范围 0~24。
8. 数值变化要克制：cashDelta、energyDelta、healthDelta、hungerDelta 通常在 -30~30；死亡或重大灾难只能在合理情况下发生。
9. destination 只有在玩家确实移动时才填写，否则为空字符串。
10. newKnown 是玩家此次新发现的地点名称数组，可以为空。
11. npcUpdates 是本次明显影响NPC关系的变化数组，每项必须包含 npcName 和 relationDelta；没有就为空数组。
12. dangerDelta 通常为 -1~2。
13. rumor 可以为空；若发现重要世界信息，写一句新的传闻。

JSON格式：
{"narrative":"","timeHours":2,"cashDelta":0,"energyDelta":-5,"healthDelta":0,"hungerDelta":3,"destination":"","newKnown":[],"npcUpdates":[],"dangerDelta":0,"rumor":""}`

export async function POST(req: Request) {
  const key = process.env.OPENAI_API_KEY
  if (!key) return NextResponse.json({ error: 'OPENAI_API_KEY_MISSING' }, { status: 503 })

  try {
    const body = await req.json()
    const { action, player, world, recentLog } = body || {}
    if (!action || !player || !world) return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 })

    const input = `${SYSTEM}\n\n当前玩家：${JSON.stringify(player)}\n当前世界：${JSON.stringify(world)}\n最近事件：${JSON.stringify(recentLog || [])}\n\n玩家刚刚输入的行动：${String(action).slice(0, 1000)}\n\n只返回JSON。`

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-5.6-luna', input, max_output_tokens: 900 }),
    })

    if (!response.ok) {
      const detail = await response.text()
      console.error('OpenAI API error', response.status, detail)
      return NextResponse.json({ error: 'AI_REQUEST_FAILED' }, { status: 502 })
    }

    const data = await response.json()
    const text = String(data.output_text || '').trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim()
    const result = JSON.parse(text)
    return NextResponse.json(result)
  } catch (error) {
    console.error('AI world engine error', error)
    return NextResponse.json({ error: 'AI_PARSE_FAILED' }, { status: 500 })
  }
}
