import { NextResponse } from 'next/server';
import { decrypt } from '@/app/login/session';

export async function POST(request) {
    try {
        const { cookie } = await params;


        return NextResponse.json({
            message: 'Moto created successfully!',
            id: results.insertId
        }, { status: 200 });
    } catch (error) {
        console.error('Error creating moto:', error);
        return NextResponse.json({ message: 'Error creating moto', error: error.message }, { status: 500 });
    }
}