'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Settings, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function ImprovedAmidakujiGameComponent() {
  const [lines, setLines] = useState(5)
  const [participants, setParticipants] = useState(Array(5).fill(''))
  const [horizontalLines, setHorizontalLines] = useState<boolean[][]>([])
  const [selectedStart, setSelectedStart] = useState<number | null>(null)
  const [animationComplete, setAnimationComplete] = useState(false)
  const [path, setPath] = useState<{ x: number; y: number }[]>([])

  useEffect(() => {
    // ... 既存のコード ...
    generateHorizontalLines()
  }, [lines])

  const generateHorizontalLines = useCallback(() => {
    const newHorizontalLines: boolean[][] = Array(lines * 3).fill(null).map(() => 
      Array(lines - 1).fill(false).map(() => Math.random() < 0.4)
    )
    setHorizontalLines(newHorizontalLines)
  }, [lines])
  
  useEffect(() => {
    generateHorizontalLines()
  }, [generateHorizontalLines])

  const handleStartClick = (index: number) => {
    setSelectedStart(index)
    setAnimationComplete(false)
    const newPath = calculatePath(index)
    setPath(newPath)
  }

  const calculatePath = (startIndex: number) => {
    const path: { x: number; y: number }[] = [{ x: startIndex, y: 0 }]
    let currentX = startIndex

    for (let y = 0; y < horizontalLines.length; y++) {
      if (currentX > 0 && horizontalLines[y][currentX - 1]) {
        currentX--
        path.push({ x: currentX, y: y + 0.5 })
      } else if (currentX < lines - 1 && horizontalLines[y][currentX]) {
        currentX++
        path.push({ x: currentX, y: y + 0.5 })
      }
      path.push({ x: currentX, y: y + 1 })
    }

    return path
  }

  const handleLineChange = (value: number[]) => {
    const newLines = value[0]
    setLines(newLines)
    setParticipants(Array(newLines).fill(''))
    setSelectedStart(null)
    setAnimationComplete(false)
  }

  const handleParticipantChange = (index: number, value: string) => {
    const newParticipants = [...participants]
    newParticipants[index] = value
    setParticipants(newParticipants)
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-center">あみだくじ</h1>
      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            {Array.from({ length: lines }).map((_, index) => (
              <Button
                key={`start-${index}`}
                onClick={() => handleStartClick(index)}
                className="w-12 h-12 rounded-full text-lg font-bold"
                variant={selectedStart === index ? "default" : "outline"}
              >
                {participants[index] || index + 1}
              </Button>
            ))}
          </div>
          <div className="relative" style={{ height: `${horizontalLines.length * 20}px` }}>
            {horizontalLines.map((row, rowIndex) => (
              row.map((hasLine, colIndex) => (
                hasLine && (
                  <div
                    key={`line-${rowIndex}-${colIndex}`}
                    className="absolute bg-gray-800"
                    style={{
                      left: `${(colIndex + 1) * (100 / lines)}%`,
                      top: `${rowIndex * 20}px`,
                      width: `${100 / lines}%`,
                      height: '2px',
                    }}
                  />
                )
              ))
            ))}
            {Array.from({ length: lines }).map((_, index) => (
              <div
                key={`vertical-${index}`}
                className="absolute bg-gray-800"
                style={{
                  left: `${index * (100 / lines)}%`,
                  top: 0,
                  width: '2px',
                  height: '100%',
                }}
              />
            ))}
            {path.length > 0 && (
  <motion.div
    className="absolute w-3 h-3 bg-blue-500 rounded-full"
    initial={{ x: path[0].x * (100 / lines) + '%', y: 0 }}
    variants={{
      animate: {
        x: path[path.length - 1].x * (100 / lines) + '%',
        y: path[path.length - 1].y * 20,
        transition: {
          duration: path.length * 0.2,
          times: path.map((_, index) => index / (path.length - 1)),
          ease: "linear",
        }
      }
    }}
    animate="animate"
    onAnimationComplete={() => setAnimationComplete(true)}
  />
)}
          </div>
          <div className="flex justify-between items-center mt-4">
            {Array.from({ length: lines }).map((_, index) => (
              <motion.div
                key={`result-${index}`}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                  animationComplete && path[path.length - 1].x === index
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200'
                }`}
                animate={
                  animationComplete && path[path.length - 1].x === index
                    ? { scale: [1, 1.2, 1] }
                    : {}
                }
                transition={{ duration: 0.5 }}
              >
                {index + 1}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-between mb-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline"><Settings className="w-4 h-4 mr-2" />設定</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>あみだくじの設定</DialogTitle>
              <DialogDescription>ラインの数と参加者名を設定してください。</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="lines" className="mb-2 block">ラインの数: {lines}</Label>
              <Slider
                id="lines"
                min={2}
                max={10}
                step={1}
                value={[lines]}
                onValueChange={handleLineChange}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              {participants.map((participant, index) => (
                <div key={`participant-${index}`} className="flex items-center space-x-2">
                  <Label htmlFor={`participant-${index}`} className="w-20">参加者 {index + 1}</Label>
                  <Input
                    id={`participant-${index}`}
                    value={participant}
                    onChange={(e) => handleParticipantChange(index, e.target.value)}
                    placeholder={`参加者 ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
        <Button onClick={generateHorizontalLines}><RefreshCw className="w-4 h-4 mr-2" />リスタート</Button>
      </div>
    </div>
  )
}