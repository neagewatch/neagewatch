import { supabase } from "@/lib/supabase";

export default async function CompanyPage() {
  const { data } = await supabase
    .from("price_changes")
    .select("*")
    .order("id", { ascending: false });

  return (
    <main style={{ padding: 24 }}>
      <h1>Company List</h1>

      {data?.map((item) => (
        <div key={item.id} style={{ marginBottom: 12 }}>
          <b>{item.company}</b>
          <div>{item.product}</div>
          <div>
            {item.old_price} → {item.new_price}
          </div>
        </div>
      ))}
    </main>
  );
}