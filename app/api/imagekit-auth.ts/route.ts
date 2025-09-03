import { NextResponse } from 'next/server';
import ImageKit from "imagekit";
import { withMetrics } from '../metrics/middlewareMetrics';


const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
  privateKey: process.env.PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT!
});

async function getImageKitAuth() {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    return NextResponse.json(authenticationParameters);
  } catch (error) {
    console.error('Error generating auth parameters:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication parameters' },
      { status: 500 }
    );
  }
}

export const GET = withMetrics(getImageKitAuth, "/api/imagekit-auth", {
    counter: true,
    histogram: true,
    gauge: true
});