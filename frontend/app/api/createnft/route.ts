import { NextResponse, NextRequest } from 'next/server';
import axios from 'axios';
export const config = {
  api: {
    bodyParser: true,
  },
};

export async function POST(request: NextRequest) {
  try {

    const jsondata = await request.json();
    console.log(jsondata);
    const { data: responseData } = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', jsondata, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PINATA_JWT}`,
      },
    });

    const tokenURI = `ipfs://${responseData.IpfsHash}`;
    return NextResponse.json({ tokenURI }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Failed to create NFT metadata. ' + e.message },
      { status: 500 }
    );
  }
}
