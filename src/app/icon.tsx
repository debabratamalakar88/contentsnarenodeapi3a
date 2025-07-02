import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1e2029',
          borderRadius: '50%',
          color: 'white',
          fontSize: 18,
          fontWeight: 'bold',
          fontFamily: 'sans-serif',
        }}
      >
        N
      </div>
    ),
    {
      ...size,
    }
  )
}
