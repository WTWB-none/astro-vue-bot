import postgres from "postgres"

const connectionString = "postgres://postgres.qqrpgwergaafufadjxic:QHYxi65b4R8KUjao@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
const sql = postgres(connectionString)

export default sql
    