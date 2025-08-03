// src/app/api/db/test/[username]/route.js
export async function GET(request, { params }) {
    const { username } = await params;
    console.log("Received username:", username);
    return new Response(JSON.stringify({ username }), { status: 200 });
}