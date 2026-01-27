import { NextResponse } from 'next/server';
import dbPool from '@/utils/database.js'

export async function POST(request) {
    const marcaForm = await request.json();
    try {
        const sql = `DELETE FROM marcas WHERE id = ?;`;
        const values = [marcaForm.id];

        const [results] = await dbPool.query(sql, values);

        return NextResponse.json({
            message: 'Marca deleted successfully!',
            id: results.insertId
        }, { status: 200 });
    } catch (error) {
        console.error('Error deleting marca:', error);
        return NextResponse.json({ message: 'Error deleting marca', error: error.message }, { status: 500 });
    }
}