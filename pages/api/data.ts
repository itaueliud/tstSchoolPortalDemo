// Mock API for demo data
export default function handler(req: any, res: any){
  res.status(200).json({ students: 842, teachers: 36, classes: 24, revenue: 1590800 })
}
