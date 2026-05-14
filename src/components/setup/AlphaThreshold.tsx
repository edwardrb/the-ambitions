'use client'

import { Slider } from "@/components/ui/slider"

interface AlphaThresholdProps {
  alphaThreshold: number[]
  setAlphaThreshold: (threshold: number[]) => void
}

/*
export default function AlphaThreshold({
  alphaThreshold,
  setAlphaThreshold
}: AlphaThresholdProps) {

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-white">Minimum Alpha Threshold</h3>
          <p className="text-gray-400 text-xs sm:text-sm">
            Set minimum confidence score for signal alerts
          </p>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-[#1a5ee9]">
          {alphaThreshold[0]}+
        </div>
      </div>
      <Slider
        value={alphaThreshold}
        onValueChange={setAlphaThreshold}
        max={100}
        min={50}
        step={5}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>50 (Low)</span>
        <span>75 (Medium)</span>
        <span>100 (High)</span>
      </div>
    </div>
  )
}
*/
