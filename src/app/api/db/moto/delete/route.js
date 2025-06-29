import { NextResponse } from 'next/server';
import dbPool from '@/utils/database.js'

export async function POST(request) {
    const motoForm = await request.json();
    try {
        const sql = `DELETE FROM motos WHERE id = ?;`;
        const values = [motoForm.id];

        const [results] = await dbPool.query(sql, values);

        return NextResponse.json({
            message: 'Moto deleted successfully!',
            id: results.insertId
        }, { status: 200 });
    } catch (error) {
        console.error('Error deleting moto:', error);
        return NextResponse.json({ message: 'Error deleting moto', error: error.message }, { status: 500 });
    }
}