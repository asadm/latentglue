import { getGlueByUUID } from "@/db/glue";
export default async function handler(req, res) {
  const id = req.query.id;
  const glue = await getGlueByUUID(id);
  res.status(200).json(glue);
}