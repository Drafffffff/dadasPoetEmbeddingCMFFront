export async function POST(req: Request) {
  const { str } = await req.json();
  console.log(str);
  const res = await fetch(process.env.NEXT_PUBLIC_SERVE + "api/getsimilar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ str }),
  });
  const data = await res.json();
  return Response.json({ data });
}
