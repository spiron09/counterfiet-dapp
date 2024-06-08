import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(request:NextRequest) {
    try {
        const data = await request.formData();
        const file:File = data.get('file') as unknown as File;

        if (!file) throw new Error('File not found in the request');
        
        const formData = new FormData();
        formData.append('file', file);

        const { data: responseData } = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
            headers: {
                'Authorization': `Bearer ${process.env.PINATA_JWT}`,
            },
        });
        
        const imageUrl = `ipfs://${responseData.IpfsHash}`;

        return NextResponse.json({ imageUrl }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { error: 'Failed to upload image. ' + (e as Error).message },
            { status: 500 }
        );
    }
}