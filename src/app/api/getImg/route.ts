async function imageUrlToBase64(url: string) {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");
    const mimeType = response.headers.get("content-type");
    return `data:${mimeType};base64,${base64Image}`;
  } catch (error) {
    console.error("Error converting image URL to base64:", error);
    throw error;
  }
}

export async function POST(req: Request) {
  const d = await req.json();
  console.log(d);
  const res = await fetch(
    process.env.NEXT_PUBLIC_SERVE + "api/getImgFromPoet",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...d }),
    },
  );
  const data = await res.json();
  const url = data.imgList[0];
  const base64 = await imageUrlToBase64(url);

  return Response.json({ base64 });
}
