import { ImageResponse } from 'next/og'

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 64,
          height: 64,
          background: 'linear-gradient(135deg, #2D7D2D 0%, #4CAF50 100%)',
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 38,
        }}
      >
        🌱
      </div>
    ),
    { width: 64, height: 64 },
  )
}
