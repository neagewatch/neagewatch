import { COMPANIES } from "./companies"

export function detectCompany(text: string) {
  for (const [id, company] of Object.entries(COMPANIES)) {
    for (const alias of company.aliases) {
      if (text.includes(alias)) {
        return {
          company_id: id,
          company_name: company.name,
          company_slug: company.slug
        }
      }
    }
  }

  return {
    company_id: "unknown",
    company_name: "Unknown",
    company_slug: "unknown"
  }
}