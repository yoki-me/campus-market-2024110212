import axios from 'axios'

const http = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
})

export default http

/** 查询集合中已有 id 的最大数字后缀，返回下一个 id（如 t1, t2, ...） */
export async function nextId(collection: string, prefix: string): Promise<string> {
  let maxNum = 0
  try {
    const res = await http.get<{ id: string }[]>(`/${collection}`)
    res.data.forEach((item) => {
      const match = item.id.match(/\d+$/)
      if (match) {
        const n = parseInt(match[0], 10)
        if (n > maxNum) maxNum = n
      }
    })
  } catch {
    // 集合为空或请求失败，从 1 开始
  }
  return `${prefix}${maxNum + 1}`
}
