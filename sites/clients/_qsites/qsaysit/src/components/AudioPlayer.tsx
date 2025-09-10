import React from 'react'

type Props = { src?: string }

export default function AudioPlayer({ src }: Props) {
  if (!src) return null
  return (
    <div className="mt-3">
      <audio controls className="w-full">
        <source src={src} />
        Your browser does not support the audio element.
      </audio>
    </div>
  )
}
