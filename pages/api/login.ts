// Mock login - returns a fake JWT and role
export default function handler(req: any, res: any){
  const { role } = req.body || { role: 'teacher' }
  res.status(200).json({ token: 'demo-token', role })
}
